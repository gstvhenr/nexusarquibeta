import {
  DEFAULT_FINANCIAL_LOCK_ENABLED,
  DEFAULT_FINANCIAL_PASSWORD,
  DEFAULT_THEME,
} from '../../constants/preferences';

export const SYNCED_PREFERENCE_KEYS = [
  'theme',
  'financial_password',
  'financial_lock_enabled',
] as const;

type SyncedPreferenceKey = (typeof SYNCED_PREFERENCE_KEYS)[number];

export const SYNCED_PREFERENCE_DEFAULTS: Record<SyncedPreferenceKey, unknown> = {
  theme: DEFAULT_THEME,
  financial_password: DEFAULT_FINANCIAL_PASSWORD,
  financial_lock_enabled: DEFAULT_FINANCIAL_LOCK_ENABLED,
};
