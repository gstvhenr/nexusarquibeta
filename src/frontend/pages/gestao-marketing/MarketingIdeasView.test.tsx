import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MarketingIdea } from '@/types';
import { MarketingIdeasView } from './MarketingIdeasView';

const ideas: MarketingIdea[] = [
  {
    id: 'idea-normal',
    title: 'Ideia Normal',
    content: 'Publicar obra da semana',
    date: '2026-03-01',
    color: 'yellow',
    isFavorite: false,
  },
  {
    id: 'idea-favorite',
    title: 'Ideia Favorita',
    content: 'Série de bastidores',
    date: '2026-02-28',
    color: 'blue',
    isFavorite: true,
  },
  {
    id: 'idea-same-priority-newer',
    content: 'Sem título e cor desconhecida',
    date: '2026-03-02',
    color: 'unmapped-color',
    isFavorite: false,
  },
];

describe('MarketingIdeasView', () => {
  afterEach(() => {
    cleanup();
  });

  it('prioritizes favorites and dispatches edit/toggle callbacks', () => {
    const onEditIdea = vi.fn();
    const onToggleFavorite = vi.fn();

    render(
      <MarketingIdeasView
        ideas={ideas}
        onEditIdea={onEditIdea}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    const headings = screen.getAllByRole('heading', { level: 4 });
    expect(headings[0]).toHaveTextContent('Ideia Favorita');

    fireEvent.click(screen.getByLabelText('Remover dos favoritos'));
    fireEvent.click(screen.getByText('Ideia Favorita'));

    expect(onToggleFavorite).toHaveBeenCalledWith('idea-favorite');
    expect(onEditIdea).toHaveBeenCalledWith(ideas[1]);
  });

  it('supports keyboard activation and prevents star click from triggering edit', () => {
    const onEditIdea = vi.fn();
    const onToggleFavorite = vi.fn();

    render(
      <MarketingIdeasView
        ideas={ideas}
        onEditIdea={onEditIdea}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    fireEvent.click(screen.getByLabelText('Remover dos favoritos'));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onEditIdea).not.toHaveBeenCalled();

    const favoriteHeading = screen.getByText('Ideia Favorita');
    const favoriteCard = favoriteHeading.closest('[role="button"]');
    expect(favoriteCard).not.toBeNull();

    fireEvent.keyDown(favoriteCard as HTMLElement, { key: 'Enter' });
    fireEvent.keyDown(favoriteCard as HTMLElement, { key: ' ' });

    expect(onEditIdea).toHaveBeenCalledTimes(2);
    expect(onEditIdea).toHaveBeenCalledWith(ideas[1]);
  });

  it('sorts ideas by date when favorite priority is equal and renders title fallback', () => {
    const onEditIdea = vi.fn();

    render(<MarketingIdeasView ideas={ideas} onEditIdea={onEditIdea} onToggleFavorite={vi.fn()} />);

    const newerIdeaContent = screen.getByText('Sem título e cor desconhecida');
    const olderIdeaTitle = screen.getByText('Ideia Normal');
    expect(newerIdeaContent.compareDocumentPosition(olderIdeaTitle)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(
      screen.queryByRole('heading', { name: 'Sem título e cor desconhecida' }),
    ).not.toBeInTheDocument();
  });
});
