/**
 * Input -> Output:
 * - input: none.
 * - output: singleton PersistencePort adapter for the current environment.
 * Example:
 *   const persistence = createPersistenceAdapter();
 *
 * Selection priority:
 *   1. Firebase adapter (`VITE_PERSISTENCE_ADAPTER=firebase`, default when configured)
 *   2. IndexedDB adapter (`VITE_PERSISTENCE_ADAPTER=indexeddb`)
 *   3. SQLite adapter (`VITE_PERSISTENCE_ADAPTER=sqlite`, opt-in only)
 *
 * If Firebase is requested but unavailable (missing env or runtime init failure),
 * the factory falls back to IndexedDB so the app remains usable offline.
 */

import type { PersistencePort } from './PersistencePort';
import { isFirebaseConfigured } from './firebaseConfig';
import { FirebasePersistenceAdapter } from './firebasePersistenceAdapter';
import { IndexedDbPersistenceAdapter } from './IndexedDbPersistenceAdapter';
import { SqlitePersistenceAdapter } from './SqlitePersistenceAdapter';

let cachedAdapter: PersistencePort | null = null;

type AdapterSelection = 'firebase' | 'indexeddb' | 'sqlite';

function getRequestedAdapter(): AdapterSelection {
  const raw = import.meta.env.VITE_PERSISTENCE_ADAPTER?.trim().toLowerCase();

  if (raw === 'indexeddb' || raw === 'sqlite' || raw === 'firebase') {
    return raw;
  }

  return 'firebase';
}

export function createPersistenceAdapter(): PersistencePort {
  if (!cachedAdapter) {
    const requestedAdapter = getRequestedAdapter();

    if (requestedAdapter === 'sqlite') {
      cachedAdapter = new SqlitePersistenceAdapter();
      return cachedAdapter;
    }

    if (requestedAdapter === 'firebase' && isFirebaseConfigured()) {
      cachedAdapter = new FirebasePersistenceAdapter();
      return cachedAdapter;
    }

    if (requestedAdapter === 'firebase' && !isFirebaseConfigured()) {
      console.warn(
        '[Persistence] Firebase não configurado. Fazendo fallback automático para IndexedDB.',
      );
    }

    cachedAdapter = new IndexedDbPersistenceAdapter();
  }
  return cachedAdapter;
}

export function setPersistenceAdapter(adapter: PersistencePort): void {
  cachedAdapter = adapter;
}

export function resetPersistenceAdapter(): void {
  const adapter = cachedAdapter as { dispose?: () => void } | null;
  adapter?.dispose?.();
  cachedAdapter = null;
}
