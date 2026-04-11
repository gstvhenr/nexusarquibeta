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
  /** When true, opens in read-only history mode. */
  readOnly?: boolean;
  colorOptions: ReminderColorOption[];
}) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
  initial,
  rescheduleMode,
  readOnly,
  colorOptions,
}) => {
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [color, setColor] = useState('yellow');
  const [externalUrl, setExternalUrl] = useState('');
  const [archivedAt, setArchivedAt] = useState<string | null>(null);
  useEffect(() => {
    if (isOpen) {
      if (initial) {
        setTitle(initial.title);
        setComment(initial.comment);
        setRemindAt(rescheduleMode ? '' : initial.remindAt);
        setColor(initial.color);
        setExternalUrl(initial.externalUrl || '');
        setArchivedAt(initial.completedAt ?? null);
      } else {
        setTitle('');
        setComment('');
        setRemindAt('');
        setColor('yellow');
        setExternalUrl('');
        setArchivedAt(null);
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
      archived: initial?.archived ?? false,
      completedAt: rescheduleMode ? null : (initial?.completedAt ?? null),
      externalUrl: externalUrl.trim() || undefined,
    });
    onClose();
  };

  const modalTitle = readOnly
    ? 'Histórico do Lembrete'
    : rescheduleMode
      ? 'Reagendar Lembrete'
      : initial
        ? 'Editar Lembrete'
        : 'Novo Lembrete';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {readOnly && archivedAt && (
          <div className="rounded-lg border border-border-color/40 bg-background/50 px-3 py-2 text-xs font-medium text-text-secondary">
            Arquivado em {new Date(archivedAt).toLocaleString('pt-BR')}
          </div>
        )}
        {/* Title */}
        <FormField label="Título *">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Ligar para fornecedor"
            required
            disabled={readOnly}
          />
        </FormField>

        {/* Comment */}
        <FormField label="Comentário">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Detalhes adicionais..."
            rows={3}
            disabled={readOnly}
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
            disabled={readOnly}
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
            disabled={readOnly}
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
                disabled={readOnly}
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
            {readOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!readOnly && (
            <Button variant="primary" type="submit" size="sm">
              {rescheduleMode ? 'Reagendar' : initial ? 'Salvar' : 'Criar'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};
