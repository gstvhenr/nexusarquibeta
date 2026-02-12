import { storageService } from './storageService';
import type {
  Project,
  Proposal,
  Client,
  DocumentStorage,
  Supplier,
  Product,
  SupplierProductPrice,
  Quotation,
  Commission,
  MarketingProfessional,
  MarketingActivity,
  MarketingIdea,
  SocialNetwork,
  Freelancer,
  AgendaEvent,
  ProfessionalExpense,
  BudgetTemplateSection,
  PaymentMethod,
  ClientContact,
  HiredService,
  Prospect,
  ContractDeadlinesSettings,
  ManualIncome,
  ClientStatus,
} from '../../types';
import { initialDocumentStorage, PAYMENT_METHODS } from '../../constants';
import { v4 as uuidv4 } from 'uuid';

// This file centralizes all data access and mutations.
// Keys for localStorage
const KEYS = {
  PROJECTS: 'projects',
  PROPOSALS: 'proposals',
  CLIENTS: 'clients',
  DOCUMENTSTORAGE: 'documentStorage',
  SUPPLIERS: 'suppliers',
  PRODUCTS: 'products',
  SUPPLIERPRODUCTPRICES: 'supplier_product_prices',
  QUOTATIONS: 'quotations',
  COMMISSIONS: 'commissions',
  MARKETINGPROFESSIONALS: 'marketing_professionals',
  MARKETINGACTIVITIES: 'marketing_activities',
  MARKETINGIDEAS: 'marketing_ideas',
  SOCIALNETWORKS: 'social_networks',
  FREELANCERS: 'freelancers',
  AGENDAEVENTS: 'agenda_events',
  MANUALEXPENSES: 'manual_expenses',
  MANUALINCOMES: 'manual_incomes',
  CUSTOMBUDGETTEMPLATE: 'customBudgetTemplate',
  GLOBALIDENTIFIERCOUNTER: 'globalIdentifierCounter',
  DISMISSEDFOCUSITEMS: 'dismissed_focus_items',
  ACCEPTEDPAYMENTMETHODS: 'accepted_payment_methods',
  HIREDSERVICES: 'hiredServices',
  PROSPECTS: 'prospects',
  CONTRACTDEADLINES: 'contract_deadlines',
};

// Type for the entire application state
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
  marketingIdeas: MarketingIdea[];
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
}

// Singleton state in memory
let appData: AppData | null = null;

const COUNTER_LOCK_KEY = '__nexus_global_identifier_lock__';
const COUNTER_LOCK_TTL_MS = 1500;
const COUNTER_LOCK_MAX_WAIT_MS = 250;
const COUNTER_LOCK_RETRY_MS = 8;

type CounterLockPayload = {
  token: string;
  expiresAt: number;
};

const readCounterLock = (): CounterLockPayload | null => {
  try {
    const raw = window.localStorage.getItem(COUNTER_LOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CounterLockPayload;
    if (!parsed || typeof parsed.token !== 'string' || typeof parsed.expiresAt !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeCounterLock = (payload: CounterLockPayload): void => {
  try {
    window.localStorage.setItem(COUNTER_LOCK_KEY, JSON.stringify(payload));
  } catch {
    // Ignore lock write failures and fallback to best-effort counter reservation.
  }
};

const clearCounterLock = (): void => {
  try {
    window.localStorage.removeItem(COUNTER_LOCK_KEY);
  } catch {
    // Ignore lock cleanup failures.
  }
};

const waitMs = (duration: number): void => {
  const end = Date.now() + duration;
  while (Date.now() < end) {
    // Busy-wait: tiny lock contention window for synchronous API compatibility.
  }
};

const tryAcquireCounterLock = (token: string): boolean => {
  const now = Date.now();
  const currentLock = readCounterLock();

  if (currentLock && currentLock.expiresAt > now && currentLock.token !== token) {
    return false;
  }

  writeCounterLock({ token, expiresAt: now + COUNTER_LOCK_TTL_MS });
  const confirmed = readCounterLock();
  return confirmed?.token === token;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isValidContractDeadlineSettings = (value: unknown): value is ContractDeadlinesSettings =>
  isRecord(value) &&
  typeof value.defaultPreliminarDeadlineDays === 'number' &&
  Number.isFinite(value.defaultPreliminarDeadlineDays) &&
  value.defaultPreliminarDeadlineDays >= 0 &&
  typeof value.defaultExecutiveDeadlineDays === 'number' &&
  Number.isFinite(value.defaultExecutiveDeadlineDays) &&
  value.defaultExecutiveDeadlineDays >= 0;

const canAcceptImportedValue = <K extends keyof AppData>(
  key: K,
  value: unknown,
  currentValue: AppData[K],
): value is AppData[K] => {
  if (key === 'customBudgetTemplate') {
    return value === null || Array.isArray(value);
  }

  if (key === 'contractDeadlines') {
    return isValidContractDeadlineSettings(value);
  }

  if (Array.isArray(currentValue)) {
    return Array.isArray(value);
  }

  if (typeof currentValue === 'number') {
    return typeof value === 'number' && Number.isFinite(value);
  }

  if (typeof currentValue === 'object') {
    return isRecord(value);
  }

  return typeof value === typeof currentValue;
};

type LegacyClientRecord = Record<string, unknown> & {
  id?: string;
  name?: string;
  phone?: string;
  phoneHasWhatsApp?: boolean;
  contacts?: ClientContact[];
  address?: Partial<Client['address']>;
  registrationDate?: string;
  lastContactDate?: string;
  clientType?: Client['clientType'];
  meetings?: unknown[];
  projectLinks?: unknown[];
  auditLog?: unknown[];
};

type SeedClientData = {
  id: string;
  Nome: string;
  CPF?: string;
  Email?: string;
  Telefone?: string;
  WhatsApp?: string;
  Logradouro?: string;
  Numero?: string;
  Complemento?: string;
  Bairro?: string;
  Cidade?: string;
  Estado?: string;
  CEP?: string;
  StatusCliente: ClientStatus;
  StatusPipeline?: string;
  FonteLead?: string;
  ServicosInteresse?: string;
};

const migrateClients = (clients: LegacyClientRecord[]): Client[] => {
  if (!clients || !Array.isArray(clients)) return [];

  const migratedClients = clients.map((client) => {
    let updatedClient = { ...client };

    // Migration 1: phone/phoneHasWhatsApp to contacts array
    if ((!Array.isArray(client.contacts) || client.contacts.length === 0) && client.phone) {
      updatedClient.contacts = [
        {
          id: uuidv4(),
          phone: client.phone,
          hasWhatsApp: !!client.phoneHasWhatsApp,
          isPrimary: true,
        },
      ];
      delete updatedClient.phone;
      delete updatedClient.phoneHasWhatsApp;
    } else if (!Array.isArray(client.contacts)) {
      updatedClient.contacts = [];
    }

    // Migration 2: Add registrationDate
    if (!client.registrationDate) {
      updatedClient.registrationDate = client.lastContactDate || new Date().toISOString();
    }

    // Migration 3: Add number to address
    if (client.address && typeof client.address.number === 'undefined') {
      updatedClient.address = { ...client.address, number: '' };
    }

    // Migration 4: Ensure clientType exists (default to PF if missing)
    if (!updatedClient.clientType) {
      updatedClient.clientType = 'PF';
    }

    return updatedClient as unknown as Client;
  });

  return migratedClients;
};

// Helper to create client objects from the provided list
const createSeedClient = (data: SeedClientData): Client => {
  const contacts: ClientContact[] = [];
  if (data.Telefone) {
    contacts.push({
      id: `contact_${data.id}_1`,
      phone: data.Telefone,
      hasWhatsApp: data.WhatsApp === 'Sim',
      isPrimary: true,
    });
  }

  return {
    id: data.id,
    name: data.Nome,
    cpfCnpj: data.CPF || '',
    email: data.Email || '',
    contacts: contacts,
    address: {
      street: data.Logradouro || '',
      number: data.Numero || '',
      complement: data.Complemento || '',
      neighborhood: data.Bairro || '',
      city: data.Cidade || '',
      state: data.Estado || '',
      zip: data.CEP || '',
    },
    status: data.StatusCliente as ClientStatus,
    pipelineStatus: data.StatusPipeline || 'Contato Inicial',
    leadSource: data.FonteLead || 'Não informado',
    serviceInterests: data.ServicosInteresse ? [data.ServicosInteresse] : [],
    registrationDate: '2026-01-11T09:00:00.000Z', // 11/01/2026
    lastContactDate: '2026-01-11T09:00:00.000Z',
    clientType: 'PF',
    birthDate: '',
    isFavorite: false,
    isUrgent: false,
    meetings: [],
    behavioralProfile: { notes: '' },
    archived: data.StatusCliente === 'Cliente Desabilitado',
    representative: { name: '', relationship: '', role: '' },
    auditLog: [],
    projectLinks: [],
    generalNotes: '',
  };
};

// Initialize state from localStorage
function loadData(): AppData {
  if (appData) {
    return appData;
  }

  // Helper to safely get array from storage
  const getList = <T>(key: string): T[] => {
    const val = storageService.getItem<T[]>(key, []);
    return Array.isArray(val) ? val : [];
  };

  let rawClients = storageService.getItem<LegacyClientRecord[]>(KEYS.CLIENTS, []);
  let clientsChanged = false;

  // 1. Remove obsolete mock clients
  const initialLength = rawClients.length;
  rawClients = rawClients.filter(
    (c) => c.id !== 'mock_client_gustavo' && c.name !== 'Gustavo Henrique Geraldo',
  );
  if (rawClients.length !== initialLength) clientsChanged = true;

  // --- SEED DATA ---

  // 1. Alexandre Belfante
  const mockAlexandre = {
    id: 'mock_client_alexandre',
    name: 'Alexandre Belfante',
    cpfCnpj: '',
    email: '',
    contacts: [
      {
        id: 'contact_alexandre_main',
        phone: '',
        hasWhatsApp: false,
        isPrimary: true,
      },
    ],
    address: {
      street: 'Rua Manoel Severino da Silva',
      number: 'S/N',
      neighborhood: 'Jardim São Carlos',
      city: 'Rafard',
      state: 'SP',
      zip: '13370-114',
      complement: '',
    },
    status: 'Potencial Cliente',
    leadSource: 'Indicação de parceiro',
    pipelineStatus: 'Negociação',
    serviceInterests: ['Projeto Arquitetônico', 'Design de Interiores'],
    isFavorite: false,
    registrationDate: new Date().toISOString(),
    lastContactDate: new Date().toISOString(),
    meetings: [],
    behavioralProfile: { notes: '' },
    archived: false,
    representative: { name: '', relationship: '', role: '' },
    projectLinks: [],
    auditLog: [],
  };

  // 2. Bruno Lacerda
  const mockBruno = {
    id: 'mock_client_bruno',
    name: 'Bruno Lacerda',
    cpfCnpj: '',
    email: '',
    contacts: [
      {
        id: 'contact_bruno_main',
        phone: '',
        hasWhatsApp: false,
        isPrimary: true,
      },
    ],
    address: {
      street: '',
      number: 'S/N',
      neighborhood: 'Jardim Flórida',
      city: 'Capivari',
      state: 'SP',
      zip: '',
      complement: '',
    },
    status: 'Potencial Cliente',
    leadSource: 'Indicação de parceiro',
    pipelineStatus: 'Enviando Proposta',
    serviceInterests: ['Projeto Arquitetônico'],
    isFavorite: false,
    registrationDate: new Date().toISOString(),
    lastContactDate: new Date().toISOString(),
    meetings: [],
    behavioralProfile: { notes: '' },
    archived: false,
    representative: { name: '', relationship: '', role: '' },
    projectLinks: [],
    auditLog: [],
  };

  // Process Alexandre
  const alexandreIndex = rawClients.findIndex((c) => c.id === 'mock_client_alexandre');
  if (alexandreIndex === -1) {
    rawClients = [mockAlexandre, ...rawClients];
    clientsChanged = true;
  } else {
    const current = rawClients[alexandreIndex];
    const needsUpdate =
      current.name !== 'Alexandre Belfante' || current.status !== 'Potencial Cliente';
    if (needsUpdate) {
      rawClients[alexandreIndex] = {
        ...current,
        ...mockAlexandre,
        meetings: current.meetings?.length ? current.meetings : mockAlexandre.meetings,
        projectLinks: current.projectLinks?.length
          ? current.projectLinks
          : mockAlexandre.projectLinks,
        auditLog: current.auditLog?.length ? current.auditLog : mockAlexandre.auditLog,
      };
      clientsChanged = true;
    }
  }

  // Process Bruno
  const brunoIndex = rawClients.findIndex((c) => c.id === 'mock_client_bruno');
  if (brunoIndex === -1) {
    rawClients = [mockBruno, ...rawClients];
    clientsChanged = true;
  } else {
    const current = rawClients[brunoIndex];
    const needsUpdate =
      current.name !== 'Bruno Lacerda' ||
      current.pipelineStatus !== 'Enviando Proposta' ||
      current.address?.neighborhood !== 'Jardim Flórida' ||
      current.address?.city !== 'Capivari';

    if (needsUpdate) {
      rawClients[brunoIndex] = {
        ...current,
        ...mockBruno,
        meetings: current.meetings?.length ? current.meetings : mockBruno.meetings,
        projectLinks: current.projectLinks?.length ? current.projectLinks : mockBruno.projectLinks,
        auditLog: current.auditLog?.length ? current.auditLog : mockBruno.auditLog,
      };
      clientsChanged = true;
    }
  }

  if (clientsChanged) {
    storageService.setItem(KEYS.CLIENTS, rawClients);
  }

  const migratedClients = migrateClients(rawClients);
  const rawProposals = getList<Proposal>(KEYS.PROPOSALS);
  const seenProposalIds = new Set<string>();
  const seenProposalCodes = new Set<string>();
  const dedupedProposals = rawProposals.filter((proposal) => {
    const normalizedId = proposal.id?.trim?.() || proposal.id || '';
    const normalizedCode = proposal.code?.trim?.() || proposal.code || '';

    if (
      (normalizedId && seenProposalIds.has(normalizedId)) ||
      (normalizedCode && seenProposalCodes.has(normalizedCode))
    ) {
      return false;
    }
    if (normalizedId) seenProposalIds.add(normalizedId);
    if (normalizedCode) seenProposalCodes.add(normalizedCode);
    return true;
  });
  if (dedupedProposals.length !== rawProposals.length) {
    storageService.setItem(KEYS.PROPOSALS, dedupedProposals);
  }
  const customBudgetTemplate = storageService.getItem<BudgetTemplateSection[] | null>(
    KEYS.CUSTOMBUDGETTEMPLATE,
    null,
  );

  appData = {
    projects: getList<Project>(KEYS.PROJECTS),
    proposals: dedupedProposals,
    clients: migratedClients,
    documentStorage: storageService.getItem<DocumentStorage>(
      KEYS.DOCUMENTSTORAGE,
      initialDocumentStorage,
    ),
    suppliers: getList<Supplier>(KEYS.SUPPLIERS),
    products: getList<Product>(KEYS.PRODUCTS),
    supplierProductPrices: getList<SupplierProductPrice>(KEYS.SUPPLIERPRODUCTPRICES),
    quotations: getList<Quotation>(KEYS.QUOTATIONS),
    commissions: getList<Commission>(KEYS.COMMISSIONS),
    marketingProfessionals: getList<MarketingProfessional>(KEYS.MARKETINGPROFESSIONALS),
    marketingActivities: getList<MarketingActivity>(KEYS.MARKETINGACTIVITIES),
    marketingIdeas: getList<MarketingIdea>(KEYS.MARKETINGIDEAS),
    socialNetworks: getList<SocialNetwork>(KEYS.SOCIALNETWORKS),
    freelancers: getList<Freelancer>(KEYS.FREELANCERS),
    agendaEvents: getList<AgendaEvent>(KEYS.AGENDAEVENTS),
    manualExpenses: getList<ProfessionalExpense>(KEYS.MANUALEXPENSES),
    manualIncomes: getList<ManualIncome>(KEYS.MANUALINCOMES),
    customBudgetTemplate: Array.isArray(customBudgetTemplate) ? customBudgetTemplate : null,
    globalIdentifierCounter: storageService.getItem<number>(KEYS.GLOBALIDENTIFIERCOUNTER, 2500),
    dismissedFocusItems: getList<string>(KEYS.DISMISSEDFOCUSITEMS),
    acceptedPaymentMethods: getList<PaymentMethod>(KEYS.ACCEPTEDPAYMENTMETHODS),
    hiredServices: getList<HiredService>(KEYS.HIREDSERVICES),
    prospects: getList<Prospect>(KEYS.PROSPECTS),
    contractDeadlines: storageService.getItem<ContractDeadlinesSettings>(KEYS.CONTRACTDEADLINES, {
      defaultPreliminarDeadlineDays: 7,
      defaultExecutiveDeadlineDays: 30,
    }),
  };

  if (appData.acceptedPaymentMethods.length === 0) {
    appData.acceptedPaymentMethods = [...PAYMENT_METHODS];
  }

  return appData;
}

function invalidateCacheAndNotify() {
  appData = null; // Invalidate cache
  window.dispatchEvent(new StorageEvent('storage', { key: null })); // Signal a full reset
}

// Public API for data access and mutation
/**
 * Input -> Output:
 * - input: mutações e leituras de `AppData` em memória/localStorage.
 * - output: snapshot consistente de dados e operações de import/export.
 * Example:
 * const data = api.getAllData();
 */
export const api = {
  getData: (): AppData => loadData(),

  updateData<K extends keyof AppData>(key: K, data: AppData[K]): void {
    const memoryData = loadData();
    memoryData[key] = data;

    const storageKeyMap: { [P in keyof AppData]: string } = {
      projects: KEYS.PROJECTS,
      proposals: KEYS.PROPOSALS,
      clients: KEYS.CLIENTS,
      documentStorage: KEYS.DOCUMENTSTORAGE,
      suppliers: KEYS.SUPPLIERS,
      products: KEYS.PRODUCTS,
      supplierProductPrices: KEYS.SUPPLIERPRODUCTPRICES,
      quotations: KEYS.QUOTATIONS,
      commissions: KEYS.COMMISSIONS,
      marketingProfessionals: KEYS.MARKETINGPROFESSIONALS,
      marketingActivities: KEYS.MARKETINGACTIVITIES,
      marketingIdeas: KEYS.MARKETINGIDEAS,
      socialNetworks: KEYS.SOCIALNETWORKS,
      freelancers: KEYS.FREELANCERS,
      agendaEvents: KEYS.AGENDAEVENTS,
      manualExpenses: KEYS.MANUALEXPENSES,
      manualIncomes: KEYS.MANUALINCOMES,
      customBudgetTemplate: KEYS.CUSTOMBUDGETTEMPLATE,
      globalIdentifierCounter: KEYS.GLOBALIDENTIFIERCOUNTER,
      dismissedFocusItems: KEYS.DISMISSEDFOCUSITEMS,
      acceptedPaymentMethods: KEYS.ACCEPTEDPAYMENTMETHODS,
      hiredServices: KEYS.HIREDSERVICES,
      prospects: KEYS.PROSPECTS,
      contractDeadlines: KEYS.CONTRACTDEADLINES,
    };

    const storageKey = storageKeyMap[key];
    if (storageKey) {
      storageService.setItem(storageKey, data);
    }
  },

  exportData: (): string => {
    const data = loadData();
    const exportableData = { ...data };
    return JSON.stringify(exportableData, null, 2);
  },

  importData: (jsonString: string): void => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (error) {
      console.error('Invalid JSON while importing data:', error);
      throw new Error('JSON inválido para importação de dados.');
    }

    if (!isRecord(parsed)) {
      throw new Error('Formato inválido. O conteúdo importado deve ser um objeto JSON.');
    }

    const importedData = parsed as Partial<AppData>;
    const currentData = loadData();

    (Object.keys(currentData) as (keyof AppData)[]).forEach((key) => {
      const incomingValue = importedData[key];
      if (incomingValue === undefined) return;

      if (!canAcceptImportedValue(key, incomingValue, currentData[key])) {
        console.warn(`Ignoring invalid imported key: ${String(key)}`);
        return;
      }

      api.updateData(key, incomingValue);
    });

    invalidateCacheAndNotify();
  },

  reserveGlobalIdentifier: (): number => {
    const lockToken = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const lockStart = Date.now();

    while (!tryAcquireCounterLock(lockToken)) {
      if (Date.now() - lockStart >= COUNTER_LOCK_MAX_WAIT_MS) {
        break;
      }
      waitMs(COUNTER_LOCK_RETRY_MS);
    }

    try {
      const inMemoryCounter = loadData().globalIdentifierCounter;
      const currentCounter = storageService.getItem<number>(
        KEYS.GLOBALIDENTIFIERCOUNTER,
        inMemoryCounter,
      );
      const safeCurrentCounter =
        typeof currentCounter === 'number' && Number.isFinite(currentCounter)
          ? currentCounter
          : 2500;
      const nextCounter = safeCurrentCounter + 1;

      storageService.setItem(KEYS.GLOBALIDENTIFIERCOUNTER, nextCounter);
      loadData().globalIdentifierCounter = nextCounter;
      window.dispatchEvent(new StorageEvent('storage', { key: KEYS.GLOBALIDENTIFIERCOUNTER }));

      return safeCurrentCounter;
    } finally {
      const activeLock = readCounterLock();
      if (activeLock?.token === lockToken) {
        clearCounterLock();
      }
    }
  },

  importClients: (jsonString: string): void => {
    try {
      const newClients = JSON.parse(jsonString) as Client[];
      if (!Array.isArray(newClients))
        throw new Error('Formato inválido. Esperado um array de clientes.');

      const currentData = loadData();
      const currentClients = currentData.clients;

      // Merge strategy: Update existing by ID, append new ones.
      const updatedClients = [...currentClients];

      newClients.forEach((newClient) => {
        const index = updatedClients.findIndex((c) => c.id === newClient.id);
        if (index > -1) {
          updatedClients[index] = { ...updatedClients[index], ...newClient };
        } else {
          updatedClients.push(newClient);
        }
      });

      api.updateData('clients', updatedClients);
      invalidateCacheAndNotify();
    } catch (error) {
      console.error('Error importing clients:', error);
      throw error;
    }
  },

  clearAllData: (): void => {
    Object.values(KEYS).forEach((key) => {
      storageService.removeItem(key);
    });
    invalidateCacheAndNotify();
  },
};
