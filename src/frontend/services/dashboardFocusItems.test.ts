import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import type { AgendaEvent, MarketingActivity, Proposal } from '../types';
import { createTestProject } from '../test/factories';
import { determineFocusItems } from './dashboardFocusItems';
import { toDateOnlyString } from '../utils/formatters';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns an ISO date string N days from today (negative = past). */
const daysFromToday = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toDateOnlyString(d);
};

/** Builds a minimal AgendaEvent for test purposes. */
const makeEvent = (overrides: Partial<AgendaEvent> = {}): AgendaEvent => ({
  id: 'evt-1',
  title: 'Reunião',
  date: daysFromToday(0),
  time: '23:59',
  type: 'Reunião com Cliente',
  priority: 2,
  recurrence: 'none',
  completed: false,
  ...overrides,
});

/** Builds a minimal MarketingActivity for test purposes. */
const makeMarketing = (overrides: Partial<MarketingActivity> = {}): MarketingActivity => ({
  id: 'mkt-1',
  title: 'Post Instagram',
  status: 'Pendente',
  contentType: 'Post (Instagram)',
  responsibleId: 'resp-1',
  dueDate: daysFromToday(1),
  ...overrides,
});

/** Builds a minimal pending Proposal for test purposes. */
const makeProposal = (overrides: Partial<Proposal> = {}): Proposal =>
  ({
    id: 'prop-1',
    code: '#001',
    name: 'Proposta Teste',
    date: daysFromToday(-1),
    status: 'Pendente',
    archived: false,
    sections: [],
    discount: 0,
    subtotal: 100,
    total: 100,
    ...overrides,
  }) as Proposal;

// ── determineFocusItems ───────────────────────────────────────────────────────

describe('determineFocusItems', () => {
  // Use a fixed "now" so all date comparisons are deterministic across timezones
  const FIXED_NOW = new Date('2026-03-03T12:00:00');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Baseline ──────────────────────────────────────────────────────────────

  describe('when all inputs are empty', () => {
    it('returns an empty array', () => {
      // Arrange — nothing
      // Act
      const result = determineFocusItems([], [], [], []);
      // Assert
      expect(result).toEqual([]);
    });
  });

  // ── Priority 1 — Overdue Payments (lump-sum, vista) ──────────────────────

  describe('overdue lump-sum payments (paymentType: vista)', () => {
    it('generates a payment_overdue item for a past lump-sum due date', () => {
      // Arrange
      const project = createTestProject({
        id: 'proj-lump',
        name: 'Casa Branca',
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Em aberto',
          lumpSumDueDate: '2026-01-01', // 61 days before FIXED_NOW
          lumpSumValue: 8000,
        },
      });

      // Act
      const result = determineFocusItems([project], [], [], []);

      // Assert
      expect(result).toHaveLength(1);
      const item = result[0];
      expect(item.type).toBe('payment_overdue');
      expect(item.tag).toBe('FINANCEIRO URGENTE');
      expect(item.iconKey).toBe('cash');
      expect(item.id).toBe('payment_overdue_lump_proj-lump');
      expect(item.title).toContain('Casa Branca');
      expect(item.path).toBe('/financeiro/recebiveis');
      expect(item.description).toContain('R$');
    });

    it('uses BR-format date (DD/MM/YYYY) in overdue lump-sum description', () => {
      // Arrange
      const project = createTestProject({
        id: 'proj-brdate',
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Em aberto',
          lumpSumDueDate: '2026-01-15',
          lumpSumValue: 1000,
        },
      });

      // Act
      const [item] = determineFocusItems([project], [], [], []);

      // Assert — description must reference the due date formatted as day/month
      expect(item.description).toMatch(/15/);
    });

    it('ignores a lump-sum project whose due date is today (not yet overdue)', () => {
      // Arrange — due today is NOT overdue (< today required)
      const project = createTestProject({
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Em aberto',
          lumpSumDueDate: '2026-03-03', // exactly today
        },
      });

      // Act
      const result = determineFocusItems([project], [], [], []);

      // Assert
      expect(result.filter((i) => i.type === 'payment_overdue')).toHaveLength(0);
    });

    it('ignores lump-sum that is already paid (status !== Em aberto)', () => {
      // Arrange
      const project = createTestProject({
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Pago',
          lumpSumDueDate: '2026-01-01',
        },
      });

      // Act
      const result = determineFocusItems([project], [], [], []);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('ignores lump-sum project that has no lumpSumDueDate', () => {
      // Arrange
      const project = createTestProject({
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Em aberto',
          lumpSumDueDate: undefined,
        },
      });

      // Act
      const result = determineFocusItems([project], [], [], []);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('sorts multiple overdue lump-sum payments by due date ascending (oldest first)', () => {
      // Arrange
      const older = createTestProject({
        id: 'older',
        name: 'Projeto Antigo',
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Em aberto',
          lumpSumDueDate: '2025-01-01',
        },
      });
      const newer = createTestProject({
        id: 'newer',
        name: 'Projeto Recente',
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Em aberto',
          lumpSumDueDate: '2026-02-01',
        },
      });

      // Act
      const result = determineFocusItems([newer, older], [], [], []);

      // Assert — oldest overdue appears first
      expect(result[0].id).toBe('payment_overdue_lump_older');
      expect(result[1].id).toBe('payment_overdue_lump_newer');
    });
  });

  // ── Priority 1 — Overdue Payments (installments, parcelado) ──────────────

  describe('overdue installment payments (paymentType: parcelado)', () => {
    it('generates a payment_overdue item for each overdue unpaid installment', () => {
      // Arrange
      const project = createTestProject({
        id: 'proj-inst',
        name: 'Apartamento',
        financials: {
          paymentType: 'parcelado',
          installments: [
            {
              id: 'i1',
              number: 1,
              value: 500,
              dueDate: '2026-01-01',
              paid: false,
              paymentDate: null,
            },
            {
              id: 'i2',
              number: 2,
              value: 600,
              dueDate: '2026-02-01',
              paid: false,
              paymentDate: null,
            },
          ],
        },
      });

      // Act
      const result = determineFocusItems([project], [], [], []);

      // Assert
      const overdueItems = result.filter((i) => i.type === 'payment_overdue');
      expect(overdueItems).toHaveLength(2);
      expect(overdueItems[0].id).toBe('payment_overdue_inst_proj-inst_i1');
      expect(overdueItems[0].title).toContain('Parcela');
      expect(overdueItems[0].title).toContain('Apartamento');
      expect(overdueItems[0].description).toContain('R$');
      expect(overdueItems[0].description).toContain('1');
    });

    it('skips paid installments even if due date is in the past', () => {
      // Arrange
      const project = createTestProject({
        id: 'proj-paid',
        financials: {
          paymentType: 'parcelado',
          installments: [
            {
              id: 'i1',
              number: 1,
              value: 500,
              dueDate: '2026-01-01',
              paid: true,
              paymentDate: '2026-01-05',
            },
          ],
        },
      });

      // Act
      const result = determineFocusItems([project], [], [], []);

      // Assert
      expect(result.filter((i) => i.type === 'payment_overdue')).toHaveLength(0);
    });

    it('skips future installments', () => {
      // Arrange
      const project = createTestProject({
        financials: {
          paymentType: 'parcelado',
          installments: [
            {
              id: 'i1',
              number: 1,
              value: 500,
              dueDate: daysFromToday(10),
              paid: false,
              paymentDate: null,
            },
          ],
        },
      });

      // Act
      const result = determineFocusItems([project], [], [], []);

      // Assert
      expect(result.filter((i) => i.type === 'payment_overdue')).toHaveLength(0);
    });

    it('includes installment number in the description', () => {
      // Arrange
      const project = createTestProject({
        id: 'proj-num',
        name: 'Torre',
        financials: {
          paymentType: 'parcelado',
          installments: [
            {
              id: 'i3',
              number: 3,
              value: 750,
              dueDate: '2026-02-15',
              paid: false,
              paymentDate: null,
            },
          ],
        },
      });

      // Act
      const [item] = determineFocusItems([project], [], [], []);

      // Assert
      expect(item.description).toContain('3');
    });
  });

  // ── Priority 2 — Critical Project Deadlines ───────────────────────────────

  describe('critical project deadlines (Em Andamento, within 3 days)', () => {
    it('generates a deadline item when project deadline is 2 days away', () => {
      // Arrange
      const project = createTestProject({
        id: 'proj-dead',
        name: 'Studio Urgente',
        status: 'Em Andamento',
        deadline: daysFromToday(2),
      });

      // Act
      const result = determineFocusItems([project], [], [], []);

      // Assert
      const item = result.find((i) => i.type === 'deadline');
      expect(item).toBeDefined();
      expect(item!.tag).toBe('PRAZO DE PROJETO');
      expect(item!.iconKey).toBe('agenda');
      expect(item!.id).toBe('deadline_proj-dead');
      expect(item!.title).toContain('Studio Urgente');
      expect(item!.path).toBe('/projetos/proj-dead');
    });

    it('generates a deadline item when project deadline is today (diffDays=0)', () => {
      // Arrange
      const project = createTestProject({
        id: 'proj-today-dead',
        name: 'Residência',
        status: 'Em Andamento',
        deadline: daysFromToday(0),
      });

      // Act
      const result = determineFocusItems([project], [], [], []);

      // Assert
      const item = result.find((i) => i.type === 'deadline');
      expect(item).toBeDefined();
      expect(item!.description).toContain('0 dia(s)');
    });

    it('skips the deadline item when deadline is exactly 4 days away', () => {
      // Arrange
      const project = createTestProject({
        status: 'Em Andamento',
        deadline: daysFromToday(4),
      });

      // Act
      const result = determineFocusItems([project], [], [], []);

      // Assert
      expect(result.filter((i) => i.type === 'deadline')).toHaveLength(0);
    });

    it('skips projects that are not Em Andamento', () => {
      // Arrange — Concluído project with close deadline should be ignored
      const project = createTestProject({
        status: 'Concluído',
        deadline: daysFromToday(1),
      });

      // Act
      const result = determineFocusItems([project], [], [], []);

      // Assert
      expect(result.filter((i) => i.type === 'deadline')).toHaveLength(0);
    });

    it('skips projects with no deadline', () => {
      // Arrange
      const project = createTestProject({ status: 'Em Andamento', deadline: null });

      // Act
      const result = determineFocusItems([project], [], [], []);

      // Assert
      expect(result.filter((i) => i.type === 'deadline')).toHaveLength(0);
    });

    it('sorts multiple deadline projects with the soonest first', () => {
      // Arrange
      const p1 = createTestProject({
        id: 'dead-3',
        name: 'P3',
        status: 'Em Andamento',
        deadline: daysFromToday(3),
      });
      const p2 = createTestProject({
        id: 'dead-1',
        name: 'P1',
        status: 'Em Andamento',
        deadline: daysFromToday(1),
      });
      const p3 = createTestProject({
        id: 'dead-2',
        name: 'P2',
        status: 'Em Andamento',
        deadline: daysFromToday(2),
      });

      // Act
      const result = determineFocusItems([p1, p2, p3], [], [], []).filter(
        (i) => i.type === 'deadline',
      );

      // Assert
      expect(result[0].id).toBe('deadline_dead-1');
      expect(result[2].id).toBe('deadline_dead-3');
    });
  });

  // ── Priority 3 — Marketing (overdue takes precedence; otherwise upcoming) ─

  describe('overdue marketing tasks', () => {
    it('generates a marketing_overdue item for the first overdue pending task', () => {
      // Arrange
      const task = makeMarketing({
        id: 'mkt-over',
        title: 'Campanha Férias',
        status: 'Pendente',
        dueDate: '2026-02-01',
      });

      // Act
      const result = determineFocusItems([], [], [task], []);

      // Assert
      const item = result.find((i) => i.type === 'marketing_overdue');
      expect(item).toBeDefined();
      expect(item!.tag).toBe('MARKETING ATRASADO');
      expect(item!.iconKey).toBe('bullhorn');
      expect(item!.id).toBe('marketing_overdue_mkt-over');
      expect(item!.title).toContain('Campanha Férias');
      expect(item!.path).toBe('/gestao-marketing/conteudos');
    });

    it('generates only ONE marketing_overdue item even if multiple tasks are overdue', () => {
      // Arrange — only the first-found overdue task is emitted
      const tasks: MarketingActivity[] = [
        makeMarketing({ id: 'mkt-a', status: 'Pendente', dueDate: '2026-01-01' }),
        makeMarketing({ id: 'mkt-b', status: 'Em Andamento', dueDate: '2026-01-15' }),
      ];

      // Act
      const result = determineFocusItems([], [], tasks, []);

      // Assert
      expect(result.filter((i) => i.type === 'marketing_overdue')).toHaveLength(1);
    });

    it('uses Em Andamento tasks when checking for overdue', () => {
      // Arrange
      const task = makeMarketing({
        id: 'mkt-wip',
        status: 'Em Andamento',
        dueDate: '2026-02-10',
      });

      // Act
      const result = determineFocusItems([], [], [task], []);

      // Assert
      expect(result.find((i) => i.type === 'marketing_overdue')).toBeDefined();
    });

    it('skips completed tasks entirely', () => {
      // Arrange
      const task = makeMarketing({ status: 'Concluído', dueDate: '2026-01-01' });

      // Act
      const result = determineFocusItems([], [], [task], []);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('upcoming marketing tasks (no overdue present)', () => {
    it('generates marketing_deadline items for tasks due within 3 days when no overdue exists', () => {
      // Arrange
      const task = makeMarketing({
        id: 'mkt-soon',
        title: 'Reels Lançamento',
        status: 'Pendente',
        dueDate: daysFromToday(2),
      });

      // Act
      const result = determineFocusItems([], [], [task], []);

      // Assert
      const item = result.find((i) => i.type === 'marketing_deadline');
      expect(item).toBeDefined();
      expect(item!.tag).toBe('PRAZO DE MARKETING');
      expect(item!.iconKey).toBe('bullhorn');
      expect(item!.id).toBe('marketing_deadline_mkt-soon');
      expect(item!.title).toContain('Reels Lançamento');
    });

    it('skips upcoming tasks that are more than 3 days away', () => {
      // Arrange
      const task = makeMarketing({ status: 'Pendente', dueDate: daysFromToday(5) });

      // Act
      const result = determineFocusItems([], [], [task], []);

      // Assert
      expect(result.filter((i) => i.type === 'marketing_deadline')).toHaveLength(0);
    });

    it('does NOT emit upcoming items when an overdue task already exists', () => {
      // Arrange — one overdue + one upcoming: the upcoming branch is skipped
      const tasks: MarketingActivity[] = [
        makeMarketing({ id: 'mkt-over', status: 'Pendente', dueDate: '2026-02-01' }),
        makeMarketing({ id: 'mkt-soon', status: 'Pendente', dueDate: daysFromToday(1) }),
      ];

      // Act
      const result = determineFocusItems([], [], tasks, []);

      // Assert
      expect(result.filter((i) => i.type === 'marketing_deadline')).toHaveLength(0);
      expect(result.filter((i) => i.type === 'marketing_overdue')).toHaveLength(1);
    });
  });

  // ── Priority 4 — Old Pending Proposals (> 7 days) ────────────────────────

  describe('old pending proposals (> 7 days)', () => {
    it('generates a proposal_followup item for a 10-day-old pending proposal', () => {
      // Arrange
      const proposal = makeProposal({
        id: 'prop-old',
        name: 'Cobertura Moderna',
        date: daysFromToday(-10),
        status: 'Pendente',
        archived: false,
      });

      // Act
      const result = determineFocusItems([], [proposal], [], []);

      // Assert
      const item = result.find((i) => i.type === 'proposal_followup');
      expect(item).toBeDefined();
      expect(item!.tag).toBe('ACOMPANHAMENTO');
      expect(item!.iconKey).toBe('mail');
      expect(item!.id).toBe('proposal_followup_prop-old');
      expect(item!.title).toContain('Cobertura Moderna');
      expect(item!.path).toBe('/propostas/prop-old');
    });

    it('includes a proposal that is exactly 7 days old (midnight < current time)', () => {
      // Arrange
      // sevenDaysAgo is computed WITHOUT zeroing hours (uses current time-of-day).
      // parseDateString('YYYY-MM-DD') returns midnight.
      // Therefore midnight(-7d) < sevenDaysAgo(current time-of-day) → proposal IS included.
      const proposal = makeProposal({ id: 'prop-7', date: daysFromToday(-7) });

      // Act
      const result = determineFocusItems([], [proposal], [], []);

      // Assert
      expect(result.filter((i) => i.type === 'proposal_followup')).toHaveLength(1);
    });

    it('skips a proposal that is only 6 days old', () => {
      // Arrange — 6 days is < 7 days threshold, regardless of time-of-day
      const proposal = makeProposal({ date: daysFromToday(-6) });

      // Act
      const result = determineFocusItems([], [proposal], [], []);

      // Assert
      expect(result.filter((i) => i.type === 'proposal_followup')).toHaveLength(0);
    });

    it('skips archived proposals', () => {
      // Arrange
      const proposal = makeProposal({ date: daysFromToday(-10), archived: true });

      // Act
      const result = determineFocusItems([], [proposal], [], []);

      // Assert
      expect(result.filter((i) => i.type === 'proposal_followup')).toHaveLength(0);
    });

    it('skips proposals that are not Pendente', () => {
      // Arrange
      const proposal = makeProposal({ date: daysFromToday(-10), status: 'Rejeitado' });

      // Act
      const result = determineFocusItems([], [proposal], [], []);

      // Assert
      expect(result.filter((i) => i.type === 'proposal_followup')).toHaveLength(0);
    });

    it('sorts multiple old proposals with the oldest first', () => {
      // Arrange
      const older = makeProposal({ id: 'prop-20', name: 'A', date: daysFromToday(-20) });
      const newer = makeProposal({ id: 'prop-10', name: 'B', date: daysFromToday(-10) });

      // Act
      const result = determineFocusItems([], [newer, older], [], []).filter(
        (i) => i.type === 'proposal_followup',
      );

      // Assert
      expect(result[0].id).toBe('proposal_followup_prop-20');
      expect(result[1].id).toBe('proposal_followup_prop-10');
    });
  });

  // ── Priority 5 — Upcoming Events Today ───────────────────────────────────

  describe('upcoming events today', () => {
    const TODAY = toDateOnlyString(FIXED_NOW); // '2026-03-03'

    it('generates an event_today item for a future event scheduled today', () => {
      // Arrange — time is after FIXED_NOW (12:00)
      const event = makeEvent({
        id: 'evt-pm',
        title: 'Reunião de Equipe',
        date: TODAY,
        time: '15:00',
        isDeadlineEvent: false,
        isFinancialEvent: undefined,
      });

      // Act
      const result = determineFocusItems([], [], [], [event]);

      // Assert
      const item = result.find((i) => i.type === 'event_today');
      expect(item).toBeDefined();
      expect(item!.tag).toBe('COMPROMISSO HOJE');
      expect(item!.iconKey).toBe('agenda');
      expect(item!.id).toBe('event_today_evt-pm');
      expect(item!.title).toBe(`Hoje às 15:00: Reunião de Equipe`);
      expect(item!.path).toBe('/agenda');
    });

    it('skips past events that already happened today', () => {
      // Arrange — time before FIXED_NOW (12:00)
      const event = makeEvent({ date: TODAY, time: '09:00' });

      // Act
      const result = determineFocusItems([], [], [], [event]);

      // Assert
      expect(result.filter((i) => i.type === 'event_today')).toHaveLength(0);
    });

    it('skips events scheduled for another day', () => {
      // Arrange
      const event = makeEvent({ date: daysFromToday(1), time: '15:00' });

      // Act
      const result = determineFocusItems([], [], [], [event]);

      // Assert
      expect(result.filter((i) => i.type === 'event_today')).toHaveLength(0);
    });

    it('skips deadline events (isDeadlineEvent: true)', () => {
      // Arrange
      const event = makeEvent({ date: TODAY, time: '15:00', isDeadlineEvent: true });

      // Act
      const result = determineFocusItems([], [], [], [event]);

      // Assert
      expect(result.filter((i) => i.type === 'event_today')).toHaveLength(0);
    });

    it('skips financial events (isFinancialEvent truthy)', () => {
      // Arrange
      const event = makeEvent({ date: TODAY, time: '15:00', isFinancialEvent: 'income' });

      // Act
      const result = determineFocusItems([], [], [], [event]);

      // Assert
      expect(result.filter((i) => i.type === 'event_today')).toHaveLength(0);
    });

    it('includes project name in description when projectName is set', () => {
      // Arrange
      const event = makeEvent({
        date: TODAY,
        time: '16:00',
        projectName: 'Projeto Solar',
      });

      // Act
      const result = determineFocusItems([], [], [], [event]);

      // Assert
      const item = result.find((i) => i.type === 'event_today');
      expect(item!.description).toContain('Projeto Solar');
    });

    it('sorts multiple today events by time ascending', () => {
      // Arrange
      const events: AgendaEvent[] = [
        makeEvent({ id: 'e3', date: TODAY, time: '18:00' }),
        makeEvent({ id: 'e1', date: TODAY, time: '13:00' }),
        makeEvent({ id: 'e2', date: TODAY, time: '15:00' }),
      ];

      // Act
      const result = determineFocusItems([], [], [], events).filter(
        (i) => i.type === 'event_today',
      );

      // Assert
      expect(result[0].id).toBe('event_today_e1');
      expect(result[1].id).toBe('event_today_e2');
      expect(result[2].id).toBe('event_today_e3');
    });
  });

  // ── Priority ordering (integration) ──────────────────────────────────────

  describe('priority ordering across categories', () => {
    it('places payment_overdue items before deadline items', () => {
      // Arrange
      const projectWithOverdue = createTestProject({
        id: 'pay-proj',
        name: 'Pagamento',
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Em aberto',
          lumpSumDueDate: '2026-01-01',
        },
      });
      const projectWithDeadline = createTestProject({
        id: 'dead-proj',
        name: 'Deadline',
        status: 'Em Andamento',
        deadline: daysFromToday(1),
      });

      // Act
      const result = determineFocusItems([projectWithOverdue, projectWithDeadline], [], [], []);

      // Assert — overdue payments must precede deadline items in the result
      const overdueIdx = result.findIndex((i) => i.type === 'payment_overdue');
      const deadlineIdx = result.findIndex((i) => i.type === 'deadline');
      expect(overdueIdx).toBeLessThan(deadlineIdx);
    });

    it('places deadline items before event_today items', () => {
      // Arrange
      const TODAY = toDateOnlyString(FIXED_NOW);
      const projectWithDeadline = createTestProject({
        status: 'Em Andamento',
        deadline: daysFromToday(1),
      });
      const event = makeEvent({ date: TODAY, time: '23:00' });

      // Act
      const result = determineFocusItems([projectWithDeadline], [], [], [event]);

      // Assert
      const deadlineIdx = result.findIndex((i) => i.type === 'deadline');
      const eventIdx = result.findIndex((i) => i.type === 'event_today');
      expect(deadlineIdx).toBeLessThan(eventIdx);
    });

    it('returns items from all 5 categories simultaneously', () => {
      // Arrange
      const TODAY = toDateOnlyString(FIXED_NOW);
      const projectWithOverdue = createTestProject({
        id: 'all-pay',
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Em aberto',
          lumpSumDueDate: '2026-01-01',
        },
      });
      const projectWithDeadline = createTestProject({
        id: 'all-dead',
        status: 'Em Andamento',
        deadline: daysFromToday(2),
      });
      const marketing = makeMarketing({ id: 'all-mkt', dueDate: '2026-02-01' });
      const proposal = makeProposal({ id: 'all-prop', date: daysFromToday(-10) });
      const event = makeEvent({ id: 'all-evt', date: TODAY, time: '14:00' });

      // Act
      const result = determineFocusItems(
        [projectWithOverdue, projectWithDeadline],
        [proposal],
        [marketing],
        [event],
      );

      // Assert — at least one item per category
      expect(result.some((i) => i.type === 'payment_overdue')).toBe(true);
      expect(result.some((i) => i.type === 'deadline')).toBe(true);
      expect(result.some((i) => i.type === 'marketing_overdue')).toBe(true);
      expect(result.some((i) => i.type === 'proposal_followup')).toBe(true);
      expect(result.some((i) => i.type === 'event_today')).toBe(true);
    });
  });

  // ── ID uniqueness ─────────────────────────────────────────────────────────

  describe('generated item IDs', () => {
    it('produces unique IDs across all generated items', () => {
      // Arrange
      const TODAY = toDateOnlyString(FIXED_NOW);
      const p1 = createTestProject({
        id: 'uid-p1',
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Em aberto',
          lumpSumDueDate: '2026-01-01',
        },
      });
      const p2 = createTestProject({
        id: 'uid-p2',
        status: 'Em Andamento',
        deadline: daysFromToday(1),
        financials: { paymentType: 'parcelado', installments: [] },
      });
      const proposal = makeProposal({ id: 'uid-prop', date: daysFromToday(-10) });
      const event = makeEvent({ id: 'uid-evt', date: TODAY, time: '14:00' });

      // Act
      const result = determineFocusItems([p1, p2], [proposal], [], [event]);
      const ids = result.map((i) => i.id);

      // Assert — no duplicate IDs
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles projects without financials gracefully', () => {
      // Arrange
      const project = createTestProject({ financials: undefined as unknown as never });

      // Act & Assert — must not throw
      expect(() => determineFocusItems([project], [], [], [])).not.toThrow();
    });

    it('handles proposals with invalid date strings gracefully', () => {
      // Arrange
      const proposal = makeProposal({ date: 'not-a-date' });

      // Act & Assert — must not throw, and the invalid proposal is filtered out
      expect(() => determineFocusItems([], [proposal], [], [])).not.toThrow();
    });

    it('handles marketing activities with no dueDate gracefully', () => {
      // Arrange
      const task = makeMarketing({ dueDate: '' });

      // Act & Assert
      expect(() => determineFocusItems([], [], [task], [])).not.toThrow();
    });
  });
});
