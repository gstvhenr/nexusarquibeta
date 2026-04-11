import React, { useState, useCallback, useEffect, useId } from 'react';
import Modal from '../ui/Modal';
import { useCoreData } from '../../context/DataContext';
import type { AgendaEvent, Subtask, KanbanStatus } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { getInitialEvent } from './agendaFormHelpers';
import EventFormFields from './EventFormFields';

export const EventFormModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AgendaEvent) => void;
  onDelete: (id: string) => void;
  event: AgendaEvent | null;
  dateForNewEvent: Date;
  initialKanbanStatus?: KanbanStatus;
}) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  dateForNewEvent,
  initialKanbanStatus,
}) => {
  const { clients, projects } = useCoreData();
  const formId = useId();
  const getInitial = useCallback(
    () =>
      event
        ? { ...event }
        : {
            ...getInitialEvent(dateForNewEvent),
            id: '',
            kanbanStatus: initialKanbanStatus || 'todo',
          },
    [event, dateForNewEvent, initialKanbanStatus],
  );

  const [editedEvent, setEditedEvent] = useState<Partial<AgendaEvent>>(getInitial());
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [noEndTime, setNoEndTime] = useState(false);

  useEffect(() => {
    const initial = getInitial();
    setEditedEvent(initial);
    setNoEndTime(false);
  }, [isOpen, getInitial]);

  const handleChange = (field: keyof AgendaEvent, value: AgendaEvent[keyof AgendaEvent]) => {
    setEditedEvent((prev) => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setEditedEvent((prev) => ({
        ...prev,
        projectId,
        projectName: project.name,
        clientId: project.clientId,
        clientName: project.clientName,
      }));
    } else {
      setEditedEvent((prev) => ({ ...prev, projectId: '', projectName: '' }));
    }
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setEditedEvent((prev) => ({
      ...prev,
      clientId,
      clientName: client?.name,
      projectId: '',
      projectName: '',
    }));
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = { id: uuidv4(), title: newSubtaskTitle, completed: false };
    setEditedEvent((prev) => ({ ...prev, subtasks: [...(prev.subtasks || []), newSub] }));
    setNewSubtaskTitle('');
  };

  const removeSubtask = (subId: string) => {
    setEditedEvent((prev) => ({ ...prev, subtasks: prev.subtasks?.filter((s) => s.id !== subId) }));
  };

  const handleSave = () => {
    if (!editedEvent.title?.trim()) {
      alert('O título é obrigatório.');
      return;
    }
    if (!editedEvent.type) {
      alert('Selecione um tipo de evento.');
      return;
    }
    const finalRecurrence = editedEvent.recurrence || 'none';
    const status = editedEvent.kanbanStatus || (editedEvent.completed ? 'done' : 'todo');
    const finalEvent: AgendaEvent = {
      ...getInitialEvent(new Date(editedEvent.date || Date.now())),
      ...editedEvent,
      recurrence: finalRecurrence,
      id: editedEvent.id || `evt_${Date.now()}`,
      kanbanStatus: status,
    };
    onSave(finalEvent);
  };

  if (!isOpen) return null;

  const availableProjects = editedEvent.clientId
    ? projects.filter((p) => p.clientId === editedEvent.clientId && !p.archived)
    : projects.filter((p) => !p.archived);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? 'Editar Evento / Tarefa' : 'Novo Evento / Tarefa'}
      size="2xl"
    >
      <div className="flex max-h-[calc(100dvh-14rem)] flex-col">
        <div className="min-h-0 overflow-y-auto pr-1 custom-scrollbar">
          <EventFormFields
            formId={formId}
            editedEvent={editedEvent}
            onChange={handleChange}
            onClientChange={handleClientChange}
            onProjectChange={handleProjectChange}
            newSubtaskTitle={newSubtaskTitle}
            onNewSubtaskTitleChange={setNewSubtaskTitle}
            onAddSubtask={addSubtask}
            onRemoveSubtask={removeSubtask}
            noEndTime={noEndTime}
            onNoEndTimeChange={setNoEndTime}
            clients={clients}
            availableProjects={availableProjects}
          />
        </div>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-color">
          <div>
            {event && !event.isDeadlineEvent && (
              <button
                type="button"
                onClick={() => onDelete(event.id)}
                className="px-4 py-2 rounded-lg font-semibold text-error hover:bg-error/10"
              >
                Excluir
              </button>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
