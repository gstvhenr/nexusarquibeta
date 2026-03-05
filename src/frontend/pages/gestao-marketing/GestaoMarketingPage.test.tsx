import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import GestaoMarketingPage from './GestaoMarketingPage';

const seedMarketingData = (): void => {
  const snapshot = api.getData();
  snapshot.marketingProfessionals = [
    {
      id: 'professional-1',
      name: 'Studio Ads',
      email: 'studio@ads.com',
      phone: '(11) 95555-0000',
      cost: 1500,
    },
  ];
  snapshot.marketingActivities = [
    {
      id: 'activity-1',
      title: 'Post semanal',
      status: 'Pendente',
      contentType: 'Post (Instagram)',
      dueDate: '2026-03-05T10:00:00.000Z',
      responsibleId: 'professional-1',
      notes: 'Brief inicial',
    },
  ];
  snapshot.marketingIdeas = [
    {
      id: 'idea-1',
      content: 'Conteúdo de bastidores',
      date: '2026-03-01',
      isFavorite: false,
    },
  ];
  api.replaceData(snapshot);
};

const renderPage = (path: string): void => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <DataProvider>
        <GestaoMarketingPage />
      </DataProvider>
    </MemoryRouter>,
  );
};

describe('GestaoMarketingPage', () => {
  beforeEach(() => {
    api.clearAllData();
    seedMarketingData();

    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    api.clearAllData();
    document.getElementById('modal-root')?.remove();
  });

  it('shows dashboard action on base route', () => {
    renderPage('/gestao-marketing');

    expect(screen.getByText('Gestão de Marketing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adicionar Prestador/i })).toBeInTheDocument();
  });

  it('handles professional create, update and delete flows in dashboard view', () => {
    renderPage('/gestao-marketing');

    fireEvent.click(screen.getByText('Studio Ads'));
    fireEvent.change(screen.getByLabelText('Nome do profissional'), {
      target: { value: 'Studio Ads Prime' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('Studio Ads Prime')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Prestador/i }));
    fireEvent.change(screen.getByLabelText('Nome do profissional'), {
      target: { value: 'Novo Prestador' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('Novo Prestador')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Studio Ads Prime'));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Excluir' }).at(-1) as HTMLElement);
    expect(screen.queryByText('Studio Ads Prime')).not.toBeInTheDocument();
  });

  it('handles activity lifecycle and deletion confirmation in content view', () => {
    renderPage('/gestao-marketing/conteudos');

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar Realização' }));
    expect(screen.getByRole('button', { name: 'Marcar como Pendente' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByPlaceholderText('Ex: Reels Obra Residência Silva'), {
      target: { value: 'Post semanal editado' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('Post semanal editado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Novo Conteúdo' }));
    fireEvent.change(screen.getByPlaceholderText('Ex: Reels Obra Residência Silva'), {
      target: { value: 'Nova atividade agenda' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('Nova atividade agenda')).toBeInTheDocument();

    const contentTable = screen.getByRole('table');
    const newActivityRow = within(contentTable).getByText('Nova atividade agenda').closest('tr');
    expect(newActivityRow).not.toBeNull();
    fireEvent.click(within(newActivityRow as HTMLElement).getByRole('button', { name: 'Excluir' }));
    const deleteDialog = screen.getByRole('dialog', { name: /Confirmar Exclusão de activity/i });
    fireEvent.click(within(deleteDialog).getByRole('button', { name: 'Excluir' }));
    expect(within(contentTable).queryByText('Nova atividade agenda')).not.toBeInTheDocument();
  });

  it('handles ideas favorite toggle, create, update and delete flows', () => {
    renderPage('/gestao-marketing/banco-de-ideias');

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar aos favoritos' }));
    expect(screen.getByRole('button', { name: 'Remover dos favoritos' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('Conteúdo de bastidores'));
    fireEvent.change(screen.getByLabelText('Conteúdo da ideia'), {
      target: { value: 'Conteúdo de bastidores editado' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('Conteúdo de bastidores editado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Nova Ideia' }));
    fireEvent.change(screen.getByLabelText('Conteúdo da ideia'), {
      target: { value: 'Nova ideia criativa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('Nova ideia criativa')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Nova ideia criativa'));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Excluir' }).at(-1) as HTMLElement);
    expect(screen.queryByText('Nova ideia criativa')).not.toBeInTheDocument();
  });
});
