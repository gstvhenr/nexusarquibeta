import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock adapters before any imports — vi.mock is hoisted by Vitest
// ---------------------------------------------------------------------------
vi.mock('./IndexedDbPersistenceAdapter', () => ({
  IndexedDbPersistenceAdapter: vi.fn().mockImplementation(() => ({
    isSupported: vi.fn().mockReturnValue(false),
    _type: 'indexeddb',
  })),
}));

vi.mock('./SqlitePersistenceAdapter', () => ({
  SqlitePersistenceAdapter: vi.fn().mockImplementation(() => ({
    isSupported: vi.fn().mockReturnValue(true),
    _type: 'sqlite',
  })),
}));

// ---------------------------------------------------------------------------
// Module under test — imported dynamically so module cache is fresh per test
// ---------------------------------------------------------------------------
type FactoryModule = typeof import('./createPersistenceAdapter');
type AdapterModule = typeof import('./SqlitePersistenceAdapter');
type IdbModule = typeof import('./IndexedDbPersistenceAdapter');
import type { PersistencePort } from './PersistencePort';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createPersistenceAdapter', () => {
  let factory: FactoryModule;
  let SqliteAdapterMock: AdapterModule['SqlitePersistenceAdapter'];
  let IndexedDbAdapterMock: IdbModule['IndexedDbPersistenceAdapter'];

  beforeEach(async () => {
    vi.resetModules();
    factory = await import('./createPersistenceAdapter');
    const sqModule = await import('./SqlitePersistenceAdapter');
    const idbModule = await import('./IndexedDbPersistenceAdapter');
    SqliteAdapterMock = sqModule.SqlitePersistenceAdapter;
    IndexedDbAdapterMock = idbModule.IndexedDbPersistenceAdapter;
    // Make sure the cache is clean
    factory.resetPersistenceAdapter();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restore Worker to defined state
    vi.stubGlobal('Worker', class MockWorker {});
  });

  // ── SQLite path (Worker available) ────────────────────────────────────

  describe('when Worker is available', () => {
    it('creates a SqlitePersistenceAdapter when Worker is defined', () => {
      vi.stubGlobal('Worker', class MockWorker {});
      const adapter = factory.createPersistenceAdapter();
      expect(vi.mocked(SqliteAdapterMock)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(IndexedDbAdapterMock)).not.toHaveBeenCalled();
      expect((adapter as unknown as { _type: string })._type).toBe('sqlite');
    });
  });

  // ── IndexedDB fallback (Worker unavailable) ───────────────────────────

  describe('when Worker is NOT available', () => {
    it('creates an IndexedDbPersistenceAdapter when Worker is undefined', () => {
      vi.stubGlobal('Worker', undefined);
      const adapter = factory.createPersistenceAdapter();
      expect(vi.mocked(IndexedDbAdapterMock)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(SqliteAdapterMock)).not.toHaveBeenCalled();
      expect((adapter as unknown as { _type: string })._type).toBe('indexeddb');
    });
  });

  // ── Singleton / caching ───────────────────────────────────────────────

  describe('singleton caching', () => {
    it('returns the same adapter instance on subsequent calls', () => {
      const first = factory.createPersistenceAdapter();
      const second = factory.createPersistenceAdapter();
      expect(first).toBe(second);
    });

    it('instantiates the adapter constructor only once across multiple calls', () => {
      factory.createPersistenceAdapter();
      factory.createPersistenceAdapter();
      factory.createPersistenceAdapter();
      const totalConstructCalls =
        vi.mocked(SqliteAdapterMock).mock.calls.length +
        vi.mocked(IndexedDbAdapterMock).mock.calls.length;
      expect(totalConstructCalls).toBe(1);
    });
  });

  // ── resetPersistenceAdapter ───────────────────────────────────────────

  describe('resetPersistenceAdapter', () => {
    it('clears the cache so the next call creates a fresh adapter', () => {
      const first = factory.createPersistenceAdapter();
      factory.resetPersistenceAdapter();
      const second = factory.createPersistenceAdapter();
      expect(first).not.toBe(second);
    });

    it('causes the adapter constructor to be called again after reset', () => {
      factory.createPersistenceAdapter();
      factory.resetPersistenceAdapter();
      factory.createPersistenceAdapter();
      const totalCalls =
        vi.mocked(SqliteAdapterMock).mock.calls.length +
        vi.mocked(IndexedDbAdapterMock).mock.calls.length;
      expect(totalCalls).toBe(2);
    });
  });

  // ── setPersistenceAdapter ─────────────────────────────────────────────

  describe('setPersistenceAdapter', () => {
    const buildCustomAdapter = (): PersistencePort => ({
      isSupported: vi.fn().mockReturnValue(true),
      readSnapshot: vi.fn().mockResolvedValue(null),
      writeSnapshot: vi.fn().mockResolvedValue(undefined),
      clearSnapshot: vi.fn().mockResolvedValue(undefined),
      readEntityState: vi.fn().mockResolvedValue(null),
      writeEntityState: vi.fn().mockResolvedValue(undefined),
      readPreference: vi.fn().mockResolvedValue(null),
      writePreference: vi.fn().mockResolvedValue(undefined),
      removePreference: vi.fn().mockResolvedValue(undefined),
      listBackups: vi.fn().mockResolvedValue([]),
      writeBackup: vi.fn(),
      readBackup: vi.fn().mockResolvedValue(null),
      clearBackups: vi.fn().mockResolvedValue(undefined),
      reserveGlobalIdentifier: vi.fn(),
    });

    it('overrides the cached adapter with the provided one', () => {
      const custom = buildCustomAdapter();
      factory.setPersistenceAdapter(custom);
      expect(factory.createPersistenceAdapter()).toBe(custom);
      expect(vi.mocked(SqliteAdapterMock)).not.toHaveBeenCalled();
      expect(vi.mocked(IndexedDbAdapterMock)).not.toHaveBeenCalled();
    });

    it('allows overriding the adapter multiple times', () => {
      const first = buildCustomAdapter();
      const second = buildCustomAdapter();
      factory.setPersistenceAdapter(first);
      expect(factory.createPersistenceAdapter()).toBe(first);
      factory.setPersistenceAdapter(second);
      expect(factory.createPersistenceAdapter()).toBe(second);
    });
  });

  // ── reset then set interop ────────────────────────────────────────────

  describe('reset then set', () => {
    it('respects injected adapter after a reset-then-set cycle', () => {
      factory.createPersistenceAdapter();
      factory.resetPersistenceAdapter();

      const custom: PersistencePort = {
        isSupported: () => false,
        readSnapshot: vi.fn(),
        writeSnapshot: vi.fn(),
        clearSnapshot: vi.fn(),
        readEntityState: vi.fn(),
        writeEntityState: vi.fn(),
        readPreference: vi.fn(),
        writePreference: vi.fn(),
        removePreference: vi.fn(),
        listBackups: vi.fn(),
        writeBackup: vi.fn(),
        readBackup: vi.fn(),
        clearBackups: vi.fn(),
        reserveGlobalIdentifier: vi.fn(),
      };

      factory.setPersistenceAdapter(custom);
      expect(factory.createPersistenceAdapter()).toBe(custom);
    });
  });
});
