export type ReminderColorOption = {
  key: string;
  bg: string;
  border: string;
  shadow: string;
  label: string;
};

export const POST_IT_COLORS: ReminderColorOption[] = [
  {
    key: 'yellow',
    bg: 'bg-amber-50 dark:bg-amber-500/15',
    border: 'border-amber-200/60 dark:border-amber-600/40',
    shadow: 'shadow-amber-200/40 dark:shadow-amber-900/20',
    label: 'Amarelo',
  },
  {
    key: 'green',
    bg: 'bg-emerald-50 dark:bg-emerald-500/15',
    border: 'border-emerald-200/60 dark:border-emerald-600/40',
    shadow: 'shadow-emerald-200/40 dark:shadow-emerald-900/20',
    label: 'Verde',
  },
  {
    key: 'blue',
    bg: 'bg-sky-50 dark:bg-sky-500/15',
    border: 'border-sky-200/60 dark:border-sky-600/40',
    shadow: 'shadow-sky-200/40 dark:shadow-sky-900/20',
    label: 'Azul',
  },
  {
    key: 'pink',
    bg: 'bg-rose-50 dark:bg-rose-500/15',
    border: 'border-rose-200/60 dark:border-rose-600/40',
    shadow: 'shadow-rose-200/40 dark:shadow-rose-900/20',
    label: 'Rosa',
  },
  {
    key: 'orange',
    bg: 'bg-orange-50 dark:bg-orange-500/15',
    border: 'border-orange-200/60 dark:border-orange-600/40',
    shadow: 'shadow-orange-200/40 dark:shadow-orange-900/20',
    label: 'Laranja',
  },
  {
    key: 'teal',
    bg: 'bg-teal-50 dark:bg-teal-500/15',
    border: 'border-teal-200/60 dark:border-teal-600/40',
    shadow: 'shadow-teal-200/40 dark:shadow-teal-900/20',
    label: 'Verde-água',
  },
];

export const getReminderColorStyle = (key: string) =>
  POST_IT_COLORS.find((c) => c.key === key) || POST_IT_COLORS[0];

export const REMINDER_ROTATIONS = [
  'rotate-[-1.5deg]',
  'rotate-[1.2deg]',
  'rotate-[-2deg]',
  'rotate-[0.5deg]',
  'rotate-[2.2deg]',
  'rotate-[-0.8deg]',
  'rotate-[1.8deg]',
  'rotate-[-1deg]',
];
