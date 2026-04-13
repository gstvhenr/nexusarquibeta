/**
 * SQLite implementation of PersistencePort.
 *
 * - input: PersistencePort method calls from consumers.
 * - output: translates each call into SQL via the sqliteRpc Worker bridge.
 *
 * All writes use atomic transactions. SQL schema is in schema.sql.
 */

import type {
  PersistencePort,
  BackupMetadata,
  BackupRecord,
  WriteBackupOptions,
  CounterReservationResult,
} from './PersistencePort';
import { createSqliteRpc, type SqliteRpcClient } from './sqlite/sqliteRpc';
import { ENTITY_TABLE_MAP, ARRAY_ENTITY_KEYS, SCALAR_KEYS } from './sqlite/sqliteSchema';

const escapeSql = (str: string): string => str.replace(/'/g, "''");

export class SqlitePersistenceAdapter implements PersistencePort {
  private rpc: SqliteRpcClient;
  private initPromise: Promise<void> | null = null;

  constructor() {
    const worker = new Worker(new URL('./sqlite/sqliteWorker.ts', import.meta.url), {
      type: 'module',
    });
    this.rpc = createSqliteRpc(worker);
  }

  private async ensureReady(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.rpc.init();
    }
    await this.initPromise;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────

  isSupported(): boolean {
    return typeof Worker !== 'undefined';
  }

  // ── Snapshot ────────────────────────────────────────────────────────

  async readSnapshot<T>(): Promise<T | null> {
    await this.ensureReady();

    const result: Record<string, unknown> = {};
    let hasData = false;

    for (const key of ARRAY_ENTITY_KEYS) {
      const table = ENTITY_TABLE_MAP[key];
      const rows = await this.rpc.getAll<{ data: string }>(`SELECT data FROM ${table}`);
      if (rows.length > 0) hasData = true;
      result[key] = rows.map((r) => JSON.parse(r.data) as unknown);
    }

    for (const key of SCALAR_KEYS) {
      const rows = await this.rpc.getAll<{ value: string }>(
        `SELECT value FROM system_config WHERE key = '${key}'`,
      );
      if (rows.length > 0) {
        hasData = true;
        result[key] = JSON.parse(rows[0].value) as unknown;
      }
    }

    return hasData ? (result as T) : null;
  }

  async writeSnapshot<T>(snapshot: T): Promise<void> {
    await this.ensureReady();

    const data = snapshot as Record<string, unknown>;
    const stmts: Array<{ sql: string }> = [];
    const now = Date.now();

    for (const key of ARRAY_ENTITY_KEYS) {
      const table = ENTITY_TABLE_MAP[key];
      const items = data[key];
      if (!Array.isArray(items)) continue;

      stmts.push({ sql: `DELETE FROM ${table}` });
      for (const item of items) {
        const rec = item as Record<string, unknown>;
        const id = escapeSql(String(rec.id ?? crypto.randomUUID()));
        const json = escapeSql(JSON.stringify(rec));
        stmts.push({
          sql: `INSERT INTO ${table} (id, data, updated_at) VALUES ('${id}', '${json}', ${now})`,
        });
      }
    }

    for (const key of SCALAR_KEYS) {
      if (data[key] === undefined) continue;
      const val = escapeSql(JSON.stringify(data[key]));
      stmts.push({
        sql: `INSERT OR REPLACE INTO system_config (key, value, updated_at) VALUES ('${key}', '${val}', ${now})`,
      });
    }

    if (stmts.length > 0) await this.rpc.execBatch(stmts);
  }

  async clearSnapshot(): Promise<void> {
    await this.ensureReady();
    const stmts: Array<{ sql: string }> = [];
    for (const key of ARRAY_ENTITY_KEYS) {
      stmts.push({ sql: `DELETE FROM ${ENTITY_TABLE_MAP[key]}` });
    }
    stmts.push({ sql: 'DELETE FROM system_config' });
    await this.rpc.execBatch(stmts);
  }

  // ── Entity state ───────────────────────────────────────────────────

  async readEntityState<T>(entities?: string[]): Promise<Partial<T> | null> {
    await this.ensureReady();

    const keys = entities ?? [...ARRAY_ENTITY_KEYS, ...SCALAR_KEYS];
    const result: Record<string, unknown> = {};
    let hasData = false;

    for (const key of keys) {
      if (ARRAY_ENTITY_KEYS.includes(key)) {
        const table = ENTITY_TABLE_MAP[key];
        if (!table) continue;
        const rows = await this.rpc.getAll<{ data: string }>(`SELECT data FROM ${table}`);
        if (rows.length > 0) hasData = true;
        result[key] = rows.map((r) => JSON.parse(r.data) as unknown);
      } else if ((SCALAR_KEYS as readonly string[]).includes(key)) {
        const rows = await this.rpc.getAll<{ value: string }>(
          `SELECT value FROM system_config WHERE key = '${key}'`,
        );
        if (rows.length > 0) {
          hasData = true;
          result[key] = JSON.parse(rows[0].value) as unknown;
        }
      }
    }

    return hasData ? (result as Partial<T>) : null;
  }

  async writeEntityState(state: Record<string, unknown>): Promise<void> {
    await this.ensureReady();

    const stmts: Array<{ sql: string }> = [];
    const now = Date.now();

    for (const [key, value] of Object.entries(state)) {
      if (ARRAY_ENTITY_KEYS.includes(key)) {
        const table = ENTITY_TABLE_MAP[key];
        if (!table || !Array.isArray(value)) continue;

        stmts.push({ sql: `DELETE FROM ${table}` });
        for (const item of value) {
          const rec = item as Record<string, unknown>;
          const id = escapeSql(String(rec.id ?? crypto.randomUUID()));
          const json = escapeSql(JSON.stringify(rec));
          stmts.push({
            sql: `INSERT INTO ${table} (id, data, updated_at) VALUES ('${id}', '${json}', ${now})`,
          });
        }
      } else if ((SCALAR_KEYS as readonly string[]).includes(key)) {
        const val = escapeSql(JSON.stringify(value));
        stmts.push({
          sql: `INSERT OR REPLACE INTO system_config (key, value, updated_at) VALUES ('${key}', '${val}', ${now})`,
        });
      }
    }

    if (stmts.length > 0) await this.rpc.execBatch(stmts);
  }

  // ── UI Preferences ─────────────────────────────────────────────────

  async readPreference<T>(key: string): Promise<T | null> {
    await this.ensureReady();
    const safeKey = escapeSql(key);
    const rows = await this.rpc.getAll<{ value: string }>(
      `SELECT value FROM ui_preferences WHERE key = '${safeKey}'`,
    );
    if (rows.length === 0) return null;
    return JSON.parse(rows[0].value) as T;
  }

  async writePreference<T>(key: string, value: T): Promise<void> {
    await this.ensureReady();
    const safeKey = escapeSql(key);
    const safeVal = escapeSql(JSON.stringify(value));
    await this.rpc.exec(
      `INSERT OR REPLACE INTO ui_preferences (key, value, updated_at) VALUES ('${safeKey}', '${safeVal}', ${Date.now()})`,
    );
  }

  async removePreference(key: string): Promise<void> {
    await this.ensureReady();
    await this.rpc.exec(`DELETE FROM ui_preferences WHERE key = '${escapeSql(key)}'`);
  }

  // ── Backups ────────────────────────────────────────────────────────

  async listBackups(): Promise<BackupMetadata[]> {
    await this.ensureReady();
    const rows = await this.rpc.getAll<{
      id: string;
      created_at: number;
      size_bytes: number;
      hash: string;
      reason: string;
    }>(
      'SELECT id, created_at, size_bytes, hash, reason FROM automatic_backups ORDER BY created_at DESC',
    );

    return rows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      sizeBytes: r.size_bytes,
      hash: r.hash,
      reason: r.reason as 'auto' | 'manual',
    }));
  }

  async writeBackup<T>(payload: T, options?: WriteBackupOptions): Promise<BackupMetadata> {
    await this.ensureReady();

    const id = options?.id ?? crypto.randomUUID();
    const now = Date.now();
    const json = JSON.stringify(payload);
    const sizeBytes = new Blob([json]).size;

    let hash = 0;
    for (let i = 0; i < json.length; i += 1) {
      hash = (hash * 31 + json.charCodeAt(i)) | 0;
    }
    const hashStr = Math.abs(hash).toString(16);
    const reason = options?.reason ?? 'auto';

    const stmts: Array<{ sql: string }> = [
      {
        sql: `INSERT INTO automatic_backups (id, created_at, payload, size_bytes, hash, reason) VALUES ('${id}', ${now}, '${escapeSql(json)}', ${sizeBytes}, '${hashStr}', '${reason}')`,
      },
    ];

    if (options?.maxEntries) {
      stmts.push({
        sql: `DELETE FROM automatic_backups WHERE id NOT IN (SELECT id FROM automatic_backups ORDER BY created_at DESC LIMIT ${options.maxEntries})`,
      });
    }

    await this.rpc.execBatch(stmts);
    return { id, createdAt: now, sizeBytes, hash: hashStr, reason };
  }

  async readBackup<T>(id: string): Promise<BackupRecord<T> | null> {
    await this.ensureReady();
    const rows = await this.rpc.getAll<{
      id: string;
      created_at: number;
      payload: string;
      size_bytes: number;
      hash: string;
      reason: string;
    }>(`SELECT * FROM automatic_backups WHERE id = '${escapeSql(id)}'`);

    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      createdAt: r.created_at,
      payload: JSON.parse(r.payload) as T,
      sizeBytes: r.size_bytes,
      hash: r.hash,
      reason: r.reason as 'auto' | 'manual',
    };
  }

  async clearBackups(): Promise<void> {
    await this.ensureReady();
    await this.rpc.exec('DELETE FROM automatic_backups');
  }

  // ── Counter Reservation ────────────────────────────────────────────

  async reserveGlobalIdentifier(defaultCounter = 741): Promise<CounterReservationResult> {
    await this.ensureReady();

    const rows = await this.rpc.getAll<{ value: string }>(
      "SELECT value FROM system_config WHERE key = 'globalIdentifierCounter'",
    );

    let current: number;
    if (rows.length === 0) {
      current = defaultCounter;
      await this.rpc.exec(
        `INSERT INTO system_config (key, value, updated_at) VALUES ('globalIdentifierCounter', '${current}', ${Date.now()})`,
      );
    } else {
      current = Number(JSON.parse(rows[0].value));
    }

    const next = current + 1;
    await this.rpc.exec(
      `UPDATE system_config SET value = '${next}', updated_at = ${Date.now()} WHERE key = 'globalIdentifierCounter'`,
    );

    return { reservedValue: current, nextValue: next };
  }
}
