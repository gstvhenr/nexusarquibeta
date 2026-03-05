import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAutoReset } from './useAutoReset';

describe('useAutoReset', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns defaultValue on initial render', () => {
    // Given — hook instanciado com valor padrão nulo
    const { result } = renderHook(() => useAutoReset<string | null>(null, 3000));

    // Then — valor inicial deve ser o defaultValue
    expect(result.current[0]).toBeNull();
  });

  it('updates value when setValue is called', () => {
    // Given — hook com defaultValue null
    const { result } = renderHook(() => useAutoReset<string | null>(null, 3000));

    // When — valor é definido
    act(() => {
      result.current[1]('Salvo!');
    });

    // Then — valor atualizado imediatamente
    expect(result.current[0]).toBe('Salvo!');
  });

  it('resets to defaultValue after delayMs', () => {
    // Given — hook com delay de 1000ms
    const { result } = renderHook(() => useAutoReset<string | null>(null, 1000));

    // When — valor é definido
    act(() => {
      result.current[1]('Temporário');
    });

    // Then — ainda visível antes do timeout
    expect(result.current[0]).toBe('Temporário');

    // When — tempo expira
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Then — volta ao defaultValue
    expect(result.current[0]).toBeNull();
  });

  it('restarts timer when setValue is called again before reset', () => {
    // Given — hook com delay de 1000ms
    const { result } = renderHook(() => useAutoReset<string | null>(null, 1000));

    act(() => {
      result.current[1]('Primeiro');
    });

    // When — avança 600ms e chama setValue novamente
    act(() => {
      vi.advanceTimersByTime(600);
      result.current[1]('Segundo');
    });

    // When — avança mais 600ms (total: 1200ms desde o primeiro)
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Then — não resetou ainda porque o timer foi reiniciado
    expect(result.current[0]).toBe('Segundo');

    // When — expira o segundo timer
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Then — agora resetou
    expect(result.current[0]).toBeNull();
  });

  it('does not schedule timer when setValue is called with defaultValue', () => {
    // Given — hook com defaultValue null
    const { result } = renderHook(() => useAutoReset<string | null>(null, 1000));

    // When — define com o próprio defaultValue
    act(() => {
      result.current[1](null);
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Then — continua null sem disparar efeito colateral
    expect(result.current[0]).toBeNull();
  });
});
