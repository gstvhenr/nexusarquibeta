import { useMemo } from 'react';
import {
  useCoreData,
  useFinanceData,
  useMarketingData,
  useSystemData,
} from '../context/DataContext';
import { agendaService } from '../services/agendaService';
import type { AgendaEvent } from '../types';

/**
 * Consolidates multiple domain contexts into a unified event stream.
 * Encapsulates the getUnifiedEvents plumbing so pages don't pull 4 contexts manually.
 *
 * input  -> four domain contexts (System, Core, Marketing, Finance)
 * output -> AgendaEvent[] (memoized)
 */
export function useUnifiedEvents(): AgendaEvent[] {
  const { agendaEvents } = useSystemData();
  const { projects } = useCoreData();
  const { marketingActivities, prospects } = useMarketingData();
  const { manualExpenses, commissions, manualIncomes } = useFinanceData();

  return useMemo(
    () =>
      agendaService.getUnifiedEvents({
        agendaEvents,
        projects,
        marketingActivities,
        prospects,
        manualExpenses,
        commissions,
        manualIncomes,
      }),
    [
      agendaEvents,
      projects,
      marketingActivities,
      prospects,
      manualExpenses,
      commissions,
      manualIncomes,
    ],
  );
}
