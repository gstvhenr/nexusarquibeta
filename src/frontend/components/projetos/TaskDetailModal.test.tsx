import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectTask } from '@/types';
import { TaskDetailModal } from './TaskDetailModal';

vi.mock('uuid', () => ({
  v4: () => 'new-subtask-id',
}));

function setupModalRoot() {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
}

const baseTask: ProjectTask = {
  id: 'task-1',
  name: 'Tarefa base',
  completed: false,
  hours: 4,
  dueDate: '2026-06-01',
  priority: 'Média',
  assignee: 'Maria',
  description: 'Descrição inicial',
  subtasks: [{ id: 'sub-1', title: 'Sub inicial', completed: false }],
};

describe('TaskDetailModal', () => {
  beforeEach(() => {
    setupModalRoot();
  });

  afterEach(() => {
    document.getElementById('modal-root')?.remove();
  });

  it('does not render when closed or without task', () => {
    render(<TaskDetailModal isOpen={false} onClose={vi.fn()} task={baseTask} onSave={vi.fn()} />);
    expect(screen.queryByText('Detalhes da Tarefa')).not.toBeInTheDocument();
  });

  it('edits task, manages subtasks and saves', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(<TaskDetailModal isOpen={true} onClose={onClose} task={baseTask} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText('Nome da Tarefa'), {
      target: { value: 'Tarefa atualizada' },
    });
    fireEvent.change(screen.getByLabelText('Horas Estimadas'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Prioridade'), { target: { value: 'Alta' } });
    fireEvent.change(screen.getByLabelText('Responsável'), { target: { value: 'João' } });
    fireEvent.change(screen.getByLabelText('Descrição Detalhada'), {
      target: { value: 'Novo texto' },
    });

    fireEvent.change(screen.getByLabelText('Nova subtarefa'), {
      target: { value: 'Nova subtarefa' },
    });
    fireEvent.keyDown(screen.getByLabelText('Nova subtarefa'), { key: 'Enter' });

    const toggleCheckboxes = screen.getAllByLabelText('Concluir subtarefa');
    fireEvent.click(toggleCheckboxes[0]);

    fireEvent.click(screen.getAllByLabelText('Remover subtarefa')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Tarefa atualizada',
        hours: 8,
        priority: 'Alta',
        assignee: 'João',
        description: 'Novo texto',
        subtasks: expect.arrayContaining([
          expect.objectContaining({ title: 'Nova subtarefa', completed: false }),
        ]),
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
