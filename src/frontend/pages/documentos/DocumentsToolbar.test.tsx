import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DocumentsToolbar } from './DocumentsToolbar';

describe('DocumentsToolbar', () => {
  it('switches view mode and opens add action', () => {
    const onViewModeChange = vi.fn();
    const onAdd = vi.fn();

    render(<DocumentsToolbar viewMode="list" onViewModeChange={onViewModeChange} onAdd={onAdd} />);

    const listButton = screen.getByRole('button', { name: 'Visualização em lista' });
    const gridButton = screen.getByRole('button', { name: 'Visualização em grade' });

    expect(listButton.className).toContain('bg-primary');
    expect(gridButton.className).not.toContain('bg-primary');

    fireEvent.click(gridButton);
    fireEvent.click(listButton);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(onViewModeChange).toHaveBeenNthCalledWith(1, 'grid');
    expect(onViewModeChange).toHaveBeenNthCalledWith(2, 'list');
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('marks grid as active when current mode is grid', () => {
    render(<DocumentsToolbar viewMode="grid" onViewModeChange={vi.fn()} onAdd={vi.fn()} />);

    const listButton = screen.getByRole('button', { name: 'Visualização em lista' });
    const gridButton = screen.getByRole('button', { name: 'Visualização em grade' });

    expect(gridButton.className).toContain('bg-primary');
    expect(listButton.className).not.toContain('bg-primary');
  });
});
