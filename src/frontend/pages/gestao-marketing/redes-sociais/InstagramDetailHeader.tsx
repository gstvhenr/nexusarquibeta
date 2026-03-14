import React from 'react';
import { IconButton } from '@/components/ui';
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
      <IconButton onClick={onBack} aria-label="Voltar para Redes Sociais">
        <ArrowLeftIcon className="w-5 h-5" />
      </IconButton>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface border border-border-color">
          {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
        <h1 className="font-serif text-2xl font-bold text-secondary">{name}</h1>
      </div>
    </div>
  );
};
