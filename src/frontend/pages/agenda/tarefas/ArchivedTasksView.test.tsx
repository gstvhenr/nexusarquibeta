import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ArchivedTasksView } from './ArchivedTasksView';
import type { AgendaEvent } from '@/types';

function createTask(id: string, title: string, overrides: Partial<AgendaEvent> = {}): AgendaEvent {
  return {
    id,
    title,
    date: '2026-03-10',
    time: '10:00',
    type: 'Desenvolvimento de Projeto',
    priority: 3,
    recurrence: 'none',
    archived: true,
    kanbanStatus: 'done',
    ...overrides,
  };
}

function renderView(
  tasks: AgendaEvent[],
  callbacks?: {
    onOpenDetail?: (t: AgendaEvent) => void;
    onOpenEdit?: (t: AgendaEvent) => void;
    onUnarchive?: (t: AgendaEvent) => void;
    onDelete?: (t: AgendaEvent) => void;
  },
) {
  render(
    <ArchivedTasksView
      tasks={tasks}
      onOpenDetail={callbacks?.onOpenDetail ?? vi.fn()}
      onOpenEdit={callbacks?.onOpenEdit ?? vi.fn()}
      onUnarchive={callbacks?.onUnarchive ?? vi.fn()}
      onDelete={callbacks?.onDelete ?? vi.fn()}
    />,
  );
}

describe('ArchivedTasksView', () => {
  afterEach(() => {
    cleanup();
  });

  describe('empty state', () => {
    it('renders the section header even when there are no tasks', () => {
      // Arrange / Act
      renderView([]);

      // Assert
      expect(screen.getByText('Tarefas Arquivadas')).toBeInTheDocument();
    });

    it('shows the "Nenhuma tarefa arquivada" placeholder when tasks list is empty', () => {
      // Arrange / Act
      renderView([]);

      // Assert
      expect(screen.getByText('Nenhuma tarefa arquivada')).toBeInTheDocument();
    });

    it('displays 0 as the count badge when empty', () => {
      // Arrange / Act
      renderView([]);

      // Assert — badge exists with a 0
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('task list rendering', () => {
    it('renders all provided task titles', () => {
      // Arrange
      const tasks = [
        createTask('a1', 'Tarefa Arquivada A'),
        createTask('a2', 'Tarefa Arquivada B'),
        createTask('a3', 'Tarefa Arquivada C'),
      ];

      // Act
      renderView(tasks);

      // Assert
      expect(screen.getByText('Tarefa Arquivada A')).toBeInTheDocument();
      expect(screen.getByText('Tarefa Arquivada B')).toBeInTheDocument();
      expect(screen.getByText('Tarefa Arquivada C')).toBeInTheDocument();
    });

    it('shows accurate count badge that matches the number of tasks', () => {
      // Arrange
      const tasks = [createTask('t1', 'Alfa'), createTask('t2', 'Beta')];

      // Act
      renderView(tasks);

      // Assert
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('does not show the empty state placeholder when tasks exist', () => {
      // Arrange
      const tasks = [createTask('t1', 'Tarefa Única')];

      // Act
      renderView(tasks);

      // Assert
      expect(screen.queryByText('Nenhuma tarefa arquivada')).not.toBeInTheDocument();
    });
  });

  describe('callbacks via TaskCard integration', () => {
    it('calls onUnarchive with the correct task when unarchive button is clicked', () => {
      // Arrange
      const task = createTask('u1', 'Tarefa a Desarquivar');
      const onUnarchive = vi.fn();

      renderView([task], { onUnarchive });

      // Act — TaskCard renders "Desarquivar" for archived tasks
      fireEvent.click(screen.getByLabelText('Desarquivar'));

      // Assert
      expect(onUnarchive).toHaveBeenCalledOnce();
      expect(onUnarchive).toHaveBeenCalledWith(task);
    });

    it('calls onOpenEdit with the correct task when edit is triggered', () => {
      // Arrange
      const task = createTask('e1', 'Tarefa a Editar');
      const onOpenEdit = vi.fn();

      renderView([task], { onOpenEdit });

      // Act
      fireEvent.click(screen.getByLabelText('Editar Tarefa'));

      // Assert
      expect(onOpenEdit).toHaveBeenCalledOnce();
      expect(onOpenEdit).toHaveBeenCalledWith(task);
    });

    it('calls onDelete with the correct task when delete is triggered', () => {
      // Arrange
      const task = createTask('d1', 'Tarefa a Excluir');
      const onDelete = vi.fn();

      renderView([task], { onDelete });

      // Act
      fireEvent.click(screen.getByLabelText('Excluir Tarefa'));

      // Assert
      expect(onDelete).toHaveBeenCalledOnce();
      expect(onDelete).toHaveBeenCalledWith(task);
    });

    it('calls onOpenDetail when the task card body is clicked', () => {
      // Arrange
      const task = createTask('v1', 'Tarefa Visualizável');
      const onOpenDetail = vi.fn();

      renderView([task], { onOpenDetail });

      // Act
      fireEvent.click(screen.getByText('Tarefa Visualizável'));

      // Assert
      expect(onOpenDetail).toHaveBeenCalledOnce();
      expect(onOpenDetail).toHaveBeenCalledWith(task);
    });
  });

  describe('callback isolation', () => {
    it('does not call onOpenDetail when the edit button is clicked', () => {
      // Arrange
      const task = createTask('iso1', 'Isolamento');
      const onOpenDetail = vi.fn();
      const onOpenEdit = vi.fn();

      renderView([task], { onOpenDetail, onOpenEdit });

      // Act
      fireEvent.click(screen.getByLabelText('Editar Tarefa'));

      // Assert — edit should not bubble into view
      expect(onOpenDetail).not.toHaveBeenCalled();
      expect(onOpenEdit).toHaveBeenCalledOnce();
    });
  });
});
