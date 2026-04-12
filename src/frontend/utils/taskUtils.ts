import type { AgendaEvent, KanbanStatus } from '../types';

type TaskTone = 'info' | 'success' | 'warning' | 'accent' | 'danger';

export const priorityConfig: Record<number, { label: string; tone: TaskTone }> = {
  1: { label: 'Opcional', tone: 'info' },
  2: { label: 'Baixa', tone: 'success' },
  3: { label: 'Média', tone: 'warning' },
  4: { label: 'Alta', tone: 'accent' },
  5: { label: 'Crítica', tone: 'danger' },
};

export const allSubtasksDone = (task: AgendaEvent): boolean => {
  if (!task.subtasks || task.subtasks.length === 0) return true;
  return task.subtasks.every((subtask) => subtask.completed);
};

export const archiveCompletedTask = (task: AgendaEvent): AgendaEvent => {
  const isCompleted = task.completed || task.kanbanStatus === 'done';

  if (!isCompleted) {
    return task;
  }

  return {
    ...task,
    completed: true,
    archived: true,
    kanbanStatus: 'done',
  };
};

export const isArchivedTask = (task: AgendaEvent): boolean => Boolean(task.archived);

export const reactivateArchivedTask = (task: AgendaEvent): AgendaEvent => ({
  ...task,
  archived: false,
  completed: false,
  kanbanStatus: 'todo',
});

export const KANBAN_COLUMNS: {
  id: KanbanStatus;
  title: string;
  tone: TaskTone;
  canAdd: boolean;
}[] = [
  { id: 'todo', title: 'A Fazer', tone: 'info', canAdd: true },
  { id: 'in_progress', title: 'Em Andamento', tone: 'warning', canAdd: true },
  { id: 'review', title: 'Aguardando', tone: 'accent', canAdd: true },
  { id: 'done', title: 'Concluído', tone: 'success', canAdd: false },
];
