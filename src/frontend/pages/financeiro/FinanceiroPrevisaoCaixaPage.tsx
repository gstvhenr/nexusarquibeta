import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '../../components/layout';
import {
  useCoreData,
  useFinanceData,
  useMarketingData,
  useSupplyChainData,
  useSystemData,
} from '../../context/DataContext';
import { formatYAxisTick } from '../../utils/formatters';
import { getCashFlowForecastSeries } from '../../services/financeService';
import { NAV_LINKS } from '../../constants';
import { CardShell, SectionTitle, CustomTooltip } from '../../components/finance';
import type { FinancialSeriesSource } from '../../types';

const FinanceiroPrevisaoCaixaPage: () => React.ReactNode = () => {
  const { projects } = useCoreData();
  const { commissions, manualExpenses, manualIncomes, cashBoxExpenses, cashBoxCredits } =
    useFinanceData();
  const { marketingActivities } = useMarketingData();
  const { freelancers } = useSupplyChainData();
  const { hiredServices } = useSystemData();

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

  const forecastData = useMemo(() => getCashFlowForecastSeries(source, new Date()), [source]);

  const financeiroIcon = NAV_LINKS.find((link) => link.label === 'Financeiro')?.icon;

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6 min-h-0">
        <div className="space-y-5">
          <PageHeader title="Previsão de Caixa" icon={financeiroIcon} />

          <CardShell className="p-5 min-h-[480px] flex flex-col">
            <SectionTitle
              trailing={
                <div className="hidden sm:flex items-center gap-3 text-[11px] text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success inline-block" /> Receitas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-error inline-block" /> Despesas
                  </span>
                </div>
              }
            >
              Previsão de Caixa — Próximos 12 meses
            </SectionTitle>

            <div
              className="flex-1 -ml-2 mt-2"
              role="img"
              aria-label="Gráfico de previsão de caixa mostrando receitas e despesas para os próximos 12 meses"
            >
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={forecastData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorForecastIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--color-success))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--color-success))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorForecastExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--color-error))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--color-error))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--color-border-color) / 0.2)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--color-text-secondary))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val: string, i: number) => `${val}/${forecastData[i]?.year}`}
                  />
                  <YAxis
                    stroke="hsl(var(--color-text-secondary))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatYAxisTick}
                    width={55}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'hsl(var(--color-primary) / 0.04)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="income"
                    stroke="hsl(var(--color-success))"
                    fillOpacity={1}
                    fill="url(#colorForecastIncome)"
                    strokeWidth={2.5}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--color-surface))' }}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="expenses"
                    stroke="hsl(var(--color-error))"
                    fillOpacity={1}
                    fill="url(#colorForecastExpenses)"
                    strokeWidth={2.5}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--color-surface))' }}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {forecastData.every((p) => p.income === 0 && p.expenses === 0) && (
              <div className="rounded-xl border border-dashed border-border-color bg-background/40 px-4 py-3 mt-2">
                <p className="text-sm text-text-secondary text-center">
                  Nenhum lançamento previsto para os próximos 12 meses.
                </p>
              </div>
            )}
          </CardShell>
        </div>
      </div>
    </div>
  );
};

export default FinanceiroPrevisaoCaixaPage;
