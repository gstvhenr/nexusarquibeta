import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import type { AgendaEvent, Subtask } from '../../types';
import { PlusIcon, TrashIcon, ClockIcon, EditIcon } from '../ui/icons';
import { v4 as uuidv4 } from 'uuid';

const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Opcional', color: 'text-sky-600 dark:text-sky-400' },
  2: { label: 'Baixa', color: 'text-emerald-600 dark:text-emerald-400' },
  3: { label: 'Média', color: 'text-yellow-600 dark:text-yellow-400' },
  4: { label: 'Alta', color: 'text-orange-600 dark:text-orange-400' },
  5: { label: 'Crítica', color: 'text-red-600 dark:text-red-400' },
};

/** Format ISO date -> "20/02/2026 às 14:30" */
const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
};

/** Format ISO date -> "20/02/2026" */
const formatDateBR = (iso: string): string => {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Modal for viewing and managing subtasks of a Kanban task.
 * Opens when the user clicks on a card body (not the edit button).
 *
 * @param task - AgendaEvent whose subtasks to display/manage
 * @param onUpdate - callback receiving updated AgendaEvent after subtask changes
 */
export const SubtaskDetailModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  task: AgendaEvent | null;
  onUpdate: (updated: AgendaEvent) => void;
}) => React.ReactNode = ({ isOpen, onClose, task, onUpdate }) => {
  const [newTitle, setNewTitle] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  if (!isOpen || !task) return null;

  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter((s) => s.completed).length;
  const priority = priorityLabels[task.priority] || priorityLabels[3];

  const toggleSubtask = (subId: string) => {
    const updated: Subtask[] = subtasks.map((s) => {
      if (s.id !== subId) return s;
      const nowCompleted = !s.completed;
      return {
        ...s,
        completed: nowCompleted,
        completedAt: nowCompleted ? new Date().toISOString() : null,
      };
    });
    onUpdate({ ...task, subtasks: updated });
  };

  const addSubtask = () => {
    if (!newTitle.trim()) return;
    const newSub: Subtask = {
      id: uuidv4(),
      title: newTitle.trim(),
      completed: false,
      completedAt: null,
    };
    onUpdate({ ...task, subtasks: [...subtasks, newSub] });
    setNewTitle('');
  };

  const removeSubtask = (subId: string) => {
    onUpdate({ ...task, subtasks: subtasks.filter((s) => s.id !== subId) });
  };

  const startEditing = (sub: Subtask) => {
    setEditingId(sub.id);
    setEditingTitle(sub.title);
  };

  const saveEditing = () => {
    if (!editingId || !editingTitle.trim()) {
      setEditingId(null);
      return;
    }
    const updated = subtasks.map((s) =>
      s.id === editingId ? { ...s, title: editingTitle.trim() } : s,
    );
    onUpdate({ ...task, subtasks: updated });
    setEditingId(null);
  };

  // --- Reschedule ---
  const openReschedule = () => {
    setNewDate(task.date?.split('T')[0] || '');
    setNewTime(task.time || '');
    setIsRescheduling(true);
  };

  const confirmReschedule = () => {
    if (!newDate) return;
    onUpdate({ ...task, date: newDate, time: newTime || task.time });
    setIsRescheduling(false);
  };

  // --- Drag to reorder ---
  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };

  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const reordered = [...subtasks];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, removed);

    dragItem.current = null;
    dragOverItem.current = null;

    onUpdate({ ...task, subtasks: reordered });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} size="lg">
      <div className="space-y-5">
        {/* Task Meta */}
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <span
            className={`font-semibold px-2.5 py-0.5 rounded-full bg-surface border border-border-color ${priority.color}`}
          >
            {priority.label}
          </span>
          <span className="flex items-center gap-1.5 text-text-secondary">
            <ClockIcon className="w-3.5 h-3.5" />
            {formatDateBR(task.date)}
            {task.time && <span className="ml-0.5">• {task.time}</span>}
          </span>
          {subtasks.length > 0 && (
            <span className="text-text-secondary ml-auto font-medium">
              {completedCount}/{subtasks.length} concluídas
            </span>
          )}
        </div>

        {/* Reschedule */}
        {isRescheduling ? (
          <div className="flex items-end gap-2 p-3 rounded-lg bg-surface/50 border border-border-color/40">
            <div className="flex-1">
              <label
                htmlFor="field-nova-data"
                className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block mb-1"
              >
                Nova data
              </label>
              <input
                id="field-nova-data"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-background p-2 rounded-lg border border-border-color text-sm text-text-primary"
              />
            </div>
            <div className="w-28">
              <label
                htmlFor="field-horario"
                className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block mb-1"
              >
                Horário
              </label>
              <input
                id="field-horario"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-background p-2 rounded-lg border border-border-color text-sm text-text-primary"
              />
            </div>
            <button
              type="button"
              onClick={confirmReschedule}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => setIsRescheduling(false)}
              className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openReschedule}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1.5"
          >
            <ClockIcon className="w-3.5 h-3.5" />
            Reagendar
          </button>
        )}

        {/* Progress Bar */}
        {subtasks.length > 0 && (
          <div className="w-full bg-border-color/30 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(completedCount / subtasks.length) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Subtask List */}
        <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
          {subtasks.map((sub, idx) => (
            <div
              key={sub.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                sub.completed
                  ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/60 dark:border-emerald-800/40'
                  : 'bg-surface/50 border-border-color/40 hover:border-border-color'
              }`}
            >
              {/* Drag handle */}
              <span
                className="cursor-grab active:cursor-grabbing text-text-secondary/40 hover:text-text-secondary shrink-0 select-none"
                title="Arrastar para reordenar"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="9" cy="6" r="1.5" />
                  <circle cx="15" cy="6" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" />
                  <circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="18" r="1.5" />
                  <circle cx="15" cy="18" r="1.5" />
                </svg>
              </span>

              {/* Checkbox */}
              <button
                type="button"
                onClick={() => toggleSubtask(sub.id)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                  sub.completed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-border-color hover:border-primary'
                }`}
                aria-label={sub.completed ? `Desmarcar "${sub.title}"` : `Concluir "${sub.title}"`}
              >
                {sub.completed && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Title + completion date */}
              <div className="flex-1 min-w-0">
                {editingId === sub.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={saveEditing}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditing();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    className="w-full bg-background p-1 rounded border border-border-color text-sm text-text-primary"
                  />
                ) : (
                  <>
                    <span
                      className={`text-sm leading-snug block ${
                        sub.completed ? 'line-through text-text-secondary' : 'text-text-primary'
                      }`}
                    >
                      {sub.title}
                    </span>
                    {sub.completed && sub.completedAt && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        Concluída em {formatDateTime(sub.completedAt)}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Edit */}
              <button
                type="button"
                onClick={() => startEditing(sub)}
                className="p-1.5 text-text-secondary/60 hover:text-primary hover:bg-primary/10 rounded-full transition-all shrink-0"
                title="Editar subtarefa"
                aria-label={`Editar subtarefa "${sub.title}"`}
              >
                <EditIcon className="w-3.5 h-3.5" />
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeSubtask(sub.id)}
                className="p-1.5 text-text-secondary/60 hover:text-error hover:bg-error/10 rounded-full transition-all shrink-0"
                title="Excluir subtarefa"
                aria-label={`Excluir subtarefa "${sub.title}"`}
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {subtasks.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-text-secondary/60 italic">Nenhuma subtarefa adicionada.</p>
            </div>
          )}
        </div>

        {/* Add Subtask */}
        <div className="flex gap-2 pt-2 border-t border-border-color/30">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
            placeholder="Nova subtarefa..."
            aria-label="Adicionar subtarefa"
            className="flex-1 bg-background p-2.5 rounded-lg border border-border-color focus:border-accent text-sm text-text-primary placeholder:text-text-secondary/50 transition"
          />
          <button
            onClick={addSubtask}
            type="button"
            className="px-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            aria-label="Adicionar subtarefa"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
