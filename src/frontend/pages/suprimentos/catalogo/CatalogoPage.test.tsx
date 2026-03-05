import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import CatalogoPage from './CatalogoPage';

describe('CatalogoPage', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    api.clearAllData();
    const snapshot = api.getData();
    api.replaceData({
      ...snapshot,
      suppliers: [
        {
          id: 'sup-1',
          name: 'Fornecedor Alpha',
          logo: '',
          categories: ['Marcenaria'],
          mainContact: { name: 'Contato', phone: '(11) 99999-1111', hasWhatsApp: true },
          archived: false,
        },
        {
          id: 'sup-2',
          name: 'Fornecedor Beta',
          logo: '',
          categories: ['Marcenaria'],
          mainContact: { name: 'Contato', phone: '(11) 99999-2222', hasWhatsApp: true },
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
      ],
      supplierProductPrices: [
        {
          id: 'price-1',
          productId: 'prod-1',
          supplierId: 'sup-1',
          priceHistory: [{ date: '2026-02-01', price: 300 }],
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    api.clearAllData();
  });

  it('renders product table and opens product modal for creation', () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <CatalogoPage />
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Catálogo de Produtos')).toBeInTheDocument();
    expect(screen.getByText('Painel Ripado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Produto/i }));
    expect(screen.getByRole('heading', { name: 'Adicionar Produto' })).toBeInTheDocument();
  });

  it('switches from grid to details card when clicking a product row', () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <CatalogoPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Painel Ripado'));

    expect(screen.getByRole('heading', { name: 'Painel Ripado' })).toBeInTheDocument();
    expect(screen.getByText('Tabela de Preços')).toBeInTheDocument();
  });

  it('filters products and shows empty state when query has no match', () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <CatalogoPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('Buscar produto...'), {
      target: { value: 'nao-encontrado' },
    });

    expect(screen.getByText('Nenhum produto encontrado.')).toBeInTheDocument();
  });

  it('edits product and synchronizes supplier relations', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <CatalogoPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    fireEvent.change(screen.getByLabelText('Nome do Produto'), {
      target: { value: 'Painel Ripado Premium' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Vincular Fornecedores/i }));

    const supplierCheckbox = screen.getByRole('checkbox', { name: 'Fornecedor Alpha' });
    expect(supplierCheckbox).toBeChecked();
    fireEvent.click(supplierCheckbox);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(api.getData().products.find((product) => product.id === 'prod-1')?.name).toBe(
        'Painel Ripado Premium',
      ),
    );
    expect(
      api.getData().supplierProductPrices.filter((price) => price.productId === 'prod-1'),
    ).toHaveLength(0);
  });

  it('adds prices for existing and new supplier relations from details view', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <CatalogoPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Painel Ripado'));

    fireEvent.click(screen.getByRole('button', { name: /Novo Preço/i }));
    fireEvent.change(screen.getByLabelText('Preço (R$)'), { target: { value: '350' } });
    fireEvent.change(screen.getByLabelText('Data do preço'), { target: { value: '2026-03-02' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Preço' }));

    fireEvent.click(screen.getByRole('button', { name: /Novo Preço/i }));
    fireEvent.change(screen.getByLabelText('Fornecedor'), { target: { value: 'sup-2' } });
    fireEvent.change(screen.getByLabelText('Preço (R$)'), { target: { value: '420' } });
    fireEvent.change(screen.getByLabelText('Data do preço'), { target: { value: '2026-03-03' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Preço' }));

    await waitFor(() => {
      const prices = api.getData().supplierProductPrices;
      const alphaPrice = prices.find(
        (price) => price.productId === 'prod-1' && price.supplierId === 'sup-1',
      );
      const betaPrice = prices.find(
        (price) => price.productId === 'prod-1' && price.supplierId === 'sup-2',
      );

      expect(alphaPrice?.priceHistory).toHaveLength(2);
      expect(alphaPrice?.priceHistory).toEqual(
        expect.arrayContaining([{ date: '2026-03-02', price: 350 }]),
      );
      expect(betaPrice?.priceHistory).toHaveLength(1);
      expect(betaPrice?.priceHistory[0]).toEqual({ date: '2026-03-03', price: 420 });
    });
  });
});
