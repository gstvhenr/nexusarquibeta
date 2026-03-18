import type { ProjectSection } from '@/types';
import type {
  GanttStats,
  GroupHeader,
  TimeColumn,
  TimelineMetrics,
  TimelineRow,
  ViewMode,
} from './types';

const DAY_MS = 86_400_000;
export const ROW_H = 42;
export const SECTION_ROW_H = 38;
export const NAME_COL_W = 240;
const MONTH_COL_PX = 130;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function diffDays(start: Date, end: Date) {
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / DAY_MS);
}

/**
 * Column-aware date → pixel offset.
 * Finds the column the date falls into, then interpolates within it.
 * Always precise regardless of column span (day/week/month).
 */
export function dateToPixel(date: Date, columns: TimeColumn[], colWidth: number): number {
  const dateMs = startOfDay(date).getTime();

  for (let i = 0; i < columns.length; i++) {
    const colStartMs = columns[i].startDate.getTime();
    const colEndMs = columns[i].endDate.getTime();

    if (dateMs < colEndMs) {
      const fraction = Math.max(0, (dateMs - colStartMs) / (colEndMs - colStartMs));
      return i * colWidth + fraction * colWidth;
    }
  }

  // Date is past the last column → clamp to right edge
  return columns.length * colWidth;
}

function fmtDate(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

export function fmtFullDate(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function durationLabel(days: number) {
  if (days <= 1) return '1 dia';
  if (days < 7) return `${days} dias`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remDays = days % 7;
    return remDays > 0 ? `${weeks}sem ${remDays}d` : `${weeks} sem`;
  }
  const months = Math.floor(days / 30);
  const remDays = days % 30;
  return remDays > 0 ? `${months}m ${remDays}d` : `${months} mês${months > 1 ? 'es' : ''}`;
}

function getMonday(date: Date) {
  const result = new Date(date);
  const diff = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - diff);
  return startOfDay(result);
}

function countMonths(start: Date, end: Date): number {
  const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth() + 1, 1);
  let count = 0;
  const cursor = new Date(startMonth);

  while (cursor < endMonth) {
    count += 1;
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return Math.max(1, count);
}

function generateColumns(
  start: Date,
  end: Date,
  mode: ViewMode,
  today: Date,
): { columns: TimeColumn[]; groups: GroupHeader[] } {
  const columns: TimeColumn[] = [];

  if (mode === 'day') {
    let cursor = new Date(start);
    while (cursor <= end) {
      const next = addDays(cursor, 1);
      const weekdayShort = cursor
        .toLocaleDateString('pt-BR', { weekday: 'short' })
        .replace('.', '');
      const dayNum = cursor.toLocaleDateString('pt-BR', { day: '2-digit' });
      const capitalWeekday = weekdayShort.charAt(0).toUpperCase() + weekdayShort.slice(1);
      columns.push({
        label: `${dayNum}\n${capitalWeekday}.`,
        startDate: new Date(cursor),
        endDate: next,
        isToday: startOfDay(cursor).getTime() === startOfDay(today).getTime(),
        isWeekend: cursor.getDay() === 0 || cursor.getDay() === 6,
        groupKey: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      });
      cursor = next;
    }
  } else if (mode === 'week') {
    let cursor = getMonday(start);
    while (cursor <= end) {
      const weekEnd = addDays(cursor, 7);
      columns.push({
        label: `${cursor.toLocaleDateString('pt-BR', { day: '2-digit' })}–${addDays(cursor, 6).toLocaleDateString('pt-BR', { day: '2-digit' })}`,
        startDate: new Date(cursor),
        endDate: weekEnd,
        isToday:
          startOfDay(today).getTime() >= cursor.getTime() &&
          startOfDay(today).getTime() < weekEnd.getTime(),
        groupKey: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      });
      cursor = weekEnd;
    }
  } else {
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      columns.push({
        label: cursor.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        startDate: new Date(cursor),
        endDate: nextMonth,
        isToday:
          today.getFullYear() === cursor.getFullYear() && today.getMonth() === cursor.getMonth(),
        groupKey: `${cursor.getFullYear()}`,
      });
      cursor = nextMonth;
    }
  }

  const groups: GroupHeader[] = [];
  let currentGroup: GroupHeader | null = null;

  columns.forEach((column) => {
    let label: string;
    if (mode === 'day' || mode === 'week') {
      const date = column.startDate;
      const formatted = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      label = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } else {
      label = column.startDate.getFullYear().toString();
    }

    if (currentGroup && currentGroup.label === label) {
      currentGroup.span += 1;
    } else {
      currentGroup = { label, span: 1 };
      groups.push(currentGroup);
    }
  });

  return { columns, groups };
}

export function buildRows(
  sections: ProjectSection[],
  collapsedSections: Set<string>,
): TimelineRow[] {
  const rows: TimelineRow[] = [];
  const now = new Date();

  sections.forEach((section) => {
    let sectionStart = Infinity;
    let sectionEnd = -Infinity;
    let completedCount = 0;

    section.tasks.forEach((task) => {
      const start = task.startDate ? new Date(task.startDate).getTime() : now.getTime();
      const end = task.endDate
        ? new Date(task.endDate).getTime()
        : task.dueDate
          ? new Date(task.dueDate).getTime()
          : start + DAY_MS;

      if (!Number.isNaN(start) && start < sectionStart) sectionStart = start;
      if (!Number.isNaN(end) && end > sectionEnd) sectionEnd = end;
      if (task.completed) completedCount += 1;
    });

    if (!Number.isFinite(sectionStart)) {
      sectionStart = now.getTime();
      sectionEnd = now.getTime() + DAY_MS;
    }

    rows.push({
      id: section.id,
      name: section.name || 'Nova Etapa',
      type: 'section',
      startDate: new Date(sectionStart),
      endDate: new Date(sectionEnd),
      isCompleted: false,
      isLate: false,
      progress:
        section.tasks.length > 0 ? Math.round((completedCount / section.tasks.length) * 100) : 0,
      taskCount: section.tasks.length,
      completedCount,
    });

    if (collapsedSections.has(section.id)) return;

    section.tasks.forEach((task) => {
      let startDate = task.startDate
        ? startOfDay(new Date(task.startDate))
        : startOfDay(new Date());
      if (Number.isNaN(startDate.getTime())) startDate = startOfDay(new Date());

      let endDate = task.endDate
        ? startOfDay(new Date(task.endDate))
        : task.dueDate
          ? startOfDay(new Date(task.dueDate))
          : null;
      if (!endDate || Number.isNaN(endDate.getTime())) endDate = addDays(startDate, 1);
      if (endDate <= startDate) endDate = addDays(startDate, 1);

      const isCompleted = !!task.completed;
      const isLate = !isCompleted && endDate < now;

      rows.push({
        id: task.id,
        name: task.name || 'Nova Tarefa',
        type: 'task',
        sectionId: section.id,
        startDate,
        endDate,
        isCompleted,
        isLate,
        progress: isCompleted ? 100 : 0,
      });
    });
  });

  return rows;
}

export function computeStats(sections: ProjectSection[]): GanttStats {
  let total = 0;
  let completed = 0;
  let late = 0;
  let minDate = Infinity;
  let maxDate = -Infinity;
  const now = new Date();

  sections.forEach((section) => {
    section.tasks.forEach((task) => {
      total += 1;
      if (task.completed) {
        completed += 1;
      } else {
        const endDate = task.endDate
          ? new Date(task.endDate)
          : task.dueDate
            ? new Date(task.dueDate)
            : null;
        if (endDate && endDate < now) late += 1;
      }

      const start = task.startDate ? new Date(task.startDate).getTime() : now.getTime();
      const end =
        task.endDate || task.dueDate
          ? new Date(task.endDate || task.dueDate!).getTime()
          : start + DAY_MS;

      if (!Number.isNaN(start) && start < minDate) minDate = start;
      if (!Number.isNaN(end) && end > maxDate) maxDate = end;
    });
  });

  const inProgress = total - completed - late;
  const dateRange =
    Number.isFinite(minDate) && Number.isFinite(maxDate)
      ? `${fmtDate(new Date(minDate))} → ${fmtDate(new Date(maxDate))}`
      : '—';

  return { total, completed, late, inProgress, dateRange };
}

export function computeTimelineMetrics(
  rows: TimelineRow[],
  viewMode: ViewMode,
  minWidth = 0,
): TimelineMetrics {
  const now = startOfDay(new Date());

  /** Minimum end date so the timeline always shows a meaningful span. */
  const ensureMinSpan = (start: Date, end: Date): Date => {
    if (viewMode === 'day') {
      // At least 30 days visible
      const minEnd = addDays(start, 30);
      return end < minEnd ? minEnd : end;
    }
    if (viewMode === 'week') {
      // At least 4 weeks visible
      const minEnd = addDays(start, 28);
      return end < minEnd ? minEnd : end;
    }
    // month — at least 12 months visible
    const minEnd = new Date(start.getFullYear(), start.getMonth() + 12, start.getDate());
    return end < minEnd ? minEnd : end;
  };

  if (rows.length === 0) {
    const start = addDays(now, -7);
    const end = ensureMinSpan(start, addDays(now, 30));
    const { columns, groups } = generateColumns(start, end, viewMode, now);
    const months = countMonths(start, end);
    const totalWidth =
      viewMode === 'month' && minWidth > 0
        ? minWidth
        : Math.max(800, months * MONTH_COL_PX, minWidth);
    const colWidth = totalWidth / columns.length;

    return {
      timelineStart: columns[0].startDate,
      totalDays: diffDays(columns[0].startDate, columns[columns.length - 1].endDate),
      columns,
      groups,
      today: now,
      colWidth,
      totalWidth,
      todayOffset: null,
    };
  }

  let minDate = Infinity;
  let maxDate = -Infinity;
  rows.forEach((row) => {
    if (row.startDate.getTime() < minDate) minDate = row.startDate.getTime();
    if (row.endDate.getTime() > maxDate) maxDate = row.endDate.getTime();
  });

  const padding = viewMode === 'day' ? 3 : viewMode === 'week' ? 7 : 15;
  const start = addDays(startOfDay(new Date(minDate)), -padding);
  const end = ensureMinSpan(start, addDays(startOfDay(new Date(maxDate)), padding));

  const { columns, groups } = generateColumns(start, end, viewMode, now);
  const months = countMonths(start, end);
  const totalWidth =
    viewMode === 'month' && minWidth > 0
      ? minWidth
      : Math.max(800, months * MONTH_COL_PX, minWidth);
  const colWidth = totalWidth / columns.length;

  const timelineStart = columns[0].startDate;
  const lastColEnd = columns[columns.length - 1].endDate;
  const totalDays = diffDays(timelineStart, lastColEnd);

  const nowMs = now.getTime();
  const todayOffset =
    nowMs >= timelineStart.getTime() && nowMs <= lastColEnd.getTime()
      ? dateToPixel(now, columns, colWidth)
      : null;

  return {
    timelineStart,
    totalDays,
    columns,
    groups,
    today: now,
    colWidth,
    totalWidth,
    todayOffset,
  };
}
