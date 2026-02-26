import React from 'react';
import { DocumentIcons } from '../../components/ui';
import type { DocumentFile, DocumentFolder, DocumentItem, DocumentStatus } from '../../types';
import { formatBytes, formatDate } from '../../utils/formatters';

type DocumentsListViewProps = {
  items: DocumentItem[];
  onOpenFolder: (folderId: string) => void;
  onOpenFile: (file: DocumentFile) => void;
};

const documentStatusClasses: Record<DocumentStatus, string> = {
  'Em Revisão': 'bg-warning/20 text-warning',
  Aprovado: 'bg-info/20 text-info',
  'Versão Final': 'bg-success/20 text-success',
  Obsoleto: 'bg-surface text-text-secondary',
};

export const DocumentsListView: (props: DocumentsListViewProps) => React.ReactNode = ({
  items,
  onOpenFolder,
  onOpenFile,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-background/50 text-xs text-text-secondary uppercase tracking-wider">
          <tr>
            <th scope="col" className="p-4 w-12"></th>
            <th scope="col" className="px-6 py-3">
              Nome
            </th>
            <th scope="col" className="px-6 py-3">
              Modificado em
            </th>
            <th scope="col" className="px-6 py-3">
              Tamanho
            </th>
            <th scope="col" className="px-6 py-3">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {items.map((item) => {
            const isFolder = item.type === 'folder';
            const file = isFolder ? null : (item as DocumentFile);
            const folder = isFolder ? (item as DocumentFolder) : null;
            const source = file
              ? file.sources.find((entry) => entry.id === file.primarySourceId)
              : null;
            const fileSize = source?.fileSize;

            return (
              <tr
                key={item.id}
                onDoubleClick={() =>
                  isFolder ? onOpenFolder(item.id) : onOpenFile(file as DocumentFile)
                }
                className="group hover:bg-background/80 transition-colors cursor-pointer"
              >
                <td className="p-4">
                  <div className="w-6 h-6 text-secondary">
                    <DocumentIcons.GetIcon
                      type={
                        isFolder
                          ? folder?.projectId
                            ? 'projectfolder'
                            : 'folder'
                          : file?.sources[0]?.fileType || 'default'
                      }
                    />
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-text-primary">{item.name}</td>
                <td className="px-6 py-4 text-text-secondary">{formatDate(item.dateModified)}</td>
                <td className="px-6 py-4 text-text-secondary">
                  {isFolder
                    ? `${folder?.children.length || 0} itens`
                    : fileSize
                      ? formatBytes(fileSize)
                      : source?.type === 'link'
                        ? 'Link'
                        : '-'}
                </td>
                <td className="px-6 py-4 text-text-secondary">
                  {file && file.status && (
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${documentStatusClasses[file.status]}`}
                    >
                      {file.status}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
