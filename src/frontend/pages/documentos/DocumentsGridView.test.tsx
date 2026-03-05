import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DocumentFile, DocumentFolder, DocumentItem } from '@/types';
import { DocumentsGridView } from './DocumentsGridView';

describe('DocumentsGridView', () => {
  it('opens folders and files on double click for all icon resolution branches', () => {
    const onOpenFolder = vi.fn();
    const onOpenFile = vi.fn();

    const regularFolder: DocumentFolder = {
      id: 'folder-1',
      name: 'Pasta Geral',
      type: 'folder',
      children: [],
      dateAdded: '2026-03-03T10:00:00.000Z',
      dateModified: '2026-03-03T10:00:00.000Z',
    };
    const projectFolder: DocumentFolder = {
      id: 'folder-2',
      name: 'Pasta de Projeto',
      type: 'folder',
      children: [],
      projectId: 'proj-1',
      dateAdded: '2026-03-03T10:00:00.000Z',
      dateModified: '2026-03-03T10:00:00.000Z',
    };
    const fileWithMime: DocumentFile = {
      id: 'file-1',
      name: 'arquivo.pdf',
      type: 'file',
      dateAdded: '2026-03-03T10:00:00.000Z',
      dateModified: '2026-03-03T10:00:00.000Z',
      primarySourceId: 'src-1',
      sources: [
        {
          id: 'src-1',
          type: 'upload',
          content: 'abc',
          fileName: 'arquivo.pdf',
          fileType: 'application/pdf',
          fileSize: 1000,
          dateAdded: '2026-03-03T10:00:00.000Z',
        },
      ],
    };
    const fileWithoutMime: DocumentFile = {
      id: 'file-2',
      name: 'arquivo-sem-tipo',
      type: 'file',
      dateAdded: '2026-03-03T10:00:00.000Z',
      dateModified: '2026-03-03T10:00:00.000Z',
      primarySourceId: 'src-2',
      sources: [
        {
          id: 'src-2',
          type: 'upload',
          content: 'abc',
          fileName: 'arquivo-sem-tipo',
          dateAdded: '2026-03-03T10:00:00.000Z',
        },
      ],
    };

    render(
      <DocumentsGridView
        items={[regularFolder, projectFolder, fileWithMime, fileWithoutMime] as DocumentItem[]}
        onOpenFolder={onOpenFolder}
        onOpenFile={onOpenFile}
      />,
    );

    fireEvent.doubleClick(screen.getByText('Pasta Geral'));
    fireEvent.doubleClick(screen.getByText('Pasta de Projeto'));
    fireEvent.doubleClick(screen.getByText('arquivo.pdf'));
    fireEvent.doubleClick(screen.getByText('arquivo-sem-tipo'));

    expect(onOpenFolder).toHaveBeenNthCalledWith(1, 'folder-1');
    expect(onOpenFolder).toHaveBeenNthCalledWith(2, 'folder-2');
    expect(onOpenFile).toHaveBeenNthCalledWith(1, fileWithMime);
    expect(onOpenFile).toHaveBeenNthCalledWith(2, fileWithoutMime);
  });
});
