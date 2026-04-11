/**
 * Input -> Output:
 * - input: domain change notifications from loadData.ts.
 * - output: bidirectional sync between local persistence and Google Drive.
 *
 * The sync engine:
 * 1. On app start: detects access mode, pulls newer domains from Drive.
 * 2. On data change: marks domain as dirty, debounces push to Drive.
 * 3. Provides reactive state for UI (sync status, errors).
 *
 * Example:
 *   await driveSyncEngine.initialize(readLocalDomain);
 *   driveSyncEngine.notifyDomainChanged('clients');
 *   const status = driveSyncEngine.getState();
 */

import { driveDataAdapter } from './driveDataAdapter';
import { driveMigrationService } from './driveMigrationService';
import {
  ARRAY_DOMAIN_KEYS,
  SCALAR_CONFIG_KEYS,
  BACKUPS_FOLDER_NAME,
  type DriveAccessMode,
  type SyncEngineState,
  type SyncEngineListener,
  type SyncMetaFile,
  type DomainSyncMeta,
} from './driveSyncTypes';

/** How long to wait after the last mutation before pushing to Drive. */
const PUSH_DEBOUNCE_MS = 5_000;

/** How often to check for remote changes (passive polling). */
const POLL_INTERVAL_MS = 60_000;

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

const dirtyDomains = new Set<string>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let accessMode: DriveAccessMode = 'none';
let localMeta: SyncMetaFile | null = null;

const engineState: SyncEngineState = {
  status: 'idle',
  accessMode: 'none',
  lastSyncTimestamp: null,
  dirtyDomains: [],
  errorMessage: null,
  quota: null,
};

const listeners = new Set<SyncEngineListener>();

function updateState(partial: Partial<SyncEngineState>): void {
  Object.assign(engineState, partial);
  engineState.dirtyDomains = [...dirtyDomains];
  const snapshot = { ...engineState };
  listeners.forEach((listener) => listener(snapshot));
}

async function refreshQuota(): Promise<void> {
  if (accessMode === 'none') return;
  try {
    const quota = await driveDataAdapter.getStorageQuota(accessMode);
    if (quota) {
      updateState({ quota });
    }
  } catch {
    // Ignore quota errors
  }
}

// ---------------------------------------------------------------------------
// Callbacks provided by loadData.ts
// ---------------------------------------------------------------------------

/** Reads a domain's current data from the local persistence (IndexedDB/SQLite). */
type ReadLocalDomainFn = (domainKey: string) => Promise<unknown>;

/** Writes a domain's data to the local persistence from Drive. */
type WriteLocalDomainFn = (domainKey: string, data: unknown) => Promise<void>;

let readLocalDomain: ReadLocalDomainFn | null = null;
let writeLocalDomain: WriteLocalDomainFn | null = null;

// ---------------------------------------------------------------------------
// Initialize
// ---------------------------------------------------------------------------

/**
 * Initializes the sync engine. Called once at app startup.
 * Detects access mode, loads remote meta, and pulls newer domains.
 */
async function initialize(
  readLocal: ReadLocalDomainFn,
  writeLocal: WriteLocalDomainFn,
): Promise<void> {
  readLocalDomain = readLocal;
  writeLocalDomain = writeLocal;

  updateState({ status: 'initializing' });

  try {
    accessMode = await driveDataAdapter.detectAccessMode();
    updateState({ accessMode });

    if (accessMode === 'none') {
      updateState({ status: 'offline' });
      return;
    }

    // Step 1: Run migration if legacy snapshot is present
    await driveMigrationService.migrateIfNecessary(accessMode);

    // Step 2: Load remote meta
    const remoteMeta = await driveDataAdapter.readMeta(accessMode);

    if (!remoteMeta) {
      // First time — no data on Drive. Push everything.
      await pushAllDomains();
    } else {
      // Compare and pull newer domains
      localMeta = remoteMeta;
      await pullNewerDomains(remoteMeta);
    }

    updateState({
      status: 'idle',
      lastSyncTimestamp: Date.now(),
      errorMessage: null,
    });

    // Start passive polling for remote changes
    startPolling();

    // Fetch initial quota
    await refreshQuota();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[DriveSyncEngine] Initialization failed:', message);
    updateState({
      status: 'error',
      errorMessage: message,
    });
  }
}

// ---------------------------------------------------------------------------
// Pull (Drive -> Local)
// ---------------------------------------------------------------------------

/**
 * Pulls domains from Drive that are newer than the local meta.
 */
async function pullNewerDomains(remoteMeta: SyncMetaFile): Promise<void> {
  for (const domainKey of ARRAY_DOMAIN_KEYS) {
    const remoteDomainMeta = remoteMeta.domains[domainKey];
    if (!remoteDomainMeta) continue;

    const localData = await readLocalDomain!(domainKey);
    if (!localData) {
      // No local data — pull from Drive
      const remoteData = await driveDataAdapter.readDomain(accessMode, domainKey);
      if (remoteData && writeLocalDomain) {
        await writeLocalDomain(domainKey, remoteData);
      }
      continue;
    }

    // Compare checksums
    const localContent = JSON.stringify(localData, null, 2);
    const localChecksum = driveDataAdapter.computeChecksum(localContent);

    if (localChecksum !== remoteDomainMeta.checksum) {
      // Data differs — use remote (last write wins for now)
      const remoteData = await driveDataAdapter.readDomain(accessMode, domainKey);
      if (remoteData && writeLocalDomain) {
        await writeLocalDomain(domainKey, remoteData);
      }
    }
  }

  // Pull config.json for scalar values
  const remoteConfig = await driveDataAdapter.readConfig(accessMode);
  if (remoteConfig && writeLocalDomain) {
    for (const key of SCALAR_CONFIG_KEYS) {
      if (key in remoteConfig) {
        await writeLocalDomain(key, remoteConfig[key]);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Daily Auto-Backup
// ---------------------------------------------------------------------------

async function performDailyBackupIfNeeded(): Promise<void> {
  const LAST_BACKUP_KEY = 'nexus_last_drive_backup';
  const todayDate = new Date().toISOString().split('T')[0];
  const lastBackupDate = localStorage.getItem(LAST_BACKUP_KEY);

  if (lastBackupDate === todayDate) return;

  if (accessMode === 'none' || !readLocalDomain) return;

  try {
    const backupObj: Record<string, unknown> = {};

    // Gather all array domains
    for (const key of ARRAY_DOMAIN_KEYS) {
      const data = await readLocalDomain(key);
      if (data !== undefined && data !== null) {
        backupObj[key] = data;
      }
    }

    // Gather all scalar keys
    for (const key of SCALAR_CONFIG_KEYS) {
      const data = await readLocalDomain(key);
      if (data !== undefined && data !== null) {
        backupObj[key] = data;
      }
    }

    const backupContent = JSON.stringify(backupObj, null, 2);
    const backupFileName = `nexus-autobackup-${todayDate}.json`;

    await driveDataAdapter.writeRawFile(
      accessMode,
      `${BACKUPS_FOLDER_NAME}/${backupFileName}`,
      backupContent,
    );

    localStorage.setItem(LAST_BACKUP_KEY, todayDate);
  } catch (error) {
    console.warn('[DriveSyncEngine] Failed to perform daily auto-backup.', error);
  }
}

// ---------------------------------------------------------------------------
// Push (Local -> Drive)
// ---------------------------------------------------------------------------

/**
 * Pushes all dirty domains to Drive and updates _meta.json.
 */
async function pushDirtyDomains(): Promise<void> {
  if (dirtyDomains.size === 0) return;
  if (accessMode === 'none') return;
  if (!readLocalDomain) return;

  updateState({ status: 'syncing' });

  try {
    const newMeta: SyncMetaFile = localMeta ?? {
      version: 1,
      lastFullSync: new Date().toISOString(),
      domains: {},
    };

    const domainsToPush = [...dirtyDomains];

    // Separate array domains from scalar keys
    const arrayDomains = domainsToPush.filter((key) => ARRAY_DOMAIN_KEYS.includes(key));
    const scalarKeys = domainsToPush.filter((key) =>
      (SCALAR_CONFIG_KEYS as readonly string[]).includes(key),
    );

    // Push array domains
    for (const domainKey of arrayDomains) {
      const data = await readLocalDomain(domainKey);
      if (data === undefined || data === null) continue;

      const checksum = await driveDataAdapter.writeDomain(accessMode, domainKey, data);
      const content = JSON.stringify(data, null, 2);

      const domainMeta: DomainSyncMeta = {
        checksum,
        lastModified: Date.now(),
        recordCount: Array.isArray(data) ? data.length : 1,
        sizeBytes: new Blob([content]).size,
      };

      newMeta.domains[domainKey] = domainMeta;
    }

    // Push scalar config values
    if (scalarKeys.length > 0) {
      const configData: Record<string, unknown> = {};
      for (const key of scalarKeys) {
        const data = await readLocalDomain(key);
        configData[key] = data;
      }
      await driveDataAdapter.writeConfig(accessMode, configData);
    }

    // Update meta
    newMeta.lastFullSync = new Date().toISOString();
    await driveDataAdapter.writeMeta(accessMode, newMeta);
    localMeta = newMeta;

    // Clear dirty state
    for (const key of domainsToPush) {
      dirtyDomains.delete(key);
    }

    updateState({
      status: 'idle',
      lastSyncTimestamp: Date.now(),
      errorMessage: null,
    });

    // Fire-and-forget daily backup
    performDailyBackupIfNeeded();

    // Refresh quota after push
    await refreshQuota();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[DriveSyncEngine] Push failed:', message);
    updateState({
      status: 'error',
      errorMessage: message,
    });
  }
}

/**
 * Pushes ALL domains to Drive (used for first-time initialization).
 */
async function pushAllDomains(): Promise<void> {
  if (!readLocalDomain) return;

  for (const domainKey of ARRAY_DOMAIN_KEYS) {
    dirtyDomains.add(domainKey);
  }

  for (const key of SCALAR_CONFIG_KEYS) {
    dirtyDomains.add(key);
  }

  await pushDirtyDomains();
}

// ---------------------------------------------------------------------------
// Debounced push
// ---------------------------------------------------------------------------

function schedulePush(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    pushDirtyDomains().catch((error) => {
      console.error('[DriveSyncEngine] Debounced push failed:', error);
    });
  }, PUSH_DEBOUNCE_MS);
}

// ---------------------------------------------------------------------------
// Polling for remote changes
// ---------------------------------------------------------------------------

function startPolling(): void {
  if (pollTimer) clearInterval(pollTimer);

  pollTimer = setInterval(async () => {
    if (engineState.status === 'syncing') return;
    if (accessMode === 'none') return;

    try {
      const remoteMeta = await driveDataAdapter.readMeta(accessMode);
      if (!remoteMeta) return;

      // Check if remote has newer data
      let hasNewerData = false;
      for (const domainKey of ARRAY_DOMAIN_KEYS) {
        const remoteDomainMeta = remoteMeta.domains[domainKey];
        const localDomainMeta = localMeta?.domains[domainKey];

        if (!remoteDomainMeta) continue;
        if (!localDomainMeta) {
          hasNewerData = true;
          break;
        }

        if (remoteDomainMeta.lastModified > localDomainMeta.lastModified) {
          hasNewerData = true;
          break;
        }
      }

      if (hasNewerData) {
        updateState({ status: 'syncing' });
        await pullNewerDomains(remoteMeta);
        localMeta = remoteMeta;
        updateState({
          status: 'idle',
          lastSyncTimestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('[DriveSyncEngine] Polling error:', error);
    }
  }, POLL_INTERVAL_MS);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Marks a domain as changed locally. Triggers debounced push to Drive.
 */
function notifyDomainChanged(domainKey: string): void {
  dirtyDomains.add(domainKey);
  updateState({ dirtyDomains: [...dirtyDomains] });

  if (accessMode !== 'none') {
    schedulePush();
  }
}

/**
 * Forces an immediate push of all dirty domains.
 */
async function forcePush(): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  await pushDirtyDomains();
}

/**
 * Forces an immediate pull of all domains from Drive.
 */
async function forcePull(): Promise<void> {
  if (accessMode === 'none') return;

  updateState({ status: 'syncing' });
  try {
    const remoteMeta = await driveDataAdapter.readMeta(accessMode);
    if (remoteMeta) {
      await pullNewerDomains(remoteMeta);
      localMeta = remoteMeta;
    }
    updateState({ status: 'idle', lastSyncTimestamp: Date.now() });

    // Refresh quota after pull
    await refreshQuota();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    updateState({ status: 'error', errorMessage: message });
  }
}

/**
 * Returns the current sync engine state.
 */
function getState(): SyncEngineState {
  return { ...engineState };
}

/**
 * Subscribes to sync engine state changes. Returns an unsubscribe function.
 */
function subscribe(listener: SyncEngineListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Cleans up timers. Call when the app unmounts.
 */
function destroy(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (pollTimer) clearInterval(pollTimer);
  debounceTimer = null;
  pollTimer = null;
  listeners.clear();
}

export const driveSyncEngine = {
  initialize,
  notifyDomainChanged,
  forcePush,
  forcePull,
  getState,
  subscribe,
  destroy,
};
