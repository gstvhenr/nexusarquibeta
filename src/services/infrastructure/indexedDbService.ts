const DB_NAME = 'nexus_arqui_app_db';
const DB_VERSION = 2;
const SNAPSHOT_STORE = 'app_snapshots';
const SNAPSHOT_KEY = 'current';
const ENTITY_STATE_STORE = 'app_entity_state';
const PREFERENCES_STORE = 'ui_preferences';
const AUTOMATIC_BACKUPS_STORE = 'app_auto_backups';
const GLOBAL_IDENTIFIER_ENTITY_KEY = 'globalIdentifierCounter';

const isBrowser = typeof window !== 'undefined';
let volatileSnapshotFallback: unknown | null = null;
let volatileEntityStateFallback: Record<string, unknown> = {};
const volatilePreferencesFallback: Record<string, unknown> = {};
let volatileAutomaticBackupsFallback: AutomaticBackupRecord<unknown>[] = [];

const hasIndexedDb = (): boolean =>
  isBrowser && typeof window.indexedDB !== 'undefined' && window.indexedDB !== null;

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) {
        db.createObjectStore(SNAPSHOT_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ENTITY_STATE_STORE)) {
        const entityStore = db.createObjectStore(ENTITY_STATE_STORE, { keyPath: 'entity' });
        entityStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(PREFERENCES_STORE)) {
        const preferencesStore = db.createObjectStore(PREFERENCES_STORE, { keyPath: 'key' });
        preferencesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(AUTOMATIC_BACKUPS_STORE)) {
        const backupsStore = db.createObjectStore(AUTOMATIC_BACKUPS_STORE, { keyPath: 'id' });
        backupsStore.createIndex('createdAt', 'createdAt', { unique: false });
        backupsStore.createIndex('reason', 'reason', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB.'));
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const cloneValue = <T>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const awaitTransaction = (tx: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

const serializePayload = (payload: unknown): string => {
  try {
    return JSON.stringify(payload) ?? '';
  } catch {
    return '';
  }
};

const countUtf8Bytes = (text: string): number => new Blob([text]).size;

const hashPayload = (payload: unknown): string => {
  const text = serializePayload(payload);
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16);
};

type SnapshotRecord<T> = {
  id: typeof SNAPSHOT_KEY;
  payload: T;
  updatedAt: number;
};

type EntityStateRecord = {
  entity: string;
  payload: unknown;
  updatedAt: number;
};

type PreferenceRecord = {
  key: string;
  value: unknown;
  updatedAt: number;
};

export type AutomaticBackupRecord<T> = {
  id: string;
  createdAt: number;
  payload: T;
  sizeBytes: number;
  hash: string;
  reason: 'auto' | 'manual';
};

export type AutomaticBackupMetadata = Omit<AutomaticBackupRecord<unknown>, 'payload'>;

type CounterReservationResult = {
  reservedValue: number;
  nextValue: number;
};

const fallbackReadSnapshot = <T>(): T | null => {
  if (volatileSnapshotFallback === null) return null;
  return cloneValue(volatileSnapshotFallback as T);
};

const fallbackWriteSnapshot = <T>(snapshot: T): void => {
  volatileSnapshotFallback = cloneValue(snapshot);
  if (isRecord(snapshot)) {
    volatileEntityStateFallback = {
      ...volatileEntityStateFallback,
      ...Object.fromEntries(
        Object.entries(snapshot).map(([entity, payload]) => [entity, cloneValue(payload)]),
      ),
    };
  }
};

const fallbackClearSnapshot = (): void => {
  volatileSnapshotFallback = null;
  volatileEntityStateFallback = {};
};

const fallbackReadEntityState = <T>(entities?: string[]): Partial<T> | null => {
  const entries = entities
    ? entities
        .filter((entity) => entity in volatileEntityStateFallback)
        .map((entity) => [entity, volatileEntityStateFallback[entity]])
    : Object.entries(volatileEntityStateFallback);
  if (entries.length === 0) return null;
  return cloneValue(Object.fromEntries(entries) as Partial<T>);
};

const fallbackWriteEntityState = (state: Record<string, unknown>): void => {
  if (Object.keys(state).length === 0) return;
  volatileEntityStateFallback = {
    ...volatileEntityStateFallback,
    ...Object.fromEntries(
      Object.entries(state).map(([entity, payload]) => [entity, cloneValue(payload)]),
    ),
  };
};

const fallbackReadPreference = <T>(key: string): T | null => {
  if (!(key in volatilePreferencesFallback)) return null;
  return cloneValue(volatilePreferencesFallback[key] as T);
};

const fallbackWritePreference = <T>(key: string, value: T): void => {
  volatilePreferencesFallback[key] = cloneValue(value);
};

const fallbackRemovePreference = (key: string): void => {
  delete volatilePreferencesFallback[key];
};

const fallbackReadAutomaticBackups = (): AutomaticBackupRecord<unknown>[] =>
  cloneValue(volatileAutomaticBackupsFallback).sort((a, b) => b.createdAt - a.createdAt);

const fallbackWriteAutomaticBackup = <T>(
  backup: AutomaticBackupRecord<T>,
  maxEntries: number,
): void => {
  volatileAutomaticBackupsFallback.unshift(cloneValue(backup) as AutomaticBackupRecord<unknown>);
  volatileAutomaticBackupsFallback.sort((a, b) => b.createdAt - a.createdAt);
  if (volatileAutomaticBackupsFallback.length > maxEntries) {
    volatileAutomaticBackupsFallback = volatileAutomaticBackupsFallback.slice(0, maxEntries);
  }
};

const fallbackReadAutomaticBackup = <T>(id: string): AutomaticBackupRecord<T> | null => {
  const record = volatileAutomaticBackupsFallback.find((entry) => entry.id === id);
  return record ? cloneValue(record as AutomaticBackupRecord<T>) : null;
};

const fallbackClearAutomaticBackups = (): void => {
  volatileAutomaticBackupsFallback = [];
};

const runReadSnapshotTransaction = async <T>(): Promise<T | null> => {
  const db = await openDatabase();
  try {
    const tx = db.transaction(SNAPSHOT_STORE, 'readonly');
    const store = tx.objectStore(SNAPSHOT_STORE);
    const request = store.get(SNAPSHOT_KEY);
    const record = await new Promise<SnapshotRecord<T> | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as SnapshotRecord<T> | undefined);
      request.onerror = () => reject(request.error);
    });
    await awaitTransaction(tx);
    return record?.payload ?? null;
  } finally {
    db.close();
  }
};

const runWriteSnapshotTransaction = async <T>(snapshot: T): Promise<void> => {
  const db = await openDatabase();
  try {
    const tx = db.transaction([SNAPSHOT_STORE, ENTITY_STATE_STORE], 'readwrite');
    const snapshotStore = tx.objectStore(SNAPSHOT_STORE);
    snapshotStore.put({
      id: SNAPSHOT_KEY,
      payload: snapshot,
      updatedAt: Date.now(),
    } satisfies SnapshotRecord<T>);

    if (isRecord(snapshot)) {
      const entityStore = tx.objectStore(ENTITY_STATE_STORE);
      Object.entries(snapshot).forEach(([entity, payload]) => {
        entityStore.put({
          entity,
          payload,
          updatedAt: Date.now(),
        } satisfies EntityStateRecord);
      });
    }

    await awaitTransaction(tx);
  } finally {
    db.close();
  }
};

const runClearSnapshotTransaction = async (): Promise<void> => {
  const db = await openDatabase();
  try {
    const tx = db.transaction([SNAPSHOT_STORE, ENTITY_STATE_STORE], 'readwrite');
    tx.objectStore(SNAPSHOT_STORE).delete(SNAPSHOT_KEY);
    tx.objectStore(ENTITY_STATE_STORE).clear();
    await awaitTransaction(tx);
  } finally {
    db.close();
  }
};

const runReadEntityStateTransaction = async <T>(
  entities?: string[],
): Promise<Partial<T> | null> => {
  const db = await openDatabase();
  try {
    const tx = db.transaction(ENTITY_STATE_STORE, 'readonly');
    const store = tx.objectStore(ENTITY_STATE_STORE);

    const records = await new Promise<EntityStateRecord[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result as EntityStateRecord[]) ?? []);
      request.onerror = () => reject(request.error);
    });

    await awaitTransaction(tx);

    const filteredRecords = Array.isArray(entities)
      ? records.filter((record) => entities.includes(record.entity))
      : records;

    if (filteredRecords.length === 0) {
      return null;
    }

    return filteredRecords.reduce<Partial<T>>((acc, record) => {
      return {
        ...acc,
        [record.entity]: record.payload,
      };
    }, {});
  } finally {
    db.close();
  }
};

const runWriteEntityStateTransaction = async (state: Record<string, unknown>): Promise<void> => {
  const entries = Object.entries(state);
  if (entries.length === 0) return;

  const db = await openDatabase();
  try {
    const tx = db.transaction(ENTITY_STATE_STORE, 'readwrite');
    const store = tx.objectStore(ENTITY_STATE_STORE);
    entries.forEach(([entity, payload]) => {
      store.put({
        entity,
        payload,
        updatedAt: Date.now(),
      } satisfies EntityStateRecord);
    });

    await awaitTransaction(tx);
  } finally {
    db.close();
  }
};

const runReadPreferenceTransaction = async <T>(key: string): Promise<T | null> => {
  const db = await openDatabase();
  try {
    const tx = db.transaction(PREFERENCES_STORE, 'readonly');
    const store = tx.objectStore(PREFERENCES_STORE);
    const request = store.get(key);
    const record = await new Promise<PreferenceRecord | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as PreferenceRecord | undefined);
      request.onerror = () => reject(request.error);
    });

    await awaitTransaction(tx);

    return (record?.value as T | undefined) ?? null;
  } finally {
    db.close();
  }
};

const runWritePreferenceTransaction = async <T>(key: string, value: T): Promise<void> => {
  const db = await openDatabase();
  try {
    const tx = db.transaction(PREFERENCES_STORE, 'readwrite');
    const store = tx.objectStore(PREFERENCES_STORE);
    store.put({ key, value, updatedAt: Date.now() } satisfies PreferenceRecord);

    await awaitTransaction(tx);
  } finally {
    db.close();
  }
};

const runRemovePreferenceTransaction = async (key: string): Promise<void> => {
  const db = await openDatabase();
  try {
    const tx = db.transaction(PREFERENCES_STORE, 'readwrite');
    tx.objectStore(PREFERENCES_STORE).delete(key);

    await awaitTransaction(tx);
  } finally {
    db.close();
  }
};

const runListAutomaticBackupsTransaction = async (): Promise<AutomaticBackupRecord<unknown>[]> => {
  const db = await openDatabase();
  try {
    const tx = db.transaction(AUTOMATIC_BACKUPS_STORE, 'readonly');
    const store = tx.objectStore(AUTOMATIC_BACKUPS_STORE);

    const records = await new Promise<AutomaticBackupRecord<unknown>[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result as AutomaticBackupRecord<unknown>[]) ?? []);
      request.onerror = () => reject(request.error);
    });

    await awaitTransaction(tx);

    return records.sort((a, b) => b.createdAt - a.createdAt);
  } finally {
    db.close();
  }
};

const runReadAutomaticBackupTransaction = async <T>(
  id: string,
): Promise<AutomaticBackupRecord<T> | null> => {
  const db = await openDatabase();
  try {
    const tx = db.transaction(AUTOMATIC_BACKUPS_STORE, 'readonly');
    const store = tx.objectStore(AUTOMATIC_BACKUPS_STORE);

    const record = await new Promise<AutomaticBackupRecord<T> | undefined>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result as AutomaticBackupRecord<T> | undefined);
      request.onerror = () => reject(request.error);
    });

    await awaitTransaction(tx);

    return record ?? null;
  } finally {
    db.close();
  }
};

const runWriteAutomaticBackupTransaction = async <T>(
  backup: AutomaticBackupRecord<T>,
  maxEntries: number,
): Promise<void> => {
  const db = await openDatabase();
  try {
    const tx = db.transaction(AUTOMATIC_BACKUPS_STORE, 'readwrite');
    const store = tx.objectStore(AUTOMATIC_BACKUPS_STORE);

    store.put(backup as AutomaticBackupRecord<unknown>);

    const records = await new Promise<AutomaticBackupRecord<unknown>[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result as AutomaticBackupRecord<unknown>[]) ?? []);
      request.onerror = () => reject(request.error);
    });

    records
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(maxEntries)
      .forEach((record) => {
        store.delete(record.id);
      });

    await awaitTransaction(tx);
  } finally {
    db.close();
  }
};

const runClearAutomaticBackupsTransaction = async (): Promise<void> => {
  const db = await openDatabase();
  try {
    const tx = db.transaction(AUTOMATIC_BACKUPS_STORE, 'readwrite');
    tx.objectStore(AUTOMATIC_BACKUPS_STORE).clear();

    await awaitTransaction(tx);
  } finally {
    db.close();
  }
};

const runReserveGlobalIdentifierTransaction = async (
  defaultCounter: number,
): Promise<CounterReservationResult> => {
  const db = await openDatabase();
  try {
    const tx = db.transaction([ENTITY_STATE_STORE, SNAPSHOT_STORE], 'readwrite');
    const entityStore = tx.objectStore(ENTITY_STATE_STORE);
    const snapshotStore = tx.objectStore(SNAPSHOT_STORE);

    const entityRequest = entityStore.get(GLOBAL_IDENTIFIER_ENTITY_KEY);
    const entityRecord = await new Promise<EntityStateRecord | undefined>((resolve, reject) => {
      entityRequest.onsuccess = () =>
        resolve(entityRequest.result as EntityStateRecord | undefined);
      entityRequest.onerror = () => reject(entityRequest.error);
    });

    const snapshotRequest = snapshotStore.get(SNAPSHOT_KEY);
    const snapshotRecord = await new Promise<SnapshotRecord<unknown> | undefined>(
      (resolve, reject) => {
        snapshotRequest.onsuccess = () =>
          resolve(snapshotRequest.result as SnapshotRecord<unknown> | undefined);
        snapshotRequest.onerror = () => reject(snapshotRequest.error);
      },
    );

    const entityCounter = entityRecord?.payload;
    const snapshotCounter = isRecord(snapshotRecord?.payload)
      ? snapshotRecord.payload.globalIdentifierCounter
      : undefined;

    const reservedValue =
      typeof entityCounter === 'number' && Number.isFinite(entityCounter)
        ? entityCounter
        : typeof snapshotCounter === 'number' && Number.isFinite(snapshotCounter)
          ? snapshotCounter
          : defaultCounter;

    const nextValue = reservedValue + 1;

    entityStore.put({
      entity: GLOBAL_IDENTIFIER_ENTITY_KEY,
      payload: nextValue,
      updatedAt: Date.now(),
    } satisfies EntityStateRecord);

    if (isRecord(snapshotRecord?.payload)) {
      snapshotStore.put({
        id: SNAPSHOT_KEY,
        payload: {
          ...snapshotRecord.payload,
          globalIdentifierCounter: nextValue,
        },
        updatedAt: Date.now(),
      } satisfies SnapshotRecord<Record<string, unknown>>);
    }

    await awaitTransaction(tx);

    return { reservedValue, nextValue };
  } finally {
    db.close();
  }
};

export const indexedDbService = {
  isSupported(): boolean {
    return hasIndexedDb();
  },

  async readSnapshot<T>(): Promise<T | null> {
    if (!hasIndexedDb()) {
      return fallbackReadSnapshot<T>();
    }
    try {
      return await runReadSnapshotTransaction<T>();
    } catch (error) {
      console.error('Failed to read IndexedDB snapshot:', error);
      return fallbackReadSnapshot<T>();
    }
  },

  async writeSnapshot<T>(snapshot: T): Promise<void> {
    if (!hasIndexedDb()) {
      fallbackWriteSnapshot(snapshot);
      return;
    }
    try {
      await runWriteSnapshotTransaction(snapshot);
    } catch (error) {
      console.error('Failed to write IndexedDB snapshot:', error);
      fallbackWriteSnapshot(snapshot);
    }
  },

  async clearSnapshot(): Promise<void> {
    if (!hasIndexedDb()) {
      fallbackClearSnapshot();
      return;
    }
    try {
      await runClearSnapshotTransaction();
      fallbackClearSnapshot();
    } catch (error) {
      console.error('Failed to clear IndexedDB snapshot:', error);
      fallbackClearSnapshot();
    }
  },

  async readEntityState<T>(entities?: string[]): Promise<Partial<T> | null> {
    if (!hasIndexedDb()) {
      return fallbackReadEntityState<T>(entities);
    }
    try {
      return await runReadEntityStateTransaction<T>(entities);
    } catch (error) {
      console.error('Failed to read entity state from IndexedDB:', error);
      return fallbackReadEntityState<T>(entities);
    }
  },

  async writeEntityState(state: Record<string, unknown>): Promise<void> {
    if (!hasIndexedDb()) {
      fallbackWriteEntityState(state);
      return;
    }
    try {
      await runWriteEntityStateTransaction(state);
    } catch (error) {
      console.error('Failed to write entity state to IndexedDB:', error);
      fallbackWriteEntityState(state);
    }
  },

  async readPreference<T>(key: string): Promise<T | null> {
    if (!hasIndexedDb()) {
      return fallbackReadPreference<T>(key);
    }
    try {
      return await runReadPreferenceTransaction<T>(key);
    } catch (error) {
      console.error('Failed to read UI preference from IndexedDB:', error);
      return fallbackReadPreference<T>(key);
    }
  },

  async writePreference<T>(key: string, value: T): Promise<void> {
    if (!hasIndexedDb()) {
      fallbackWritePreference(key, value);
      return;
    }
    try {
      await runWritePreferenceTransaction(key, value);
    } catch (error) {
      console.error('Failed to write UI preference to IndexedDB:', error);
      fallbackWritePreference(key, value);
    }
  },

  async removePreference(key: string): Promise<void> {
    if (!hasIndexedDb()) {
      fallbackRemovePreference(key);
      return;
    }
    try {
      await runRemovePreferenceTransaction(key);
      fallbackRemovePreference(key);
    } catch (error) {
      console.error('Failed to remove UI preference from IndexedDB:', error);
      fallbackRemovePreference(key);
    }
  },

  async listAutomaticBackups(): Promise<AutomaticBackupMetadata[]> {
    const mapMetadata = (backups: AutomaticBackupRecord<unknown>[]): AutomaticBackupMetadata[] =>
      backups.map(({ payload: _payload, ...metadata }) => metadata);

    if (!hasIndexedDb()) {
      return mapMetadata(fallbackReadAutomaticBackups());
    }
    try {
      const backups = await runListAutomaticBackupsTransaction();
      return mapMetadata(backups);
    } catch (error) {
      console.error('Failed to list automatic backups from IndexedDB:', error);
      return mapMetadata(fallbackReadAutomaticBackups());
    }
  },

  async readAutomaticBackup<T>(id: string): Promise<AutomaticBackupRecord<T> | null> {
    if (!hasIndexedDb()) {
      return fallbackReadAutomaticBackup<T>(id);
    }
    try {
      return await runReadAutomaticBackupTransaction<T>(id);
    } catch (error) {
      console.error('Failed to read automatic backup from IndexedDB:', error);
      return fallbackReadAutomaticBackup<T>(id);
    }
  },

  async writeAutomaticBackup<T>(
    payload: T,
    options?: { reason?: 'auto' | 'manual'; maxEntries?: number; id?: string },
  ): Promise<AutomaticBackupMetadata> {
    const reason = options?.reason ?? 'auto';
    const maxEntries =
      typeof options?.maxEntries === 'number' && options.maxEntries > 0 ? options.maxEntries : 10;
    const record: AutomaticBackupRecord<T> = {
      id: options?.id ?? `backup-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      createdAt: Date.now(),
      payload,
      sizeBytes: countUtf8Bytes(serializePayload(payload)),
      hash: hashPayload(payload),
      reason,
    };

    if (!hasIndexedDb()) {
      fallbackWriteAutomaticBackup(record, maxEntries);
      const { payload: _payload, ...metadata } = record;
      return metadata;
    }

    try {
      await runWriteAutomaticBackupTransaction(record, maxEntries);
      const { payload: _payload, ...metadata } = record;
      return metadata;
    } catch (error) {
      console.error('Failed to write automatic backup to IndexedDB:', error);
      fallbackWriteAutomaticBackup(record, maxEntries);
      const { payload: _payload, ...metadata } = record;
      return metadata;
    }
  },

  async clearAutomaticBackups(): Promise<void> {
    if (!hasIndexedDb()) {
      fallbackClearAutomaticBackups();
      return;
    }
    try {
      await runClearAutomaticBackupsTransaction();
      fallbackClearAutomaticBackups();
    } catch (error) {
      console.error('Failed to clear automatic backups from IndexedDB:', error);
      fallbackClearAutomaticBackups();
    }
  },

  async reserveGlobalIdentifier(defaultCounter = 2500): Promise<CounterReservationResult> {
    if (!hasIndexedDb()) {
      const persistedCounter = volatileEntityStateFallback[GLOBAL_IDENTIFIER_ENTITY_KEY];
      const reservedValue =
        typeof persistedCounter === 'number' && Number.isFinite(persistedCounter)
          ? persistedCounter
          : defaultCounter;
      const nextValue = reservedValue + 1;
      volatileEntityStateFallback[GLOBAL_IDENTIFIER_ENTITY_KEY] = nextValue;
      if (isRecord(volatileSnapshotFallback)) {
        volatileSnapshotFallback = {
          ...volatileSnapshotFallback,
          globalIdentifierCounter: nextValue,
        };
      }
      return { reservedValue, nextValue };
    }
    try {
      return await runReserveGlobalIdentifierTransaction(defaultCounter);
    } catch (error) {
      console.error('Failed to reserve global identifier in IndexedDB:', error);
      const persistedCounter = volatileEntityStateFallback[GLOBAL_IDENTIFIER_ENTITY_KEY];
      const reservedValue =
        typeof persistedCounter === 'number' && Number.isFinite(persistedCounter)
          ? persistedCounter
          : defaultCounter;
      const nextValue = reservedValue + 1;
      volatileEntityStateFallback[GLOBAL_IDENTIFIER_ENTITY_KEY] = nextValue;
      return { reservedValue, nextValue };
    }
  },
};
