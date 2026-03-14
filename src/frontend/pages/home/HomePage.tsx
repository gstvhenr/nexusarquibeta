import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoreData, useMarketingData, useSystemData } from '../../context/DataContext';
import {
  ProposalIcon,
  BullhornIcon,
  CashIcon,
  AgendaIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertIcon,
} from '../../components/ui';
import {
  determineFocusItems,
  getDashboardKPIs,
  getUpcomingEvents,
  getActiveProjects,
  getFinancialOverview,
  getPendingMarketingTasks,
} from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';

import { useUnifiedEvents } from '../../hooks/useUnifiedEvents';

const DEADLINE_STATUS_CLASS = {
  overdue: 'text-error font-bold',
  soon: 'text-warning font-bold',
  ok: 'text-text-primary',
  none: 'text-text-secondary',
} as const;

const KPIBigCard: (props: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
  onClick: () => void;
}) => React.ReactNode = ({ label, value, icon, color, subtext, onClick }) => (
  <div
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    role="button"
    tabIndex={0}
    className="bg-surface rounded-2xl shadow-soft p-5 border border-border-color/50 flex flex-col justify-between h-32 cursor-pointer hover:shadow-lifted hover:-translate-y-1 transition-all group relative overflow-hidden"
  >
    <div
      className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none group-hover:scale-150 transition-transform duration-500`}
    ></div>
    <div className="flex justify-between items-start z-10">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>{icon}</div>
    </div>
    <div className="z-10">
      <p className="text-3xl font-bold font-sans text-text-primary">{value}</p>
      <p className="font-semibold text-text-secondary text-sm">{label}</p>
      {subtext && <p className="text-[10px] text-text-secondary mt-1 opacity-70">{subtext}</p>}
    </div>
  </div>
);

const HomePage: () => React.ReactNode = () => {
  const navigate = useNavigate();
  const coreData = useCoreData();
  const marketingData = useMarketingData();
  const systemData = useSystemData();

  const { projects, proposals } = coreData;
  const { marketingActivities } = marketingData;
  const { dismissedFocusItems, setDismissedFocusItems } = systemData;

  // Get unified events including Marketing, Finance, etc. for the dashboard agenda
  const unifiedEvents = useUnifiedEvents();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia, Rafael';
    if (hour < 18) return 'Boa tarde, Rafael';
    return 'Boa noite, Rafael';
  }, []);

  // --- Data Calculation ---
  const kpiData = useMemo(
    () => getDashboardKPIs(projects, proposals, marketingActivities),
    [projects, proposals, marketingActivities],
  );
  const upcomingEvents = useMemo(() => getUpcomingEvents(unifiedEvents), [unifiedEvents]);
  const activeProjects = useMemo(() => getActiveProjects(projects), [projects]);
  const financialOverview = useMemo(() => getFinancialOverview(projects), [projects]);
  const pendingMarketingTasks = useMemo(
    () => getPendingMarketingTasks(marketingActivities),
    [marketingActivities],
  );

  const allFocusItems = useMemo(() => {
    return determineFocusItems(projects, proposals, marketingActivities, unifiedEvents);
  }, [projects, proposals, marketingActivities, unifiedEvents]);

  const activeFocusItem = useMemo(() => {
    return allFocusItems.find((item) => !dismissedFocusItems.includes(item.id));
  }, [allFocusItems, dismissedFocusItems]);

  // Format current date for display
  const todayStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Header Section with Date */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-text-primary">
            {greeting}
          </h1>
          <p className="text-text-secondary mt-1 capitalize">{todayStr}</p>
        </div>
      </div>

      {/* Critical Alert "Hero" Section */}
      {activeFocusItem ? (
        <div
          onClick={() => navigate(activeFocusItem.path)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate(activeFocusItem.path);
            }
          }}
          role="button"
          tabIndex={0}
          className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-error p-6 rounded-r-xl shadow-sm flex items-start gap-5 cursor-pointer transition-all hover:shadow-md group relative overflow-hidden"
        >
          <div className="p-3 bg-white dark:bg-black/30 rounded-full text-error shadow-sm z-10 group-hover:scale-110 transition-transform">
            <AlertIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 z-10">
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-error uppercase tracking-widest mb-1">
                {activeFocusItem.tag}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDismissedFocusItems((prev) => [...prev, activeFocusItem.id]);
                }}
                className="text-text-secondary hover:text-primary text-xs font-semibold hover:underline"
              >
                Dispensar
              </button>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-1">{activeFocusItem.title}</h2>
            <p className="text-text-secondary text-sm">{activeFocusItem.description}</p>
          </div>
        </div>
      ) : (
        // If no critical alerts, show a simplified "All Clear" or motivational status
        <div className="bg-surface border border-border-color p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-success/10 text-success rounded-full">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Tudo sob controle!</h2>
              <p className="text-sm text-text-secondary">
                Você não possui alertas críticos pendentes no momento.
              </p>
            </div>
          </div>
          {dismissedFocusItems.length > 0 && (
            <button
              onClick={() => setDismissedFocusItems([])}
              className="text-primary text-sm font-semibold hover:underline"
            >
              Rever dispensados
            </button>
          )}
        </div>
      )}

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <KPIBigCard
          label="Projetos Ativos"
          value={kpiData.activeProjects}
          icon={<AgendaIcon className="w-6 h-6" />}
          color="bg-primary text-primary"
          onClick={() => navigate('/projetos')}
        />
        <KPIBigCard
          label="Receber (30d)"
          value={kpiData.receivables}
          icon={<CashIcon className="w-6 h-6" />}
          color="bg-success text-success"
          subtext="Previsão de entrada"
          onClick={() => navigate('/financeiro/historico?tipo=credit')}
        />
        <KPIBigCard
          label="Propostas"
          value={kpiData.pendingProposals}
          icon={<ProposalIcon className="w-6 h-6" />}
          color="bg-warning text-warning"
          subtext="Em análise ou pendentes"
          onClick={() => navigate('/propostas')}
        />
        <KPIBigCard
          label="Marketing"
          value={kpiData.pendingMarketing}
          icon={<BullhornIcon className="w-6 h-6" />}
          color="bg-info text-info"
          subtext="Tarefas pendentes"
          onClick={() => navigate('/gestao-marketing')}
        />
      </div>

      {/* Split View: Projects vs. Today's Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Projects Pulse */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold text-secondary">Projetos em Andamento</h3>
            <button
              onClick={() => navigate('/projetos')}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Ver Todos
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activeProjects.length > 0 ? (
              activeProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projetos/${p.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/projetos/${p.id}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="bg-surface p-5 rounded-xl shadow-soft border border-border-color hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-sm text-text-secondary">{p.clientName}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold ${p.deadlineInfo.status === 'overdue' ? 'bg-error/10 text-error' : p.deadlineInfo.status === 'soon' ? 'bg-warning/10 text-warning' : 'bg-background text-text-secondary border border-border-color'}`}
                    >
                      {p.deadlineInfo.text}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-text-secondary">
                      <span>Progresso</span>
                      <span>{Math.round(p.progress)}%</span>
                    </div>
                    <progress
                      className="progress-bar progress-track-background progress-fill-primary-accent h-2 w-full rounded-full"
                      value={p.progress}
                      max={100}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-surface rounded-xl border border-dashed border-border-color">
                <p className="text-text-secondary">Nenhum projeto em andamento no momento.</p>
                <button
                  onClick={() => navigate('/propostas')}
                  className="text-primary font-bold text-sm mt-2 hover:underline"
                >
                  Converter uma proposta
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Daily Briefing & Quick Lists */}
        <div className="space-y-8">
          {/* Agenda */}
          <div className="bg-surface rounded-xl shadow-soft p-6 border border-border-color">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-color">
              <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                <AgendaIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-text-primary">Próximos Compromissos</h3>
            </div>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center min-w-[3rem] bg-background rounded p-1 border border-border-color">
                      <span className="text-xs font-bold text-text-secondary uppercase">
                        {new Date(event.date)
                          .toLocaleDateString('pt-BR', { weekday: 'short' })
                          .slice(0, 3)}
                      </span>
                      <span className="text-lg font-bold text-text-primary">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-text-primary line-clamp-1">
                        {event.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" /> {event.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-secondary text-center py-2">
                  Agenda livre para os próximos dias.
                </p>
              )}
              <button
                onClick={() => navigate('/agenda')}
                className="w-full py-2 text-xs font-bold text-secondary bg-secondary/5 hover:bg-secondary/10 rounded-lg transition-colors mt-2"
              >
                Ver Agenda Completa
              </button>
            </div>
          </div>

          {/* Financial Summary Mini */}
          <div className="bg-surface rounded-xl shadow-soft p-6 border border-border-color">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
              <CashIcon className="w-5 h-5 text-warning" /> Resumo Financeiro
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-error/5 rounded-lg border border-error/10">
                <span className="text-sm font-medium text-text-secondary">Vencido</span>
                <span className="font-bold text-error">
                  {formatCurrency(financialOverview.overdue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-warning/5 rounded-lg border border-warning/10">
                <span className="text-sm font-medium text-text-secondary">A Receber (7d)</span>
                <span className="font-bold text-warning">
                  {formatCurrency(financialOverview.upcoming)}
                </span>
              </div>
            </div>
          </div>

          {/* Pending Marketing Tasks */}
          {pendingMarketingTasks.length > 0 && (
            <div className="bg-surface rounded-xl shadow-soft p-6 border border-border-color">
              <h3 className="font-bold text-text-primary mb-4">Marketing Pendente</h3>
              <ul className="space-y-3">
                {pendingMarketingTasks.slice(0, 3).map((task) => (
                  <li key={task.id} className="text-sm flex justify-between items-center">
                    <span className="truncate pr-2 text-text-secondary">{task.title}</span>
                    <span
                      className={`text-[10px] font-bold whitespace-nowrap ${DEADLINE_STATUS_CLASS[task.deadlineInfo.status]}`}
                    >
                      {task.deadlineInfo.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
