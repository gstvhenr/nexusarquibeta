import type { ContractAddendum, Installment, Project, ProjectFinancials } from '../../../../types';

export type BudgetServiceOption = {
  id: string;
  sectionTitle: string;
  description: string;
  suggestedValue: number;
  unit: string;
};

export interface FinanceTabProps {
  project: Project;
  budgetServices: BudgetServiceOption[];
  onFinancialsChange: (
    field: keyof Project['financials'],
    value: ProjectFinancials[keyof ProjectFinancials],
  ) => void;
  onInstallmentChange: (
    id: string,
    field: keyof Installment,
    value: Installment[keyof Installment],
  ) => void;
  onGenerateInstallments: () => void;
  onConfirmPayment: (payment: { type: 'lump' } | { type: 'installment'; id: string }) => void;
  onAddInstallment: () => void;
  onRemoveInstallment: (id: string) => void;
  onAddAddendum: (addendum: Omit<ContractAddendum, 'id' | 'status'>) => void;
  onUpdateAddendumStatus: (id: string, status: ContractAddendum['status']) => void;
  onRemoveAddendum: (id: string) => void;
}

export interface InstallmentStatusMeta {
  text: string;
  color: string;
  dotColor: string;
}

export type AddendumAuditEntry = NonNullable<Project['financials']['addendumAuditTrail']>[number];
