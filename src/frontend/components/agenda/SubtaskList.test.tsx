import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Subtask } from '../../types';
import { formatDateTime } from './agendaFormHelpers';
import SubtaskList from './SubtaskList';

type SubtaskListProps = ComponentProps<typeof SubtaskList>;

const subtasks: Subtask[] = [
  { id: 's-1', title: 'Primeira', completed: false, completedAt: null },
  { id: 's-2', title: 'Segunda', completed: true, completedAt: '2026-03-10T14:30:00' },
];

function createProps(overrides: Partial<SubtaskListProps> = {}): SubtaskListProps {
  return {
    subtasks,
    editingId: null,
    editingTitle: '',
    onToggle: vi.fn(),
    onStartEditing: vi.fn(),
    onEditingTitleChange: vi.fn(),
    onSaveEditing: vi.fn(),
    onCancelEditing: vi.fn(),
    onRemove: vi.fn(),
    onDragStart: vi.fn(),
    onDragEnter: vi.fn(),
    onDragEnd: vi.fn(),
    ...overrides,
  };
}

describe('SubtaskList', () => {
  it('renderiza estado vazio quando não há subtarefas', () => {
    render(<SubtaskList {...createProps({ subtasks: [] })} />);
    expect(screen.getByText('Nenhuma subtarefa adicionada.')).toBeInTheDocument();
  });

  it('exibe labels corretas de conclusão e data formatada para item concluído', () => {
    const props = createProps();
    render(<SubtaskList {...props} />);

    fireEvent.click(screen.getByLabelText('Concluir "Primeira"'));
    fireEvent.click(screen.getByLabelText('Desmarcar "Segunda"'));

    expect(props.onToggle).toHaveBeenCalledWith('s-1');
    expect(props.onToggle).toHaveBeenCalledWith('s-2');
    expect(
      screen.getByText(`Concluída em ${formatDateTime('2026-03-10T14:30:00')}`),
    ).toBeInTheDocument();
  });

  it('permite fluxo de edição com change, Enter, Escape e blur', () => {
    const props = createProps({
      editingId: 's-1',
      editingTitle: 'Primeira editando',
    });
    render(<SubtaskList {...props} />);

    const input = screen.getByDisplayValue('Primeira editando');
    fireEvent.change(input, { target: { value: 'Novo título' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'Escape' });
    fireEvent.blur(input);

    expect(props.onEditingTitleChange).toHaveBeenCalledWith('Novo título');
    expect(props.onSaveEditing).toHaveBeenCalledTimes(2);
    expect(props.onCancelEditing).toHaveBeenCalledTimes(1);
  });

  it('dispara callbacks de editar e excluir', () => {
    const props = createProps();
    render(<SubtaskList {...props} />);

    fireEvent.click(screen.getByLabelText('Editar subtarefa "Primeira"'));
    fireEvent.click(screen.getByLabelText('Excluir subtarefa "Primeira"'));

    expect(props.onStartEditing).toHaveBeenCalledWith(subtasks[0]);
    expect(props.onRemove).toHaveBeenCalledWith('s-1');
  });

  it('dispara callbacks de drag-and-drop e previne default no dragOver', () => {
    const props = createProps();
    render(<SubtaskList {...props} />);

    const firstRow = screen.getByText('Primeira').closest('[draggable="true"]');
    const secondRow = screen.getByText('Segunda').closest('[draggable="true"]');
    expect(firstRow).toBeInTheDocument();
    expect(secondRow).toBeInTheDocument();

    fireEvent.dragStart(firstRow as HTMLElement);
    fireEvent.dragEnter(secondRow as HTMLElement);
    fireEvent.dragEnd(secondRow as HTMLElement);
    const dragOverResult = fireEvent.dragOver(secondRow as HTMLElement);

    expect(props.onDragStart).toHaveBeenCalledWith(0);
    expect(props.onDragEnter).toHaveBeenCalledWith(1);
    expect(props.onDragEnd).toHaveBeenCalledTimes(1);
    expect(dragOverResult).toBe(false);
  });
});
