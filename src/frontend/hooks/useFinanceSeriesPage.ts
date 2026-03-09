import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useCoreData,
  useFinanceData,
  useMarketingData,
  useSupplyChainData,
  useSystemData,
} from '../context/DataContext';
import { NAV_LINKS } from '../constants';
import type {
  Filters,
  FinancialSeriesSource,
  PeriodSelection,
  SeriesFilterOptions,
  SeriesPoint,
} from '../types';

interface FinanceSeriesConfig {
  getFilterOptions: (source: FinancialSeriesSource, filters: Filters) => SeriesFilterOptions;
  getSeries: (
    period: PeriodSelection,
    filters: Filters,
    source: FinancialSeriesSource | undefined,
    referenceDate: Date,
  ) => SeriesPoint[];
}

/**
 * Encapsulates the shared state + derivation logic used by both
 * FinanceiroDebitosPage and FinanceiroRecebiveisPage.
 *
 * input  -> FinanceSeriesConfig (which service functions to call)
 * output -> ready-to-render props for FinanceLineChart
 */
export function useFinanceSeriesPage(config: FinanceSeriesConfig) {
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

  const sanitizeFilters = useCallback(
    (nextFilters: Filters, options: SeriesFilterOptions): Filters => {
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
    },
    [],
  );

  const source = useMemo(
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
    () => config.getFilterOptions(source, filters),
    [config, source, filters],
  );
  const normalizedFilters = useMemo(
    () => sanitizeFilters(filters, filterOptions),
    [filters, filterOptions, sanitizeFilters],
  );
  const normalizedFilterOptions = useMemo(
    () =>
      normalizedFilters === filters
        ? filterOptions
        : config.getFilterOptions(source, normalizedFilters),
    [normalizedFilters, filters, filterOptions, config, source],
  );

  const handleFilterChange = useCallback(
    (nextFilters: Filters) => {
      const nextOptions = config.getFilterOptions(source, nextFilters);
      setFilters(sanitizeFilters(nextFilters, nextOptions));
    },
    [config, sanitizeFilters, source],
  );

  const dataSeries = useMemo(
    () => config.getSeries(period, normalizedFilters, source, referenceDate),
    [config, period, normalizedFilters, source, referenceDate],
  );

  useEffect(() => {
    setIsLoading(true);
    const timeout = window.setTimeout(() => setIsLoading(false), 140);
    return () => window.clearTimeout(timeout);
  }, [
    period.mode,
    period.year,
    normalizedFilters.origin,
    normalizedFilters.category,
    normalizedFilters.item,
  ]);

  const financeiroIcon = NAV_LINKS.find((link) => link.label === 'Financeiro')?.icon;

  return {
    dataSeries,
    period,
    onPeriodChange: setPeriod,
    filters: { values: normalizedFilters, options: normalizedFilterOptions },
    onFilterChange: handleFilterChange,
    isLoading,
    financeiroIcon,
  };
}
