import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AgendaEvent } from '../../types';
import { formatDateBR } from './agendaFormHelpers';
import { SubtaskDetailModal } from './SubtaskDetailModal';

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'new-subtask-id'),
}));

function createModalRoot() {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
}

function createTask(overrides: Partial<AgendaEvent> = {}): AgendaEvent {
  return {
    id: 'task-1',
    title: 'Task principal',
    date: '2026-03-10',
    time: '09:00',
    type: 'Outro',
    recurrence: 'none',
    priority: 4,
    subtasks: [
      { id: 's-1', title: 'Primeira', completed: false, completedAt: null },
      { id: 's-2', title: 'Segunda', completed: true, completedAt: '2026-03-10T10:00:00.000Z' },
    ],
    ...overrides,
  };
}

function renderModal(overrides: Partial<ComponentProps<typeof SubtaskDetailModal>> = {}) {
  return render(
    <SubtaskDetailModal
      isOpen={true}
      onClose={vi.fn()}
      task={createTask()}
      onUpdate={vi.fn()}
      {...overrides}
    />,
  );
}

describe('SubtaskDetailModal', () => {
  beforeEach(() => {
    createModalRoot();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-11T08:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.getElementById('modal-root')?.remove();
    document.body.style.overflow = '';
  });

  it('não renderiza quando fechado ou sem task', () => {
    const { rerender } = renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<SubtaskDetailModal isOpen={true} onClose={vi.fn()} task={null} onUpdate={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza metadados da task, fallback de prioridade e progresso', () => {
    renderModal({ task: createTask({ priority: 99 }) });

    expect(screen.getByRole('heading', { name: 'Task principal' })).toBeInTheDocument();
    expect(screen.getByText('Média')).toBeInTheDocument();
    expect(screen.getByText(formatDateBR('2026-03-10'))).toBeInTheDocument();
    expect(screen.getByText('• 09:00')).toBeInTheDocument();
    expect(screen.getByText('1/2 concluídas')).toBeInTheDocument();
  });

  it('permite concluir e remover subtarefa', () => {
    const onUpdate = vi.fn();
    renderModal({ onUpdate });

    fireEvent.click(screen.getByLabelText('Concluir "Primeira"'));
    fireEvent.click(screen.getByLabelText('Excluir subtarefa "Primeira"'));

    expect(onUpdate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        subtasks: [
          expect.objectContaining({
            id: 's-1',
            completed: true,
            completedAt: '2026-03-11T08:00:00.000Z',
          }),
          expect.objectContaining({ id: 's-2' }),
        ],
      }),
    );
    expect(onUpdate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        subtasks: [expect.objectContaining({ id: 's-2' })],
      }),
    );
  });

  it('adiciona subtarefa com Enter e ignora título vazio', () => {
    const onUpdate = vi.fn();
    renderModal({ onUpdate, task: createTask({ subtasks: [] }) });

    const input = screen.getByPlaceholderText('Nova subtarefa...');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onUpdate).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '  Nova subtarefa  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        subtasks: [
          expect.objectContaining({
            id: expect.any(String),
            title: 'Nova subtarefa',
            completed: false,
            completedAt: null,
          }),
        ],
      }),
    );
  });

  it('permite editar subtarefa e cancela salvamento com título vazio', () => {
    const onUpdate = vi.fn();
    renderModal({ onUpdate });

    fireEvent.click(screen.getByLabelText('Editar subtarefa "Primeira"'));
    const editingInput = screen.getByDisplayValue('Primeira');
    fireEvent.change(editingInput, { target: { value: '  Primeira atualizada  ' } });
    fireEvent.keyDown(editingInput, { key: 'Enter' });
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        subtasks: expect.arrayContaining([
          expect.objectContaining({
            id: 's-1',
            title: 'Primeira atualizada',
          }),
        ]),
      }),
    );

    fireEvent.click(screen.getByLabelText('Editar subtarefa "Primeira"'));
    const emptyEditInput = screen.getByDisplayValue('Primeira');
    fireEvent.change(emptyEditInput, { target: { value: '   ' } });
    fireEvent.blur(emptyEditInput);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('abre fluxo de reagendamento e só confirma quando data é válida', () => {
    const onUpdate = vi.fn();
    renderModal({ onUpdate });

    fireEvent.click(screen.getByRole('button', { name: 'Reagendar' }));

    const dateInput = screen.getByDisplayValue('2026-03-10');
    const timeInput = screen.getByDisplayValue('09:00');
    fireEvent.change(dateInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(onUpdate).not.toHaveBeenCalled();

    fireEvent.change(dateInput, { target: { value: '2026-03-20' } });
    fireEvent.change(timeInput, { target: { value: '14:45' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2026-03-20',
        time: '14:45',
      }),
    );
  });

  it('reordena subtarefas via drag-and-drop e ignora drag sem mudança', () => {
    const onUpdate = vi.fn();
    renderModal({
      onUpdate,
      task: createTask({
        subtasks: [
          { id: 'a', title: 'A', completed: false, completedAt: null },
          { id: 'b', title: 'B', completed: false, completedAt: null },
          { id: 'c', title: 'C', completed: false, completedAt: null },
        ],
      }),
    });

    const rowA = screen.getByText('A').closest('[draggable="true"]');
    const rowC = screen.getByText('C').closest('[draggable="true"]');
    expect(rowA).toBeInTheDocument();
    expect(rowC).toBeInTheDocument();

    fireEvent.dragStart(rowA as HTMLElement);
    fireEvent.dragEnter(rowC as HTMLElement);
    fireEvent.dragEnd(rowA as HTMLElement);

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        subtasks: [
          expect.objectContaining({ id: 'b' }),
          expect.objectContaining({ id: 'c' }),
          expect.objectContaining({ id: 'a' }),
        ],
      }),
    );

    fireEvent.dragStart(rowA as HTMLElement);
    fireEvent.dragEnter(rowA as HTMLElement);
    fireEvent.dragEnd(rowA as HTMLElement);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});
