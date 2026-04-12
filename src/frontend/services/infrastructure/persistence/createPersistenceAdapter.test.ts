import { beforeEach, describe, expect, it, vi } from 'vitest';

const firebaseAdapterMock = { kind: 'firebase' };
const indexedDbAdapterMock = { kind: 'indexeddb' };
const sqliteAdapterMock = { kind: 'sqlite' };

const isFirebaseConfiguredMock = vi.fn();
const isPublishedBrowserRuntimeMock = vi.fn();
const readPublicRuntimeEnvMock = vi.fn();

vi.mock('./firebaseConfig', () => ({
  isFirebaseConfigured: isFirebaseConfiguredMock,
}));

vi.mock('./runtimePublicEnv', () => ({
  isPublishedBrowserRuntime: isPublishedBrowserRuntimeMock,
  readPublicRuntimeEnv: readPublicRuntimeEnvMock,
}));

vi.mock('./firebasePersistenceAdapter', () => ({
  FirebasePersistenceAdapter: vi.fn(() => firebaseAdapterMock),
}));

vi.mock('./IndexedDbPersistenceAdapter', () => ({
  IndexedDbPersistenceAdapter: vi.fn(() => indexedDbAdapterMock),
}));

vi.mock('./SqlitePersistenceAdapter', () => ({
  SqlitePersistenceAdapter: vi.fn(() => sqliteAdapterMock),
}));

describe('createPersistenceAdapter', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    isFirebaseConfiguredMock.mockReturnValue(false);
    isPublishedBrowserRuntimeMock.mockReturnValue(false);
    readPublicRuntimeEnvMock.mockReturnValue('');

    const module = await import('./createPersistenceAdapter');
    module.resetPersistenceAdapter();
  });

  it('should ignore sqlite in published browser runtime and use firebase when configured', async () => {
    readPublicRuntimeEnvMock.mockImplementation((key: string) =>
      key === 'VITE_PERSISTENCE_ADAPTER' ? 'sqlite' : '',
    );
    isPublishedBrowserRuntimeMock.mockReturnValue(true);
    isFirebaseConfiguredMock.mockReturnValue(true);

    const { createPersistenceAdapter } = await import('./createPersistenceAdapter');

    expect(createPersistenceAdapter()).toBe(firebaseAdapterMock);
  });

  it('should ignore sqlite in published browser runtime and fall back to IndexedDB when Firebase is unavailable', async () => {
    readPublicRuntimeEnvMock.mockImplementation((key: string) =>
      key === 'VITE_PERSISTENCE_ADAPTER' ? 'sqlite' : '',
    );
    isPublishedBrowserRuntimeMock.mockReturnValue(true);
    isFirebaseConfiguredMock.mockReturnValue(false);

    const { createPersistenceAdapter } = await import('./createPersistenceAdapter');

    expect(createPersistenceAdapter()).toBe(indexedDbAdapterMock);
  });
});
