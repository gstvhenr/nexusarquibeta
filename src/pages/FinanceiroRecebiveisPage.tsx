import React, { useMemo } from 'react';
import { PageHeader } from '../components/layout';
import { FinanceLineChart } from '../components/finance';
import { getReceivablesFilterOptions, getReceivablesSeries } from '../services/financeService';
import { useFinanceSeriesPage } from '../hooks/useFinanceSeriesPage';

const FinanceiroRecebiveisPage: () => React.ReactNode = () => {
  const config = useMemo(
    () => ({ getFilterOptions: getReceivablesFilterOptions, getSeries: getReceivablesSeries }),
    [],
  );
  const { dataSeries, period, onPeriodChange, filters, onFilterChange, isLoading, financeiroIcon } =
    useFinanceSeriesPage(config);

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6 min-h-0">
        <div className="space-y-5">
          <PageHeader title="Recebíveis" icon={financeiroIcon} />
          <FinanceLineChart
            title="Evolução de valores recebidos"
            dataSeries={dataSeries}
            period={period}
            filters={filters}
            onPeriodChange={onPeriodChange}
            onFilterChange={onFilterChange}
            isLoading={isLoading}
            emptyMessage="Sem valores recebidos no período selecionado."
            lineColorClassName="hsl(var(--color-success))"
          />
        </div>
      </div>
    </div>
  );
};

export default FinanceiroRecebiveisPage;
