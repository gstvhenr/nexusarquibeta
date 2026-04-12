import { createPersistenceAdapter } from './persistence';
import { autoBackupService } from './autoBackupService';
import { migrateClients, type LegacyClientRecord } from './migrations';
import { applySeedReminders } from './seedReminders';
import { applySeedAgendaEvents } from './seedAgendaEvents';
import { applySeedProspects } from './seedProspects';
import { driveSyncEngine } from './driveSyncEngine';
import { ARRAY_DOMAIN_KEYS, SCALAR_CONFIG_KEYS } from './driveSyncTypes';
import {
  SYNCED_PREFERENCE_DEFAULTS,
  SYNCED_PREFERENCE_KEYS,
  type SyncedPreferenceKey,
} from './driveSyncPreferences';
import { uiPreferenceService } from './uiPreferenceService';
import { uiInteractionLockService } from '../uiInteractionLockService';
import type {
  AppData,
  Project,
  Proposal,
  DocumentStorage,
  Supplier,
  Product,
  SupplierProductPrice,
  Quotation,
  Commission,
  MarketingProfessional,
  MarketingActivity,
  SocialNetwork,
  Freelancer,
  AgendaEvent,
  ProfessionalExpense,
  BudgetTemplateSection,
  PaymentMethod,
  HiredService,
  Prospect,
  ContractDeadlinesSettings,
  ManualIncome,
  CashBoxExpense,
  CashBoxCredit,
  EmergencyFund,
  Reminder,
} from '../../types';
import { initialDocumentStorage, PAYMENT_METHODS } from '../../constants';

const persistence = createPersistenceAdapter();

export type { AppData };

// Keys retained for event compatibility and import/export contracts.
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
  CASHBOXEXPENSES: 'cash_box_expenses',
  CASHBOXCREDITS: 'cash_box_credits',
  EMERGENCYFUND: 'emergency_fund',
  REMINDERS: 'reminders',
};

const DATA_SYNC_CHANNEL_NAME = 'nexus_arqui_data_sync';

const DEFAULT_CONTRACT_DEADLINES: ContractDeadlinesSettings = {
  defaultPreliminarDeadlineDays: 7,
  defaultExecutiveDeadlineDays: 30,
  defaultRevisionLimit: 3,
};

const DEFAULT_EMERGENCY_FUND: EmergencyFund = {
  currentValue: 0,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asList = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const asNonNegativeNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;

const normalizeEmergencyFund = (value: unknown): EmergencyFund => {
  if (!isRecord(value)) {
    return { ...DEFAULT_EMERGENCY_FUND };
  }

  const currentValue = asNonNegativeNumber(value.currentValue, DEFAULT_EMERGENCY_FUND.currentValue);
  const targetValue =
    typeof value.targetValue === 'number' &&
    Number.isFinite(value.targetValue) &&
    value.targetValue > 0
      ? value.targetValue
      : undefined;

  return targetValue === undefined ? { currentValue } : { currentValue, targetValue };
};

const cloneSnapshot = (snapshot: AppData): AppData => {
  if (typeof structuredClone === 'function') {
    return structuredClone(snapshot);
  }
  return JSON.parse(JSON.stringify(snapshot)) as AppData;
};

const createDefaultAppData = (): AppData => ({
  projects: [],
  proposals: [],
  clients: [],
  documentStorage: initialDocumentStorage,
  suppliers: [],
  products: [],
  supplierProductPrices: [],
  quotations: [],
  commissions: [],
  marketingProfessionals: [],
  marketingActivities: [],
  socialNetworks: [],
  freelancers: [],
  agendaEvents: [],
  manualExpenses: [],
  manualIncomes: [],
  customBudgetTemplate: null,
  globalIdentifierCounter: 2500,
  dismissedFocusItems: [],
  acceptedPaymentMethods: [...PAYMENT_METHODS],
  hiredServices: [],
  prospects: [],
  contractDeadlines: { ...DEFAULT_CONTRACT_DEADLINES },
  cashBoxExpenses: [],
  cashBoxCredits: [],
  emergencyFund: { ...DEFAULT_EMERGENCY_FUND },
  reminders: [],
});

const APP_DATA_ENTITY_KEYS = Object.keys(createDefaultAppData());

const dedupeProposals = (proposals: Proposal[]): Proposal[] => {
  const seenProposalIds = new Set<string>();
  const seenProposalCodes = new Set<string>();

  return proposals.filter((proposal) => {
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
};

const normalizePersistedSnapshot = (snapshot: unknown): AppData => {
  const defaults = createDefaultAppData();
  if (!isRecord(snapshot)) {
    return defaults;
  }

  const normalized: AppData = {
    projects: asList<Project>(snapshot.projects),
    proposals: dedupeProposals(asList<Proposal>(snapshot.proposals)),
    clients: migrateClients(asList<LegacyClientRecord>(snapshot.clients)),
    documentStorage: isRecord(snapshot.documentStorage)
      ? (snapshot.documentStorage as unknown as DocumentStorage)
      : defaults.documentStorage,
    suppliers: asList<Supplier>(snapshot.suppliers),
    products: asList<Product>(snapshot.products),
    supplierProductPrices: asList<SupplierProductPrice>(snapshot.supplierProductPrices),
    quotations: asList<Quotation>(snapshot.quotations),
    commissions: asList<Commission>(snapshot.commissions),
    marketingProfessionals: asList<MarketingProfessional>(snapshot.marketingProfessionals),
    marketingActivities: asList<MarketingActivity>(snapshot.marketingActivities),
    socialNetworks: asList<SocialNetwork>(snapshot.socialNetworks),
    freelancers: asList<Freelancer>(snapshot.freelancers),
    agendaEvents: asList<AgendaEvent>(snapshot.agendaEvents),
    manualExpenses: asList<ProfessionalExpense>(snapshot.manualExpenses),
    manualIncomes: asList<ManualIncome>(snapshot.manualIncomes),
    customBudgetTemplate: Array.isArray(snapshot.customBudgetTemplate)
      ? (snapshot.customBudgetTemplate as BudgetTemplateSection[])
      : null,
    globalIdentifierCounter:
      typeof snapshot.globalIdentifierCounter === 'number' &&
      Number.isFinite(snapshot.globalIdentifierCounter)
        ? snapshot.globalIdentifierCounter
        : defaults.globalIdentifierCounter,
    dismissedFocusItems: asList<string>(snapshot.dismissedFocusItems),
    acceptedPaymentMethods: asList<PaymentMethod>(snapshot.acceptedPaymentMethods),
    hiredServices: asList<HiredService>(snapshot.hiredServices),
    prospects: asList<Prospect>(snapshot.prospects),
    contractDeadlines:
      isRecord(snapshot.contractDeadlines) &&
      typeof snapshot.contractDeadlines.defaultPreliminarDeadlineDays === 'number' &&
      typeof snapshot.contractDeadlines.defaultExecutiveDeadlineDays === 'number'
        ? {
            ...defaults.contractDeadlines,
            ...(snapshot.contractDeadlines as unknown as ContractDeadlinesSettings),
          }
        : defaults.contractDeadlines,
    cashBoxExpenses: asList<CashBoxExpense>(snapshot.cashBoxExpenses),
    cashBoxCredits: asList<CashBoxCredit>(snapshot.cashBoxCredits),
    emergencyFund: normalizeEmergencyFund(snapshot.emergencyFund),
    reminders: asList<Reminder>(snapshot.reminders),
  };

  const seededAgendaEvents = applySeedAgendaEvents(normalized.agendaEvents);
  const seededProspects = applySeedProspects(normalized.prospects);
  const seededReminders = applySeedReminders(normalized.reminders);

  normalized.agendaEvents = seededAgendaEvents.events;
  normalized.prospects = seededProspects.prospects;
  normalized.reminders = seededReminders.reminders;

  if (normalized.acceptedPaymentMethods.length === 0) {
    normalized.acceptedPaymentMethods = [...PAYMENT_METHODS];
  }

  return normalized;
};

// Singleton state in memory
let appData: AppData | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;
let persistenceQueue: Promise<void> = Promise.resolve();

const PERSIST_DEBOUNCE_MS = 300;
let pendingSnapshot: AppData | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingExternalSnapshotRefresh = false;
const pendingExternalDomainWrites = new Map<string, unknown>();
let interactionLockBound = false;
let isFlushingDeferredExternalUpdates = false;

const hasWindow = (): boolean => typeof window !== 'undefined';
const dataSyncChannel: BroadcastChannel | null =
  hasWindow() && typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(DATA_SYNC_CHANNEL_NAME)
    : null;
let syncChannelBound = false;

const notifySyncListeners = (key: string | null): void => {
  if (!hasWindow()) return;
  window.dispatchEvent(new StorageEvent('storage', { key }));
};

const flushDebouncedPersist = (): void => {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (pendingSnapshot === null) return;
  const snapshotClone = cloneSnapshot(pendingSnapshot);
  pendingSnapshot = null;
  persistenceQueue = persistenceQueue
    .then(async () => {
      await persistence.writeSnapshot(snapshotClone);
      await autoBackupService.maybeCreateAutomaticBackup(snapshotClone);
      if (dataSyncChannel) {
        dataSyncChannel.postMessage({ type: 'snapshot-updated' });
      }
    })
    .catch((error) => {
      console.error('Failed to persist AppData snapshot:', error);
    });
};

const queuePersistSnapshot = (snapshot: AppData): void => {
  pendingSnapshot = snapshot;
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(flushDebouncedPersist, PERSIST_DEBOUNCE_MS);
};

const hasQueuedExternalUpdates = (): boolean =>
  pendingExternalSnapshotRefresh || pendingExternalDomainWrites.size > 0;

const applyQueuedExternalDomainWrites = (): void => {
  if (pendingExternalDomainWrites.size === 0) {
    return;
  }

  if (!appData) {
    appData = createDefaultAppData();
  }

  let nextSnapshot = appData;
  for (const [domainKey, data] of pendingExternalDomainWrites) {
    nextSnapshot = { ...nextSnapshot, [domainKey]: data } as AppData;
  }

  pendingExternalDomainWrites.clear();
  appData = nextSnapshot;
  notifySyncListeners(null);
};

const applyPersistentSnapshotRefresh = async (): Promise<void> => {
  if (!hasWindow()) {
    return;
  }

  const persistedEntityState = await persistence.readEntityState<AppData>(APP_DATA_ENTITY_KEYS);
  if (persistedEntityState && Object.keys(persistedEntityState).length > 0) {
    appData = normalizePersistedSnapshot(persistedEntityState);
    notifySyncListeners(null);
    return;
  }

  const persistedSnapshot = await persistence.readSnapshot<AppData>();
  if (!persistedSnapshot) return;

  appData = normalizePersistedSnapshot(persistedSnapshot);
  notifySyncListeners(null);
};

const flushDeferredExternalUpdates = async (): Promise<void> => {
  if (
    isFlushingDeferredExternalUpdates ||
    uiInteractionLockService.isLocked() ||
    !hasQueuedExternalUpdates()
  ) {
    return;
  }

  isFlushingDeferredExternalUpdates = true;

  try {
    if (pendingExternalSnapshotRefresh) {
      pendingExternalSnapshotRefresh = false;
      pendingExternalDomainWrites.clear();
      await applyPersistentSnapshotRefresh();
      return;
    }

    applyQueuedExternalDomainWrites();
  } finally {
    isFlushingDeferredExternalUpdates = false;

    if (!uiInteractionLockService.isLocked() && hasQueuedExternalUpdates()) {
      void flushDeferredExternalUpdates();
    }
  }
};

const refreshFromPersistentSnapshot = async (): Promise<void> => {
  if (uiInteractionLockService.isLocked()) {
    pendingExternalSnapshotRefresh = true;
    return;
  }

  await applyPersistentSnapshotRefresh();
};

const bindSyncChannelIfNeeded = (): void => {
  if (!dataSyncChannel || syncChannelBound) return;
  dataSyncChannel.onmessage = (event: MessageEvent) => {
    if (!hasWindow()) {
      return;
    }

    const type = (event.data as { type?: string } | null)?.type;
    if (type === 'snapshot-updated') {
      void refreshFromPersistentSnapshot();
    }
  };
  syncChannelBound = true;
};

const bindInteractionLockIfNeeded = (): void => {
  if (interactionLockBound) {
    return;
  }

  uiInteractionLockService.subscribe((isLocked) => {
    if (!isLocked) {
      void flushDeferredExternalUpdates();
    }
  });

  interactionLockBound = true;
};

/**
 * Key map retained for event compatibility and legacy clear paths.
 */
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
  cashBoxExpenses: KEYS.CASHBOXEXPENSES,
  cashBoxCredits: KEYS.CASHBOXCREDITS,
  emergencyFund: KEYS.EMERGENCYFUND,
  reminders: KEYS.REMINDERS,
};

/**
 * Warm-up path: loads the persistent snapshot from IndexedDB.
 */
export async function initializeDataStore(): Promise<void> {
  bindSyncChannelIfNeeded();
  bindInteractionLockIfNeeded();

  if (isInitialized) {
    return;
  }

  if (initializationPromise) {
    await initializationPromise;
    return;
  }

  initializationPromise = (async () => {
    const persistedEntityState = await persistence.readEntityState<AppData>(APP_DATA_ENTITY_KEYS);
    if (persistedEntityState && Object.keys(persistedEntityState).length > 0) {
      appData = normalizePersistedSnapshot(persistedEntityState);
      isInitialized = true;
      startDriveSyncInBackground();
      return;
    }

    const persistedSnapshot = await persistence.readSnapshot<AppData>();
    if (persistedSnapshot) {
      appData = normalizePersistedSnapshot(persistedSnapshot);
      await persistence.writeEntityState(
        cloneSnapshot(appData) as unknown as Record<string, unknown>,
      );
      isInitialized = true;
      startDriveSyncInBackground();
      return;
    }

    appData = createDefaultAppData();
    await persistence.writeSnapshot(cloneSnapshot(appData));
    isInitialized = true;
    startDriveSyncInBackground();
  })()
    .catch((error) => {
      console.error('Failed to initialize data store:', error);
      if (!appData) {
        appData = createDefaultAppData();
      }
      isInitialized = true;
    })
    .finally(() => {
      initializationPromise = null;
    });

  await initializationPromise;
}

/**
 * Input -> Output:
 * - input: none.
 * - output: fully hydrated AppData in memory (IndexedDB-backed snapshot source of truth).
 */
export function loadData(): AppData {
  bindSyncChannelIfNeeded();
  bindInteractionLockIfNeeded();

  if (appData) {
    return cloneSnapshot(appData);
  }

  // Synchronous fallback path for tests and non-awaited call sites.
  if (!isInitialized) {
    console.warn(
      'loadData() called before initializeDataStore() completed. Returning default data.',
    );
  }
  appData = createDefaultAppData();
  queuePersistSnapshot(appData);
  return cloneSnapshot(appData);
}

/**
 * Writes an AppData field to in-memory state and queues transactional snapshot persist.
 */
export function updateData<K extends keyof AppData>(key: K, data: AppData[K]): void {
  if (!appData) {
    appData = createDefaultAppData();
  }
  const previousData = appData[key];
  appData = { ...appData, [key]: data };
  queuePersistSnapshot(appData);
  driveSyncEngine.notifyDomainChanged(key, previousData, data);
}

/**
 * Atomically replaces the entire in-memory AppData and queues a single snapshot persist.
 * Used by undo/redo to avoid per-key fan-out of persistence writes.
 */
export function replaceData(snapshot: AppData): void {
  const previousSnapshot = appData ? cloneSnapshot(appData) : createDefaultAppData();
  appData = cloneSnapshot(snapshot);
  queuePersistSnapshot(appData);

  // Notify sync engine of all domains (undo/redo changes multiple keys)
  for (const key of ARRAY_DOMAIN_KEYS) {
    driveSyncEngine.notifyDomainChanged(
      key,
      previousSnapshot[key as keyof AppData],
      appData[key as keyof AppData],
    );
  }
  for (const key of SCALAR_CONFIG_KEYS) {
    driveSyncEngine.notifyDomainChanged(
      key,
      previousSnapshot[key as keyof AppData],
      appData[key as keyof AppData],
    );
  }
}

/**
 * Reserves a new global identifier atomically in the persistent snapshot.
 */
export async function reserveGlobalIdentifierCounter(): Promise<number> {
  bindSyncChannelIfNeeded();
  await initializeDataStore();

  const reservationTask = persistenceQueue.then(async () => {
    const { reservedValue, nextValue } = await persistence.reserveGlobalIdentifier(2500);
    if (!appData) {
      appData = createDefaultAppData();
    }
    appData.globalIdentifierCounter = nextValue;

    if (dataSyncChannel) {
      dataSyncChannel.postMessage({ type: 'snapshot-updated' });
    }
    notifySyncListeners(storageKeyMap.globalIdentifierCounter);
    return reservedValue;
  });

  persistenceQueue = reservationTask
    .then(() => undefined)
    .catch((error) => {
      console.error('Failed to reserve global identifier:', error);
    });

  return reservationTask;
}

/**
 * Clears persistent snapshot state and notifies subscribers.
 */
export function resetPersistentDataAndNotify(): void {
  // Discard any pending debounced write before clearing storage.
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  pendingSnapshot = null;
  pendingExternalSnapshotRefresh = false;
  pendingExternalDomainWrites.clear();
  isFlushingDeferredExternalUpdates = false;

  const defaultSnapshot = createDefaultAppData();
  appData = defaultSnapshot;
  isInitialized = true;
  driveSyncEngine.handleLocalReset();
  persistenceQueue = persistenceQueue
    .then(async () => {
      await persistence.clearSnapshot();
      await persistence.writeSnapshot(cloneSnapshot(defaultSnapshot));
      await persistence.writeEntityState(
        cloneSnapshot(defaultSnapshot) as unknown as Record<string, unknown>,
      );
      for (const key of SYNCED_PREFERENCE_KEYS) {
        await uiPreferenceService.setItem(key, SYNCED_PREFERENCE_DEFAULTS[key], {
          source: 'system',
          silent: true,
        });
      }
    })
    .then(() => {
      if (dataSyncChannel) {
        dataSyncChannel.postMessage({ type: 'snapshot-updated' });
      }
      notifySyncListeners(null);
    })
    .catch((error) => {
      console.error('Failed to reset persistent data snapshot:', error);
      notifySyncListeners(null);
    });
}

/**
 * Force-flushes any pending debounced persistence write.
 * Useful for test teardown and pre-navigation guards.
 */
export function flushPersistence(): void {
  flushDebouncedPersist();
}

/**
 * Emits a sync notification without dropping in-memory cache.
 */
export function invalidateCacheAndNotify(): void {
  notifySyncListeners(null);
}

/**
 * Resets ALL module-level singleton state for test isolation.
 * Must be called in afterEach() to prevent state leaking between test cases.
 *
 * @internal Test-only — not part of the public API contract.
 */
export function resetForTest(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  pendingSnapshot = null;
  pendingExternalSnapshotRefresh = false;
  pendingExternalDomainWrites.clear();
  appData = null;
  isInitialized = false;
  initializationPromise = null;
  persistenceQueue = Promise.resolve();
  syncChannelBound = false;
  interactionLockBound = false;
  isFlushingDeferredExternalUpdates = false;
  uiInteractionLockService.resetForTest();
  driveSyncEngine.destroy();
}

// ---------------------------------------------------------------------------
// Drive Sync Engine integration
// ---------------------------------------------------------------------------

/**
 * Starts the Drive Sync Engine in a non-blocking background task.
 * Called after local data is loaded and the app is ready.
 */
function startDriveSyncInBackground(): void {
  const readLocal = async (domainKey: string): Promise<unknown> => {
    if (!appData) return null;
    return (appData as unknown as Record<string, unknown>)[domainKey] ?? null;
  };

  const writeLocal = async (domainKey: string, data: unknown): Promise<void> => {
    if (uiInteractionLockService.isLocked()) {
      pendingExternalDomainWrites.set(domainKey, data);
      return;
    }

    if (!appData) appData = createDefaultAppData();
    appData = { ...appData, [domainKey]: data } as AppData;
    notifySyncListeners(domainKey);
  };

  const readPreference = async (key: SyncedPreferenceKey): Promise<unknown> =>
    uiPreferenceService.getItem(key, SYNCED_PREFERENCE_DEFAULTS[key]);

  const writePreference = async (key: SyncedPreferenceKey, value: unknown): Promise<void> => {
    await uiPreferenceService.setItem(key, value, { source: 'remote' });
  };

  // Fire and forget — sync errors are handled internally by the engine
  driveSyncEngine
    .initialize(readLocal, writeLocal, readPreference, writePreference)
    .catch((error) => {
      console.warn('[loadData] Drive sync initialization failed (non-blocking):', error);
    });
}
