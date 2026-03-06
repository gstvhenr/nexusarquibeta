import React, { useState, useEffect, PropsWithChildren, useCallback, useMemo } from 'react';
import { AppData, api } from '../services/infrastructure/api';

import type {
  CoreDataType,
  FinanceDataType,
  SupplyChainDataType,
  MarketingDataType,
  SystemDataType,
  DataHistoryContextType,
} from './types';

import { CoreContext } from './CoreContext';
import { FinanceContext } from './FinanceContext';
import { SupplyChainContext } from './SupplyChainContext';
import { MarketingContext } from './MarketingContext';
import { SystemContext } from './SystemContext';
import { DataHistoryContext } from './DataHistoryContext';

import { useLegacyCleanup } from '../hooks/useLegacyCleanup';
import { useUndoRedo } from '../hooks/useUndoRedo';
import type { SetFieldFn } from './createDomainSetter';
import { useDomain } from './useDomain';

// ---------------------------------------------------------------------------
// Persistence helper (stable reference for useUndoRedo)
// ---------------------------------------------------------------------------

const persistDataSnapshot = (snapshot: AppData): void => {
  api.replaceData(snapshot);
};

// ---------------------------------------------------------------------------
// Provider (thin orchestrator — composes extracted hooks)
// ---------------------------------------------------------------------------

export const DataProvider: (props: PropsWithChildren<{}>) => React.ReactNode = ({ children }) => {
  const [data, setData] = useState<AppData>(() => api.getData());

  // --- Isolated concerns ---
  useLegacyCleanup(setData);
  const { appendToHistory, clearHistory, undo, redo, canUndo, canRedo } = useUndoRedo(
    data,
    setData,
    persistDataSnapshot,
  );

  // --- Storage sync ---
  useEffect(() => {
    const syncState = () => {
      setData(api.getData());
      clearHistory();
    };
    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);
  }, [clearHistory]);

  // --- Unified field setter (with history tracking) ---
  const setField = useCallback<SetFieldFn>(
    (key, value) => {
      setData((prevData) => {
        const nextValue = value instanceof Function ? value(prevData[key]) : value;
        if (Object.is(nextValue, prevData[key])) {
          return prevData;
        }

        appendToHistory(prevData);
        api.updateData(key, nextValue);
        return { ...prevData, [key]: nextValue };
      });
    },
    [appendToHistory],
  );

  // --- Domain slices (each memoized per-key, setters auto-generated) ---

  const coreValue: CoreDataType = useDomain(data, setField, ['projects', 'proposals', 'clients']);

  const financeValue: FinanceDataType = useDomain(data, setField, [
    'commissions',
    'manualExpenses',
    'manualIncomes',
    'cashBoxExpenses',
    'cashBoxCredits',
  ]);

  const supplyChainValue: SupplyChainDataType = useDomain(data, setField, [
    'suppliers',
    'products',
    'supplierProductPrices',
    'quotations',
    'freelancers',
  ]);

  const marketingValue: MarketingDataType = useDomain(data, setField, [
    'marketingProfessionals',
    'marketingActivities',
    'marketingIdeas',
    'socialNetworks',
    'prospects',
  ]);

  const systemValue: SystemDataType = useDomain(data, setField, [
    'documentStorage',
    'agendaEvents',
    'reminders',
    'customBudgetTemplate',
    'globalIdentifierCounter',
    'dismissedFocusItems',
    'acceptedPaymentMethods',
    'hiredServices',
    'contractDeadlines',
  ]);

  const historyValue: DataHistoryContextType = useMemo(
    () => ({
      undo,
      redo,
      clearHistory,
      canUndo,
      canRedo,
    }),
    [undo, redo, clearHistory, canUndo, canRedo],
  );

  return (
    <DataHistoryContext.Provider value={historyValue}>
      <CoreContext.Provider value={coreValue}>
        <FinanceContext.Provider value={financeValue}>
          <SupplyChainContext.Provider value={supplyChainValue}>
            <MarketingContext.Provider value={marketingValue}>
              <SystemContext.Provider value={systemValue}>{children}</SystemContext.Provider>
            </MarketingContext.Provider>
          </SupplyChainContext.Provider>
        </FinanceContext.Provider>
      </CoreContext.Provider>
    </DataHistoryContext.Provider>
  );
};

// Re-export hooks for backward compatibility (consumers import from './DataContext')
export { useCoreData } from './CoreContext';
export { useFinanceData } from './FinanceContext';
export { useSupplyChainData } from './SupplyChainContext';
export { useMarketingData } from './MarketingContext';
export { useSystemData } from './SystemContext';
