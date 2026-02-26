// Domain hooks
export { useCoreData } from './CoreContext';
export { useFinanceData } from './FinanceContext';
export { useSupplyChainData } from './SupplyChainContext';
export { useMarketingData } from './MarketingContext';
export { useSystemData } from './SystemContext';
export { useDataHistory } from './DataHistoryContext';

// Provider
export { DataProvider } from './DataContext';

// Financial security
export { FinancialSecurityProvider, useFinancialSecurity } from './FinancialSecurityContext';

// Types (re-exported for convenience)
export type {
  CoreDataType,
  FinanceDataType,
  SupplyChainDataType,
  MarketingDataType,
  SystemDataType,
  DataHistoryContextType,
} from './types';
