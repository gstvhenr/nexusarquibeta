import type {
  AgendaEvent,
  Project,
  Purchase,
  MarketingActivity,
  Prospect,
  ProfessionalExpense,
  Commission,
  ManualIncome,
} from '../types';
import type { AppData } from './infrastructure/api';
import { formatCurrency, parseDateString } from '../utils/formatters';

/**
 * Input -> Output:
 * - input: dados da aplicação e listas de eventos/projetos/financeiro.
 * - output: utilitários para consolidar e consultar eventos da agenda.
 * Example:
 * const events = agendaService.getUnifiedEvents(data);
 */
export const agendaService = {
  // Helper to merge all disparate data sources into a unified AgendaEvent stream
  getUnifiedEvents(data: AppData): AgendaEvent[] {
    const toDatePart = (rawDate: string | null | undefined): string | null => {
      if (!rawDate) return null;
      return rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
    };

    const {
      agendaEvents = [],
      projects = [],
      marketingActivities = [],
      prospects = [],
      manualExpenses = [],
      commissions = [],
      manualIncomes = [],
    } = data;

    const generatedEvents: AgendaEvent[] = [];

    // 1. Sync Project Events (Deadlines, Milestones, Installments)
    // We iterate projects to generate dynamic events that might not be saved in agendaEvents state yet
    projects.forEach((project) => {
      if (project.archived) return;

      // Project Deadline
      if (project.deadline) {
        const deadlineDate = toDatePart(project.deadline);
        if (!deadlineDate) return;
        generatedEvents.push({
          id: `proj_dl_${project.id}`,
          title: `Entrega Final: ${project.name}`,
          date: deadlineDate,
          time: '17:00',
          type: 'Prazo de Entrega',
          description: `Prazo final contratual.`,
          projectId: project.id,
          projectName: project.name,
          priority: 5,
          recurrence: 'none',
          isDeadlineEvent: true,
          completed: false, // Dynamic events calculate completion differently or are read-only
        });
      }

      // Project Milestones (Additional Deadlines)
      project.additionalDeadlines?.forEach((ad) => {
        const milestoneDate = toDatePart(ad.date);
        if (!milestoneDate) return;
        generatedEvents.push({
          id: `proj_ms_${ad.id}`,
          title: `Marco: ${ad.title}`,
          date: milestoneDate,
          time: '12:00',
          type: 'Desenvolvimento de Projeto',
          description: `Marco intermediário do projeto ${project.name}`,
          projectId: project.id,
          projectName: project.name,
          priority: 4,
          recurrence: 'none',
        });
      });

      // Project Installments (Receivables)
      project.financials.installments?.forEach((inst) => {
        if (!inst.paid) {
          const dueDate = toDatePart(inst.dueDate);
          if (!dueDate) return;
          generatedEvents.push({
            id: `proj_inst_${inst.id}`,
            title: `Receber Parcela ${inst.number}: ${project.name}`,
            date: dueDate,
            time: '09:00',
            type: 'Recebimento',
            description: `Valor: ${formatCurrency(inst.value)}`,
            projectId: project.id,
            projectName: project.name,
            priority: 4,
            recurrence: 'none',
            isFinancialEvent: 'income',
          });
        }
      });
    });

    // 2. Marketing Activities
    marketingActivities.forEach((activity) => {
      if (activity.status !== 'Concluído' && activity.dueDate) {
        const dueDate = toDatePart(activity.dueDate);
        if (!dueDate) return;
        generatedEvents.push({
          id: `mkt_${activity.id}`,
          title: `Marketing: ${activity.title}`,
          date: dueDate,
          time: activity.dueDate.includes('T')
            ? activity.dueDate.split('T')[1].substring(0, 5)
            : '10:00',
          type: 'Reunião de Marketing', // Mapping to closest type
          description: `${activity.contentType} - ${activity.description || ''}`,
          projectId: activity.linkedProjectId,
          projectName: activity.linkedProjectName,
          priority: 3,
          recurrence: 'none',
          completed: false,
        });
      }
    });

    // 3. Prospects Follow-up (Radar)
    prospects.forEach((prospect) => {
      if (prospect.status === 'Em Aberto' && !prospect.archived) {
        const startDate = new Date(prospect.startDate);
        const followUpDate = new Date(startDate);
        followUpDate.setDate(startDate.getDate() + prospect.followUpDays);

        generatedEvents.push({
          id: `prosp_${prospect.id}`,
          title: `Follow-up: ${prospect.name}`,
          date: followUpDate.toISOString().split('T')[0],
          time: '09:00',
          type: 'Reunião com Cliente',
          description: `Retorno de contato (Radar). Interesse: ${prospect.interest}.`,
          priority: prospect.priority === 'Alta' ? 5 : 3,
          recurrence: 'none',
          clientName: prospect.name,
        });
      }
    });

    // 4. Manual Expenses (Payables)
    manualExpenses.forEach((expense) => {
      if (expense.status === 'Pendente') {
        const dueDate = toDatePart(expense.dueDate);
        if (!dueDate) return;
        generatedEvents.push({
          id: `exp_${expense.id}`,
          title: `Pagar: ${expense.description}`,
          date: dueDate,
          time: '08:00',
          type: 'Pagamento de Custo',
          description: `Categoria: ${expense.category}. Valor: ${formatCurrency(expense.value)}`,
          priority: 4,
          recurrence: 'none',
          isFinancialEvent: 'expense',
        });
      }
    });

    // 5. Commissions (Receivables)
    commissions.forEach((comm) => {
      if (comm.status === 'Pendente') {
        const date = comm.expectedPaymentDate || comm.saleDate; // Fallback to sale date if expected not set
        const dueDate = toDatePart(date);
        if (!dueDate) return;
        generatedEvents.push({
          id: `comm_${comm.id}`,
          title: `Comissão: ${comm.supplierName}`,
          date: dueDate,
          time: '10:00',
          type: 'Recebimento',
          description: `Recebimento de comissão ref. cliente ${comm.clientName}. Valor: ${formatCurrency(comm.commissionValue)}`,
          priority: 3,
          recurrence: 'none',
          isFinancialEvent: 'income',
        });
      }
    });

    // 6. Manual Incomes
    manualIncomes.forEach((inc) => {
      if (inc.status === 'Pendente') {
        const dueDate = toDatePart(inc.date);
        if (!dueDate) return;
        generatedEvents.push({
          id: `inc_${inc.id}`,
          title: `Receber: ${inc.description}`,
          date: dueDate,
          time: '09:00',
          type: 'Recebimento',
          description: `Categoria: ${inc.category}. Valor: ${formatCurrency(inc.value)}`,
          priority: 3,
          recurrence: 'none',
          isFinancialEvent: 'income',
        });
      }
    });

    // Filter out manual agenda events that might duplicate the logic above (optional, but good for safety)
    // For now, we assume user-created agenda events (in `agendaEvents` array) are distinct manual entries.
    // We combine the manual array with the generated array.

    return [...agendaEvents, ...generatedEvents];
  },

  getEventsForDay(targetDate: Date, allEvents: AgendaEvent[]): AgendaEvent[] {
    const year = targetDate.getFullYear();
    const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const day = targetDate.getDate().toString().padStart(2, '0');
    const targetDateKey = `${year}-${month}-${day}`;

    const targetDayOfWeek = targetDate.getDay();

    const eventsForDay = allEvents.filter((event) => {
      if (!event.date) return false;

      // Handle ISO string safety
      const dateStr = event.date.includes('T') ? event.date.split('T')[0] : event.date;
      const eventStartDate = parseDateString(dateStr);

      if (!eventStartDate) return false;

      // Ensure event start date is not after target date
      if (eventStartDate > targetDate) return false;

      if (event.recurrence === 'none' || !event.recurrence) {
        return dateStr === targetDateKey;
      }

      if (event.recurrence === 'weekly') {
        return eventStartDate.getDay() === targetDayOfWeek;
      }

      if (event.recurrence === 'monthly') {
        // Be careful with end of month days (e.g. 31st)
        return eventStartDate.getDate() === targetDate.getDate();
      }

      return false;
    });

    return eventsForDay;
  },

  isEventInPast(event: AgendaEvent): boolean {
    const now = new Date();
    const dateStr = event.date.includes('T') ? event.date.split('T')[0] : event.date;
    const eventDateTime = new Date(`${dateStr}T${event.timeEnd || event.time || '23:59'}`);
    return !isNaN(eventDateTime.getTime()) && eventDateTime < now;
  },

  syncProjectEventsWithAgenda(
    project: Project | null,
    currentEvents: AgendaEvent[],
    projectIdToDelete?: string,
  ): AgendaEvent[] {
    const projectId = project?.id ?? projectIdToDelete;
    if (!projectId) return currentEvents;

    // Remove old auto-generated events for this project from the persistent store
    // to avoid duplicates with the new dynamic system.
    return currentEvents.filter(
      (e) =>
        e.projectId !== projectId ||
        (e.projectId === projectId && !e.isDeadlineEvent && !e.isFinancialEvent),
    );
  },
};
