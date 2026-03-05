import { renderHook } from '@testing-library/react';
import { useContext, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DataHistoryContext } from './DataHistoryContext';
import type { DataHistoryContextType } from './types';

const createHistoryValue = (): DataHistoryContextType => ({
  undo: vi.fn(),
  redo: vi.fn(),
  clearHistory: vi.fn(),
  canUndo: true,
  canRedo: false,
});

describe('DataHistoryContext', () => {
  it('starts undefined outside a provider', () => {
    const { result } = renderHook(() => useContext(DataHistoryContext));

    expect(result.current).toBeUndefined();
  });

  it('returns provided value to descendants', () => {
    const value = createHistoryValue();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DataHistoryContext.Provider value={value}>{children}</DataHistoryContext.Provider>
    );

    const { result } = renderHook(() => useContext(DataHistoryContext), { wrapper });

    expect(result.current).toBe(value);
  });

  it('uses a stable display name for debugging', () => {
    expect(DataHistoryContext.displayName).toBe('DataHistoryContext');
  });
});
