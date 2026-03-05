import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import ProspectsPage from './ProspectsPage';

describe('ProspectsPage', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    api.clearAllData();
    const snapshot = api.getData();

    api.replaceData({
      ...snapshot,
      prospects: [
        {
          id: 'prospect-active',
          name: 'Prospect Ativo',
          phone: '(11) 99999-0000',
          hasWhatsApp: true,
          email: 'ativo@example.com',
          social: '',
          contact: '',
          origin: 'Instagram',
          interest: 'Residencial',
          priority: 'Média',
          status: 'Em Aberto',
          createdAt: '2026-01-01T10:00:00.000Z',
          startDate: '2026-01-01',
          followUpDays: 15,
          notes: '',
          archived: false,
        },
        {
          id: 'prospect-archived',
          name: 'Prospect Arquivado',
          phone: '',
          hasWhatsApp: false,
          email: '',
          social: '',
          contact: '',
          origin: 'Facebook',
          interest: 'Comercial',
          priority: 'Baixa',
          status: 'Perdido',
          createdAt: '2026-01-01T10:00:00.000Z',
          startDate: '2026-01-01',
          followUpDays: 15,
          notes: '',
          archived: true,
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    api.clearAllData();
  });

  it('renders active list and toggles archived view', () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <ProspectsPage />
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Prospects')).toBeInTheDocument();
    expect(screen.getByText('Prospect Ativo')).toBeInTheDocument();
    expect(screen.queryByText('Prospect Arquivado')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivados' }));

    expect(screen.getByText('Prospect Arquivado')).toBeInTheDocument();
    expect(screen.queryByText('Prospect Ativo')).not.toBeInTheDocument();
  });

  it('opens prospect creation modal from page header action', () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <ProspectsPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Prospect/i }));

    expect(screen.getByText('Adicionar ao Radar')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });
});
