import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DocumentFolder } from '@/types';
import { DocumentsBreadcrumb } from './DocumentsBreadcrumb';

describe('DocumentsBreadcrumb', () => {
  it('renders breadcrumb path and navigates by index click', () => {
    const onNavigateToIndex = vi.fn();
    const breadcrumbPath: DocumentFolder[] = [
      {
        id: 'personal-root',
        name: 'Meus Documentos',
        type: 'folder',
        children: [],
        dateAdded: '2026-03-03T10:00:00.000Z',
        dateModified: '2026-03-03T10:00:00.000Z',
      },
      {
        id: 'folder-1',
        name: 'Contratos',
        type: 'folder',
        children: [],
        dateAdded: '2026-03-03T10:00:00.000Z',
        dateModified: '2026-03-03T10:00:00.000Z',
      },
    ];

    render(<DocumentsBreadcrumb breadcrumbPath={breadcrumbPath} onNavigateToIndex={onNavigateToIndex} />);

    fireEvent.click(screen.getByRole('button', { name: 'Meus Documentos' }));
    fireEvent.click(screen.getByRole('button', { name: 'Contratos' }));

    expect(onNavigateToIndex).toHaveBeenNthCalledWith(1, 0);
    expect(onNavigateToIndex).toHaveBeenNthCalledWith(2, 1);
  });
});

