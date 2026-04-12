/**
 * Input -> Output:
 * - input: persistence operations (read/write snapshots, entities, preferences, backups).
 * - output: backend-agnostic contract for any storage adapter (IndexedDB, SQLite, etc.).
 * Example:
 *   const adapter = createPersistenceAdapter();
 *   const snapshot = await adapter.readSnapshot<AppData>();
 */

/** Metadata returned after writing a backup (payload excluded for memory efficiency). */
export interface BackupMetadata {
  id: string;
  createdAt: number;
  sizeBytes: number;
  hash: string;
  reason: 'auto' | 'manual';
}

/** Full backup record including the payload. */
export interface BackupRecord<T> {
  id: string;
  createdAt: number;
  payload: T;
  sizeBytes: number;
  hash: string;
  reason: 'auto' | 'manual';
}

/** Options for writing a backup entry. */
export interface WriteBackupOptions {
  reason?: 'auto' | 'manual';
  maxEntries?: number;
  id?: string;
}

/** Result of an atomic counter reservation. */
export interface CounterReservationResult {
  reservedValue: number;
  nextValue: number;
}

/** External remote/local-cache change propagated by realtime adapters. */
export type PersistenceExternalChangeEvent =
  | {
      kind: 'domain';
      domainKey: string;
      value: unknown;
    }
  | {
      kind: 'preference';
      key: string;
      value: unknown | null;
    };

/** Minimal sync state surfaced by realtime adapters. */
export interface PersistenceSyncState {
  status: 'initializing' | 'idle' | 'syncing' | 'offline' | 'error';
  accessMode: 'firebase' | 'none';
  lastSyncTimestamp: number | null;
  errorMessage: string | null;
  retryScheduledAt: number | null;
  pendingWrites: number;
  userEmail: string | null;
  quota: {
    limitBytes: number;
    usageBytes: number;
  } | null;
}

/**
 * Abstract persistence contract.
 *
 * Any storage backend (IndexedDB, SQLite, REST, etc.) implements this
 * interface so that the rest of the application remains storage-agnostic.
 */
export interface PersistencePort {
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /** Whether the underlying storage engine is available in this environment. */
  isSupported(): boolean;

  // ---------------------------------------------------------------------------
  // Snapshot (full AppData read/write)
  // ---------------------------------------------------------------------------

  /** Read the persisted application snapshot, or null if none exists. */
  readSnapshot<T>(): Promise<T | null>;

  /** Write a full application snapshot to persistent storage. */
  writeSnapshot<T>(snapshot: T): Promise<void>;

  /** Delete the persisted snapshot and entity state. */
  clearSnapshot(): Promise<void>;

  // ---------------------------------------------------------------------------
  // Entity state (per-entity read/write)
  // ---------------------------------------------------------------------------

  /** Read per-entity state slices, optionally filtered by entity keys. */
  readEntityState<T>(entities?: string[]): Promise<Partial<T> | null>;

  /** Write per-entity state slices to persistent storage. */
  writeEntityState(state: Record<string, unknown>): Promise<void>;

  // ---------------------------------------------------------------------------
  // UI Preferences
  // ---------------------------------------------------------------------------

  /** Read a single UI preference by key. */
  readPreference<T>(key: string): Promise<T | null>;

  /** Write a single UI preference by key. */
  writePreference<T>(key: string, value: T): Promise<void>;

  /** Remove a single UI preference by key. */
  removePreference(key: string): Promise<void>;

  // ---------------------------------------------------------------------------
  // Backups
  // ---------------------------------------------------------------------------

  /** List all backup metadata entries (newest first, payload excluded). */
  listBackups(): Promise<BackupMetadata[]>;

  /** Write a new backup entry with retention enforcement. */
  writeBackup<T>(payload: T, options?: WriteBackupOptions): Promise<BackupMetadata>;

  /** Read a specific backup by ID, including its payload. */
  readBackup<T>(id: string): Promise<BackupRecord<T> | null>;

  /** Delete all backup entries. */
  clearBackups(): Promise<void>;

  // ---------------------------------------------------------------------------
  // Counter reservation (atomic)
  // ---------------------------------------------------------------------------

  /** Atomically reserve a global identifier and return the reserved + next value. */
  reserveGlobalIdentifier(defaultCounter?: number): Promise<CounterReservationResult>;
}

/**
 * Optional realtime extension for remote-first backends such as Firebase.
 *
 * Consumers must feature-detect via `isRealtimePersistencePort()` before using it.
 */
export interface RealtimePersistencePort extends PersistencePort {
  subscribeExternalChanges(listener: (event: PersistenceExternalChangeEvent) => void): () => void;
  subscribeSyncState(listener: (state: PersistenceSyncState) => void): () => void;
  forceReconnect(): Promise<void>;
  dispose(): void;
}

export function isRealtimePersistencePort(
  value: PersistencePort,
): value is RealtimePersistencePort {
  return (
    typeof (value as RealtimePersistencePort).subscribeExternalChanges === 'function' &&
    typeof (value as RealtimePersistencePort).subscribeSyncState === 'function' &&
    typeof (value as RealtimePersistencePort).forceReconnect === 'function' &&
    typeof (value as RealtimePersistencePort).dispose === 'function'
  );
}
