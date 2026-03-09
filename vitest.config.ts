import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/frontend'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/frontend/test/setup.ts'],
    include: ['src/frontend/**/*.{test,spec}.{ts,tsx}'],
    css: true,
    // Ensure each test FILE gets a fresh module registry.
    // Without this, vi.useFakeTimers() in one file can bleed into the
    // next file sharing the same worker thread (cross-file timer pollution).
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        isolate: true,
      },
    },
    coverage: {
      provider: 'istanbul',
      include: ['src/frontend/**/*.{ts,tsx}'],
      exclude: [
        'src/frontend/services/infrastructure/**',
        'src/frontend/**/*.test.ts',
        'src/frontend/**/*.test.tsx',
        'src/frontend/**/*.spec.ts',
        'src/frontend/**/*.spec.tsx',
        'src/frontend/test/**',
        'src/frontend/main.tsx',
        'src/frontend/vite-env.d.ts',
      ],
      reporter: ['text', 'json-summary'],
      thresholds: {
        lines: 10,
        branches: 58,
        functions: 24,
        statements: 10,
        'src/frontend/services/**/*.ts': {
          lines: 70,
          branches: 60,
          functions: 70,
          statements: 70,
        },
      },
    },
  },
});
