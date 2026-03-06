import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Product, Supplier } from '../../types';
import { formatDate } from '../../utils/formatters';
import { SupplierProductsTab } from './SupplierProductsTab';
import type { SupplierProductSnapshot } from './supplierViewTypes';

const makeSupplier = (overrides: Partial<Supplier> = {}): Supplier => ({
  id: 'sup-1',
  name: 'Fornecedor Base',
  logo: '',
  categories: ['Marmoraria'],
  cnpj: '',
  address: '',
  site: '',
  mainContact: {
    name: 'Contato Base',
    role: 'Compras',
    phone: '(11) 99999-9999',
    email: 'contato@base.com',
    hasWhatsApp: true,
  },
  paymentTerms: '',
  shippingPolicy: '',
  commissionPercentage: 10,
  notes: '',
  archived: false,
  ...overrides,
});

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  name: 'Bancada',
  unit: 'm²',
  category: 'Marmoraria',
  archived: false,
  ...overrides,
});

const makeSnapshot = (
  overrides: Partial<SupplierProductSnapshot> = {},
): SupplierProductSnapshot => ({
  product: makeProduct(),
  latestPrice: 250,
  lastUpdated: new Date('2026-03-01T12:00:00.000Z'),
  ...overrides,
});

describe('SupplierProductsTab', () => {
  it('renders empty state when there are no linked products', () => {
    render(
      <SupplierProductsTab
        supplier={makeSupplier()}
        supplierProducts={[]}
        onOpenLinkModal={vi.fn()}
      />,
    );

    expect(screen.getByText('Catálogo de Produtos')).toBeInTheDocument();
    expect(screen.getByText('Comissão Est. (10%)')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Nenhum produto vinculado. Adicione um produto para começar a monitorar preços.',
      ),
    ).toBeInTheDocument();
  });

  it('renders product rows with formatted values and last update date', () => {
    const row = makeSnapshot();

    render(
      <SupplierProductsTab
        supplier={makeSupplier({ commissionPercentage: 12 })}
        supplierProducts={[row]}
        onOpenLinkModal={vi.fn()}
      />,
    );

    expect(screen.getByText('Bancada')).toBeInTheDocument();
    expect(screen.getByText('Marmoraria')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*250,00/)).toBeInTheDocument();
    expect(screen.getByText('/ m²')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*30,00/)).toBeInTheDocument();
    expect(screen.getByText(formatDate('2026-03-01T12:00:00.000Z'))).toBeInTheDocument();
  });

  it('renders dash when price row has no last update', () => {
    render(
      <SupplierProductsTab
        supplier={makeSupplier()}
        supplierProducts={[makeSnapshot({ lastUpdated: null })]}
        onOpenLinkModal={vi.fn()}
      />,
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('calls onOpenLinkModal when clicking on Vincular Produto', () => {
    const onOpenLinkModal = vi.fn();

    render(
      <SupplierProductsTab
        supplier={makeSupplier()}
        supplierProducts={[makeSnapshot()]}
        onOpenLinkModal={onOpenLinkModal}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Vincular Produto/i }));

    expect(onOpenLinkModal).toHaveBeenCalledTimes(1);
  });
});
