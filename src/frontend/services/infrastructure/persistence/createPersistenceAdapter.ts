/**
 * Input -> Output:
 * - input: none.
 * - output: singleton PersistencePort adapter for the current environment.
 * Example:
 *   const persistence = createPersistenceAdapter();
 *
 * Selection priority:
 *   1. SQLite via wa-sqlite WASM (when Worker is available)
 *   2. IndexedDB adapter (guaranteed fallback)
 *
 * If SQLite WASM fails at runtime (e.g. binary not served correctly),
 * the adapter automatically falls back to IndexedDB.
 */

import type { PersistencePort } from './PersistencePort';
import { IndexedDbPersistenceAdapter } from './IndexedDbPersistenceAdapter';
import { SqlitePersistenceAdapter } from './SqlitePersistenceAdapter';

let cachedAdapter: PersistencePort | null = null;
let hasFallenBack = false;

const WASM_BOOTSTRAP_FAILURE_PATTERNS = [
  'incorrect response mime type',
  'application/wasm',
  'magic word',
  'failed to load wasm binary file',
  'wasm streaming compile failed',
  'failed to asynchronously prepare wasm',
  'both async and sync fetching of the wasm failed',
  'webassembly',
  'aborted(',
  'not initialised',
  'memory access out of bounds',
  'cannot read properties of',
  'unable to open database file',
];

function isSqliteAvailable(): boolean {
  // SQLite via wa-sqlite + IDBBatchAtomicVFS is unreliable under Vite's dev
  // server (WASM binary MIME issues, VFS internal IndexedDB failures, etc.).
  // Skip it in dev mode — IndexedDB works reliably as the default adapter.
  if (import.meta.env?.DEV) return false;
  return typeof Worker !== 'undefined';
}

function isKnownWasmBootstrapFailure(message: string): boolean {
  const normalized = message.toLowerCase();
  return WASM_BOOTSTRAP_FAILURE_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function createFallbackAdapter(): PersistencePort {
  if (!hasFallenBack) {
    hasFallenBack = true;
    console.warn('[Persistence] SQLite WASM failed to initialise. Falling back to IndexedDB.');
  }
  return new IndexedDbPersistenceAdapter();
}

function wrapWithFallback(primary: PersistencePort): PersistencePort {
  return new Proxy(primary, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;

      if (prop === 'isSupported') {
        return (...args: unknown[]) => (value as (...a: unknown[]) => boolean).apply(target, args);
      }

      return async (...args: unknown[]) => {
        try {
          return await (value as (...a: unknown[]) => Promise<unknown>).apply(target, args);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);

          if (isKnownWasmBootstrapFailure(message)) {
            const fallback = createFallbackAdapter();
            cachedAdapter = fallback;
            const fallbackMethod = (fallback as unknown as Record<string, unknown>)[prop as string];
            if (typeof fallbackMethod === 'function') {
              return await fallbackMethod.apply(fallback, args);
            }
          }
          throw error;
        }
      };
    },
  });
}

export function createPersistenceAdapter(): PersistencePort {
  if (!cachedAdapter) {
    if (isSqliteAvailable()) {
      cachedAdapter = wrapWithFallback(new SqlitePersistenceAdapter());
    } else {
      cachedAdapter = new IndexedDbPersistenceAdapter();
    }
  }
  return cachedAdapter;
}

export function setPersistenceAdapter(adapter: PersistencePort): void {
  cachedAdapter = adapter;
}

export function resetPersistenceAdapter(): void {
  cachedAdapter = null;
  hasFallenBack = false;
}
