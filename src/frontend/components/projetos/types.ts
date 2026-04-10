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
