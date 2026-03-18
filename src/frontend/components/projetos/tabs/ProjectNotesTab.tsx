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
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h3 className="font-serif text-xl font-bold text-secondary">Anotações</h3>
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escreva aqui..."
        className="w-full bg-surface p-6 rounded-xl border border-border-color focus:border-primary focus:ring-1 focus:ring-primary text-text-primary text-base leading-relaxed transition-all shadow-inner-soft resize-none overflow-y-auto h-[calc(100dvh-420px)]"
        aria-label="Anotações do projeto"
      />
    </div>
  );
};
