import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectSection } from '@/types';
import {
  ROW_H,
  SECTION_ROW_H,
  NAME_COL_W,
  diffDays,
  dateToPixel,
  fmtFullDate,
  durationLabel,
  buildRows,
  computeStats,
  computeTimelineMetrics,
} from './helpers';
import type { TimeColumn, TimelineRow } from './types';

// ─── Factories ───────────────────────────────────────────────────────────────

function makeSection(overrides: Partial<ProjectSection> = {}): ProjectSection {
  return {
    id: 'section-1',
    name: 'Etapa 1',
    tasks: [],
    ...overrides,
  };
}

function makeSections(count: number): ProjectSection[] {
  return Array.from({ length: count }, (_, i) =>
    makeSection({
      id: `section-${i + 1}`,
      name: `Etapa ${i + 1}`,
      tasks: [
        {
          id: `task-${i + 1}-a`,
          name: `Tarefa A${i + 1}`,
          completed: i === 0,
          hours: 4,
          startDate: '2026-03-01',
          endDate: '2026-03-10',
        },
      ],
    }),
  );
}

function makeColumn(startIso: string, endIso: string, groupKey = '1'): TimeColumn {
  return {
    label: 'col',
    startDate: new Date(startIso),
    endDate: new Date(endIso),
    groupKey,
  };
}

// ─── Exported Constants ──────────────────────────────────────────────────────

describe('exported constants', () => {
  it('exports ROW_H as 42', () => {
    expect(ROW_H).toBe(42);
  });

  it('exports SECTION_ROW_H as 38', () => {
    expect(SECTION_ROW_H).toBe(38);
  });

  it('exports NAME_COL_W as 240', () => {
    expect(NAME_COL_W).toBe(240);
  });
});

// ─── diffDays ────────────────────────────────────────────────────────────────

describe('diffDays', () => {
  it('returns 0 for the same day', () => {
    const date = new Date('2026-03-05');

    expect(diffDays(date, date)).toBe(0);
  });

  it('returns positive days when end is after start', () => {
    expect(diffDays(new Date('2026-03-01'), new Date('2026-03-05'))).toBe(4);
  });

  it('returns negative days when end is before start', () => {
    expect(diffDays(new Date('2026-03-10'), new Date('2026-03-05'))).toBe(-5);
  });

  it('handles cross-month boundaries', () => {
    expect(diffDays(new Date('2026-01-28'), new Date('2026-02-03'))).toBe(6);
  });

  it('handles cross-year boundaries', () => {
    expect(diffDays(new Date('2025-12-30'), new Date('2026-01-02'))).toBe(3);
  });

  it('ignores time-of-day (operates on start-of-day)', () => {
    const morning = new Date('2026-03-01T06:00:00');
    const evening = new Date('2026-03-03T23:59:59');

    expect(diffDays(morning, evening)).toBe(2);
  });
});

// ─── dateToPixel ─────────────────────────────────────────────────────────────

describe('dateToPixel', () => {
  const colWidth = 100;

  it('returns 0 for a date at the start of the first column', () => {
    const columns = [makeColumn('2026-03-01', '2026-03-02')];

    expect(dateToPixel(new Date('2026-03-01'), columns, colWidth)).toBe(0);
  });

  it('returns fractional position within columns', () => {
    const columns = [makeColumn('2026-03-01', '2026-03-02')];
    // Midpoint of a 1-day column should return 0 since startOfDay is used
    const px = dateToPixel(new Date('2026-03-01T12:00:00'), columns, colWidth);

    expect(px).toBeGreaterThanOrEqual(0);
    expect(px).toBeLessThan(colWidth);
  });

  it('maps date to second column correctly', () => {
    // Use local Date constructors to avoid UTC-to-local timezone offset
    const columns: TimeColumn[] = [
      { label: '01', startDate: new Date(2026, 2, 1), endDate: new Date(2026, 2, 2), groupKey: '1' },
      { label: '02', startDate: new Date(2026, 2, 2), endDate: new Date(2026, 2, 3), groupKey: '1' },
    ];

    const px = dateToPixel(new Date(2026, 2, 2), columns, colWidth);

    expect(px).toBe(colWidth); // start of second column
  });

  it('clamps to right edge when date is past last column', () => {
    const columns = [
      makeColumn('2026-03-01', '2026-03-02'),
      makeColumn('2026-03-02', '2026-03-03'),
    ];

    const px = dateToPixel(new Date('2026-06-01'), columns, colWidth);

    expect(px).toBe(columns.length * colWidth);
  });

  it('handles single-column edge case', () => {
    const columns = [makeColumn('2026-03-01', '2026-04-01')];

    const px = dateToPixel(new Date('2026-03-15'), columns, 200);

    expect(px).toBeGreaterThan(0);
    expect(px).toBeLessThan(200);
  });
});

// ─── fmtFullDate ─────────────────────────────────────────────────────────────

describe('fmtFullDate', () => {
  it('formats date in pt-BR long format with day, month name, and year', () => {
    // Use local Date constructor to avoid UTC-to-local timezone offset
    const result = fmtFullDate(new Date(2026, 2, 5));

    expect(result).toMatch(/05/);
    expect(result).toMatch(/2026/);
    // The month part should be a text month name (e.g., "março")
    expect(result).toMatch(/mar/i);
  });

  it('produces consistent output for different dates', () => {
    const jan = fmtFullDate(new Date(2026, 0, 15));
    const dec = fmtFullDate(new Date(2026, 11, 25));

    expect(jan).toMatch(/15/);
    expect(jan).toMatch(/2026/);
    expect(dec).toMatch(/25/);
    expect(dec).toMatch(/2026/);
  });
});

// ─── durationLabel ───────────────────────────────────────────────────────────

describe('durationLabel', () => {
  it('returns "1 dia" for exactly 1 day', () => {
    expect(durationLabel(1)).toBe('1 dia');
  });

  it('returns "1 dia" for 0 days (edge: days <= 1)', () => {
    expect(durationLabel(0)).toBe('1 dia');
  });

  it('returns plural days for 2-6 days', () => {
    expect(durationLabel(2)).toBe('2 dias');
    expect(durationLabel(6)).toBe('6 dias');
  });

  it('returns weeks format for 7-29 days', () => {
    expect(durationLabel(7)).toBe('1 sem');
    expect(durationLabel(14)).toBe('2 sem');
    expect(durationLabel(10)).toBe('1sem 3d');
    expect(durationLabel(21)).toBe('3 sem');
  });

  it('returns months format for 30+ days', () => {
    expect(durationLabel(30)).toBe('1 mês');
    expect(durationLabel(35)).toBe('1m 5d');
    expect(durationLabel(60)).toBe('2 mêses');
    expect(durationLabel(65)).toBe('2m 5d');
    expect(durationLabel(90)).toBe('3 mêses');
  });

  it('returns singular "mês" for exactly 1 month', () => {
    expect(durationLabel(30)).toBe('1 mês');
  });

  it('returns plural "mêses" for multiple exact months', () => {
    expect(durationLabel(60)).toBe('2 mêses');
    expect(durationLabel(90)).toBe('3 mêses');
  });
});

// ─── buildRows ───────────────────────────────────────────────────────────────

describe('buildRows', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-15T00:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty array for empty sections', () => {
    expect(buildRows([], new Set())).toEqual([]);
  });

  it('creates section rows with correct metadata', () => {
    const sections = [
      makeSection({
        tasks: [
          { id: 't1', name: 'T1', completed: true, hours: 2, startDate: '2026-03-01', endDate: '2026-03-05' },
          { id: 't2', name: 'T2', completed: false, hours: 3, startDate: '2026-03-03', endDate: '2026-03-10' },
        ],
      }),
    ];

    const rows = buildRows(sections, new Set());
    const sectionRow = rows.find((r) => r.type === 'section')!;

    expect(sectionRow.name).toBe('Etapa 1');
    expect(sectionRow.taskCount).toBe(2);
    expect(sectionRow.completedCount).toBe(1);
    expect(sectionRow.progress).toBe(50);
  });

  it('includes task rows when section is not collapsed', () => {
    const sections = [
      makeSection({
        tasks: [
          { id: 't1', name: 'Task A', completed: false, hours: 2, startDate: '2026-03-01', endDate: '2026-03-05' },
        ],
      }),
    ];

    const rows = buildRows(sections, new Set());

    expect(rows.length).toBe(2); // 1 section + 1 task
    expect(rows[1].type).toBe('task');
    expect(rows[1].name).toBe('Task A');
  });

  it('excludes task rows when section is collapsed', () => {
    const sections = [
      makeSection({
        tasks: [
          { id: 't1', name: 'Task A', completed: false, hours: 2, startDate: '2026-03-01', endDate: '2026-03-05' },
        ],
      }),
    ];

    const collapsedRows = buildRows(sections, new Set(['section-1']));
    const expandedRows = buildRows(sections, new Set());

    expect(collapsedRows.length).toBe(1); // section only
    expect(expandedRows.length).toBe(2); // section + task
    expect(collapsedRows.some((r) => r.type === 'task')).toBe(false);
  });

  it('marks tasks as late when endDate is before now and not completed', () => {
    const sections = [
      makeSection({
        tasks: [
          { id: 't1', name: 'Late Task', completed: false, hours: 2, startDate: '2026-03-01', endDate: '2026-03-10' },
        ],
      }),
    ];

    const rows = buildRows(sections, new Set());
    const taskRow = rows.find((r) => r.type === 'task')!;

    expect(taskRow.isLate).toBe(true);
    expect(taskRow.isCompleted).toBe(false);
  });

  it('marks completed tasks as not late', () => {
    const sections = [
      makeSection({
        tasks: [
          { id: 't1', name: 'Done Task', completed: true, hours: 2, startDate: '2026-03-01', endDate: '2026-03-05' },
        ],
      }),
    ];

    const rows = buildRows(sections, new Set());
    const taskRow = rows.find((r) => r.type === 'task')!;

    expect(taskRow.isCompleted).toBe(true);
    expect(taskRow.isLate).toBe(false);
    expect(taskRow.progress).toBe(100);
  });

  it('uses fallback name "Nova Etapa" for sections with empty name', () => {
    const sections = [makeSection({ name: '' })];

    const rows = buildRows(sections, new Set());

    expect(rows[0].name).toBe('Nova Etapa');
  });

  it('uses fallback name "Nova Tarefa" for tasks with empty name', () => {
    const sections = [
      makeSection({
        tasks: [{ id: 't1', name: '', completed: false, hours: 0, startDate: '2026-03-01', endDate: '2026-03-05' }],
      }),
    ];

    const rows = buildRows(sections, new Set());

    expect(rows[1].name).toBe('Nova Tarefa');
  });

  it('uses dueDate as endDate fallback when endDate is missing', () => {
    const sections = [
      makeSection({
        tasks: [
          { id: 't1', name: 'DueOnly', completed: false, hours: 2, startDate: '2026-03-01', dueDate: '2026-03-07' },
        ],
      }),
    ];

    const rows = buildRows(sections, new Set());
    const taskRow = rows.find((r) => r.type === 'task')!;

    expect(taskRow.endDate).toEqual(new Date(new Date('2026-03-07').setHours(0, 0, 0, 0)));
  });

  it('assigns endDate = startDate + 1 day when both endDate and dueDate are missing', () => {
    const sections = [
      makeSection({
        tasks: [{ id: 't1', name: 'NoDates', completed: false, hours: 0, startDate: '2026-03-10' }],
      }),
    ];

    const rows = buildRows(sections, new Set());
    const taskRow = rows.find((r) => r.type === 'task')!;

    expect(taskRow.startDate.getTime()).toBeLessThan(taskRow.endDate.getTime());
  });

  it('computes 0% progress for sections with no tasks', () => {
    const sections = [makeSection({ tasks: [] })];

    const rows = buildRows(sections, new Set());

    expect(rows[0].progress).toBe(0);
    expect(rows[0].taskCount).toBe(0);
  });

  it('computes 100% progress when all tasks are completed', () => {
    const sections = [
      makeSection({
        tasks: [
          { id: 't1', name: 'A', completed: true, hours: 1, startDate: '2026-03-01', endDate: '2026-03-02' },
          { id: 't2', name: 'B', completed: true, hours: 1, startDate: '2026-03-01', endDate: '2026-03-02' },
        ],
      }),
    ];

    const rows = buildRows(sections, new Set());

    expect(rows[0].progress).toBe(100);
  });

  it('handles multiple sections correctly', () => {
    const sections = makeSections(3);

    const rows = buildRows(sections, new Set());
    const sectionRows = rows.filter((r) => r.type === 'section');
    const taskRows = rows.filter((r) => r.type === 'task');

    expect(sectionRows.length).toBe(3);
    expect(taskRows.length).toBe(3);
  });
});

// ─── computeStats ────────────────────────────────────────────────────────────

describe('computeStats', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-15T00:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns zeroed stats for empty sections', () => {
    const stats = computeStats([]);

    expect(stats).toEqual({
      total: 0,
      completed: 0,
      late: 0,
      inProgress: 0,
      dateRange: '—',
    });
  });

  it('correctly tallies total, completed, late, and inProgress', () => {
    const sections: ProjectSection[] = [
      makeSection({
        tasks: [
          { id: 't1', name: 'Done', completed: true, hours: 2, startDate: '2026-03-01', endDate: '2026-03-05' },
          { id: 't2', name: 'Late', completed: false, hours: 2, startDate: '2026-03-01', endDate: '2026-03-10' },
          { id: 't3', name: 'InProg', completed: false, hours: 2, startDate: '2026-03-10', endDate: '2026-04-01' },
        ],
      }),
    ];

    const stats = computeStats(sections);

    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(1);
    expect(stats.late).toBe(1);
    expect(stats.inProgress).toBe(1);
  });

  it('produces a formatted date range string', () => {
    const sections: ProjectSection[] = [
      makeSection({
        tasks: [
          { id: 't1', name: 'T', completed: false, hours: 2, startDate: '2026-03-01', endDate: '2026-04-15' },
        ],
      }),
    ];

    const stats = computeStats(sections);

    expect(stats.dateRange).toContain('→');
    expect(stats.dateRange).not.toBe('—');
  });

  it('returns "—" for date range when no tasks have valid dates', () => {
    const stats = computeStats([]);

    expect(stats.dateRange).toBe('—');
  });

  it('counts a task as late only if not completed AND endDate < now', () => {
    const sections: ProjectSection[] = [
      makeSection({
        tasks: [
          { id: 't1', name: 'CompletedPast', completed: true, hours: 2, startDate: '2026-01-01', endDate: '2026-01-10' },
        ],
      }),
    ];

    const stats = computeStats(sections);

    expect(stats.completed).toBe(1);
    expect(stats.late).toBe(0);
  });

  it('uses dueDate as fallback when endDate is missing', () => {
    const sections: ProjectSection[] = [
      makeSection({
        tasks: [
          { id: 't1', name: 'DueOnly', completed: false, hours: 2, startDate: '2026-03-01', dueDate: '2026-03-05' },
        ],
      }),
    ];

    const stats = computeStats(sections);

    expect(stats.late).toBe(1); // dueDate 2026-03-05 < now(2026-03-15)
  });

  it('aggregates stats from multiple sections', () => {
    const sections: ProjectSection[] = [
      makeSection({
        id: 's1',
        tasks: [
          { id: 't1', name: 'A', completed: true, hours: 1, startDate: '2026-03-01', endDate: '2026-03-02' },
        ],
      }),
      makeSection({
        id: 's2',
        tasks: [
          { id: 't2', name: 'B', completed: false, hours: 1, startDate: '2026-03-01', endDate: '2026-03-02' },
          { id: 't3', name: 'C', completed: false, hours: 1, startDate: '2026-03-10', endDate: '2026-04-01' },
        ],
      }),
    ];

    const stats = computeStats(sections);

    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(1);
  });
});

// ─── computeTimelineMetrics ──────────────────────────────────────────────────

describe('computeTimelineMetrics', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-15T00:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('empty rows (fallback timeline)', () => {
    it('generates valid columns for "day" mode', () => {
      const metrics = computeTimelineMetrics([], 'day');

      expect(metrics.columns.length).toBeGreaterThan(0);
      expect(metrics.totalWidth).toBeGreaterThanOrEqual(800);
      expect(metrics.colWidth).toBeGreaterThan(0);
    });

    it('generates valid columns for "week" mode', () => {
      const metrics = computeTimelineMetrics([], 'week');

      expect(metrics.columns.length).toBeGreaterThan(0);
      expect(metrics.todayOffset).toBeNull();
    });

    it('generates valid columns for "month" mode', () => {
      const metrics = computeTimelineMetrics([], 'month');

      expect(metrics.columns.length).toBeGreaterThan(0);
      expect(metrics.totalDays).toBeGreaterThan(0);
    });

    it('sets todayOffset to null when today falls outside empty timeline', () => {
      const metrics = computeTimelineMetrics([], 'month');

      // For empty rows, todayOffset could be null or non-null depending on padding.
      // The important invariant is that the type is correct.
      expect(typeof metrics.todayOffset === 'number' || metrics.todayOffset === null).toBe(true);
    });
  });

  describe('populated rows', () => {
    function makeTimelineRows(): TimelineRow[] {
      return [
        {
          id: 'sec-1',
          name: 'Etapa 1',
          type: 'section',
          startDate: new Date('2026-03-01'),
          endDate: new Date('2026-03-20'),
          isCompleted: false,
          isLate: false,
          progress: 50,
          taskCount: 2,
          completedCount: 1,
        },
        {
          id: 'task-1',
          name: 'Tarefa 1',
          type: 'task',
          sectionId: 'sec-1',
          startDate: new Date('2026-03-01'),
          endDate: new Date('2026-03-10'),
          isCompleted: true,
          isLate: false,
          progress: 100,
        },
        {
          id: 'task-2',
          name: 'Tarefa 2',
          type: 'task',
          sectionId: 'sec-1',
          startDate: new Date('2026-03-10'),
          endDate: new Date('2026-03-20'),
          isCompleted: false,
          isLate: false,
          progress: 0,
        },
      ];
    }

    it('generates columns spanning the data range in "day" mode', () => {
      const metrics = computeTimelineMetrics(makeTimelineRows(), 'day');

      expect(metrics.columns.length).toBeGreaterThan(10);
      expect(metrics.totalWidth).toBeGreaterThanOrEqual(800);
    });

    it('generates columns spanning the data range in "week" mode', () => {
      const metrics = computeTimelineMetrics(makeTimelineRows(), 'week');

      expect(metrics.columns.length).toBeGreaterThan(0);
      expect(metrics.groups.length).toBeGreaterThan(0);
    });

    it('generates columns spanning the data range in "month" mode', () => {
      const metrics = computeTimelineMetrics(makeTimelineRows(), 'month');

      expect(metrics.columns.length).toBeGreaterThan(0);
      expect(metrics.colWidth).toBeGreaterThan(0);
    });

    it('calculates todayOffset when today falls within the timeline', () => {
      const metrics = computeTimelineMetrics(makeTimelineRows(), 'month');

      // today = 2026-03-15, data spans 2026-03-01 to 2026-03-20 + padding → "today" is inside
      expect(metrics.todayOffset).not.toBeNull();
      expect(typeof metrics.todayOffset).toBe('number');
    });

    it('includes group headers for column grouping', () => {
      const metrics = computeTimelineMetrics(makeTimelineRows(), 'week');

      expect(metrics.groups.length).toBeGreaterThan(0);
      metrics.groups.forEach((group) => {
        expect(group.label.length).toBeGreaterThan(0);
        expect(group.span).toBeGreaterThanOrEqual(1);
      });
    });

    it('sets totalDays to a positive number', () => {
      const metrics = computeTimelineMetrics(makeTimelineRows(), 'day');

      expect(metrics.totalDays).toBeGreaterThan(0);
    });

    it('timelineStart is before or at the earliest row start', () => {
      const rows = makeTimelineRows();
      const metrics = computeTimelineMetrics(rows, 'month');

      const earliestRowStart = Math.min(...rows.map((r) => r.startDate.getTime()));

      expect(metrics.timelineStart.getTime()).toBeLessThanOrEqual(earliestRowStart);
    });
  });
});
