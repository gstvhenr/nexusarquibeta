import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Supplier } from '../../types';
import SupplierFormBody from './SupplierFormBody';

const makeSupplier = (overrides: Partial<Supplier> = {}): Supplier => ({
  id: 'sup-1',
  name: 'Fornecedor Base',
  logo: '',
  categories: ['Marcenaria'],
  cnpj: '12.345.678/0001-90',
  address: 'Rua Central, 100',
  site: 'https://fornecedor.example.com',
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
  notes: 'Observações iniciais',
  archived: false,
  ...overrides,
});

describe('SupplierFormBody', () => {
  it('triggers onClickLogo with mouse click and keyboard', () => {
    const onClickLogo = vi.fn();

    render(
      <SupplierFormBody
        supplier={makeSupplier()}
        logoPreview={null}
        onClickLogo={onClickLogo}
        onFieldChange={vi.fn()}
        onContactChange={vi.fn()}
        onCategoryChange={vi.fn()}
      />,
    );

    const logoButton = screen.getByText('Upload Logo').closest('[role="button"]');
    expect(logoButton).not.toBeNull();

    fireEvent.click(logoButton!);
    fireEvent.keyDown(logoButton!, { key: 'Enter' });
    fireEvent.keyDown(logoButton!, { key: ' ' });

    expect(onClickLogo).toHaveBeenCalledTimes(3);
  });

  it('renders logo preview when provided', () => {
    render(
      <SupplierFormBody
        supplier={makeSupplier()}
        logoPreview="data:image/png;base64,preview"
        onClickLogo={vi.fn()}
        onFieldChange={vi.fn()}
        onContactChange={vi.fn()}
        onCategoryChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('img', { name: 'Logo' })).toHaveAttribute(
      'src',
      'data:image/png;base64,preview',
    );
  });

  it('propagates field, contact and category changes', () => {
    const onFieldChange = vi.fn();
    const onContactChange = vi.fn();
    const onCategoryChange = vi.fn();

    render(
      <SupplierFormBody
        supplier={makeSupplier()}
        logoPreview={null}
        onClickLogo={vi.fn()}
        onFieldChange={onFieldChange}
        onContactChange={onContactChange}
        onCategoryChange={onCategoryChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Ex: Marmoraria Pedra Fina'), {
      target: { value: 'Fornecedor Atualizado' },
    });
    fireEvent.change(screen.getByPlaceholderText('00.000.000/0001-00'), {
      target: { value: '11.111.111/0001-11' },
    });
    fireEvent.change(screen.getByPlaceholderText('https://'), {
      target: { value: 'https://novo.example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Rua, Número, Bairro, Cidade - UF'), {
      target: { value: 'Av. Nova, 200' },
    });
    fireEvent.change(screen.getByPlaceholderText('Informações sobre atendimento, prazos, qualidade...'), {
      target: { value: 'Atualizado' },
    });
    fireEvent.change(screen.getByLabelText('Comissão (%)'), { target: { value: '12.5' } });

    fireEvent.change(screen.getByDisplayValue('Contato Base'), {
      target: { value: 'Novo Contato' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /Whats/i }));

    fireEvent.click(screen.getByRole('checkbox', { name: 'Iluminação' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Marcenaria' }));

    expect(onFieldChange).toHaveBeenCalledWith('name', 'Fornecedor Atualizado');
    expect(onFieldChange).toHaveBeenCalledWith('cnpj', '11.111.111/0001-11');
    expect(onFieldChange).toHaveBeenCalledWith('site', 'https://novo.example.com');
    expect(onFieldChange).toHaveBeenCalledWith('address', 'Av. Nova, 200');
    expect(onFieldChange).toHaveBeenCalledWith('notes', 'Atualizado');
    expect(onFieldChange).toHaveBeenCalledWith('commissionPercentage', 12.5);

    expect(onContactChange).toHaveBeenCalledWith('name', 'Novo Contato');
    expect(onContactChange).toHaveBeenCalledWith('hasWhatsApp', false);

    expect(onCategoryChange).toHaveBeenCalledWith('Iluminação', true);
    expect(onCategoryChange).toHaveBeenCalledWith('Marcenaria', false);
  });
});
