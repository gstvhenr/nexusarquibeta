import { describe, expect, it } from 'vitest';
import type { AgendaEvent } from '../types';
import type { UnifiedEventsInput } from './agendaService';
import { agendaService } from './agendaService';
import { createTestProject, createTestCommission } from '../test/factories';

const buildBaseData = (): UnifiedEventsInput => ({
  agendaEvents: [],
  projects: [],
  marketingActivities: [],
  prospects: [],
  manualExpenses: [],
  commissions: [],
  manualIncomes: [],
});

describe('agendaService', () => {
  it('merges dynamic events from project and financial sources', () => {
    // Given
    const project = createTestProject({
      id: 'proj_1',
      name: 'Projeto Alfa',
      archived: false,
      deadline: '2026-02-20',
      additionalDeadlines: [{ id: 'ad_1', title: 'Entrega Preliminar', date: '2026-02-15' }],
      financials: {
        paymentType: 'parcelado',
        installments: [
          {
            id: 'inst_1',
            number: 1,
            dueDate: '2026-02-25',
            value: 500,
            paid: false,
            paymentDate: null,
          },
        ],
      },
    });

    const data: UnifiedEventsInput = {
      ...buildBaseData(),
      projects: [project],
      agendaEvents: [
        {
          id: 'manual_1',
          title: 'Reunião manual',
          date: '2026-02-10',
          time: '10:00',
          type: 'Reunião com Cliente',
          priority: 3,
          recurrence: 'none',
        },
      ],
      manualIncomes: [
        {
          id: 'inc_1',
          description: 'Consultoria',
          category: 'Consultoria',
          value: 300,
          date: '2026-02-19',
          status: 'Pendente',
        },
      ],
    };

    // When
    const result = agendaService.getUnifiedEvents(data);
    const ids = result.map((event) => event.id);

    // Then
    expect(ids).toContain('manual_1');
    expect(ids).toContain('proj_dl_proj_1');
    expect(ids).toContain('proj_ms_ad_1');
    expect(ids).toContain('proj_inst_inst_1');
    expect(ids).toContain('inc_inc_1');
  });

  it('filters events for day considering recurrence rules', () => {
    // Given
    const events: AgendaEvent[] = [
      {
        id: 'single',
        title: 'Evento único',
        date: '2026-02-13',
        time: '09:00',
        type: 'Outro',
        priority: 1,
        recurrence: 'none',
      },
      {
        id: 'weekly',
        title: 'Semanal',
        date: '2026-01-30',
        time: '10:00',
        type: 'Outro',
        priority: 1,
        recurrence: 'weekly',
      },
      {
        id: 'monthly',
        title: 'Mensal',
        date: '2026-01-13',
        time: '11:00',
        type: 'Outro',
        priority: 1,
        recurrence: 'monthly',
      },
    ];

    // When
    const targetDate = new Date('2026-02-13T12:00:00');
    const filtered = agendaService.getEventsForDay(targetDate, events);
    const ids = filtered.map((event) => event.id);

    // Then
    expect(ids).toEqual(expect.arrayContaining(['single', 'weekly', 'monthly']));
  });

  it('does not generate receivable events for paid installments or settled commissions', () => {
    // Given
    const project = createTestProject({
      id: 'proj_paid_1',
      name: 'Projeto Liquidado',
      archived: false,
      deadline: null,
      additionalDeadlines: [],
      financials: {
        paymentType: 'parcelado',
        installments: [
          {
            id: 'inst_paid_1',
            number: 1,
            dueDate: '2026-02-25',
            value: 750,
            paid: true,
            paymentDate: '2026-02-25',
          },
        ],
      },
    });

    const settledCommission = createTestCommission({
      id: 'comm_settled_1',
      saleDate: '2026-02-20',
      supplierName: 'Fornecedor Exemplo',
      clientName: 'Cliente Exemplo',
      commissionValue: 320,
      status: 'Recebido',
    });

    const data: UnifiedEventsInput = {
      ...buildBaseData(),
      projects: [project],
      commissions: [settledCommission],
    };

    // When
    const ids = agendaService.getUnifiedEvents(data).map((event) => event.id);

    // Then
    expect(ids).not.toContain('proj_inst_inst_paid_1');
    expect(ids).not.toContain('comm_comm_settled_1');
  });

  it('generates events for pending manual expenses and pending commissions', () => {
    // Given
    const pendingCommission = createTestCommission({
      id: 'comm_pending_1',
      saleDate: '2026-02-22',
      supplierName: 'Fornecedor Pendente',
      clientName: 'Cliente Pendente',
      commissionValue: 410,
      status: 'Pendente',
    });

    const data: UnifiedEventsInput = {
      ...buildBaseData(),
      manualExpenses: [
        {
          id: 'exp_pending_1',
          description: 'Licença de software',
          category: 'Software e Assinaturas',
          value: 199,
          dueDate: '2026-02-18',
          status: 'Pendente',
          paymentDate: null,
          isRecurring: false,
          source: 'Manual',
        },
      ],
      commissions: [pendingCommission],
    };

    // When
    const events = agendaService.getUnifiedEvents(data);
    const expenseEvent = events.find((event) => event.id === 'exp_exp_pending_1');
    const commissionEvent = events.find((event) => event.id === 'comm_comm_pending_1');

    // Then
    expect(expenseEvent?.isFinancialEvent).toBe('expense');
    expect(expenseEvent?.date).toBe('2026-02-18');
    expect(commissionEvent?.isFinancialEvent).toBe('income');
    expect(commissionEvent?.date).toBe('2026-02-22');
  });

  it('returns empty list for unsupported recurrence entries on day filter', () => {
    // Given
    const targetDate = new Date('2026-02-13T12:00:00');
    const events: AgendaEvent[] = [
      {
        id: 'unsupported',
        title: 'Recorrência não mapeada',
        date: '2026-02-13',
        time: '12:00',
        type: 'Outro',
        priority: 1,
        recurrence: 'unsupported' as unknown as AgendaEvent['recurrence'],
      },
    ];

    // When
    const filtered = agendaService.getEventsForDay(targetDate, events);

    // Then
    expect(filtered).toHaveLength(0);
  });

  it('identifies past/future/invalid timestamps in isEventInPast', () => {
    // Given
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const pastEvent: AgendaEvent = {
      id: 'past_evt',
      title: 'Evento passado',
      date: yesterday.toISOString().split('T')[0],
      time: '08:00',
      type: 'Outro',
      priority: 1,
      recurrence: 'none',
    };

    const futureEvent: AgendaEvent = {
      id: 'future_evt',
      title: 'Evento futuro',
      date: tomorrow.toISOString().split('T')[0],
      time: '23:00',
      type: 'Outro',
      priority: 1,
      recurrence: 'none',
    };

    const invalidEvent: AgendaEvent = {
      id: 'invalid_evt',
      title: 'Evento inválido',
      date: 'invalid-date',
      time: '10:00',
      type: 'Outro',
      priority: 1,
      recurrence: 'none',
    };

    // When
    const isPast = agendaService.isEventInPast(pastEvent);
    const isFuture = agendaService.isEventInPast(futureEvent);
    const isInvalid = agendaService.isEventInPast(invalidEvent);

    // Then
    expect(isPast).toBe(true);
    expect(isFuture).toBe(false);
    expect(isInvalid).toBe(false);
  });

  it('removes only auto-generated project events when syncing', () => {
    // Given
    const currentEvents: AgendaEvent[] = [
      {
        id: 'manual_proj',
        title: 'Evento manual',
        date: '2026-02-11',
        time: '09:00',
        type: 'Reunião com Cliente',
        priority: 2,
        recurrence: 'none',
        projectId: 'proj_9',
      },
      {
        id: 'auto_deadline',
        title: 'Prazo',
        date: '2026-02-12',
        time: '10:00',
        type: 'Prazo de Entrega',
        priority: 3,
        recurrence: 'none',
        projectId: 'proj_9',
        isDeadlineEvent: true,
      },
      {
        id: 'auto_fin',
        title: 'Receber',
        date: '2026-02-12',
        time: '10:30',
        type: 'Recebimento',
        priority: 3,
        recurrence: 'none',
        projectId: 'proj_9',
        isFinancialEvent: 'income',
      },
    ];

    // When
    const synced = agendaService.syncProjectEventsWithAgenda(null, currentEvents, 'proj_9');

    // Then
    expect(synced).toHaveLength(1);
    expect(synced[0].id).toBe('manual_proj');
  });
});
