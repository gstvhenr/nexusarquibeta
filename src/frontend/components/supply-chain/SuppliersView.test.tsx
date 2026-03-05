import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  Commission,
  PriceEntry,
  Product,
  Quotation,
  Supplier,
  SupplierProductPrice,
} from '../../types';
import SuppliersView from './SuppliersView';

const makeSupplier = (overrides: Partial<Supplier> = {}): Supplier => ({
  id: 'sup-1',
  name: 'Fornecedor Alpha',
  logo: '',
  categories: ['Marmoraria'],
  cnpj: '12.345.678/0001-90',
  address: 'Rua A, 10',
  site: 'https://alpha.example.com',
  mainContact: {
    name: 'Ana Alpha',
    role: 'Compradora',
    phone: '(11) 99999-1111',
    email: 'ana@alpha.com',
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

const makePriceHistory = (...entries: Array<Partial<PriceEntry>>): PriceEntry[] =>
  entries.map((entry, index) => ({
    date: entry.date || `2026-03-${String(index + 1).padStart(2, '0')}`,
    price: entry.price ?? 0,
  }));

const makeSupplierProductPrice = (
  overrides: Partial<SupplierProductPrice> = {},
): SupplierProductPrice => ({
  id: 'price-1',
  supplierId: 'sup-1',
  productId: 'prod-1',
  priceHistory: makePriceHistory({ date: '2026-03-01', price: 150 }),
  ...overrides,
});

const makeCommission = (overrides: Partial<Commission> = {}): Commission => ({
  id: 'comm-1',
  saleDate: '2026-01-15',
  supplierId: 'sup-1',
  supplierName: 'Fornecedor Alpha',
  clientId: 'cli-1',
  clientName: 'Cliente A',
  saleValue: 2000,
  commissionPercentage: 10,
  commissionValue: 200,
  status: 'Pendente',
  ...overrides,
});

const makeQuotation = (overrides: Partial<Quotation> = {}): Quotation => ({
  id: 'quote-1',
  name: 'Cotação 01',
  date: '2026-02-20',
  items: [{ productId: 'prod-1', quantity: 2 }],
  selections: { 'prod-1': 'sup-1' },
  status: 'Finalizada',
  ...overrides,
});

describe('SuppliersView', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    vi.restoreAllMocks();
  });

  it('selects the first active supplier alphabetically and excludes archived suppliers', async () => {
    render(
      <SuppliersView
        suppliers={[
          makeSupplier({ id: 'sup-b', name: 'Fornecedor Beta', categories: ['Marcenaria'] }),
          makeSupplier({ id: 'sup-a', name: 'Fornecedor Alpha', categories: ['Marmoraria'] }),
          makeSupplier({ id: 'sup-z', name: 'Fornecedor Arquivado', archived: true }),
        ]}
        commissions={[]}
        quotations={[]}
        projects={[]}
        products={[]}
        prices={[]}
        onEditSupplier={vi.fn()}
        onLinkProduct={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Fornecedor Alpha' })).toBeInTheDocument();
    });

    expect(screen.queryByText('Fornecedor Arquivado')).not.toBeInTheDocument();
  });

  it('filters suppliers by name and category', () => {
    render(
      <SuppliersView
        suppliers={[
          makeSupplier({ id: 'sup-a', name: 'Fornecedor Alpha', categories: ['Marmoraria'] }),
          makeSupplier({ id: 'sup-b', name: 'Fornecedor Beta', categories: ['Marcenaria'] }),
        ]}
        commissions={[]}
        quotations={[]}
        projects={[]}
        products={[]}
        prices={[]}
        onEditSupplier={vi.fn()}
        onLinkProduct={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Buscar fornecedor'), {
      target: { value: 'marcenaria' },
    });

    expect(screen.getByText('Fornecedor Beta', { selector: 'p' })).toBeInTheDocument();
    expect(screen.queryByText('Fornecedor Alpha', { selector: 'p' })).not.toBeInTheDocument();
  });

  it('computes pending commission and total negotiated value for selected supplier', async () => {
    render(
      <SuppliersView
        suppliers={[
          makeSupplier({ id: 'sup-a', name: 'Fornecedor Alpha' }),
          makeSupplier({ id: 'sup-b', name: 'Fornecedor Beta' }),
        ]}
        commissions={[
          makeCommission({ id: 'c1', supplierId: 'sup-a', commissionValue: 120, status: 'Pendente' }),
          makeCommission({ id: 'c2', supplierId: 'sup-a', commissionValue: 300, status: 'Recebido' }),
          makeCommission({ id: 'c3', supplierId: 'sup-b', commissionValue: 500, status: 'Pendente' }),
        ]}
        quotations={[
          makeQuotation({
            id: 'q1',
            status: 'Finalizada',
            selections: { 'prod-1': 'sup-a' },
            items: [{ productId: 'prod-1', quantity: 2 }],
          }),
          makeQuotation({
            id: 'q2',
            status: 'Em Aberto',
            selections: { 'prod-1': 'sup-a' },
            items: [{ productId: 'prod-1', quantity: 2 }],
          }),
          makeQuotation({
            id: 'q3',
            status: 'Finalizada',
            selections: { 'prod-1': 'sup-b' },
            items: [{ productId: 'prod-1', quantity: 5 }],
          }),
        ]}
        projects={[]}
        products={[makeProduct()]}
        prices={[
          makeSupplierProductPrice({
            supplierId: 'sup-a',
            productId: 'prod-1',
            priceHistory: makePriceHistory({ date: '2026-03-01', price: 80 }),
          }),
          makeSupplierProductPrice({
            id: 'price-b',
            supplierId: 'sup-b',
            productId: 'prod-1',
            priceHistory: makePriceHistory({ date: '2026-03-01', price: 20 }),
          }),
        ]}
        onEditSupplier={vi.fn()}
        onLinkProduct={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/R\$\s*120,00/)).toBeInTheDocument();
    });

    expect(screen.getByText(/R\$\s*160,00/)).toBeInTheDocument();
  });

  it('opens link modal, saves link and closes modal', async () => {
    const onLinkProduct = vi.fn();

    render(
      <SuppliersView
        suppliers={[makeSupplier({ id: 'sup-a', name: 'Fornecedor Alpha' })]}
        commissions={[]}
        quotations={[]}
        projects={[]}
        products={[makeProduct({ id: 'prod-1', name: 'Bancada' })]}
        prices={[]}
        onEditSupplier={vi.fn()}
        onLinkProduct={onLinkProduct}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Vincular Produto/i }));

    expect(screen.getByText('Vincular Produto a Fornecedor Alpha')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Produto do catálogo'), {
      target: { value: 'prod-1' },
    });
    fireEvent.change(screen.getByLabelText('Preço atual'), {
      target: { value: '350' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Salvar Vínculo/i }));

    expect(onLinkProduct).toHaveBeenCalledWith('prod-1', 350);

    await waitFor(() => {
      expect(screen.queryByText('Vincular Produto a Fornecedor Alpha')).not.toBeInTheDocument();
    });
  });

  it('falls back to the first active supplier when selected one is removed', async () => {
    const initialSuppliers = [
      makeSupplier({ id: 'sup-a', name: 'Fornecedor Alpha' }),
      makeSupplier({ id: 'sup-b', name: 'Fornecedor Beta' }),
    ];

    const { rerender } = render(
      <SuppliersView
        suppliers={initialSuppliers}
        commissions={[]}
        quotations={[]}
        projects={[]}
        products={[]}
        prices={[]}
        onEditSupplier={vi.fn()}
        onLinkProduct={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Fornecedor Beta'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Fornecedor Beta' })).toBeInTheDocument();
    });

    rerender(
      <SuppliersView
        suppliers={[makeSupplier({ id: 'sup-a', name: 'Fornecedor Alpha' })]}
        commissions={[]}
        quotations={[]}
        projects={[]}
        products={[]}
        prices={[]}
        onEditSupplier={vi.fn()}
        onLinkProduct={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Fornecedor Alpha' })).toBeInTheDocument();
    });
  });
});
