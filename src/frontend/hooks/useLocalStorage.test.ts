import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import useLocalStorage from './useLocalStorage';
import { uiPreferenceService } from '../services/infrastructure/uiPreferenceService';

describe('useLocalStorage', () => {
  beforeEach(async () => {
    await uiPreferenceService.removeItem('test_key');
  });

  it('uses initial value when persisted preference is empty', async () => {
    const { result } = renderHook(() => useLocalStorage<string>('test_key', 'initial'));

    await waitFor(() => {
      expect(result.current[0]).toBe('initial');
    });
  });

  it('persists updates to IndexedDB-backed UI preferences', async () => {
    const { result } = renderHook(() => useLocalStorage<string>('test_key', 'initial'));

    await waitFor(() => {
      expect(result.current[0]).toBe('initial');
    });

    act(() => {
      result.current[1]('updated');
    });

    await waitFor(() => {
      expect(result.current[0]).toBe('updated');
    });

    const persistedValue = await uiPreferenceService.getItem('test_key', 'fallback');
    expect(persistedValue).toBe('updated');
  });
});
