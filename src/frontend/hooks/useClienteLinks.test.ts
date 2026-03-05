import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Client } from '../types';
import { useClienteLinks } from './useClienteLinks';

const makeClient = (overrides: Partial<Client> = {}): Client => ({
  id: 'c1',
  name: 'Cliente Teste',
  cpfCnpj: '',
  clientType: 'PF',
  birthDate: '',
  representative: { name: '', relationship: '', role: '' },
  contacts: [],
  email: '',
  status: 'Potencial Cliente',
  leadSource: 'Não informado',
  serviceInterests: [],
  address: { street: '', number: '', neighborhood: '', city: '', state: 'SP', zip: '', complement: '' },
  isFavorite: false,
  isUrgent: false,
  registrationDate: new Date().toISOString(),
  lastContactDate: new Date().toISOString(),
  pipelineStatus: 'Novo',
  meetings: [],
  behavioralProfile: { notes: '' },
  archived: false,
  externalLinks: [],
  ...overrides,
});

describe('useClienteLinks', () => {
  it('newLink starts empty', () => {
    // Given — hook com cliente sem links
    const client = makeClient();
    const setClient = vi.fn();
    const { result } = renderHook(() => useClienteLinks({ client, setClient }));

    // Then — campos vazios inicialmente
    expect(result.current.newLink).toEqual({ title: '', url: '' });
  });

  it('handleAddLink does nothing when title is empty', () => {
    // Given — link sem título
    const setClient = vi.fn();
    const { result } = renderHook(() =>
      useClienteLinks({ client: makeClient(), setClient }),
    );

    act(() => {
      result.current.setNewLink({ title: '', url: 'https://example.com' });
    });

    // When — tenta adicionar link inválido
    act(() => {
      result.current.handleAddLink();
    });

    // Then — não chama setClient
    expect(setClient).not.toHaveBeenCalled();
  });

  it('handleAddLink does nothing when url is empty', () => {
    // Given — link sem URL
    const setClient = vi.fn();
    const { result } = renderHook(() =>
      useClienteLinks({ client: makeClient(), setClient }),
    );

    act(() => {
      result.current.setNewLink({ title: 'Título', url: '' });
    });

    act(() => {
      result.current.handleAddLink();
    });

    // Then — não chama setClient
    expect(setClient).not.toHaveBeenCalled();
  });

  it('handleAddLink adds link with valid data', () => {
    // Given — link com título e URL válidos
    const setClient = vi.fn();
    const client = makeClient();
    const { result } = renderHook(() => useClienteLinks({ client, setClient }));

    act(() => {
      result.current.setNewLink({ title: 'Site', url: 'https://example.com' });
    });

    act(() => {
      result.current.handleAddLink();
    });

    // Then — setClient chamado com updater que adiciona o link
    expect(setClient).toHaveBeenCalled();
    const updater = setClient.mock.calls[0][0];
    const updated = updater(client);
    expect(updated.externalLinks).toHaveLength(1);
    expect(updated.externalLinks[0].url).toBe('https://example.com');
  });

  it('handleAddLink resets newLink after adding', () => {
    // Given — link válido
    const setClient = vi.fn();
    const client = makeClient();
    const { result } = renderHook(() => useClienteLinks({ client, setClient }));

    act(() => {
      result.current.setNewLink({ title: 'Site', url: 'https://example.com' });
    });

    act(() => {
      result.current.handleAddLink();
    });

    // Then — campos resetados
    expect(result.current.newLink).toEqual({ title: '', url: '' });
  });

  it('handleRemoveLink removes link by id', () => {
    // Given — cliente com um link
    const setClient = vi.fn();
    const client = makeClient({
      externalLinks: [{ id: 'link-1', title: 'GitHub', url: 'https://github.com' }],
    });
    const { result } = renderHook(() => useClienteLinks({ client, setClient }));

    // When — remove o link
    act(() => {
      result.current.handleRemoveLink('link-1');
    });

    // Then — updater retira o link
    const updater = setClient.mock.calls[0][0];
    const updated = updater(client);
    expect(updated.externalLinks).toHaveLength(0);
  });
});
