import type { AppData } from '../services/infrastructure/api';

/** Generic setter type matching React.Dispatch<React.SetStateAction<T>>. */
export type Setter<T> = (value: T | ((prev: T) => T)) => void;

export interface CoreDataType {
  projects: AppData['projects'];
  proposals: AppData['proposals'];
  clients: AppData['clients'];
  setProjects: Setter<AppData['projects']>;
  setProposals: Setter<AppData['proposals']>;
  setClients: Setter<AppData['clients']>;
}

export interface FinanceDataType {
  commissions: AppData['commissions'];
  manualExpenses: AppData['manualExpenses'];
  manualIncomes: AppData['manualIncomes'];
  cashBoxExpenses: AppData['cashBoxExpenses'];
  cashBoxCredits: AppData['cashBoxCredits'];
  setCommissions: Setter<AppData['commissions']>;
  setManualExpenses: Setter<AppData['manualExpenses']>;
  setManualIncomes: Setter<AppData['manualIncomes']>;
  setCashBoxExpenses: Setter<AppData['cashBoxExpenses']>;
  setCashBoxCredits: Setter<AppData['cashBoxCredits']>;
}

export interface SupplyChainDataType {
  suppliers: AppData['suppliers'];
  products: AppData['products'];
  supplierProductPrices: AppData['supplierProductPrices'];
  quotations: AppData['quotations'];
  freelancers: AppData['freelancers'];
  setSuppliers: Setter<AppData['suppliers']>;
  setProducts: Setter<AppData['products']>;
  setSupplierProductPrices: Setter<AppData['supplierProductPrices']>;
  setQuotations: Setter<AppData['quotations']>;
  setFreelancers: Setter<AppData['freelancers']>;
}

export interface MarketingDataType {
  marketingProfessionals: AppData['marketingProfessionals'];
  marketingActivities: AppData['marketingActivities'];
  marketingIdeas: AppData['marketingIdeas'];
  socialNetworks: AppData['socialNetworks'];
  prospects: AppData['prospects'];
  setMarketingProfessionals: Setter<AppData['marketingProfessionals']>;
  setMarketingActivities: Setter<AppData['marketingActivities']>;
  setMarketingIdeas: Setter<AppData['marketingIdeas']>;
  setSocialNetworks: Setter<AppData['socialNetworks']>;
  setProspects: Setter<AppData['prospects']>;
}

export interface SystemDataType {
  documentStorage: AppData['documentStorage'];
  agendaEvents: AppData['agendaEvents'];
  reminders: AppData['reminders'];
  customBudgetTemplate: AppData['customBudgetTemplate'];
  globalIdentifierCounter: AppData['globalIdentifierCounter'];
  dismissedFocusItems: AppData['dismissedFocusItems'];
  acceptedPaymentMethods: AppData['acceptedPaymentMethods'];
  hiredServices: AppData['hiredServices'];
  contractDeadlines: AppData['contractDeadlines'];
  setDocumentStorage: Setter<AppData['documentStorage']>;
  setAgendaEvents: Setter<AppData['agendaEvents']>;
  setReminders: Setter<AppData['reminders']>;
  setCustomBudgetTemplate: Setter<AppData['customBudgetTemplate']>;
  setGlobalIdentifierCounter: Setter<AppData['globalIdentifierCounter']>;
  setDismissedFocusItems: Setter<AppData['dismissedFocusItems']>;
  setAcceptedPaymentMethods: Setter<AppData['acceptedPaymentMethods']>;
  setHiredServices: Setter<AppData['hiredServices']>;
  setContractDeadlines: Setter<AppData['contractDeadlines']>;
}

export interface DataHistoryContextType {
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
