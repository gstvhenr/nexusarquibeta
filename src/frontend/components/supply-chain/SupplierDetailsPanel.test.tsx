import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Commission, Product, Supplier } from '../../types';
import { SupplierDetailsPanel } from './SupplierDetailsPanel';
import type { SupplierProductSnapshot } from './supplierViewTypes';

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
  notes: 'Fornecedor estratégico.',
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

const makeSnapshot = (
  overrides: Partial<SupplierProductSnapshot> = {},
): SupplierProductSnapshot => ({
  product: makeProduct(),
  latestPrice: 300,
  lastUpdated: new Date('2026-03-01T12:00:00.000Z'),
  ...overrides,
});

describe('SupplierDetailsPanel', () => {
  it('renders empty state when no supplier is selected', () => {
    const onEditSupplier = vi.fn();

    render(
      <SupplierDetailsPanel
        selectedSupplier={null}
        activeTab="details"
        onTabChange={vi.fn()}
        supplierProducts={[]}
        supplierCommissions={[]}
        pendingCommissionValue={0}
        totalNegotiatedValue={0}
        onEditSupplier={onEditSupplier}
        onOpenLinkModal={vi.fn()}
      />,
    );

    expect(screen.getByText('Selecione um Fornecedor')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ou cadastre um novo fornecedor/i }));
    expect(onEditSupplier).toHaveBeenCalledWith(null);
  });

  it('renders supplier details and edit action', () => {
    const onEditSupplier = vi.fn();
    const supplier = makeSupplier({ commissionPercentage: 12 });

    render(
      <SupplierDetailsPanel
        selectedSupplier={supplier}
        activeTab="details"
        onTabChange={vi.fn()}
        supplierProducts={[makeSnapshot()]}
        supplierCommissions={[makeCommission()]}
        pendingCommissionValue={245}
        totalNegotiatedValue={9900}
        onEditSupplier={onEditSupplier}
        onOpenLinkModal={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Fornecedor Alpha' })).toBeInTheDocument();
    expect(screen.getByText('Marmoraria')).toBeInTheDocument();
    expect(screen.getByText(/12%\s*Comissão/)).toBeInTheDocument();

    expect(screen.getByText('Produtos no Catálogo')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*245,00/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*9\.900,00/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));
    expect(onEditSupplier).toHaveBeenCalledWith(supplier);
  });

  it('hides commission badge when supplier has no commission percentage', () => {
    render(
      <SupplierDetailsPanel
        selectedSupplier={makeSupplier({ commissionPercentage: 0 })}
        activeTab="details"
        onTabChange={vi.fn()}
        supplierProducts={[]}
        supplierCommissions={[]}
        pendingCommissionValue={0}
        totalNegotiatedValue={0}
        onEditSupplier={vi.fn()}
        onOpenLinkModal={vi.fn()}
      />,
    );

    expect(screen.queryByText(/%\s*Comissão/)).not.toBeInTheDocument();
  });

  it('changes tab and forwards product link action from products tab', () => {
    const onTabChange = vi.fn();
    const onOpenLinkModal = vi.fn();

    render(
      <SupplierDetailsPanel
        selectedSupplier={makeSupplier()}
        activeTab="products"
        onTabChange={onTabChange}
        supplierProducts={[makeSnapshot()]}
        supplierCommissions={[makeCommission()]}
        pendingCommissionValue={100}
        totalNegotiatedValue={2000}
        onEditSupplier={vi.fn()}
        onOpenLinkModal={onOpenLinkModal}
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Histórico Financeiro' }));
    expect(onTabChange).toHaveBeenCalledWith('commissions');

    fireEvent.click(screen.getByRole('button', { name: /Vincular Produto/i }));
    expect(onOpenLinkModal).toHaveBeenCalledTimes(1);
  });
});
