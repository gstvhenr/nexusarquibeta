import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks — before vi.mock factories run
// ---------------------------------------------------------------------------
const { mockRpcInit, mockRpcExec, mockRpcExecBatch, mockRpcGetAll } = vi.hoisted(() => ({
  mockRpcInit: vi.fn().mockResolvedValue(undefined) as ReturnType<typeof vi.fn>,
  mockRpcExec: vi.fn().mockResolvedValue(undefined) as ReturnType<typeof vi.fn>,
  mockRpcExecBatch: vi.fn().mockResolvedValue(undefined) as ReturnType<typeof vi.fn>,
  mockRpcGetAll: vi.fn().mockResolvedValue([]) as ReturnType<typeof vi.fn>,
}));

// Mock the RPC layer — the Adapter creates its own Worker and passes it to createSqliteRpc
vi.mock('./sqlite/sqliteRpc', () => ({
  createSqliteRpc: vi.fn(() => ({
    init: mockRpcInit,
    exec: mockRpcExec,
    execBatch: mockRpcExecBatch,
    getAll: mockRpcGetAll,
    checkpoint: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock URL constructor used in `new Worker(new URL(...), ...)`
vi.stubGlobal('URL', class MockURL {
  href: string;
  constructor(url: string) { this.href = url; }
});

// Mock the Worker global so the real constructor does not throw in Node
vi.stubGlobal('Worker', class MockWorker {
  addEventListener = vi.fn();
  postMessage = vi.fn();
});

// Mock crypto.randomUUID for deterministic IDs
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'static-uuid'),
});

// ---------------------------------------------------------------------------
// Module under test (imported AFTER stubs are set up)
// ---------------------------------------------------------------------------
import { SqlitePersistenceAdapter } from './SqlitePersistenceAdapter';
import type { BackupMetadata, BackupRecord, CounterReservationResult } from './PersistencePort';
import { ARRAY_ENTITY_KEYS, SCALAR_KEYS } from './sqlite/sqliteSchema';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildAdapter(): SqlitePersistenceAdapter {
  return new SqlitePersistenceAdapter();
}

/** Simulate getAll returning rows for queries that INCLUDE the given key */
function stubGetAll(rowMap: Record<string, unknown[]>): void {
  mockRpcGetAll.mockImplementation((sql: string): Promise<unknown[]> => {
    for (const [key, rows] of Object.entries(rowMap)) {
      if (sql.includes(key)) return Promise.resolve(rows);
    }
    return Promise.resolve([]);
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SqlitePersistenceAdapter', () => {
  let adapter: SqlitePersistenceAdapter;

  beforeEach(() => {
    adapter = buildAdapter();
    mockRpcGetAll.mockResolvedValue([]);
    mockRpcExec.mockResolvedValue(undefined);
    mockRpcExecBatch.mockResolvedValue(undefined);
    mockRpcInit.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── isSupported ─────────────────────────────────────────────────────

  describe('isSupported', () => {
    it('returns true when Worker is defined', () => {
      expect(adapter.isSupported()).toBe(true);
    });
  });

  // ── ensureReady / lazy init ─────────────────────────────────────────

  describe('ensureReady (lazy init)', () => {
    it('calls rpc.init only once across multiple operations', async () => {
      await adapter.readSnapshot();
      await adapter.readSnapshot();
      expect(mockRpcInit).toHaveBeenCalledTimes(1);
    });

    it('does not call init again on subsequent operations', async () => {
      await adapter.clearSnapshot();
      await adapter.clearSnapshot();
      expect(mockRpcInit).toHaveBeenCalledTimes(1);
    });
  });

  // ── readSnapshot ────────────────────────────────────────────────────

  describe('readSnapshot', () => {
    it('returns null when all tables and system_config are empty', async () => {
      mockRpcGetAll.mockResolvedValue([]);
      await expect(adapter.readSnapshot()).resolves.toBeNull();
    });

    it('returns a snapshot with entity arrays when any table has rows', async () => {
      stubGetAll({
        clients: [{ data: JSON.stringify({ id: '1', name: 'ACME' }) }],
      });
      const result = await adapter.readSnapshot<Record<string, unknown>>();
      expect(result).not.toBeNull();
      expect(Array.isArray(result?.['clients'])).toBe(true);
      expect((result?.['clients'] as unknown[])[0]).toEqual({ id: '1', name: 'ACME' });
    });

    it('parses scalar keys from system_config', async () => {
      mockRpcGetAll.mockImplementation((sql: string) => {
        if (sql.includes("key = 'globalIdentifierCounter'")) {
          return Promise.resolve([{ value: '2500' }]);
        }
        return Promise.resolve([]);
      });
      const result = await adapter.readSnapshot<Record<string, unknown>>();
      expect(result?.['globalIdentifierCounter']).toBe(2500);
    });

    it('queries every ARRAY_ENTITY_KEYS table', async () => {
      await adapter.readSnapshot();
      // At minimum ARRAY_ENTITY_KEYS.length + SCALAR_KEYS.length calls
      expect(mockRpcGetAll.mock.calls.length).toBeGreaterThanOrEqual(ARRAY_ENTITY_KEYS.length);
    });
  });

  // ── writeSnapshot ───────────────────────────────────────────────────

  describe('writeSnapshot', () => {
    it('calls execBatch with DELETE + INSERT statements for array entities', async () => {
      const snapshot: Record<string, unknown> = {
        projects: [{ id: 'p1', name: 'Test' }],
      };
      await adapter.writeSnapshot(snapshot);
      expect(mockRpcExecBatch).toHaveBeenCalled();
      const [stmts] = mockRpcExecBatch.mock.calls.at(-1)!;
      const sql = stmts.map((s: { sql: string }) => s.sql).join('\n');
      expect(sql).toContain('DELETE FROM projects');
      expect(sql).toContain('INSERT INTO projects');
    });

    it('does not call execBatch when snapshot has no array or scalar data', async () => {
      await adapter.writeSnapshot({});
      expect(mockRpcExecBatch).not.toHaveBeenCalled();
    });

    it('writes scalar keys into system_config', async () => {
      await adapter.writeSnapshot({ globalIdentifierCounter: 3000 });
      expect(mockRpcExecBatch).toHaveBeenCalled();
      const [stmts] = mockRpcExecBatch.mock.calls.at(-1)!;
      const sql = stmts.map((s: { sql: string }) => s.sql).join('\n');
      expect(sql).toContain('system_config');
      expect(sql).toContain('globalIdentifierCounter');
    });

    it('escapes single quotes in JSON to prevent SQL injection', async () => {
      const snapshot: Record<string, unknown> = {
        clients: [{ id: 'c1', name: "O'Brien" }],
      };
      await adapter.writeSnapshot(snapshot);
      const [stmts] = mockRpcExecBatch.mock.calls.at(-1)!;
      const sql = stmts.map((s: { sql: string }) => s.sql).join('\n');
      expect(sql).toContain("O''Brien");
    });

    it('skips non-array values for array entity keys', async () => {
      await adapter.writeSnapshot({ clients: 'not-an-array' });
      if (mockRpcExecBatch.mock.calls.length > 0) {
        const [stmts] = mockRpcExecBatch.mock.calls.at(-1)!;
        const sql = stmts.map((s: { sql: string }) => s.sql).join('\n');
        expect(sql).not.toContain('INSERT INTO clients');
      } else {
        expect(mockRpcExecBatch).not.toHaveBeenCalled();
      }
    });
  });

  // ── clearSnapshot ───────────────────────────────────────────────────

  describe('clearSnapshot', () => {
    it('calls execBatch with DELETE statements for every entity table + system_config', async () => {
      await adapter.clearSnapshot();
      expect(mockRpcExecBatch).toHaveBeenCalled();
      const [stmts] = mockRpcExecBatch.mock.calls.at(-1)!;
      const sql = stmts.map((s: { sql: string }) => s.sql).join('\n');
      expect(sql).toContain('DELETE FROM system_config');
      // Should have at least one DELETE per ARRAY_ENTITY_KEY + system_config
      const deleteCount = stmts.filter((s: { sql: string }) => s.sql.startsWith('DELETE')).length;
      expect(deleteCount).toBe(ARRAY_ENTITY_KEYS.length + 1);
    });
  });

  // ── readEntityState ─────────────────────────────────────────────────

  describe('readEntityState', () => {
    it('returns null when all requested keys are empty', async () => {
      mockRpcGetAll.mockResolvedValue([]);
      await expect(adapter.readEntityState(['clients'])).resolves.toBeNull();
    });

    it('returns partial state for array entity keys', async () => {
      stubGetAll({
        clients: [{ data: JSON.stringify({ id: '1' }) }],
      });
      const result = await adapter.readEntityState<{ clients: unknown[] }>(['clients']);
      expect(Array.isArray(result?.clients)).toBe(true);
    });

    it('reads scalar keys too', async () => {
      mockRpcGetAll.mockImplementation((sql: string) => {
        if (sql.includes("'globalIdentifierCounter'")) {
          return Promise.resolve([{ value: '100' }]);
        }
        return Promise.resolve([]);
      });
      const result = await adapter.readEntityState<Record<string, unknown>>([
        'globalIdentifierCounter',
      ]);
      expect(result?.['globalIdentifierCounter']).toBe(100);
    });

    it('reads all keys when no filter is provided', async () => {
      await adapter.readEntityState();
      const callCount = mockRpcGetAll.mock.calls.length;
      expect(callCount).toBeGreaterThanOrEqual(ARRAY_ENTITY_KEYS.length + SCALAR_KEYS.length);
    });
  });

  // ── writeEntityState ────────────────────────────────────────────────

  describe('writeEntityState', () => {
    it('produces one DELETE + INSERT per array entity', async () => {
      await adapter.writeEntityState({ projects: [{ id: 'p1' }] });
      expect(mockRpcExecBatch).toHaveBeenCalled();
      const [stmts] = mockRpcExecBatch.mock.calls.at(-1)!;
      const sql = stmts.map((s: { sql: string }) => s.sql).join('\n');
      expect(sql).toContain('DELETE FROM projects');
      expect(sql).toContain('INSERT INTO projects');
    });

    it('handles scalar keys in state', async () => {
      await adapter.writeEntityState({ globalIdentifierCounter: 999 });
      expect(mockRpcExecBatch).toHaveBeenCalled();
      const [stmts] = mockRpcExecBatch.mock.calls.at(-1)!;
      const sql = stmts.map((s: { sql: string }) => s.sql).join('\n');
      expect(sql).toContain('globalIdentifierCounter');
    });

    it('does not call execBatch when state is empty', async () => {
      await adapter.writeEntityState({});
      expect(mockRpcExecBatch).not.toHaveBeenCalled();
    });

    it('ignores unknown keys that are not in ARRAY_ENTITY_KEYS or SCALAR_KEYS', async () => {
      await adapter.writeEntityState({ unknownKey: [{ id: '1' }] });
      expect(mockRpcExecBatch).not.toHaveBeenCalled();
    });
  });

  // ── readPreference ──────────────────────────────────────────────────

  describe('readPreference', () => {
    it('returns null when key is absent', async () => {
      mockRpcGetAll.mockResolvedValue([]);
      await expect(adapter.readPreference('theme')).resolves.toBeNull();
    });

    it('parses and returns the stored JSON value', async () => {
      mockRpcGetAll.mockResolvedValue([{ value: '"dark"' }]);
      await expect(adapter.readPreference<string>('theme')).resolves.toBe('dark');
    });

    it('escapes single quotes in the key when querying', async () => {
      await adapter.readPreference("user's-key");
      const sql = mockRpcGetAll.mock.calls.at(-1)?.[0] as string;
      expect(sql).toContain("user''s-key");
    });
  });

  // ── writePreference ─────────────────────────────────────────────────

  describe('writePreference', () => {
    it('calls rpc.exec with INSERT OR REPLACE for the given key/value', async () => {
      await adapter.writePreference('theme', 'light');
      const sql = mockRpcExec.mock.calls.at(-1)?.[0] as string;
      expect(sql).toContain('ui_preferences');
      expect(sql).toContain('theme');
      expect(sql).toContain('"light"');
    });

    it('escapes single quotes in preference key and value', async () => {
      await adapter.writePreference("key'test", "val'test");
      const sql = mockRpcExec.mock.calls.at(-1)?.[0] as string;
      expect(sql).toContain("key''test");
      expect(sql).toContain("val''test");
    });
  });

  // ── removePreference ────────────────────────────────────────────────

  describe('removePreference', () => {
    it('calls rpc.exec with DELETE WHERE key', async () => {
      await adapter.removePreference('obsolete');
      const sql = mockRpcExec.mock.calls.at(-1)?.[0] as string;
      expect(sql).toContain('DELETE FROM ui_preferences');
      expect(sql).toContain('obsolete');
    });
  });

  // ── listBackups ─────────────────────────────────────────────────────

  describe('listBackups', () => {
    it('returns an empty array when no backups', async () => {
      mockRpcGetAll.mockResolvedValue([]);
      await expect(adapter.listBackups()).resolves.toEqual([]);
    });

    it('maps DB rows to BackupMetadata with camelCase fields', async () => {
      mockRpcGetAll.mockResolvedValue([
        { id: 'b1', created_at: 100, size_bytes: 200, hash: 'hh', reason: 'auto' },
      ]);
      const result = await adapter.listBackups();
      expect(result[0]).toMatchObject<BackupMetadata>({
        id: 'b1',
        createdAt: 100,
        sizeBytes: 200,
        hash: 'hh',
        reason: 'auto',
      });
    });

    it('orders query by created_at DESC', async () => {
      await adapter.listBackups();
      const sql = mockRpcGetAll.mock.calls.at(-1)?.[0] as string;
      expect(sql.toUpperCase()).toContain('ORDER BY CREATED_AT DESC');
    });
  });

  // ── writeBackup ─────────────────────────────────────────────────────

  describe('writeBackup', () => {
    it('returns BackupMetadata with correct fields', async () => {
      const payload = { projects: [] };
      const meta = await adapter.writeBackup(payload, { reason: 'manual' });
      expect(meta.reason).toBe('manual');
      expect(meta.sizeBytes).toBeGreaterThan(0);
      expect(typeof meta.hash).toBe('string');
      expect(typeof meta.id).toBe('string');
    });

    it('defaults reason to "auto" when not provided', async () => {
      const meta = await adapter.writeBackup({ data: 1 });
      expect(meta.reason).toBe('auto');
    });

    it('uses the provided id option', async () => {
      const meta = await adapter.writeBackup({}, { id: 'custom-id' });
      expect(meta.id).toBe('custom-id');
    });

    it('appends a DELETE statement for maxEntries enforcement', async () => {
      await adapter.writeBackup({}, { maxEntries: 3 });
      expect(mockRpcExecBatch).toHaveBeenCalled();
      const [stmts] = mockRpcExecBatch.mock.calls.at(-1)!;
      const sql = stmts.map((s: { sql: string }) => s.sql).join('\n');
      expect(sql).toContain('LIMIT 3');
    });

    it('does NOT add a retention DELETE when maxEntries is absent', async () => {
      await adapter.writeBackup({});
      expect(mockRpcExecBatch).toHaveBeenCalled();
      const [stmts] = mockRpcExecBatch.mock.calls.at(-1)!;
      expect(stmts).toHaveLength(1);
    });
  });

  // ── readBackup ──────────────────────────────────────────────────────

  describe('readBackup', () => {
    it('returns null when backup is not found', async () => {
      mockRpcGetAll.mockResolvedValue([]);
      await expect(adapter.readBackup('missing')).resolves.toBeNull();
    });

    it('parses and returns the full BackupRecord', async () => {
      const raw = {
        id: 'b1',
        created_at: 123,
        payload: JSON.stringify({ value: 42 }),
        size_bytes: 16,
        hash: 'ff',
        reason: 'auto',
      };
      mockRpcGetAll.mockResolvedValue([raw]);
      const result = await adapter.readBackup<{ value: number }>('b1');
      expect(result).toMatchObject<BackupRecord<{ value: number }>>({
        id: 'b1',
        createdAt: 123,
        payload: { value: 42 },
        sizeBytes: 16,
        hash: 'ff',
        reason: 'auto',
      });
    });
  });

  // ── clearBackups ────────────────────────────────────────────────────

  describe('clearBackups', () => {
    it('calls rpc.exec with DELETE FROM automatic_backups', async () => {
      await adapter.clearBackups();
      const sql = mockRpcExec.mock.calls.at(-1)?.[0] as string;
      expect(sql).toContain('DELETE FROM automatic_backups');
    });
  });

  // ── reserveGlobalIdentifier ─────────────────────────────────────────

  describe('reserveGlobalIdentifier', () => {
    it('inserts the default counter when no row exists and returns current + next', async () => {
      mockRpcGetAll.mockResolvedValue([]);
      const result: CounterReservationResult = await adapter.reserveGlobalIdentifier(2500);
      expect(result.reservedValue).toBe(2500);
      expect(result.nextValue).toBe(2501);
    });

    it('reads the existing counter value and returns it + 1', async () => {
      mockRpcGetAll.mockResolvedValue([{ value: '3000' }]);
      const result = await adapter.reserveGlobalIdentifier();
      expect(result.reservedValue).toBe(3000);
      expect(result.nextValue).toBe(3001);
    });

    it('uses 2500 as the default counter when argument is omitted and no row exists', async () => {
      mockRpcGetAll.mockResolvedValue([]);
      const result = await adapter.reserveGlobalIdentifier();
      expect(result.reservedValue).toBe(2500);
    });

    it('propagates rejection from the underlying RPC', async () => {
      mockRpcGetAll.mockRejectedValue(new Error('db locked'));
      await expect(adapter.reserveGlobalIdentifier()).rejects.toThrow('db locked');
    });
  });
});
