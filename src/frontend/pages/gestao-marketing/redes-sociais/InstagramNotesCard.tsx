import React from 'react';
import { Button, Textarea } from '@/components/ui';

type InstagramNotesCardProps = {
  notes?: string;
  isEditing: boolean;
  notesValue: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onNotesChange: (value: string) => void;
};

export const InstagramNotesCard: (props: InstagramNotesCardProps) => React.ReactNode = ({
  notes,
  isEditing,
  notesValue,
  onStartEdit,
  onCancelEdit,
  onSave,
  onNotesChange,
}) => {
  return (
    <div className="bg-surface rounded-xl shadow-soft p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif text-lg font-bold text-secondary">Breve campo de informação</h2>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={onStartEdit}>
            {notes ? 'Editar' : 'Adicionar'}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={notesValue}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={3}
            placeholder="Observação breve sobre o perfil."
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={onCancelEdit}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={onSave}>
              Salvar
            </Button>
          </div>
        </div>
      ) : notes ? (
        <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{notes}</p>
      ) : (
        <p className="text-sm text-text-secondary italic">Nenhuma informação breve cadastrada.</p>
      )}
    </div>
  );
};
