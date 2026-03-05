import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ProjectSection } from '@/types';
import {
  buildRows,
  computeStats,
  computeTimelineMetrics,
  dateToPixel,
  diffDays,
  durationLabel,
} from './helpers';
import type { TimeColumn, TimelineRow } from './types';

describe('project-gantt helpers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('computes basic date helpers', () => {
    expect(diffDays(new Date('2026-03-01'), new Date('2026-03-05'))).toBe(4);
    expect(durationLabel(1)).toBe('1 dia');
    expect(durationLabel(3)).toBe('3 dias');
    expect(durationLabel(14)).toBe('2 sem');
    expect(durationLabel(35)).toBe('1m 5d');
  });

  it('maps date to pixel based on columns', () => {
    const columns: TimeColumn[] = [
      {
        label: '01',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-02'),
        groupKey: '1',
      },
      {
        label: '02',
        startDate: new Date('2026-03-02'),
        endDate: new Date('2026-03-03'),
        groupKey: '1',
      },
    ];

    const intraDayPixel = dateToPixel(new Date('2026-03-01T12:00:00'), columns, 100);
    expect(intraDayPixel).toBeGreaterThanOrEqual(0);
    expect(intraDayPixel).toBeLessThan(100);
    expect(dateToPixel(new Date('2026-03-03T12:00:00'), columns, 100)).toBe(200);
  });

  it('builds rows and respects collapsed sections', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-10T10:00:00.000Z'));

    const sections: ProjectSection[] = [
      {
        id: 'section-1',
        name: 'Etapa 1',
        tasks: [
          {
            id: 'task-1',
            name: 'Tarefa 1',
            completed: false,
            hours: 2,
            startDate: '2026-03-01',
            endDate: '2026-03-05',
          },
        ],
      },
      {
        id: 'section-2',
        name: 'Etapa 2',
        tasks: [],
      },
    ];

    const expandedRows = buildRows(sections, new Set<string>());
    const collapsedRows = buildRows(sections, new Set<string>(['section-1']));

    expect(expandedRows.length).toBeGreaterThan(collapsedRows.length);
    expect(expandedRows.some((row) => row.id === 'task-1')).toBe(true);
    expect(collapsedRows.some((row) => row.id === 'task-1')).toBe(false);
  });

  it('computes gantt stats and timeline metrics', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T12:00:00.000Z'));

    const sections: ProjectSection[] = [
      {
        id: 'section-1',
        name: 'Etapa 1',
        tasks: [
          {
            id: 't1',
            name: 'Concluída',
            completed: true,
            hours: 2,
            startDate: '2026-03-01',
            endDate: '2026-03-02',
          },
          {
            id: 't2',
            name: 'Atrasada',
            completed: false,
            hours: 2,
            startDate: '2026-03-01',
            endDate: '2026-03-03',
          },
        ],
      },
    ];

    const stats = computeStats(sections);
    expect(stats.total).toBe(2);
    expect(stats.completed).toBe(1);
    expect(stats.late).toBe(1);
    expect(stats.inProgress).toBe(0);

    const emptyMetrics = computeTimelineMetrics([], 'week');
    expect(emptyMetrics.columns.length).toBeGreaterThan(0);
    expect(emptyMetrics.todayOffset).toBeNull();

    const rows: TimelineRow[] = buildRows(sections, new Set<string>());
    const populatedMetrics = computeTimelineMetrics(rows, 'month');
    expect(populatedMetrics.columns.length).toBeGreaterThan(0);
    expect(populatedMetrics.totalWidth).toBeGreaterThan(0);
  });
});
