import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { RollupLog } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const normalizeModulePath = (modulePath: string): string => modulePath.replace(/\\/g, '/');

const isNodeModulesWarning = (warning: RollupLog): boolean =>
  typeof warning.id === 'string' && normalizeModulePath(warning.id).includes('/node_modules/');

const isReactCoreModule = (id: string): boolean =>
  ['/react/', '/react-dom/', '/scheduler/', '/loose-envify/', '/js-tokens/'].some((pkg) =>
    id.includes(pkg),
  );

const isReactRouterModule = (id: string): boolean =>
  ['/react-router/', '/react-router-dom/', '/@remix-run/', '/history/'].some((pkg) =>
    id.includes(pkg),
  );

const isProjectDetailsModule = (id: string): boolean =>
  [
    '/src/pages/ProjetoDetalhesPageContent',
    '/src/components/projetos/ProjetoDetalhesWidgets',
    '/src/components/projetos/',
  ].some((modulePath) => id.includes(modulePath));

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split third-party libs into stable chunks to reduce initial bundle size.
        manualChunks(id) {
          const normalizedId = normalizeModulePath(id);

          // Keep the largest local feature in its own chunk to avoid bloating the main entry.
          if (isProjectDetailsModule(normalizedId)) {
            return 'project-details';
          }

          if (!normalizedId.includes('/node_modules/')) {
            return undefined;
          }

          // Keep React runtime in its own chunk for better browser caching.
          if (isReactCoreModule(normalizedId)) {
            return 'react-core';
          }

          // Keep router internals together and decoupled from generic vendors.
          if (isReactRouterModule(normalizedId)) {
            return 'react-router';
          }

          // Isolate gantt bundle because it is large and route-specific.
          if (normalizedId.includes('/gantt-task-react/')) {
            return 'gantt';
          }

          // Separate charting libs from the main app entry.
          if (normalizedId.includes('/recharts/')) {
            return 'charts';
          }

          // Split document stack to prevent a single oversized chunk.
          if (normalizedId.includes('/docx/')) {
            return 'docx';
          }

          if (normalizedId.includes('/jspdf/')) {
            return 'jspdf';
          }

          if (normalizedId.includes('/html2canvas/')) {
            return 'html2canvas';
          }

          if (normalizedId.includes('/file-saver/')) {
            return 'file-saver';
          }

          return 'vendor';
        },
      },
      onwarn(warning, defaultHandler) {
        // Suppress known false-positive PURE annotation warnings from dependencies only.
        if (warning.code === 'INVALID_ANNOTATION' && isNodeModulesWarning(warning)) {
          return;
        }

        defaultHandler(warning);
      },
    },
  },
});
