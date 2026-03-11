import React from 'react';
import { PageHeader } from '@/components/layout';
import { FinanceLineChart } from '@/components/finance';
import { useFinanceHistoryPage } from './useFinanceHistoryPage';

const FinanceiroHistoricoPage: () => React.ReactNode = () => {
  const {
    financeiroIcon,
    period,
    onPeriodChange,
    filters,
    onFilterChange,
    isLoading,
    movementMode,
    movementOptions,
    onMovementModeChange,
    chartConfig,
  } = useFinanceHistoryPage();

  return (
    <div className="animate-fade-in-up flex h-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6">
        <div className="flex h-full min-h-0 flex-col">
          <PageHeader title="Histórico Financeiro" icon={financeiroIcon} contentGap="compact" />
          <div className="min-h-0 flex-1">
            <FinanceLineChart
              title={chartConfig.title}
              dataSeries={chartConfig.dataSeries}
              period={period}
              filters={filters}
              onPeriodChange={onPeriodChange}
              onFilterChange={onFilterChange}
              isLoading={isLoading}
              emptyMessage={chartConfig.emptyMessage}
              lineColorClassName={chartConfig.lineColorClassName}
              lineLabel={chartConfig.lineLabel}
              comparisonSeries={chartConfig.comparisonSeries}
              seriesModeControl={{
                value: movementMode,
                options: movementOptions,
                onChange: onMovementModeChange,
                ariaLabel: 'Filtro por tipo de movimentação',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceiroHistoricoPage;
