import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AgendaEvent, Client, Project, Proposal } from '../../types';
import * as CoreContextModule from '../../context/CoreContext';
import { EventFormModal } from './EventFormModal';

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'subtask-uuid'),
}));

function createModalRoot() {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
}

function createEvent(overrides: Partial<AgendaEvent> = {}): AgendaEvent {
  return {
    id: 'evt-1',
    title: 'Evento existente',
    date: '2026-03-10',
    time: '09:00',
    timeEnd: '10:00',
    type: 'Reunião com Cliente',
    recurrence: 'none',
    priority: 3,
    completed: false,
    kanbanStatus: 'todo',
    archived: false,
    subtasks: [],
    ...overrides,
  };
}

function renderModal(overrides: Partial<ComponentProps<typeof EventFormModal>> = {}) {
  return render(
    <EventFormModal
      isOpen={true}
      onClose={vi.fn()}
      onSave={vi.fn()}
      onDelete={vi.fn()}
      event={null}
      dateForNewEvent={new Date('2026-03-10T12:00:00.000Z')}
      initialKanbanStatus="review"
      {...overrides}
    />,
  );
}

describe('EventFormModal', () => {
  beforeEach(() => {
    createModalRoot();
    const clients: Client[] = [
      { id: 'c-1', name: 'Cliente 1', archived: false } as unknown as Client,
      { id: 'c-2', name: 'Cliente 2', archived: false } as unknown as Client,
    ];
    const projects: Project[] = [
      {
        id: 'p-1',
        code: 'P-001',
        name: 'Casa Verde',
        clientId: 'c-1',
        clientName: 'Cliente 1',
        archived: false,
      } as unknown as Project,
      {
        id: 'p-2',
        code: 'P-002',
        name: 'Projeto Arquivado',
        clientId: 'c-1',
        clientName: 'Cliente 1',
        archived: true,
      } as unknown as Project,
      {
        id: 'p-3',
        code: 'P-003',
        name: 'Apartamento Central',
        clientId: 'c-2',
        clientName: 'Cliente 2',
        archived: false,
      } as unknown as Project,
    ];
    const proposals: Proposal[] = [];
    vi.spyOn(CoreContextModule, 'useCoreData').mockReturnValue({
      clients,
      projects,
      proposals,
      setProjects: vi.fn(),
      setProposals: vi.fn(),
      setClients: vi.fn(),
    });
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.getElementById('modal-root')?.remove();
    document.body.style.overflow = '';
  });

  it('não renderiza quando isOpen=false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('valida campos obrigatórios antes de salvar', () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(window.alert).toHaveBeenCalledWith('O título é obrigatório.');

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Evento sem tipo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(window.alert).toHaveBeenCalledWith('Selecione um tipo de evento.');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('salva novo evento com defaults de recorrência/status e id gerado por Date.now', () => {
    const onSave = vi.fn();
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    renderModal({ onSave });

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Novo compromisso' },
    });
    fireEvent.change(screen.getByLabelText('Tipo de Evento'), {
      target: { value: 'Outro' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'evt_1700000000000',
        title: 'Novo compromisso',
        type: 'Outro',
        recurrence: 'none',
        kanbanStatus: 'review',
      }),
    );
  });

  it('exibe botão de excluir apenas em edição de evento não deadline', () => {
    const onDelete = vi.fn();
    const event = createEvent({ id: 'evt-edit' });
    const { rerender } = renderModal({ event, onDelete });

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(onDelete).toHaveBeenCalledWith('evt-edit');

    rerender(
      <EventFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={onDelete}
        event={createEvent({ id: 'evt-deadline', isDeadlineEvent: true })}
        dateForNewEvent={new Date('2026-03-10T12:00:00.000Z')}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();
  });

  it('atualiza vínculos de cliente/projeto e limpa projeto ao selecionar opção vazia', () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Evento vinculado' },
    });
    fireEvent.change(screen.getByLabelText('Tipo de Evento'), {
      target: { value: 'Outro' },
    });
    fireEvent.change(screen.getByLabelText('Vincular cliente'), {
      target: { value: 'c-1' },
    });

    expect(screen.getByRole('option', { name: 'P-001 - Casa Verde' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', {
        name: 'P-002 - Projeto Arquivado',
      }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Vincular projeto'), {
      target: { value: 'p-1' },
    });
    fireEvent.change(screen.getByLabelText('Vincular projeto'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'c-1',
        clientName: 'Cliente 1',
        projectId: '',
        projectName: '',
      }),
    );
  });

  it('adiciona e remove subtarefas no evento editado', () => {
    const onSave = vi.fn();
    const event = createEvent({
      title: 'Evento com subtarefa',
      type: 'Outro',
      subtasks: [{ id: 'sub-old', title: 'Antiga', completed: false }],
    });
    renderModal({ event, onSave });

    const subtaskInput = screen.getByPlaceholderText('Adicionar item...');
    fireEvent.change(subtaskInput, {
      target: { value: 'Nova subtarefa' },
    });
    fireEvent.keyDown(subtaskInput, { key: 'Enter' });
    fireEvent.click(screen.getByLabelText('Remover subtarefa Antiga'));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        subtasks: [
          {
            id: expect.any(String),
            title: 'Nova subtarefa',
            completed: false,
          },
        ],
      }),
    );
  });

  it('restaura estado inicial ao reabrir modal', () => {
    const event = createEvent({
      title: 'Título original',
      type: 'Outro',
    });
    const { rerender } = renderModal({ event });

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Título editado' },
    });
    fireEvent.click(screen.getByLabelText('Sem horário de término'));
    expect(screen.getByLabelText('Hora de término')).toBeDisabled();

    rerender(
      <EventFormModal
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        event={event}
        dateForNewEvent={new Date('2026-03-10T12:00:00.000Z')}
      />,
    );

    rerender(
      <EventFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        event={event}
        dateForNewEvent={new Date('2026-03-10T12:00:00.000Z')}
      />,
    );

    expect(screen.getByLabelText('Título')).toHaveValue('Título original');
    expect(screen.getByLabelText('Hora de término')).not.toBeDisabled();
  });
});
