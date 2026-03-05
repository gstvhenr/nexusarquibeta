import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Supplier } from '../../types';
import { SupplierContactDetailsTab } from './SupplierContactDetailsTab';

const makeSupplier = (overrides: Partial<Supplier> = {}): Supplier => ({
  id: 'sup-1',
  name: 'Marmoraria Base',
  logo: '',
  categories: ['Marmoraria'],
  cnpj: '12.345.678/0001-90',
  address: 'Rua das Flores, 10',
  site: 'https://fornecedor.example.com',
  mainContact: {
    name: 'Ana Silva',
    role: 'Compradora',
    phone: '(11) 99999-0000',
    email: 'ana@example.com',
    hasWhatsApp: true,
  },
  paymentTerms: '',
  shippingPolicy: '',
  commissionPercentage: 8,
  notes: 'Atendimento prioritário para projetos comerciais.',
  archived: false,
  ...overrides,
});

describe('SupplierContactDetailsTab', () => {
  it('renders contact and company data with links', () => {
    render(<SupplierContactDetailsTab supplier={makeSupplier()} />);

    expect(screen.getByText('Contato Principal')).toBeInTheDocument();
    expect(screen.getByText('Ana Silva')).toBeInTheDocument();
    expect(screen.getByText('(Compradora)')).toBeInTheDocument();
    expect(screen.getByText('(11) 99999-0000')).toBeInTheDocument();

    const mailLink = screen.getByRole('link', { name: 'ana@example.com' });
    expect(mailLink).toHaveAttribute('href', 'mailto:ana@example.com');

    expect(screen.getByText('12.345.678/0001-90')).toBeInTheDocument();
    expect(screen.getByText('Rua das Flores, 10')).toBeInTheDocument();

    const siteLink = screen.getByRole('link', { name: 'https://fornecedor.example.com' });
    expect(siteLink).toHaveAttribute('href', 'https://fornecedor.example.com');
    expect(siteLink).toHaveAttribute('target', '_blank');
    expect(siteLink).toHaveAttribute('rel', 'noreferrer');
  });

  it('renders fallback values for optional fields', () => {
    const supplier = makeSupplier({
      cnpj: '',
      address: '',
      site: '',
      mainContact: {
        name: 'Contato Sem Extras',
        role: '',
        phone: '(11) 98888-1111',
        email: '',
        hasWhatsApp: false,
      },
      notes: '',
    });

    render(<SupplierContactDetailsTab supplier={supplier} />);

    expect(screen.getByText('(Responsável)')).toBeInTheDocument();
    expect(screen.getAllByText('Não informado')).toHaveLength(2);
    expect(screen.getByText('Empresa')).toBeInTheDocument();
    expect(screen.getAllByText('N/A')).toHaveLength(2);
  });

  it('renders internal notes only when present', () => {
    const { rerender } = render(<SupplierContactDetailsTab supplier={makeSupplier()} />);

    expect(screen.getByText('Anotações Internas')).toBeInTheDocument();
    expect(
      screen.getByText('Atendimento prioritário para projetos comerciais.'),
    ).toBeInTheDocument();

    rerender(
      <SupplierContactDetailsTab
        supplier={
          makeSupplier({
            notes: '',
          })
        }
      />,
    );

    expect(screen.queryByText('Anotações Internas')).not.toBeInTheDocument();
  });
});
