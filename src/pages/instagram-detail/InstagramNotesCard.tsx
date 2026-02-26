import React from 'react';

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
          <button
            type="button"
            onClick={onStartEdit}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {notes ? 'Editar' : 'Adicionar'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={notesValue}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={3}
            placeholder="Observação breve sobre o perfil."
            className="w-full bg-background p-3 rounded-md border border-border-color focus:border-accent focus:outline-none text-sm resize-y transition-colors"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors"
            >
              Salvar
            </button>
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
