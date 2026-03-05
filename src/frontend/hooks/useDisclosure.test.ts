import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDisclosure } from './useDisclosure';

describe('useDisclosure', () => {
  it('starts closed by default', () => {
    // Given — hook sem estado inicial
    const { result } = renderHook(() => useDisclosure());

    // Then — disclosure começa fechado
    expect(result.current.isOpen).toBe(false);
  });

  it('starts open when initialState is true', () => {
    // Given — hook com estado inicial aberto
    const { result } = renderHook(() => useDisclosure(true));

    // Then — disclosure começa aberto
    expect(result.current.isOpen).toBe(true);
  });

  it('open() sets isOpen to true', () => {
    // Given — disclosure fechado
    const { result } = renderHook(() => useDisclosure(false));

    // When — open é chamado
    act(() => {
      result.current.open();
    });

    // Then — disclosure abre
    expect(result.current.isOpen).toBe(true);
  });

  it('close() sets isOpen to false', () => {
    // Given — disclosure aberto
    const { result } = renderHook(() => useDisclosure(true));

    // When — close é chamado
    act(() => {
      result.current.close();
    });

    // Then — disclosure fecha
    expect(result.current.isOpen).toBe(false);
  });

  it('toggle() inverts state from false to true', () => {
    // Given — disclosure fechado
    const { result } = renderHook(() => useDisclosure(false));

    // When — toggle é chamado
    act(() => {
      result.current.toggle();
    });

    // Then — disclosure abre
    expect(result.current.isOpen).toBe(true);
  });

  it('toggle() inverts state from true to false', () => {
    // Given — disclosure aberto
    const { result } = renderHook(() => useDisclosure(true));

    // When — toggle é chamado
    act(() => {
      result.current.toggle();
    });

    // Then — disclosure fecha
    expect(result.current.isOpen).toBe(false);
  });

  it('toggle() called twice returns to original state', () => {
    // Given — disclosure fechado
    const { result } = renderHook(() => useDisclosure(false));

    // When — toggle é chamado duas vezes
    act(() => {
      result.current.toggle();
      result.current.toggle();
    });

    // Then — volta ao estado original
    expect(result.current.isOpen).toBe(false);
  });

  it('open() is idempotent when already open', () => {
    // Given — disclosure já aberto
    const { result } = renderHook(() => useDisclosure(true));

    // When — open é chamado novamente
    act(() => {
      result.current.open();
    });

    // Then — permanece aberto sem erros
    expect(result.current.isOpen).toBe(true);
  });
});
