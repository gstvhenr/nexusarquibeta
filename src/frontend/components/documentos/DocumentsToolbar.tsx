import React from 'react';
import { Button, CollectionIcon, IconButton, ListViewIcon, PlusIcon } from '../../components/ui';

type DocumentsToolbarProps = {
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onAdd: () => void;
};

export const DocumentsToolbar: (props: DocumentsToolbarProps) => React.ReactNode = ({
  viewMode,
  onViewModeChange,
  onAdd,
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1 p-1 bg-background rounded-lg shadow-inner-soft">
        <IconButton
          aria-label="Visualização em lista"
          variant={viewMode === 'list' ? 'primary' : 'default'}
          onClick={() => onViewModeChange('list')}
          className={
            viewMode === 'list' ? 'bg-primary text-primary-content rounded-md' : 'rounded-md'
          }
        >
          <ListViewIcon className="w-5 h-5" />
        </IconButton>
        <IconButton
          aria-label="Visualização em grade"
          variant={viewMode === 'grid' ? 'primary' : 'default'}
          onClick={() => onViewModeChange('grid')}
          className={
            viewMode === 'grid' ? 'bg-primary text-primary-content rounded-md' : 'rounded-md'
          }
        >
          <CollectionIcon className="w-5 h-5" />
        </IconButton>
      </div>
      <Button variant="primary" onClick={onAdd}>
        <PlusIcon className="w-5 h-5" /> Adicionar
      </Button>
    </div>
  );
};
