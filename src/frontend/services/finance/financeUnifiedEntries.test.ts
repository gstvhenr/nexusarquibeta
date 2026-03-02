import { describe, expect, it } from 'vitest';
import { buildUnifiedFinancialEntries } from './financeUnifiedEntries';
import {
  createTestProject,
  createTestCommission,
  createTestCashBoxExpense,
} from '../../test/factories';

describe('buildUnifiedFinancialEntries', () => {
  it('returns empty arrays when all inputs are empty', () => {
    // Given / When
    const result = buildUnifiedFinancialEntries([], [], [], [], [], []);

    // Then
    expect(result.allReceivables).toEqual([]);
    expect(result.allDebits).toEqual([]);
    expect(result.receivableOriginById).toEqual({});
    expect(result.cashBoxOriginById).toEqual({});
    expect(result.cashBoxItemById).toEqual({});
  });

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
    const result = buildUnifiedFinancialEntries([project], [], [], [], [], []);

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
    const result = buildUnifiedFinancialEntries([project], [], [], [], [], []);

    // Then
    expect(result.allReceivables).toHaveLength(2);
    expect(result.allReceivables[0].status).toBe('Em Aberto');
    expect(result.allReceivables[1].status).toBe('Pago');
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
    const result = buildUnifiedFinancialEntries([project], [], [], [], [], []);

    // Then
    expect(result.allReceivables).toHaveLength(0);
  });

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
    const result = buildUnifiedFinancialEntries([], [commission], [], [], [], []);

    // Then
    expect(result.allReceivables).toHaveLength(1);
    expect(result.allReceivables[0].id).toBe('comm_com1');
    expect(result.allReceivables[0].source).toBe('Commission');
    expect(result.allReceivables[0].description).toContain('Fornecedor X');
    expect(result.allReceivables[0].status).toBe('Em Aberto');
  });

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
    const result = buildUnifiedFinancialEntries([], [], [], [], [], [], [expense]);

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
    const result = buildUnifiedFinancialEntries([], [], [], [], [], [], [expense]);

    // Then
    expect(result.allDebits[0].description).toBe('Operacional (2/6)');
  });

  it('sorts debits by due date ascending', () => {
    // Given
    const expense1 = createTestCashBoxExpense({ id: 'e1', dueDate: '2099-03-15', value: 100 });
    const expense2 = createTestCashBoxExpense({ id: 'e2', dueDate: '2099-01-10', value: 200 });

    // When
    const result = buildUnifiedFinancialEntries([], [], [], [], [], [], [expense1, expense2]);

    // Then
    expect(result.allDebits[0].id).toBe('e2');
    expect(result.allDebits[1].id).toBe('e1');
  });
});
