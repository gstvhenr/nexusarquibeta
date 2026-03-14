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
    bg: 'bg-warning/10 dark:bg-warning/15',
    border: 'border-warning/30 dark:border-warning/20',
    shadow: 'shadow-warning/20 dark:shadow-warning/10',
    label: 'Amarelo',
  },
  {
    key: 'green',
    bg: 'bg-success/10 dark:bg-success/15',
    border: 'border-success/30 dark:border-success/20',
    shadow: 'shadow-success/20 dark:shadow-success/10',
    label: 'Verde',
  },
  {
    key: 'blue',
    bg: 'bg-info/10 dark:bg-info/15',
    border: 'border-info/30 dark:border-info/20',
    shadow: 'shadow-info/20 dark:shadow-info/10',
    label: 'Azul',
  },
  {
    key: 'pink',
    bg: 'bg-error/10 dark:bg-error/15',
    border: 'border-error/30 dark:border-error/20',
    shadow: 'shadow-error/20 dark:shadow-error/10',
    label: 'Rosa',
  },
  {
    key: 'orange',
    bg: 'bg-accent/10 dark:bg-accent/15',
    border: 'border-accent/30 dark:border-accent/20',
    shadow: 'shadow-accent/20 dark:shadow-accent/10',
    label: 'Laranja',
  },
  {
    key: 'teal',
    bg: 'bg-secondary/10 dark:bg-secondary/15',
    border: 'border-secondary/30 dark:border-secondary/20',
    shadow: 'shadow-secondary/20 dark:shadow-secondary/10',
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
