import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import ComissoesPage from './ComissoesPage';

describe('ComissoesPage', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    api.clearAllData();
    const snapshot = api.getData();
    api.replaceData({
      ...snapshot,
      commissions: [
        {
          id: 'comm-active',
          saleDate: '2026-03-10',
          supplierId: 'sup-1',
          supplierName: 'Fornecedor Ativo',
          clientId: 'cli-1',
          clientName: 'Cliente A',
          saleValue: 5000,
          commissionPercentage: 10,
          commissionValue: 500,
          status: 'Pendente',
          expectedPaymentDate: '2026-03-20',
          paymentDate: null,
          notes: '',
          archived: false,
        },
        {
          id: 'comm-archived',
          saleDate: '2026-03-05',
          supplierId: 'sup-2',
          supplierName: 'Fornecedor Arquivado',
          clientId: 'cli-2',
          clientName: 'Cliente B',
          saleValue: 7000,
          commissionPercentage: 10,
          commissionValue: 700,
          status: 'Recebido',
          expectedPaymentDate: '2026-03-15',
          paymentDate: '2026-03-15',
          notes: '',
          archived: true,
        },
      ],
      suppliers: [
        {
          id: 'sup-1',
          name: 'Fornecedor Ativo',
          logo: '',
          categories: [],
          mainContact: { name: 'A', phone: '1', hasWhatsApp: false },
          archived: false,
        },
      ],
      clients: [
        {
          id: 'cli-1',
          name: 'Cliente A',
          contacts: [],
          status: 'Cliente Ativo',
          serviceInterests: [],
          address: {
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            zip: '',
          },
          isFavorite: false,
          registrationDate: '2026-01-01',
          lastContactDate: '2026-01-01',
          pipelineStatus: '',
          meetings: [],
          behavioralProfile: { notes: '' },
          archived: false,
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    api.clearAllData();
  });

  it('renders active commissions and toggles archived view', () => {
    render(
      <DataProvider>
        <ComissoesPage />
      </DataProvider>,
    );

    expect(screen.getByText('Comissões')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Fornecedor Ativo' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Fornecedor Arquivado' })).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /500,00/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivadas' }));

    expect(screen.getByRole('cell', { name: 'Fornecedor Arquivado' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Fornecedor Ativo' })).not.toBeInTheDocument();
  });

  it('opens creation modal from header action', () => {
    render(
      <DataProvider>
        <ComissoesPage />
      </DataProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Comissão/i }));

    expect(screen.getByLabelText('Fornecedor')).toBeInTheDocument();
  });

  it('confirms payment and updates commission status', async () => {
    render(
      <DataProvider>
        <ComissoesPage />
      </DataProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    fireEvent.change(screen.getByLabelText('Data de Recebimento'), {
      target: { value: '2026-03-21' },
    });
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument();
      expect(screen.getByLabelText('Arquivar comissão')).toBeInTheDocument();
    });
  });

  it('deletes an active commission after confirmation', async () => {
    render(
      <DataProvider>
        <ComissoesPage />
      </DataProvider>,
    );

    fireEvent.click(screen.getByLabelText('Excluir comissão'));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => {
      expect(screen.queryByRole('cell', { name: 'Fornecedor Ativo' })).not.toBeInTheDocument();
      expect(screen.getByText('Nenhuma comissão encontrada.')).toBeInTheDocument();
    });
  });

  it('filters by status and supplier while toggling archived view', async () => {
    render(
      <DataProvider>
        <ComissoesPage />
      </DataProvider>,
    );

    fireEvent.change(screen.getByLabelText('Filtrar por status'), {
      target: { value: 'Recebido' },
    });
    expect(screen.getByText('Nenhuma comissão encontrada.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivadas' }));
    await waitFor(() =>
      expect(screen.getByRole('cell', { name: 'Fornecedor Arquivado' })).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText('Filtrar por fornecedor'), {
      target: { value: 'sup-1' },
    });
    expect(screen.getByText('Nenhuma comissão encontrada.')).toBeInTheDocument();
  });
});
