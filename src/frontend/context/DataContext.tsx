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

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const HISTORY_LIMIT = 50;

const cloneDataSnapshot = (snapshot: AppData): AppData => {
  if (typeof structuredClone === 'function') {
    return structuredClone(snapshot);
  }
  return JSON.parse(JSON.stringify(snapshot)) as AppData;
};

const persistDataSnapshot = (snapshot: AppData): void => {
  api.replaceData(snapshot);
};

// ---------------------------------------------------------------------------
// Legacy cleanup
// ---------------------------------------------------------------------------

const LEGACY_DEMO_CASHBOX_PREFIXES = ['demo_cashbox_', 'demo_cashbox_2025_', 'demo_2025_'];

const isLegacyDemoCashBoxExpenseId = (id: string): boolean =>
  LEGACY_DEMO_CASHBOX_PREFIXES.some((prefix) => id.startsWith(prefix));

// ---------------------------------------------------------------------------
// Provider (orchestrator — creates domain contexts from unified state)
// ---------------------------------------------------------------------------

export const DataProvider: (props: PropsWithChildren<{}>) => React.ReactNode = ({ children }) => {
  const [data, setData] = useState<AppData>(() => api.getData());
  const [historyPast, setHistoryPast] = useState<AppData[]>([]);
  const [historyFuture, setHistoryFuture] = useState<AppData[]>([]);

  const clearHistory = useCallback(() => {
    setHistoryPast([]);
    setHistoryFuture([]);
  }, []);

  const appendToHistoryPast = useCallback((snapshot: AppData) => {
    setHistoryPast((previous) => {
      const next = [...previous, cloneDataSnapshot(snapshot)];
      return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
    });
  }, []);

  const applyHistorySnapshot = useCallback((snapshot: AppData) => {
    const snapshotClone = cloneDataSnapshot(snapshot);
    setData(snapshotClone);
    persistDataSnapshot(snapshotClone);
  }, []);

  useEffect(() => {
    const syncState = () => {
      setData(api.getData());
      clearHistory();
    };
    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);
  }, [clearHistory]);

  useEffect(() => {
    setData((prevData) => {
      if (!Array.isArray(prevData.cashBoxExpenses) || prevData.cashBoxExpenses.length === 0) {
        return prevData;
      }

      const sanitizedCashBoxExpenses = prevData.cashBoxExpenses.filter(
        (expense) => !isLegacyDemoCashBoxExpenseId(expense.id),
      );

      if (sanitizedCashBoxExpenses.length === prevData.cashBoxExpenses.length) {
        return prevData;
      }

      api.updateData('cashBoxExpenses', sanitizedCashBoxExpenses);
      return { ...prevData, cashBoxExpenses: sanitizedCashBoxExpenses };
    });
  }, []);

  const setField = useCallback(
    <K extends keyof AppData>(key: K, value: AppData[K] | ((prev: AppData[K]) => AppData[K])) => {
      setData((prevData) => {
        const nextValue = value instanceof Function ? value(prevData[key]) : value;
        if (Object.is(nextValue, prevData[key])) {
          return prevData;
        }

        appendToHistoryPast(prevData);
        setHistoryFuture([]);
        api.updateData(key, nextValue);
        return { ...prevData, [key]: nextValue };
      });
    },
    [appendToHistoryPast],
  );

  const undo = useCallback(() => {
    if (historyPast.length === 0) return;

    const previousSnapshot = historyPast[historyPast.length - 1];
    setHistoryPast((previous) => previous.slice(0, -1));
    setHistoryFuture((previous) => {
      const next = [cloneDataSnapshot(data), ...previous];
      return next.length > HISTORY_LIMIT ? next.slice(0, HISTORY_LIMIT) : next;
    });
    applyHistorySnapshot(previousSnapshot);
  }, [applyHistorySnapshot, data, historyPast]);

  const redo = useCallback(() => {
    if (historyFuture.length === 0) return;

    const [nextSnapshot, ...remaining] = historyFuture;
    setHistoryFuture(remaining);
    appendToHistoryPast(data);
    applyHistorySnapshot(nextSnapshot);
  }, [appendToHistoryPast, applyHistorySnapshot, data, historyFuture]);

  // --- Domain values (memoized per domain for granular re-renders) ---

  const coreValue: CoreDataType = useMemo(
    () => ({
      projects: data.projects,
      proposals: data.proposals,
      clients: data.clients,
      setProjects: (v: AppData['projects'] | ((p: AppData['projects']) => AppData['projects'])) =>
        setField('projects', v),
      setProposals: (
        v: AppData['proposals'] | ((p: AppData['proposals']) => AppData['proposals']),
      ) => setField('proposals', v),
      setClients: (v: AppData['clients'] | ((p: AppData['clients']) => AppData['clients'])) =>
        setField('clients', v),
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
      setCommissions: (
        v: AppData['commissions'] | ((p: AppData['commissions']) => AppData['commissions']),
      ) => setField('commissions', v),
      setManualExpenses: (
        v:
          | AppData['manualExpenses']
          | ((p: AppData['manualExpenses']) => AppData['manualExpenses']),
      ) => setField('manualExpenses', v),
      setManualIncomes: (
        v: AppData['manualIncomes'] | ((p: AppData['manualIncomes']) => AppData['manualIncomes']),
      ) => setField('manualIncomes', v),
      setCashBoxExpenses: (
        v:
          | AppData['cashBoxExpenses']
          | ((p: AppData['cashBoxExpenses']) => AppData['cashBoxExpenses']),
      ) => setField('cashBoxExpenses', v),
      setCashBoxCredits: (
        v:
          | AppData['cashBoxCredits']
          | ((p: AppData['cashBoxCredits']) => AppData['cashBoxCredits']),
      ) => setField('cashBoxCredits', v),
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
      setSuppliers: (
        v: AppData['suppliers'] | ((p: AppData['suppliers']) => AppData['suppliers']),
      ) => setField('suppliers', v),
      setProducts: (v: AppData['products'] | ((p: AppData['products']) => AppData['products'])) =>
        setField('products', v),
      setSupplierProductPrices: (
        v:
          | AppData['supplierProductPrices']
          | ((p: AppData['supplierProductPrices']) => AppData['supplierProductPrices']),
      ) => setField('supplierProductPrices', v),
      setQuotations: (
        v: AppData['quotations'] | ((p: AppData['quotations']) => AppData['quotations']),
      ) => setField('quotations', v),
      setFreelancers: (
        v: AppData['freelancers'] | ((p: AppData['freelancers']) => AppData['freelancers']),
      ) => setField('freelancers', v),
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
      setMarketingProfessionals: (
        v:
          | AppData['marketingProfessionals']
          | ((p: AppData['marketingProfessionals']) => AppData['marketingProfessionals']),
      ) => setField('marketingProfessionals', v),
      setMarketingActivities: (
        v:
          | AppData['marketingActivities']
          | ((p: AppData['marketingActivities']) => AppData['marketingActivities']),
      ) => setField('marketingActivities', v),
      setMarketingIdeas: (
        v:
          | AppData['marketingIdeas']
          | ((p: AppData['marketingIdeas']) => AppData['marketingIdeas']),
      ) => setField('marketingIdeas', v),
      setSocialNetworks: (
        v:
          | AppData['socialNetworks']
          | ((p: AppData['socialNetworks']) => AppData['socialNetworks']),
      ) => setField('socialNetworks', v),
      setProspects: (
        v: AppData['prospects'] | ((p: AppData['prospects']) => AppData['prospects']),
      ) => setField('prospects', v),
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
      setDocumentStorage: (
        v:
          | AppData['documentStorage']
          | ((p: AppData['documentStorage']) => AppData['documentStorage']),
      ) => setField('documentStorage', v),
      setAgendaEvents: (
        v: AppData['agendaEvents'] | ((p: AppData['agendaEvents']) => AppData['agendaEvents']),
      ) => setField('agendaEvents', v),
      setReminders: (
        v: AppData['reminders'] | ((p: AppData['reminders']) => AppData['reminders']),
      ) => setField('reminders', v),
      setCustomBudgetTemplate: (
        v:
          | AppData['customBudgetTemplate']
          | ((p: AppData['customBudgetTemplate']) => AppData['customBudgetTemplate']),
      ) => setField('customBudgetTemplate', v),
      setGlobalIdentifierCounter: (
        v:
          | AppData['globalIdentifierCounter']
          | ((p: AppData['globalIdentifierCounter']) => AppData['globalIdentifierCounter']),
      ) => setField('globalIdentifierCounter', v),
      setDismissedFocusItems: (
        v:
          | AppData['dismissedFocusItems']
          | ((p: AppData['dismissedFocusItems']) => AppData['dismissedFocusItems']),
      ) => setField('dismissedFocusItems', v),
      setAcceptedPaymentMethods: (
        v:
          | AppData['acceptedPaymentMethods']
          | ((p: AppData['acceptedPaymentMethods']) => AppData['acceptedPaymentMethods']),
      ) => setField('acceptedPaymentMethods', v),
      setHiredServices: (
        v: AppData['hiredServices'] | ((p: AppData['hiredServices']) => AppData['hiredServices']),
      ) => setField('hiredServices', v),
      setContractDeadlines: (
        v:
          | AppData['contractDeadlines']
          | ((p: AppData['contractDeadlines']) => AppData['contractDeadlines']),
      ) => setField('contractDeadlines', v),
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
      canUndo: historyPast.length > 0,
      canRedo: historyFuture.length > 0,
    }),
    [undo, redo, clearHistory, historyPast.length, historyFuture.length],
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
