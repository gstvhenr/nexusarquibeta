/**
 * SQLite Web Worker — runs wa-sqlite WASM inside a dedicated Worker thread.
 *
 * - input: RPC messages from the main thread.
 * - output: query results or acknowledgements via postMessage.
 *
 * Uses IDBBatchAtomicVFS for persistent storage.
 * SQL schema is defined in schema.sql and pragmas.sql.
 */

import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite-async.mjs';
import * as SQLite from 'wa-sqlite';
// @ts-expect-error — wa-sqlite VFS modules lack TS declarations
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js';
import type { SqliteRpcRequest, SqliteRpcResponse } from './sqliteRpc';
import { getSchemaStatements, getDurabilityPragmas } from './sqliteSchema';

const DB_NAME = 'nexus_arqui';

let sqlite3: ReturnType<typeof SQLite.Factory> | null = null;
let db: number | null = null;

async function initDatabase(): Promise<void> {
  if (db !== null) return;

  const module = await SQLiteESMFactory();
  sqlite3 = SQLite.Factory(module);

  const vfs = new IDBBatchAtomicVFS(DB_NAME);
  await vfs.isReady;
  sqlite3.vfs_register(vfs, true);

  db = await sqlite3.open_v2(DB_NAME);

  for (const pragma of getDurabilityPragmas()) {
    await execSingle(pragma);
  }

  for (const statement of getSchemaStatements()) {
    await execSingle(statement);
  }

  const rows = await getAllRows<{ version: number }>('SELECT version FROM schema_meta LIMIT 1');
  if (rows.length === 0) {
    await execSingle(`INSERT INTO schema_meta (version, migrated_at) VALUES (1, ${Date.now()})`);
  }
}

async function execSingle(sql: string): Promise<void> {
  if (!sqlite3 || db === null) throw new Error('Database not initialised');
  await sqlite3.exec(db, sql, () => {});
}

async function getAllRows<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  if (!sqlite3 || db === null) throw new Error('Database not initialised');

  const results: T[] = [];
  await sqlite3.exec(db, sql, (row: unknown[], columns: string[]) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    results.push(obj as T);
  });
  return results;
}

async function execBatch(statements: Array<{ sql: string }>): Promise<void> {
  if (!sqlite3 || db === null) throw new Error('Database not initialised');

  await execSingle('BEGIN IMMEDIATE');
  try {
    for (const { sql } of statements) {
      await execSingle(sql);
    }
    await execSingle('COMMIT');
  } catch (error) {
    try {
      await execSingle('ROLLBACK');
    } catch {
      // ROLLBACK failure = no active transaction — safe to ignore
    }
    throw error;
  }
}

// ── Message Handler ────────────────────────────────────────────────

self.addEventListener('message', async (event: MessageEvent<SqliteRpcRequest>) => {
  const { id, method, sql, statements } = event.data;

  const respond = (ok: boolean, result?: unknown, error?: string) => {
    self.postMessage({ id, ok, result, error } satisfies SqliteRpcResponse);
  };

  try {
    switch (method) {
      case 'init':
        await initDatabase();
        respond(true);
        break;
      case 'exec':
        if (!sql) throw new Error('exec requires sql');
        await execSingle(sql);
        respond(true);
        break;
      case 'execBatch':
        if (!statements) throw new Error('execBatch requires statements');
        await execBatch(statements);
        respond(true);
        break;
      case 'getAll':
        if (!sql) throw new Error('getAll requires sql');
        respond(true, await getAllRows(sql));
        break;
      case 'checkpoint':
        await execSingle('PRAGMA wal_checkpoint(TRUNCATE)');
        respond(true);
        break;
      default:
        respond(false, undefined, `Unknown method: ${method}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`[SQLite Worker] ${method} failed:`, error);
    respond(false, undefined, message);
  }
});
