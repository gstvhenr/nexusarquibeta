import type { Installment } from './project';
import type { ProfessionalExpenseCategory } from './finance';
import type { CashBoxCategory } from './cashBox';

// --- Unified Financial Domain Types ---

/** A receivable entry combining Installment data with project/source metadata. */
export interface FinancialReceivable extends Installment {
  projectId: string;
  projectCode: string;
  clientName: string;
  clientId: string;
  description: string;
  status: 'Pago' | 'Vencido' | 'Em Aberto' | 'Recebido' | 'Pendente';
  source: 'Project' | 'Commission' | 'Manual';
  category?: string;
}

/** A debit entry with normalized status for the financial dashboard. */
export interface FinancialDebit {
  id: string;
  description: string;
  category: ProfessionalExpenseCategory | CashBoxCategory | 'Outros';
  value: number;
  dueDate: string;
  status: 'Pago' | 'Vencido' | 'Pendente';
  paymentDate?: string | null;
  isRecurring: boolean;
  source: 'Manual' | 'Marketing' | 'Freelancer' | 'CashBox';
  marketingActivityId?: string;
  freelancerActivityId?: string;
}
