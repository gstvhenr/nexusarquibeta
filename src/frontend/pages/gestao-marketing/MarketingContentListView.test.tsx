import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MarketingActivity, MarketingContentType } from '@/types';
import { MarketingContentListView } from './MarketingContentListView';

const activities: MarketingActivity[] = [
  {
    id: 'act-old',
    title: 'Conteúdo Antigo',
    status: 'Pendente',
    contentType: 'Post (Instagram)',
    dueDate: '2026-03-01T12:00:00.000Z',
    responsibleId: 'prof-1',
    notes: 'Nota antiga',
  },
  {
    id: 'act-new',
    title: 'Conteúdo Recente',
    status: 'Pendente',
    contentType: 'Reels (Instagram)',
    dueDate: '2026-03-10T12:00:00.000Z',
    responsibleId: 'prof-2',
    cost: 350,
    description: 'Descrição alternativa',
  },
  {
    id: 'act-facebook',
    title: 'Post Facebook',
    status: 'Concluído',
    contentType: 'Post (Facebook)',
    dueDate: null,
    responsibleId: 'prof-2',
    notes: '',
    description: 'Sem nota cadastrada',
    cost: 0,
  },
  {
    id: 'act-tiktok',
    title: 'Vídeo TikTok',
    status: 'Pendente',
    contentType: 'Vídeo (Tik Tok)',
    dueDate: null,
    responsibleId: 'prof-3',
  },
  {
    id: 'act-x',
    title: 'Post X',
    status: 'Pendente',
    contentType: 'Conteúdo X' as MarketingContentType,
    dueDate: null,
    responsibleId: 'prof-4',
  },
  {
    id: 'act-default',
    title: 'Conteúdo Outro',
    status: 'Pendente',
    contentType: 'Outro',
    dueDate: null,
    responsibleId: 'prof-5',
  },
];

describe('MarketingContentListView', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders sorted activities and triggers row actions', () => {
    const onToggleActivityStatus = vi.fn();
    const onEditActivity = vi.fn();
    const onDeleteActivity = vi.fn();

    render(
      <MarketingContentListView
        activities={activities}
        onToggleActivityStatus={onToggleActivityStatus}
        onEditActivity={onEditActivity}
        onDeleteActivity={onDeleteActivity}
      />,
    );

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText('Conteúdo Recente')).toBeInTheDocument();

    const recentRow = screen.getByText('Conteúdo Recente').closest('tr');
    expect(recentRow).not.toBeNull();

    const rowScope = within(recentRow as HTMLElement);
    fireEvent.click(rowScope.getByTitle('Confirmar Realização'));
    fireEvent.click(rowScope.getByTitle('Editar'));
    fireEvent.click(rowScope.getByTitle('Excluir'));

    expect(onToggleActivityStatus).toHaveBeenCalledWith('act-new');
    expect(onEditActivity).toHaveBeenCalledWith(activities[1]);
    expect(onDeleteActivity).toHaveBeenCalledWith(activities[1]);
  });

  it('renders fallback values for date/time, notes and cost', () => {
    render(
      <MarketingContentListView
        activities={activities}
        onToggleActivityStatus={vi.fn()}
        onEditActivity={vi.fn()}
        onDeleteActivity={vi.fn()}
      />,
    );

    const facebookRow = screen.getByText('Post Facebook').closest('tr');
    expect(facebookRow).not.toBeNull();
    const facebookScope = within(facebookRow as HTMLElement);

    expect(facebookScope.getByTitle('Marcar como Pendente')).toBeInTheDocument();
    expect(facebookScope.getByText('--:--')).toBeInTheDocument();
    expect(facebookScope.getByText('-')).toBeInTheDocument();
    expect(facebookScope.getByText('Sem nota cadastrada')).toBeInTheDocument();
    expect(facebookRow).toHaveClass('opacity-60');
  });

  it('renders all icon branches and default icon fallback safely', () => {
    render(
      <MarketingContentListView
        activities={activities}
        onToggleActivityStatus={vi.fn()}
        onEditActivity={vi.fn()}
        onDeleteActivity={vi.fn()}
      />,
    );

    expect(screen.getByText('Post Facebook')).toBeInTheDocument();
    expect(screen.getByText('Vídeo TikTok')).toBeInTheDocument();
    expect(screen.getByText('Post X')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo Outro')).toBeInTheDocument();
  });

  it('shows empty state when activity list is empty', () => {
    render(
      <MarketingContentListView
        activities={[]}
        onToggleActivityStatus={vi.fn()}
        onEditActivity={vi.fn()}
        onDeleteActivity={vi.fn()}
      />,
    );

    expect(screen.getByText('Nenhum conteúdo agendado.')).toBeInTheDocument();
  });
});
