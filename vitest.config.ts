import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/frontend/test/setup.ts'],
    include: ['src/frontend/**/*.{test,spec}.{ts,tsx}'],
    css: true,
    coverage: {
      provider: 'v8',
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
