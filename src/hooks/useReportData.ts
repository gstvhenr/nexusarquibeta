import { useMemo } from 'react';
import {
  useCoreData,
  useFinanceData,
  useMarketingData,
  useSupplyChainData,
} from '../context/DataContext';
import type { ReportDataInput } from '../services/reportService';

/**
 * Assembles the narrowed ReportDataInput from domain contexts.
 * Encapsulates multi-context plumbing so pages don't rebuild this blob manually.
 *
 * input  -> four domain contexts (Core, Finance, Marketing, SupplyChain)
 * output -> ReportDataInput (memoized)
 */
export function useReportData(): ReportDataInput {
  const { projects, clients, proposals } = useCoreData();
  const { commissions, manualExpenses } = useFinanceData();
  const { marketingActivities } = useMarketingData();
  const { freelancers } = useSupplyChainData();

  return useMemo(
    () => ({
      projects,
      clients,
      proposals,
      marketingActivities,
      commissions,
      manualExpenses,
      freelancers,
    }),
    [projects, clients, proposals, marketingActivities, commissions, manualExpenses, freelancers],
  );
}
