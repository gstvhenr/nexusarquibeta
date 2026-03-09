import { describe, expect, it } from 'vitest';
import type {
  CashBoxCredit,
  Commission,
  FinancialSeriesSource,
  Freelancer,
  ManualIncome,
  MarketingActivity,
  ProfessionalExpense,
  Project,
  HiredService,
} from '../types';
import {
  getExpensesFilterOptions,
  getExpensesSeries,
  getCashFlowForecastSeries,
  getFinancialPageData,
  getReceivablesFilterOptions,
  getReceivablesSeries,
} from './financeService';

const buildSource = (overrides: Partial<FinancialSeriesSource> = {}): FinancialSeriesSource => ({
  projects: [] as Project[],
  commissions: [] as Commission[],
  manualExpenses: [] as ProfessionalExpense[],
  manualIncomes: [] as ManualIncome[],
  marketingActivities: [] as MarketingActivity[],
  freelancers: [] as Freelancer[],
  hiredServices: [] as HiredService[],
  cashBoxExpenses: [],
  cashBoxCredits: [],
  ...overrides,
});

describe('financeService.getFinancialPageData', () => {
  it('computes monthly totals from manual income and expense', () => {
    // Given
    const viewDate = new Date(2026, 1, 1);
    const date = '2026-02-10';

    // When
    const result = getFinancialPageData(
      [] as Project[],
      [] as Commission[],
      [
        {
          id: 'e1',
          description: 'Software',
          category: 'Software e Assinaturas',
          value: 200,
          dueDate: date,
          status: 'Pendente',
          paymentDate: null,
          isRecurring: false,
          source: 'Manual',
        },
      ] as ProfessionalExpense[],
      [
        {
          id: 'i1',
          description: 'Consultoria',
          category: 'Consultoria',
          value: 1000,
          date,
          status: 'Recebido',
        },
      ] as ManualIncome[],
      [] as MarketingActivity[],
      [] as Freelancer[],
      [] as HiredService[],
      viewDate,
      viewDate,
    );

    // Then
    expect(result.monthlyReceivables).toHaveLength(1);
    expect(result.monthlyDebits).toHaveLength(1);
    expect(result.overview.kpis.receitaMensal).toBe(1000);
    expect(result.overview.kpis.despesaMensal).toBe(200);
    expect(result.overview.kpis.saldoMensal).toBe(800);
  });
});

describe('financeService series queries', () => {
  it('returns receivables series by month using only received entries', () => {
    // Given
    const source = buildSource({
      manualIncomes: [
        {
          id: 'inc_1',
          description: 'Consultoria A',
          category: 'Consultoria',
          value: 100,
          date: '2025-03-10',
          status: 'Recebido',
        },
        {
          id: 'inc_2',
          description: 'Consultoria B',
          category: 'Consultoria',
          value: 300,
          date: '2025-03-22',
          status: 'Pendente',
        },
      ],
    });

    // When
    const series = getReceivablesSeries(
      { mode: 'YEAR', year: 2025 },
      { category: 'Consultoria' },
      source,
      new Date(2025, 4, 1),
    );

    const marchPoint = series.find((point) => point.label === '2025-03');

    // Then
    expect(series).toHaveLength(12);
    expect(marchPoint?.value).toBe(100);
  });

  it('supports Profissional/Pessoal origin filter for receivables', () => {
    // Given
    const source = buildSource({
      manualIncomes: [
        {
          id: 'inc_prof',
          description: 'Projeto X',
          category: 'Consultoria',
          value: 200,
          date: '2025-01-10',
          status: 'Recebido',
        } as ManualIncome,
        {
          id: 'inc_pessoal',
          description: 'Reembolso pessoal',
          category: 'Reembolso',
          value: 90,
          date: '2025-01-15',
          status: 'Recebido',
          origin: 'Pessoal',
        } as ManualIncome,
      ],
    });

    // When
    const options = getReceivablesFilterOptions(source, {});
    expect(options.origins).toEqual(['Profissional', 'Pessoal']);

    const series = getReceivablesSeries(
      { mode: 'YEAR', year: 2025 },
      { origin: 'Pessoal' },
      source,
      new Date(2025, 0, 1),
    );
    const januaryPoint = series.find((point) => point.label === '2025-01');

    // Then
    expect(januaryPoint?.value).toBe(90);
  });

  it('applies origin/category/item filters for expenses and keeps year with 12 points', () => {
    // Given
    const source = buildSource({
      manualExpenses: [
        {
          id: 'exp_1',
          description: 'Assinatura SaaS',
          category: 'Software e Assinaturas',
          value: 240,
          dueDate: '2025-01-05',
          status: 'Pago',
          paymentDate: '2025-01-05',
          isRecurring: false,
          source: 'Manual',
        },
      ],
      cashBoxExpenses: [
        {
          id: 'cb_1',
          origin: 'Pessoal',
          category: 'Alimentação',
          item: 'Mercado',
          recurrence: 'Única',
          dueDate: '2025-01-20',
          paymentDate: null,
          value: 80,
          installmentNumber: null,
          installmentTotal: null,
          recurringGroupId: null,
          createdAt: '2025-01-20T09:00:00.000Z',
        },
        {
          id: 'cb_2',
          origin: 'Pessoal',
          category: 'Habitação',
          item: 'Condomínio',
          recurrence: 'Única',
          dueDate: '2025-02-15',
          paymentDate: null,
          value: 120,
          installmentNumber: null,
          installmentTotal: null,
          recurringGroupId: null,
          createdAt: '2025-02-15T09:00:00.000Z',
        },
      ],
    });

    // When
    const filters = { origin: 'Pessoal' as const, category: 'Alimentação', item: 'Mercado' };
    const series = getExpensesSeries(
      { mode: 'YEAR', year: 2025 },
      filters,
      source,
      new Date(2025, 3, 1),
    );
    const januaryPoint = series.find((point) => point.label === '2025-01');
    const februaryPoint = series.find((point) => point.label === '2025-02');

    expect(series).toHaveLength(12);
    expect(januaryPoint?.value).toBe(80);
    expect(februaryPoint?.value).toBe(0);

    const options = getExpensesFilterOptions(source, {
      origin: 'Pessoal',
      category: 'Alimentação',
    });

    // Then
    expect(options.items).toEqual(['Mercado']);
  });

  it('anchors LAST_12_MONTHS to latest filtered month when there are future expenses', () => {
    // Given
    const source = buildSource({
      cashBoxExpenses: [
        {
          id: 'cb_future',
          origin: 'Profissional',
          category: 'Operacional',
          item: 'Internet',
          recurrence: 'Única',
          dueDate: '2026-03-10',
          paymentDate: null,
          value: 150,
          installmentNumber: null,
          installmentTotal: null,
          recurringGroupId: null,
          createdAt: '2026-02-01T09:00:00.000Z',
        },
      ],
    });

    // When
    const series = getExpensesSeries({ mode: 'LAST_12_MONTHS' }, {}, source, new Date(2026, 1, 1));
    const marchPoint = series.find((point) => point.label === '2026-03');

    // Then
    expect(series).toHaveLength(12);
    expect(marchPoint?.value).toBe(150);
  });

  it('includes cash box expense from current month in LAST_12_MONTHS', () => {
    // Given
    const source = buildSource({
      cashBoxExpenses: [
        {
          id: 'cb_now',
          origin: 'Profissional',
          category: 'Operacional',
          item: 'Conta de água',
          recurrence: 'Única',
          dueDate: '2026-02-18',
          paymentDate: null,
          value: 220,
          installmentNumber: null,
          installmentTotal: null,
          recurringGroupId: null,
          createdAt: '2026-02-18T10:00:00.000Z',
        },
      ],
    });

    // When
    const series = getExpensesSeries({ mode: 'LAST_12_MONTHS' }, {}, source, new Date(2026, 1, 20));
    const februaryPoint = series.find((point) => point.label === '2026-02');

    // Then
    expect(series).toHaveLength(12);
    expect(februaryPoint?.value).toBe(220);
  });
});

describe('financeService.getCashFlowForecastSeries', () => {
  it('returns 12 months starting from referenceDate with correct income and expenses', () => {
    // Given
    const source = buildSource({
      manualIncomes: [
        {
          id: 'inc_forecast',
          description: 'Consultoria Futura',
          category: 'Consultoria',
          value: 500,
          date: '2026-03-15',
          status: 'Pendente',
        },
      ],
      cashBoxExpenses: [
        {
          id: 'cb_forecast',
          origin: 'Profissional',
          category: 'Operacional',
          item: 'Internet',
          recurrence: 'Única',
          dueDate: '2026-03-10',
          paymentDate: null,
          value: 150,
          installmentNumber: null,
          installmentTotal: null,
          recurringGroupId: null,
          createdAt: '2026-02-01T09:00:00.000Z',
        },
      ],
    });

    // When
    const forecast = getCashFlowForecastSeries(source, new Date(2026, 1, 12));

    // Then
    expect(forecast).toHaveLength(12);
    expect(forecast[0].label).toBe('2026-02');
    expect(forecast[11].label).toBe('2027-01');

    const marchPoint = forecast.find((p) => p.label === '2026-03');
    expect(marchPoint?.income).toBe(500);
    expect(marchPoint?.expenses).toBe(150);
  });

  it('includes cashBoxCredits as income in the forecast', () => {
    // Given
    const source = buildSource({
      cashBoxCredits: [
        {
          id: 'cr_forecast',
          origin: 'Profissional',
          description: 'Pagamento cliente X',
          date: '2026-04-10',
          value: 800,
          confirmed: false,
          createdAt: '2026-02-15T09:00:00.000Z',
        },
      ] as CashBoxCredit[],
    });

    // When
    const forecast = getCashFlowForecastSeries(source, new Date(2026, 1, 12));
    const aprilPoint = forecast.find((p) => p.label === '2026-04');

    // Then
    expect(aprilPoint?.income).toBe(800);
  });
});

describe('financeService cashBoxCredits in page data', () => {
  it('includes confirmed cashBoxCredit in monthly receivables and KPIs', () => {
    // Given
    const viewDate = new Date(2026, 1, 1);
    const creditDate = '2026-02-05';

    // When
    const result = getFinancialPageData(
      [] as Project[],
      [] as Commission[],
      [] as ProfessionalExpense[],
      [] as ManualIncome[],
      [] as MarketingActivity[],
      [] as Freelancer[],
      [] as HiredService[],
      viewDate,
      viewDate,
      [],
      [
        {
          id: 'cr_1',
          origin: 'Profissional',
          description: 'Crédito teste',
          date: creditDate,
          value: 500,
          confirmed: true,
          createdAt: '2026-02-05T09:00:00.000Z',
        },
      ] as CashBoxCredit[],
    );

    // Then
    expect(result.monthlyReceivables).toHaveLength(1);
    expect(result.overview.kpis.receitaMensal).toBe(500);
    expect(result.monthlyReceivables[0].status).toBe('Pago');
  });
});
