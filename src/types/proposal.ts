// --- Budget & Proposal Types ---
export type BudgetUnit = 'm²' | 'h' | 'un' | 'vb';
export type BillingMethod =
  | 'percentage_on_top'
  | 'percentage_embedded'
  | 'fixed_fee'
  | 'per_sqm'
  | 'per_hour';
export type ProposalStatus = 'Pendente' | 'Em Análise' | 'Concluído' | 'Rejeitado';
export const proposalStatuses: ProposalStatus[] = [
  'Pendente',
  'Em Análise',
  'Concluído',
  'Rejeitado',
];

export interface BudgetItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  included: boolean;
  estimatedHours?: number;
}

export interface BillingInfo {
  method: BillingMethod;
  value: number;
}

export interface BudgetSection {
  id: number;
  title: string;
  unit: BudgetUnit;
  items: BudgetItem[];
  billing: BillingInfo;
}

export interface BudgetTemplateItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  estimatedHours?: number;
}

export interface BudgetTemplateSection {
  id: number;
  title: string;
  unit: BudgetUnit;
  items: BudgetTemplateItem[];
  billing: BillingInfo;
}

export interface SavedItem {
  id: number;
  description: string;
  unit: BudgetUnit;
  quantity: number;
  unitPrice: number;
  estimatedHours?: number;
}

export interface SavedSection {
  id: number;
  title: string;
  items: SavedItem[];
}

// WYSIWYG Editor Blocks
export type ProposalBlockType = 'text' | 'image' | 'budget_table' | 'page_break';

export interface ProposalBlock {
  id: string;
  type: ProposalBlockType;
  content?: string; // HTML string for text, DataURL for image
  order: number;
  proposalId?: string; // SQL Foreign Key Preparation
}

export interface Proposal {
  id: string;
  code: string;
  name: string;
  date: string;
  status: ProposalStatus;
  sections: SavedSection[];
  discount: number;
  subtotal: number;
  total: number;
  remuneration?: number;
  archived?: boolean;
  clientId?: string;
  notes?: string;

  // New Fields for WYSIWYG
  contentBlocks?: ProposalBlock[]; // If present, uses the new editor format

  // PDF Display Customization (services/descriptions are ALWAYS shown)
  showItemPrices?: boolean; // Show individual item values (default: true)
  showSectionTotals?: boolean; // Show subtotal per section (default: true)
  showDiscount?: boolean; // Show discount block near total (default: true when discount > 0)
  showGrandTotal?: boolean; // Show final total (default: true)
  totalsAlignment?: 'right' | 'left'; // Alignment of totals block (default: right)
  showProposalDate?: boolean; // Show proposal date in document header (default: true)

  // Project Linking (for additional budgets on existing projects)
  projectId?: string;
}
