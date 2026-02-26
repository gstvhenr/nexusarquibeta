import { createPersistenceAdapter } from './persistence';

const persistence = createPersistenceAdapter();

const KEY_PREFIX = 'ui_pref:';

const normalizeKey = (key: string): string => `${KEY_PREFIX}${key}`;

async function getItem<T>(key: string, initialValue: T): Promise<T> {
  const persistedValue = await persistence.readPreference<T>(normalizeKey(key));
  return persistedValue ?? initialValue;
}

async function setItem<T>(key: string, value: T): Promise<void> {
  await persistence.writePreference(normalizeKey(key), value);
}

async function removeItem(key: string): Promise<void> {
  await persistence.removePreference(normalizeKey(key));
}

export const uiPreferenceService = {
  getItem,
  setItem,
  removeItem,
};
