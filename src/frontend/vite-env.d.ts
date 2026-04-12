/// <reference types="vite/client" />

type NexusArquiPublicRuntimeEnv = Partial<
  Record<
    | 'VITE_PERSISTENCE_ADAPTER'
    | 'VITE_FIREBASE_API_KEY'
    | 'VITE_FIREBASE_AUTH_DOMAIN'
    | 'VITE_FIREBASE_PROJECT_ID'
    | 'VITE_FIREBASE_STORAGE_BUCKET'
    | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
    | 'VITE_FIREBASE_APP_ID',
    string
  >
>;

interface ImportMetaEnv {
  readonly VITE_PERSISTENCE_ADAPTER?: 'firebase' | 'indexeddb' | 'sqlite';
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __NEXUS_ARQUI_RUNTIME_CONFIG?: NexusArquiPublicRuntimeEnv;
}

declare module '*.sql?raw' {
  const content: string;
  export default content;
}
