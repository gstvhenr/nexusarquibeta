const PUBLIC_RUNTIME_ENV_KEYS = [
  'VITE_PERSISTENCE_ADAPTER',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export type PublicRuntimeEnvKey = (typeof PUBLIC_RUNTIME_ENV_KEYS)[number];

export type PublicRuntimeEnvMap = Partial<Record<PublicRuntimeEnvKey, string>>;

function readRuntimeEnvMap(): PublicRuntimeEnvMap | null {
  if (typeof window === 'undefined' || typeof window.__NEXUS_ARQUI_RUNTIME_CONFIG !== 'object') {
    return null;
  }

  return window.__NEXUS_ARQUI_RUNTIME_CONFIG;
}

export function readPublicRuntimeEnv(key: PublicRuntimeEnvKey): string {
  const runtimeEnv = readRuntimeEnvMap();
  const value = runtimeEnv?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function isPublishedBrowserRuntime(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const hostname = window.location.hostname.toLowerCase();
  return !['localhost', '127.0.0.1', '::1'].includes(hostname);
}

export { PUBLIC_RUNTIME_ENV_KEYS };
