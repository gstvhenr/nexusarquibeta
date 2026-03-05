import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FinanceContext, useFinanceData } from './FinanceContext';
import type { FinanceDataType } from './types';

const createFinanceValue = (): FinanceDataType => ({
  commissions: [] as FinanceDataType['commissions'],
  manualExpenses: [] as FinanceDataType['manualExpenses'],
  manualIncomes: [] as FinanceDataType['manualIncomes'],
  cashBoxExpenses: [] as FinanceDataType['cashBoxExpenses'],
  cashBoxCredits: [] as FinanceDataType['cashBoxCredits'],
  setCommissions: vi.fn(),
  setManualExpenses: vi.fn(),
  setManualIncomes: vi.fn(),
  setCashBoxExpenses: vi.fn(),
  setCashBoxCredits: vi.fn(),
});

describe('FinanceContext', () => {
  it('throws when useFinanceData is used outside provider', () => {
    expect(() => renderHook(() => useFinanceData())).toThrowError(
      'useFinanceData must be used within DataProvider',
    );
  });

  it('returns provider value when available', () => {
    const value = createFinanceValue();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
    );

    const { result } = renderHook(() => useFinanceData(), { wrapper });

    expect(result.current).toBe(value);
  });
});
