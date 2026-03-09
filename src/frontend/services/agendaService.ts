import type {
  AgendaEvent,
  Commission,
  ManualIncome,
  MarketingActivity,
  ProfessionalExpense,
  Project,
  Prospect,
} from '../types';
import { formatCurrency, parseDateString, toDateOnlyString } from '../utils/formatters';

/** Narrowed input — only the fields getUnifiedEvents actually reads. */
export interface UnifiedEventsInput {
  agendaEvents: AgendaEvent[];
  projects: Project[];
  marketingActivities: MarketingActivity[];
  prospects: Prospect[];
  manualExpenses: ProfessionalExpense[];
  commissions: Commission[];
  manualIncomes: ManualIncome[];
}

/** Pre-computed date-key → events lookup. Built once per unifiedEvents change. */
export type EventIndex = Map<string, AgendaEvent[]>;

/**
 * Input -> Output:
 * - input: dados da aplicação e listas de eventos/projetos/financeiro.
 * - output: utilitários para consolidar e consultar eventos da agenda.
 * Example:
 * const events = agendaService.getUnifiedEvents(data);
 */
export const agendaService = {
  // Helper to merge all disparate data sources into a unified AgendaEvent stream
  getUnifiedEvents(data: UnifiedEventsInput): AgendaEvent[] {
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
        const startDate = parseDateString(prospect.startDate);
        if (!startDate) return;
        const followUpDate = new Date(startDate);
        followUpDate.setDate(startDate.getDate() + prospect.followUpDays);
        generatedEvents.push({
          id: `prosp_${prospect.id}`,
          title: `Follow-up: ${prospect.name}`,
          date: toDateOnlyString(followUpDate),
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

  /**
   * Builds a date-keyed index (YYYY-MM-DD → AgendaEvent[]) in a single O(E) pass.
   * Recurring events are expanded into all matching dates within [rangeStart, rangeEnd].
   * @param allEvents - unified event list
   * @param rangeStart - visible range start (inclusive)
   * @param rangeEnd - visible range end (inclusive)
   * @returns EventIndex — Map<string, AgendaEvent[]>
   */
  buildEventIndex(allEvents: AgendaEvent[], rangeStart: Date, rangeEnd: Date): EventIndex {
    const index: EventIndex = new Map();

    const toKey = (d: Date): string => {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const dd = d.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    const addToIndex = (key: string, event: AgendaEvent): void => {
      const bucket = index.get(key);
      if (bucket) {
        bucket.push(event);
      } else {
        index.set(key, [event]);
      }
    };

    for (const event of allEvents) {
      if (!event.date) continue;

      const dateStr = event.date.includes('T') ? event.date.split('T')[0] : event.date;
      const eventStartDate = parseDateString(dateStr);
      if (!eventStartDate) continue;

      if (event.recurrence === 'none' || !event.recurrence) {
        addToIndex(dateStr, event);
        continue;
      }

      // Expand recurring events into visible range
      const cursor = new Date(rangeStart);
      cursor.setHours(0, 0, 0, 0);
      const endTime = rangeEnd.getTime();

      while (cursor.getTime() <= endTime) {
        // Event start must not be after cursor
        if (cursor >= eventStartDate) {
          if (event.recurrence === 'weekly' && cursor.getDay() === eventStartDate.getDay()) {
            addToIndex(toKey(cursor), event);
          } else if (
            event.recurrence === 'monthly' &&
            cursor.getDate() === eventStartDate.getDate()
          ) {
            addToIndex(toKey(cursor), event);
          }
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return index;
  },

  /**
   * O(1) lookup from a pre-built EventIndex.
   * @param targetDate - the date to look up
   * @param index - pre-built EventIndex from buildEventIndex
   * @returns AgendaEvent[] (never undefined)
   */
  getEventsFromIndex(targetDate: Date, index: EventIndex): AgendaEvent[] {
    const y = targetDate.getFullYear();
    const m = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const d = targetDate.getDate().toString().padStart(2, '0');
    return index.get(`${y}-${m}-${d}`) ?? [];
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

  /**
   * Upserts an event into the list (pure — returns a new array).
   * If an event with the same id exists, replaces it; otherwise appends.
   * @param events - current events list
   * @param event - event to save
   * @returns AgendaEvent[]
   * @example agendaService.saveEvent(events, newEvent) → [...]
   */
  saveEvent(events: AgendaEvent[], event: AgendaEvent): AgendaEvent[] {
    const exists = events.some((e) => e.id === event.id);
    if (exists) return events.map((e) => (e.id === event.id ? event : e));
    return [...events, event];
  },

  /**
   * Removes an event by ID (pure — returns a new array).
   * @param events - current events list
   * @param eventId - ID to remove
   * @returns AgendaEvent[]
   * @example agendaService.deleteEvent(events, 'evt_1') → [...]
   */
  deleteEvent(events: AgendaEvent[], eventId: string): AgendaEvent[] {
    return events.filter((e) => e.id !== eventId);
  },

  /**
   * Toggles the completed flag on a specific event (pure — returns a new array).
   * @param events - current events list
   * @param eventId - ID of the event to toggle
   * @returns AgendaEvent[]
   * @example agendaService.toggleEventCompleted(events, 'evt_1') → [...]
   */
  toggleEventCompleted(events: AgendaEvent[], eventId: string): AgendaEvent[] {
    return events.map((e) => (e.id === eventId ? { ...e, completed: !e.completed } : e));
  },

  /**
   * Updates an event by ID (pure — returns a new array). Alias for saveEvent.
   * @param events - current events list
   * @param updatedEvent - event with updated fields
   * @returns AgendaEvent[]
   * @example agendaService.updateEvent(events, updatedEvent) → [...]
   */
  updateEvent(events: AgendaEvent[], updatedEvent: AgendaEvent): AgendaEvent[] {
    return this.saveEvent(events, updatedEvent);
  },
};
