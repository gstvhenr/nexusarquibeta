import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useCoreData,
  useFinanceData,
  useMarketingData,
  useSupplyChainData,
  useSystemData,
} from '@/context/DataContext';
import { NAV_LINKS } from '@/constants';
import {
  getHistoryFilterOptions,
  getHistorySeries,
  type FinancialHistoryMode,
} from '@/services/financeService';
import type { Filters, FinancialSeriesSource, PeriodSelection, SeriesFilterOptions } from '@/types';

const HISTORY_MODE_OPTIONS: Array<{ value: FinancialHistoryMode; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'credit', label: 'Crédito' },
  { value: 'debit', label: 'Débito' },
];

const parseHistoryMode = (value: string | null): FinancialHistoryMode => {
  if (value === 'credit' || value === 'debit') return value;
  return 'all';
};

const sanitizeFilters = (nextFilters: Filters, options: SeriesFilterOptions): Filters => {
  let changed = false;
  const normalized: Filters = { ...nextFilters };

  if (normalized.origin && !options.origins.includes(normalized.origin)) {
    normalized.origin = undefined;
    changed = true;
  }

  if (normalized.category && !options.categories.includes(normalized.category)) {
    normalized.category = undefined;
    normalized.item = undefined;
    changed = true;
  }

  if (normalized.item && !options.items.includes(normalized.item)) {
    normalized.item = undefined;
    changed = true;
  }

  return changed ? normalized : nextFilters;
};

export function useFinanceHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects } = useCoreData();
  const { commissions, manualExpenses, manualIncomes, cashBoxExpenses, cashBoxCredits } =
    useFinanceData();
  const { marketingActivities } = useMarketingData();
  const { freelancers } = useSupplyChainData();
  const { hiredServices } = useSystemData();

  const [period, setPeriod] = useState<PeriodSelection>({ mode: 'LAST_12_MONTHS' });
  const [filters, setFilters] = useState<Filters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [referenceDate] = useState(() => new Date());

  const movementMode = parseHistoryMode(searchParams.get('tipo'));

  const source: FinancialSeriesSource = useMemo(
    () => ({
      projects,
      commissions,
      manualExpenses,
      manualIncomes,
      marketingActivities,
      freelancers,
      hiredServices,
      cashBoxExpenses,
      cashBoxCredits,
    }),
    [
      projects,
      commissions,
      manualExpenses,
      manualIncomes,
      marketingActivities,
      freelancers,
      hiredServices,
      cashBoxExpenses,
      cashBoxCredits,
    ],
  );

  const filterOptions = useMemo(
    () => getHistoryFilterOptions(movementMode, source, filters),
    [movementMode, source, filters],
  );
  const normalizedFilters = useMemo(
    () => sanitizeFilters(filters, filterOptions),
    [filterOptions, filters],
  );
  const normalizedFilterOptions = useMemo(
    () =>
      normalizedFilters === filters
        ? filterOptions
        : getHistoryFilterOptions(movementMode, source, normalizedFilters),
    [movementMode, normalizedFilters, filterOptions, filters, source],
  );

  const handleFilterChange = useCallback(
    (nextFilters: Filters) => {
      const nextOptions = getHistoryFilterOptions(movementMode, source, nextFilters);
      setFilters(sanitizeFilters(nextFilters, nextOptions));
    },
    [movementMode, source],
  );

  const handleMovementModeChange = useCallback(
    (nextValue: string) => {
      const nextMode = parseHistoryMode(nextValue);

      setSearchParams(
        (currentParams) => {
          const nextParams = new URLSearchParams(currentParams);
          nextParams.set('tipo', nextMode);
          return nextParams;
        },
        { replace: true },
      );

      setFilters((currentFilters) => {
        const nextOptions = getHistoryFilterOptions(nextMode, source, currentFilters);
        return sanitizeFilters(currentFilters, nextOptions);
      });
    },
    [setSearchParams, source],
  );

  const { creditSeries, debitSeries } = useMemo(
    () => getHistorySeries(movementMode, period, normalizedFilters, source, referenceDate),
    [movementMode, normalizedFilters, period, referenceDate, source],
  );

  useEffect(() => {
    setIsLoading(true);
    const timeout = window.setTimeout(() => setIsLoading(false), 140);
    return () => window.clearTimeout(timeout);
  }, [
    movementMode,
    period.mode,
    period.year,
    normalizedFilters.origin,
    normalizedFilters.category,
    normalizedFilters.item,
  ]);

  const financeiroIcon = NAV_LINKS.find((link) => link.label === 'Financeiro')?.icon;

  const chartConfig = useMemo(() => {
    if (movementMode === 'credit') {
      return {
        title: '',
        dataSeries: creditSeries,
        lineColorClassName: 'hsl(var(--color-success))',
        lineLabel: 'Créditos',
        comparisonSeries: undefined,
        emptyMessage: '',
      };
    }

    if (movementMode === 'debit') {
      return {
        title: '',
        dataSeries: debitSeries,
        lineColorClassName: 'hsl(var(--color-error))',
        lineLabel: 'Débitos',
        comparisonSeries: undefined,
        emptyMessage: '',
      };
    }

    return {
      title: '',
      dataSeries: creditSeries,
      lineColorClassName: 'hsl(var(--color-success))',
      lineLabel: 'Créditos',
      comparisonSeries: {
        data: debitSeries,
        label: 'Débitos',
        colorClassName: 'hsl(var(--color-error))',
      },
      emptyMessage: '',
    };
  }, [creditSeries, debitSeries, movementMode]);

  return {
    financeiroIcon,
    period,
    onPeriodChange: setPeriod,
    filters: { values: normalizedFilters, options: normalizedFilterOptions },
    onFilterChange: handleFilterChange,
    isLoading,
    movementMode,
    movementOptions: HISTORY_MODE_OPTIONS,
    onMovementModeChange: handleMovementModeChange,
    chartConfig,
  };
}
