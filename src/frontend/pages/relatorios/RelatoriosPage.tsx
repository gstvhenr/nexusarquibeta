import React, { useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
// Button import removed
import { Select } from '../../components/ui/Select';
import {
  StackedCoinsIcon,
  ProjetosIcon,
  UsersIcon,
  MarketingIconNew,
  SuprimentosIcon,
  CalendarPlusIcon,
} from '../../components/ui/icons';
import { useReportData } from '../../hooks/useReportData';
import { generateReport, type ReportFilter } from '../../services/reportService';
import { formatCurrency } from '../../utils/formatters';
import {
  DashboardSection,
  MetricCard,
  ProgressBar,
  StatRow,
  DonutChart,
  HorizontalBarList,
  InteractiveBarChart,
  SocialMediaReport,
} from '../../components/relatorios';

const FILTER_OPTIONS = [
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: '365', label: 'Este ano' },
  { value: '99999', label: 'Desde o início' },
  { value: 'custom', label: 'Personalizado' },
];

const TABS = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'financial', label: 'Financeiro' },
  { id: 'projects', label: 'Projetos' },
  { id: 'clients', label: 'Comercial' },
  { id: 'marketing', label: 'Marketing e Redes Sociais' },
  { id: 'supply', label: 'Suprimentos' },
  { id: 'operational', label: 'Operacional' },
];

export const RelatoriosPage: React.FC = () => {
  const rawData = useReportData();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [filter, setFilter] = useState<ReportFilter>({
    type: 'preset',
    days: 30,
    startDate: '',
    endDate: '',
  });

  const handleFilterChange = (value: string) => {
    if (value === 'custom') {
      setFilter((prev) => ({ ...prev, type: 'custom' }));
    } else {
      setFilter({
        type: 'preset',
        days: parseInt(value, 10),
        startDate: '',
        endDate: '',
      });
    }
  };

  const report = useMemo(() => generateReport(rawData, filter), [rawData, filter]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader title="Painel de Relatórios" subtitle="Visão consolidada do ERP">
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <Select
            value={filter.type === 'preset' ? filter.days.toString() : 'custom'}
            onChange={(e) => handleFilterChange(e.target.value)}
            options={FILTER_OPTIONS}
            className="w-full sm:w-48"
          />
          {filter.type === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) => setFilter((p) => ({ ...p, startDate: e.target.value }))}
                className="px-3 py-2 bg-surface text-text-primary border border-border-color rounded-ui text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-text-secondary text-sm">até</span>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) => setFilter((p) => ({ ...p, endDate: e.target.value }))}
                className="px-3 py-2 bg-surface text-text-primary border border-border-color rounded-ui text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}
        </div>
      </PageHeader>

      <div className="border-b border-border-color mb-8">
        <nav
          className="flex items-center gap-8 overflow-x-auto no-scrollbar pb-px"
          aria-label="Tabs"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap pb-4 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-color'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="animate-fade-in-up">
        {activeTab === 'overview' && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Receita Total"
              value={formatCurrency(report.overviewMetrics.totalRevenue)}
              trend={report.overviewMetrics.totalRevenue > 0 ? 'up' : 'neutral'}
              trendLabel={report.overviewMetrics.totalRevenue > 0 ? 'Positivo' : '-'}
              accentColor="var(--color-success)"
            />
            <MetricCard
              label="Custos e Despesas"
              value={formatCurrency(report.overviewMetrics.totalCosts)}
              trend="down"
              trendLabel="Saídas"
              accentColor="var(--color-error)"
            />
            <MetricCard
              label="Lucratividade"
              value={formatCurrency(report.overviewMetrics.netProfit)}
              subtext="Pós-custos"
              accentColor="var(--color-info)"
            />
            <MetricCard
              label="Projetos Ativos"
              value={report.overviewMetrics.activeProjectCount}
              subtext={`De ${report.overviewMetrics.totalClientCount} clientes`}
            />
          </section>
        )}

        {activeTab === 'financial' && (
          <DashboardSection title="Desempenho Financeiro" icon={<StackedCoinsIcon />}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-surface rounded-card shadow-soft p-5 border border-border-color">
                <h3 className="text-sm font-bold text-text-secondary mb-4">
                  Receita Mensal (Recorrente vs Projetos)
                </h3>
                <InteractiveBarChart
                  data={report.financialMetrics.revenueChartData}
                  format="currency"
                />
              </div>
              <div className="space-y-4">
                <MetricCard
                  label="Receita de Projetos"
                  value={formatCurrency(report.financialMetrics.revenueFromProjects)}
                  className="border border-border-color shadow-none"
                />
                <MetricCard
                  label="Comissões Recebidas"
                  value={formatCurrency(report.financialMetrics.revenueFromCommissions)}
                  className="border border-border-color shadow-none"
                />
                <MetricCard
                  label="Fluxo Gestão de Caixa"
                  value={formatCurrency(
                    report.financialMetrics.periodCredits - report.financialMetrics.periodExpenses,
                  )}
                  subtext={`${formatCurrency(report.financialMetrics.periodCredits)} 🟢 | ${formatCurrency(report.financialMetrics.periodExpenses)} 🔴`}
                  className="border border-border-color shadow-none"
                />
              </div>
            </div>
          </DashboardSection>
        )}

        {activeTab === 'projects' && (
          <DashboardSection title="Painel de Projetos" icon={<ProjetosIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard label="Projetos Concluídos" value={report.projectMetrics.concluded} />
              <MetricCard label="Em Andamento" value={report.projectMetrics.inProgress} />
              <MetricCard
                label="Ticket Médio"
                value={formatCurrency(report.projectMetrics.averageTicket)}
              />
              <MetricCard
                label="Valor Contratado"
                value={formatCurrency(report.projectMetrics.totalProjectValue)}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface rounded-card p-5 border border-border-color shadow-soft">
                <h3 className="text-sm font-bold text-text-secondary mb-6">Status dos Projetos</h3>
                <DonutChart data={report.projectMetrics.projectStatusChartData} height={200} />
              </div>
              <div className="bg-surface rounded-card p-5 border border-border-color shadow-soft flex flex-col justify-center">
                <h3 className="text-sm font-bold text-text-secondary mb-6">Métricas de Produção</h3>
                <ProgressBar
                  label="Taxa de Conclusão de Projetos"
                  value={report.projectMetrics.conclusionRate}
                  color="bg-emerald-500"
                />
                <div className="mt-8">
                  <ProgressBar
                    label={`Tarefas Concluídas (${report.projectMetrics.completedTasks}/${report.projectMetrics.totalTasks})`}
                    value={report.projectMetrics.taskCompletionRate}
                    color="bg-blue-500"
                  />
                </div>
              </div>
            </div>
          </DashboardSection>
        )}

        {activeTab === 'clients' && (
          <DashboardSection title="Clientes e Comercial" icon={<UsersIcon />}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <MetricCard label="Total de Clientes" value={report.clientMetrics.totalActive} />
                <MetricCard label="Novos no Período" value={report.clientMetrics.newInPeriod} />
                <div className="bg-surface p-4 rounded-card border border-border-color shadow-soft">
                  <ProgressBar
                    label="Conversão de Propostas"
                    value={report.clientMetrics.conversionRate}
                  />
                  <p className="text-xs text-text-muted mt-2">
                    {report.clientMetrics.convertedProposals} convertidas de{' '}
                    {report.clientMetrics.totalProposals} enviadas
                  </p>
                </div>
              </div>
              <div className="bg-surface rounded-card p-5 border border-border-color shadow-soft">
                <h3 className="text-sm font-bold text-text-secondary mb-6">Tipos de Clientes</h3>
                <DonutChart
                  data={[
                    { label: 'Pessoa Física', value: report.clientMetrics.clientsByType.pf },
                    { label: 'Pessoa Jurídica', value: report.clientMetrics.clientsByType.pj },
                  ]}
                  height={180}
                />
                <div className="mt-6 pt-4 border-t border-border-color">
                  <StatRow
                    items={[
                      { label: 'Ativos', value: report.clientMetrics.clientsByStatus.active },
                      {
                        label: 'Potenciais',
                        value: report.clientMetrics.clientsByStatus.potential,
                      },
                      { label: 'Inativos', value: report.clientMetrics.clientsByStatus.inactive },
                    ]}
                  />
                </div>
              </div>
              <div className="bg-surface rounded-card p-5 border border-border-color shadow-soft">
                <h3 className="text-sm font-bold text-text-secondary mb-6">
                  Top Origem de Leads (Rate)
                </h3>
                <HorizontalBarList data={report.clientMetrics.leadSourceChartData} maxItems={5} />
              </div>
            </div>
          </DashboardSection>
        )}

        {activeTab === 'marketing' && (
          <DashboardSection title="Marketing e Redes Sociais" icon={<MarketingIconNew />}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <MetricCard
                label="CAC (Custo de Aquisição)"
                value={formatCurrency(report.clientMetrics.cac)}
                subtext={`Gasto MKT: ${formatCurrency(report.marketingMetrics.totalSpend)}`}
              />
              <MetricCard
                label="Conteúdos Publicados"
                value={report.marketingMetrics.totalContentCount}
                subtext="Nas redes sociais"
              />
              <MetricCard
                label="Prospects"
                value={report.clientMetrics.totalProspects}
                subtext={`${report.clientMetrics.prospectsByStatus.converted} convertidos / ${report.clientMetrics.prospectsByStatus.open} em aberto`}
              />
            </div>
            <div className="w-full">
              <SocialMediaReport networks={report.marketingMetrics.socialNetworks} />
            </div>
          </DashboardSection>
        )}

        {activeTab === 'supply' && (
          <DashboardSection title="Fornecedores e Prestadores" icon={<SuprimentosIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Fornecedores" value={report.supplyChainMetrics.supplierCount} />
              <MetricCard
                label="Cotações Abertas"
                value={report.supplyChainMetrics.quotationsByStatus.open}
                subtext={`De ${report.supplyChainMetrics.totalQuotations} solicitadas`}
              />
              <MetricCard
                label="Freelancers Ativos"
                value={report.supplyChainMetrics.freelancerCount}
              />
              <MetricCard
                label="Custo de Terceirização"
                value={formatCurrency(report.supplyChainMetrics.totalHiredServicesCost)}
              />
            </div>
          </DashboardSection>
        )}

        {activeTab === 'operational' && (
          <DashboardSection title="Operacional e Rotina" icon={<CalendarPlusIcon />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface rounded-card p-5 border border-border-color shadow-soft flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Próximos 7 Dias</h3>
                  <p className="text-sm text-text-secondary mt-1">Fique de olho nestes números</p>
                </div>
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-warning">
                      {report.operationalMetrics.upcomingDeadlines}
                    </span>
                    <span className="text-xs font-semibold text-text-secondary mt-1">
                      PRAZOS PROJETOS
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-info">
                      {report.operationalMetrics.futureEventsCount}
                    </span>
                    <span className="text-xs font-semibold text-text-secondary mt-1">
                      EVENTOS AGENDA
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-surface rounded-card p-5 border border-border-color shadow-soft">
                <h3 className="text-sm font-bold text-text-secondary mb-4">
                  Tipos de Eventos Recorrentes
                </h3>
                <HorizontalBarList
                  data={report.operationalMetrics.eventTypeChartData}
                  maxItems={4}
                />
              </div>
            </div>
          </DashboardSection>
        )}
      </div>
    </div>
  );
};

export default RelatoriosPage;
