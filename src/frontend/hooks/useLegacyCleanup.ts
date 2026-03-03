import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';
import type { AppData } from '../services/infrastructure/api';
import { api } from '../services/infrastructure/api';

// ---------------------------------------------------------------------------
// Legacy demo data cleanup — runs once on mount, no history side-effects
// ---------------------------------------------------------------------------

const LEGACY_DEMO_CASHBOX_PREFIXES = ['demo_cashbox_', 'demo_cashbox_2025_', 'demo_2025_'];

const isLegacyDemoCashBoxExpenseId = (id: string): boolean =>
  LEGACY_DEMO_CASHBOX_PREFIXES.some((prefix) => id.startsWith(prefix));

/**
 * Sanitises legacy demo cashbox expenses on application startup.
 *
 * Isolated from undo/redo to prevent silent state overwrite after history
 * restoration (the original defect).
 */
export function useLegacyCleanup(setData: Dispatch<SetStateAction<AppData>>): void {
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
  }, [setData]);
}
