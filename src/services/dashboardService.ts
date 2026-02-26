import type { Project, Proposal, MarketingActivity, AgendaEvent } from '../types';
import { formatCurrency, parseDateString, getDeadlineInfo } from '../utils/formatters';
import { getProjectLumpSumValue } from '../utils/projectFinancials';

// --- DASHBOARD SERVICE DTOs ---

/** Return type for calculateProjectProgress. */
export interface ProjectProgressSummary {
  progress: number;
  completedCount: number;
  totalCount: number;
}

/** Return type for getDashboardKPIs. */
export interface DashboardKPIs {
  activeProjects: number;
  pendingProposals: number;
  receivables: string;
  pendingMarketing: number;
}

/** Return type for getFinancialOverview. */
export interface FinancialOverviewResult {
  overdue: number;
  upcoming: number;
}

// --- DASHBOARD SERVICE FUNCTIONS ---

export * from './dashboardFocusItems';

/**
 * Input -> Output:
 * - input: projeto com seções e tarefas.
 * - output: progresso percentual + contagem de tarefas concluídas/total.
 * Example:
 * const summary = calculateProjectProgress(project);
 */
export const calculateProjectProgress = (project: Project): ProjectProgressSummary => {
  if (!project || !project.sections) return { progress: 0, completedCount: 0, totalCount: 0 };

  const allTasks = project.sections.flatMap((section) => section.tasks);
  const totalCount = allTasks.length;

  if (totalCount === 0) {
    return { progress: 0, completedCount: 0, totalCount: 0 };
  }

  const completedCount = allTasks.filter((task) => task.completed).length;
  const progress = (completedCount / totalCount) * 100;

  return { progress, completedCount, totalCount };
};

/**
 * Input -> Output:
 * - input: projetos, propostas e atividades de marketing.
 * - output: KPIs do dashboard (projetos ativos, propostas pendentes, recebíveis, pendências de marketing).
 * Example:
 * const kpis = getDashboardKPIs(projects, proposals, marketingActivities);
 */
export const getDashboardKPIs = (
  projects: Project[],
  proposals: Proposal[],
  marketingActivities: MarketingActivity[],
): DashboardKPIs => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const pendingProposals = proposals.filter(
    (p) => (p.status === 'Pendente' || p.status === 'Em Análise') && !p.archived,
  );
  const activeProjectsCount = projects.filter(
    (p) => p.status === 'Em Andamento' && !p.archived,
  ).length;
  const pendingMarketingCount = marketingActivities.filter(
    (a) => a.status === 'Pendente' || a.status === 'Em Andamento',
  ).length;

  let receivables = 0;
  projects.forEach((p) => {
    if (p.financials) {
      if (
        p.financials.paymentType === 'vista' &&
        p.financials.lumpSumStatus === 'Em aberto' &&
        p.financials.lumpSumDueDate
      ) {
        const dueDate = parseDateString(p.financials.lumpSumDueDate);
        if (dueDate && dueDate >= today && dueDate <= thirtyDaysFromNow)
          receivables += getProjectLumpSumValue(p);
      } else if (p.financials.paymentType === 'parcelado' && p.financials.installments) {
        p.financials.installments.forEach((inst) => {
          const dueDate = parseDateString(inst.dueDate);
          if (!inst.paid && dueDate && dueDate >= today && dueDate <= thirtyDaysFromNow)
            receivables += inst.value;
        });
      }
    }
  });

  return {
    activeProjects: activeProjectsCount,
    pendingProposals: pendingProposals.length,
    receivables: formatCurrency(receivables),
    pendingMarketing: pendingMarketingCount,
  };
};

/**
 * Input -> Output:
 * - input: lista de eventos da agenda.
 * - output: próximos 3 eventos futuros não concluídos.
 * Example:
 * const upcoming = getUpcomingEvents(events);
 */
export const getUpcomingEvents = (agendaEvents: AgendaEvent[]) => {
  const now = new Date();
  return agendaEvents
    .filter((e) => {
      if (e.completed) return false;
      const eventDateTime = new Date(`${e.date}T${e.time}`);
      return eventDateTime >= now;
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 3);
};

/**
 * Input -> Output:
 * - input: lista de projetos.
 * - output: até 4 projetos ativos com progresso e info de prazo derivados.
 * Example:
 * const active = getActiveProjects(projects);
 */
export const getActiveProjects = (projects: Project[]) => {
  return projects
    .filter((p) => p.status === 'Em Andamento' && !p.archived)
    .map((p) => {
      const { progress } = calculateProjectProgress(p);
      return {
        ...p,
        progress,
        deadlineInfo: getDeadlineInfo(p.deadline, p.status === 'Concluído'),
      };
    })
    .sort((a, b) => (a.deadlineInfo.diffDays ?? Infinity) - (b.deadlineInfo.diffDays ?? Infinity))
    .slice(0, 4);
};

/**
 * Input -> Output:
 * - input: lista de projetos.
 * - output: totais de financeiro em atraso e próximos 7 dias.
 * Example:
 * const overview = getFinancialOverview(projects);
 */
export const getFinancialOverview = (projects: Project[]): FinancialOverviewResult => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);
  let overdue = 0;
  let upcoming = 0;

  projects.forEach((p) => {
    if (p.financials && !p.archived) {
      const processPayment = (value: number, dateStr: string | null | undefined) => {
        if (!dateStr) return;
        const dueDate = parseDateString(dateStr);
        if (!dueDate) return;
        if (dueDate < today) {
          overdue += value;
        } else if (dueDate >= today && dueDate <= sevenDaysFromNow) {
          upcoming += value;
        }
      };
      if (p.financials.paymentType === 'vista' && p.financials.lumpSumStatus === 'Em aberto') {
        processPayment(getProjectLumpSumValue(p), p.financials.lumpSumDueDate);
      } else if (p.financials.paymentType === 'parcelado' && p.financials.installments) {
        p.financials.installments.forEach((inst) => {
          if (!inst.paid) {
            processPayment(inst.value, inst.dueDate);
          }
        });
      }
    }
  });
  return { overdue, upcoming };
};

/**
 * Input -> Output:
 * - input: atividades de marketing.
 * - output: até 5 tarefas pendentes/com andamento ordenadas por prazo.
 * Example:
 * const tasks = getPendingMarketingTasks(marketingActivities);
 */
export const getPendingMarketingTasks = (marketingActivities: MarketingActivity[]) => {
  return marketingActivities
    .filter((a) => a.status === 'Pendente' || a.status === 'Em Andamento')
    .map((a) => ({ ...a, deadlineInfo: getDeadlineInfo(a.dueDate) }))
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);
};
