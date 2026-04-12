import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppData } from './loadData';
import type {
  BackupMetadata,
  BackupRecord,
  CounterReservationResult,
  PersistenceExternalChangeEvent,
  PersistenceSyncState,
  RealtimePersistencePort,
  WriteBackupOptions,
} from './persistence/PersistencePort';

const firebaseSyncEngineMock = {
  initialize: vi.fn(async () => undefined),
  notifyDomainChanged: vi.fn(),
  notifyPreferenceChanged: vi.fn(),
  handleLocalReset: vi.fn(),
  destroy: vi.fn(),
};

vi.mock('./firebaseSyncEngine', () => ({
  firebaseSyncEngine: firebaseSyncEngineMock,
}));

type LoadDataModule = typeof import('./loadData');
type PersistenceModule = typeof import('./persistence');

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function createMemoryPersistenceAdapter(): {
  adapter: RealtimePersistencePort;
  stats: {
    snapshotWrites: number;
    entityWrites: number;
  };
  emitExternalDomainChange: (domainKey: string, value: unknown) => void;
} {
  let snapshot: unknown | null = null;
  let entityState: Record<string, unknown> = {};
  const preferences = new Map<string, unknown>();
  const backups = new Map<string, BackupRecord<unknown>>();
  const externalChangeListeners = new Set<(event: PersistenceExternalChangeEvent) => void>();
  const syncStateListeners = new Set<(state: PersistenceSyncState) => void>();
  const stats = {
    snapshotWrites: 0,
    entityWrites: 0,
  };

  const cloneBackupMetadata = (backup: BackupRecord<unknown>): BackupMetadata => ({
    id: backup.id,
    createdAt: backup.createdAt,
    sizeBytes: backup.sizeBytes,
    hash: backup.hash,
    reason: backup.reason,
  });

  const adapter: RealtimePersistencePort = {
    isSupported: () => true,
    readSnapshot: async <T>() => (snapshot === null ? null : cloneValue(snapshot as T)),
    writeSnapshot: async <T>(nextSnapshot: T) => {
      snapshot = cloneValue(nextSnapshot);
      stats.snapshotWrites += 1;
    },
    clearSnapshot: async () => {
      snapshot = null;
      entityState = {};
    },
    readEntityState: async <T>(entities?: string[]) => {
      const source =
        entities && entities.length > 0
          ? Object.fromEntries(
              entities
                .filter((entityKey) => Object.hasOwn(entityState, entityKey))
                .map((entityKey) => [entityKey, cloneValue(entityState[entityKey])]),
            )
          : cloneValue(entityState);

      return Object.keys(source).length > 0 ? (source as Partial<T>) : null;
    },
    writeEntityState: async (nextState: Record<string, unknown>) => {
      for (const [entityKey, value] of Object.entries(nextState)) {
        entityState[entityKey] = cloneValue(value);
      }

      stats.entityWrites += 1;
    },
    readPreference: async <T>(key: string) =>
      preferences.has(key) ? cloneValue(preferences.get(key) as T) : null,
    writePreference: async <T>(key: string, value: T) => {
      preferences.set(key, cloneValue(value));
    },
    removePreference: async (key: string) => {
      preferences.delete(key);
    },
    listBackups: async () =>
      Array.from(backups.values())
        .map(cloneBackupMetadata)
        .sort((a, b) => b.createdAt - a.createdAt),
    writeBackup: async <T>(payload: T, options?: WriteBackupOptions) => {
      const id = options?.id ?? `backup-${backups.size + 1}`;
      const content = JSON.stringify(payload);
      const record: BackupRecord<T> = {
        id,
        createdAt: Date.now(),
        payload: cloneValue(payload),
        sizeBytes: new Blob([content]).size,
        hash: `hash-${id}`,
        reason: options?.reason ?? 'manual',
      };

      backups.set(id, record as BackupRecord<unknown>);
      return cloneBackupMetadata(record as BackupRecord<unknown>);
    },
    readBackup: async <T>(id: string) => {
      const record = backups.get(id);
      return record ? (cloneValue(record) as BackupRecord<T>) : null;
    },
    clearBackups: async () => {
      backups.clear();
    },
    reserveGlobalIdentifier: async (defaultCounter = 2500): Promise<CounterReservationResult> => {
      const currentValue =
        typeof entityState.globalIdentifierCounter === 'number'
          ? (entityState.globalIdentifierCounter as number)
          : defaultCounter;

      const nextValue = currentValue + 1;
      entityState.globalIdentifierCounter = nextValue;

      return {
        reservedValue: currentValue,
        nextValue,
      };
    },
    subscribeExternalChanges: (listener) => {
      externalChangeListeners.add(listener);
      return () => externalChangeListeners.delete(listener);
    },
    subscribeSyncState: (listener) => {
      syncStateListeners.add(listener);
      listener({
        status: 'idle',
        accessMode: 'firebase',
        lastSyncTimestamp: null,
        errorMessage: null,
        retryScheduledAt: null,
        pendingWrites: 0,
        userEmail: 'teste@nexus-arqui.local',
        quota: null,
      });
      return () => syncStateListeners.delete(listener);
    },
    forceReconnect: async () => {
      syncStateListeners.forEach((listener) =>
        listener({
          status: 'idle',
          accessMode: 'firebase',
          lastSyncTimestamp: Date.now(),
          errorMessage: null,
          retryScheduledAt: null,
          pendingWrites: 0,
          userEmail: 'teste@nexus-arqui.local',
          quota: null,
        }),
      );
    },
    dispose: () => {
      externalChangeListeners.clear();
      syncStateListeners.clear();
    },
  };

  return {
    adapter,
    stats,
    emitExternalDomainChange: (domainKey, value) => {
      entityState[domainKey] = cloneValue(value);
      externalChangeListeners.forEach((listener) => {
        listener({
          kind: 'domain',
          domainKey,
          value,
        });
      });
    },
  };
}

async function importLoadDataWithMemoryAdapter(): Promise<{
  loadDataModule: LoadDataModule;
  persistenceModule: PersistenceModule;
  memoryAdapter: ReturnType<typeof createMemoryPersistenceAdapter>;
}> {
  vi.resetModules();
  const persistenceModule = await import('./persistence');
  const memoryAdapter = createMemoryPersistenceAdapter();
  persistenceModule.setPersistenceAdapter(memoryAdapter.adapter);
  const loadDataModule = await import('./loadData');

  return {
    loadDataModule,
    persistenceModule,
    memoryAdapter,
  };
}

let activeLoadDataModule: LoadDataModule | null = null;
let activePersistenceModule: PersistenceModule | null = null;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  activeLoadDataModule?.resetForTest();
  activePersistenceModule?.resetPersistenceAdapter();
  activeLoadDataModule = null;
  activePersistenceModule = null;
  localStorage.clear();
});

describe('loadData persistence durability', () => {
  it('should flush the pending snapshot on pagehide before the debounce elapses', async () => {
    const { loadDataModule, persistenceModule, memoryAdapter } =
      await importLoadDataWithMemoryAdapter();
    activeLoadDataModule = loadDataModule;
    activePersistenceModule = persistenceModule;

    await loadDataModule.initializeDataStore();

    const clients: AppData['clients'] = [{ id: 'client-1', name: 'Cliente Local' } as never];
    loadDataModule.updateData('clients', clients);

    expect(memoryAdapter.stats.snapshotWrites).toBe(1);

    window.dispatchEvent(new Event('pagehide'));
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(memoryAdapter.stats.snapshotWrites).toBe(2);

    const persistedSnapshot = await memoryAdapter.adapter.readSnapshot<AppData>();
    expect(persistedSnapshot?.clients).toEqual(clients);
  }, 15000);

  it('should persist remote domain writes durably before the next refresh', async () => {
    const { loadDataModule, persistenceModule, memoryAdapter } =
      await importLoadDataWithMemoryAdapter();
    activeLoadDataModule = loadDataModule;
    activePersistenceModule = persistenceModule;

    await loadDataModule.initializeDataStore();

    const remoteClients: AppData['clients'] = [
      { id: 'client-remote', name: 'Cliente Remoto' } as never,
    ];
    memoryAdapter.emitExternalDomainChange('clients', remoteClients);
    await new Promise((resolve) => setTimeout(resolve, 10));

    loadDataModule.resetForTest();
    await loadDataModule.initializeDataStore();

    expect(loadDataModule.loadData().clients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'client-remote',
          name: 'Cliente Remoto',
        }),
      ]),
    );
  });
});
