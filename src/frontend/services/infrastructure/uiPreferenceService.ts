import { createPersistenceAdapter, isRealtimePersistencePort } from './persistence';

const persistence = createPersistenceAdapter();

const KEY_PREFIX = 'ui_pref:';

type PreferenceChangeSource = 'local' | 'remote' | 'system';

interface PreferenceChangeEvent<T = unknown> {
  key: string;
  value: T | null;
  source: PreferenceChangeSource;
}

type PreferenceListener = (event: PreferenceChangeEvent) => void;
const listeners = new Set<PreferenceListener>();

const normalizeKey = (key: string): string => `${KEY_PREFIX}${key}`;

function notifyListeners(event: PreferenceChangeEvent): void {
  listeners.forEach((listener) => listener(event));
}

if (isRealtimePersistencePort(persistence)) {
  persistence.subscribeExternalChanges((event) => {
    if (event.kind !== 'preference') {
      return;
    }

    const key = event.key.startsWith(KEY_PREFIX) ? event.key.slice(KEY_PREFIX.length) : event.key;
    notifyListeners({
      key,
      value: event.value,
      source: 'remote',
    });
  });
}

async function getItem<T>(key: string, initialValue: T): Promise<T> {
  const persistedValue = await persistence.readPreference<T>(normalizeKey(key));
  return persistedValue ?? initialValue;
}

async function setItem<T>(
  key: string,
  value: T,
  options?: { source?: PreferenceChangeSource; silent?: boolean },
): Promise<void> {
  await persistence.writePreference(normalizeKey(key), value);
  if (!options?.silent) {
    notifyListeners({
      key,
      value,
      source: options?.source ?? 'system',
    });
  }
}

async function removeItem(
  key: string,
  options?: { source?: PreferenceChangeSource; silent?: boolean },
): Promise<void> {
  await persistence.removePreference(normalizeKey(key));
  if (!options?.silent) {
    notifyListeners({
      key,
      value: null,
      source: options?.source ?? 'system',
    });
  }
}

function subscribe(listener: PreferenceListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const uiPreferenceService = {
  getItem,
  setItem,
  removeItem,
  subscribe,
};
