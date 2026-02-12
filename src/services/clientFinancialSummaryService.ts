import type { Project } from '../types';
import { parseDateString } from '../utils/formatters';
import { getProjectLumpSumValue, getProjectTotalContractValue } from '../utils/projectFinancials';

export interface ProjectFinancialSummary {
  totalValue: number;
  paid: number;
  pending: number;
  overdue: number;
}

/**
 * Input -> Output:
 * - input: projeto com dados financeiros.
 * - output: resumo financeiro com total, pago, pendente e vencido.
 * Example:
 * const summary = calculateProjectFinancialSummary(project);
 */
export const calculateProjectFinancialSummary = (project: Project): ProjectFinancialSummary => {
  const summary: ProjectFinancialSummary = {
    totalValue: getProjectTotalContractValue(project),
    paid: 0,
    pending: 0,
    overdue: 0,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const financials = project.financials;
  if (!financials) {
    return summary;
  }

  if (financials.paymentType === 'vista') {
    const value = getProjectLumpSumValue(project);

    if (financials.lumpSumStatus === 'Pago') {
      summary.paid = value;
    } else {
      const dueDate = parseDateString(financials.lumpSumDueDate);
      if (dueDate && dueDate < today) {
        summary.overdue = value;
      } else {
        summary.pending = value;
      }
    }

    return summary;
  }

  if (financials.paymentType === 'parcelado' && financials.installments) {
    financials.installments.forEach((installment) => {
      if (installment.paid) {
        summary.paid += installment.value;
      } else {
        const dueDate = parseDateString(installment.dueDate);
        if (dueDate && dueDate < today) {
          summary.overdue += installment.value;
        } else {
          summary.pending += installment.value;
        }
      }
    });
  }

  return summary;
};
