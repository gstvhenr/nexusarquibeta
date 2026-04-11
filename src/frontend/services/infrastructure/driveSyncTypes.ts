/**
 * Input -> Output:
 * - input: none.
 * - output: type definitions for the Drive Sync Engine.
 */

/** Overall sync status of the engine. */
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline' | 'initializing';

/** Resolved direction for a single domain sync cycle. */
export type SyncDirection = 'push' | 'pull' | 'none';

/** Access mode for Drive operations. */
export type DriveAccessMode = 'local' | 'api' | 'none';

/** Metadata for a single domain stored in _meta.json. */
export interface DomainSyncMeta {
  checksum: string;
  lastModified: number;
  recordCount: number;
  sizeBytes: number;
}

/** Structure of the _meta.json file on Drive. */
export interface SyncMetaFile {
  version: number;
  lastFullSync: string;
  domains: Record<string, DomainSyncMeta>;
}

/** State exposed by the sync engine for UI consumption. */
export interface StorageQuota {
  limitBytes: number;
  usageBytes: number;
}

export interface SyncEngineState {
  status: SyncStatus;
  accessMode: DriveAccessMode;
  lastSyncTimestamp: number | null;
  dirtyDomains: string[];
  errorMessage: string | null;
  quota: StorageQuota | null;
}

/** Listener callback for sync engine state changes. */
export type SyncEngineListener = (state: SyncEngineState) => void;

/** Mapping from AppData key to the JSON filename on Drive. */
export const DOMAIN_FILE_MAP: Record<string, string> = {
  clients: 'clients.json',
  projects: 'projects.json',
  proposals: 'proposals.json',
  suppliers: 'suppliers.json',
  products: 'products.json',
  supplierProductPrices: 'supplier-product-prices.json',
  quotations: 'quotations.json',
  commissions: 'commissions.json',
  marketingProfessionals: 'marketing-professionals.json',
  marketingActivities: 'marketing-activities.json',
  socialNetworks: 'social-networks.json',
  freelancers: 'freelancers.json',
  agendaEvents: 'agenda-events.json',
  manualExpenses: 'manual-expenses.json',
  manualIncomes: 'manual-incomes.json',
  prospects: 'prospects.json',
  hiredServices: 'hired-services.json',
  cashBoxExpenses: 'cash-box-expenses.json',
  cashBoxCredits: 'cash-box-credits.json',
  reminders: 'reminders.json',
  acceptedPaymentMethods: 'accepted-payment-methods.json',
};

/** AppData keys that are array-type domains (one JSON file each). */
export const ARRAY_DOMAIN_KEYS = Object.keys(DOMAIN_FILE_MAP);

/** AppData keys that are scalar/config values grouped in config.json. */
export const SCALAR_CONFIG_KEYS = [
  'documentStorage',
  'customBudgetTemplate',
  'globalIdentifierCounter',
  'dismissedFocusItems',
  'contractDeadlines',
  'emergencyFund',
] as const;

/** Filename for grouped scalar config. */
export const CONFIG_FILE_NAME = 'config.json';

/** Filename for sync metadata. */
export const META_FILE_NAME = '_meta.json';

/** Root data folder inside the NexusArqui Drive folder. */
export const DATA_FOLDER_NAME = 'data';

/** Root files folder inside the NexusArqui Drive folder (for binaries). */
export const FILES_FOLDER_NAME = 'files';

/** Backups folder inside data/. */
export const BACKUPS_FOLDER_NAME = '_backups';
