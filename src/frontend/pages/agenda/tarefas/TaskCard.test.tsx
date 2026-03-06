import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import type { AgendaEvent } from '@/types';

function createTask(overrides: Partial<AgendaEvent> = {}): AgendaEvent {
  return {
    id: 'task-1',
    title: 'Revisar planta executiva',
    date: '2026-03-10',
    time: '14:00',
    type: 'Desenvolvimento de Projeto',
    priority: 5,
    recurrence: 'none',
    completed: false,
    projectName: 'Residencial Aurora',
    subtasks: [
      { id: 's1', title: 'Revisar corte A-A', completed: true },
      { id: 's2', title: 'Revisar fachada', completed: false },
    ],
    ...overrides,
  };
}

function defaultRenderProps(overrides: Partial<AgendaEvent> = {}) {
  return {
    task: createTask(overrides),
    onViewDetails: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };
}

describe('TaskCard', () => {
  beforeEach(() => {
    // Fake only the Date global so isOverdue calculations are deterministic.
    // Do NOT fake timers globally — that breaks React Testing Library cleanup
    // when multiple test files share a worker (cleanup calls act() internally).
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-11T00:00:00.000Z'));
  });

  afterEach(() => {
    // cleanup() must run FIRST while fake timers are still active,
    // so React's internal act() wrapper inside cleanup has the same timer env as render.
    cleanup();
    vi.useRealTimers();
  });

  describe('content rendering', () => {
    it('renders task title', () => {
      // Arrange / Act
      render(<TaskCard {...defaultRenderProps()} />);

      // Assert
      expect(screen.getByText('Revisar planta executiva')).toBeInTheDocument();
    });

    it('renders project name badge when projectName is set', () => {
      // Arrange / Act
      render(<TaskCard {...defaultRenderProps()} />);

      // Assert
      expect(screen.getByText('Residencial Aurora')).toBeInTheDocument();
    });

    it('does not render project name badge when projectName is absent', () => {
      // Arrange / Act
      render(<TaskCard {...defaultRenderProps({ projectName: undefined })} />);

      // Assert
      expect(screen.queryByText('Residencial Aurora')).not.toBeInTheDocument();
    });

    it('renders priority label from priorityConfig', () => {
      // Arrange / Act — priority 5 = "Crítica"
      render(<TaskCard {...defaultRenderProps({ priority: 5 })} />);

      // Assert
      expect(screen.getByText('Crítica')).toBeInTheDocument();
    });

    it('renders subtask progress counter as "completed/total"', () => {
      // Arrange / Act — 1 of 2 subtasks completed
      render(<TaskCard {...defaultRenderProps()} />);

      // Assert
      expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    it('renders all subtasks completed progress as "2/2"', () => {
      // Arrange
      const task = createTask({
        subtasks: [
          { id: 's1', title: 'Sub 1', completed: true },
          { id: 's2', title: 'Sub 2', completed: true },
        ],
      });

      // Act
      render(<TaskCard task={task} onViewDetails={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

      // Assert
      expect(screen.getByText('2/2')).toBeInTheDocument();
    });

    it('does not show subtask progress when task has no subtasks', () => {
      // Arrange / Act
      render(<TaskCard {...defaultRenderProps({ subtasks: [] })} />);

      // Assert — no "X/Y" pattern
      expect(screen.queryByText(/\d\/\d/)).not.toBeInTheDocument();
    });

    it('renders a time indicator from task.time', () => {
      // Arrange / Act
      render(<TaskCard {...defaultRenderProps({ time: '09:30' })} />);

      // Assert
      expect(screen.getByText('• 09:30')).toBeInTheDocument();
    });
  });

  describe('click interactions', () => {
    it('calls onViewDetails when the card body is clicked', () => {
      // Arrange
      const task = createTask();
      const onViewDetails = vi.fn();

      render(
        <TaskCard task={task} onViewDetails={onViewDetails} onEdit={vi.fn()} onDelete={vi.fn()} />,
      );

      // Act
      fireEvent.click(screen.getByText('Revisar planta executiva'));

      // Assert
      expect(onViewDetails).toHaveBeenCalledWith(task);
    });

    it('calls onEdit when edit button is clicked without triggering onViewDetails', () => {
      // Arrange
      const task = createTask();
      const onViewDetails = vi.fn();
      const onEdit = vi.fn();

      render(
        <TaskCard task={task} onViewDetails={onViewDetails} onEdit={onEdit} onDelete={vi.fn()} />,
      );

      // Act
      fireEvent.click(screen.getByLabelText('Editar Tarefa'));

      // Assert
      expect(onEdit).toHaveBeenCalledWith(task);
      expect(onViewDetails).not.toHaveBeenCalled();
    });

    it('calls onDelete when delete button is clicked without triggering onViewDetails', () => {
      // Arrange
      const task = createTask();
      const onViewDetails = vi.fn();
      const onDelete = vi.fn();

      render(
        <TaskCard task={task} onViewDetails={onViewDetails} onEdit={vi.fn()} onDelete={onDelete} />,
      );

      // Act
      fireEvent.click(screen.getByLabelText('Excluir Tarefa'));

      // Assert
      expect(onDelete).toHaveBeenCalledWith(task);
      expect(onViewDetails).not.toHaveBeenCalled();
    });
  });

  describe('archive toggle', () => {
    it('shows "Arquivar" label for non-archived tasks when archive button is enabled', () => {
      // Arrange
      const task = createTask({ archived: false });

      // Act
      render(
        <TaskCard
          task={task}
          showArchiveButton={true}
          onArchiveToggle={vi.fn()}
          onViewDetails={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByLabelText('Arquivar')).toBeInTheDocument();
    });

    it('shows "Desarquivar" label for already-archived tasks', () => {
      // Arrange
      const task = createTask({ archived: true });

      // Act
      render(
        <TaskCard
          task={task}
          showArchiveButton={true}
          onArchiveToggle={vi.fn()}
          onViewDetails={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByLabelText('Desarquivar')).toBeInTheDocument();
    });

    it('calls onArchiveToggle with the task when archive button is clicked', () => {
      // Arrange
      const task = createTask({ archived: false });
      const onArchiveToggle = vi.fn();

      render(
        <TaskCard
          task={task}
          showArchiveButton={true}
          onArchiveToggle={onArchiveToggle}
          onViewDetails={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      // Act
      fireEvent.click(screen.getByLabelText('Arquivar'));

      // Assert
      expect(onArchiveToggle).toHaveBeenCalledWith(task);
    });

    it('does not render archive button when showArchiveButton is false', () => {
      // Arrange / Act
      render(
        <TaskCard
          task={createTask({ archived: false })}
          showArchiveButton={false}
          onArchiveToggle={vi.fn()}
          onViewDetails={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      // Assert
      expect(screen.queryByLabelText('Arquivar')).not.toBeInTheDocument();
    });

    it('does not render archive button when onArchiveToggle is not provided', () => {
      // Arrange / Act
      render(
        <TaskCard
          task={createTask({ archived: false })}
          showArchiveButton={true}
          // onArchiveToggle intentionally omitted
          onViewDetails={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      // Assert
      expect(screen.queryByLabelText('Arquivar')).not.toBeInTheDocument();
    });

    it('does not call onViewDetails when archive button is clicked (stops propagation)', () => {
      // Arrange
      const task = createTask({ archived: false });
      const onViewDetails = vi.fn();
      const onArchiveToggle = vi.fn();

      render(
        <TaskCard
          task={task}
          showArchiveButton={true}
          onArchiveToggle={onArchiveToggle}
          onViewDetails={onViewDetails}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      // Act
      fireEvent.click(screen.getByLabelText('Arquivar'));

      // Assert — archive should not propagate to view handler
      expect(onViewDetails).not.toHaveBeenCalled();
    });
  });

  describe('keyboard accessibility', () => {
    it('calls onViewDetails on Enter keydown', () => {
      // Arrange
      const task = createTask();
      const onViewDetails = vi.fn();

      const { container } = render(
        <TaskCard task={task} onViewDetails={onViewDetails} onEdit={vi.fn()} onDelete={vi.fn()} />,
      );
      // Use container.querySelector to get the outermost div[role=button] specifically,
      // as getByRole('button') is ambiguous (matches both card wrapper and inner buttons)
      const card = container.querySelector('[role="button"]') as HTMLElement;

      // Act
      fireEvent.keyDown(card, { key: 'Enter' });

      // Assert
      expect(onViewDetails).toHaveBeenCalledWith(task);
    });

    it('calls onViewDetails on Space keydown', () => {
      // Arrange
      const task = createTask();
      const onViewDetails = vi.fn();

      const { container } = render(
        <TaskCard task={task} onViewDetails={onViewDetails} onEdit={vi.fn()} onDelete={vi.fn()} />,
      );
      const card = container.querySelector('[role="button"]') as HTMLElement;

      // Act
      fireEvent.keyDown(card, { key: ' ' });

      // Assert
      expect(onViewDetails).toHaveBeenCalledWith(task);
    });

    it('does NOT call onViewDetails for other keys', () => {
      // Arrange
      const task = createTask();
      const onViewDetails = vi.fn();

      const { container } = render(
        <TaskCard task={task} onViewDetails={onViewDetails} onEdit={vi.fn()} onDelete={vi.fn()} />,
      );
      const card = container.querySelector('[role="button"]') as HTMLElement;

      // Act
      fireEvent.keyDown(card, { key: 'ArrowRight' });

      // Assert
      expect(onViewDetails).not.toHaveBeenCalled();
    });
  });

  describe('drag and drop', () => {
    it('renders as draggable when onDragStart callback is provided', () => {
      // Arrange / Act
      const { container } = render(
        <TaskCard
          task={createTask()}
          onViewDetails={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onDragStart={vi.fn()}
        />,
      );

      // Assert — card wrapper div should be draggable
      const card = container.querySelector('[role="button"]') as HTMLElement;
      expect(card).toHaveAttribute('draggable', 'true');
    });

    it('is NOT draggable when onDragStart is not provided', () => {
      // Arrange / Act
      const { container } = render(
        <TaskCard
          task={createTask()}
          onViewDetails={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      // Assert — card wrapper div should NOT be draggable
      const card = container.querySelector('[role="button"]') as HTMLElement;
      expect(card).toHaveAttribute('draggable', 'false');
    });

    it('calls onDragStart with the task id when dragging begins', () => {
      // Arrange
      const task = createTask({ id: 'drag-target' });
      const onDragStart = vi.fn();

      const { container } = render(
        <TaskCard
          task={task}
          onViewDetails={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onDragStart={onDragStart}
        />,
      );

      // Act — drag the card wrapper div
      const card = container.querySelector('[role="button"]') as HTMLElement;
      fireEvent.dragStart(card);

      // Assert
      expect(onDragStart).toHaveBeenCalledOnce();
      expect(onDragStart.mock.calls[0][1]).toBe('drag-target');
    });
  });

  describe('completed state', () => {
    it('renders with line-through class on title when task is completed', () => {
      // Arrange
      const task = createTask({ completed: true });

      // Act
      render(<TaskCard task={task} onViewDetails={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

      // Assert — title element should include line-through
      const titleEl = screen.getByText('Revisar planta executiva');
      expect(titleEl.className).toMatch(/line-through/);
    });
  });
});
