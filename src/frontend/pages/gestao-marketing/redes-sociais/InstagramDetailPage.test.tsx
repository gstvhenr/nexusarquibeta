import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { FinancialSecurityProvider } from '@/context/FinancialSecurityContext';
import { api } from '@/services/infrastructure/api';

import InstagramDetailPage from './InstagramDetailPage';

const renderDetailPage = (initialEntry: string): void => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <FinancialSecurityProvider>
        <DataProvider>
          <Routes>
            <Route path="/gestao-marketing/redes-sociais" element={<div>Lista de redes</div>} />
            <Route
              path="/gestao-marketing/redes-sociais/:networkId"
              element={<InstagramDetailPage />}
            />
          </Routes>
        </DataProvider>
      </FinancialSecurityProvider>
    </MemoryRouter>,
  );
};

describe('InstagramDetailPage', () => {
  beforeEach(() => {
    api.clearAllData();
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    api.clearAllData();
    document.getElementById('modal-root')?.remove();
  });

  it('renders not-found state for unsupported social network id', () => {
    renderDetailPage('/gestao-marketing/redes-sociais/Unsupported');

    expect(screen.getByText('Rede não encontrada')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Lista de redes')).toBeInTheDocument();
  });

  it('handles notes and snapshot lifecycle while using activity investment as source of truth', async () => {
    const snapshot = api.getData();
    snapshot.marketingActivities = [
      {
        id: 'activity-instagram',
        title: 'Reels institucional',
        status: 'Pendente',
        contentType: 'Reels (Instagram)',
        dueDate: '2026-03-10T10:00:00.000Z',
        responsibleId: 'professional-1',
        cost: 450,
      },
      {
        id: 'activity-facebook',
        title: 'Post Facebook',
        status: 'Pendente',
        contentType: 'Post (Facebook)',
        dueDate: '2026-03-10T11:00:00.000Z',
        responsibleId: 'professional-1',
        cost: 999,
      },
    ];
    snapshot.socialNetworks = [
      {
        id: 'Instagram',
        url: 'https://instagram.com/nexus.arqui',
        profileHandle: '@nexus.arqui',
        followers: 1250,
        notes: 'Anotação inicial',
        totalInvested: 9999,
        lastUpdated: '2026-03-01T12:00:00.000Z',
        instagramSnapshots: [
          {
            id: 'snap-old',
            posts: 10,
            followers: 1200,
            following: 700,
            recordedAt: '2026-03-01T12:00:00.000Z',
          },
        ],
      },
    ];
    api.replaceData(snapshot);

    renderDetailPage('/gestao-marketing/redes-sociais/Instagram');

    expect(await screen.findByText('@nexus.arqui')).toBeInTheDocument();
    expect(screen.getByText(/R\$ 450,00/)).toBeInTheDocument();
    expect(screen.getByText('Último cadastro manual')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByPlaceholderText('Observação breve sobre o perfil.'), {
      target: { value: 'Notas refinadas para o perfil.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('Notas refinadas para o perfil.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Novo Registro/i }));
    fireEvent.change(screen.getByPlaceholderText('Ex: 118'), { target: { value: '88' } });
    fireEvent.change(screen.getByPlaceholderText('Ex: 6859'), { target: { value: '1300' } });
    fireEvent.change(screen.getByPlaceholderText('Ex: 946'), { target: { value: '710' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar registro' }));

    expect(await screen.findByText('1.300 seguidores')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Excluir registro' })[0]);
    expect(screen.queryByText('1.300 seguidores')).not.toBeInTheDocument();
  });

  it('opens credentials modal and saves Instagram credentials', async () => {
    renderDetailPage('/gestao-marketing/redes-sociais/Instagram');

    expect(await screen.findByText('Último cadastro manual')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Acessos' }));
    expect(screen.getByRole('heading', { name: 'Acessos — Instagram' })).toBeInTheDocument();
    expect(screen.getByText('Nenhuma credencial cadastrada.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar credenciais' }));
    fireEvent.change(screen.getByPlaceholderText('usuario@email.com'), {
      target: { value: 'instagram@nexus.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Senha da plataforma'), {
      target: { value: 'senha-super-segura' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByText('instagram@nexus.com')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByText('senha-super-segura')).toBeInTheDocument();
  });

  it('creates missing network data for a supported non-instagram route when saving notes', async () => {
    const snapshot = api.getData();
    snapshot.socialNetworks = [];
    api.replaceData(snapshot);

    renderDetailPage('/gestao-marketing/redes-sociais/Facebook');

    expect(await screen.findByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma informação breve cadastrada.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    fireEvent.change(screen.getByPlaceholderText('Observação breve sobre o perfil.'), {
      target: { value: 'Conta usada para campanhas locais.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByText('Conta usada para campanhas locais.')).toBeInTheDocument();
  });
});
