import React, { useState, useMemo, useCallback, useEffect, useId } from 'react';
import Modal from '../ui/Modal';
import { useData } from '../../context/DataContext';
import type {
  AgendaEvent,
  AgendaEventType,
  Client,
  Project,
  Subtask,
  AgendaEventRecurrence,
} from '../../types';
import { agendaEventTypes } from '../../types';
import { PlusIcon, TrashIcon } from '../ui/icons';
import { v4 as uuidv4 } from 'uuid';

const priorityColors: Record<
  number,
  { bg: string; text: string; name: string; swatchClass: string }
> = {
  1: {
    bg: 'bg-sky-100 dark:bg-sky-900/40',
    text: 'text-sky-800 dark:text-sky-300',
    name: 'Opcional',
    swatchClass: 'priority-swatch-1',
  },
  2: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    name: 'Baixa',
    swatchClass: 'priority-swatch-2',
  },
  3: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
    text: 'text-yellow-800 dark:text-yellow-300',
    name: 'Moderada',
    swatchClass: 'priority-swatch-3',
  },
  4: {
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-800 dark:text-orange-300',
    name: 'Alta',
    swatchClass: 'priority-swatch-4',
  },
  5: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-800 dark:text-red-300',
    name: 'Crítica',
    swatchClass: 'priority-swatch-5',
  },
};

// Initial state helpers - Type and Recurrence start empty to force user selection
const getInitialEvent = (date: Date): Omit<AgendaEvent, 'id'> => ({
  title: '',
  date: date.toISOString().split('T')[0],
  isAllDay: false,
  time: '09:00',
  timeEnd: '10:00',
  type: '' as AgendaEventType, // Starts empty
  description: '',
  priority: 3,
  recurrence: '' as AgendaEventRecurrence, // Starts empty
  completed: false,
  kanbanStatus: 'todo',
  archived: false,
  subtasks: [],
});

export const EventFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AgendaEvent) => void;
  onDelete: (id: string) => void;
  event: AgendaEvent | null;
  dateForNewEvent: Date;
}> = ({ isOpen, onClose, onSave, onDelete, event, dateForNewEvent }) => {
  const { clients, projects } = useData();
  const formId = useId();
  const getInitial = useCallback(
    () => (event ? { ...event } : { ...getInitialEvent(dateForNewEvent), id: '' }),
    [event, dateForNewEvent],
  );

  const [editedEvent, setEditedEvent] = useState<Partial<AgendaEvent>>(getInitial());
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [noEndTime, setNoEndTime] = useState(false);

  useEffect(() => {
    const initial = getInitial();
    setEditedEvent(initial);
    // Reset local UI state when modal opens
    setNoEndTime(false);
  }, [isOpen, getInitial]);

  const handleChange = (field: keyof AgendaEvent, value: any) => {
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

  // Subtask Logic
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
    // If "Recurrence" is still empty string, default to 'none' before saving
    const finalRecurrence = editedEvent.recurrence || 'none';

    // Ensure kanbanStatus is set if missing
    const status = editedEvent.kanbanStatus || (editedEvent.completed ? 'done' : 'todo');

    const finalEvent: AgendaEvent = {
      ...getInitialEvent(new Date(editedEvent.date || Date.now())),
      ...editedEvent,
      recurrence: finalRecurrence,
      id: editedEvent.id || `evt_${Date.now()}`,
      kanbanStatus: status,
      // If no end time checked, technically we could clear timeEnd, but keeping it is harmless
    };
    onSave(finalEvent);
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary transition';
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1'; // Standardized Label Class
  const checkboxLabelClass =
    'flex items-center gap-2 text-xs text-text-secondary cursor-pointer hover:text-primary transition-colors';
  const checkboxClass = 'rounded accent-primary w-3.5 h-3.5';

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
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {/* Section 1: Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor={`${formId}-title`}>
              Título
            </label>
            <input
              type="text"
              id={`${formId}-title`}
              value={editedEvent.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`${inputClass} font-semibold`}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`${formId}-type`}>
              Tipo de Evento
            </label>
            <select
              id={`${formId}-type`}
              value={editedEvent.type || ''}
              onChange={(e) => handleChange('type', e.target.value as AgendaEventType)}
              className={inputClass}
            >
              <option value="" disabled hidden>
                Selecione...
              </option>
              {agendaEventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor={`${formId}-recurrence`}>
              Recorrência
            </label>
            <select
              id={`${formId}-recurrence`}
              value={editedEvent.recurrence || ''}
              onChange={(e) => handleChange('recurrence', e.target.value as AgendaEventRecurrence)}
              className={inputClass}
            >
              <option value="" disabled hidden>
                Selecione...
              </option>
              <option value="none">Não se repete</option>
              <option value="weekly">Semanalmente (toda semana)</option>
              <option value="monthly">Mensalmente (todo mês)</option>
            </select>
          </div>
        </div>

        {/* Section 2: Date & Time - Uses Label for alignment consistency */}
        <div>
          <label className={labelClass}>Horário e Data</label>
          <div className="p-4 bg-background/50 rounded-lg grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-start border border-border-color/30">
            <input
              type="date"
              value={editedEvent.date || ''}
              onChange={(e) => handleChange('date', e.target.value)}
              className={inputClass}
              aria-label="Data do evento"
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={editedEvent.time || ''}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className={inputClass}
                  disabled={!!editedEvent.isAllDay}
                  aria-label="Hora de início"
                />
                <span className="text-text-secondary">-</span>
                <input
                  type="time"
                  value={editedEvent.timeEnd || ''}
                  onChange={(e) => handleChange('timeEnd', e.target.value)}
                  className={`${inputClass} ${noEndTime ? 'opacity-40 cursor-not-allowed' : ''}`}
                  disabled={!!editedEvent.isAllDay || noEndTime}
                  aria-label="Hora de término"
                />
              </div>

              {/* Checkboxes Row - Side by Side for visual coherence */}
              <div className="flex items-center gap-4 mt-1">
                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    checked={!!editedEvent.isAllDay}
                    onChange={(e) => handleChange('isAllDay', e.target.checked)}
                    className={checkboxClass}
                  />
                  Dia Inteiro
                </label>

                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    checked={noEndTime}
                    onChange={(e) => setNoEndTime(e.target.checked)}
                    disabled={!!editedEvent.isAllDay}
                    className={checkboxClass}
                  />
                  Sem horário de término
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Links */}
        <div>
          <label className={labelClass}>Vínculos (Opcional)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={editedEvent.clientId || ''}
              onChange={(e) => handleClientChange(e.target.value)}
              className={inputClass}
              aria-label="Vincular cliente"
            >
              <option value="">Vincular Cliente...</option>
              {clients
                .filter((c) => !c.archived)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <select
              value={editedEvent.projectId || ''}
              onChange={(e) => handleProjectChange(e.target.value)}
              className={inputClass}
              aria-label="Vincular projeto"
            >
              <option value="">Vincular Projeto...</option>
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.startsWith(p.code) ? p.name : `${p.code} - ${p.name}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subtasks Section */}
        <div>
          <label className={labelClass}>Subtarefas</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
              placeholder="Adicionar item..."
              aria-label="Adicionar subtarefa"
              className="flex-1 bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm"
            />
            <button
              onClick={addSubtask}
              type="button"
              className="px-3 bg-primary/10 text-primary rounded-md hover:bg-primary/20"
              aria-label="Adicionar subtarefa"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {editedEvent.subtasks?.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-2 bg-background/50 rounded-md border border-border-color/30"
              >
                <span className="text-sm text-text-primary truncate">{sub.title}</span>
                <button
                  type="button"
                  onClick={() => removeSubtask(sub.id)}
                  className="text-text-secondary hover:text-error"
                  aria-label={`Remover subtarefa ${sub.title}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!editedEvent.subtasks || editedEvent.subtasks.length === 0) && (
              <p className="text-xs text-text-secondary italic">Nenhuma subtarefa.</p>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor={`${formId}-description`}>
            Descrição
          </label>
          <textarea
            id={`${formId}-description`}
            value={editedEvent.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Prioridade</label>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(priorityColors).map(([level, { name, text, swatchClass }]) => (
              <button
                key={level}
                type="button"
                onClick={() => handleChange('priority', parseInt(level))}
                className={`w-full text-center p-2 rounded-lg border-2 transition-all duration-200 ${
                  editedEvent.priority == parseInt(level)
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent hover:bg-background/80'
                }`}
              >
                <div className={`w-full h-4 rounded-md mx-auto ${swatchClass}`} />
                <span className={`mt-1.5 block text-xs font-semibold ${text}`}>{name}</span>
              </button>
            ))}
          </div>
        </div>
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
    </Modal>
  );
};
