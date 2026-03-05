import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import CotacaoDetalhesPage from './CotacaoDetalhesPage';

describe('CotacaoDetalhesPage', () => {
  const expectFooterTotals = (cost: string, commission: string) => {
    const costBlock = screen.getByText('Custo Total (Cliente):').parentElement;
    const commissionBlock = screen.getByText('Comissão Potencial:').parentElement;
    expect(costBlock).toHaveTextContent(cost);
    expect(commissionBlock).toHaveTextContent(commission);
  };

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
          name: 'Projeto Sala',
          code: 'PRJ-001',
          archived: false,
        },
      ],
      suppliers: [
        {
          id: 'sup-1',
          name: 'Fornecedor Alpha',
          logo: '',
          categories: ['Marcenaria'],
          commissionPercentage: 10,
          mainContact: { name: 'Contato', phone: '11 99999-1111', hasWhatsApp: true },
          archived: false,
        },
        {
          id: 'sup-2',
          name: 'Fornecedor Beta',
          logo: '',
          categories: ['Marcenaria'],
          commissionPercentage: 5,
          mainContact: { name: 'Contato', phone: '11 99999-2222', hasWhatsApp: true },
          archived: false,
        },
      ],
      products: [
        {
          id: 'prod-1',
          name: 'Painel Ripado',
          category: 'Marcenaria',
          unit: 'un',
          archived: false,
        },
        {
          id: 'prod-2',
          name: 'Tinta Premium',
          category: 'Tintas',
          unit: 'un',
          archived: false,
        },
      ],
      supplierProductPrices: [
        {
          id: 'price-1',
          productId: 'prod-1',
          supplierId: 'sup-1',
          priceHistory: [{ date: '2026-02-01', price: 100 }],
        },
        {
          id: 'price-2',
          productId: 'prod-1',
          supplierId: 'sup-2',
          priceHistory: [{ date: '2026-02-01', price: 80 }],
        },
        {
          id: 'price-3',
          productId: 'prod-2',
          supplierId: 'sup-1',
          priceHistory: [{ date: '2026-02-01', price: 50 }],
        },
      ],
      quotations: [
        {
          id: 'qt-existing',
          name: 'Cotação Sala',
          date: '2026-02-15',
          projectId: 'proj-1',
          items: [{ productId: 'prod-1', quantity: 2 }],
          selections: { 'prod-1': 'sup-1' },
          status: 'Em Aberto',
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

  it('renders not-found state when quotation does not exist', () => {
    render(
      <MemoryRouter initialEntries={['/cotacoes/nao-existe']}>
        <DataProvider>
          <Routes>
            <Route path="/cotacoes/:id" element={<CotacaoDetalhesPage />} />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Cotação não encontrada.')).toBeInTheDocument();
  });

  it('recalculates totals when selecting supplier, changing quantity and removing item', async () => {
    render(
      <MemoryRouter initialEntries={['/cotacoes/qt-existing']}>
        <DataProvider>
          <Routes>
            <Route path="/cotacoes/:id" element={<CotacaoDetalhesPage />} />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByDisplayValue('Cotação Sala')).toBeInTheDocument();
    expectFooterTotals('200,00', '20,00');

    fireEvent.click(screen.getByText('Painel Ripado'));
    fireEvent.click(screen.getByText('Fornecedor Beta'));

    await waitFor(() => {
      expectFooterTotals('160,00', '8,00');
    });

    fireEvent.change(screen.getByLabelText('Quantidade para Painel Ripado'), {
      target: { value: '3' },
    });

    await waitFor(() => expectFooterTotals('240,00', '12,00'));

    fireEvent.click(screen.getByLabelText('Remover produto da cotação'));

    await waitFor(() => expectFooterTotals('0,00', '0,00'));
  });

  it('adds products and persists quotation updates on save', async () => {
    render(
      <MemoryRouter initialEntries={['/cotacoes/qt-existing']}>
        <DataProvider>
          <Routes>
            <Route path="/cotacoes" element={<div>Página de Cotações</div>} />
            <Route path="/cotacoes/:id" element={<CotacaoDetalhesPage />} />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Produtos/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar Tinta Premium' }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Selecionados' }));

    expect(screen.getByText('Tinta Premium')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Cotação' }));

    await waitFor(() => expect(screen.getByText('Página de Cotações')).toBeInTheDocument());
    expect(
      api
        .getData()
        .quotations.find((quotation) => quotation.id === 'qt-existing')
        ?.items.some((item) => item.productId === 'prod-2'),
    ).toBe(true);
  });

  it('creates draft data for qt_new id and cancels without persisting', async () => {
    render(
      <MemoryRouter initialEntries={['/cotacoes/qt_new_123']}>
        <DataProvider>
          <Routes>
            <Route path="/cotacoes" element={<div>Página de Cotações</div>} />
            <Route path="/cotacoes/:id" element={<CotacaoDetalhesPage />} />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByDisplayValue('Nova Cotação')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.getByText('Página de Cotações')).toBeInTheDocument());
    expect(api.getData().quotations.some((quotation) => quotation.id === 'qt_new_123')).toBe(
      false,
    );
  });
});
