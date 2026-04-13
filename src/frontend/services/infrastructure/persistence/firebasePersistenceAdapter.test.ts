import { beforeEach, describe, expect, it, vi } from 'vitest';

const localAdapterMock = {
  isSupported: vi.fn(() => true),
  readSnapshot: vi.fn(async () => ({ clients: [] })),
  writeSnapshot: vi.fn(async () => undefined),
  clearSnapshot: vi.fn(async () => undefined),
  readEntityState: vi.fn(async () => null),
  writeEntityState: vi.fn(async () => undefined),
  readPreference: vi.fn(async () => null),
  writePreference: vi.fn(async () => undefined),
  removePreference: vi.fn(async () => undefined),
  listBackups: vi.fn(async () => []),
  writeBackup: vi.fn(async () => ({
    id: 'backup-1',
    createdAt: Date.now(),
    sizeBytes: 0,
    hash: 'hash',
    reason: 'manual' as const,
  })),
  readBackup: vi.fn(async () => null),
  clearBackups: vi.fn(async () => undefined),
  reserveGlobalIdentifier: vi.fn(async () => ({
    reservedValue: 741,
    nextValue: 742,
  })),
};

vi.mock('./IndexedDbPersistenceAdapter', () => ({
  IndexedDbPersistenceAdapter: vi.fn(() => localAdapterMock),
}));

vi.mock('./firebaseConfig', () => ({
  ensureFirebaseReady: vi.fn(),
  getFirebaseAuth: vi.fn(() => ({
    currentUser: null,
  })),
  getFirebaseConfigurationError: vi.fn(() => 'Firebase indisponível para o teste.'),
  isFirebaseConfigured: vi.fn(() => false),
}));

describe('FirebasePersistenceAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delegate snapshot writes to IndexedDB when Firebase is not configured', async () => {
    const { FirebasePersistenceAdapter } = await import('./firebasePersistenceAdapter');
    const adapter = new FirebasePersistenceAdapter();
    const snapshot = {
      clients: [{ id: 'client-1', name: 'Cliente' }],
    };

    await adapter.writeSnapshot(snapshot);

    expect(localAdapterMock.writeSnapshot).toHaveBeenCalledWith(snapshot);
  });

  it('should delegate counter reservations to the local adapter when no user is authenticated', async () => {
    const { FirebasePersistenceAdapter } = await import('./firebasePersistenceAdapter');
    const adapter = new FirebasePersistenceAdapter();

    await expect(adapter.reserveGlobalIdentifier(3000)).resolves.toEqual({
      reservedValue: 741,
      nextValue: 742,
    });
    expect(localAdapterMock.reserveGlobalIdentifier).toHaveBeenCalledWith(3000);
  });
});
