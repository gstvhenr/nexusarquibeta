import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks — only the ones actually consumed by vi.mock factories
// ---------------------------------------------------------------------------
const { mockGetSchemaSql, mockGetPragmasSql, mockSqliteEsmFactory, mockVfsIsReady, mockWasmUrl } =
  vi.hoisted(() => ({
    mockGetSchemaSql: vi.fn().mockReturnValue('CREATE TABLE foo (id TEXT)'),
    mockGetPragmasSql: vi.fn().mockReturnValue('PRAGMA journal_mode=WAL'),
    mockSqliteEsmFactory: vi.fn().mockResolvedValue({}),
    mockVfsIsReady: Promise.resolve(),
    mockWasmUrl: '/assets/wa-sqlite-async.mock.wasm',
  }));

// Mock wa-sqlite modules
vi.mock('wa-sqlite/dist/wa-sqlite-async.mjs', () => ({
  default: mockSqliteEsmFactory,
}));

vi.mock('wa-sqlite', () => ({
  Factory: vi.fn().mockReturnValue({
    vfs_register: vi.fn(),
    open_v2: vi.fn().mockResolvedValue(1),
    exec: vi
      .fn()
      .mockImplementation(
        (_db: number, sql: string, callback: (row: unknown[], columns: string[]) => void) => {
          // For SELECT queries, simulate one row; for others do nothing
          if (sql.startsWith('SELECT')) {
            callback(['1'], ['version']);
          }
          return Promise.resolve();
        },
      ),
  }),
}));

vi.mock('wa-sqlite/dist/wa-sqlite-async.wasm?url', () => ({
  default: mockWasmUrl,
}));

vi.mock('wa-sqlite/src/examples/IDBBatchAtomicVFS.js', () => ({
  IDBBatchAtomicVFS: vi.fn().mockImplementation(() => ({ isReady: mockVfsIsReady })),
}));

vi.mock('./sqliteSchema', () => ({
  getSchemaStatements: mockGetSchemaSql,
  getDurabilityPragmas: mockGetPragmasSql,
}));

// ---------------------------------------------------------------------------
// sqliteWorker — Message handler tests
//
// The worker runs as a shared global (self.addEventListener). Because
// the worker imports are module-level, we test the behavior by simulating
// RPC messages via the saved `self.addEventListener` callback.
// ---------------------------------------------------------------------------

type WorkerHandler = (event: MessageEvent) => void;

type CapturingGlobal = {
  addEventListener: (type: string, handler: WorkerHandler) => void;
  location: { href: string };
  postMessage: (data: unknown) => void;
  _handler?: WorkerHandler;
  _messages: unknown[];
};

type SqliteFactoryConfig = {
  locateFile?: (file: string, prefix: string) => string;
  printErr?: (message: unknown) => void;
};

describe('sqliteWorker — message handler', () => {
  let selfGlobal: CapturingGlobal;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let originalSelf: typeof globalThis;

  beforeEach(async () => {
    // Reset module state so each test gets a fresh db = null
    vi.resetModules();
    mockSqliteEsmFactory.mockResolvedValue({});

    selfGlobal = {
      _messages: [],
      addEventListener(_type: string, handler: WorkerHandler) {
        this._handler = handler;
      },
      location: { href: 'https://example.test/workers/sqliteWorker.js' },
      postMessage(data: unknown) {
        this._messages.push(data);
      },
    };

    originalSelf = globalThis.self as unknown as typeof globalThis;
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // @ts-expect-error — override self for Worker simulation
    globalThis.self = selfGlobal;

    // Import the worker module fresh — this registers self.addEventListener
    await import('./sqliteWorker');
  });

  afterEach(() => {
    // @ts-expect-error — restore original self
    globalThis.self = originalSelf;
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  const dispatch = (data: object): void => {
    selfGlobal._handler?.({ data } as MessageEvent);
  };

  const lastResponse = () => selfGlobal._messages.at(-1) as Record<string, unknown>;
  const flushWorker = () => new Promise(process.nextTick);

  // ── init ────────────────────────────────────────────────────────────

  describe('init', () => {
    it('responds with ok:true after initialising the database', async () => {
      dispatch({ id: 'rpc-1', method: 'init' });
      await flushWorker();
      const res = lastResponse();
      expect(res.id).toBe('rpc-1');
      expect(res.ok).toBe(true);
    });

    it('passes locateFile for explicit WASM resolution and suppresses known factory noise', async () => {
      dispatch({ id: 'rpc-locate', method: 'init' });
      await flushWorker();

      const [config] = mockSqliteEsmFactory.mock.calls[0] as [SqliteFactoryConfig];
      expect(config).toBeDefined();
      expect(config.locateFile?.('wa-sqlite-async.wasm', '/ignored/')).toBe(
        'https://example.test/assets/wa-sqlite-async.mock.wasm',
      );
      expect(config.locateFile?.('other-file.data', '/prefix/')).toBe('/prefix/other-file.data');

      config.printErr?.('wasm streaming compile failed: Incorrect response MIME type');
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      config.printErr?.('unexpected sqlite factory error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('unexpected sqlite factory error');
    });

    it('responds ok:false without logging when init hits a known WASM bootstrap failure', async () => {
      mockSqliteEsmFactory.mockRejectedValueOnce(
        new Error("Incorrect response MIME type. Expected 'application/wasm'"),
      );

      dispatch({ id: 'rpc-init-error', method: 'init' });
      await flushWorker();

      const res = lastResponse();
      expect(res.id).toBe('rpc-init-error');
      expect(res.ok).toBe(false);
      expect(String(res.error)).toContain('Incorrect response MIME type');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  // ── exec ────────────────────────────────────────────────────────────

  describe('exec', () => {
    it('responds ok:true for a valid SQL statement', async () => {
      // First initialise
      dispatch({ id: 'rpc-init', method: 'init' });
      await flushWorker();

      dispatch({ id: 'rpc-2', method: 'exec', sql: 'DELETE FROM foo' });
      await flushWorker();
      const res = lastResponse();
      expect(res.id).toBe('rpc-2');
      expect(res.ok).toBe(true);
    });

    it('responds ok:false when sql is missing', async () => {
      dispatch({ id: 'rpc-init', method: 'init' });
      await flushWorker();

      dispatch({ id: 'rpc-3', method: 'exec' });
      await flushWorker();
      const res = lastResponse();
      expect(res.id).toBe('rpc-3');
      expect(res.ok).toBe(false);
      expect(typeof res.error).toBe('string');
    });
  });

  // ── execBatch ────────────────────────────────────────────────────────

  describe('execBatch', () => {
    it('responds ok:true when statements are provided', async () => {
      dispatch({ id: 'rpc-init', method: 'init' });
      await flushWorker();

      dispatch({
        id: 'rpc-4',
        method: 'execBatch',
        statements: [{ sql: 'DELETE FROM a' }, { sql: 'DELETE FROM b' }],
      });
      await flushWorker();
      const res = lastResponse();
      expect(res.id).toBe('rpc-4');
      expect(res.ok).toBe(true);
    });

    it('responds ok:false when statements are missing', async () => {
      dispatch({ id: 'rpc-init', method: 'init' });
      await flushWorker();

      dispatch({ id: 'rpc-5', method: 'execBatch' });
      await flushWorker();
      const res = lastResponse();
      expect(res.ok).toBe(false);
    });
  });

  // ── getAll ────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('responds ok:true with a result array for a valid query', async () => {
      dispatch({ id: 'rpc-init', method: 'init' });
      await flushWorker();

      dispatch({ id: 'rpc-6', method: 'getAll', sql: 'SELECT 1' });
      await flushWorker();
      const res = lastResponse();
      expect(res.id).toBe('rpc-6');
      expect(res.ok).toBe(true);
      expect(Array.isArray(res.result)).toBe(true);
    });

    it('responds ok:false when sql is missing', async () => {
      dispatch({ id: 'rpc-init', method: 'init' });
      await flushWorker();

      dispatch({ id: 'rpc-7', method: 'getAll' });
      await flushWorker();
      const res = lastResponse();
      expect(res.ok).toBe(false);
    });
  });

  // ── checkpoint ───────────────────────────────────────────────────────

  describe('checkpoint', () => {
    it('responds ok:true and runs PRAGMA wal_checkpoint', async () => {
      dispatch({ id: 'rpc-init', method: 'init' });
      await flushWorker();

      dispatch({ id: 'rpc-8', method: 'checkpoint' });
      await flushWorker();
      const res = lastResponse();
      expect(res.id).toBe('rpc-8');
      expect(res.ok).toBe(true);
    });
  });

  // ── unknown method ────────────────────────────────────────────────────

  describe('unknown method', () => {
    it('responds ok:false with an "Unknown method" error', async () => {
      dispatch({ id: 'rpc-init', method: 'init' });
      await flushWorker();

      dispatch({ id: 'rpc-9', method: 'nonExistent' });
      await flushWorker();
      const res = lastResponse();
      expect(res.ok).toBe(false);
      expect(String(res.error)).toContain('Unknown method');
    });
  });
});
