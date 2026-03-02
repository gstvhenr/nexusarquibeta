import { createContext, useContext } from 'react';
import type { MarketingDataType } from './types';

export const MarketingContext = createContext<MarketingDataType | undefined>(undefined);
MarketingContext.displayName = 'MarketingDataContext';

/** Marketing domain: professionals, activities, ideas, social networks, prospects. */
export const useMarketingData = (): MarketingDataType => {
  const ctx = useContext(MarketingContext);
  if (!ctx) throw new Error('useMarketingData must be used within DataProvider');
  return ctx;
};
