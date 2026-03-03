import React, { useEffect, useState } from 'react';
import { Button, FormField, Input, Modal, Textarea } from '../ui';
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
        <FormField label="Título *">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Ligar para fornecedor"
            required
          />
        </FormField>

        {/* Comment */}
        <FormField label="Comentário">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Detalhes adicionais..."
            rows={3}
          />
        </FormField>

        {/* Date/time */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            {rescheduleMode ? 'Nova Data e Horário *' : 'Data e Horário'}
          </label>
          <Input
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            required={rescheduleMode}
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
          <Input
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://exemplo.com/referencia"
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
          <Button variant="secondary" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" size="sm">
            {rescheduleMode ? 'Reagendar' : initial ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
