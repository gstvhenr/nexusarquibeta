import { createContext, useContext } from 'react';
import type { SupplyChainDataType } from './types';

export const SupplyChainContext = createContext<SupplyChainDataType | undefined>(undefined);
SupplyChainContext.displayName = 'SupplyChainDataContext';

/** Supply chain domain: suppliers, products, prices, quotations, freelancers. */
export const useSupplyChainData = (): SupplyChainDataType => {
  const ctx = useContext(SupplyChainContext);
  if (!ctx) throw new Error('useSupplyChainData must be used within DataProvider');
  return ctx;
};
