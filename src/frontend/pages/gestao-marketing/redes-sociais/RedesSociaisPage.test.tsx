import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import RedesSociaisPage from './RedesSociaisPage';

describe('RedesSociaisPage', () => {
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

  it('renders supported social networks, opens modal and saves a new profile', () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <RedesSociaisPage />
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Redes Sociais')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Adicionar' })[0]);

    expect(screen.getByRole('heading', { name: 'Editar Instagram' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://instagram.com/seu_usuario')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('https://instagram.com/seu_usuario'), {
      target: { value: 'https://instagram.com/arq.nexus' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ex: 1500'), { target: { value: '3210' } });
    fireEvent.change(screen.getByPlaceholderText('Estratégias de conteúdo, público-alvo, etc.'), {
      target: { value: 'Perfil institucional atualizado.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByText('https://instagram.com/arq.nexus')).toBeInTheDocument();
    expect(screen.getByText('3.210')).toBeInTheDocument();
    expect(screen.getByText('Perfil institucional atualizado.')).toBeInTheDocument();
    expect(screen.getByText(/Atualizado em:/)).toBeInTheDocument();
  });

  it('prefills existing network data and updates the record on save', () => {
    const snapshot = api.getData();
    snapshot.socialNetworks = [
      {
        id: 'Instagram',
        url: 'https://instagram.com/antigo',
        followers: 1200,
        notes: 'Anotações antigas',
        lastUpdated: '2026-03-01T10:00:00.000Z',
      },
    ];
    api.replaceData(snapshot);

    render(
      <MemoryRouter>
        <DataProvider>
          <RedesSociaisPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getByDisplayValue('https://instagram.com/antigo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1200')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Anotações antigas')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('1200'), { target: { value: '1500' } });
    fireEvent.change(screen.getByDisplayValue('Anotações antigas'), {
      target: { value: 'Notas atualizadas' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByText('1.500')).toBeInTheDocument();
    expect(screen.getByText('Notas atualizadas')).toBeInTheDocument();
  });

  it('navigates to details when pressing Enter/Space on social card', () => {
    render(
      <MemoryRouter initialEntries={['/gestao-marketing/redes-sociais']}>
        <DataProvider>
          <Routes>
            <Route path="/gestao-marketing/redes-sociais" element={<RedesSociaisPage />} />
            <Route
              path="/gestao-marketing/redes-sociais/:id"
              element={<div>Detalhe de rede social</div>}
            />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    const instagramCard = screen.getByText('Instagram').closest('[role="button"]');
    expect(instagramCard).not.toBeNull();

    fireEvent.keyDown(instagramCard as HTMLElement, { key: 'Enter' });
    expect(screen.getByText('Detalhe de rede social')).toBeInTheDocument();
  });

  it('navigates to details when pressing Space on social card', () => {
    render(
      <MemoryRouter initialEntries={['/gestao-marketing/redes-sociais']}>
        <DataProvider>
          <Routes>
            <Route path="/gestao-marketing/redes-sociais" element={<RedesSociaisPage />} />
            <Route
              path="/gestao-marketing/redes-sociais/:id"
              element={<div>Detalhe via espaço</div>}
            />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    const instagramCard = screen.getByText('Instagram').closest('[role="button"]');
    expect(instagramCard).not.toBeNull();
    fireEvent.keyDown(instagramCard as HTMLElement, { key: ' ' });

    expect(screen.getByText('Detalhe via espaço')).toBeInTheDocument();
  });
});
