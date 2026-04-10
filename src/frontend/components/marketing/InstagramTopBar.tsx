import React from 'react';
import { Button } from '@/components/ui';
import { KeyIcon } from '@/components/ui/icons';

type InstagramTopBarProps = {
  onOpenCredentials: () => void;
  onEdit: () => void;
};

export const InstagramTopBar: (props: InstagramTopBarProps) => React.ReactNode = ({
  onOpenCredentials,
  onEdit,
}) => {
  return (
    <div className="flex items-center justify-end gap-3 mb-6">
      <Button variant="secondary" onClick={onOpenCredentials} className="shadow-soft">
        <KeyIcon className="w-4 h-4 text-primary" />
        Acessos
      </Button>
      <Button variant="primary" onClick={onEdit} className="shadow-soft">
        Editar
      </Button>
    </div>
  );
};
