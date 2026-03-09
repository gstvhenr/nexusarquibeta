import type {
  Project,
  Commission,
  ProfessionalExpense,
  MarketingActivity,
  Freelancer,
  HiredService,
  ManualIncome,
  CashBoxExpense,
  CashBoxCredit,
  Filters,
  PeriodSelection,
  SeriesPoint,
  SeriesFilterOptions,
  FinancialSeriesSource,
} from '../types';
import {
  applySeriesFilters,
  buildFilterOptions,
  buildSeriesFromRecords,
  calculateChange,
  getMonthlyTotals,
  getReceivableCategory,
  isInMonth,
  mapDebitsToSeriesRecords,
  mapReceivablesToSeriesRecords,
  toMonthKey,
} from './finance/financeShared';
import { buildUnifiedFinancialEntries } from './finance/financeUnifiedEntries';
import type { UnifiedFinancialEntries } from './finance/financeUnifiedEntries';

const buildSourceEntries = (source: FinancialSeriesSource): UnifiedFinancialEntries =>
  buildUnifiedFinancialEntries(
    source.projects,
    source.commissions,
    source.manualExpenses,
    source.manualIncomes,
    source.marketingActivities,
    source.freelancers,
    source.hiredServices ?? [],
    source.cashBoxExpenses ?? [],
    source.cashBoxCredits ?? [],
  );

/**
 * Input -> Output:
 * - input: período + filtros + fonte de dados financeiros.
 * - output: série mensal agregada de recebíveis realizados.
 */
export const getReceivablesSeries = (
  period: PeriodSelection,
  filters: Filters = {},
  source?: FinancialSeriesSource,
  referenceDate: Date = new Date(),
): SeriesPoint[] => {
  if (!source) return [];

  const { allReceivables, receivableOriginById } = buildSourceEntries(source);

  const records = mapReceivablesToSeriesRecords(allReceivables, receivableOriginById);
  const filteredRecords = applySeriesFilters(records, filters);
  return buildSeriesFromRecords(filteredRecords, period, referenceDate);
};

/**
 * Input -> Output:
 * - input: período + filtros + fonte de dados financeiros.
 * - output: série mensal agregada de despesas lançadas/pagas.
 */
export const getExpensesSeries = (
  period: PeriodSelection,
  filters: Filters = {},
  source?: FinancialSeriesSource,
  referenceDate: Date = new Date(),
): SeriesPoint[] => {
  if (!source) return [];

  const { allDebits, cashBoxOriginById, cashBoxItemById } = buildSourceEntries(source);

  const records = mapDebitsToSeriesRecords(allDebits, cashBoxOriginById, cashBoxItemById);
  const filteredRecords = applySeriesFilters(records, filters);
  return buildSeriesFromRecords(filteredRecords, period, referenceDate);
};

export const getReceivablesFilterOptions = (
  source: FinancialSeriesSource,
  filters: Filters = {},
): SeriesFilterOptions => {
  const { allReceivables, receivableOriginById } = buildSourceEntries(source);

  const records = mapReceivablesToSeriesRecords(allReceivables, receivableOriginById);
  return buildFilterOptions(records, filters);
};

export const getExpensesFilterOptions = (
  source: FinancialSeriesSource,
  filters: Filters = {},
): SeriesFilterOptions => {
  const { allDebits, cashBoxOriginById, cashBoxItemById } = buildSourceEntries(source);

  const records = mapDebitsToSeriesRecords(allDebits, cashBoxOriginById, cashBoxItemById);
  return buildFilterOptions(records, filters);
};

/**
 * Input -> Output:
 * - input: fonte de dados financeiros + data de referência.
 * - output: série de 12 meses a partir de referenceDate com receitas e despesas por mês.
 * Example:
 * const forecast = getCashFlowForecastSeries(source, new Date());
 */
type CashFlowForecastPoint = {
  label: string;
  month: string;
  year: string;
  income: number;
  expenses: number;
};

export const getCashFlowForecastSeries = (
  source: FinancialSeriesSource,
  referenceDate: Date = new Date(),
): CashFlowForecastPoint[] => {
  const { allReceivables, allDebits } = buildSourceEntries(source);

  return Array.from({ length: 12 }, (_, index) => {
    const forecastDate = new Date(referenceDate);
    forecastDate.setDate(1);
    forecastDate.setMonth(referenceDate.getMonth() + index);

    const totals = getMonthlyTotals(allReceivables, allDebits, forecastDate);
    return {
      label: toMonthKey(forecastDate),
      month: forecastDate.toLocaleString('pt-BR', { month: 'short' }),
      year: forecastDate.getFullYear().toString().slice(-2),
      income: totals.receita,
      expenses: totals.despesa,
    };
  });
};

/**
 * Input -> Output:
 * - input: fontes financeiras (projetos, comissões, despesas/receitas manuais, marketing, freelancers, gestão de caixa) + mês de visualização.
 * - output: visão financeira consolidada (`overview`, `monthlyReceivables`, `monthlyDebits`).
 * Example:
 * const data = getFinancialPageData(projects, commissions, expenses, incomes, marketing, freelancers, viewDate, new Date(), cashBoxExpenses);
 */
export const getFinancialPageData = (
  projects: Project[],
  commissions: Commission[],
  manualExpenses: ProfessionalExpense[],
  manualIncomes: ManualIncome[],
  marketingActivities: MarketingActivity[],
  freelancers: Freelancer[],
  hiredServices: HiredService[],
  viewDate: Date,
  _chartReferenceDate: Date = new Date(),
  cashBoxExpenses: CashBoxExpense[] = [],
  cashBoxCredits: CashBoxCredit[] = [],
) => {
  const { allReceivables, allDebits } = buildUnifiedFinancialEntries(
    projects,
    commissions,
    manualExpenses,
    manualIncomes,
    marketingActivities,
    freelancers,
    hiredServices,
    cashBoxExpenses,
    cashBoxCredits,
  );

  const monthlyReceivables = allReceivables.filter((receivable) =>
    isInMonth(receivable.dueDate, viewDate),
  );
  const monthlyDebits = allDebits.filter((debit) => isInMonth(debit.dueDate, viewDate));

  const receita = monthlyReceivables.reduce((sum, receivable) => sum + receivable.value, 0);
  const despesa = monthlyDebits.reduce((sum, debit) => sum + debit.value, 0);
  const currentMonthTotals = { receita, despesa, saldo: receita - despesa };

  const prevMonthDate = new Date(viewDate);
  prevMonthDate.setDate(1);
  prevMonthDate.setMonth(viewDate.getMonth() - 1);

  const prevMonthReceivables = allReceivables.filter((receivable) =>
    isInMonth(receivable.dueDate, prevMonthDate),
  );
  const prevMonthDebits = allDebits.filter((debit) => isInMonth(debit.dueDate, prevMonthDate));

  const prevReceita = prevMonthReceivables.reduce((sum, receivable) => sum + receivable.value, 0);
  const prevDespesa = prevMonthDebits.reduce((sum, debit) => sum + debit.value, 0);
  const prevMonthTotals = {
    receita: prevReceita,
    despesa: prevDespesa,
    saldo: prevReceita - prevDespesa,
  };

  const totalInadimplencia = monthlyReceivables
    .filter((receivable) => receivable.status === 'Vencido')
    .reduce((sum, receivable) => sum + receivable.value, 0);
  const totalDebitosAtrasados = monthlyDebits
    .filter((debit) => debit.status === 'Vencido')
    .reduce((sum, debit) => sum + debit.value, 0);

  const categoryMap = new Map<string, number>();
  monthlyDebits.forEach((debit) => {
    const category = debit.category || 'Outros';
    categoryMap.set(category, (categoryMap.get(category) || 0) + debit.value);
  });

  const expensesByCategory = Array.from(categoryMap.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  const receivableSourceMap = new Map<string, number>();
  monthlyReceivables.forEach((receivable) => {
    const label =
      receivable.source === 'Project' && receivable.projectCode
        ? `Projeto: ${receivable.projectCode}`
        : receivable.category || getReceivableCategory(receivable);
    receivableSourceMap.set(label, (receivableSourceMap.get(label) || 0) + receivable.value);
  });

  const receivablesBySource = Array.from(receivableSourceMap.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  const receivablesHealth = {
    totalOpen: monthlyReceivables
      .filter((receivable) => receivable.status === 'Em Aberto')
      .reduce((sum, receivable) => sum + receivable.value, 0),
    totalOverdue: totalInadimplencia,
    totalPaid: monthlyReceivables
      .filter((receivable) => receivable.status === 'Pago')
      .reduce((sum, receivable) => sum + receivable.value, 0),
  };

  const debitsHealth = {
    totalPending: monthlyDebits
      .filter((debit) => debit.status === 'Pendente')
      .reduce((sum, debit) => sum + debit.value, 0),
    totalOverdue: totalDebitosAtrasados,
    totalPaid: monthlyDebits
      .filter((debit) => debit.status === 'Pago')
      .reduce((sum, debit) => sum + debit.value, 0),
  };

  const profitMargin =
    currentMonthTotals.receita > 0
      ? (currentMonthTotals.saldo / currentMonthTotals.receita) * 100
      : 0;

  const overview = {
    kpis: {
      receitaMensal: currentMonthTotals.receita,
      despesaMensal: currentMonthTotals.despesa,
      saldoMensal: currentMonthTotals.saldo,
      totalAtrasado: totalInadimplencia,
      totalDebitosAtrasados,
      receitaChange: calculateChange(currentMonthTotals.receita, prevMonthTotals.receita),
      despesaChange: calculateChange(currentMonthTotals.despesa, prevMonthTotals.despesa),
      saldoChange: calculateChange(currentMonthTotals.saldo, prevMonthTotals.saldo),
    },
    expensesByCategory,
    receivablesBySource,
    receivablesHealth,
    debitsHealth,
    profitMargin,
  };

  return {
    overview,
    monthlyReceivables,
    monthlyDebits,
  };
};
