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
 */

import type { PersistencePort } from './PersistencePort';
import { IndexedDbPersistenceAdapter } from './IndexedDbPersistenceAdapter';
import { SqlitePersistenceAdapter } from './SqlitePersistenceAdapter';

let cachedAdapter: PersistencePort | null = null;

function isSqliteAvailable(): boolean {
  return typeof Worker !== 'undefined';
}

export function createPersistenceAdapter(): PersistencePort {
  if (!cachedAdapter) {
    cachedAdapter = isSqliteAvailable()
      ? new SqlitePersistenceAdapter()
      : new IndexedDbPersistenceAdapter();
  }
  return cachedAdapter;
}

export function setPersistenceAdapter(adapter: PersistencePort): void {
  cachedAdapter = adapter;
}

export function resetPersistenceAdapter(): void {
  cachedAdapter = null;
}
