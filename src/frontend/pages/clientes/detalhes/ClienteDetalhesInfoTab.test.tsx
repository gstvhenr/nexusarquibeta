import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SERVICE_INTEREST_OPTIONS } from '@/constants';
import type { Client } from '@/types';
import { ClienteDetalhesInfoTab } from './ClienteDetalhesInfoTab';

vi.mock('@/components/clientes/AvatarPicker', () => ({
  AvatarPicker: () => <div data-testid="avatar-picker" />,
}));

const client: Client = {
  id: 'client-1',
  name: 'Empresa Teste',
  clientType: 'PJ',
  cpfCnpj: '12.345.678/0001-90',
  representative: { name: 'Representante', relationship: 'Sócio' },
  contacts: [{ id: 'contact-1', phone: '(11) 99999-0000', hasWhatsApp: true, isPrimary: true }],
  status: 'Cliente Ativo',
  leadSource: 'Instagram',
  serviceInterests: [],
  address: {
    street: 'Rua A',
    number: '10',
    complement: 'Sala 2',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zip: '01000-000',
  },
  isFavorite: false,
  registrationDate: '2026-01-01',
  lastContactDate: '2026-01-02',
  pipelineStatus: 'Contato Inicial',
  meetings: [],
  behavioralProfile: { notes: '' },
  archived: false,
};

describe('ClienteDetalhesInfoTab', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders PJ-specific fields and dispatches add contact action', () => {
    const handleAddContact = vi.fn();

    render(
      <ClienteDetalhesInfoTab
        activeTab="info"
        client={client}
        isPJ={true}
        isEditing={true}
        originalClient={client}
        dropdownRef={{ current: null }}
        isInterestsDropdownOpen={false}
        setInterestsDropdownOpen={vi.fn()}
        handleChange={vi.fn()}
        handleAddressChange={vi.fn()}
        handleRepChange={vi.fn()}
        handleContactChange={vi.fn()}
        handleAddContact={handleAddContact}
        handleRemoveContact={vi.fn()}
        handleServiceInterestChange={vi.fn()}
        getModifiedClass={() => ''}
      />,
    );

    expect(screen.getByText('Razão Social')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome do representante')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Telefone/i }));
    expect(handleAddContact).toHaveBeenCalledTimes(1);
  });

  it('formats CEP and dispatches service-interest selection changes', () => {
    const handleAddressChange = vi.fn();
    const handleServiceInterestChange = vi.fn();
    const firstInterest = SERVICE_INTEREST_OPTIONS[0];

    render(
      <ClienteDetalhesInfoTab
        activeTab="info"
        client={client}
        isPJ={true}
        isEditing={true}
        originalClient={client}
        dropdownRef={{ current: null }}
        isInterestsDropdownOpen={true}
        setInterestsDropdownOpen={vi.fn()}
        handleChange={vi.fn()}
        handleAddressChange={handleAddressChange}
        handleRepChange={vi.fn()}
        handleContactChange={vi.fn()}
        handleAddContact={vi.fn()}
        handleRemoveContact={vi.fn()}
        handleServiceInterestChange={handleServiceInterestChange}
        getModifiedClass={() => ''}
      />,
    );

    fireEvent.change(screen.getByLabelText('CEP'), { target: { value: '13000000' } });
    expect(handleAddressChange).toHaveBeenCalledWith('zip', '13000-000');

    fireEvent.click(screen.getByRole('checkbox', { name: firstInterest }));
    expect(handleServiceInterestChange).toHaveBeenCalledWith(firstInterest, true);
  });
});
