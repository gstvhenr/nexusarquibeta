import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import FornecedoresPage from './FornecedoresPage';

describe('FornecedoresPage', () => {
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
          name: 'Fornecedor Atlas',
          logo: '',
          categories: ['Marcenaria'],
          commissionPercentage: 8,
          mainContact: { name: 'Contato', phone: '11 99999-1111', hasWhatsApp: true },
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
    });
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    api.clearAllData();
    vi.restoreAllMocks();
  });

  it('opens supplier form modal from page header', () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <FornecedoresPage />
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Fornecedores')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Fornecedor/i }));

    expect(screen.getByRole('heading', { name: 'Adicionar Fornecedor' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar Fornecedor' })).toBeInTheDocument();
  }, 15000);

  it('saves a new supplier from modal form', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <FornecedoresPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Fornecedor/i }));
    fireEvent.change(screen.getByPlaceholderText('Ex: Marmoraria Pedra Fina'), {
      target: { value: 'Fornecedor Novo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Fornecedor' }));

    await waitFor(() =>
      expect(api.getData().suppliers.some((supplier) => supplier.name === 'Fornecedor Novo')).toBe(
        true,
      ),
    );
  });

  it('archives supplier after user confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <DataProvider>
          <FornecedoresPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Arquivar' }));

    await waitFor(() => expect(api.getData().suppliers[0].archived).toBe(true));
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('deletes supplier from edit modal after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <DataProvider>
          <FornecedoresPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(api.getData().suppliers).toHaveLength(0));
  });

  it('links a product to selected supplier with a new price', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <FornecedoresPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Editar Fornecedor' })).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Fornecedor Atlas/i }));
    fireEvent.click(screen.getByRole('button', { name: /Vincular Produto/i }));
    const productSelect = screen.getByLabelText('Produto do catálogo');
    fireEvent.change(productSelect, {
      target: { value: 'prod-1' },
    });
    expect(productSelect).toHaveValue('prod-1');
    fireEvent.change(screen.getByLabelText('Preço atual'), {
      target: { value: '180' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Vínculo' }));

    await waitFor(() => {
      const linkedPrice = api
        .getData()
        .supplierProductPrices.find((price) => price.productId === 'prod-1');
      expect(linkedPrice).toBeDefined();
      expect(linkedPrice?.supplierId).toBe('sup-1');
      expect(linkedPrice?.priceHistory?.[0]?.price).toBe(180);
    });
  });
});
