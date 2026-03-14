import type { AgendaEvent, ContractDeadlinesSettings, Reminder } from './agenda';
import type { CashBoxCredit, CashBoxExpense } from './cashBox';
import type { Client, Prospect } from './client';
import type { DocumentStorage } from './document';
import type {
  Commission,
  EmergencyFund,
  ManualIncome,
  PaymentMethod,
  ProfessionalExpense,
} from './finance';
import type { Freelancer, HiredService } from './freelancer';
import type { MarketingActivity, MarketingProfessional, SocialNetwork } from './marketing';
import type { BudgetTemplateSection, Proposal } from './proposal';
import type { Project } from './project';
import type { Product, Quotation, Supplier, SupplierProductPrice } from './supply-chain';

/** Full application state persisted to IndexedDB as a single snapshot. */
export interface AppData {
  projects: Project[];
  proposals: Proposal[];
  clients: Client[];
  documentStorage: DocumentStorage;
  suppliers: Supplier[];
  products: Product[];
  supplierProductPrices: SupplierProductPrice[];
  quotations: Quotation[];
  commissions: Commission[];
  marketingProfessionals: MarketingProfessional[];
  marketingActivities: MarketingActivity[];
  socialNetworks: SocialNetwork[];
  freelancers: Freelancer[];
  agendaEvents: AgendaEvent[];
  manualExpenses: ProfessionalExpense[];
  manualIncomes: ManualIncome[];
  customBudgetTemplate: BudgetTemplateSection[] | null;
  globalIdentifierCounter: number;
  dismissedFocusItems: string[];
  acceptedPaymentMethods: PaymentMethod[];
  hiredServices: HiredService[];
  prospects: Prospect[];
  contractDeadlines: ContractDeadlinesSettings;
  cashBoxExpenses: CashBoxExpense[];
  cashBoxCredits: CashBoxCredit[];
  emergencyFund: EmergencyFund;
  reminders: Reminder[];
}
