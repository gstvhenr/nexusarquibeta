import React from 'react';

type ProjectNotesTabProps = {
  notes: string;
  onChange: (value: string) => void;
};

export const ProjectNotesTab: (props: ProjectNotesTabProps) => React.ReactNode = ({
  notes,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="font-serif text-xl font-bold text-secondary">Caderno de Anotações</h3>
          <p className="text-sm text-text-secondary mt-1">
            Registre reuniões, ideias e detalhes importantes.
          </p>
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        rows={20}
        placeholder="Escreva aqui..."
        className="w-full bg-surface p-6 rounded-xl border border-border-color focus:border-primary focus:ring-1 focus:ring-primary text-text-primary text-base leading-relaxed transition-all shadow-inner-soft resize-y"
        aria-label="Anotações do projeto"
      />
    </div>
  );
};
