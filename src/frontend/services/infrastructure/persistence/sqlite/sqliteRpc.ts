/**
 * Type-safe RPC layer between the main thread and the SQLite Web Worker.
 *
 * - input: SQL operations from the main thread.
 * - output: results relayed back from the Worker.
 */

/** Message sent from main thread → worker. */
export interface SqliteRpcRequest {
  id: string;
  method: 'exec' | 'execBatch' | 'getAll' | 'checkpoint' | 'init';
  sql?: string;
  statements?: Array<{ sql: string }>;
}

/** Message sent from worker → main thread. */
export interface SqliteRpcResponse {
  id: string;
  ok: boolean;
  result?: unknown;
  error?: string;
}

let nextId = 0;
const generateId = (): string => `rpc-${Date.now()}-${nextId++}`;

/**
 * Creates an RPC client that wraps a Web Worker.
 *
 * - input: a Worker instance pointing to sqliteWorker.ts.
 * - output: typed async methods to call the worker.
 */
export function createSqliteRpc(worker: Worker) {
  const pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();

  worker.addEventListener('message', (event: MessageEvent<SqliteRpcResponse>) => {
    const { id, ok, result, error } = event.data;
    const entry = pending.get(id);
    if (!entry) return;
    pending.delete(id);

    if (ok) {
      entry.resolve(result);
    } else {
      entry.reject(new Error(error ?? 'Unknown SQLite worker error'));
    }
  });

  const call = <T = unknown>(request: Omit<SqliteRpcRequest, 'id'>): Promise<T> => {
    const id = generateId();
    return new Promise<T>((resolve, reject) => {
      pending.set(id, {
        resolve: resolve as (v: unknown) => void,
        reject,
      });
      worker.postMessage({ ...request, id } satisfies SqliteRpcRequest);
    });
  };

  return {
    init: () => call<void>({ method: 'init' }),
    exec: (sql: string) => call<void>({ method: 'exec', sql }),
    execBatch: (statements: Array<{ sql: string }>) =>
      call<void>({ method: 'execBatch', statements }),
    getAll: <T = Record<string, unknown>>(sql: string) => call<T[]>({ method: 'getAll', sql }),
    checkpoint: () => call<void>({ method: 'checkpoint' }),
  };
}

export type SqliteRpcClient = ReturnType<typeof createSqliteRpc>;
