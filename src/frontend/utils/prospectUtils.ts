import type { Prospect, ProspectPriority } from '../types';

/** Calcula dias restantes do follow-up a partir da data de início. */
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

const PRIORITY_WEIGHT: Record<ProspectPriority, number> = { Alta: 3, Média: 2, Baixa: 1 };

/** Ordena prospects por prioridade (desc) e depois por dias restantes (asc). */
export const sortProspectsForRadar = (a: Prospect, b: Prospect): number => {
  const weightDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  if (weightDiff !== 0) return weightDiff;

  const daysA = getDaysRemaining(a.startDate, a.followUpDays);
  const daysB = getDaysRemaining(b.startDate, b.followUpDays);
  return daysA - daysB;
};
