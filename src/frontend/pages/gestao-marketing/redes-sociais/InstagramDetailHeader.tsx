import React from 'react';
import { ArrowLeftIcon } from '@/components/ui/icons';

type InstagramDetailHeaderProps = {
  name: string;
  icon: React.ReactElement;
  onBack: () => void;
};

export const InstagramDetailHeader: (props: InstagramDetailHeaderProps) => React.ReactNode = ({
  name,
  icon,
  onBack,
}) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        type="button"
        onClick={onBack}
        className="p-2 rounded-lg hover:bg-border-color/30 transition-colors"
        title="Voltar para Redes Sociais"
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-border-color">
          {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
        <h1 className="font-serif text-2xl font-bold text-secondary">{name}</h1>
      </div>
    </div>
  );
};
