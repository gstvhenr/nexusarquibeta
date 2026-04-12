import {
  DEFAULT_FINANCIAL_LOCK_ENABLED,
  DEFAULT_FINANCIAL_PASSWORD,
  DEFAULT_THEME,
} from '../../constants/preferences';
import type { SyncedPreferenceEntry, SyncedPreferencesFile } from './driveSyncTypes';

export const SYNCED_PREFERENCE_KEYS = [
  'theme',
  'financial_password',
  'financial_lock_enabled',
] as const;

export type SyncedPreferenceKey = (typeof SYNCED_PREFERENCE_KEYS)[number];

export const SYNCED_PREFERENCE_DEFAULTS: Record<SyncedPreferenceKey, unknown> = {
  theme: DEFAULT_THEME,
  financial_password: DEFAULT_FINANCIAL_PASSWORD,
  financial_lock_enabled: DEFAULT_FINANCIAL_LOCK_ENABLED,
};

export function isSyncedPreferenceKey(value: string): value is SyncedPreferenceKey {
  return (SYNCED_PREFERENCE_KEYS as readonly string[]).includes(value);
}

export function normalizeSyncedPreferencesFile(
  value: unknown,
): Partial<Record<SyncedPreferenceKey, SyncedPreferenceEntry>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const normalized: Partial<Record<SyncedPreferenceKey, SyncedPreferenceEntry>> = {};

  for (const key of SYNCED_PREFERENCE_KEYS) {
    const entry = (value as Record<string, unknown>)[key];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      continue;
    }

    const updatedAt = (entry as { updatedAt?: unknown }).updatedAt;
    if (typeof updatedAt !== 'number' || !Number.isFinite(updatedAt) || updatedAt <= 0) {
      continue;
    }

    normalized[key] = {
      value: (entry as { value?: unknown }).value,
      updatedAt,
    };
  }

  return normalized;
}

export function buildSyncedPreferencesFile(
  values: Partial<Record<SyncedPreferenceKey, unknown>>,
  updatedAtMap: Partial<Record<SyncedPreferenceKey, number>>,
): SyncedPreferencesFile {
  const payload: SyncedPreferencesFile = {};

  for (const key of SYNCED_PREFERENCE_KEYS) {
    const updatedAt = updatedAtMap[key];
    if (typeof updatedAt !== 'number' || !Number.isFinite(updatedAt) || updatedAt <= 0) {
      continue;
    }

    payload[key] = {
      value: values[key] ?? SYNCED_PREFERENCE_DEFAULTS[key],
      updatedAt,
    };
  }

  return payload;
}
