import { createContext, useContext } from 'react';
import type { FinanceDataType } from './types';

export const FinanceContext = createContext<FinanceDataType | undefined>(undefined);
FinanceContext.displayName = 'FinanceDataContext';

/** Finance domain: commissions, expenses, incomes, cash box. */
export const useFinanceData = (): FinanceDataType => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinanceData must be used within DataProvider');
  return ctx;
};
