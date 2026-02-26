import type { CashBoxCredit, CashBoxExpense } from '../../types';

export type UnifiedEntry = {
  id: string;
  type: 'debit' | 'credit';
  date: string;
  origin: CashBoxExpense['origin'];
  description: string;
  value: number;
  confirmed: boolean;
  recurrence?: CashBoxExpense['recurrence'];
  installmentNumber?: number | null;
  installmentTotal?: number | null;
  paymentDate?: string | null;
  raw: CashBoxExpense | CashBoxCredit;
};
