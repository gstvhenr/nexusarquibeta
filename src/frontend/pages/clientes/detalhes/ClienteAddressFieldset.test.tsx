import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Client } from '@/types';
import { ClienteAddressFieldset } from './ClienteAddressFieldset';

const client: Client = {
  id: 'client-1',
  name: 'Cliente Teste',
  contacts: [{ id: 'contact-1', phone: '(11) 99999-0000', hasWhatsApp: true, isPrimary: true }],
  status: 'Cliente Ativo',
  serviceInterests: [],
  address: {
    street: 'Rua A',
    number: '10',
    complement: 'Apto 1',
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

describe('ClienteAddressFieldset', () => {
  afterEach(() => {
    cleanup();
  });

  it('formats CEP before dispatching address update', () => {
    const handleAddressChange = vi.fn();

    render(
      <ClienteAddressFieldset
        client={client}
        originalClient={client}
        isEditing={true}
        handleAddressChange={handleAddressChange}
        getModifiedClass={() => ''}
      />,
    );

    fireEvent.change(screen.getByLabelText('CEP'), { target: { value: '13000000' } });

    expect(handleAddressChange).toHaveBeenCalledWith('zip', '13000-000');
  });

  it('keeps state input always disabled and blocks edits when not editing', () => {
    const handleAddressChange = vi.fn();

    render(
      <ClienteAddressFieldset
        client={client}
        originalClient={client}
        isEditing={false}
        handleAddressChange={handleAddressChange}
        getModifiedClass={() => ''}
      />,
    );

    expect(screen.getByLabelText('Estado')).toBeDisabled();
    expect(screen.getByLabelText('Cidade')).toBeDisabled();
  });
});
