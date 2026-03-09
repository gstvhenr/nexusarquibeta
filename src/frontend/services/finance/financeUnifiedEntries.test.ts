import { describe, expect, it } from 'vitest';
import { buildUnifiedFinancialEntries } from './financeUnifiedEntries';
import type { ManualIncome } from '../../types/finance';
import type { CashBoxCredit } from '../../types/cashBox';
import type { MarketingActivity } from '../../types/marketing';
import {
  createTestProject,
  createTestCommission,
  createTestCashBoxExpense,
} from '../../test/factories';

// ─── Inline factories for types without shared factories ────────────────────

const createTestManualIncome = (overrides: Partial<ManualIncome> = {}): ManualIncome => ({
  id: 'test-income-1',
  description: 'Renda Avulsa',
  category: 'Consultoria',
  value: 500,
  date: '2099-06-01',
  status: 'Recebido',
  ...overrides,
});

const createTestCashBoxCredit = (overrides: Partial<CashBoxCredit> = {}): CashBoxCredit => ({
  id: 'test-credit-1',
  origin: 'Profissional',
  category: 'Honorários',
  item: 'Pagamento de Projeto',
  description: 'Crédito Teste',
  date: '2099-06-01',
  value: 1000,
  confirmed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const createTestMarketingActivity = (
  overrides: Partial<MarketingActivity> = {},
): MarketingActivity => ({
  id: 'test-marketing-1',
  title: 'Campanha Teste',
  status: 'Pendente',
  contentType: 'Post (Instagram)',
  dueDate: '2099-06-15',
  responsibleId: 'resp-1',
  cost: 0,
  ...overrides,
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('buildUnifiedFinancialEntries', () => {
  // ── Base contract ──────────────────────────────────────────────────────────

  it('returns empty arrays when all inputs are empty', () => {
    // Given / When
    const result = buildUnifiedFinancialEntries([], [], [], [], [], [], [], [], []);

    // Then
    expect(result.allReceivables).toEqual([]);
    expect(result.allDebits).toEqual([]);
    expect(result.receivableOriginById).toEqual({});
    expect(result.cashBoxOriginById).toEqual({});
    expect(result.cashBoxItemById).toEqual({});
  });

  // ── Projects ───────────────────────────────────────────────────────────────

  it('creates receivable from project with lump sum payment', () => {
    // Given
    const project = createTestProject({
      id: 'p1',
      code: 'PRJ-001',
      name: 'Projeto Lump',
      clientName: 'Cliente A',
      clientId: 'c1',
      status: 'Em Andamento',
      financials: {
        paymentType: 'vista',
        lumpSumValue: 5000,
        lumpSumDueDate: '2099-12-15',
        lumpSumStatus: 'Em aberto',
      },
    });

    // When
    const result = buildUnifiedFinancialEntries([project], [], [], [], [], [], [], [], []);

    // Then
    expect(result.allReceivables).toHaveLength(1);
    expect(result.allReceivables[0].id).toBe('lump_p1');
    expect(result.allReceivables[0].value).toBe(5000);
    expect(result.allReceivables[0].source).toBe('Project');
    expect(result.allReceivables[0].status).toBe('Em Aberto');
    expect(result.receivableOriginById['lump_p1']).toBe('Profissional');
  });

  it('creates receivables from project installments', () => {
    // Given
    const project = createTestProject({
      id: 'p2',
      status: 'Em Andamento',
      financials: {
        paymentType: 'parcelado',
        numberOfInstallments: 2,
        installments: [
          {
            id: 'inst-1',
            number: 1,
            value: 2500,
            dueDate: '2099-06-15',
            paid: false,
            paymentDate: null,
          },
          {
            id: 'inst-2',
            number: 2,
            value: 2500,
            dueDate: '2099-07-15',
            paid: true,
            paymentDate: '2099-07-10',
          },
        ],
      },
    });

    // When
    const result = buildUnifiedFinancialEntries([project], [], [], [], [], [], [], [], []);

    // Then
    expect(result.allReceivables).toHaveLength(2);
    expect(result.allReceivables[0].status).toBe('Em Aberto');
    expect(result.allReceivables[1].status).toBe('Pago');
  });

  it('marks lump sum as Pago when lumpSumStatus is Pago', () => {
    // Given
    const project = createTestProject({
      id: 'p3',
      status: 'Em Andamento',
      financials: {
        paymentType: 'vista',
        lumpSumValue: 3000,
        lumpSumDueDate: '2099-01-01',
        lumpSumStatus: 'Pago',
        lumpSumPaymentDate: '2099-01-10',
      },
    });

    // When
    const result = buildUnifiedFinancialEntries([project], [], [], [], [], [], [], [], []);

    // Then
    expect(result.allReceivables[0].status).toBe('Pago');
    expect(result.allReceivables[0].paymentDate).toBe('2099-01-10');
  });

  it('marks project installment as Vencido when past due and unpaid', () => {
    // Given
    const project = createTestProject({
      id: 'p4',
      status: 'Em Andamento',
      financials: {
        paymentType: 'parcelado',
        numberOfInstallments: 1,
        installments: [
          {
            id: 'inst-overdue',
            number: 1,
            value: 1000,
            dueDate: '2000-01-01', // well in the past
            paid: false,
            paymentDate: null,
          },
        ],
      },
    });

    // When
    const result = buildUnifiedFinancialEntries([project], [], [], [], [], [], [], [], []);

    // Then
    expect(result.allReceivables[0].status).toBe('Vencido');
  });

  it('creates receivables from approved and invoiced project addendums', () => {
    // Given
    const project = createTestProject({
      id: 'p-add',
      code: 'PRJ-ADD',
      name: 'Projeto com Aditivo',
      status: 'Em Andamento',
      financials: {
        paymentType: 'vista',
        lumpSumValue: 5000,
        lumpSumDueDate: '2099-12-15',
        lumpSumStatus: 'Em aberto',
        addendums: [
          {
            id: 'add-1',
            description: 'Aditivo Aprovado',
            value: 1500,
            date: '2099-06-15',
            status: 'Aprovado',
          },
          {
            id: 'add-2',
            description: 'Aditivo Faturado',
            value: 2000,
            date: '2099-07-15',
            status: 'Faturado',
          },
          {
            id: 'add-3',
            description: 'Aditivo Rascunho',
            value: 3000,
            date: '2099-08-15',
            status: 'Rascunho',
          },
        ],
      },
    });

    // When
    const result = buildUnifiedFinancialEntries([project], [], [], [], [], [], [], [], []);

    // Then
    // 1 base lumpSum, 2 addendums (Aprovado e Faturado)
    expect(result.allReceivables).toHaveLength(3);

    const addendum1 = result.allReceivables.find((r) => r.id === 'addon_p-add_add-1');
    expect(addendum1).toBeDefined();
    expect(addendum1?.value).toBe(1500);
    expect(addendum1?.status).toBe('Em Aberto'); // future date, Aprovado
    expect(addendum1?.source).toBe('Project');

    const addendum2 = result.allReceivables.find((r) => r.id === 'addon_p-add_add-2');
    expect(addendum2).toBeDefined();
    expect(addendum2?.value).toBe(2000);
    expect(addendum2?.status).toBe('Pago'); // Faturado is Pago

    const addendum3 = result.allReceivables.find((r) => r.id === 'addon_p-add_add-3');
    expect(addendum3).toBeUndefined(); // Rascunho is ignored
  });

  it('marks approved project addendum as Vencido when past due and unbilled', () => {
    // Given
    const project = createTestProject({
      id: 'p-add-overdue',
      status: 'Em Andamento',
      financials: {
        paymentType: 'vista',
        lumpSumValue: 5000,
        lumpSumDueDate: '2099-12-15',
        addendums: [
          {
            id: 'add-overdue',
            description: 'Aditivo Antigo',
            value: 1000,
            date: '2000-01-01', // well in the past
            status: 'Aprovado', // not faturado
          },
        ],
      },
    });

    // When
    const result = buildUnifiedFinancialEntries([project], [], [], [], [], [], [], [], []);

    // Then
    const addendum = result.allReceivables.find((r) => r.id === 'addon_p-add-overdue_add-overdue');
    expect(addendum).toBeDefined();
    expect(addendum?.status).toBe('Vencido');
  });

  it('skips cancelled projects', () => {
    // Given
    const project = createTestProject({
      status: 'Cancelado',
      financials: {
        paymentType: 'vista',
        lumpSumValue: 3000,
        lumpSumDueDate: '2099-01-01',
      },
    });

    // When
    const result = buildUnifiedFinancialEntries([project], [], [], [], [], [], [], [], []);

    // Then
    expect(result.allReceivables).toHaveLength(0);
  });

  it('skips project with no financials object', () => {
    // Given — cast as Project to simulate a corrupted/missing financials field at runtime
    const project = createTestProject({
      id: 'p5',
      status: 'Em Andamento',
    }) as import('../../types').Project;
    project.financials = undefined as unknown as import('../../types').ProjectFinancials;

    // When
    const result = buildUnifiedFinancialEntries([project], [], [], [], [], [], [], [], []);

    // Then
    expect(result.allReceivables).toHaveLength(0);
  });

  // ── Commissions ────────────────────────────────────────────────────────────

  it('creates receivable from pending commission', () => {
    // Given
    const commission = createTestCommission({
      id: 'com1',
      status: 'Pendente',
      commissionValue: 200,
      saleDate: '2099-01-15',
      supplierName: 'Fornecedor X',
    });

    // When
    const result = buildUnifiedFinancialEntries([], [commission], [], [], [], [], [], [], []);

    // Then
    expect(result.allReceivables).toHaveLength(1);
    expect(result.allReceivables[0].id).toBe('comm_com1');
    expect(result.allReceivables[0].source).toBe('Commission');
    expect(result.allReceivables[0].description).toContain('Fornecedor X');
    expect(result.allReceivables[0].status).toBe('Em Aberto');
  });

  it('marks received commission as Pago', () => {
    // Given
    const commission = createTestCommission({
      id: 'com2',
      status: 'Recebido',
      commissionValue: 500,
      paymentDate: '2099-03-10',
    });

    // When
    const result = buildUnifiedFinancialEntries([], [commission], [], [], [], [], [], [], []);

    // Then
    expect(result.allReceivables[0].status).toBe('Pago');
    expect(result.allReceivables[0].paid).toBe(true);
  });

  it('marks overdue commission as Vencido when expectedPaymentDate is in the past', () => {
    // Given
    const commission = createTestCommission({
      id: 'com3',
      status: 'Pendente',
      expectedPaymentDate: '2000-01-01', // in the past
    });

    // When
    const result = buildUnifiedFinancialEntries([], [commission], [], [], [], [], [], [], []);

    // Then
    expect(result.allReceivables[0].status).toBe('Vencido');
  });

  // ── Manual Incomes ─────────────────────────────────────────────────────────

  it('creates receivable from a received manual income', () => {
    // Given
    const income = createTestManualIncome({
      id: 'inc1',
      description: 'Consultoria Extra',
      value: 800,
      date: '2099-05-01',
      status: 'Recebido',
    });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [income], [], [], [], [], []);

    // Then
    expect(result.allReceivables).toHaveLength(1);
    expect(result.allReceivables[0].id).toBe('inc1');
    expect(result.allReceivables[0].value).toBe(800);
    expect(result.allReceivables[0].status).toBe('Pago');
    expect(result.allReceivables[0].paymentDate).toBe('2099-05-01');
    expect(result.allReceivables[0].source).toBe('Manual');
    expect(result.receivableOriginById['inc1']).toBe('Profissional');
  });

  it('creates receivable from a pending manual income with Em Aberto status', () => {
    // Given
    const income = createTestManualIncome({
      id: 'inc2',
      status: 'Pendente',
      date: '2099-12-01',
    });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [income], [], [], [], [], []);

    // Then
    expect(result.allReceivables[0].status).toBe('Em Aberto');
    expect(result.allReceivables[0].paid).toBe(false);
    expect(result.allReceivables[0].paymentDate).toBeNull();
  });

  it('respects explicit origin on manual income when provided', () => {
    // Given — ManualIncome can carry an optional origin field at runtime
    type ManualIncomeWithOrigin = ManualIncome & { origin?: 'Profissional' | 'Pessoal' };
    const income: ManualIncomeWithOrigin = {
      ...createTestManualIncome({ id: 'inc3', status: 'Recebido' }),
      origin: 'Pessoal' as const,
    };

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [income], [], [], [], [], []);

    // Then
    expect(result.receivableOriginById['inc3']).toBe('Pessoal');
  });

  // ── CashBox Credits ────────────────────────────────────────────────────────

  it('creates receivable from a confirmed cashbox credit', () => {
    // Given
    const credit = createTestCashBoxCredit({
      id: 'cbcr1',
      origin: 'Pessoal',
      value: 2000,
      date: '2099-07-01',
      confirmed: true,
    });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [], [], [], [], [], [credit]);

    // Then
    expect(result.allReceivables).toHaveLength(1);
    expect(result.allReceivables[0].id).toBe('cbcr_cbcr1');
    expect(result.allReceivables[0].value).toBe(2000);
    expect(result.allReceivables[0].status).toBe('Pago');
    expect(result.allReceivables[0].paid).toBe(true);
    expect(result.allReceivables[0].paymentDate).toBe('2099-07-01');
    expect(result.allReceivables[0].clientName).toBe('Gestão de Caixa');
    expect(result.allReceivables[0].category).toBe('Crédito Caixa');
    expect(result.receivableOriginById['cbcr_cbcr1']).toBe('Pessoal');
  });

  it('creates receivable from an unconfirmed cashbox credit with Em Aberto status', () => {
    // Given
    const credit = createTestCashBoxCredit({
      id: 'cbcr2',
      confirmed: false,
      date: '2099-12-01',
    });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [], [], [], [], [], [credit]);

    // Then
    expect(result.allReceivables[0].status).toBe('Em Aberto');
    expect(result.allReceivables[0].paymentDate).toBeNull();
  });

  it('marks cashbox credit as Vencido when past due and unconfirmed', () => {
    // Given
    const credit = createTestCashBoxCredit({
      id: 'cbcr3',
      confirmed: false,
      date: '2000-01-01', // in the past
    });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [], [], [], [], [], [credit]);

    // Then
    expect(result.allReceivables[0].status).toBe('Vencido');
  });

  // ── Marketing Expenses ─────────────────────────────────────────────────────

  it('creates debit from marketing activity with cost and dueDate', () => {
    // Given
    const activity = createTestMarketingActivity({
      id: 'mkt1',
      title: 'Campanha Instagram',
      status: 'Pendente',
      cost: 600,
      dueDate: '2099-08-01',
    });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [], [activity], [], [], [], []);

    // Then
    expect(result.allDebits).toHaveLength(1);
    expect(result.allDebits[0].description).toBe('Marketing: Campanha Instagram');
    expect(result.allDebits[0].category).toBe('Marketing e Publicidade');
    expect(result.allDebits[0].value).toBe(600);
    expect(result.allDebits[0].source).toBe('Marketing');
    expect(result.allDebits[0].isRecurring).toBe(false);
  });

  it('marks marketing debit as Pago when activity is Concluído', () => {
    // Given
    const activity = createTestMarketingActivity({
      id: 'mkt2',
      status: 'Concluído',
      cost: 400,
      dueDate: '2099-05-01',
      completionDate: '2099-05-05',
    });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [], [activity], [], [], [], []);

    // Then
    expect(result.allDebits[0].status).toBe('Pago');
    expect(result.allDebits[0].paymentDate).toBe('2099-05-05');
  });

  it('skips marketing activity with no cost or no dueDate', () => {
    // Given
    const noCost = createTestMarketingActivity({ id: 'mkt3', cost: 0, dueDate: '2099-06-01' });
    const noDate = createTestMarketingActivity({ id: 'mkt4', cost: 300, dueDate: null });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [], [noCost, noDate], [], [], [], []);

    // Then
    expect(result.allDebits).toHaveLength(0);
  });

  // ── CashBox Expenses ───────────────────────────────────────────────────────

  it('creates debit from cashbox expense with correct origin mapping', () => {
    // Given
    const expense = createTestCashBoxExpense({
      id: 'cb1',
      origin: 'Pessoal',
      category: 'Alimentação',
      item: 'Mercado',
      value: 350,
      dueDate: '2099-12-01',
      recurrence: 'Única',
    });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [], [], [], [], [expense], []);

    // Then
    expect(result.allDebits).toHaveLength(1);
    expect(result.allDebits[0].source).toBe('CashBox');
    expect(result.allDebits[0].value).toBe(350);
    expect(result.allDebits[0].isRecurring).toBe(false);
    expect(result.cashBoxOriginById['cb1']).toBe('Pessoal');
    expect(result.cashBoxItemById['cb1']).toBe('Mercado');
  });

  it('labels installment cashbox expenses with fraction', () => {
    // Given
    const expense = createTestCashBoxExpense({
      id: 'cb2',
      recurrence: 'Parcelada',
      installmentNumber: 2,
      installmentTotal: 6,
      category: 'Operacional',
      dueDate: '2099-06-15',
    });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [], [], [], [], [expense], []);

    // Then
    expect(result.allDebits[0].description).toBe('Operacional (2/6)');
  });

  it('marks cashbox expense as isRecurring when recurrence is not Única', () => {
    // Given
    const expense = createTestCashBoxExpense({
      id: 'cb3',
      recurrence: 'Indeterminada',
      dueDate: '2099-06-01',
    });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [], [], [], [], [expense], []);

    // Then
    expect(result.allDebits[0].isRecurring).toBe(true);
  });

  it('marks cashbox expense as Vencido when past the due date', () => {
    // Given
    const expense = createTestCashBoxExpense({
      id: 'cb4',
      dueDate: '2000-01-01', // in the past
    });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [], [], [], [], [expense], []);

    // Then
    expect(result.allDebits[0].status).toBe('Vencido');
  });

  // ── Ordering & Integration ─────────────────────────────────────────────────

  it('sorts debits by due date ascending', () => {
    // Given
    const expense1 = createTestCashBoxExpense({ id: 'e1', dueDate: '2099-03-15', value: 100 });
    const expense2 = createTestCashBoxExpense({ id: 'e2', dueDate: '2099-01-10', value: 200 });

    // When
    const result = buildUnifiedFinancialEntries(
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [expense1, expense2],
      [],
    );

    // Then
    expect(result.allDebits[0].id).toBe('e2');
    expect(result.allDebits[1].id).toBe('e1');
  });

  it('combines manual expenses and cashbox debits in ascending due date order', () => {
    // Given
    const manualExpense = {
      id: 'me1',
      description: 'Despesa Manual',
      category: 'Outros' as const,
      value: 300,
      dueDate: '2099-04-01',
      status: 'Pendente' as const,
      isRecurring: false,
      source: 'Manual' as const,
    };
    const cashBoxExpense = createTestCashBoxExpense({ id: 'cb5', dueDate: '2099-02-01' });

    // When
    const result = buildUnifiedFinancialEntries(
      [],
      [],
      [manualExpense],
      [],
      [],
      [],
      [],
      [cashBoxExpense],
      [],
    );

    // Then — cashbox (Feb) should appear before manual (Apr)
    expect(result.allDebits[0].id).toBe('cb5');
    expect(result.allDebits[1].id).toBe('me1');
  });
});
