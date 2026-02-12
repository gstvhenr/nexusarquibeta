import React from 'react';
import type { Project, Proposal, MarketingActivity, AgendaEvent, Installment } from '../types';
import {
  formatCurrency,
  formatDateDayMonth,
  parseDateString,
  getDeadlineInfo,
} from '../utils/formatters';
import { getProjectLumpSumValue } from '../utils/projectFinancials';
import { CashIcon, AgendaIcon, MailIcon, BullhornIcon } from '../components/ui/icons';

// --- DASHBOARD SERVICE FUNCTIONS ---

type OverduePayment = {
  type: 'lump' | 'installment';
  project: Project;
  payment: Project['financials'] | Installment;
};

const getOverduePaymentDate = (payment: OverduePayment['payment']): string | null => {
  if ('number' in payment) {
    return payment.dueDate;
  }
  return payment.lumpSumDueDate || null;
};

type FocusItem = {
  id: string; // The unique ID for dismissal
  type: string;
  tag: string;
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  description: string;
  path: string;
};

/**
 * Input -> Output:
 * - input: projeto com seções e tarefas.
 * - output: progresso percentual + contagem de tarefas concluídas/total.
 * Example:
 * const summary = calculateProjectProgress(project);
 */
export const calculateProjectProgress = (
  project: Project,
): { progress: number; completedCount: number; totalCount: number } => {
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
) => {
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
      return { ...p, progress, deadlineInfo: getDeadlineInfo(p.deadline) };
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
export const getFinancialOverview = (projects: Project[]) => {
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

/**
 * Input -> Output:
 * - input: projetos, propostas, atividades de marketing e eventos.
 * - output: lista priorizada de itens de foco com tag, descrição e rota de ação.
 * Example:
 * const focusItems = determineFocusItems(projects, proposals, marketingActivities, agendaEvents);
 */
export const determineFocusItems = (
  projects: Project[],
  proposals: Proposal[],
  marketingActivities: MarketingActivity[],
  agendaEvents: AgendaEvent[],
): FocusItem[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allItems: FocusItem[] = [];

  // 1. Overdue Payments (Highest Priority)
  const overduePayments: OverduePayment[] = [];
  for (const project of projects) {
    if (project.financials) {
      if (
        project.financials.paymentType === 'vista' &&
        project.financials.lumpSumStatus === 'Em aberto' &&
        project.financials.lumpSumDueDate
      ) {
        const dueDate = parseDateString(project.financials.lumpSumDueDate);
        if (dueDate && dueDate < today) {
          overduePayments.push({ type: 'lump' as const, project, payment: project.financials });
        }
      } else if (
        project.financials.paymentType === 'parcelado' &&
        project.financials.installments
      ) {
        project.financials.installments.forEach((inst) => {
          const dueDate = parseDateString(inst.dueDate);
          if (!inst.paid && dueDate && dueDate < today) {
            overduePayments.push({ type: 'installment' as const, project, payment: inst });
          }
        });
      }
    }
  }
  overduePayments
    .sort((a, b) => {
      const dateA =
        parseDateString(getOverduePaymentDate(a.payment))?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const dateB =
        parseDateString(getOverduePaymentDate(b.payment))?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    })
    .forEach((payment) => {
      if (payment.type === 'lump') {
        const financials = payment.payment as Project['financials'];
        allItems.push({
          id: `payment_overdue_lump_${payment.project.id}`,
          type: 'payment_overdue',
          tag: 'FINANCEIRO URGENTE',
          icon: React.createElement(CashIcon),
          title: `Pagamento do projeto "${payment.project.name}" está atrasado.`,
          description: `Valor de ${formatCurrency(getProjectLumpSumValue(payment.project))} venceu em ${formatDateDayMonth(financials.lumpSumDueDate)}.`,
          path: '/financeiro/recebiveis',
        });
      } else {
        const installment = payment.payment as Installment;
        allItems.push({
          id: `payment_overdue_inst_${payment.project.id}_${installment.id}`,
          type: 'payment_overdue',
          tag: 'FINANCEIRO URGENTE',
          icon: React.createElement(CashIcon),
          title: `Parcela do projeto "${payment.project.name}" está atrasada.`,
          description: `Parcela ${installment.number} de ${formatCurrency(installment.value)} venceu em ${formatDateDayMonth(installment.dueDate)}.`,
          path: '/financeiro/recebiveis',
        });
      }
    });

  // 2. Critical Project Deadlines
  projects
    .filter((p) => p.status === 'Em Andamento' && p.deadline)
    .map((p) => ({ ...p, deadlineInfo: getDeadlineInfo(p.deadline) }))
    .filter((p) => p.deadlineInfo.diffDays >= 0 && p.deadlineInfo.diffDays <= 3)
    .sort((a, b) => a.deadlineInfo.diffDays - b.deadlineInfo.diffDays)
    .forEach((project) => {
      allItems.push({
        id: `deadline_${project.id}`,
        type: 'deadline',
        tag: 'PRAZO DE PROJETO',
        icon: React.createElement(AgendaIcon),
        title: `Prazo do projeto "${project.name}" se aproxima.`,
        description: `A entrega está marcada para ${project.deadlineInfo.text}. Faltam ${project.deadlineInfo.diffDays} dia(s).`,
        path: `/projetos/${project.id}`,
      });
    });

  // 3. Overdue/Upcoming Marketing
  const pendingMarketingData = marketingActivities.filter(
    (a) => a.status === 'Pendente' || a.status === 'Em Andamento',
  );
  const overdueMarketingTask = pendingMarketingData.find((a) => {
    const dueDate = parseDateString(a.dueDate);
    return dueDate && dueDate < today;
  });
  if (overdueMarketingTask) {
    allItems.push({
      id: `marketing_overdue_${overdueMarketingTask.id}`,
      type: 'marketing_overdue',
      tag: 'MARKETING ATRASADO',
      icon: React.createElement(BullhornIcon),
      title: `Tarefa de marketing "${overdueMarketingTask.title}" está atrasada.`,
      description: `O prazo era para ${formatDateDayMonth(overdueMarketingTask.dueDate)}.`,
      path: '/gestao-marketing/conteudos',
    });
  } else {
    pendingMarketingData
      .map((a) => ({ ...a, deadlineInfo: getDeadlineInfo(a.dueDate) }))
      .filter((a) => a.deadlineInfo.diffDays >= 0 && a.deadlineInfo.diffDays <= 3)
      .sort((a, b) => a.deadlineInfo.diffDays - b.deadlineInfo.diffDays)
      .forEach((task) => {
        allItems.push({
          id: `marketing_deadline_${task.id}`,
          type: 'marketing_deadline',
          tag: 'PRAZO DE MARKETING',
          icon: React.createElement(BullhornIcon),
          title: `Prazo da tarefa "${task.title}" se aproxima.`,
          description: `O prazo é em ${task.deadlineInfo.diffDays} dia(s).`,
          path: '/gestao-marketing/conteudos',
        });
      });
  }

  // 4. Old Pending Proposals
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(new Date().getDate() - 7);
  proposals
    .filter((p) => {
      const proposalDate = parseDateString(p.date);
      return p.status === 'Pendente' && !p.archived && proposalDate && proposalDate < sevenDaysAgo;
    })
    .sort(
      (a, b) =>
        (parseDateString(a.date)?.getTime() || 0) - (parseDateString(b.date)?.getTime() || 0),
    )
    .forEach((proposal) => {
      allItems.push({
        id: `proposal_followup_${proposal.id}`,
        type: 'proposal_followup',
        tag: 'ACOMPANHAMENTO',
        icon: React.createElement(MailIcon),
        title: `Fazer follow-up da proposta "${proposal.name}".`,
        description: `Proposta pendente há mais de 7 dias, enviada em ${formatDateDayMonth(proposal.date)}.`,
        path: `/propostas/${proposal.id}`,
      });
    });

  // 5. Upcoming Events Today
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  agendaEvents
    .filter(
      (e) =>
        e.date === todayStr &&
        new Date(`${e.date}T${e.time}`) >= now &&
        !e.isDeadlineEvent &&
        !e.isFinancialEvent,
    )
    .sort((a, b) => a.time.localeCompare(b.time))
    .forEach((event) => {
      allItems.push({
        id: `event_today_${event.id}`,
        type: 'event_today',
        tag: 'COMPROMISSO HOJE',
        icon: React.createElement(AgendaIcon),
        title: `Hoje às ${event.time}: ${event.title}`,
        description: `Não se esqueça do seu compromisso. ${event.projectName ? `Relacionado ao projeto ${event.projectName}.` : ''}`,
        path: '/agenda',
      });
    });

  return allItems;
};
