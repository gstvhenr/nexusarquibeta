import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDisclosure } from './useDisclosure';

describe('useDisclosure', () => {
  it('starts closed by default', () => {
    // Given / When
    const { result } = renderHook(() => useDisclosure());

    // Then
    expect(result.current.isOpen).toBe(false);
  });

  it('starts open when initialState is true', () => {
    // Given / When
    const { result } = renderHook(() => useDisclosure(true));

    // Then
    expect(result.current.isOpen).toBe(true);
  });

  it('open() sets isOpen to true', () => {
    // Given
    const { result } = renderHook(() => useDisclosure());

    // When
    act(() => result.current.open());

    // Then
    expect(result.current.isOpen).toBe(true);
  });

  it('close() sets isOpen to false', () => {
    // Given
    const { result } = renderHook(() => useDisclosure(true));

    // When
    act(() => result.current.close());

    // Then
    expect(result.current.isOpen).toBe(false);
  });

  it('toggle() flips the state', () => {
    // Given
    const { result } = renderHook(() => useDisclosure());

    // When / Then — toggle open
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);

    // When / Then — toggle closed
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it('open/close/toggle maintain stable references', () => {
    // Given
    const { result, rerender } = renderHook(() => useDisclosure());
    const firstOpen = result.current.open;
    const firstClose = result.current.close;
    const firstToggle = result.current.toggle;

    // When
    rerender();

    // Then — useCallback guarantees referential stability
    expect(result.current.open).toBe(firstOpen);
    expect(result.current.close).toBe(firstClose);
    expect(result.current.toggle).toBe(firstToggle);
  });

  it('calling open() when already open is a no-op', () => {
    // Given
    const { result } = renderHook(() => useDisclosure(true));

    // When
    act(() => result.current.open());

    // Then
    expect(result.current.isOpen).toBe(true);
  });

  it('calling close() when already closed is a no-op', () => {
    // Given
    const { result } = renderHook(() => useDisclosure());

    // When
    act(() => result.current.close());

    // Then
    expect(result.current.isOpen).toBe(false);
  });
});
