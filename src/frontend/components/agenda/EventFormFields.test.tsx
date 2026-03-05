import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { AgendaEvent, Client, Project } from '../../types';
import EventFormFields from './EventFormFields';

type EventFormFieldsProps = ComponentProps<typeof EventFormFields>;

function createBaseProps(
  overrides: Partial<EventFormFieldsProps> = {},
): EventFormFieldsProps {
  const clients: Client[] = [
    { id: 'c-1', name: 'Cliente Ativo', archived: false } as unknown as Client,
    { id: 'c-2', name: 'Cliente Arquivado', archived: true } as unknown as Client,
  ];
  const availableProjects: Project[] = [
    {
      id: 'p-1',
      name: 'P-001 - Reforma',
      code: 'P-001',
      archived: false,
    } as unknown as Project,
    {
      id: 'p-2',
      name: 'Casa Moderna',
      code: 'P-002',
      archived: false,
    } as unknown as Project,
  ];
  const editedEvent = {
    title: 'Evento inicial',
    type: 'Reunião com Cliente',
    recurrence: 'none',
    date: '2026-03-10',
    time: '09:00',
    timeEnd: '10:00',
    description: 'Descrição',
    priority: 4,
    subtasks: [{ id: 'sub-1', title: 'Enviar briefing', completed: false }],
  } as Partial<AgendaEvent>;

  return {
    formId: 'agenda-form',
    editedEvent,
    onChange: vi.fn(),
    onClientChange: vi.fn(),
    onProjectChange: vi.fn(),
    newSubtaskTitle: '',
    onNewSubtaskTitleChange: vi.fn(),
    onAddSubtask: vi.fn(),
    onRemoveSubtask: vi.fn(),
    noEndTime: false,
    onNoEndTimeChange: vi.fn(),
    clients,
    availableProjects,
    ...overrides,
  };
}

describe('EventFormFields', () => {
  it('dispara callbacks de alteração de campos principais', () => {
    const props = createBaseProps();
    render(<EventFormFields {...props} />);

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Novo título' } });
    fireEvent.change(screen.getByLabelText('Tipo de Evento'), { target: { value: 'Outro' } });
    fireEvent.change(screen.getByLabelText('Recorrência'), { target: { value: 'weekly' } });
    fireEvent.change(screen.getByLabelText('Data do evento'), { target: { value: '2026-04-01' } });
    fireEvent.change(screen.getByLabelText('Hora de início'), { target: { value: '14:00' } });
    fireEvent.change(screen.getByLabelText('Hora de término'), { target: { value: '15:00' } });
    fireEvent.click(screen.getByLabelText('Dia Inteiro'));
    fireEvent.click(screen.getByLabelText('Sem horário de término'));

    expect(props.onChange).toHaveBeenCalledWith('title', 'Novo título');
    expect(props.onChange).toHaveBeenCalledWith('type', 'Outro');
    expect(props.onChange).toHaveBeenCalledWith('recurrence', 'weekly');
    expect(props.onChange).toHaveBeenCalledWith('date', '2026-04-01');
    expect(props.onChange).toHaveBeenCalledWith('time', '14:00');
    expect(props.onChange).toHaveBeenCalledWith('timeEnd', '15:00');
    expect(props.onChange).toHaveBeenCalledWith('isAllDay', true);
    expect(props.onNoEndTimeChange).toHaveBeenCalledWith(true);
  });

  it('respeita estados de desabilitação para horário de início/fim', () => {
    const allDayProps = createBaseProps({
      editedEvent: { isAllDay: true, time: '09:00', timeEnd: '10:00' } as Partial<AgendaEvent>,
    });
    const { rerender } = render(<EventFormFields {...allDayProps} />);

    expect(screen.getByLabelText('Hora de início')).toBeDisabled();
    expect(screen.getByLabelText('Hora de término')).toBeDisabled();
    expect(screen.getByLabelText('Sem horário de término')).toBeDisabled();

    rerender(
      <EventFormFields
        {...createBaseProps({
          editedEvent: { isAllDay: false, time: '09:00', timeEnd: '10:00' } as Partial<AgendaEvent>,
          noEndTime: true,
        })}
      />,
    );

    expect(screen.getByLabelText('Hora de início')).not.toBeDisabled();
    expect(screen.getByLabelText('Hora de término')).toBeDisabled();
  });

  it('filtra clientes arquivados e formata label de projetos corretamente', () => {
    const props = createBaseProps();
    render(<EventFormFields {...props} />);

    fireEvent.change(screen.getByLabelText('Vincular cliente'), { target: { value: 'c-1' } });
    fireEvent.change(screen.getByLabelText('Vincular projeto'), { target: { value: 'p-2' } });

    expect(screen.getByRole('option', { name: 'Cliente Ativo' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', {
        name: 'Cliente Arquivado',
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'P-001 - Reforma' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'P-002 - Casa Moderna' })).toBeInTheDocument();
    expect(props.onClientChange).toHaveBeenCalledWith('c-1');
    expect(props.onProjectChange).toHaveBeenCalledWith('p-2');
  });

  it('permite adicionar/remover subtarefas por Enter e por botão', () => {
    const props = createBaseProps({ newSubtaskTitle: '' });
    render(<EventFormFields {...props} />);
    const subtaskInput = screen.getByPlaceholderText('Adicionar item...');

    fireEvent.change(subtaskInput, {
      target: { value: 'Sub nova' },
    });
    fireEvent.keyDown(subtaskInput, { key: 'Enter' });
    fireEvent.click(screen.getAllByLabelText('Adicionar subtarefa')[1]);
    fireEvent.click(screen.getByLabelText('Remover subtarefa Enviar briefing'));

    expect(props.onNewSubtaskTitleChange).toHaveBeenCalledWith('Sub nova');
    expect(props.onAddSubtask).toHaveBeenCalledTimes(2);
    expect(props.onRemoveSubtask).toHaveBeenCalledWith('sub-1');
  });

  it('exibe estado vazio de subtarefas quando não há itens', () => {
    render(
      <EventFormFields
        {...createBaseProps({
          editedEvent: { title: 'Sem subtarefa', subtasks: [] } as Partial<AgendaEvent>,
        })}
      />,
    );

    expect(screen.getByText('Nenhuma subtarefa.')).toBeInTheDocument();
  });

  it('dispara seleção de prioridade e mantém estado visual da prioridade ativa', () => {
    const props = createBaseProps({
      editedEvent: { priority: 4 } as Partial<AgendaEvent>,
    });
    render(<EventFormFields {...props} />);

    const activeButton = screen.getByRole('button', { name: 'Alta' });
    const optionalButton = screen.getByRole('button', { name: 'Opcional' });
    fireEvent.click(optionalButton);

    expect(activeButton.className).toContain('border-primary');
    expect(props.onChange).toHaveBeenCalledWith('priority', 1);
  });
});
