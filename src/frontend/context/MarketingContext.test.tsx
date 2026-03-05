import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MarketingContext, useMarketingData } from './MarketingContext';
import type { MarketingDataType } from './types';

const createMarketingValue = (): MarketingDataType => ({
  marketingProfessionals: [] as MarketingDataType['marketingProfessionals'],
  marketingActivities: [] as MarketingDataType['marketingActivities'],
  marketingIdeas: [] as MarketingDataType['marketingIdeas'],
  socialNetworks: [] as MarketingDataType['socialNetworks'],
  prospects: [] as MarketingDataType['prospects'],
  setMarketingProfessionals: vi.fn(),
  setMarketingActivities: vi.fn(),
  setMarketingIdeas: vi.fn(),
  setSocialNetworks: vi.fn(),
  setProspects: vi.fn(),
});

describe('MarketingContext', () => {
  it('throws when useMarketingData is used outside provider', () => {
    expect(() => renderHook(() => useMarketingData())).toThrowError(
      'useMarketingData must be used within DataProvider',
    );
  });

  it('returns provider value when available', () => {
    const value = createMarketingValue();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MarketingContext.Provider value={value}>{children}</MarketingContext.Provider>
    );

    const { result } = renderHook(() => useMarketingData(), { wrapper });

    expect(result.current).toBe(value);
  });
});
