import { describe, expect, it, vi } from 'vitest';
import type {
  PersistencePort,
  BackupMetadata,
  BackupRecord,
  WriteBackupOptions,
  CounterReservationResult,
} from './PersistencePort';

// ---------------------------------------------------------------------------
// PersistencePort — interface / type contract tests
//
// PersistencePort is a pure interface with no runtime implementation.
// These tests validate:
//   1. That implementors satisfying the interface can be created (type-sound)
//   2. That the data-shape of exported interfaces is correct
//   3. That the generic RPC client can resolve/reject via the contract
// ---------------------------------------------------------------------------

// ── Minimal valid implementation used across tests ────────────────────────

function buildMockAdapter(): PersistencePort {
  return {
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
  };
}

// ── BackupMetadata shape ──────────────────────────────────────────────────

describe('BackupMetadata', () => {
  it('accepts a valid auto-reason record', () => {
    const meta: BackupMetadata = {
      id: 'uuid-1',
      createdAt: 1_700_000_000,
      sizeBytes: 512,
      hash: 'abc123',
      reason: 'auto',
    };
    expect(meta.reason).toBe('auto');
    expect(meta.sizeBytes).toBeGreaterThan(0);
  });

  it('accepts a valid manual-reason record', () => {
    const meta: BackupMetadata = {
      id: 'uuid-2',
      createdAt: 1_700_000_001,
      sizeBytes: 1024,
      hash: 'def456',
      reason: 'manual',
    };
    expect(meta.reason).toBe('manual');
  });
});

// ── BackupRecord<T> shape ─────────────────────────────────────────────────

describe('BackupRecord', () => {
  it('preserves generic payload type', () => {
    const record: BackupRecord<{ value: number }> = {
      id: 'uuid-3',
      createdAt: 1_700_000_002,
      payload: { value: 42 },
      sizeBytes: 64,
      hash: 'ghi789',
      reason: 'auto',
    };
    expect(record.payload.value).toBe(42);
  });
});

// ── WriteBackupOptions shape ──────────────────────────────────────────────

describe('WriteBackupOptions', () => {
  it('allows an empty options object (all fields optional)', () => {
    const opts: WriteBackupOptions = {};
    expect(opts.reason).toBeUndefined();
    expect(opts.maxEntries).toBeUndefined();
    expect(opts.id).toBeUndefined();
  });

  it('accepts all fields populated', () => {
    const opts: WriteBackupOptions = { reason: 'manual', maxEntries: 10, id: 'custom-id' };
    expect(opts.reason).toBe('manual');
    expect(opts.maxEntries).toBe(10);
    expect(opts.id).toBe('custom-id');
  });
});

// ── CounterReservationResult shape ────────────────────────────────────────

describe('CounterReservationResult', () => {
  it('holds reservedValue and nextValue', () => {
    const result: CounterReservationResult = { reservedValue: 2500, nextValue: 2501 };
    expect(result.nextValue).toBe(result.reservedValue + 1);
  });
});

// ── PersistencePort contract — lifecycle ──────────────────────────────────

describe('PersistencePort contract', () => {
  describe('isSupported', () => {
    it('returns a boolean', () => {
      const adapter = buildMockAdapter();
      expect(typeof adapter.isSupported()).toBe('boolean');
    });

    it('can return false', () => {
      const adapter = buildMockAdapter();
      vi.mocked(adapter.isSupported).mockReturnValue(false);
      expect(adapter.isSupported()).toBe(false);
    });
  });

  // ── Snapshot ───────────────────────────────────────────────────────────

  describe('readSnapshot', () => {
    it('resolves to null when no data exists', async () => {
      const adapter = buildMockAdapter();
      await expect(adapter.readSnapshot()).resolves.toBeNull();
    });

    it('resolves to typed data when data exists', async () => {
      const adapter = buildMockAdapter();
      const snapshot = { projects: [], clients: [] };
      vi.mocked(adapter.readSnapshot).mockResolvedValue(snapshot);
      await expect(adapter.readSnapshot<typeof snapshot>()).resolves.toEqual(snapshot);
    });

    it('propagates rejection', async () => {
      const adapter = buildMockAdapter();
      vi.mocked(adapter.readSnapshot).mockRejectedValue(new Error('storage error'));
      await expect(adapter.readSnapshot()).rejects.toThrow('storage error');
    });
  });

  describe('writeSnapshot', () => {
    it('resolves to void on success', async () => {
      const adapter = buildMockAdapter();
      const snapshot = { projects: [] };
      await expect(adapter.writeSnapshot(snapshot)).resolves.toBeUndefined();
      expect(adapter.writeSnapshot).toHaveBeenCalledWith(snapshot);
    });

    it('propagates rejection', async () => {
      const adapter = buildMockAdapter();
      vi.mocked(adapter.writeSnapshot).mockRejectedValue(new Error('write failed'));
      await expect(adapter.writeSnapshot({})).rejects.toThrow('write failed');
    });
  });

  describe('clearSnapshot', () => {
    it('resolves to void on success', async () => {
      const adapter = buildMockAdapter();
      await expect(adapter.clearSnapshot()).resolves.toBeUndefined();
    });
  });

  // ── Entity state ───────────────────────────────────────────────────────

  describe('readEntityState', () => {
    it('resolves to null when empty', async () => {
      const adapter = buildMockAdapter();
      await expect(adapter.readEntityState()).resolves.toBeNull();
    });

    it('forwards optional entity keys filter', async () => {
      const adapter = buildMockAdapter();
      const partial = { clients: [] };
      vi.mocked(adapter.readEntityState).mockResolvedValue(partial);
      const result = await adapter.readEntityState(['clients']);
      expect(adapter.readEntityState).toHaveBeenCalledWith(['clients']);
      expect(result).toEqual(partial);
    });
  });

  describe('writeEntityState', () => {
    it('resolves to void when state is written', async () => {
      const adapter = buildMockAdapter();
      const state: Record<string, unknown> = { clients: [{ id: '1', name: 'ACME' }] };
      await expect(adapter.writeEntityState(state)).resolves.toBeUndefined();
      expect(adapter.writeEntityState).toHaveBeenCalledWith(state);
    });
  });

  // ── Preferences ────────────────────────────────────────────────────────

  describe('readPreference', () => {
    it('resolves to null when key is absent', async () => {
      const adapter = buildMockAdapter();
      await expect(adapter.readPreference('theme')).resolves.toBeNull();
    });

    it('resolves to the stored value', async () => {
      const adapter = buildMockAdapter();
      vi.mocked(adapter.readPreference).mockResolvedValue('dark');
      await expect(adapter.readPreference<string>('theme')).resolves.toBe('dark');
    });
  });

  describe('writePreference', () => {
    it('resolves to void on success', async () => {
      const adapter = buildMockAdapter();
      await expect(adapter.writePreference('theme', 'dark')).resolves.toBeUndefined();
      expect(adapter.writePreference).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('removePreference', () => {
    it('resolves to void on success', async () => {
      const adapter = buildMockAdapter();
      await expect(adapter.removePreference('theme')).resolves.toBeUndefined();
      expect(adapter.removePreference).toHaveBeenCalledWith('theme');
    });
  });

  // ── Backups ────────────────────────────────────────────────────────────

  describe('listBackups', () => {
    it('resolves to empty array when no backups', async () => {
      const adapter = buildMockAdapter();
      await expect(adapter.listBackups()).resolves.toEqual([]);
    });

    it('resolves to a list of BackupMetadata', async () => {
      const adapter = buildMockAdapter();
      const metas: BackupMetadata[] = [
        { id: 'b1', createdAt: 1, sizeBytes: 100, hash: 'aa', reason: 'auto' },
      ];
      vi.mocked(adapter.listBackups).mockResolvedValue(metas);
      await expect(adapter.listBackups()).resolves.toEqual(metas);
    });
  });

  describe('writeBackup', () => {
    it('resolves to BackupMetadata', async () => {
      const adapter = buildMockAdapter();
      const meta: BackupMetadata = {
        id: 'b1',
        createdAt: Date.now(),
        sizeBytes: 200,
        hash: 'ff',
        reason: 'manual',
      };
      vi.mocked(adapter.writeBackup).mockResolvedValue(meta);
      const result = await adapter.writeBackup({ data: 'payload' }, { reason: 'manual' });
      expect(result).toEqual(meta);
    });
  });

  describe('readBackup', () => {
    it('resolves to null when backup does not exist', async () => {
      const adapter = buildMockAdapter();
      await expect(adapter.readBackup('missing-id')).resolves.toBeNull();
    });

    it('resolves to BackupRecord with payload', async () => {
      const adapter = buildMockAdapter();
      const record: BackupRecord<{ v: number }> = {
        id: 'b1',
        createdAt: 1,
        payload: { v: 1 },
        sizeBytes: 10,
        hash: 'cc',
        reason: 'auto',
      };
      vi.mocked(adapter.readBackup).mockResolvedValue(record);
      await expect(adapter.readBackup<{ v: number }>('b1')).resolves.toEqual(record);
    });
  });

  describe('clearBackups', () => {
    it('resolves to void', async () => {
      const adapter = buildMockAdapter();
      await expect(adapter.clearBackups()).resolves.toBeUndefined();
    });
  });

  // ── Counter reservation ────────────────────────────────────────────────

  describe('reserveGlobalIdentifier', () => {
    it('resolves to a CounterReservationResult with reservedValue < nextValue', async () => {
      const adapter = buildMockAdapter();
      const result: CounterReservationResult = { reservedValue: 2500, nextValue: 2501 };
      vi.mocked(adapter.reserveGlobalIdentifier).mockResolvedValue(result);
      const res = await adapter.reserveGlobalIdentifier();
      expect(res.nextValue).toBe(res.reservedValue + 1);
    });

    it('accepts an optional defaultCounter argument', async () => {
      const adapter = buildMockAdapter();
      vi.mocked(adapter.reserveGlobalIdentifier).mockResolvedValue({
        reservedValue: 100,
        nextValue: 101,
      });
      await adapter.reserveGlobalIdentifier(100);
      expect(adapter.reserveGlobalIdentifier).toHaveBeenCalledWith(100);
    });
  });
});
