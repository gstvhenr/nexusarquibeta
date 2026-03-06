import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useLocalStorage from './useLocalStorage';

vi.mock('../services/infrastructure/uiPreferenceService', () => ({
  uiPreferenceService: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

import { uiPreferenceService } from '../services/infrastructure/uiPreferenceService';

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns initialValue before hydration completes', () => {
    // Given — getItem nunca resolve (promise pendente)
    vi.mocked(uiPreferenceService.getItem).mockReturnValue(new Promise(() => {}));
    vi.mocked(uiPreferenceService.setItem).mockResolvedValue(undefined);

    // When — hook monta
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    // Then — initial value enquanto ainda não hidratou
    expect(result.current[0]).toBe('default');
  });

  it('updates storedValue after successful hydration', async () => {
    // Given — getItem retorna valor persistido
    vi.mocked(uiPreferenceService.getItem).mockResolvedValue('persistido');
    vi.mocked(uiPreferenceService.setItem).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    // When — aguarda resolução da promessa
    await act(async () => {
      await Promise.resolve();
    });

    // Then — valor hidratado a partir do storage
    expect(result.current[0]).toBe('persistido');
  });

  it('falls back to initialValue on getItem error', async () => {
    // Given — getItem lança erro
    vi.mocked(uiPreferenceService.getItem).mockRejectedValue(new Error('storage error'));
    vi.mocked(uiPreferenceService.setItem).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

    await act(async () => {
      await Promise.resolve();
    });

    // Then — usa initialValue como fallback
    expect(result.current[0]).toBe('fallback');
  });

  it('allows manual setValue before hydration', () => {
    // Given — getItem ainda pendente
    vi.mocked(uiPreferenceService.getItem).mockReturnValue(new Promise(() => {}));
    vi.mocked(uiPreferenceService.setItem).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLocalStorage('test-key', 'original'));

    // When — valor é definido manualmente antes de hidratar
    act(() => {
      result.current[1]('manual');
    });

    // Then — valor reflete a atualização manual
    expect(result.current[0]).toBe('manual');
  });

  it('persists value via setItem after hydration', async () => {
    // Given — getItem retorna valor inicial
    vi.mocked(uiPreferenceService.getItem).mockResolvedValue('valor');
    vi.mocked(uiPreferenceService.setItem).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    await act(async () => {
      await Promise.resolve();
    });

    // When — valor é atualizado
    await act(async () => {
      result.current[1]('novo-valor');
      await Promise.resolve();
    });

    // Then — setItem chamado com nova chave e valor
    expect(uiPreferenceService.setItem).toHaveBeenCalledWith('test-key', 'novo-valor');
  });
});
