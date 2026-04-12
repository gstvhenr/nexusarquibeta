import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

interface FirebaseRuntimeConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
};

const REQUIRED_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

let cachedServices: FirebaseServices | null = null;
let authPersistencePromise: Promise<void> | null = null;

function readEnv(key: (typeof REQUIRED_ENV_KEYS)[number]): string {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getFirebaseRuntimeConfig(): FirebaseRuntimeConfig | null {
  const apiKey = readEnv('VITE_FIREBASE_API_KEY');
  const authDomain = readEnv('VITE_FIREBASE_AUTH_DOMAIN');
  const projectId = readEnv('VITE_FIREBASE_PROJECT_ID');
  const storageBucket = readEnv('VITE_FIREBASE_STORAGE_BUCKET');
  const messagingSenderId = readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID');
  const appId = readEnv('VITE_FIREBASE_APP_ID');

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseRuntimeConfig() !== null;
}

export function getFirebaseConfigurationError(): string | null {
  const missing = REQUIRED_ENV_KEYS.filter((key) => readEnv(key).length === 0);
  if (missing.length === 0) {
    return null;
  }

  return `Firebase indisponível: configure ${missing.join(', ')}.`;
}

function ensureServices(): FirebaseServices {
  if (cachedServices) {
    return cachedServices;
  }

  const config = getFirebaseRuntimeConfig();
  if (!config) {
    throw new Error(getFirebaseConfigurationError() ?? 'Firebase não configurado.');
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  const storage = getStorage(app);

  cachedServices = { app, auth, db, storage };
  return cachedServices;
}

async function ensureAuthPersistence(auth: Auth): Promise<void> {
  if (!authPersistencePromise) {
    authPersistencePromise = setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn('[Firebase] Falha ao configurar persistência de autenticação:', error);
    });
  }

  await authPersistencePromise;
}

export function getFirebaseAuth(): Auth {
  return ensureServices().auth;
}

export async function ensureFirebaseReady(): Promise<FirebaseServices> {
  const services = ensureServices();
  await ensureAuthPersistence(services.auth);
  return services;
}
