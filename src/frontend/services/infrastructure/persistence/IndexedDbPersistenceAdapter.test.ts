import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoist mocks — before vi.mock factories run
// ---------------------------------------------------------------------------
const {
  mockIsSupported,
  mockReadSnapshot,
  mockWriteSnapshot,
  mockClearSnapshot,
  mockReadEntityState,
  mockWriteEntityState,
  mockReadPreference,
  mockWritePreference,
  mockRemovePreference,
  mockListAutomaticBackups,
  mockWriteAutomaticBackup,
  mockReadAutomaticBackup,
  mockClearAutomaticBackups,
  mockReserveGlobalIdentifier,
} = vi.hoisted(() => ({
  mockIsSupported: vi.fn().mockReturnValue(true),
  mockReadSnapshot: vi.fn().mockResolvedValue(null),
  mockWriteSnapshot: vi.fn().mockResolvedValue(undefined),
  mockClearSnapshot: vi.fn().mockResolvedValue(undefined),
  mockReadEntityState: vi.fn().mockResolvedValue(null),
  mockWriteEntityState: vi.fn().mockResolvedValue(undefined),
  mockReadPreference: vi.fn().mockResolvedValue(null),
  mockWritePreference: vi.fn().mockResolvedValue(undefined),
  mockRemovePreference: vi.fn().mockResolvedValue(undefined),
  mockListAutomaticBackups: vi.fn().mockResolvedValue([]),
  mockWriteAutomaticBackup: vi.fn(),
  mockReadAutomaticBackup: vi.fn().mockResolvedValue(null),
  mockClearAutomaticBackups: vi.fn().mockResolvedValue(undefined),
  mockReserveGlobalIdentifier: vi.fn(),
}));

vi.mock('../indexedDbService', () => ({
  indexedDbService: {
    isSupported: mockIsSupported,
    readSnapshot: mockReadSnapshot,
    writeSnapshot: mockWriteSnapshot,
    clearSnapshot: mockClearSnapshot,
    readEntityState: mockReadEntityState,
    writeEntityState: mockWriteEntityState,
    readPreference: mockReadPreference,
    writePreference: mockWritePreference,
    removePreference: mockRemovePreference,
    listAutomaticBackups: mockListAutomaticBackups,
    writeAutomaticBackup: mockWriteAutomaticBackup,
    readAutomaticBackup: mockReadAutomaticBackup,
    clearAutomaticBackups: mockClearAutomaticBackups,
    reserveGlobalIdentifier: mockReserveGlobalIdentifier,
  },
}));

// ---------------------------------------------------------------------------
// Module under test
// ---------------------------------------------------------------------------
import { IndexedDbPersistenceAdapter } from './IndexedDbPersistenceAdapter';
import type { BackupMetadata, BackupRecord, CounterReservationResult } from './PersistencePort';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('IndexedDbPersistenceAdapter', () => {
  let adapter: IndexedDbPersistenceAdapter;

  beforeEach(() => {
    // Reset all mocks to their default implementations (avoids state leakage)
    vi.resetAllMocks();
    mockIsSupported.mockReturnValue(true);
    mockReadSnapshot.mockResolvedValue(null);
    mockWriteSnapshot.mockResolvedValue(undefined);
    mockClearSnapshot.mockResolvedValue(undefined);
    mockReadEntityState.mockResolvedValue(null);
    mockWriteEntityState.mockResolvedValue(undefined);
    mockReadPreference.mockResolvedValue(null);
    mockWritePreference.mockResolvedValue(undefined);
    mockRemovePreference.mockResolvedValue(undefined);
    mockListAutomaticBackups.mockResolvedValue([]);
    mockReadAutomaticBackup.mockResolvedValue(null);
    mockClearAutomaticBackups.mockResolvedValue(undefined);
    adapter = new IndexedDbPersistenceAdapter();
  });

  // ── isSupported ─────────────────────────────────────────────────────

  describe('isSupported', () => {
    it('delegates to indexedDbService.isSupported and returns true', () => {
      expect(adapter.isSupported()).toBe(true);
      expect(mockIsSupported).toHaveBeenCalledTimes(1);
    });

    it('returns false when indexedDbService.isSupported returns false', () => {
      mockIsSupported.mockReturnValue(false);
      expect(adapter.isSupported()).toBe(false);
    });
  });

  // ── readSnapshot ────────────────────────────────────────────────────

  describe('readSnapshot', () => {
    it('delegates to indexedDbService.readSnapshot and returns null when empty', async () => {
      await expect(adapter.readSnapshot()).resolves.toBeNull();
      expect(mockReadSnapshot).toHaveBeenCalledTimes(1);
    });

    it('returns the snapshot when it exists', async () => {
      const snapshot = { projects: [], clients: [] };
      mockReadSnapshot.mockResolvedValue(snapshot);
      await expect(adapter.readSnapshot<typeof snapshot>()).resolves.toEqual(snapshot);
    });

    it('propagates rejections from the underlying service', async () => {
      mockReadSnapshot.mockRejectedValue(new Error('idb failure'));
      await expect(adapter.readSnapshot()).rejects.toThrow('idb failure');
    });
  });

  // ── writeSnapshot ───────────────────────────────────────────────────

  describe('writeSnapshot', () => {
    it('delegates to indexedDbService.writeSnapshot', async () => {
      const snapshot = { projects: [{ id: '1' }] };
      await adapter.writeSnapshot(snapshot);
      expect(mockWriteSnapshot).toHaveBeenCalledWith(snapshot);
    });

    it('propagates rejections', async () => {
      mockWriteSnapshot.mockRejectedValue(new Error('write failed'));
      await expect(adapter.writeSnapshot({})).rejects.toThrow('write failed');
    });
  });

  // ── clearSnapshot ───────────────────────────────────────────────────

  describe('clearSnapshot', () => {
    it('delegates to indexedDbService.clearSnapshot', async () => {
      await adapter.clearSnapshot();
      expect(mockClearSnapshot).toHaveBeenCalledTimes(1);
    });

    it('resolves to void', async () => {
      await expect(adapter.clearSnapshot()).resolves.toBeUndefined();
    });
  });

  // ── readEntityState ─────────────────────────────────────────────────

  describe('readEntityState', () => {
    it('delegates without entities filter', async () => {
      await adapter.readEntityState();
      expect(mockReadEntityState).toHaveBeenCalledTimes(1);
      expect(mockReadEntityState).toHaveBeenCalledWith(undefined);
    });

    it('delegates with entity keys filter', async () => {
      const keys = ['clients', 'projects'];
      const partial = { clients: [{ id: '1' }], projects: [] };
      mockReadEntityState.mockResolvedValue(partial);
      const result = await adapter.readEntityState(keys);
      expect(mockReadEntityState).toHaveBeenCalledWith(keys);
      expect(result).toEqual(partial);
    });

    it('returns null when no state', async () => {
      await expect(adapter.readEntityState()).resolves.toBeNull();
    });
  });

  // ── writeEntityState ────────────────────────────────────────────────

  describe('writeEntityState', () => {
    it('delegates to indexedDbService.writeEntityState', async () => {
      const state: Record<string, unknown> = { clients: [] };
      await adapter.writeEntityState(state);
      expect(mockWriteEntityState).toHaveBeenCalledWith(state);
    });
  });

  // ── readPreference ──────────────────────────────────────────────────

  describe('readPreference', () => {
    it('delegates with the key and returns null when absent', async () => {
      await expect(adapter.readPreference('theme')).resolves.toBeNull();
      expect(mockReadPreference).toHaveBeenCalledWith('theme');
    });

    it('returns the stored value', async () => {
      mockReadPreference.mockResolvedValue('dark');
      await expect(adapter.readPreference<string>('theme')).resolves.toBe('dark');
    });
  });

  // ── writePreference ─────────────────────────────────────────────────

  describe('writePreference', () => {
    it('delegates to indexedDbService.writePreference with key and value', async () => {
      await adapter.writePreference('language', 'pt-BR');
      expect(mockWritePreference).toHaveBeenCalledWith('language', 'pt-BR');
    });
  });

  // ── removePreference ────────────────────────────────────────────────

  describe('removePreference', () => {
    it('delegates to indexedDbService.removePreference with the key', async () => {
      await adapter.removePreference('obsoleteKey');
      expect(mockRemovePreference).toHaveBeenCalledWith('obsoleteKey');
    });

    it('resolves to void', async () => {
      await expect(adapter.removePreference('k')).resolves.toBeUndefined();
    });
  });

  // ── listBackups ─────────────────────────────────────────────────────

  describe('listBackups', () => {
    it('delegates to indexedDbService.listAutomaticBackups', async () => {
      await adapter.listBackups();
      expect(mockListAutomaticBackups).toHaveBeenCalledTimes(1);
    });

    it('returns BackupMetadata list', async () => {
      const metas: BackupMetadata[] = [
        { id: 'b1', createdAt: 1, sizeBytes: 128, hash: 'aa', reason: 'auto' },
      ];
      mockListAutomaticBackups.mockResolvedValue(metas);
      await expect(adapter.listBackups()).resolves.toEqual(metas);
    });

    it('returns empty array when no backups', async () => {
      await expect(adapter.listBackups()).resolves.toEqual([]);
    });
  });

  // ── writeBackup ─────────────────────────────────────────────────────

  describe('writeBackup', () => {
    it('delegates to indexedDbService.writeAutomaticBackup with payload and options', async () => {
      const meta: BackupMetadata = {
        id: 'b2',
        createdAt: Date.now(),
        sizeBytes: 256,
        hash: 'bb',
        reason: 'manual',
      };
      mockWriteAutomaticBackup.mockResolvedValue(meta);
      const payload = { projects: [] };
      const opts = { reason: 'manual' as const, maxEntries: 5 };
      const result = await adapter.writeBackup(payload, opts);
      expect(mockWriteAutomaticBackup).toHaveBeenCalledWith(payload, opts);
      expect(result).toEqual(meta);
    });

    it('works without options', async () => {
      const meta: BackupMetadata = {
        id: 'b3',
        createdAt: Date.now(),
        sizeBytes: 64,
        hash: 'cc',
        reason: 'auto',
      };
      mockWriteAutomaticBackup.mockResolvedValue(meta);
      await expect(adapter.writeBackup({ data: 1 })).resolves.toEqual(meta);
      expect(mockWriteAutomaticBackup).toHaveBeenCalledWith({ data: 1 }, undefined);
    });
  });

  // ── readBackup ──────────────────────────────────────────────────────

  describe('readBackup', () => {
    it('returns null when backup not found', async () => {
      await expect(adapter.readBackup('nonexistent')).resolves.toBeNull();
      expect(mockReadAutomaticBackup).toHaveBeenCalledWith('nonexistent');
    });

    it('returns the BackupRecord with payload', async () => {
      const record: BackupRecord<{ v: number }> = {
        id: 'b4',
        createdAt: 2,
        payload: { v: 99 },
        sizeBytes: 32,
        hash: 'dd',
        reason: 'auto',
      };
      mockReadAutomaticBackup.mockResolvedValue(record);
      await expect(adapter.readBackup<{ v: number }>('b4')).resolves.toEqual(record);
    });
  });

  // ── clearBackups ────────────────────────────────────────────────────

  describe('clearBackups', () => {
    it('delegates to indexedDbService.clearAutomaticBackups', async () => {
      await adapter.clearBackups();
      expect(mockClearAutomaticBackups).toHaveBeenCalledTimes(1);
    });

    it('resolves to void', async () => {
      await expect(adapter.clearBackups()).resolves.toBeUndefined();
    });
  });

  // ── reserveGlobalIdentifier ─────────────────────────────────────────

  describe('reserveGlobalIdentifier', () => {
    it('delegates to indexedDbService.reserveGlobalIdentifier', async () => {
      const result: CounterReservationResult = { reservedValue: 2500, nextValue: 2501 };
      mockReserveGlobalIdentifier.mockResolvedValue(result);
      const res = await adapter.reserveGlobalIdentifier();
      expect(mockReserveGlobalIdentifier).toHaveBeenCalledTimes(1);
      expect(res).toEqual(result);
    });

    it('delegates the optional defaultCounter argument', async () => {
      mockReserveGlobalIdentifier.mockResolvedValue({ reservedValue: 100, nextValue: 101 });
      await adapter.reserveGlobalIdentifier(100);
      expect(mockReserveGlobalIdentifier).toHaveBeenCalledWith(100);
    });

    it('propagates rejection from the underlying service', async () => {
      mockReserveGlobalIdentifier.mockRejectedValue(new Error('idb error'));
      await expect(adapter.reserveGlobalIdentifier()).rejects.toThrow('idb error');
    });
  });
});
