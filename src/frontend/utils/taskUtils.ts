import type { AgendaEvent, KanbanStatus } from '../types';

export const priorityConfig: Record<
  number,
  { label: string; bg: string; text: string; border: string }
> = {
  1: {
    label: 'Opcional',
    bg: 'bg-sky-50 dark:bg-sky-900/10',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
  },
  2: {
    label: 'Baixa',
    bg: 'bg-emerald-50 dark:bg-emerald-900/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  3: {
    label: 'Média',
    bg: 'bg-yellow-50 dark:bg-yellow-900/10',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  4: {
    label: 'Alta',
    bg: 'bg-orange-50 dark:bg-orange-900/10',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
  },
  5: {
    label: 'Crítica',
    bg: 'bg-red-50 dark:bg-red-900/10',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
};

export const allSubtasksDone = (task: AgendaEvent): boolean => {
  if (!task.subtasks || task.subtasks.length === 0) return true;
  return task.subtasks.every((subtask) => subtask.completed);
};

export const KANBAN_COLUMNS: {
  id: KanbanStatus;
  title: string;
  color: string;
  canAdd: boolean;
}[] = [
  { id: 'todo', title: 'A Fazer', color: 'border-sky-400', canAdd: true },
  { id: 'in_progress', title: 'Em Andamento', color: 'border-yellow-400', canAdd: true },
  { id: 'review', title: 'Aguardando Retorno', color: 'border-purple-400', canAdd: true },
  { id: 'done', title: 'Concluído', color: 'border-emerald-400', canAdd: false },
];
