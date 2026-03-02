import type { PaymentMethod } from './finance';

// --- Project Types ---
export type ProjectStatus = 'Não Iniciado' | 'Em Andamento' | 'Pausado' | 'Concluído' | 'Cancelado';
export const projectStatuses: ProjectStatus[] = [
  'Não Iniciado',
  'Em Andamento',
  'Pausado',
  'Concluído',
  'Cancelado',
];

export type TaskPriority = 'Baixa' | 'Média' | 'Alta';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string | null;
  taskId?: string; // SQL Foreign Key Preparation
}

export interface ProjectTask {
  id: string;
  name: string;
  completed: boolean;
  hours: number;
  description?: string;

  // Gantt additions
  startDate?: string; // ISO Date YYYY-MM-DD
  endDate?: string; // ISO Date YYYY-MM-DD
  dueDate?: string; // ISO Date YYYY-MM-DD (Legacy, acts as endDate if endDate missing)

  priority?: TaskPriority;
  assignee?: string;
  subtasks?: Subtask[];
  status?: TaskStatus;
  dependencies?: string[]; // Array of Task IDs that must finish before this starts

  // SQL Normalization Prep
  projectId?: string;
  sectionId?: string;
}

export interface ProjectSection {
  id: string;
  name: string;
  tasks: ProjectTask[];
  projectId?: string; // SQL Foreign Key Preparation
}

export interface AdditionalDeadline {
  id: string;
  title: string;
  date: string;
  projectId?: string; // SQL Foreign Key Preparation
}

export interface ProjectAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}

// --- Project Financial Sub-types ---
export interface Installment {
  id: string;
  number: number;
  value: number;
  dueDate: string;
  paid: boolean;
  paymentDate: string | null;
  paymentMethod?: PaymentMethod;
  remuneration?: number;
  description?: string; // Optional: Allows labeling installments (e.g. "Aditivo 01")
  projectId?: string; // SQL Foreign Key Preparation
}

export interface Purchase {
  id: string;
  quotationId?: string;
  quotationName: string;
  productId?: string;
  productName: string;
  supplierId?: string;
  supplierName: string;
  unitPrice: number;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  projectId?: string; // SQL Foreign Key Preparation
}

export type ContractAddendumStatus =
  | 'Rascunho'
  | 'Pendente'
  | 'Aprovado'
  | 'Faturado'
  | 'Rejeitado';

export interface ContractAddendum {
  id: string;
  description: string;
  value: number;
  date: string;
  status: ContractAddendumStatus;
  projectId?: string; // SQL Foreign Key Preparation
}

export interface AddendumAuditEntry {
  id: string;
  addendumId: string;
  action: 'created' | 'status_changed' | 'deleted';
  description: string;
  fromStatus?: ContractAddendumStatus;
  toStatus?: ContractAddendumStatus;
  timestamp: string;
  actor?: string;
}

export interface ProjectFinancials {
  baseContractValue?: number;
  totalValue?: number;
  paymentType: 'vista' | 'parcelado';

  // For 'vista'
  lumpSumValue?: number;
  lumpSumDueDate?: string | null;
  lumpSumStatus?: 'Pago' | 'Em aberto';
  lumpSumPaymentDate?: string | null;
  lumpSumPaymentMethod?: PaymentMethod;

  // For 'parcelado'
  installmentsInterestEnabled?: boolean;
  installmentsInterestRate?: number;
  numberOfInstallments?: number;
  installmentsPaymentDay?: number;
  installments?: Installment[];
  startInstallmentsInCurrentMonth?: boolean;

  // Addendums
  addendums?: ContractAddendum[];
  addendumAuditTrail?: AddendumAuditEntry[];
}

export interface Project {
  id: string;
  code: string;
  name: string;
  clientName: string;
  clientId: string;
  status: ProjectStatus;
  priority?: TaskPriority;
  deadline: string | null;
  budget: number;
  remuneration?: number;
  description: string;
  sections: ProjectSection[];
  archived?: boolean;
  inactivatedAt?: string | null;
  additionalDeadlines?: AdditionalDeadline[];
  proposalId?: string;
  proposalCode?: string;
  financials: ProjectFinancials;
  linkedQuotationIds?: string[];
  purchases?: Purchase[];
  notes?: string;
  finalizedAt?: string | null;

  // New Fields for Contract Management
  serviceAddress?: ProjectAddress;
  rrtNumber?: string;
  rrtUrl?: string; // Link or File URL
  revisionCount?: number; // Tracks used revisions
  revisionLimit?: number; // Defaults to 3 based on contract
}
