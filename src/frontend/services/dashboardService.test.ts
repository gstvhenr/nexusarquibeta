import { describe, expect, it } from 'vitest';
import { createTestProject } from '../test/factories';
import type { AgendaEvent, MarketingActivity, Proposal } from '../types';
import {
  calculateProjectProgress,
  determineFocusItems,
  getActiveProjects,
  getDashboardKPIs,
  getFinancialOverview,
  getPendingMarketingTasks,
  getUpcomingEvents,
} from './dashboardService';

// ── calculateProjectProgress ─────────────────────────────────────────

describe('dashboardService.calculateProjectProgress', () => {
  it('returns correct progress percentage', () => {
    const project = createTestProject({
      sections: [
        {
          id: 's1',
          name: 'Seção 1',
          tasks: [
            { id: 't1', name: 'Tarefa 1', completed: true, hours: 0 },
            { id: 't2', name: 'Tarefa 2', completed: false, hours: 0 },
            { id: 't3', name: 'Tarefa 3', completed: true, hours: 0 },
          ],
        },
      ],
    });

    const { progress, completedCount, totalCount } = calculateProjectProgress(project);

    expect(totalCount).toBe(3);
    expect(completedCount).toBe(2);
    expect(progress).toBeCloseTo(66.666, 2);
  });

  it('returns zero for project with no sections', () => {
    const project = createTestProject({ sections: [] });

    const result = calculateProjectProgress(project);

    expect(result).toEqual({ progress: 0, completedCount: 0, totalCount: 0 });
  });

  it('returns 100% when all tasks are completed', () => {
    const project = createTestProject({
      sections: [
        {
          id: 's1',
          name: 'Seção',
          tasks: [
            { id: 't1', name: 'A', completed: true, hours: 0 },
            { id: 't2', name: 'B', completed: true, hours: 0 },
          ],
        },
      ],
    });

    expect(calculateProjectProgress(project).progress).toBe(100);
  });
});

// ── getFinancialOverview ─────────────────────────────────────────────

describe('dashboardService.getFinancialOverview', () => {
  it('splits overdue and upcoming values for open payments', () => {
    const overdueProject = createTestProject({
      id: 'overdue-1',
      budget: 1000,
      archived: false,
      financials: {
        paymentType: 'vista',
        lumpSumStatus: 'Em aberto',
        lumpSumDueDate: '2000-01-01',
      },
    });

    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 3);

    const upcomingProject = createTestProject({
      id: 'upcoming-1',
      budget: 500,
      archived: false,
      financials: {
        paymentType: 'vista',
        lumpSumStatus: 'Em aberto',
        lumpSumDueDate: upcomingDate.toISOString().split('T')[0],
      },
    });

    const summary = getFinancialOverview([overdueProject, upcomingProject]);

    expect(summary.overdue).toBe(1000);
    expect(summary.upcoming).toBe(500);
  });

  it('returns zeros for empty project list', () => {
    const summary = getFinancialOverview([]);

    expect(summary.overdue).toBe(0);
    expect(summary.upcoming).toBe(0);
  });

  it('ignores archived projects', () => {
    const archivedProject = createTestProject({
      archived: true,
      financials: {
        paymentType: 'vista',
        lumpSumStatus: 'Em aberto',
        lumpSumDueDate: '2000-01-01',
      },
    });

    const summary = getFinancialOverview([archivedProject]);

    expect(summary.overdue).toBe(0);
    expect(summary.upcoming).toBe(0);
  });

  it('sums installment payments individually', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const project = createTestProject({
      archived: false,
      financials: {
        paymentType: 'parcelado',
        installments: [
          {
            id: 'inst1',
            number: 1,
            value: 300,
            dueDate: '2000-01-01',
            paid: false,
            paymentDate: null,
          },
          {
            id: 'inst2',
            number: 2,
            value: 400,
            dueDate: tomorrowStr,
            paid: false,
            paymentDate: null,
          },
          {
            id: 'inst3',
            number: 3,
            value: 500,
            dueDate: tomorrowStr,
            paid: true,
            paymentDate: tomorrowStr,
          },
        ],
      },
    });

    const summary = getFinancialOverview([project]);

    expect(summary.overdue).toBe(300);
    expect(summary.upcoming).toBe(400);
  });
});

// ── getDashboardKPIs ─────────────────────────────────────────────────

describe('dashboardService.getDashboardKPIs', () => {
  it('counts active projects and pending proposals', () => {
    const projects = [
      createTestProject({ id: 'p1', status: 'Em Andamento', archived: false }),
      createTestProject({ id: 'p2', status: 'Concluído' }),
      createTestProject({ id: 'p3', status: 'Em Andamento', archived: true }),
    ];

    const proposals: Proposal[] = [
      {
        id: 'prop1',
        code: '#001',
        name: 'Proposta 1',
        date: '2026-01-01',
        status: 'Pendente',
        archived: false,
        sections: [],
        discount: 0,
        subtotal: 100,
        total: 100,
      } as Proposal,
      {
        id: 'prop2',
        code: '#002',
        name: 'Proposta 2',
        date: '2026-01-15',
        status: 'Em Análise',
        archived: false,
        sections: [],
        discount: 0,
        subtotal: 200,
        total: 200,
      } as Proposal,
      {
        id: 'prop3',
        code: '#003',
        name: 'Proposta 3',
        date: '2026-01-15',
        status: 'Concluído',
        archived: false,
        sections: [],
        discount: 0,
        subtotal: 500,
        total: 500,
      } as Proposal,
    ];

    const result = getDashboardKPIs(projects, proposals, []);

    expect(result.activeProjects).toBe(1);
    expect(result.pendingProposals).toBe(2);
    expect(result.pendingMarketing).toBe(0);
  });

  it('returns R$ 0,00 for receivables when no open payments exist', () => {
    const result = getDashboardKPIs([], [], []);

    expect(result.receivables).toContain('0,00');
  });
});

// ── getUpcomingEvents ────────────────────────────────────────────────

describe('dashboardService.getUpcomingEvents', () => {
  it('returns at most 3 future non-completed events', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const events: AgendaEvent[] = Array.from({ length: 5 }, (_, i) => ({
      id: `e${i}`,
      title: `Evento ${i}`,
      date: tomorrowStr,
      time: `${String(10 + i).padStart(2, '0')}:00`,
      type: 'Reunião com Cliente' as const,
      priority: 2,
      recurrence: 'none' as const,
      completed: false,
    }));

    const result = getUpcomingEvents(events);

    expect(result).toHaveLength(3);
    expect(result[0].title).toBe('Evento 0');
  });

  it('excludes completed events', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const events: AgendaEvent[] = [
      {
        id: 'e1',
        title: 'Done',
        date: tomorrowStr,
        time: '10:00',
        type: 'Reunião com Cliente',
        priority: 2,
        recurrence: 'none',
        completed: true,
      },
      {
        id: 'e2',
        title: 'Pending',
        date: tomorrowStr,
        time: '11:00',
        type: 'Reunião com Cliente',
        priority: 2,
        recurrence: 'none',
        completed: false,
      },
    ];

    const result = getUpcomingEvents(events);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Pending');
  });

  it('returns empty array for no events', () => {
    expect(getUpcomingEvents([])).toEqual([]);
  });
});

// ── getActiveProjects ────────────────────────────────────────────────

describe('dashboardService.getActiveProjects', () => {
  it('returns at most 4 active non-archived projects', () => {
    const projects = Array.from({ length: 6 }, (_, i) =>
      createTestProject({
        id: `p${i}`,
        status: 'Em Andamento',
        archived: false,
        deadline: new Date(2026, 6, i + 1).toISOString(),
        sections: [],
      }),
    );

    const result = getActiveProjects(projects);

    expect(result).toHaveLength(4);
  });

  it('excludes archived and non-active projects', () => {
    const projects = [
      createTestProject({ id: 'p1', status: 'Em Andamento', archived: false }),
      createTestProject({ id: 'p2', status: 'Concluído', archived: false }),
      createTestProject({ id: 'p3', status: 'Em Andamento', archived: true }),
    ];

    const result = getActiveProjects(projects);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
  });
});

// ── getPendingMarketingTasks ─────────────────────────────────────────

describe('dashboardService.getPendingMarketingTasks', () => {
  it('returns at most 5 pending/in-progress tasks', () => {
    const tasks: MarketingActivity[] = Array.from({ length: 8 }, (_, i) => ({
      id: `ma${i}`,
      title: `Task ${i}`,
      status: 'Pendente' as const,
      contentType: 'Post (Instagram)' as const,
      responsibleId: 'resp-1',
      dueDate: new Date(2026, 5, i + 1).toISOString().split('T')[0],
    }));

    const result = getPendingMarketingTasks(tasks);

    expect(result).toHaveLength(5);
  });

  it('excludes completed tasks', () => {
    const tasks: MarketingActivity[] = [
      {
        id: 'ma1',
        title: 'Done',
        status: 'Concluído',
        contentType: 'Post (Instagram)',
        responsibleId: 'resp-1',
        dueDate: '2026-06-01',
      },
      {
        id: 'ma2',
        title: 'Todo',
        status: 'Pendente',
        contentType: 'Post (Instagram)',
        responsibleId: 'resp-1',
        dueDate: '2026-06-01',
      },
    ];

    const result = getPendingMarketingTasks(tasks);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Todo');
  });
});

// ── determineFocusItems ──────────────────────────────────────────────

describe('dashboardService.determineFocusItems', () => {
  it('returns empty array when all data is empty', () => {
    const result = determineFocusItems([], [], [], []);

    expect(result).toEqual([]);
  });

  it('creates focus item for overdue lump sum payment', () => {
    const project = createTestProject({
      id: 'overdue-proj',
      name: 'Projeto Atrasado',
      archived: false,
      financials: {
        paymentType: 'vista',
        lumpSumStatus: 'Em aberto',
        lumpSumDueDate: '2020-01-15',
        baseContractValue: 5000,
        totalValue: 5000,
        lumpSumValue: 5000,
      },
    });

    const result = determineFocusItems([project], [], [], []);

    expect(result.length).toBeGreaterThanOrEqual(1);
    const paymentItem = result.find((item) => item.type === 'payment_overdue');
    expect(paymentItem).toBeDefined();
    expect(paymentItem!.tag).toBe('FINANCEIRO URGENTE');
    expect(paymentItem!.title).toContain('Projeto Atrasado');
  });

  it('creates focus item for overdue installment', () => {
    const project = createTestProject({
      id: 'inst-proj',
      name: 'Projeto Parcelas',
      archived: false,
      financials: {
        paymentType: 'parcelado',
        installments: [
          {
            id: 'inst1',
            number: 1,
            value: 1000,
            dueDate: '2020-06-01',
            paid: false,
            paymentDate: null,
          },
        ],
      },
    });

    const result = determineFocusItems([project], [], [], []);

    const paymentItem = result.find((item) => item.type === 'payment_overdue');
    expect(paymentItem).toBeDefined();
    expect(paymentItem!.title).toContain('Parcela');
  });

  it('creates focus item for old pending proposal (>7 days)', () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const proposal = {
      id: 'prop-old',
      code: '#999',
      name: 'Proposta Esquecida',
      date: tenDaysAgo.toISOString().split('T')[0],
      status: 'Pendente',
      archived: false,
      sections: [],
      discount: 0,
      subtotal: 100,
      total: 100,
    } as Proposal;

    const result = determineFocusItems([], [proposal], [], []);

    const followupItem = result.find((item) => item.type === 'proposal_followup');
    expect(followupItem).toBeDefined();
    expect(followupItem!.tag).toBe('ACOMPANHAMENTO');
    expect(followupItem!.title).toContain('Proposta Esquecida');
  });

  it('creates focus item for project deadline within 3 days', () => {
    const inTwoDays = new Date();
    inTwoDays.setDate(inTwoDays.getDate() + 2);

    const project = createTestProject({
      id: 'deadline-proj',
      name: 'Projeto Urgente',
      status: 'Em Andamento',
      deadline: inTwoDays.toISOString(),
      archived: false,
    });

    const result = determineFocusItems([project], [], [], []);

    const deadlineItem = result.find((item) => item.type === 'deadline');
    expect(deadlineItem).toBeDefined();
    expect(deadlineItem!.tag).toBe('PRAZO DE PROJETO');
  });

  it('prioritizes overdue payments over other items', () => {
    const overdueProject = createTestProject({
      id: 'overdue-proj',
      name: 'Projeto Atrasado',
      status: 'Em Andamento',
      archived: false,
      financials: {
        paymentType: 'vista',
        lumpSumStatus: 'Em aberto',
        lumpSumDueDate: '2020-01-01',
        baseContractValue: 5000,
        totalValue: 5000,
        lumpSumValue: 5000,
      },
    });

    const inTwoDays = new Date();
    inTwoDays.setDate(inTwoDays.getDate() + 2);

    const deadlineProject = createTestProject({
      id: 'deadline-proj',
      name: 'Projeto Deadline',
      status: 'Em Andamento',
      deadline: inTwoDays.toISOString(),
      archived: false,
    });

    const result = determineFocusItems([overdueProject, deadlineProject], [], [], []);

    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0].type).toBe('payment_overdue');
  });
});
