import type { Prospect, ProspectPriority, ProspectStatus } from '../../types';

export const getDaysRemaining = (startDate: string, daysToFollow: number): number => {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + daysToFollow);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getPriorityColor = (priority: ProspectPriority): string => {
  switch (priority) {
    case 'Alta':
      return 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400 ring-1 ring-red-500/20';
    case 'Média':
      return 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 ring-1 ring-amber-500/20';
    case 'Baixa':
      return 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400 ring-1 ring-sky-500/20';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const getStatusColor = (status: ProspectStatus): string => {
  switch (status) {
    case 'Em Aberto':
      return 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400 ring-1 ring-sky-500/20';
    case 'Convertido':
      return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 ring-1 ring-emerald-500/20';
    case 'Perdido':
      return 'bg-gray-500/10 text-gray-500 dark:bg-gray-500/15 dark:text-gray-400 ring-1 ring-gray-500/20';
    default:
      return 'bg-gray-100';
  }
};

export const getProgressGradient = (daysRemaining: number): string => {
  if (daysRemaining <= 3) return 'from-red-500 to-rose-400';
  if (daysRemaining <= 7) return 'from-amber-500 to-orange-400';
  return 'from-emerald-500 to-teal-400';
};

const PRIORITY_WEIGHT: Record<ProspectPriority, number> = { Alta: 3, Média: 2, Baixa: 1 };

export const sortProspectsForRadar = (a: Prospect, b: Prospect): number => {
  const weightDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  if (weightDiff !== 0) return weightDiff;

  const daysA = getDaysRemaining(a.startDate, a.followUpDays);
  const daysB = getDaysRemaining(b.startDate, b.followUpDays);
  return daysA - daysB;
};
