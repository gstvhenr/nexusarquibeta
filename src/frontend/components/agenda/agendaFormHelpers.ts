import type { AgendaEvent, AgendaEventType, AgendaEventRecurrence } from '../../types';
import { toDateOnlyString } from '../../utils/formatters';

export const priorityConfig: Record<
  number,
  { bg: string; text: string; name: string; swatchClass: string }
> = {
  1: {
    bg: 'bg-info/10 dark:bg-info/20',
    text: 'text-info',
    name: 'Opcional',
    swatchClass: 'priority-swatch-1',
  },
  2: {
    bg: 'bg-success/10 dark:bg-success/20',
    text: 'text-success',
    name: 'Baixa',
    swatchClass: 'priority-swatch-2',
  },
  3: {
    bg: 'bg-warning/10 dark:bg-warning/20',
    text: 'text-warning',
    name: 'Moderada',
    swatchClass: 'priority-swatch-3',
  },
  4: {
    bg: 'bg-accent/10 dark:bg-accent/20',
    text: 'text-accent',
    name: 'Alta',
    swatchClass: 'priority-swatch-4',
  },
  5: {
    bg: 'bg-error/10 dark:bg-error/20',
    text: 'text-error',
    name: 'Crítica',
    swatchClass: 'priority-swatch-5',
  },
};

export const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Opcional', color: 'text-info' },
  2: { label: 'Baixa', color: 'text-success' },
  3: { label: 'Média', color: 'text-warning' },
  4: { label: 'Alta', color: 'text-accent' },
  5: { label: 'Crítica', color: 'text-error' },
};

export const getInitialEvent = (date: Date): Omit<AgendaEvent, 'id'> => ({
  title: '',
  date: toDateOnlyString(date),
  isAllDay: false,
  time: '09:00',
  timeEnd: '10:00',
  type: '' as AgendaEventType,
  description: '',
  priority: 3,
  recurrence: '' as AgendaEventRecurrence,
  completed: false,
  kanbanStatus: 'todo',
  archived: false,
  subtasks: [],
});

/** Format ISO date → "20/02/2026 às 14:30" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} às ${hh}:${min}`;
}

/** Format ISO date → "20/02/2026" */
export function formatDateBR(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
