/**
 * Input -> Output:
 * - input: domain/preference change notifications from the local persistence layer.
 * - output: bidirectional sync between local persistence and Google Drive, with retry,
 *   lifecycle flush, reconnection and conflict handling.
 */

import { driveDataAdapter } from './driveDataAdapter';
import { driveMigrationService } from './driveMigrationService';
import { googleDriveService } from './googleDriveService';
import { localDriveService } from './localDriveService';
import {
  buildDomainDeletionTombstones,
  isIdentifiableRecordArray,
  mergeRecordArrays,
} from './driveSyncMerge';
import {
  buildSyncedPreferencesFile,
  normalizeSyncedPreferencesFile,
  SYNCED_PREFERENCE_KEYS,
  type SyncedPreferenceKey,
} from './driveSyncPreferences';
import {
  ARRAY_DOMAIN_KEYS,
  BACKUPS_FOLDER_NAME,
  DATA_FOLDER_NAME,
  FILES_FOLDER_NAME,
  SCALAR_CONFIG_KEYS,
  type DomainSyncMeta,
  type DriveAccessMode,
  type PreferenceSyncMeta,
  type SyncEngineListener,
  type SyncEngineState,
  type SyncMetaFile,
} from './driveSyncTypes';

const PUSH_DEBOUNCE_MS = 5_000;
const POLL_INTERVAL_MS = 60_000;
const RETRY_BASE_MS = 2_000;
const RETRY_MAX_MS = 30_000;
const PERSISTED_SYNC_STATE_KEY = 'nexus_drive_sync_engine_state_v2';

type ReadLocalDomainFn = (domainKey: string) => Promise<unknown>;
type WriteLocalDomainFn = (domainKey: string, data: unknown) => Promise<void>;
type ReadLocalPreferenceFn = (key: SyncedPreferenceKey) => Promise<unknown>;
type WriteLocalPreferenceFn = (key: SyncedPreferenceKey, value: unknown) => Promise<void>;

interface PersistedSyncState {
  dirtyDomains: string[];
  dirtyPreferences: SyncedPreferenceKey[];
  localMeta: SyncMetaFile | null;
  preferenceUpdatedAt: Partial<Record<SyncedPreferenceKey, number>>;
  pendingRemoteFilesCleanup: boolean;
  retryAttempt: number;
}

const dirtyDomains = new Set<string>();
const dirtyPreferences = new Set<SyncedPreferenceKey>();
const listeners = new Set<SyncEngineListener>();

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectPromise: Promise<void> | null = null;

let accessMode: DriveAccessMode = 'none';
let localMeta: SyncMetaFile | null = null;
let preferenceUpdatedAt: Partial<Record<SyncedPreferenceKey, number>> = {};
let pendingRemoteFilesCleanup = false;
let retryAttempt = 0;
let externalBindingsInitialized = false;
let externalUnsubscribers: Array<() => void> = [];

let readLocalDomain: ReadLocalDomainFn | null = null;
let writeLocalDomain: WriteLocalDomainFn | null = null;
let readLocalPreference: ReadLocalPreferenceFn | null = null;
let writeLocalPreference: WriteLocalPreferenceFn | null = null;

const engineState: SyncEngineState = {
  status: 'idle',
  accessMode: 'none',
  lastSyncTimestamp: null,
  dirtyDomains: [],
  dirtyPreferences: [],
  errorMessage: null,
  quota: null,
  retryScheduledAt: null,
  pendingChangesCount: 0,
};

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

function hasDocument(): boolean {
  return typeof document !== 'undefined';
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function normalizeMeta(meta: SyncMetaFile | null | undefined): SyncMetaFile {
  return {
    version: meta?.version ?? 2,
    lastFullSync: meta?.lastFullSync ?? new Date(0).toISOString(),
    domains: meta?.domains ?? {},
    preferences: meta?.preferences,
    tombstones: meta?.tombstones ?? {},
  };
}

function createEmptyMeta(): SyncMetaFile {
  return normalizeMeta(null);
}

function getTombstonesForDomain(domainKey: string): Record<string, number> {
  return { ...(localMeta?.tombstones?.[domainKey] ?? {}) };
}

function buildDomainMeta(
  domainData: unknown,
  checksum: string,
  lastModified: number,
): DomainSyncMeta {
  const content = JSON.stringify(domainData, null, 2);
  return {
    checksum,
    lastModified,
    recordCount: Array.isArray(domainData) ? domainData.length : 1,
    sizeBytes: new Blob([content]).size,
  };
}

function buildPreferenceMeta(
  fileContent: Record<string, unknown>,
  checksum: string,
  lastModified: number,
): PreferenceSyncMeta {
  const content = JSON.stringify(fileContent, null, 2);
  return {
    checksum,
    lastModified,
    keyCount: Object.keys(fileContent).length,
    sizeBytes: new Blob([content]).size,
  };
}

function getPendingChangesCount(): number {
  return dirtyDomains.size + dirtyPreferences.size + (pendingRemoteFilesCleanup ? 1 : 0);
}

function persistSyncState(): void {
  if (!hasWindow()) return;

  const payload: PersistedSyncState = {
    dirtyDomains: [...dirtyDomains],
    dirtyPreferences: [...dirtyPreferences],
    localMeta,
    preferenceUpdatedAt,
    pendingRemoteFilesCleanup,
    retryAttempt,
  };

  window.localStorage.setItem(PERSISTED_SYNC_STATE_KEY, JSON.stringify(payload));
}

function hydratePersistedSyncState(): void {
  if (!hasWindow()) return;

  const raw = window.localStorage.getItem(PERSISTED_SYNC_STATE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw) as PersistedSyncState;

    dirtyDomains.clear();
    for (const domainKey of parsed.dirtyDomains ?? []) {
      dirtyDomains.add(domainKey);
    }

    dirtyPreferences.clear();
    for (const key of parsed.dirtyPreferences ?? []) {
      if ((SYNCED_PREFERENCE_KEYS as readonly string[]).includes(key)) {
        dirtyPreferences.add(key as SyncedPreferenceKey);
      }
    }

    localMeta = normalizeMeta(parsed.localMeta);
    preferenceUpdatedAt = parsed.preferenceUpdatedAt ?? {};
    pendingRemoteFilesCleanup = parsed.pendingRemoteFilesCleanup ?? false;
    retryAttempt = parsed.retryAttempt ?? 0;
  } catch {
    window.localStorage.removeItem(PERSISTED_SYNC_STATE_KEY);
  }
}

function clearRetryTimer(): void {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  updateState({ retryScheduledAt: null });
}

function updateState(partial: Partial<SyncEngineState>): void {
  Object.assign(engineState, partial);
  engineState.dirtyDomains = [...dirtyDomains];
  engineState.dirtyPreferences = [...dirtyPreferences];
  engineState.pendingChangesCount = getPendingChangesCount();
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
    // Ignore quota failures
  }
}

function schedulePush(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (accessMode === 'none') {
    updateState({ status: 'offline' });
    scheduleRetry();
    return;
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void pushDirtyItems();
  }, PUSH_DEBOUNCE_MS);
}

function scheduleRetry(): void {
  if (retryTimer || getPendingChangesCount() === 0) {
    return;
  }

  const delay = Math.min(RETRY_MAX_MS, RETRY_BASE_MS * 2 ** retryAttempt);
  retryAttempt += 1;
  const retryScheduledAt = Date.now() + delay;
  updateState({ retryScheduledAt });
  persistSyncState();

  retryTimer = setTimeout(() => {
    retryTimer = null;
    updateState({ retryScheduledAt: null });
    void reconnect();
  }, delay);
}

async function performDailyBackupIfNeeded(): Promise<void> {
  const LAST_BACKUP_KEY = 'nexus_last_drive_backup';
  const todayDate = new Date().toISOString().split('T')[0];
  const lastBackupDate = hasWindow() ? window.localStorage.getItem(LAST_BACKUP_KEY) : null;

  if (
    lastBackupDate === todayDate ||
    accessMode === 'none' ||
    !readLocalDomain ||
    !readLocalPreference
  ) {
    return;
  }

  try {
    const backupObj: Record<string, unknown> = {};

    for (const key of ARRAY_DOMAIN_KEYS) {
      const data = await readLocalDomain(key);
      if (data !== undefined && data !== null) {
        backupObj[key] = data;
      }
    }

    for (const key of SCALAR_CONFIG_KEYS) {
      const data = await readLocalDomain(key);
      if (data !== undefined && data !== null) {
        backupObj[key] = data;
      }
    }

    for (const key of SYNCED_PREFERENCE_KEYS) {
      backupObj[key] = await readLocalPreference(key);
    }

    const backupContent = JSON.stringify(backupObj, null, 2);
    const backupFileName = `nexus-autobackup-${todayDate}.json`;

    await driveDataAdapter.writeRawFile(
      accessMode,
      `${DATA_FOLDER_NAME}/${BACKUPS_FOLDER_NAME}/${backupFileName}`,
      backupContent,
    );

    if (hasWindow()) {
      window.localStorage.setItem(LAST_BACKUP_KEY, todayDate);
    }
  } catch (error) {
    console.warn('[DriveSyncEngine] Failed to perform daily auto-backup.', error);
  }
}

async function pullPreferences(remoteMeta: SyncMetaFile): Promise<void> {
  if (!readLocalPreference || !writeLocalPreference) {
    return;
  }

  const remotePreferenceFile = normalizeSyncedPreferencesFile(
    await driveDataAdapter.readPreferences(accessMode),
  );

  for (const key of SYNCED_PREFERENCE_KEYS) {
    const localValue = await readLocalPreference(key);
    const localUpdatedAt = preferenceUpdatedAt[key] ?? 0;
    const remoteEntry = remotePreferenceFile[key];

    if (!remoteEntry) {
      if (localUpdatedAt > 0) {
        dirtyPreferences.add(key);
      }
      continue;
    }

    if (remoteEntry.updatedAt > localUpdatedAt) {
      if (!deepEqual(localValue, remoteEntry.value)) {
        await writeLocalPreference(key, remoteEntry.value);
      }
      preferenceUpdatedAt[key] = remoteEntry.updatedAt;
      continue;
    }

    if (localUpdatedAt > remoteEntry.updatedAt) {
      dirtyPreferences.add(key);
    }
  }

  if (remoteMeta.preferences && dirtyPreferences.size === 0) {
    localMeta = normalizeMeta(localMeta);
    localMeta.preferences = remoteMeta.preferences;
  }
}

async function pullDomains(remoteMeta: SyncMetaFile): Promise<void> {
  if (!readLocalDomain || !writeLocalDomain) {
    return;
  }

  const nextLocalMeta = normalizeMeta(localMeta ?? remoteMeta);
  nextLocalMeta.tombstones = {
    ...(remoteMeta.tombstones ?? {}),
    ...(nextLocalMeta.tombstones ?? {}),
  };

  for (const domainKey of ARRAY_DOMAIN_KEYS) {
    const remoteDomainMeta = remoteMeta.domains[domainKey];
    const localDomainMeta = nextLocalMeta.domains[domainKey];
    const localData = await readLocalDomain(domainKey);

    if (!remoteDomainMeta) {
      if (dirtyDomains.has(domainKey)) {
        continue;
      }

      delete nextLocalMeta.domains[domainKey];
      continue;
    }

    const remoteData = await driveDataAdapter.readDomain(accessMode, domainKey);
    if (remoteData === null) {
      continue;
    }

    if (localData === null || localData === undefined) {
      await writeLocalDomain(domainKey, remoteData);
      nextLocalMeta.domains[domainKey] = remoteDomainMeta;
      continue;
    }

    if (isIdentifiableRecordArray(localData) && isIdentifiableRecordArray(remoteData)) {
      const { mergedRecords, mergedTombstones } = mergeRecordArrays({
        localRecords: localData,
        remoteRecords: remoteData,
        localFallbackTimestamp: localDomainMeta?.lastModified ?? 0,
        remoteFallbackTimestamp: remoteDomainMeta.lastModified,
        localTombstones: nextLocalMeta.tombstones?.[domainKey],
        remoteTombstones: remoteMeta.tombstones?.[domainKey],
      });

      if (!deepEqual(localData, mergedRecords)) {
        await writeLocalDomain(domainKey, mergedRecords);
      }

      const mergedChecksum = driveDataAdapter.computeChecksum(
        JSON.stringify(mergedRecords, null, 2),
      );
      const remoteChecksum = remoteDomainMeta.checksum;

      nextLocalMeta.tombstones![domainKey] = mergedTombstones;
      if (mergedChecksum !== remoteChecksum) {
        dirtyDomains.add(domainKey);
        nextLocalMeta.domains[domainKey] = buildDomainMeta(
          mergedRecords,
          mergedChecksum,
          Date.now(),
        );
      } else {
        nextLocalMeta.domains[domainKey] = remoteDomainMeta;
      }

      continue;
    }

    const localChecksum = driveDataAdapter.computeChecksum(JSON.stringify(localData, null, 2));
    if (localChecksum === remoteDomainMeta.checksum) {
      nextLocalMeta.domains[domainKey] = remoteDomainMeta;
      continue;
    }

    if ((localDomainMeta?.lastModified ?? 0) > remoteDomainMeta.lastModified) {
      dirtyDomains.add(domainKey);
      continue;
    }

    await writeLocalDomain(domainKey, remoteData);
    nextLocalMeta.domains[domainKey] = remoteDomainMeta;
  }

  const remoteConfig = await driveDataAdapter.readConfig(accessMode);
  if (remoteConfig) {
    for (const key of SCALAR_CONFIG_KEYS) {
      if (key in remoteConfig) {
        await writeLocalDomain(key, remoteConfig[key]);
      }
    }
  }

  localMeta = nextLocalMeta;
}

async function pullFromRemote(remoteMeta: SyncMetaFile): Promise<void> {
  await pullDomains(remoteMeta);
  await pullPreferences(remoteMeta);
  persistSyncState();
}

async function pushDirtyItems(): Promise<void> {
  if (!readLocalDomain || !readLocalPreference) return;
  if (getPendingChangesCount() === 0) return;

  if (accessMode === 'none') {
    updateState({ status: 'offline' });
    scheduleRetry();
    return;
  }

  updateState({ status: 'syncing', errorMessage: null });

  try {
    const nextMeta = normalizeMeta(localMeta ?? createEmptyMeta());
    const domainsToPush = [...dirtyDomains];
    const preferencesToPush = [...dirtyPreferences];

    const arrayDomains = domainsToPush.filter((key) => ARRAY_DOMAIN_KEYS.includes(key));
    const scalarKeys = domainsToPush.filter((key) =>
      (SCALAR_CONFIG_KEYS as readonly string[]).includes(key),
    );

    for (const domainKey of arrayDomains) {
      const data = await readLocalDomain(domainKey);
      if (data === undefined || data === null) continue;

      const checksum = await driveDataAdapter.writeDomain(accessMode, domainKey, data);
      nextMeta.domains[domainKey] = buildDomainMeta(data, checksum, Date.now());
    }

    if (scalarKeys.length > 0) {
      const configData: Record<string, unknown> = {};
      for (const key of scalarKeys) {
        configData[key] = await readLocalDomain(key);
      }
      await driveDataAdapter.writeConfig(accessMode, configData);
    }

    if (preferencesToPush.length > 0) {
      const preferenceValues: Partial<Record<SyncedPreferenceKey, unknown>> = {};
      for (const key of SYNCED_PREFERENCE_KEYS) {
        preferenceValues[key] = await readLocalPreference(key);
      }

      const preferencePayload = buildSyncedPreferencesFile(preferenceValues, preferenceUpdatedAt);
      const checksum = await driveDataAdapter.writePreferences(accessMode, preferencePayload);
      nextMeta.preferences = buildPreferenceMeta(preferencePayload, checksum, Date.now());
    }

    if (pendingRemoteFilesCleanup) {
      await driveDataAdapter.clearFolder(accessMode, FILES_FOLDER_NAME);
      pendingRemoteFilesCleanup = false;
    }

    nextMeta.lastFullSync = new Date().toISOString();
    await driveDataAdapter.writeMeta(accessMode, nextMeta);

    localMeta = nextMeta;
    dirtyDomains.clear();
    dirtyPreferences.clear();
    retryAttempt = 0;
    clearRetryTimer();
    updateState({
      status: 'idle',
      lastSyncTimestamp: Date.now(),
      errorMessage: null,
    });
    persistSyncState();

    void performDailyBackupIfNeeded();
    await refreshQuota();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[DriveSyncEngine] Push failed:', message);
    updateState({
      status: 'error',
      errorMessage: message,
    });
    persistSyncState();
    scheduleRetry();
  }
}

async function pushAllDomains(): Promise<void> {
  for (const domainKey of ARRAY_DOMAIN_KEYS) {
    dirtyDomains.add(domainKey);
  }

  for (const key of SCALAR_CONFIG_KEYS) {
    dirtyDomains.add(key);
  }

  for (const key of SYNCED_PREFERENCE_KEYS) {
    dirtyPreferences.add(key);
    preferenceUpdatedAt[key] = preferenceUpdatedAt[key] ?? Date.now();
  }

  await pushDirtyItems();
}

async function reconnect(): Promise<void> {
  if (reconnectPromise) {
    return reconnectPromise;
  }

  reconnectPromise = (async () => {
    updateState({ status: 'initializing', errorMessage: null });
    clearRetryTimer();

    try {
      accessMode = await driveDataAdapter.detectAccessMode();
      updateState({ accessMode });

      if (accessMode === 'none') {
        updateState({ status: 'offline' });
        persistSyncState();
        if (getPendingChangesCount() > 0) {
          scheduleRetry();
        }
        return;
      }

      await driveMigrationService.migrateIfNecessary(accessMode);

      const remoteMetaRaw = await driveDataAdapter.readMeta(accessMode);
      const remoteMeta = normalizeMeta(remoteMetaRaw);

      if (!remoteMetaRaw) {
        await pushAllDomains();
      } else {
        await pullFromRemote(remoteMeta);
        if (getPendingChangesCount() > 0) {
          schedulePush();
        }
      }

      updateState({
        status: 'idle',
        lastSyncTimestamp: Date.now(),
        errorMessage: null,
      });
      persistSyncState();
      startPolling();
      await refreshQuota();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[DriveSyncEngine] Initialization failed:', message);
      updateState({
        status: 'error',
        errorMessage: message,
      });
      persistSyncState();
      scheduleRetry();
    }
  })().finally(() => {
    reconnectPromise = null;
  });

  return reconnectPromise;
}

function startPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
  }

  pollTimer = setInterval(async () => {
    if (engineState.status === 'syncing' || accessMode === 'none') {
      return;
    }

    try {
      const remoteMetaRaw = await driveDataAdapter.readMeta(accessMode);
      if (!remoteMetaRaw) {
        return;
      }

      const remoteMeta = normalizeMeta(remoteMetaRaw);
      const localPreferencesModifiedAt = localMeta?.preferences?.lastModified ?? 0;
      const remotePreferencesModifiedAt = remoteMeta.preferences?.lastModified ?? 0;

      let hasNewerRemoteData = remotePreferencesModifiedAt > localPreferencesModifiedAt;

      for (const domainKey of ARRAY_DOMAIN_KEYS) {
        const remoteDomainMeta = remoteMeta.domains[domainKey];
        const localDomainMeta = localMeta?.domains[domainKey];

        if (!remoteDomainMeta) continue;

        if (!localDomainMeta || remoteDomainMeta.lastModified > localDomainMeta.lastModified) {
          hasNewerRemoteData = true;
          break;
        }
      }

      if (hasNewerRemoteData) {
        updateState({ status: 'syncing' });
        await pullFromRemote(remoteMeta);
        updateState({ status: 'idle', lastSyncTimestamp: Date.now() });
        if (getPendingChangesCount() > 0) {
          schedulePush();
        }
      }
    } catch (error) {
      console.error('[DriveSyncEngine] Polling error:', error);
    }
  }, POLL_INTERVAL_MS);
}

function bindExternalObservers(): void {
  if (externalBindingsInitialized) {
    return;
  }

  externalBindingsInitialized = true;

  externalUnsubscribers.push(
    googleDriveService.subscribe((driveState) => {
      if (driveState.status === 'connected' || driveState.status === 'disconnected') {
        void reconnect();
      }
    }),
  );

  externalUnsubscribers.push(
    localDriveService.subscribe(() => {
      void reconnect();
    }),
  );

  if (hasWindow()) {
    const handleOnline = () => {
      void reconnect();
    };
    const handleOffline = () => {
      updateState({ status: 'offline' });
    };
    const handlePageHide = () => {
      void flushPendingWrites();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pagehide', handlePageHide);

    externalUnsubscribers.push(() => window.removeEventListener('online', handleOnline));
    externalUnsubscribers.push(() => window.removeEventListener('offline', handleOffline));
    externalUnsubscribers.push(() => window.removeEventListener('pagehide', handlePageHide));
  }

  if (hasDocument()) {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void flushPendingWrites();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    externalUnsubscribers.push(() =>
      document.removeEventListener('visibilitychange', handleVisibilityChange),
    );
  }
}

async function initialize(
  readLocal: ReadLocalDomainFn,
  writeLocal: WriteLocalDomainFn,
  readPreference: ReadLocalPreferenceFn,
  writePreference: WriteLocalPreferenceFn,
): Promise<void> {
  readLocalDomain = readLocal;
  writeLocalDomain = writeLocal;
  readLocalPreference = readPreference;
  writeLocalPreference = writePreference;

  hydratePersistedSyncState();
  bindExternalObservers();
  await reconnect();
}

function notifyDomainChanged(
  domainKey: string,
  previousValue?: unknown,
  nextValue?: unknown,
): void {
  const now = Date.now();
  dirtyDomains.add(domainKey);
  localMeta = normalizeMeta(localMeta);

  if (
    ARRAY_DOMAIN_KEYS.includes(domainKey) &&
    previousValue !== undefined &&
    nextValue !== undefined
  ) {
    localMeta.tombstones![domainKey] = buildDomainDeletionTombstones(
      previousValue,
      nextValue,
      getTombstonesForDomain(domainKey),
      now,
    );

    if (nextValue !== undefined && nextValue !== null) {
      const checksum = driveDataAdapter.computeChecksum(JSON.stringify(nextValue, null, 2));
      localMeta.domains[domainKey] = buildDomainMeta(nextValue, checksum, now);
    }
  }

  updateState({});
  persistSyncState();
  schedulePush();
}

function notifyPreferenceChanged(key: string): void {
  if (!(SYNCED_PREFERENCE_KEYS as readonly string[]).includes(key)) {
    return;
  }

  const typedKey = key as SyncedPreferenceKey;
  dirtyPreferences.add(typedKey);
  preferenceUpdatedAt[typedKey] = Date.now();
  updateState({});
  persistSyncState();
  schedulePush();
}

function handleLocalReset(): void {
  localMeta = createEmptyMeta();
  pendingRemoteFilesCleanup = true;

  for (const domainKey of ARRAY_DOMAIN_KEYS) {
    dirtyDomains.add(domainKey);
  }

  for (const key of SCALAR_CONFIG_KEYS) {
    dirtyDomains.add(key);
  }

  for (const key of SYNCED_PREFERENCE_KEYS) {
    dirtyPreferences.add(key);
    preferenceUpdatedAt[key] = Date.now();
  }

  updateState({});
  persistSyncState();
  schedulePush();
}

async function flushPendingWrites(): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  if (accessMode === 'none' && getPendingChangesCount() > 0) {
    await reconnectWithRepermission();
    if (accessMode === 'none') return;
  }

  await pushDirtyItems();
}

async function forcePush(): Promise<void> {
  if (accessMode === 'none') {
    await reconnectWithRepermission();
    if (accessMode === 'none') return;
  }
  await flushPendingWrites();
}

async function forcePull(): Promise<void> {
  if (accessMode === 'none') {
    await reconnectWithRepermission();
    if (accessMode === 'none') return;
  }

  updateState({ status: 'syncing', errorMessage: null });
  try {
    const remoteMetaRaw = await driveDataAdapter.readMeta(accessMode);
    if (remoteMetaRaw) {
      await pullFromRemote(normalizeMeta(remoteMetaRaw));
    }
    updateState({ status: 'idle', lastSyncTimestamp: Date.now() });
    if (getPendingChangesCount() > 0) {
      schedulePush();
    }
    await refreshQuota();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    updateState({ status: 'error', errorMessage: message });
    scheduleRetry();
  }
}

function getAccessMode(): DriveAccessMode {
  return accessMode;
}

async function reconnectWithRepermission(): Promise<boolean> {
  updateState({ status: 'initializing', errorMessage: null });

  try {
    const newMode = await driveDataAdapter.tryReacquireLocalAccess();

    if (newMode === 'none') {
      updateState({ status: 'offline', accessMode: 'none' });
      scheduleRetry();
      return false;
    }

    accessMode = newMode;
    updateState({ accessMode });
    await reconnect();
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[DriveSyncEngine] Reconnection failed:', message);
    updateState({
      status: 'error',
      errorMessage: message,
    });
    scheduleRetry();
    return false;
  }
}

function getState(): SyncEngineState {
  return { ...engineState };
}

function subscribe(listener: SyncEngineListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function destroy(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (pollTimer) clearInterval(pollTimer);
  if (retryTimer) clearTimeout(retryTimer);

  debounceTimer = null;
  pollTimer = null;
  retryTimer = null;
  reconnectPromise = null;
  listeners.clear();

  externalUnsubscribers.forEach((unsubscribe) => unsubscribe());
  externalUnsubscribers = [];
  externalBindingsInitialized = false;
}

export const driveSyncEngine = {
  initialize,
  reconnect,
  notifyDomainChanged,
  notifyPreferenceChanged,
  handleLocalReset,
  flushPendingWrites,
  forcePush,
  forcePull,
  getAccessMode,
  reconnectWithRepermission,
  getState,
  subscribe,
  destroy,
};
