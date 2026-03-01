import type { AgendaEvent, AgendaEventType, AgendaEventRecurrence } from '../../types';

export const priorityConfig: Record<
  number,
  { bg: string; text: string; name: string; swatchClass: string }
> = {
  1: {
    bg: 'bg-sky-100 dark:bg-sky-900/40',
    text: 'text-sky-800 dark:text-sky-300',
    name: 'Opcional',
    swatchClass: 'priority-swatch-1',
  },
  2: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    name: 'Baixa',
    swatchClass: 'priority-swatch-2',
  },
  3: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
    text: 'text-yellow-800 dark:text-yellow-300',
    name: 'Moderada',
    swatchClass: 'priority-swatch-3',
  },
  4: {
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-800 dark:text-orange-300',
    name: 'Alta',
    swatchClass: 'priority-swatch-4',
  },
  5: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-800 dark:text-red-300',
    name: 'Crítica',
    swatchClass: 'priority-swatch-5',
  },
};

export const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Opcional', color: 'text-sky-600 dark:text-sky-400' },
  2: { label: 'Baixa', color: 'text-emerald-600 dark:text-emerald-400' },
  3: { label: 'Média', color: 'text-yellow-600 dark:text-yellow-400' },
  4: { label: 'Alta', color: 'text-orange-600 dark:text-orange-400' },
  5: { label: 'Crítica', color: 'text-red-600 dark:text-red-400' },
};

export const getInitialEvent = (date: Date): Omit<AgendaEvent, 'id'> => ({
  title: '',
  date: date.toISOString().split('T')[0],
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
