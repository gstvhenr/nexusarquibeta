export type CalendarViewMode = 'monthly' | 'weekly';

export const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const HOUR_HEIGHT_PX = 56;

export const DEFAULT_CELL_HEIGHT_REM = 5;
export const CELL_HEIGHT_STORAGE_KEY = 'nexus-agenda-cell-height-scale';

export const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const priorityColors: Record<
  number,
  { bg: string; text: string; name: string; dotClass: string }
> = {
  1: {
    bg: 'bg-sky-100 dark:bg-sky-900/40',
    text: 'text-sky-800 dark:text-sky-300',
    name: 'Opcional',
    dotClass: 'priority-swatch-1',
  },
  2: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    name: 'Baixa',
    dotClass: 'priority-swatch-2',
  },
  3: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
    text: 'text-yellow-800 dark:text-yellow-300',
    name: 'Moderada',
    dotClass: 'priority-swatch-3',
  },
  4: {
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-800 dark:text-orange-300',
    name: 'Alta',
    dotClass: 'priority-swatch-4',
  },
  5: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-800 dark:text-red-300',
    name: 'Crítica',
    dotClass: 'priority-swatch-5',
  },
};
