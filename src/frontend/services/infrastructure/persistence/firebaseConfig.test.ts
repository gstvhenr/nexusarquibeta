import path from 'node:path';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const FIREBASE_CONFIG_SOURCE_PATH = path.resolve(
  process.cwd(),
  'src/frontend/services/infrastructure/persistence/firebaseConfig.ts',
);

describe('firebaseConfig', () => {
  it('should keep explicit Vite env access for static build providers like Vercel', () => {
    const source = readFileSync(FIREBASE_CONFIG_SOURCE_PATH, 'utf8');

    expect(source).not.toContain('const value = import.meta.env[key];');
    expect(source).toContain('VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY');
    expect(source).toContain(
      'VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN',
    );
    expect(source).toContain('VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID');
    expect(source).toContain(
      'VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET',
    );
    expect(source).toContain(
      'VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID',
    );
    expect(source).toContain('VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID');
  });
});
