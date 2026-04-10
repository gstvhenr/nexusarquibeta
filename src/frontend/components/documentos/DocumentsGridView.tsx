import React from 'react';
import { DocumentIcons } from '../../components/ui';
import type { DocumentFile, DocumentFolder, DocumentItem } from '../../types';

type DocumentsGridViewProps = {
  items: DocumentItem[];
  onOpenFolder: (folderId: string) => void;
  onOpenFile: (file: DocumentFile) => void;
};

export const DocumentsGridView: (props: DocumentsGridViewProps) => React.ReactNode = ({
  items,
  onOpenFolder,
  onOpenFile,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          onDoubleClick={() =>
            item.type === 'folder' ? onOpenFolder(item.id) : onOpenFile(item as DocumentFile)
          }
          className="bg-background/50 p-4 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/10 transition-colors aspect-square"
        >
          <div className="w-16 h-16 text-secondary mb-2">
            <DocumentIcons.GetIcon
              type={
                item.type === 'folder'
                  ? (item as DocumentFolder).projectId
                    ? 'projectfolder'
                    : 'folder'
                  : (item as DocumentFile).sources[0]?.fileType || 'default'
              }
            />
          </div>
          <p className="text-sm font-semibold text-text-primary break-all line-clamp-2">
            {item.name}
          </p>
        </div>
      ))}
    </div>
  );
};
