import React from 'react';
import type { DocumentFolder } from '../../types';

type DocumentsBreadcrumbProps = {
  breadcrumbPath: DocumentFolder[];
  onNavigateToIndex: (index: number) => void;
};

export const DocumentsBreadcrumb: (props: DocumentsBreadcrumbProps) => React.ReactNode = ({
  breadcrumbPath,
  onNavigateToIndex,
}) => {
  return (
    <header className="flex justify-between items-center pb-4 border-b border-border-color">
      <div className="flex items-center text-sm font-semibold text-text-secondary">
        {breadcrumbPath.map((folder, index) => (
          <React.Fragment key={folder.id}>
            {index > 0 && <span className="mx-2">/</span>}
            <button
              type="button"
              onClick={() => onNavigateToIndex(index)}
              className="hover:text-primary transition-colors"
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>
    </header>
  );
};
