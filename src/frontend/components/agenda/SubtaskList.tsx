import React from 'react';
import type { Subtask } from '../../types';
import { TrashIcon, EditIcon } from '../ui/icons';
import { IconButton } from '../ui';
import { formatDateTime } from './agendaFormHelpers';

interface SubtaskListProps {
  subtasks: Subtask[];
  editingId: string | null;
  editingTitle: string;
  onToggle: (subId: string) => void;
  onStartEditing: (sub: Subtask) => void;
  onEditingTitleChange: (title: string) => void;
  onSaveEditing: () => void;
  onCancelEditing: () => void;
  onRemove: (subId: string) => void;
  onDragStart: (idx: number) => void;
  onDragEnter: (idx: number) => void;
  onDragEnd: () => void;
}

function SubtaskList({
  subtasks,
  editingId,
  editingTitle,
  onToggle,
  onStartEditing,
  onEditingTitleChange,
  onSaveEditing,
  onCancelEditing,
  onRemove,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: SubtaskListProps) {
  return (
    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
      {subtasks.map((sub, idx) => (
        <div
          key={sub.id}
          draggable
          onDragStart={() => onDragStart(idx)}
          onDragEnter={() => onDragEnter(idx)}
          onDragEnd={onDragEnd}
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
            onClick={() => onToggle(sub.id)}
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
                onChange={(e) => onEditingTitleChange(e.target.value)}
                onBlur={onSaveEditing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveEditing();
                  if (e.key === 'Escape') onCancelEditing();
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
          <IconButton
            variant="primary"
            size="sm"
            onClick={() => onStartEditing(sub)}
            aria-label={`Editar subtarefa "${sub.title}"`}
            title="Editar subtarefa"
          >
            <EditIcon className="w-3.5 h-3.5" />
          </IconButton>

          {/* Delete */}
          <IconButton
            variant="danger"
            size="sm"
            onClick={() => onRemove(sub.id)}
            aria-label={`Excluir subtarefa "${sub.title}"`}
            title="Excluir subtarefa"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      ))}

      {subtasks.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-text-secondary/60 italic">Nenhuma subtarefa adicionada.</p>
        </div>
      )}
    </div>
  );
}

export default SubtaskList;
