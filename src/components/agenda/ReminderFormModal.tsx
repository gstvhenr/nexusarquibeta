import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import type { Reminder } from '../../types';
import type { ReminderColorOption } from './reminderPalette';

export const ReminderFormModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (r: Reminder) => void;
  initial: Reminder | null;
  /** When true, opens pre-filled for rescheduling. */
  rescheduleMode?: boolean;
  colorOptions: ReminderColorOption[];
}) => React.ReactNode = ({ isOpen, onClose, onSave, initial, rescheduleMode, colorOptions }) => {
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [color, setColor] = useState('yellow');
  const [externalUrl, setExternalUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        setTitle(initial.title);
        setComment(initial.comment);
        setRemindAt(rescheduleMode ? '' : initial.remindAt);
        setColor(initial.color);
        setExternalUrl(initial.externalUrl || '');
      } else {
        setTitle('');
        setComment('');
        setRemindAt('');
        setColor('yellow');
        setExternalUrl('');
      }
    }
  }, [isOpen, initial, rescheduleMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: initial?.id || crypto.randomUUID(),
      title: title.trim(),
      comment: comment.trim(),
      remindAt,
      color,
      createdAt: initial?.createdAt || new Date().toISOString(),
      pinned: initial?.pinned ?? false,
      completedAt: rescheduleMode ? null : (initial?.completedAt ?? null),
      externalUrl: externalUrl.trim() || undefined,
    });
    onClose();
  };

  const modalTitle = rescheduleMode
    ? 'Reagendar Lembrete'
    : initial
      ? 'Editar Lembrete'
      : 'Novo Lembrete';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label
            htmlFor="field-titulo"
            className="block text-sm font-semibold text-text-primary mb-1.5"
          >
            Título *
          </label>
          <input
            id="field-titulo"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Ligar para fornecedor"
            required
            className="w-full rounded-lg border border-border-color bg-background px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="field-comentario"
            className="block text-sm font-semibold text-text-primary mb-1.5"
          >
            Comentário
          </label>
          <textarea
            id="field-comentario"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Detalhes adicionais..."
            rows={3}
            className="w-full rounded-lg border border-border-color bg-background px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </div>

        {/* Date/time */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            {rescheduleMode ? 'Nova Data e Horário *' : 'Data e Horário'}
          </label>
          <input
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            required={rescheduleMode}
            className="w-full rounded-lg border border-border-color bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* External URL (optional) */}
        <div>
          <label
            htmlFor="field-url-externa-span-classname-text-text-secondary-50-font-normal-opcional-span"
            className="block text-sm font-semibold text-text-primary mb-1.5"
          >
            URL Externa <span className="text-text-secondary/50 font-normal">(opcional)</span>
          </label>
          <input
            id="field-url-externa-span-classname-text-text-secondary-50-font-normal-opcional-span"
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://exemplo.com/referencia"
            className="w-full rounded-lg border border-border-color bg-background px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Color picker */}
        <div>
          <span className="block text-sm font-semibold text-text-primary mb-2">Cor</span>
          <div className="flex gap-3">
            {colorOptions.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setColor(c.key)}
                title={c.label}
                className={`w-8 h-8 rounded-full border-2 transition-all ${c.bg} ${
                  color === c.key
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 border-primary'
                    : `${c.border} hover:scale-105`
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-text-secondary bg-surface border border-border-color hover:bg-background transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-sm font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft transition-colors"
          >
            {rescheduleMode ? 'Reagendar' : initial ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
