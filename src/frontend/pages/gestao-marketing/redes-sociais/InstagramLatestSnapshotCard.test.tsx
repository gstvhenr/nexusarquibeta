import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InstagramLatestSnapshotCard } from './InstagramLatestSnapshotCard';

describe('InstagramLatestSnapshotCard', () => {
  it('shows empty state when there is no snapshot', () => {
    render(<InstagramLatestSnapshotCard />);

    expect(screen.getByText('Nenhum cadastro disponível.')).toBeInTheDocument();
  });

  it('renders metric cards and immutable note for latest snapshot', () => {
    render(
      <InstagramLatestSnapshotCard
        latestSnapshot={{
          id: 'snap-1',
          posts: 118,
          followers: 6859,
          following: 946,
          recordedAt: '2026-02-13T00:28:00-03:00',
        }}
      />,
    );

    expect(screen.getByText('118 posts')).toBeInTheDocument();
    expect(screen.getByText('6.859 seguidores')).toBeInTheDocument();
    expect(screen.getByText('946 seguindo')).toBeInTheDocument();
    expect(screen.getByText('Registro imutável do momento do cadastro.')).toBeInTheDocument();
  });
});
