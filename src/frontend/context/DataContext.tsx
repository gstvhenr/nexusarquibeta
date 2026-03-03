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
import { createDomainSetter } from './createDomainSetter';
import type { SetFieldFn } from './createDomainSetter';

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

  // --- Domain values (memoized per domain for granular re-renders) ---

  const coreValue: CoreDataType = useMemo(
    () => ({
      projects: data.projects,
      proposals: data.proposals,
      clients: data.clients,
      setProjects: createDomainSetter(setField, 'projects'),
      setProposals: createDomainSetter(setField, 'proposals'),
      setClients: createDomainSetter(setField, 'clients'),
    }),
    [data.projects, data.proposals, data.clients, setField],
  );

  const financeValue: FinanceDataType = useMemo(
    () => ({
      commissions: data.commissions,
      manualExpenses: data.manualExpenses,
      manualIncomes: data.manualIncomes,
      cashBoxExpenses: data.cashBoxExpenses,
      cashBoxCredits: data.cashBoxCredits,
      setCommissions: createDomainSetter(setField, 'commissions'),
      setManualExpenses: createDomainSetter(setField, 'manualExpenses'),
      setManualIncomes: createDomainSetter(setField, 'manualIncomes'),
      setCashBoxExpenses: createDomainSetter(setField, 'cashBoxExpenses'),
      setCashBoxCredits: createDomainSetter(setField, 'cashBoxCredits'),
    }),
    [
      data.commissions,
      data.manualExpenses,
      data.manualIncomes,
      data.cashBoxExpenses,
      data.cashBoxCredits,
      setField,
    ],
  );

  const supplyChainValue: SupplyChainDataType = useMemo(
    () => ({
      suppliers: data.suppliers,
      products: data.products,
      supplierProductPrices: data.supplierProductPrices,
      quotations: data.quotations,
      freelancers: data.freelancers,
      setSuppliers: createDomainSetter(setField, 'suppliers'),
      setProducts: createDomainSetter(setField, 'products'),
      setSupplierProductPrices: createDomainSetter(setField, 'supplierProductPrices'),
      setQuotations: createDomainSetter(setField, 'quotations'),
      setFreelancers: createDomainSetter(setField, 'freelancers'),
    }),
    [
      data.suppliers,
      data.products,
      data.supplierProductPrices,
      data.quotations,
      data.freelancers,
      setField,
    ],
  );

  const marketingValue: MarketingDataType = useMemo(
    () => ({
      marketingProfessionals: data.marketingProfessionals,
      marketingActivities: data.marketingActivities,
      marketingIdeas: data.marketingIdeas,
      socialNetworks: data.socialNetworks,
      prospects: data.prospects,
      setMarketingProfessionals: createDomainSetter(setField, 'marketingProfessionals'),
      setMarketingActivities: createDomainSetter(setField, 'marketingActivities'),
      setMarketingIdeas: createDomainSetter(setField, 'marketingIdeas'),
      setSocialNetworks: createDomainSetter(setField, 'socialNetworks'),
      setProspects: createDomainSetter(setField, 'prospects'),
    }),
    [
      data.marketingProfessionals,
      data.marketingActivities,
      data.marketingIdeas,
      data.socialNetworks,
      data.prospects,
      setField,
    ],
  );

  const systemValue: SystemDataType = useMemo(
    () => ({
      documentStorage: data.documentStorage,
      agendaEvents: data.agendaEvents,
      reminders: data.reminders,
      customBudgetTemplate: data.customBudgetTemplate,
      globalIdentifierCounter: data.globalIdentifierCounter,
      dismissedFocusItems: data.dismissedFocusItems,
      acceptedPaymentMethods: data.acceptedPaymentMethods,
      hiredServices: data.hiredServices,
      contractDeadlines: data.contractDeadlines,
      setDocumentStorage: createDomainSetter(setField, 'documentStorage'),
      setAgendaEvents: createDomainSetter(setField, 'agendaEvents'),
      setReminders: createDomainSetter(setField, 'reminders'),
      setCustomBudgetTemplate: createDomainSetter(setField, 'customBudgetTemplate'),
      setGlobalIdentifierCounter: createDomainSetter(setField, 'globalIdentifierCounter'),
      setDismissedFocusItems: createDomainSetter(setField, 'dismissedFocusItems'),
      setAcceptedPaymentMethods: createDomainSetter(setField, 'acceptedPaymentMethods'),
      setHiredServices: createDomainSetter(setField, 'hiredServices'),
      setContractDeadlines: createDomainSetter(setField, 'contractDeadlines'),
    }),
    [
      data.documentStorage,
      data.agendaEvents,
      data.reminders,
      data.customBudgetTemplate,
      data.globalIdentifierCounter,
      data.dismissedFocusItems,
      data.acceptedPaymentMethods,
      data.hiredServices,
      data.contractDeadlines,
      setField,
    ],
  );

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
