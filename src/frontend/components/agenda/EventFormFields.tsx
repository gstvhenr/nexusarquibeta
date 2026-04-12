import React from 'react';
import type {
  AgendaEvent,
  AgendaEventType,
  AgendaEventRecurrence,
  Client,
  Project,
  KanbanStatus,
} from '../../types';
import { agendaEventTypes } from '../../types';
import { PlusIcon, TrashIcon } from '../ui/icons';
import { priorityConfig } from './agendaFormHelpers';
import { EventAttachmentsField } from './EventAttachmentsField';

const inputClass =
  'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary transition';
const labelClass = 'block text-sm font-medium text-text-secondary mb-1';
const checkboxLabelClass =
  'flex items-center gap-2 text-xs text-text-secondary cursor-pointer hover:text-primary transition-colors';
const checkboxClass = 'rounded accent-primary w-3.5 h-3.5';

interface EventFormFieldsProps {
  formId: string;
  editedEvent: Partial<AgendaEvent>;
  onChange: (field: keyof AgendaEvent, value: AgendaEvent[keyof AgendaEvent]) => void;
  onClientChange: (clientId: string) => void;
  onProjectChange: (projectId: string) => void;
  newSubtaskTitle: string;
  onNewSubtaskTitleChange: (title: string) => void;
  onAddSubtask: () => void;
  onRemoveSubtask: (subId: string) => void;
  noEndTime: boolean;
  onNoEndTimeChange: (checked: boolean) => void;
  clients: Client[];
  availableProjects: Project[];
  newFiles?: File[];
  onNewFilesChange?: (files: File[]) => void;
  filesToDelete?: string[];
  onFilesToDeleteChange?: (paths: string[]) => void;
  newLink?: string;
  onNewLinkChange?: (link: string) => void;
}

function EventFormFields({
  formId,
  editedEvent,
  onChange,
  onClientChange,
  onProjectChange,
  newSubtaskTitle,
  onNewSubtaskTitleChange,
  onAddSubtask,
  onRemoveSubtask,
  noEndTime,
  onNoEndTimeChange,
  clients,
  availableProjects,
  newFiles,
  onNewFilesChange,
  filesToDelete,
  onFilesToDeleteChange,
  newLink,
  onNewLinkChange,
}: EventFormFieldsProps) {
  return (
    <div className="space-y-6 pr-2 custom-scrollbar">
      {/* Section 1: Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label className={labelClass} htmlFor={`${formId}-title`}>
            Título
          </label>
          <input
            type="text"
            id={`${formId}-title`}
            value={editedEvent.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
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
            onChange={(e) => onChange('type', e.target.value as AgendaEventType)}
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
            onChange={(e) => onChange('recurrence', e.target.value as AgendaEventRecurrence)}
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
        <div>
          <label className={labelClass} htmlFor={`${formId}-category`}>
            Categoria
          </label>
          <select
            id={`${formId}-category`}
            value={editedEvent.category || ''}
            onChange={(e) => onChange('category', e.target.value as 'Evento' | 'Tarefa')}
            className={`${inputClass} ${editedEvent.id ? 'opacity-60 cursor-not-allowed bg-background/50' : ''}`}
            disabled={!!editedEvent.id}
          >
            <option value="" disabled hidden>
              Selecione...
            </option>
            <option value="Evento">Evento</option>
            <option value="Tarefa">Tarefa</option>
          </select>
        </div>
      </div>

      {/* Section 2: Date & Time */}
      <div>
        <label htmlFor="field-horario-e-data" className={labelClass}>
          Horário e Data
        </label>
        <div className="p-4 bg-background/50 rounded-lg grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-start border border-border-color/30">
          <input
            id="field-horario-e-data"
            type="date"
            value={editedEvent.date || ''}
            onChange={(e) => onChange('date', e.target.value)}
            className={inputClass}
            aria-label="Data do evento"
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                id={`${formId}-time-start`}
                type="time"
                value={editedEvent.time || ''}
                onChange={(e) => onChange('time', e.target.value)}
                className={inputClass}
                disabled={!!editedEvent.isAllDay}
                aria-label="Hora de início"
              />
              <span className="text-text-secondary">-</span>
              <input
                id={`${formId}-time-end`}
                type="time"
                value={editedEvent.timeEnd || ''}
                onChange={(e) => onChange('timeEnd', e.target.value)}
                className={`${inputClass} ${noEndTime ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={!!editedEvent.isAllDay || noEndTime}
                aria-label="Hora de término"
              />
            </div>
            <div className="flex items-center gap-4 mt-1">
              <label className={checkboxLabelClass}>
                <input
                  id={`${formId}-all-day`}
                  type="checkbox"
                  checked={!!editedEvent.isAllDay}
                  onChange={(e) => onChange('isAllDay', e.target.checked)}
                  className={checkboxClass}
                />
                Dia Inteiro
              </label>
              <label className={checkboxLabelClass}>
                <input
                  id={`${formId}-no-end-time`}
                  type="checkbox"
                  checked={noEndTime}
                  onChange={(e) => onNoEndTimeChange(e.target.checked)}
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
        <label htmlFor="field-vinculos-opcional" className={labelClass}>
          Vínculos (Opcional)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            id="field-vinculos-opcional"
            value={editedEvent.clientId || ''}
            onChange={(e) => onClientChange(e.target.value)}
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
            id={`${formId}-project`}
            value={editedEvent.projectId || ''}
            onChange={(e) => onProjectChange(e.target.value)}
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
      {editedEvent.category === 'Tarefa' && (
        <div className="space-y-4">
          <div className="pt-4 border-t border-border-color/30">
            <h3 className="text-md font-semibold text-text-primary mb-3">Detalhes da Tarefa</h3>
            <label htmlFor="field-status-tarefa" className={labelClass}>
              Status da Tarefa
            </label>
            <select
              id="field-status-tarefa"
              value={editedEvent.kanbanStatus || 'todo'}
              onChange={(e) => onChange('kanbanStatus', e.target.value as KanbanStatus)}
              className={`${inputClass}`}
            >
              <option value="todo">A Fazer</option>
              <option value="in_progress">Em Andamento</option>
              <option value="review">Aguardando</option>
            </select>
          </div>

          <div>
            <label htmlFor="field-subtarefas" className={labelClass}>
              Subtarefas (Mínimo de 1 subtarefa exigido)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                id="field-subtarefas"
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => onNewSubtaskTitleChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onAddSubtask()}
                placeholder="Adicionar item..."
                aria-label="Adicionar subtarefa"
                className="flex-1 bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm"
              />
              <button
                onClick={onAddSubtask}
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
                    onClick={() => onRemoveSubtask(sub.id)}
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
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor={`${formId}-description`}>
          Descrição
        </label>
        <textarea
          id={`${formId}-description`}
          value={editedEvent.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>

      {/* Links Section */}
      <div>
        <label htmlFor="field-new-link" className={labelClass}>
          Links HTML (Sites, Docs)
        </label>
        <div className="flex gap-2 mb-3">
          <input
            id="field-new-link"
            type="url"
            value={newLink || ''}
            onChange={(e) => onNewLinkChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newLink && newLink.trim()) {
                  onChange('links', [...(editedEvent.links || []), newLink.trim()]);
                  onNewLinkChange?.('');
                }
              }
            }}
            placeholder="https://..."
            aria-label="Adicionar link"
            className="flex-1 bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm"
          />
          <button
            type="button"
            onClick={() => {
              if (newLink && newLink.trim()) {
                onChange('links', [...(editedEvent.links || []), newLink.trim()]);
                onNewLinkChange?.('');
              }
            }}
            className="px-3 bg-primary/10 text-primary rounded-md hover:bg-primary/20"
            aria-label="Adicionar link"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {editedEvent.links?.map((link, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 bg-background/50 rounded-md border border-border-color/30"
            >
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-accent hover:underline truncate"
              >
                {link}
              </a>
              <button
                type="button"
                onClick={() =>
                  onChange(
                    'links',
                    editedEvent.links?.filter((_, i) => i !== idx),
                  )
                }
                className="text-text-secondary hover:text-error"
                aria-label="Remover link"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <EventAttachmentsField
        inputId="field-anexos"
        attachments={editedEvent.attachments}
        newFiles={newFiles}
        filesToDelete={filesToDelete}
        onNewFilesChange={onNewFilesChange}
        onFilesToDeleteChange={onFilesToDeleteChange}
      />

      <div>
        <span className={labelClass}>Prioridade</span>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(priorityConfig).map(([level, { name, text, swatchClass }]) => (
            <button
              key={level}
              type="button"
              onClick={() => onChange('priority', parseInt(level))}
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
  );
}

export default EventFormFields;
