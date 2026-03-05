import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock the ?raw SQL import — static string so module reads it at init-time
// ---------------------------------------------------------------------------
vi.mock('./migrations/001_initial_schema.sql?raw', () => ({
  default: [
    '-- create core table',
    'CREATE TABLE projects (id TEXT PRIMARY KEY)',
    'CREATE TABLE clients (id TEXT PRIMARY KEY, name TEXT NOT NULL)',
  ].join(';\n') + ';',
}));

// ---------------------------------------------------------------------------
// Module under test — imported AFTER the ?raw mock is registered
// ---------------------------------------------------------------------------
import { runMigrations } from './sqliteMigrations';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Plain vi.fn() mocks — typed via explicit cast on usage. */
function makeFns() {
  const execFn = vi.fn().mockResolvedValue(undefined);
  const queryFn = vi.fn().mockResolvedValue([]);
  return { execFn, queryFn };
}

/** Extract the string SQL calls from execFn's call history. */
const sqlCalls = (fn: ReturnType<typeof vi.fn>): string[] =>
  (fn.mock.calls as [string][]).map(([s]) => s);

/** Make queryFn report a specific current schema version. */
function stubVersion(queryFn: ReturnType<typeof vi.fn>, version: number) {
  queryFn.mockResolvedValue([{ version }]);
}

/** Make queryFn report "no row" (fresh database → v0). */
function stubEmpty(queryFn: ReturnType<typeof vi.fn>) {
  queryFn.mockResolvedValue([]);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('runMigrations', () => {
  let execFn: ReturnType<typeof vi.fn>;
  let queryFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    ({ execFn, queryFn } = makeFns());
  });

  // ── Already up-to-date ──────────────────────────────────────────────

  describe('when the schema is already at the latest version', () => {
    it('returns 0 without executing any SQL', async () => {
      stubVersion(queryFn, 1); // v1 is the only defined migration

      const applied = await runMigrations(execFn, queryFn);

      expect(applied).toBe(0);
      expect(execFn).not.toHaveBeenCalled();
    });

    it('queries schema_meta exactly once', async () => {
      stubVersion(queryFn, 1);
      await runMigrations(execFn, queryFn);

      expect(queryFn).toHaveBeenCalledTimes(1);
      expect((queryFn.mock.calls as [string][])[0][0]).toContain('schema_meta');
    });
  });

  // ── Fresh database (no version row) ────────────────────────────────

  describe('when the schema_meta table has no rows (fresh DB)', () => {
    it('treats current version as 0 and runs the v1 migration', async () => {
      stubEmpty(queryFn);
      const applied = await runMigrations(execFn, queryFn);
      expect(applied).toBe(1);
    });

    it('wraps the migration in BEGIN IMMEDIATE … COMMIT', async () => {
      stubEmpty(queryFn);
      await runMigrations(execFn, queryFn);

      const calls = sqlCalls(execFn);
      expect(calls[0].toUpperCase()).toBe('BEGIN IMMEDIATE');
      expect(calls.at(-1)!.toUpperCase()).toBe('COMMIT');
    });

    it('executes all statements from the migration SQL', async () => {
      stubEmpty(queryFn);
      await runMigrations(execFn, queryFn);

      const calls = sqlCalls(execFn);
      expect(calls.some((s) => s.includes('CREATE TABLE projects'))).toBe(true);
      expect(calls.some((s) => s.includes('CREATE TABLE clients'))).toBe(true);
    });

    it('updates schema_meta to the migration version', async () => {
      stubEmpty(queryFn);
      await runMigrations(execFn, queryFn);

      const updateCall = sqlCalls(execFn).find((s) => s.startsWith('UPDATE schema_meta'));
      expect(updateCall).toBeDefined();
      expect(updateCall).toContain('version = 1');
    });

    it('includes a numeric migrated_at timestamp in the UPDATE call', async () => {
      const before = Date.now();
      stubEmpty(queryFn);
      await runMigrations(execFn, queryFn);
      const after = Date.now();

      const updateCall = sqlCalls(execFn).find((s) => s.startsWith('UPDATE schema_meta'))!;
      const match = /migrated_at = (\d+)/.exec(updateCall);
      expect(match).not.toBeNull();
      const ts = Number(match![1]);
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });
  });

  // ── Transaction ordering ────────────────────────────────────────────

  describe('SQL execution order within a migration', () => {
    it('follows BEGIN → statements → UPDATE schema_meta → COMMIT', async () => {
      stubEmpty(queryFn);
      await runMigrations(execFn, queryFn);

      const calls = sqlCalls(execFn);
      const beginIdx = calls.findIndex((s) => s.toUpperCase() === 'BEGIN IMMEDIATE');
      const createIdx = calls.findIndex((s) => s.includes('CREATE TABLE'));
      const updateIdx = calls.findIndex((s) => s.startsWith('UPDATE schema_meta'));
      const commitIdx = calls.findIndex((s) => s.toUpperCase() === 'COMMIT');

      expect(beginIdx).toBe(0);
      expect(createIdx).toBeGreaterThan(beginIdx);
      expect(updateIdx).toBeGreaterThan(createIdx);
      expect(commitIdx).toBeGreaterThan(updateIdx);
    });
  });

  // ── Error handling ──────────────────────────────────────────────────

  describe('when a migration statement throws', () => {
    it('issues ROLLBACK and re-throws the original error', async () => {
      stubEmpty(queryFn);
      const boom = new Error('constraint failed');

      execFn.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE projects')) throw boom;
      });

      await expect(runMigrations(execFn, queryFn)).rejects.toThrow('constraint failed');

      expect(sqlCalls(execFn).some((s) => s.toUpperCase() === 'ROLLBACK')).toBe(true);
    });

    it('does NOT call COMMIT when an error occurs', async () => {
      stubEmpty(queryFn);
      execFn.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) throw new Error('disk full');
      });

      await expect(runMigrations(execFn, queryFn)).rejects.toThrow();

      expect(sqlCalls(execFn).some((s) => s.toUpperCase() === 'COMMIT')).toBe(false);
    });

    it('still re-throws even when ROLLBACK itself also fails', async () => {
      stubEmpty(queryFn);
      const originalError = new Error('original error');

      execFn.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE projects')) throw originalError;
        if (sql.toUpperCase() === 'ROLLBACK') throw new Error('rollback also failed');
      });

      await expect(runMigrations(execFn, queryFn)).rejects.toThrow('original error');
    });

    it('does NOT call UPDATE schema_meta when an error occurs mid-migration', async () => {
      stubEmpty(queryFn);
      execFn.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) throw new Error('oops');
      });

      await expect(runMigrations(execFn, queryFn)).rejects.toThrow();

      expect(sqlCalls(execFn).some((s) => s.startsWith('UPDATE schema_meta'))).toBe(false);
    });
  });

  // ── parseSql (internal — tested via runMigrations) ──────────────────

  describe('internal parseSql behaviour', () => {
    it('strips inline SQL comments — no exec call starts with "--"', async () => {
      stubEmpty(queryFn);
      await runMigrations(execFn, queryFn);

      const commentCall = sqlCalls(execFn).find((s) => s.trimStart().startsWith('--'));
      expect(commentCall).toBeUndefined();
    });

    it('does not emit empty strings as exec calls', async () => {
      stubEmpty(queryFn);
      await runMigrations(execFn, queryFn);

      for (const s of sqlCalls(execFn)) {
        expect(s.trim().length).toBeGreaterThan(0);
      }
    });

    it('trims whitespace from each statement (excluding control statements)', async () => {
      stubEmpty(queryFn);
      await runMigrations(execFn, queryFn);

      const CONTROL = new Set(['BEGIN IMMEDIATE', 'COMMIT', 'ROLLBACK']);
      const body = sqlCalls(execFn).filter((s) => !CONTROL.has(s.toUpperCase()));
      for (const s of body) {
        expect(s).toBe(s.trim());
      }
    });
  });

  // ── Return value contract ───────────────────────────────────────────

  describe('return value: number of applied migrations', () => {
    it('returns 1 when one migration is applied', async () => {
      stubEmpty(queryFn);
      await expect(runMigrations(execFn, queryFn)).resolves.toBe(1);
    });

    it('returns 0 when the DB is already at the latest version', async () => {
      stubVersion(queryFn, 999);
      await expect(runMigrations(execFn, queryFn)).resolves.toBe(0);
    });
  });

  // ── queryFn failure propagation ─────────────────────────────────────

  describe('queryFn failure propagation', () => {
    it('propagates rejections from queryFn (e.g. table does not exist yet)', async () => {
      queryFn.mockRejectedValue(new Error('no such table: schema_meta'));
      await expect(runMigrations(execFn, queryFn)).rejects.toThrow('no such table');
    });
  });
});
