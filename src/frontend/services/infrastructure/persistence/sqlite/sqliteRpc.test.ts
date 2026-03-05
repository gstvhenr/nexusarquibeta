import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSqliteRpc } from './sqliteRpc';
import type { SqliteRpcResponse, SqliteRpcRequest } from './sqliteRpc';

// ---------------------------------------------------------------------------
// Helpers — fake Worker
// ---------------------------------------------------------------------------

type WorkerMessageListener = (event: MessageEvent<SqliteRpcResponse>) => void;

function buildFakeWorker() {
  let listener: WorkerMessageListener | null = null;
  const posted: SqliteRpcRequest[] = [];

  const worker = {
    addEventListener: vi.fn((_: string, cb: WorkerMessageListener) => {
      listener = cb;
    }),
    postMessage: vi.fn((msg: SqliteRpcRequest) => {
      posted.push(msg);
    }),
    // Simulates the worker responding synchronously in the same tick
    replyOk: (id: string, result?: unknown) => {
      listener?.({ data: { id, ok: true, result } } as MessageEvent<SqliteRpcResponse>);
    },
    replyErr: (id: string, error: string) => {
      listener?.({ data: { id, ok: false, error } } as MessageEvent<SqliteRpcResponse>);
    },
    posted,
  };

  return worker as unknown as typeof worker & Worker;
}

// ---------------------------------------------------------------------------
// createSqliteRpc
// ---------------------------------------------------------------------------

describe('createSqliteRpc', () => {
  let fakeWorker: ReturnType<typeof buildFakeWorker>;
  let rpc: ReturnType<typeof createSqliteRpc>;

  beforeEach(() => {
    fakeWorker = buildFakeWorker();
    rpc = createSqliteRpc(fakeWorker as unknown as Worker);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── init ──────────────────────────────────────────────────────────────

  describe('init', () => {
    it('sends an init message to the worker', async () => {
      const promise = rpc.init();
      const msg = fakeWorker.posted[0];
      expect(msg.method).toBe('init');
      expect(typeof msg.id).toBe('string');
      expect(msg.id.startsWith('rpc-')).toBe(true);

      fakeWorker.replyOk(msg.id);
      await promise;
    });

    it('resolves void on success', async () => {
      const promise = rpc.init();
      fakeWorker.replyOk(fakeWorker.posted[0].id);
      await expect(promise).resolves.toBeUndefined();
    });

    it('rejects with the worker error message on failure', async () => {
      const promise = rpc.init();
      fakeWorker.replyErr(fakeWorker.posted[0].id, 'wasm load failed');
      await expect(promise).rejects.toThrow('wasm load failed');
    });
  });

  // ── exec ─────────────────────────────────────────────────────────────

  describe('exec', () => {
    it('sends an exec message with the provided SQL', async () => {
      const sql = 'DELETE FROM foo';
      const promise = rpc.exec(sql);
      const msg = fakeWorker.posted[0];
      expect(msg.method).toBe('exec');
      expect(msg.sql).toBe(sql);
      fakeWorker.replyOk(msg.id);
      await promise;
    });

    it('resolves void on success', async () => {
      const promise = rpc.exec('SELECT 1');
      fakeWorker.replyOk(fakeWorker.posted[0].id);
      await expect(promise).resolves.toBeUndefined();
    });

    it('rejects on worker error', async () => {
      const promise = rpc.exec('INVALID SQL');
      fakeWorker.replyErr(fakeWorker.posted[0].id, 'syntax error');
      await expect(promise).rejects.toThrow('syntax error');
    });
  });

  // ── execBatch ────────────────────────────────────────────────────────

  describe('execBatch', () => {
    it('sends an execBatch message with the statements array', async () => {
      const statements = [{ sql: 'DELETE FROM a' }, { sql: 'DELETE FROM b' }];
      const promise = rpc.execBatch(statements);
      const msg = fakeWorker.posted[0];
      expect(msg.method).toBe('execBatch');
      expect(msg.statements).toEqual(statements);
      fakeWorker.replyOk(msg.id);
      await promise;
    });

    it('resolves void when the batch succeeds', async () => {
      const promise = rpc.execBatch([{ sql: 'SELECT 1' }]);
      fakeWorker.replyOk(fakeWorker.posted[0].id);
      await expect(promise).resolves.toBeUndefined();
    });

    it('rejects when any statement in the batch fails', async () => {
      const promise = rpc.execBatch([{ sql: 'BROKEN' }]);
      fakeWorker.replyErr(fakeWorker.posted[0].id, 'constraint violation');
      await expect(promise).rejects.toThrow('constraint violation');
    });
  });

  // ── getAll ────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('sends a getAll message with the provided SQL', async () => {
      const sql = 'SELECT * FROM clients';
      const promise = rpc.getAll(sql);
      const msg = fakeWorker.posted[0];
      expect(msg.method).toBe('getAll');
      expect(msg.sql).toBe(sql);
      fakeWorker.replyOk(msg.id, [{ id: '1', name: 'ACME' }]);
      await promise;
    });

    it('resolves to the rows returned by the worker', async () => {
      type Row = { id: string; name: string };
      const rows: Row[] = [{ id: '1', name: 'ACME' }];
      const promise = rpc.getAll<Row>('SELECT * FROM clients');
      fakeWorker.replyOk(fakeWorker.posted[0].id, rows);
      await expect(promise).resolves.toEqual(rows);
    });

    it('resolves to an empty array when no rows returned', async () => {
      const promise = rpc.getAll('SELECT * FROM empty_table');
      fakeWorker.replyOk(fakeWorker.posted[0].id, []);
      await expect(promise).resolves.toEqual([]);
    });

    it('rejects on worker error', async () => {
      const promise = rpc.getAll('SELECT * FROM nonexistent');
      fakeWorker.replyErr(fakeWorker.posted[0].id, 'no such table');
      await expect(promise).rejects.toThrow('no such table');
    });
  });

  // ── checkpoint ────────────────────────────────────────────────────────

  describe('checkpoint', () => {
    it('sends a checkpoint message to the worker', async () => {
      const promise = rpc.checkpoint();
      const msg = fakeWorker.posted[0];
      expect(msg.method).toBe('checkpoint');
      fakeWorker.replyOk(msg.id);
      await promise;
    });

    it('resolves void on success', async () => {
      const promise = rpc.checkpoint();
      fakeWorker.replyOk(fakeWorker.posted[0].id);
      await expect(promise).resolves.toBeUndefined();
    });

    it('rejects on worker error', async () => {
      const promise = rpc.checkpoint();
      fakeWorker.replyErr(fakeWorker.posted[0].id, 'checkpoint failed');
      await expect(promise).rejects.toThrow('checkpoint failed');
    });
  });

  // ── ID generation ─────────────────────────────────────────────────────

  describe('message ID generation', () => {
    it('each call uses a unique ID', async () => {
      const p1 = rpc.exec('SELECT 1');
      const p2 = rpc.exec('SELECT 2');
      const id1 = fakeWorker.posted[0].id;
      const id2 = fakeWorker.posted[1].id;
      expect(id1).not.toBe(id2);
      fakeWorker.replyOk(id1);
      fakeWorker.replyOk(id2);
      await Promise.all([p1, p2]);
    });

    it('IDs follow the rpc-<timestamp>-<counter> pattern', async () => {
      const promise = rpc.init();
      const id = fakeWorker.posted[0].id;
      expect(id).toMatch(/^rpc-\d+-\d+$/);
      fakeWorker.replyOk(id);
      await promise;
    });
  });

  // ── Unknown worker error fallback ─────────────────────────────────────

  describe('error fallback', () => {
    it('uses "Unknown SQLite worker error" when worker sends no error message', async () => {
      const promise = rpc.exec('SELECT 1');
      const id = fakeWorker.posted[0].id;
      // Manually simulate a failed response with no error field
      const fakeListener = fakeWorker.addEventListener.mock.calls[0][1] as WorkerMessageListener;
      fakeListener({ data: { id, ok: false } } as MessageEvent<SqliteRpcResponse>);
      await expect(promise).rejects.toThrow('Unknown SQLite worker error');
    });
  });

  // ── Ignored responses ─────────────────────────────────────────────────

  describe('ignored responses', () => {
    it('silently ignores responses with unknown IDs', () => {
      // No pending promise with this ID — should not throw
      expect(() => {
        fakeWorker.replyOk('unknown-id-xyz', 'some result');
      }).not.toThrow();
    });
  });
});
