import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import type { AgendaEvent, Subtask } from '../../types';
import { PlusIcon, ClockIcon } from '../ui/icons';
import { v4 as uuidv4 } from 'uuid';
import { priorityLabels, formatDateBR } from './agendaFormHelpers';
import SubtaskList from './SubtaskList';

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

        <SubtaskList
          subtasks={subtasks}
          editingId={editingId}
          editingTitle={editingTitle}
          onToggle={toggleSubtask}
          onStartEditing={startEditing}
          onEditingTitleChange={setEditingTitle}
          onSaveEditing={saveEditing}
          onCancelEditing={() => setEditingId(null)}
          onRemove={removeSubtask}
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragEnd={handleDragEnd}
        />

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
