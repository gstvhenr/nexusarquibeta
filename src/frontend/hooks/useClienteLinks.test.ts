import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { useClienteLinks } from './useClienteLinks';
import type { Client } from '../types';

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
  externalLinks: [],
  ...overrides,
});

function useLinksWrapper(initialClient: Client) {
  const [client, setClient] = useState<Client | null>(initialClient);
  const links = useClienteLinks({ client, setClient });
  return { client, links };
}

describe('useClienteLinks', () => {
  it('handleAddLink adds a valid link', () => {
    // Given
    const { result } = renderHook(() => useLinksWrapper(createTestClient()));
    act(() => result.current.links.setNewLink({ title: 'GitHub', url: 'https://github.com' }));

    // When
    act(() => result.current.links.handleAddLink());

    // Then
    expect(result.current.client?.externalLinks).toHaveLength(1);
    expect(result.current.client?.externalLinks?.[0].title).toBe('GitHub');
    expect(result.current.client?.externalLinks?.[0].url).toBe('https://github.com');
    // Resets new link after adding
    expect(result.current.links.newLink.title).toBe('');
    expect(result.current.links.newLink.url).toBe('');
  });

  it('handleAddLink rejects invalid URL (alerts user)', () => {
    // Given
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useLinksWrapper(createTestClient()));
    act(() => result.current.links.setNewLink({ title: 'Bad', url: 'not-a-url' }));

    // When
    act(() => result.current.links.handleAddLink());

    // Then
    expect(result.current.client?.externalLinks).toHaveLength(0);
    expect(alertSpy).toHaveBeenCalledOnce();
    alertSpy.mockRestore();
  });

  it('handleAddLink does nothing when title is empty', () => {
    // Given
    const { result } = renderHook(() => useLinksWrapper(createTestClient()));
    act(() => result.current.links.setNewLink({ title: '', url: 'https://github.com' }));

    // When
    act(() => result.current.links.handleAddLink());

    // Then
    expect(result.current.client?.externalLinks).toHaveLength(0);
  });

  it('handleRemoveLink removes link by id', () => {
    // Given
    const client = createTestClient({
      externalLinks: [
        { id: 'link-1', title: 'Site', url: 'https://site.com' },
        { id: 'link-2', title: 'Blog', url: 'https://blog.com' },
      ],
    });
    const { result } = renderHook(() => useLinksWrapper(client));

    // When
    act(() => result.current.links.handleRemoveLink('link-1'));

    // Then
    expect(result.current.client?.externalLinks).toHaveLength(1);
    expect(result.current.client?.externalLinks?.[0].id).toBe('link-2');
  });
});
