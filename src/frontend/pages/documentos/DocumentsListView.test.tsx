import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DocumentFile, DocumentFolder, DocumentItem } from '@/types';
import { DocumentsListView } from './DocumentsListView';

describe('DocumentsListView', () => {
  it('renders size/status fallbacks and opens folder or file on double click', () => {
    const onOpenFolder = vi.fn();
    const onOpenFile = vi.fn();

    const folder: DocumentFolder = {
      id: 'folder-1',
      name: 'Pasta de Contratos',
      type: 'folder',
      children: [
        {
          id: 'nested-file-1',
          name: 'nested-a.pdf',
          type: 'file',
          dateAdded: '2026-03-03T10:00:00.000Z',
          dateModified: '2026-03-03T10:00:00.000Z',
          primarySourceId: 'nested-src-1',
          sources: [
            {
              id: 'nested-src-1',
              type: 'upload',
              content: 'abc',
              fileName: 'nested-a.pdf',
              fileType: 'application/pdf',
              fileSize: 10,
              dateAdded: '2026-03-03T10:00:00.000Z',
            },
          ],
        },
        {
          id: 'nested-file-2',
          name: 'nested-b.pdf',
          type: 'file',
          dateAdded: '2026-03-03T10:00:00.000Z',
          dateModified: '2026-03-03T10:00:00.000Z',
          primarySourceId: 'nested-src-2',
          sources: [
            {
              id: 'nested-src-2',
              type: 'upload',
              content: 'abc',
              fileName: 'nested-b.pdf',
              fileType: 'application/pdf',
              fileSize: 10,
              dateAdded: '2026-03-03T10:00:00.000Z',
            },
          ],
        },
      ],
      dateAdded: '2026-03-03T10:00:00.000Z',
      dateModified: '2026-03-03T10:00:00.000Z',
    };

    const uploadFile: DocumentFile = {
      id: 'file-1',
      name: 'contrato-final.pdf',
      type: 'file',
      dateAdded: '2026-03-03T10:00:00.000Z',
      dateModified: '2026-03-03T10:00:00.000Z',
      primarySourceId: 'src-1',
      status: 'Versão Final',
      sources: [
        {
          id: 'src-1',
          type: 'upload',
          content: 'abc',
          fileName: 'contrato-final.pdf',
          fileType: 'application/pdf',
          fileSize: 2048,
          dateAdded: '2026-03-03T10:00:00.000Z',
        },
      ],
    };

    const linkFile: DocumentFile = {
      id: 'file-2',
      name: 'drive-link',
      type: 'file',
      dateAdded: '2026-03-03T10:00:00.000Z',
      dateModified: '2026-03-03T10:00:00.000Z',
      primarySourceId: 'src-2',
      status: 'Aprovado',
      sources: [
        {
          id: 'src-2',
          type: 'link',
          content: 'https://example.com/file',
          dateAdded: '2026-03-03T10:00:00.000Z',
        },
      ],
    };

    const fileWithoutSize: DocumentFile = {
      id: 'file-3',
      name: 'sem-tamanho.txt',
      type: 'file',
      dateAdded: '2026-03-03T10:00:00.000Z',
      dateModified: '2026-03-03T10:00:00.000Z',
      primarySourceId: 'src-3',
      sources: [
        {
          id: 'src-3',
          type: 'upload',
          content: 'abc',
          fileName: 'sem-tamanho.txt',
          fileType: 'text/plain',
          dateAdded: '2026-03-03T10:00:00.000Z',
        },
      ],
    };

    render(
      <DocumentsListView
        items={[folder, uploadFile, linkFile, fileWithoutSize] as DocumentItem[]}
        onOpenFolder={onOpenFolder}
        onOpenFile={onOpenFile}
      />,
    );

    expect(screen.getByText('2 itens')).toBeInTheDocument();
    expect(screen.getByText('2 KB')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('Versão Final')).toBeInTheDocument();
    expect(screen.getByText('Aprovado')).toBeInTheDocument();

    fireEvent.doubleClick(screen.getByText('Pasta de Contratos'));
    fireEvent.doubleClick(screen.getByText('contrato-final.pdf'));

    expect(onOpenFolder).toHaveBeenCalledWith('folder-1');
    expect(onOpenFile).toHaveBeenCalledWith(uploadFile);
  });
});
