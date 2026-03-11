import type { Project, Proposal, MarketingActivity, AgendaEvent, Installment } from '../types';
import {
  formatCurrency,
  formatDateDayMonth,
  getDeadlineInfo,
  getTodayDateOnly,
  parseDateString,
} from '../utils/formatters';
import { getProjectLumpSumValue } from '../utils/projectFinancials';

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

type FocusItemIconKey = 'cash' | 'agenda' | 'bullhorn' | 'mail';

type FocusItem = {
  id: string; // The unique ID for dismissal
  type: string;
  tag: string;
  iconKey: FocusItemIconKey;
  title: string;
  description: string;
  path: string;
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
          iconKey: 'cash',
          title: `Pagamento do projeto "${payment.project.name}" está atrasado.`,
          description: `Valor de ${formatCurrency(getProjectLumpSumValue(payment.project))} venceu em ${formatDateDayMonth(financials.lumpSumDueDate)}.`,
          path: '/financeiro/historico?tipo=credit',
        });
      } else {
        const installment = payment.payment as Installment;
        allItems.push({
          id: `payment_overdue_inst_${payment.project.id}_${installment.id}`,
          type: 'payment_overdue',
          tag: 'FINANCEIRO URGENTE',
          iconKey: 'cash',
          title: `Parcela do projeto "${payment.project.name}" está atrasada.`,
          description: `Parcela ${installment.number} de ${formatCurrency(installment.value)} venceu em ${formatDateDayMonth(installment.dueDate)}.`,
          path: '/financeiro/historico?tipo=credit',
        });
      }
    });

  // 2. Critical Project Deadlines
  projects
    .filter((p) => p.status === 'Em Andamento' && p.deadline)
    .map((p) => ({ ...p, deadlineInfo: getDeadlineInfo(p.deadline, p.status === 'Concluído') }))
    .filter((p) => p.deadlineInfo.diffDays >= 0 && p.deadlineInfo.diffDays <= 3)
    .sort((a, b) => a.deadlineInfo.diffDays - b.deadlineInfo.diffDays)
    .forEach((project) => {
      allItems.push({
        id: `deadline_${project.id}`,
        type: 'deadline',
        tag: 'PRAZO DE PROJETO',
        iconKey: 'agenda',
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
      iconKey: 'bullhorn',
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
          iconKey: 'bullhorn',
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
        iconKey: 'mail',
        title: `Fazer follow-up da proposta "${proposal.name}".`,
        description: `Proposta pendente há mais de 7 dias, enviada em ${formatDateDayMonth(proposal.date)}.`,
        path: `/propostas/${proposal.id}`,
      });
    });

  // 5. Upcoming Events Today
  const todayStr = getTodayDateOnly();
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
        iconKey: 'agenda',
        title: `Hoje às ${event.time}: ${event.title}`,
        description: `Não se esqueça do seu compromisso. ${event.projectName ? `Relacionado ao projeto ${event.projectName}.` : ''}`,
        path: '/agenda',
      });
    });

  return allItems;
};
