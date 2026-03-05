import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Supplier } from '../../types';
import { SuppliersSidebar } from './SuppliersSidebar';

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

describe('SuppliersSidebar', () => {
  it('updates filter value through callback', () => {
    const onFilterChange = vi.fn();

    render(
      <SuppliersSidebar
        filter=""
        onFilterChange={onFilterChange}
        filteredSuppliers={[]}
        selectedSupplierId={null}
        onSelectSupplier={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Buscar fornecedor'), {
      target: { value: 'marmo' },
    });

    expect(onFilterChange).toHaveBeenCalledWith('marmo');
  });

  it('renders supplier info with initials fallback and extra category badge', () => {
    render(
      <SuppliersSidebar
        filter=""
        onFilterChange={vi.fn()}
        filteredSuppliers={[
          makeSupplier({
            id: 'sup-1',
            name: 'Fornecedor Alpha',
            categories: ['Marmoraria', 'Iluminação'],
          }),
        ]}
        selectedSupplierId={null}
        onSelectSupplier={vi.fn()}
      />,
    );

    expect(screen.getByText('Fornecedor Alpha')).toBeInTheDocument();
    expect(screen.getByText('Marmoraria')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getByText('FA')).toBeInTheDocument();
  });

  it('renders logo image when supplier has logo', () => {
    render(
      <SuppliersSidebar
        filter=""
        onFilterChange={vi.fn()}
        filteredSuppliers={[
          makeSupplier({
            id: 'sup-1',
            name: 'Fornecedor Com Logo',
            logo: 'data:image/png;base64,abc',
          }),
        ]}
        selectedSupplierId={null}
        onSelectSupplier={vi.fn()}
      />,
    );

    expect(screen.getByRole('img', { name: 'Fornecedor Com Logo' })).toBeInTheDocument();
  });

  it('selects supplier on click and keyboard interaction', () => {
    const onSelectSupplier = vi.fn();

    render(
      <SuppliersSidebar
        filter=""
        onFilterChange={vi.fn()}
        filteredSuppliers={[makeSupplier({ id: 'sup-1', name: 'Fornecedor Clicavel' })]}
        selectedSupplierId={null}
        onSelectSupplier={onSelectSupplier}
      />,
    );

    const supplierButton = screen.getByText('Fornecedor Clicavel').closest('[role="button"]');
    expect(supplierButton).not.toBeNull();

    fireEvent.click(supplierButton!);
    fireEvent.keyDown(supplierButton!, { key: 'Enter' });
    fireEvent.keyDown(supplierButton!, { key: ' ' });

    expect(onSelectSupplier).toHaveBeenCalledTimes(3);
    expect(onSelectSupplier).toHaveBeenNthCalledWith(1, 'sup-1');
    expect(onSelectSupplier).toHaveBeenNthCalledWith(2, 'sup-1');
    expect(onSelectSupplier).toHaveBeenNthCalledWith(3, 'sup-1');
  });

  it('renders empty state when supplier list is empty', () => {
    render(
      <SuppliersSidebar
        filter="nada"
        onFilterChange={vi.fn()}
        filteredSuppliers={[]}
        selectedSupplierId={null}
        onSelectSupplier={vi.fn()}
      />,
    );

    expect(screen.getByText('Nenhum fornecedor encontrado.')).toBeInTheDocument();
  });
});
