import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KanbanColumn } from './KanbanColumn';
import type { AgendaEvent, KanbanStatus } from '@/types';

function createTask(id: string, title: string, overrides: Partial<AgendaEvent> = {}): AgendaEvent {
  return {
    id,
    title,
    date: '2026-03-10',
    time: '10:00',
    type: 'Desenvolvimento de Projeto',
    priority: 3,
    recurrence: 'none',
    kanbanStatus: 'todo',
    ...overrides,
  };
}

function defaultProps(
  status: KanbanStatus = 'todo',
  title = 'A Fazer',
  tasks: AgendaEvent[] = [],
  callbacks: Partial<{
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, s: KanbanStatus) => void;
    onEdit: (t: AgendaEvent) => void;
    onViewDetails: (t: AgendaEvent) => void;
    onDelete: (t: AgendaEvent) => void;
    onArchive: (t: AgendaEvent) => void;
    onAddToColumn: () => void;
  }> = {},
) {
  return {
    status,
    title,
    tasks,
    accentColor: 'border-sky-400',
    onDragStart: callbacks.onDragStart ?? vi.fn(),
    onDragOver: callbacks.onDragOver ?? vi.fn(),
    onDrop: callbacks.onDrop ?? vi.fn(),
    onEdit: callbacks.onEdit ?? vi.fn(),
    onViewDetails: callbacks.onViewDetails ?? vi.fn(),
    onDelete: callbacks.onDelete ?? vi.fn(),
    onArchive: callbacks.onArchive ?? vi.fn(),
    onAddToColumn: callbacks.onAddToColumn,
  };
}

describe('KanbanColumn', () => {
  beforeEach(() => {
    // Guard against fake timer state leaked from sibling test files in shared worker
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
  });

  describe('header rendering', () => {
    it('displays the column title', () => {
      // Arrange / Act
      render(<KanbanColumn {...defaultProps('todo', 'A Fazer')} />);

      // Assert
      expect(screen.getByText('A Fazer')).toBeInTheDocument();
    });

    it('shows a count badge with 0 when there are no tasks', () => {
      // Arrange / Act
      render(<KanbanColumn {...defaultProps('todo', 'A Fazer', [])} />);

      // Assert
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('shows a count badge matching the number of tasks', () => {
      // Arrange
      const tasks = [
        createTask('t1', 'Alpha'),
        createTask('t2', 'Beta'),
        createTask('t3', 'Gamma'),
      ];

      // Act
      render(<KanbanColumn {...defaultProps('todo', 'A Fazer', tasks)} />);

      // Assert
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders the "Adicionar" button only when onAddToColumn is provided', () => {
      // Arrange + Act — with callback
      const { unmount } = render(
        <KanbanColumn {...defaultProps('todo', 'A Fazer', [], { onAddToColumn: vi.fn() })} />,
      );
      expect(screen.getByLabelText('Adicionar tarefa em "A Fazer"')).toBeInTheDocument();
      unmount();

      // Without callback
      render(<KanbanColumn {...defaultProps('todo', 'A Fazer', [], {})} />);
      expect(screen.queryByLabelText('Adicionar tarefa em "A Fazer"')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows "Vazio" placeholder when tasks list is empty', () => {
      // Arrange / Act
      render(<KanbanColumn {...defaultProps('review', 'Aguardando Retorno', [])} />);

      // Assert
      expect(screen.getByText('Vazio')).toBeInTheDocument();
    });

    it('does not show the empty placeholder when tasks exist', () => {
      // Arrange
      const tasks = [createTask('t1', 'Tarefa Real')];

      // Act
      render(<KanbanColumn {...defaultProps('todo', 'A Fazer', tasks)} />);

      // Assert
      expect(screen.queryByText('Vazio')).not.toBeInTheDocument();
    });
  });

  describe('task cards', () => {
    it('renders all task titles in the column', () => {
      // Arrange
      const tasks = [
        createTask('t1', 'Tarefa 1'),
        createTask('t2', 'Tarefa 2'),
        createTask('t3', 'Tarefa 3'),
      ];

      // Act
      render(<KanbanColumn {...defaultProps('todo', 'A Fazer', tasks)} />);

      // Assert
      expect(screen.getByText('Tarefa 1')).toBeInTheDocument();
      expect(screen.getByText('Tarefa 2')).toBeInTheDocument();
      expect(screen.getByText('Tarefa 3')).toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('calls onAddToColumn when the add button is clicked', () => {
      // Arrange
      const onAddToColumn = vi.fn();

      render(<KanbanColumn {...defaultProps('todo', 'A Fazer', [], { onAddToColumn })} />);

      // Act
      fireEvent.click(screen.getByLabelText('Adicionar tarefa em "A Fazer"'));

      // Assert
      expect(onAddToColumn).toHaveBeenCalledOnce();
    });

    it('calls onDragOver when a dragged item hovers the column', () => {
      // Arrange
      const onDragOver = vi.fn();
      const { container } = render(
        <KanbanColumn {...defaultProps('in_progress', 'Em Andamento', [], { onDragOver })} />,
      );

      // Act
      fireEvent.dragOver(container.firstElementChild as HTMLElement);

      // Assert
      expect(onDragOver).toHaveBeenCalledOnce();
    });

    it('calls onDrop with the column status when an item is dropped', () => {
      // Arrange
      const onDrop = vi.fn();
      const { container } = render(
        <KanbanColumn {...defaultProps('in_progress', 'Em Andamento', [], { onDrop })} />,
      );

      // Act
      fireEvent.drop(container.firstElementChild as HTMLElement);

      // Assert
      expect(onDrop).toHaveBeenCalledOnce();
      expect(onDrop.mock.calls[0][1]).toBe('in_progress');
    });

    it('passes the correct status to onDrop for each column status variant', () => {
      const statuses: KanbanStatus[] = ['todo', 'in_progress', 'review', 'done'];

      statuses.forEach((status) => {
        const onDrop = vi.fn();
        const { container, unmount } = render(
          <KanbanColumn {...defaultProps(status, 'Coluna', [], { onDrop })} />,
        );

        fireEvent.drop(container.firstElementChild as HTMLElement);
        expect(onDrop.mock.calls[0][1]).toBe(status);
        unmount();
      });
    });

    it('calls onEdit when a task card edit is triggered', () => {
      // Arrange
      const task = createTask('e1', 'Tarefa Editável');
      const onEdit = vi.fn();

      render(<KanbanColumn {...defaultProps('todo', 'A Fazer', [task], { onEdit })} />);

      // Act
      fireEvent.click(screen.getByLabelText('Editar Tarefa'));

      // Assert
      expect(onEdit).toHaveBeenCalledWith(task);
    });

    it('calls onDelete when a task card delete is triggered', () => {
      // Arrange
      const task = createTask('d1', 'Tarefa a Excluir');
      const onDelete = vi.fn();

      render(<KanbanColumn {...defaultProps('todo', 'A Fazer', [task], { onDelete })} />);

      // Act
      fireEvent.click(screen.getByLabelText('Excluir Tarefa'));

      // Assert
      expect(onDelete).toHaveBeenCalledWith(task);
    });
  });

  describe('archive button visibility', () => {
    it('shows archive button only for "done" column tasks', () => {
      // Arrange — "done" column should have archive button
      const task = createTask('done-1', 'Tarefa Concluída', { kanbanStatus: 'done' });

      render(<KanbanColumn {...defaultProps('done', 'Concluído', [task])} />);

      // Assert — TaskCard renders archive button for done status
      expect(screen.getByLabelText('Arquivar')).toBeInTheDocument();
    });

    it('does NOT show archive button for non-done column tasks', () => {
      // Arrange
      const task = createTask('todo-1', 'Tarefa A Fazer', { kanbanStatus: 'todo' });

      render(<KanbanColumn {...defaultProps('todo', 'A Fazer', [task])} />);

      // Assert
      expect(screen.queryByLabelText('Arquivar')).not.toBeInTheDocument();
    });
  });
});
