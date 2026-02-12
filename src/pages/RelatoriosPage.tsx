import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '../components/layout';
import { useData } from '../context/DataContext';
import { generateReport, ReportFilter } from '../services/reportService';
import { formatCurrency } from '../utils/formatters';
import { NAV_LINKS } from '../constants';

const ReportCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = '',
}) => (
  <div className={`bg-surface rounded-xl shadow-soft p-6 ${className}`}>
    <h3 className="font-serif text-xl font-bold text-secondary mb-4 pb-4 border-b border-border-color">
      {title}
    </h3>
    {children}
  </div>
);

const StatCard: React.FC<{ label: string; value: string | number; subtext?: string }> = ({
  label,
  value,
  subtext,
}) => (
  <div>
    <p className="text-3xl font-bold font-sans text-primary">{value}</p>
    <p className="font-semibold text-text-secondary text-sm">{label}</p>
    {subtext && <p className="text-xs text-text-secondary mt-1 opacity-70">{subtext}</p>}
  </div>
);

const InteractiveBarChart: React.FC<{
  data: { label: string; value: number }[];
  format: 'currency' | 'number';
}> = ({ data, format }) => {
  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-text-secondary py-10">
        Dados insuficientes para exibir o gráfico.
      </p>
    );
  }

  const formatYAxisTick = (tick: any) => {
    if (format === 'currency') {
      if (tick >= 1000) return `R$${tick / 1000}k`;
      return `R$${tick}`;
    }
    return tick;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = format === 'currency' ? formatCurrency(value) : value;
      return (
        <div className="bg-surface p-2 border border-border-color rounded-md shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-primary">{`Valor: ${formattedValue}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border-color) / 0.5)" />
          <XAxis
            dataKey="label"
            stroke="hsl(var(--color-text-secondary))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--color-text-secondary))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'hsl(var(--color-primary) / 0.1)' }}
          />
          <Bar dataKey="value" fill="hsl(var(--color-primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const RelatoriosPage: React.FC = () => {
  const allData = useData();
  const [filter, setFilter] = useState<ReportFilter>({
    type: 'preset',
    days: 365,
    startDate: '',
    endDate: new Date().toISOString().split('T')[0],
  });

  const reportData = useMemo(() => generateReport(allData, filter), [allData, filter]);
  const { financialMetrics, projectMetrics, acquisitionMetrics } = reportData;

  const handlePresetClick = (days: number) => {
    setFilter({
      type: 'preset',
      days,
      startDate: '',
      endDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'startDate' | 'endDate',
  ) => {
    setFilter((prev) => ({
      ...prev,
      type: 'custom',
      days: 0,
      [field]: e.target.value,
    }));
  };

  const dateFilterOptions = [
    { label: 'Últimos 30 dias', value: 30 },
    { label: 'Últimos 90 dias', value: 90 },
    { label: 'Este ano', value: 365 },
    { label: 'Desde o início', value: 99999 },
  ];

  const relatoriosIcon = NAV_LINKS.find((link) => link.path === '/relatorios')?.icon;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Relatórios" icon={relatoriosIcon}>
        <div className="flex items-center gap-4 bg-background p-1.5 rounded-lg border border-border-color">
          <div className="flex items-center gap-1">
            {dateFilterOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePresetClick(opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filter.type === 'preset' && filter.days === opt.value
                    ? 'bg-primary text-primary-content'
                    : 'bg-transparent text-text-secondary hover:bg-surface'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 border-l border-border-color pl-3">
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => handleDateChange(e, 'startDate')}
              className="bg-surface p-1.5 rounded-md border border-border-color text-xs text-text-primary focus:border-accent focus:ring-0"
              aria-label="Data de início"
            />
            <span className="text-text-secondary text-xs">até</span>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => handleDateChange(e, 'endDate')}
              className="bg-surface p-1.5 rounded-md border border-border-color text-xs text-text-primary focus:border-accent focus:ring-0"
              aria-label="Data de fim"
            />
          </div>
        </div>
      </PageHeader>

      <div className="space-y-8">
        <section>
          <h2 className="font-serif text-3xl font-bold text-text-primary mb-6">
            Painel Financeiro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ReportCard title="Receita de Projetos">
              <StatCard
                label="Projetos concluídos no período"
                value={formatCurrency(financialMetrics.revenueFromProjects)}
              />
            </ReportCard>
            <ReportCard title="Receita de Comissões">
              <StatCard
                label="Comissões recebidas no período"
                value={formatCurrency(financialMetrics.revenueFromCommissions)}
              />
            </ReportCard>
            <ReportCard title="Custos Totais">
              <StatCard
                label="Compras e serviços no período"
                value={formatCurrency(financialMetrics.totalCosts)}
              />
            </ReportCard>
            <ReportCard title="Lucratividade Total">
              <StatCard
                label="Receitas - Custos"
                value={formatCurrency(financialMetrics.profitability)}
              />
            </ReportCard>
            <ReportCard title="Receita Mensal (Últimos Meses)" className="lg:col-span-4">
              <InteractiveBarChart data={financialMetrics.revenueChartData} format="currency" />
            </ReportCard>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-bold text-text-primary mb-6">
            Performance de Projetos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReportCard title="Visão Geral">
              <div className="space-y-4">
                <StatCard
                  label="Projetos Ativos"
                  value={projectMetrics.inProgress}
                  subtext="Projetos atualmente em andamento"
                />
                <div className="border-t border-border-color pt-4">
                  <StatCard
                    label="Taxa de Conclusão"
                    value={`${projectMetrics.conclusionRate.toFixed(1)}%`}
                    subtext="Proporção de projetos finalizados"
                  />
                </div>
              </div>
            </ReportCard>

            <ReportCard title="Valores e Médias">
              <div className="space-y-4">
                <StatCard
                  label="Ticket Médio"
                  value={formatCurrency(projectMetrics.averageTicket)}
                  subtext="Valor médio por projeto no período"
                />
                <div className="border-t border-border-color pt-4">
                  <StatCard
                    label="Volume Total Contratado"
                    value={formatCurrency(projectMetrics.totalProjectValue)}
                    subtext="Soma dos orçamentos no período"
                  />
                </div>
              </div>
            </ReportCard>

            <ReportCard title="Status dos Projetos" className="lg:col-span-1">
              <div className="h-48">
                <InteractiveBarChart data={projectMetrics.projectStatusChartData} format="number" />
              </div>
            </ReportCard>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-bold text-text-primary mb-6">
            Aquisição de Clientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ReportCard title="Funil de Propostas">
              <StatCard
                label="Propostas convertidas"
                value={`${acquisitionMetrics.conversionRate.toFixed(1)}%`}
              />
            </ReportCard>
            <ReportCard title="Novos Clientes">
              <StatCard label="Clientes no período" value={acquisitionMetrics.newClientsCount} />
            </ReportCard>
            <ReportCard title="Gasto com Marketing">
              <StatCard
                label="Investimento no período"
                value={formatCurrency(acquisitionMetrics.marketingSpend)}
              />
            </ReportCard>
            <ReportCard title="CAC">
              <StatCard
                label="Custo por aquisição"
                value={formatCurrency(acquisitionMetrics.cac)}
              />
            </ReportCard>
            <ReportCard title="Leads Convertidos por Origem" className="lg:col-span-4">
              <InteractiveBarChart data={acquisitionMetrics.leadSourceChartData} format="number" />
            </ReportCard>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RelatoriosPage;
