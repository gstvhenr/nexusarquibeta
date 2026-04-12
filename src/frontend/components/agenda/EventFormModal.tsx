import React, { useState, useCallback, useEffect, useId } from 'react';
import Modal from '../ui/Modal';
import { useCoreData } from '../../context/DataContext';
import type { AgendaEvent, Subtask, KanbanStatus } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { getInitialEvent } from './agendaFormHelpers';
import EventFormFields from './EventFormFields';
import { driveFileService } from '../../services/infrastructure/driveFileService';

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
            ...(initialKanbanStatus ? { category: 'Tarefa' as const } : {}),
          },
    [event, dateForNewEvent, initialKanbanStatus],
  );

  const [editedEvent, setEditedEvent] = useState<Partial<AgendaEvent>>(getInitial());
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [noEndTime, setNoEndTime] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Links and Attachments state
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    const initial = getInitial();
    setEditedEvent(initial);
    setNoEndTime(false);
    setNewFiles([]);
    setFilesToDelete([]);
    setNewLink('');
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

  const handleSave = async () => {
    if (!editedEvent.title?.trim()) {
      alert('O título é obrigatório.');
      return;
    }
    if (!editedEvent.type) {
      alert('Selecione um tipo de evento.');
      return;
    }
    if (!editedEvent.category) {
      alert('Selecione a categoria (Evento ou Tarefa).');
      return;
    }
    if (
      editedEvent.category === 'Tarefa' &&
      (!editedEvent.subtasks || editedEvent.subtasks.length === 0)
    ) {
      alert('Tarefas devem obrigatoriamente conter ao menos 01 subtarefa.');
      return;
    }

    setIsSaving(true);
    try {
      const finalId = editedEvent.id || `evt_${Date.now()}`;

      // Delete removed attachments
      for (const path of filesToDelete) {
        await driveFileService.deleteManagedFile(path);
      }

      // Upload new attachments
      const uploadedAttachments = [];
      for (const file of newFiles) {
        const drivePath = await driveFileService.uploadFeatureFile('agenda', finalId, file);
        uploadedAttachments.push({
          id: uuidv4(),
          name: file.name,
          driveRelativePath: drivePath,
        });
      }

      const finalRecurrence = editedEvent.recurrence || 'none';
      const status = editedEvent.kanbanStatus || (editedEvent.completed ? 'done' : 'todo');
      const finalEvent: AgendaEvent = {
        ...getInitialEvent(new Date(editedEvent.date || Date.now())),
        ...editedEvent,
        attachments: [...(editedEvent.attachments || []), ...uploadedAttachments],
        recurrence: finalRecurrence,
        id: finalId,
        kanbanStatus: status,
      };
      onSave(finalEvent);
    } catch (error) {
      console.error('Erro ao salvar evento/tarefa:', error);
      alert(
        'Ocorreu um erro ao salvar o evento. Verifique a conexão com o Google Drive, caso tenha anexado arquivos.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const availableProjects = editedEvent.clientId
    ? projects.filter((p) => p.clientId === editedEvent.clientId && !p.archived)
    : projects.filter((p) => !p.archived);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? 'Editar Evento / Tarefa' : 'Adicionar Novo Evento'}
      size="4xl"
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
            newFiles={newFiles}
            onNewFilesChange={setNewFiles}
            filesToDelete={filesToDelete}
            onFilesToDeleteChange={setFilesToDelete}
            newLink={newLink}
            onNewLinkChange={setNewLink}
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
              disabled={isSaving}
              className={`px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
