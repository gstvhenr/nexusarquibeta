import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SupplyChainContext, useSupplyChainData } from './SupplyChainContext';
import type { SupplyChainDataType } from './types';

const createSupplyChainValue = (): SupplyChainDataType => ({
  suppliers: [] as SupplyChainDataType['suppliers'],
  products: [] as SupplyChainDataType['products'],
  supplierProductPrices: [] as SupplyChainDataType['supplierProductPrices'],
  quotations: [] as SupplyChainDataType['quotations'],
  freelancers: [] as SupplyChainDataType['freelancers'],
  setSuppliers: vi.fn(),
  setProducts: vi.fn(),
  setSupplierProductPrices: vi.fn(),
  setQuotations: vi.fn(),
  setFreelancers: vi.fn(),
});

describe('SupplyChainContext', () => {
  it('throws when useSupplyChainData is used outside provider', () => {
    expect(() => renderHook(() => useSupplyChainData())).toThrowError(
      'useSupplyChainData must be used within DataProvider',
    );
  });

  it('returns provider value when available', () => {
    const value = createSupplyChainValue();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SupplyChainContext.Provider value={value}>{children}</SupplyChainContext.Provider>
    );

    const { result } = renderHook(() => useSupplyChainData(), { wrapper });

    expect(result.current).toBe(value);
  });
});
