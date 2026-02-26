import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { useClienteDetalhesForm } from './useClienteDetalhesForm';
import type { Client } from '../types';

vi.mock('../services/clientService', () => ({
  saveClientAndUpdateState: vi.fn(
    (client: Client, _original: Client | null, clients: Client[]) => ({
      updatedClients: clients.map((c) => (c.id === client.id ? client : c)),
      error: null,
    }),
  ),
}));

const createTestClient = (overrides: Partial<Client> = {}): Client => ({
  id: 'client-1',
  name: 'Cliente Teste',
  status: 'Cliente Ativo',
  contacts: [],
  email: 'test@test.com',
  serviceInterests: [],
  address: {
    street: 'Rua A',
    number: '100',
    neighborhood: 'Centro',
    city: 'SP',
    state: 'SP',
    zip: '01000-000',
  },
  isFavorite: false,
  registrationDate: '2026-01-01',
  lastContactDate: '2026-01-15',
  pipelineStatus: 'Novo',
  meetings: [],
  behavioralProfile: { notes: '' },
  archived: false,
  ...overrides,
});

function useFormWrapper(initialClient: Client) {
  const [client, setClient] = useState<Client | null>(initialClient);
  const [isEditing, setIsEditing] = useState(true);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const form = useClienteDetalhesForm({
    client,
    setClient,
    originalClient: initialClient,
    clients: [initialClient],
    setClients: vi.fn(),
    isEditing,
    setIsEditing,
    setShowSaveSuccess,
  });
  return { client, form, isEditing, showSaveSuccess };
}

describe('useClienteDetalhesForm', () => {
  it('handleChange updates a simple field', () => {
    // Given
    const { result } = renderHook(() => useFormWrapper(createTestClient()));

    // When
    act(() => result.current.form.handleChange('name', 'Novo Nome'));

    // Then
    expect(result.current.client?.name).toBe('Novo Nome');
  });

  it('handleAddressChange updates an address field', () => {
    // Given
    const { result } = renderHook(() => useFormWrapper(createTestClient()));

    // When
    act(() => result.current.form.handleAddressChange('city', 'Rio de Janeiro'));

    // Then
    expect(result.current.client?.address.city).toBe('Rio de Janeiro');
  });

  it('handleAddContact adds a contact (max 3)', () => {
    // Given
    const { result } = renderHook(() => useFormWrapper(createTestClient()));

    // When
    act(() => result.current.form.handleAddContact());

    // Then
    expect(result.current.client?.contacts).toHaveLength(1);
    expect(result.current.client?.contacts[0].isPrimary).toBe(true);
  });

  it('handleAddContact does not exceed 3 contacts', () => {
    // Given
    const client = createTestClient({
      contacts: [
        { id: 'c1', phone: '1', hasWhatsApp: false, isPrimary: true },
        { id: 'c2', phone: '2', hasWhatsApp: false, isPrimary: false },
        { id: 'c3', phone: '3', hasWhatsApp: false, isPrimary: false },
      ],
    });
    const { result } = renderHook(() => useFormWrapper(client));

    // When
    act(() => result.current.form.handleAddContact());

    // Then
    expect(result.current.client?.contacts).toHaveLength(3);
  });

  it('handleRemoveContact assigns isPrimary to first remaining', () => {
    // Given
    const client = createTestClient({
      contacts: [
        { id: 'c1', phone: '1', hasWhatsApp: false, isPrimary: true },
        { id: 'c2', phone: '2', hasWhatsApp: false, isPrimary: false },
      ],
    });
    const { result } = renderHook(() => useFormWrapper(client));

    // When
    act(() => result.current.form.handleRemoveContact('c1'));

    // Then
    expect(result.current.client?.contacts).toHaveLength(1);
    expect(result.current.client?.contacts[0].isPrimary).toBe(true);
  });

  it('handleCancel restores original client state', () => {
    // Given
    const original = createTestClient({ name: 'Original' });
    const { result } = renderHook(() => useFormWrapper(original));

    // When — modify then cancel
    act(() => result.current.form.handleChange('name', 'Modificado'));
    act(() => result.current.form.handleCancel());

    // Then
    expect(result.current.client?.name).toBe('Original');
    expect(result.current.isEditing).toBe(false);
  });

  it('getModifiedClass returns yellow border for changed field', () => {
    // Given
    const { result } = renderHook(() => useFormWrapper(createTestClient()));

    // When
    const unchangedClass = result.current.form.getModifiedClass('test@test.com', 'test@test.com');
    const changedClass = result.current.form.getModifiedClass('new@test.com', 'test@test.com');

    // Then
    expect(unchangedClass).toBe('border-border-color');
    expect(changedClass).toContain('border-yellow-500');
  });
});
