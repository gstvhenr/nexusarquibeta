import type {
  CashBoxOrigin,
  Filters,
  FinancialDebit,
  FinancialReceivable,
  PeriodSelection,
  SeriesFilterOptions,
  SeriesPoint,
} from '../../types';
import { parseDateString } from '../../utils/formatters';

export const DEFAULT_ORIGINS: CashBoxOrigin[] = ['Profissional', 'Pessoal'];

export type SeriesRecord = {
  date: string | null | undefined;
  value: number;
  origin: CashBoxOrigin;
  category: string;
  item: string;
};

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, months: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

export const toMonthKey = (date: Date): string => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
};

export const isInMonth = (dateStr: string | null, targetDate: Date): boolean => {
  const date = parseDateString(dateStr);
  if (!date) return false;
  return (
    date.getFullYear() === targetDate.getFullYear() && date.getMonth() === targetDate.getMonth()
  );
};

export const getMonthlyTotals = (
  receivables: Pick<FinancialReceivable, 'dueDate' | 'value'>[],
  debits: Pick<FinancialDebit, 'dueDate' | 'value'>[],
  targetDate: Date,
) => {
  const receita = receivables
    .filter((receivable) => isInMonth(receivable.dueDate, targetDate))
    .reduce((sum, receivable) => sum + receivable.value, 0);

  const despesa = debits
    .filter((debit) => isInMonth(debit.dueDate, targetDate))
    .reduce((sum, debit) => sum + debit.value, 0);

  return { receita, despesa, saldo: receita - despesa };
};

export const getReceivableCategory = (receivable: FinancialReceivable): string => {
  if (receivable.category) return receivable.category;
  if (receivable.source === 'Commission') return 'Comissão';
  if (receivable.source === 'Project') return 'Projeto';
  return 'Outros';
};

const sortUniqueStrings = (values: string[]): string[] =>
  Array.from(new Set(values.filter((value) => value.trim().length > 0))).sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  );

export const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const getPeriodMonths = (period: PeriodSelection, referenceDate: Date): Date[] => {
  const referenceMonth = startOfMonth(referenceDate);

  if (period.mode === 'YEAR') {
    const year = period.year ?? referenceMonth.getFullYear();
    return Array.from({ length: 12 }, (_, index) => new Date(year, index, 1));
  }

  let rangeStart = referenceMonth;
  if (period.mode === 'LAST_12_MONTHS') {
    rangeStart = addMonths(referenceMonth, -11);
  } else if (period.mode === 'QUARTER') {
    rangeStart = addMonths(referenceMonth, -2);
  } else if (period.mode === 'SEMESTER') {
    rangeStart = addMonths(referenceMonth, -5);
  }

  const months: Date[] = [];
  let cursor = new Date(rangeStart);
  while (cursor <= referenceMonth) {
    months.push(new Date(cursor));
    cursor = addMonths(cursor, 1);
  }

  return months;
};

export const applySeriesFilters = (
  records: SeriesRecord[],
  filters: Filters = {},
): SeriesRecord[] =>
  records.filter((record) => {
    if (filters.origin && record.origin !== filters.origin) return false;
    if (filters.category && record.category !== filters.category) return false;
    if (filters.item && record.item !== filters.item) return false;
    return true;
  });

export const buildSeriesFromRecords = (
  records: SeriesRecord[],
  period: PeriodSelection,
  referenceDate: Date,
): SeriesPoint[] => {
  const parsedDates = records
    .map((record) => parseDateString(record.date || null))
    .filter((date): date is Date => date !== null);

  const latestDate =
    parsedDates.length > 0
      ? parsedDates.reduce((acc, current) => (current > acc ? current : acc), parsedDates[0])
      : null;

  const effectiveReferenceDate =
    latestDate && latestDate > referenceDate
      ? startOfMonth(latestDate)
      : startOfMonth(referenceDate);

  const months = getPeriodMonths(period, effectiveReferenceDate);
  const totalsByMonth = new Map<string, number>();

  months.forEach((month) => {
    totalsByMonth.set(toMonthKey(month), 0);
  });

  records.forEach((record) => {
    const parsedDate = parseDateString(record.date || null);
    if (!parsedDate) return;

    const key = toMonthKey(parsedDate);
    if (!totalsByMonth.has(key)) return;

    totalsByMonth.set(key, (totalsByMonth.get(key) || 0) + record.value);
  });

  return months.map((month) => {
    const label = toMonthKey(month);
    return {
      label,
      value: Number((totalsByMonth.get(label) || 0).toFixed(2)),
    };
  });
};

export const buildFilterOptions = (
  records: SeriesRecord[],
  filters: Filters = {},
): SeriesFilterOptions => {
  const byOrigin = filters.origin
    ? records.filter((record) => record.origin === filters.origin)
    : records;

  const categories = sortUniqueStrings(byOrigin.map((record) => record.category));
  const byCategory = filters.category
    ? byOrigin.filter((record) => record.category === filters.category)
    : byOrigin;

  const items = sortUniqueStrings(byCategory.map((record) => record.item));

  return {
    origins: DEFAULT_ORIGINS,
    categories,
    items,
  };
};

export const mapReceivablesToSeriesRecords = (
  receivables: FinancialReceivable[],
  receivableOriginById: Record<string, CashBoxOrigin>,
): SeriesRecord[] =>
  receivables
    .filter((receivable) => receivable.status === 'Pago' || receivable.status === 'Recebido')
    .map((receivable) => ({
      date: receivable.paymentDate || receivable.dueDate,
      value: receivable.value,
      origin: receivableOriginById[receivable.id] ?? 'Profissional',
      category: getReceivableCategory(receivable),
      item: receivable.description,
    }));

export const mapDebitsToSeriesRecords = (
  debits: FinancialDebit[],
  cashBoxOriginById: Record<string, CashBoxOrigin>,
  cashBoxItemById: Record<string, string | null>,
): SeriesRecord[] =>
  debits.map((debit) => ({
    date: debit.paymentDate || debit.dueDate,
    value: debit.value,
    origin:
      debit.source === 'CashBox' ? (cashBoxOriginById[debit.id] ?? 'Profissional') : 'Profissional',
    category: debit.category || 'Outros',
    item:
      debit.source === 'CashBox'
        ? (cashBoxItemById[debit.id] ?? debit.description)
        : debit.description,
  }));
