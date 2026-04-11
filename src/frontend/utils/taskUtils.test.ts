import { describe, expect, it } from 'vitest';
import type { AgendaEvent } from '@/types';
import {
  archiveCompletedTask,
  isArchivedTask,
  KANBAN_COLUMNS,
  priorityConfig,
  reactivateArchivedTask,
} from './taskUtils';

describe('taskUtils semantic contracts', () => {
  it('exposes semantic tones for task priorities', () => {
    expect(priorityConfig[5]).toEqual({ label: 'Crítica', tone: 'danger' });
    expect(priorityConfig[4]).toEqual({ label: 'Alta', tone: 'accent' });

    Object.values(priorityConfig).forEach((config) => {
      expect(config).not.toHaveProperty('bg');
      expect(config).not.toHaveProperty('text');
      expect(config).not.toHaveProperty('border');
    });
  });

  it('exposes semantic tones for kanban columns without visual classes', () => {
    expect(KANBAN_COLUMNS).toEqual([
      { id: 'todo', title: 'A Fazer', tone: 'info', canAdd: true },
      { id: 'in_progress', title: 'Em Andamento', tone: 'warning', canAdd: true },
      { id: 'review', title: 'Aguardando Retorno', tone: 'accent', canAdd: true },
      { id: 'done', title: 'Concluído', tone: 'success', canAdd: false },
    ]);

    KANBAN_COLUMNS.forEach((column) => {
      expect(column).not.toHaveProperty('color');
    });
  });

  it('archives completed tasks for historical view', () => {
    const task = {
      id: 'task-1',
      title: 'Tarefa concluida',
      date: '2026-04-11',
      time: '09:00',
      type: 'Desenvolvimento de Projeto',
      priority: 3,
      recurrence: 'none',
      completed: true,
      kanbanStatus: 'done',
      archived: false,
    } as AgendaEvent;

    expect(archiveCompletedTask(task)).toEqual({
      ...task,
      archived: true,
      completed: true,
      kanbanStatus: 'done',
    });
    expect(isArchivedTask(task)).toBe(true);
  });

  it('reactivates archived tasks back into the active board', () => {
    const task = {
      id: 'task-2',
      title: 'Tarefa arquivada',
      date: '2026-04-11',
      time: '10:00',
      type: 'Desenvolvimento de Projeto',
      priority: 2,
      recurrence: 'none',
      completed: true,
      kanbanStatus: 'done',
      archived: true,
    } as AgendaEvent;

    expect(reactivateArchivedTask(task)).toEqual({
      ...task,
      archived: false,
      completed: false,
      kanbanStatus: 'todo',
    });
  });
});
