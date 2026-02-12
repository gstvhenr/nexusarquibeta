import type { ReactNode, ReactElement } from 'react';
import type { IconName } from './components/ui/icons';

// --- Common & Navigation ---
export interface NavLinkItem {
  path?: string;
  label: string;
  icon: ReactElement<{ className?: string }>;
  iconName: IconName;
  children?: NavLinkItem[];
}

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

// --- Client Types ---
export type ClientStatus = 'Cliente Ativo' | 'Cliente Desabilitado' | 'Potencial Cliente';
export const clientStatuses: ClientStatus[] = [
  'Cliente Ativo',
  'Cliente Desabilitado',
  'Potencial Cliente',
];

export type PaymentStatus = 'Em dia' | 'Pendente' | 'Em Atraso';
export const paymentStatuses: PaymentStatus[] = ['Em dia', 'Pendente', 'Em Atraso'];

export interface ProjectMeeting {
  id: string;
  date: string;
  projectId?: string;
  projectName?: string;
  reason: string;
  notes: string;
  clientId?: string; // SQL Foreign Key Preparation
}

export interface ClientContact {
  id: string;
  phone: string;
  hasWhatsApp: boolean;
  isPrimary: boolean;
  clientId?: string; // SQL Foreign Key Preparation
}

export interface ClientLink {
  id: string;
  title: string;
  url: string;
  clientId?: string; // SQL Foreign Key Preparation
}

export interface Client {
  id: string;
  name: string;
  clientType?: 'PF' | 'PJ'; // New: Person Type
  birthDate?: string; // New: Date of Birth or Opening Date
  cpfCnpj?: string;
  representative?: {
    name: string;
    relationship: string;
    role?: string;
  };
  contacts: ClientContact[];
  email?: string;
  status: ClientStatus;
  leadSource?: string;
  serviceInterests: string[];
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  isFavorite: boolean;
  isUrgent?: boolean; // New: Priority Radar
  registrationDate: string;
  lastContactDate: string;
  pipelineStatus: string;
  meetings: ProjectMeeting[];
  generalNotes?: string;
  externalLinks?: ClientLink[];
  behavioralProfile: {
    notes: string;
  };
  archived: boolean;
  projectLinks?: {
    projectId: string;
    projectCode: string;
    projectName: string;
    status: ProjectStatus;
  }[];
  auditLog?: {
    timestamp: string;
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

// --- Prospect Types ---
export type ProspectPriority = 'Baixa' | 'Média' | 'Alta';
export type ProspectStatus = 'Em Aberto' | 'Convertido' | 'Perdido';

export interface Prospect {
  id: string;
  name: string;
  contact?: string; // Legacy field, kept for compatibility
  phone?: string;
  hasWhatsApp?: boolean;
  email?: string;
  social?: string;
  origin: string; // 'Instagram', 'Indicação', etc.
  interest: string; // 'Residencial', 'Reforma', etc.
  priority: ProspectPriority;
  status: ProspectStatus;
  createdAt: string; // ISO String
  followUpDays: number; // Max 90
  startDate: string; // Date to start counting followUpDays
  notes?: string;
  archived?: boolean;
}

// --- Document Types ---
type DocumentSourceType = 'upload' | 'link';
export type DocumentStatus = 'Em Revisão' | 'Aprovado' | 'Versão Final' | 'Obsoleto';
export const documentStatuses: DocumentStatus[] = [
  'Em Revisão',
  'Aprovado',
  'Versão Final',
  'Obsoleto',
];

export interface DocumentSource {
  id: string;
  type: DocumentSourceType;
  content: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  dateAdded: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: 'file';
  sources: DocumentSource[];
  primarySourceId: string;
  dateAdded: string;
  dateModified: string;
  tags?: string[];
  status?: DocumentStatus;
  parentId?: string; // SQL Foreign Key Preparation (Folder ID)
}

export interface DocumentFolder {
  id: string;
  name: string;
  type: 'folder';
  children: (DocumentFolder | DocumentFile)[];
  dateAdded: string;
  dateModified: string;
  projectId?: string;
  projectCode?: string;
  parentId?: string; // SQL Foreign Key Preparation (Parent Folder ID)
}

export type DocumentItem = DocumentFile | DocumentFolder;

export interface DocumentStorage {
  personal: DocumentFolder;
  projects: DocumentFolder;
}

// --- Supply Chain Types (Suppliers, Products, Quotations) ---
export type ProductUnit = 'm²' | 'un' | 'pç';

export interface SupplierContact {
  name: string;
  role?: string;
  email?: string;
  phone: string;
  hasWhatsApp: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  logo: string;
  categories: string[];
  cnpj?: string;
  address?: string;
  site?: string;
  mainContact: SupplierContact;
  paymentTerms?: string;
  shippingPolicy?: string;
  commissionPercentage?: number;
  notes?: string;
  archived: boolean;
}

export interface PriceEntry {
  date: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  unit: ProductUnit;
  category: string;
  archived: boolean;
}

export interface SupplierProductPrice {
  id: string;
  productId: string;
  supplierId: string;
  priceHistory: PriceEntry[];
}

export interface QuotationItem {
  productId: string;
  quantity: number;
}

export interface Quotation {
  id: string;
  name: string;
  date: string;
  projectId?: string;
  items: QuotationItem[];
  selections?: { [productId: string]: string };
  status: 'Em Aberto' | 'Finalizada';
  archived?: boolean;
}

// --- Finance Types (Commissions, Expenses, Payments) ---
export type PaymentMethod =
  | 'Dinheiro em espécie'
  | 'Cartão de débito'
  | 'Cartão de crédito'
  | 'PIX'
  | 'Transferência bancária'
  | 'Boleto bancário'
  | 'Pagamento Online'
  | 'Cheque';
export const paymentMethods: PaymentMethod[] = [
  'Dinheiro em espécie',
  'Cartão de débito',
  'Cartão de crédito',
  'PIX',
  'Transferência bancária',
  'Boleto bancário',
  'Pagamento Online',
  'Cheque',
];

export type CommissionStatus = 'Pendente' | 'Recebido';
export const commissionStatuses: CommissionStatus[] = ['Pendente', 'Recebido'];

export type ProfessionalExpenseStatus = 'Pendente' | 'Pago';
export const professionalExpenseStatuses: ProfessionalExpenseStatus[] = ['Pendente', 'Pago'];

export type ProfessionalExpenseCategory =
  | 'Software e Assinaturas'
  | 'Impostos (DAS, INSS)'
  | 'Anuidade de Conselho (CAU/CREA)'
  | 'Marketing e Publicidade'
  | 'Material de Escritório'
  | 'Contabilidade'
  | 'Cursos e Especializações'
  | 'Transporte e Viagens'
  | 'Aluguel de Escritório'
  | 'Serviços Terceirizados'
  | 'Reembolso a Cliente'
  | 'Outros';

export const professionalExpenseCategories: ProfessionalExpenseCategory[] = [
  'Software e Assinaturas',
  'Impostos (DAS, INSS)',
  'Anuidade de Conselho (CAU/CREA)',
  'Marketing e Publicidade',
  'Material de Escritório',
  'Contabilidade',
  'Cursos e Especializações',
  'Transporte e Viagens',
  'Aluguel de Escritório',
  'Serviços Terceirizados',
  'Reembolso a Cliente',
  'Outros',
];

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

export interface Commission {
  id: string;
  saleDate: string;
  supplierId: string;
  supplierName: string;
  clientId: string;
  clientName: string;
  saleValue: number;
  commissionPercentage: number;
  commissionValue: number;
  status: CommissionStatus;
  paymentDate?: string | null;
  notes?: string;
  expectedPaymentDate?: string | null;
  archived?: boolean;
}

export interface ProfessionalExpense {
  id: string;
  description: string;
  category: ProfessionalExpenseCategory | 'Outros';
  value: number;
  dueDate: string;
  status: ProfessionalExpenseStatus;
  paymentDate?: string | null;
  isRecurring: boolean;
  source: 'Manual' | 'Marketing' | 'Freelancer';
  marketingActivityId?: string;
  freelancerActivityId?: string;
  recurringId?: string;
  recurringEndDate?: string | null;
}

export interface ManualIncome {
  id: string;
  description: string;
  category: 'Consultoria' | 'Reembolso' | 'Rendimento' | 'Outros';
  value: number;
  date: string; // Receipt date or expected date
  status: 'Recebido' | 'Pendente';
  paymentMethod?: PaymentMethod;
  notes?: string;
}

// --- Unified Financial Domain Types ---
/** Normalized status for display in dashboards. Raw statuses ('Pago', 'Recebido') are mapped to 'Liquidado' by the service layer. */
export type TransactionStatus = 'Liquidado' | 'Vencido' | 'Em Aberto';

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
  category: ProfessionalExpenseCategory | 'Outros';
  value: number;
  dueDate: string;
  status: 'Pago' | 'Vencido' | 'Pendente';
  paymentDate?: string | null;
  isRecurring: boolean;
  source: 'Manual' | 'Marketing' | 'Freelancer';
  marketingActivityId?: string;
  freelancerActivityId?: string;
}

/** Typed recent transaction for the dashboard's "Últimas Movimentações" table. */
export interface RecentTransaction {
  id: string;
  type: 'income' | 'expense';
  date: string | null;
  description: string;
  value: number;
  status: TransactionStatus;
}

// --- Marketing Types ---
export type MarketingBillingFormat = 'Mensal' | 'Semanal' | 'Por Conteúdo' | 'Por Pacote';
export const marketingBillingFormats: MarketingBillingFormat[] = [
  'Mensal',
  'Semanal',
  'Por Conteúdo',
  'Por Pacote',
];

export type MarketingActivityStatus = 'Pendente' | 'Em Andamento' | 'Concluído';
export const marketingActivityStatuses: MarketingActivityStatus[] = [
  'Pendente',
  'Em Andamento',
  'Concluído',
];

export type MarketingContentType =
  | 'Post (Instagram)'
  | 'Carrossel (Instagram)'
  | 'Stories (Instagram)'
  | 'Reels (Instagram)'
  | 'Post (Facebook)'
  | 'Vídeo (Tik Tok)'
  | 'Post (X)'
  | 'Campanha de ADS'
  | 'Atualização de Site'
  | 'Outro';

export const marketingContentTypes: MarketingContentType[] = [
  'Post (Instagram)',
  'Carrossel (Instagram)',
  'Stories (Instagram)',
  'Reels (Instagram)',
  'Post (Facebook)',
  'Vídeo (Tik Tok)',
  'Post (X)',
  'Campanha de ADS',
  'Atualização de Site',
  'Outro',
];

export type SocialNetworkName = 'Facebook' | 'Instagram' | 'LinkedIn' | 'TikTok' | 'YouTube';

export interface MarketingProfessional {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  billingFormat?: MarketingBillingFormat;
  cost?: number;
  notes?: string;
  servicesOffered?: string[];
}

export interface MarketingActivity {
  id: string;
  title: string;
  description?: string;
  status: MarketingActivityStatus;
  contentType: MarketingContentType;
  dueDate: string | null;
  responsibleId: string;
  linkedProjectId?: string;
  linkedProjectName?: string;
  completionDate?: string | null;
  notes?: string;
  cost?: number;
}

export interface MarketingIdea {
  id: string;
  content: string;
  date: string;
  title?: string;
  color?: string;
  isFavorite?: boolean;
}

export interface SocialNetwork {
  id: SocialNetworkName;
  url: string;
  followers?: number;
  notes?: string;
  lastUpdated: string;
}

// --- Freelancer Types ---
export interface FreelancerProject {
  id: string;
  date: string;
  projectId?: string;
  projectName: string;
  description: string;
  cost: number;
  feedback: string;
}

export interface Freelancer {
  id: string;
  name: string;
  photo?: string;
  email: string;
  phone: string;
  portfolioLink?: string;
  specialties: string[];
  notes?: string;
  projects: FreelancerProject[];
  archived: boolean;
}

export type HiredServiceStatus = 'Em Andamento' | 'Concluído' | 'Cancelado';

export interface HiredService {
  id: string;
  projectId: string;
  freelancerId: string;
  taskIds: string[]; // IDs of the tasks delegated from the project
  cost: number;
  deadline: string; // YYYY-MM-DD
  status: HiredServiceStatus;
  createdAt: string; // ISO string
  archived?: boolean;
}

// --- Agenda Types ---
export type AgendaEventType =
  | 'Reunião com Cliente'
  | 'Visita à Cliente'
  | 'Reunião de Equipe'
  | 'Visita à Obra'
  | 'Visita a Fornecedor'
  | 'Compra de Materiais'
  | 'Prazo de Entrega'
  | 'Evento/Feira'
  | 'Foco Criativo'
  | 'Pessoal'
  | 'Desenvolvimento de Projeto'
  | 'Reunião de Marketing'
  | 'Gravação de Conteúdo'
  | 'Reunião com Freelancer'
  | 'Recebimento'
  | 'Pagamento de Custo'
  | 'Outro';

export const agendaEventTypes: AgendaEventType[] = [
  'Reunião com Cliente',
  'Visita à Cliente',
  'Reunião de Equipe',
  'Visita à Obra',
  'Visita a Fornecedor',
  'Compra de Materiais',
  'Prazo de Entrega',
  'Evento/Feira',
  'Foco Criativo',
  'Pessoal',
  'Desenvolvimento de Projeto',
  'Reunião de Marketing',
  'Gravação de Conteúdo',
  'Reunião com Freelancer',
  'Recebimento',
  'Pagamento de Custo',
  'Outro',
];

export type AgendaEventRecurrence = 'none' | 'weekly' | 'monthly';
export type KanbanStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  isAllDay?: boolean;
  time: string;
  timeEnd?: string;
  type: AgendaEventType;
  description?: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  priority: number;
  recurrence: AgendaEventRecurrence;
  isDeadlineEvent?: boolean;
  isFinancialEvent?: 'income' | 'expense';
  completed?: boolean;
  freelancerServiceId?: string;
  kanbanStatus?: KanbanStatus;
  archived?: boolean;
  subtasks?: Subtask[]; // Added subtasks for Kanban granularity
}

export interface ContractDeadlinesSettings {
  defaultPreliminarDeadlineDays: number;
  defaultExecutiveDeadlineDays: number;
}
