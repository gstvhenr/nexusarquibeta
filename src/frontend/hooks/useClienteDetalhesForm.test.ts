import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Client } from '../types';
import { useClienteDetalhesForm } from './useClienteDetalhesForm';

vi.mock('../services/clientService', () => ({
  saveClientAndUpdateState: vi.fn(),
}));

import { saveClientAndUpdateState } from '../services/clientService';

const makeClient = (overrides: Partial<Client> = {}): Client => ({
  id: 'c1',
  name: 'Cliente',
  cpfCnpj: '',
  clientType: 'PF',
  birthDate: '',
  representative: { name: '', relationship: '', role: '' },
  contacts: [{ id: 'ct1', phone: '11999999999', hasWhatsApp: false, isPrimary: true }],
  email: '',
  status: 'Potencial Cliente',
  leadSource: 'Não informado',
  serviceInterests: [],
  address: { street: 'Rua A', number: '1', neighborhood: 'Bairro', city: 'SP', state: 'SP', zip: '01000-000', complement: '' },
  isFavorite: false,
  isUrgent: false,
  registrationDate: new Date().toISOString(),
  lastContactDate: new Date().toISOString(),
  pipelineStatus: 'Novo',
  meetings: [],
  behavioralProfile: { notes: '' },
  archived: false,
  ...overrides,
});

const defaultArgs = (overrides = {}) => ({
  client: makeClient(),
  setClient: vi.fn(),
  originalClient: makeClient(),
  clients: [makeClient()] as Client[],
  setClients: vi.fn(),
  isEditing: true,
  setIsEditing: vi.fn(),
  setShowSaveSuccess: vi.fn(),
  ...overrides,
});

describe('useClienteDetalhesForm', () => {
  it('handleChange updates a client field', () => {
    // Given — hook com client e setClient mock
    const args = defaultArgs();
    const { result } = renderHook(() => useClienteDetalhesForm(args));

    // When — altera o campo name
    act(() => {
      result.current.handleChange('name', 'Novo Nome');
    });

    // Then — setClient chamado com updater que altera name
    const updater = args.setClient.mock.calls[0][0];
    expect(updater(makeClient()).name).toBe('Novo Nome');
  });

  it('handleAddressChange updates address field', () => {
    // Given — hook com endereço padrão
    const args = defaultArgs();
    const { result } = renderHook(() => useClienteDetalhesForm(args));

    act(() => {
      result.current.handleAddressChange('city', 'Rio de Janeiro');
    });

    const updater = args.setClient.mock.calls[0][0];
    const updated = updater(makeClient());

    // Then — cidade atualizada
    expect(updated.address.city).toBe('Rio de Janeiro');
  });

  it('handleRepChange updates representative field', () => {
    // Given — representante com nome vazio
    const args = defaultArgs();
    const { result } = renderHook(() => useClienteDetalhesForm(args));

    act(() => {
      result.current.handleRepChange('name', 'Dr. Silva');
    });

    const updater = args.setClient.mock.calls[0][0];
    const updated = updater(makeClient());

    // Then — nome do representante atualizado
    expect(updated.representative?.name).toBe('Dr. Silva');
  });

  it('handleAddContact does not add when contacts.length >= 3', () => {
    // Given — cliente com 3 contatos
    const client = makeClient({
      contacts: [
        { id: 'ct1', phone: '11111', hasWhatsApp: false, isPrimary: true },
        { id: 'ct2', phone: '22222', hasWhatsApp: false, isPrimary: false },
        { id: 'ct3', phone: '33333', hasWhatsApp: false, isPrimary: false },
      ],
    });
    const args = defaultArgs({ client });
    const { result } = renderHook(() => useClienteDetalhesForm(args));

    // When — tenta adicionar contato extra
    act(() => {
      result.current.handleAddContact();
    });

    // Then — setClient não chamado
    expect(args.setClient).not.toHaveBeenCalled();
  });

  it('handleRemoveContact removes contact and reassigns primary when needed', () => {
    // Given — dois contatos; o primário será removido
    const client = makeClient({
      contacts: [
        { id: 'ct1', phone: '11111', hasWhatsApp: false, isPrimary: true },
        { id: 'ct2', phone: '22222', hasWhatsApp: false, isPrimary: false },
      ],
    });
    const args = defaultArgs({ client });
    const { result } = renderHook(() => useClienteDetalhesForm(args));

    act(() => {
      result.current.handleRemoveContact('ct1');
    });

    // Then — ct2 vira primário
    const updater = args.setClient.mock.calls[0][0];
    const updated = updater(client);
    expect(updated.contacts).toHaveLength(1);
    expect(updated.contacts[0].isPrimary).toBe(true);
  });

  it('handleServiceInterestChange adds interest when checked=true', () => {
    // Given — cliente sem interesses
    const args = defaultArgs();
    const { result } = renderHook(() => useClienteDetalhesForm(args));

    act(() => {
      result.current.handleServiceInterestChange('Reforma', true);
    });

    // Then — setClient chamado (interesse adicionado via handleChange)
    expect(args.setClient).toHaveBeenCalled();
  });

  it('handleSave calls setClients and setIsEditing on success', () => {
    // Given — saveClientAndUpdateState retorna sucesso
    const updated = makeClient({ name: 'Atualizado' });
    vi.mocked(saveClientAndUpdateState).mockReturnValue({ updatedClients: [updated] });
    const args = defaultArgs();
    const { result } = renderHook(() => useClienteDetalhesForm(args));

    act(() => {
      result.current.handleSave();
    });

    // Then — lista atualizada e modo edição encerrado
    expect(args.setClients).toHaveBeenCalledWith([updated]);
    expect(args.setIsEditing).toHaveBeenCalledWith(false);
    expect(args.setShowSaveSuccess).toHaveBeenCalledWith(true);
  });

  it('handleCancel restores originalClient and exits editing', () => {
    // Given — cliente editado diferente do original
    const original = makeClient({ name: 'Original' });
    const args = defaultArgs({ originalClient: original });
    const { result } = renderHook(() => useClienteDetalhesForm(args));

    act(() => {
      result.current.handleCancel();
    });

    // Then — setClient recebe clone do original e editing encerrado
    const updater = args.setClient.mock.calls[0][0];
    expect(updater).toEqual(expect.objectContaining({ name: 'Original' }));
    expect(args.setIsEditing).toHaveBeenCalledWith(false);
  });

  it('getModifiedClass returns modified class when value differs', () => {
    // Given — isEditing=true e originalClient existente
    const args = defaultArgs({ isEditing: true });
    const { result } = renderHook(() => useClienteDetalhesForm(args));

    // When — valor atual diferente do original
    const cls = result.current.getModifiedClass('Novo', 'Original');

    // Then — classe de modificação retornada
    expect(cls).toContain('yellow');
  });

  it('getModifiedClass returns default class when value is equal', () => {
    // Given — mesmo valor
    const args = defaultArgs({ isEditing: true });
    const { result } = renderHook(() => useClienteDetalhesForm(args));

    const cls = result.current.getModifiedClass('Igual', 'Igual');

    // Then — classe padrão
    expect(cls).toBe('border-border-color');
  });
});
