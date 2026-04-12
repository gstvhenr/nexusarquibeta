import type { AppData } from '@/types';

/** Overall synchronization lifecycle state shown in the UI. */
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline' | 'initializing';

/** Access mode for the cloud persistence layer. */
export type CloudAccessMode = 'firebase' | 'none';

/** User-triggered sync action. */
export type SyncOperationAction =
  | 'flushPendingWrites'
  | 'forcePush'
  | 'forcePull'
  | 'reconnectWithRepermission';

/** Machine-readable result cause for a manual sync action. */
export type SyncOperationCause =
  | 'success'
  | 'no_changes'
  | 'no_access'
  | 'push_failed'
  | 'pull_failed'
  | 'reconnect_failed';

export interface StorageQuota {
  limitBytes: number;
  usageBytes: number;
}

export interface SyncEngineState {
  status: SyncStatus;
  accessMode: CloudAccessMode;
  lastSyncTimestamp: number | null;
  dirtyDomains: string[];
  dirtyPreferences: string[];
  errorMessage: string | null;
  quota: StorageQuota | null;
  retryScheduledAt: number | null;
  pendingChangesCount: number;
  isPaused: boolean;
}

export interface SyncOperationResult {
  ok: boolean;
  action: SyncOperationAction;
  cause: SyncOperationCause;
  accessMode: CloudAccessMode;
  message: string | null;
  performedPush: boolean;
  performedPull: boolean;
  attemptedLocalRepermission: boolean;
  attemptedApiReauth: boolean;
  pendingChangesCount: number;
}

export type SyncEngineListener = (state: SyncEngineState) => void;

export const ARRAY_DOMAIN_KEYS = [
  'projects',
  'proposals',
  'clients',
  'suppliers',
  'products',
  'supplierProductPrices',
  'quotations',
  'commissions',
  'marketingProfessionals',
  'marketingActivities',
  'socialNetworks',
  'freelancers',
  'agendaEvents',
  'manualExpenses',
  'manualIncomes',
  'acceptedPaymentMethods',
  'hiredServices',
  'prospects',
  'cashBoxExpenses',
  'cashBoxCredits',
  'reminders',
] as const satisfies ReadonlyArray<keyof AppData>;

export const IDENTIFIABLE_ARRAY_DOMAIN_KEYS = [
  'projects',
  'proposals',
  'clients',
  'suppliers',
  'products',
  'supplierProductPrices',
  'quotations',
  'commissions',
  'marketingProfessionals',
  'marketingActivities',
  'socialNetworks',
  'freelancers',
  'agendaEvents',
  'manualExpenses',
  'manualIncomes',
  'hiredServices',
  'prospects',
  'cashBoxExpenses',
  'cashBoxCredits',
  'reminders',
] as const satisfies ReadonlyArray<keyof AppData>;

export const SCALAR_CONFIG_KEYS = [
  'documentStorage',
  'customBudgetTemplate',
  'globalIdentifierCounter',
  'dismissedFocusItems',
  'contractDeadlines',
  'emergencyFund',
] as const satisfies ReadonlyArray<keyof AppData>;

export const VALUE_DOMAIN_KEYS = [
  ...SCALAR_CONFIG_KEYS,
  'acceptedPaymentMethods',
] as const satisfies ReadonlyArray<keyof AppData>;
