import React from 'react';
import { Button, PlusIcon } from '../../components/ui';

type DocumentsToolbarProps = {
  onAdd: () => void;
};

export const DocumentsToolbar: (props: DocumentsToolbarProps) => React.ReactNode = ({ onAdd }) => {
  return (
    <div className="flex items-center gap-4">
      <Button variant="primary" onClick={onAdd}>
        <PlusIcon className="w-5 h-5" /> Adicionar
      </Button>
    </div>
  );
};
