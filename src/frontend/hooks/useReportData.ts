import { useMemo } from 'react';
import {
  useCoreData,
  useFinanceData,
  useMarketingData,
  useSupplyChainData,
} from '../context/DataContext';
import { useSystemData } from '../context/SystemContext';
import type { ReportDataInput } from '../services/reportService';

/**
 * Assembles the narrowed ReportDataInput from domain contexts.
 * Encapsulates multi-context plumbing so the reports page doesn't rebuild this blob manually.
 *
 * input  -> five domain contexts (Core, Finance, Marketing, SupplyChain, System)
 * output -> ReportDataInput (memoized)
 */
export function useReportData(): ReportDataInput {
  const { projects, clients, proposals } = useCoreData();
  const { commissions, manualExpenses, cashBoxExpenses, cashBoxCredits } = useFinanceData();
  const { marketingActivities, prospects, socialNetworks } = useMarketingData();
  const { freelancers, suppliers, quotations } = useSupplyChainData();
  const { agendaEvents, hiredServices } = useSystemData();

  return useMemo(
    () => ({
      projects,
      clients,
      proposals,
      marketingActivities,
      commissions,
      manualExpenses,
      freelancers,
      cashBoxExpenses: cashBoxExpenses ?? [],
      cashBoxCredits: cashBoxCredits ?? [],
      agendaEvents: agendaEvents ?? [],
      hiredServices: hiredServices ?? [],
      prospects: prospects ?? [],
      socialNetworks: socialNetworks ?? [],
      suppliers: suppliers ?? [],
      quotations: quotations ?? [],
      products: [],
    }),
    [
      projects,
      clients,
      proposals,
      marketingActivities,
      commissions,
      manualExpenses,
      freelancers,
      cashBoxExpenses,
      cashBoxCredits,
      agendaEvents,
      hiredServices,
      prospects,
      socialNetworks,
      suppliers,
      quotations,
    ],
  );
}
