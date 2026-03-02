import React from 'react';
import { CollectionIcon, ListViewIcon, PlusIcon } from '../../components/ui';

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
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-content' : 'text-text-secondary hover:bg-surface'}`}
          aria-label="Visualização em lista"
        >
          <ListViewIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('grid')}
          className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-content' : 'text-text-secondary hover:bg-surface'}`}
          aria-label="Visualização em grade"
        >
          <CollectionIcon className="w-5 h-5" />
        </button>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="px-4 py-2 rounded-lg font-semibold text-sm text-primary-content bg-primary hover:bg-primary-focus flex items-center gap-2"
      >
        <PlusIcon className="w-5 h-5" /> Adicionar
      </button>
    </div>
  );
};
