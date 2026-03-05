import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import CotacoesPage from './CotacoesPage';

const QuotationDetailsStub = () => {
  const { id } = useParams();
  return <div data-testid="quotation-details-id">{id}</div>;
};

describe('CotacoesPage', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    api.clearAllData();
    const snapshot = api.getData();
    api.replaceData({
      ...snapshot,
      projects: [
        {
          ...snapshot.projects[0],
          id: 'proj-1',
          name: 'Projeto Alpha',
          code: 'PRJ-001',
          archived: false,
        },
      ],
      quotations: [
        {
          id: 'qt-active',
          name: 'Cotação Ativa',
          date: '2026-02-15',
          projectId: 'proj-1',
          items: [],
          selections: {},
          status: 'Em Aberto',
          archived: false,
        },
        {
          id: 'qt-archived',
          name: 'Cotação Arquivada',
          date: '2026-02-10',
          projectId: 'proj-1',
          items: [],
          selections: {},
          status: 'Finalizada',
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

  it('toggles between active and archived quotations', () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <CotacoesPage />
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Cotações')).toBeInTheDocument();
    expect(screen.getByText('Cotação Ativa')).toBeInTheDocument();
    expect(screen.queryByText('Cotação Arquivada')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivadas' }));

    expect(screen.getByText('Cotação Arquivada')).toBeInTheDocument();
    expect(screen.queryByText('Cotação Ativa')).not.toBeInTheDocument();
  });

  it('opens deletion confirmation modal for selected quotation', () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <CotacoesPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText('Excluir'));

    expect(screen.getByText('Confirmar Exclusão de Cotação')).toBeInTheDocument();
    expect(screen.getByText(/Tem certeza que deseja excluir/)).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('navigates to details page when creating a new quotation', () => {
    render(
      <MemoryRouter initialEntries={['/cotacoes']}>
        <DataProvider>
          <Routes>
            <Route path="/cotacoes" element={<CotacoesPage />} />
            <Route path="/cotacoes/:id" element={<QuotationDetailsStub />} />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Nova Cotação/i }));

    expect(screen.getByTestId('quotation-details-id').textContent).toMatch(/^qt_/);
  });

  it('archives and unarchives quotations through row actions', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <CotacoesPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText('Arquivar'));

    await waitFor(() => {
      expect(screen.queryByText('Cotação Ativa')).not.toBeInTheDocument();
      expect(screen.getByText('Nenhuma cotação criada')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivadas' }));
    expect(screen.getByText('Cotação Ativa')).toBeInTheDocument();

    fireEvent.click(screen.getAllByLabelText('Desarquivar')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Ver Ativas' }));

    await waitFor(() => expect(screen.getByText('Cotação Ativa')).toBeInTheDocument());
  });

  it('deletes quotation after confirmation', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <CotacoesPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText('Excluir'));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }));

    await waitFor(() => {
      expect(screen.queryByText('Cotação Ativa')).not.toBeInTheDocument();
      expect(screen.getByText('Nenhuma cotação criada')).toBeInTheDocument();
    });
  });
});
