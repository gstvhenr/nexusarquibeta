import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CoreContext, useCoreData } from './CoreContext';
import type { CoreDataType } from './types';

const createCoreValue = (): CoreDataType => ({
  projects: [] as CoreDataType['projects'],
  proposals: [] as CoreDataType['proposals'],
  clients: [] as CoreDataType['clients'],
  setProjects: vi.fn(),
  setProposals: vi.fn(),
  setClients: vi.fn(),
});

describe('CoreContext', () => {
  it('throws when useCoreData is used outside provider', () => {
    expect(() => renderHook(() => useCoreData())).toThrowError(
      'useCoreData must be used within DataProvider',
    );
  });

  it('returns provider value when available', () => {
    const value = createCoreValue();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CoreContext.Provider value={value}>{children}</CoreContext.Provider>
    );

    const { result } = renderHook(() => useCoreData(), { wrapper });

    expect(result.current).toBe(value);
  });
});
