import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PersistenceSyncState, RealtimePersistencePort } from './persistence/PersistencePort';

const subscribeSyncStateMock = vi.fn();
const forceReconnectMock = vi.fn(async () => undefined);

const realtimeAdapter: RealtimePersistencePort = {
  isSupported: () => true,
  readSnapshot: async () => null,
  writeSnapshot: async () => undefined,
  clearSnapshot: async () => undefined,
  readEntityState: async () => null,
  writeEntityState: async () => undefined,
  readPreference: async () => null,
  writePreference: async () => undefined,
  removePreference: async () => undefined,
  listBackups: async () => [],
  writeBackup: async () => ({
    id: 'backup-1',
    createdAt: Date.now(),
    sizeBytes: 0,
    hash: 'hash',
    reason: 'manual',
  }),
  readBackup: async () => null,
  clearBackups: async () => undefined,
  reserveGlobalIdentifier: async () => ({
    reservedValue: 2500,
    nextValue: 2501,
  }),
  subscribeExternalChanges: () => () => undefined,
  subscribeSyncState: subscribeSyncStateMock,
  forceReconnect: forceReconnectMock,
  dispose: () => undefined,
};

vi.mock('./persistence', () => ({
  createPersistenceAdapter: vi.fn(() => realtimeAdapter),
  isRealtimePersistencePort: vi.fn(() => true),
}));

describe('firebaseSyncEngine', () => {
  beforeEach(async () => {
    vi.resetModules();
    subscribeSyncStateMock.mockReset();
    forceReconnectMock.mockClear();
  });

  it('should mirror sync state coming from the realtime persistence adapter', async () => {
    subscribeSyncStateMock.mockImplementation((listener: (state: PersistenceSyncState) => void) => {
      listener({
        status: 'idle',
        accessMode: 'firebase',
        lastSyncTimestamp: 123,
        errorMessage: null,
        retryScheduledAt: null,
        pendingWrites: 0,
        userEmail: 'rafael@nexus-arqui.test',
        quota: null,
      });
      return vi.fn();
    });

    const { firebaseSyncEngine } = await import('./firebaseSyncEngine');
    await firebaseSyncEngine.initialize(async () => undefined);

    expect(firebaseSyncEngine.getState()).toMatchObject({
      status: 'idle',
      accessMode: 'firebase',
      lastSyncTimestamp: 123,
    });
  });

  it('should mark domains as dirty and clear them after a force pull', async () => {
    subscribeSyncStateMock.mockImplementation((listener: (state: PersistenceSyncState) => void) => {
      listener({
        status: 'idle',
        accessMode: 'firebase',
        lastSyncTimestamp: null,
        errorMessage: null,
        retryScheduledAt: null,
        pendingWrites: 0,
        userEmail: 'rafael@nexus-arqui.test',
        quota: null,
      });
      return vi.fn();
    });

    const { firebaseSyncEngine } = await import('./firebaseSyncEngine');
    await firebaseSyncEngine.initialize(async () => undefined);

    firebaseSyncEngine.notifyDomainChanged('clients', [], [{ id: 'client-1' }]);
    expect(firebaseSyncEngine.getState().dirtyDomains).toContain('clients');

    const result = await firebaseSyncEngine.forcePull();

    expect(forceReconnectMock).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    expect(firebaseSyncEngine.getState().dirtyDomains).toEqual([]);
  });
});
