import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createElement } from 'react';
import { useNavigation } from './useNavigation';

vi.mock('../constants', () => ({
  NAV_LINKS: [
    {
      label: 'Clientes',
      children: [{ path: '/clientes', label: 'Lista' }],
    },
    {
      label: 'Financeiro',
      children: [{ path: '/financeiro', label: 'Dashboard' }],
    },
  ],
}));

const wrapper =
  (initialPath: string) =>
  ({ children }: { children: ReactNode }) =>
    createElement(MemoryRouter, { initialEntries: [initialPath] }, children);

describe('useNavigation', () => {
  it('openParent is null when path does not match any nav child', () => {
    // Given — rota que não bate em nenhum filho
    const { result } = renderHook(() => useNavigation(), {
      wrapper: wrapper('/dashboard'),
    });

    // Then — nenhum parent aberto
    expect(result.current.openParent).toBeNull();
  });

  it('openParent matches active route parent', () => {
    // Given — rota que bate no parent "Clientes"
    const { result } = renderHook(() => useNavigation(), {
      wrapper: wrapper('/clientes'),
    });

    // Then — parent "Clientes" está aberto
    expect(result.current.openParent).toBe('Clientes');
  });

  it('toggleParent opens a closed parent', () => {
    // Given — rota sem match (nenhum parent aberto)
    const { result } = renderHook(() => useNavigation(), {
      wrapper: wrapper('/dashboard'),
    });

    // When — toggle chamado no parent Financeiro
    act(() => {
      result.current.toggleParent('Financeiro');
    });

    // Then — Financeiro fica aberto
    expect(result.current.openParent).toBe('Financeiro');
  });

  it('toggleParent closes the already-open parent', () => {
    // Given — rota já com parent "Clientes" aberto
    const { result } = renderHook(() => useNavigation(), {
      wrapper: wrapper('/clientes'),
    });

    // When — toggle chamado no mesmo parent
    act(() => {
      result.current.toggleParent('Clientes');
    });

    // Then — parent é fechado (null)
    expect(result.current.openParent).toBeNull();
  });

  it('toggleParent switches to another parent', () => {
    // Given — rota com parent "Clientes" aberto
    const { result } = renderHook(() => useNavigation(), {
      wrapper: wrapper('/clientes'),
    });

    // When — toggle chamado em outro parent
    act(() => {
      result.current.toggleParent('Financeiro');
    });

    // Then — Financeiro fica aberto; Clientes fecha
    expect(result.current.openParent).toBe('Financeiro');
  });
});
