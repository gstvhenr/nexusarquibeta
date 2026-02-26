import type {
  ContractAddendum,
  ContractAddendumStatus,
  Project,
  ProjectAddress,
  ProjectFinancials,
} from '../../types';

export type ProjectDetailTabId =
  | 'overview'
  | 'stages'
  | 'deadlines'
  | 'gantt'
  | 'finance'
  | 'quotations'
  | 'notes';

export type BudgetServiceOption = {
  id: string;
  sectionTitle: string;
  description: string;
  suggestedValue: number;
  unit: string;
};

export type HandleLocalProjectChange = (
  field: keyof Project,
  value: Project[keyof Project],
) => void;

export type HandleProjectAddressChange = (field: keyof ProjectAddress, value: string) => void;

export type HandleFinancialsChange = (
  field: keyof Project['financials'],
  value: ProjectFinancials[keyof ProjectFinancials],
) => void;

export type HandleAddAddendum = (addendum: Omit<ContractAddendum, 'id' | 'status'>) => void;

export type HandleUpdateAddendumStatus = (id: string, status: ContractAddendumStatus) => void;
