export type CalendarViewMode = 'monthly' | 'weekly';

export const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const HOUR_HEIGHT_PX = 56;

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
    bg: 'bg-info/15 dark:bg-info/15',
    text: 'text-info dark:text-info',
    name: 'Opcional',
    dotClass: 'priority-swatch-1',
  },
  2: {
    bg: 'bg-success/15 dark:bg-success/15',
    text: 'text-success dark:text-success',
    name: 'Baixa',
    dotClass: 'priority-swatch-2',
  },
  3: {
    bg: 'bg-warning/15 dark:bg-warning/15',
    text: 'text-warning dark:text-warning',
    name: 'Moderada',
    dotClass: 'priority-swatch-3',
  },
  4: {
    bg: 'bg-warning/25 dark:bg-warning/20',
    text: 'text-warning dark:text-warning',
    name: 'Alta',
    dotClass: 'priority-swatch-4',
  },
  5: {
    bg: 'bg-error/15 dark:bg-error/15',
    text: 'text-error dark:text-error',
    name: 'Crítica',
    dotClass: 'priority-swatch-5',
  },
};
