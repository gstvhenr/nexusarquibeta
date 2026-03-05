import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProjectSection } from '@/types';
import { ProjectChecklistTab } from './ProjectChecklistTab';

const baseSections: ProjectSection[] = [
  {
    id: 'section-1',
    name: 'Etapa 1',
    tasks: [{ id: 'task-1', name: 'Tarefa 1', completed: false, hours: 2 }],
  },
  {
    id: 'section-2',
    name: 'Etapa 2',
    tasks: [],
  },
];

function renderTab(sections: ProjectSection[]) {
  const props = {
    sections,
    onSectionChange: vi.fn(),
    onTaskChange: vi.fn(),
    onAddSection: vi.fn(),
    onRemoveSection: vi.fn(),
    onAddTask: vi.fn(),
    onRemoveTask: vi.fn(),
    onEditTaskDetails: vi.fn(),
  };

  render(<ProjectChecklistTab {...props} />);
  return props;
}

describe('ProjectChecklistTab', () => {
  it('shows empty state and dispatches section creation', () => {
    const props = renderTab([]);

    expect(screen.getByText('Nenhuma etapa definida')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Nova Etapa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Criar Primeira Etapa' }));

    expect(props.onAddSection).toHaveBeenCalledTimes(2);
  });

  it('renders sections/tasks and triggers section handlers', () => {
    const props = renderTab(baseSections);

    expect(screen.getByDisplayValue('Tarefa 1')).toBeInTheDocument();
    fireEvent.change(screen.getAllByLabelText('Nome da etapa')[0], {
      target: { value: 'Etapa Atualizada' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Excluir Etapa' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /Adicionar Tarefa/i })[0]);

    expect(props.onSectionChange).toHaveBeenCalledWith('section-1', 'name', 'Etapa Atualizada');
    expect(props.onRemoveSection).toHaveBeenCalledWith('section-1');
    expect(props.onAddTask).toHaveBeenCalledWith('section-1');
  });

  it('toggles section expansion on click and keyboard', () => {
    renderTab(baseSections);

    const sectionButton = screen.getByRole('button', { name: /Etapa 1/i });
    fireEvent.click(sectionButton);
    expect(screen.queryByDisplayValue('Tarefa 1')).not.toBeInTheDocument();

    fireEvent.keyDown(sectionButton, { key: 'Enter' });
    expect(screen.getByDisplayValue('Tarefa 1')).toBeInTheDocument();
  });
});
