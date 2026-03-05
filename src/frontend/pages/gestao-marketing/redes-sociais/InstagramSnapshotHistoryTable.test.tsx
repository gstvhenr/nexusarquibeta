import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InstagramSnapshotHistoryTable } from './InstagramSnapshotHistoryTable';

describe('InstagramSnapshotHistoryTable', () => {
  it('shows empty state and allows creating a new snapshot', () => {
    const onNewSnapshot = vi.fn();
    render(
      <InstagramSnapshotHistoryTable
        snapshots={[]}
        onNewSnapshot={onNewSnapshot}
        onDeleteSnapshot={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Novo Registro' }));

    expect(
      screen.getByText('Nenhum registro cadastrado. Clique em "Novo Registro" para adicionar.'),
    ).toBeInTheDocument();
    expect(onNewSnapshot).toHaveBeenCalledTimes(1);
  });

  it('renders snapshot rows and deletes selected item', () => {
    const onDeleteSnapshot = vi.fn();
    render(
      <InstagramSnapshotHistoryTable
        snapshots={[
          {
            id: 'snap-1',
            posts: 120,
            followers: 7000,
            following: 900,
            recordedAt: '2026-02-13T00:28:00-03:00',
          },
        ]}
        onNewSnapshot={vi.fn()}
        onDeleteSnapshot={onDeleteSnapshot}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Excluir registro' }));

    expect(screen.getByText('7.000')).toBeInTheDocument();
    expect(onDeleteSnapshot).toHaveBeenCalledWith('snap-1');
  });
});
