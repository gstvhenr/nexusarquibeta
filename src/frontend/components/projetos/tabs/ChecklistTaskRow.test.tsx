import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProjectTask } from '@/types';
import { ChecklistTaskRow } from './ChecklistTaskRow';

const baseTask: ProjectTask = {
  id: 'task-1',
  name: 'Tarefa importante',
  completed: false,
  hours: 3,
  dueDate: '2026-03-10',
  priority: 'Alta',
  assignee: 'Ana',
  subtasks: [
    { id: 'sub-1', title: 'Sub 1', completed: true },
    { id: 'sub-2', title: 'Sub 2', completed: false },
  ],
};

describe('ChecklistTaskRow', () => {
  it('renders task metadata and triggers change/remove/detail callbacks', () => {
    const onTaskChange = vi.fn();
    const onEditTaskDetails = vi.fn();
    const onRemoveTask = vi.fn();

    render(
      <ChecklistTaskRow
        sectionId="section-1"
        task={baseTask}
        onTaskChange={onTaskChange}
        onEditTaskDetails={onEditTaskDetails}
        onRemoveTask={onRemoveTask}
      />,
    );

    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText(/Ana/i)).toBeInTheDocument();
    expect(screen.getByText('1/2 subs')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nome da tarefa'), {
      target: { value: 'Novo nome' },
    });
    fireEvent.change(screen.getByLabelText('Horas estimadas'), { target: { value: '6' } });
    fireEvent.click(screen.getByLabelText(/Marcar tarefa/i));
    fireEvent.click(screen.getByRole('button', { name: 'Detalhes da Tarefa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover Tarefa' }));

    expect(onTaskChange).toHaveBeenCalledWith('section-1', 'task-1', 'name', 'Novo nome');
    expect(onTaskChange).toHaveBeenCalledWith('section-1', 'task-1', 'hours', '6');
    expect(onTaskChange).toHaveBeenCalledWith('section-1', 'task-1', 'completed', true);
    expect(onEditTaskDetails).toHaveBeenCalledWith('section-1', baseTask);
    expect(onRemoveTask).toHaveBeenCalledWith('section-1', 'task-1');
  });
});
