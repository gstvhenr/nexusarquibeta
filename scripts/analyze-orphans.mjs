/**
 * Orphan Module Diagnostic — Nexus-Arqui
 *
 * Analyses the dependency graph via dependency-cruiser and classifies
 * modules with 0 dependents into categories:
 *   - ENTRY_POINT: lazy-loaded pages, bootstrap files, barrels consumed by App.tsx
 *   - LAZY_LOADED: modules consumed via dynamic import()
 *   - TYPE_ONLY: .d.ts files or type-only modules
 *   - TEST_UTIL: test helpers, fixtures, factories, setup files
 *   - BARREL: index.ts re-export files
 *   - CONFIG: configuration files (vite.config, vitest.config, etc.)
 *   - DEAD_CODE: confirmed dead code — removal candidate
 *   - UNCERTAIN: needs manual review
 *
 * Usage: node scripts/analyze-orphans.mjs
 * Output: scripts/orphans-diagnostic.json (structured) + console summary
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

/* ── 1. Collect dependency graph ────────────────────────────────────── */
console.log('[1/4] Running dependency-cruiser...');
const raw = execSync('npx depcruise src --output-type json', {
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024,
  cwd: process.cwd(),
});

const data = JSON.parse(raw);
const allModules = data.modules;
console.log(`  Total modules in graph: ${allModules.length}`);

/* ── 2. Filter orphans (0 dependents, excluding tests) ──────────── */
const orphans = allModules.filter(
  (m) => m.dependents.length === 0 && !m.source.includes('.test.') && !m.source.includes('.spec.'),
);
console.log(`  Orphan candidates (no tests): ${orphans.length}`);

/* ── 3. Read App.tsx to extract lazy-loaded paths ───────────────── */
let lazyPaths = [];
try {
  const appContent = readFileSync('src/frontend/App.tsx', 'utf8');
  // Match: lazy(() => import('./pages/...'))
  const lazyRe = /import\(['"]\.\/(.+?)['"]\)/g;
  let match;
  while ((match = lazyRe.exec(appContent)) !== null) {
    lazyPaths.push('src/frontend/' + match[1]);
  }
} catch {
  console.warn('  ⚠ Could not read App.tsx for lazy imports');
}

/* ── 4. Classify each orphan ─────────────────────────────────────── */
function classify(source) {
  const s = source.replace(/\\/g, '/');

  // Type-only files
  if (s.endsWith('.d.ts')) return 'TYPE_ONLY';

  // Test utilities / setup / fixtures
  if (
    s.includes('/test/') ||
    s.includes('setup.ts') ||
    s.includes('factories.') ||
    s.includes('fixtures.')
  )
    return 'TEST_UTIL';

  // Config files
  if (
    s.includes('vite.config') ||
    s.includes('vitest.config') ||
    s.includes('.dependency-cruiser') ||
    s.includes('tailwind.config') ||
    s.includes('postcss.config') ||
    s.includes('eslint.config')
  )
    return 'CONFIG';

  // Main entry point
  if (s === 'src/frontend/index.tsx' || s === 'src/frontend/main.tsx') return 'ENTRY_POINT';

  // App.tsx itself
  if (s === 'src/frontend/App.tsx') return 'ENTRY_POINT';

  // Lazy-loaded pages (check if the source matches or is resolved by a lazy import)
  const normalizedS = s.replace(/\/index\.(ts|tsx)$/, '');
  for (const lazyPath of lazyPaths) {
    const normalizedLazy = lazyPath.replace(/\/index\.(ts|tsx)$/, '');
    if (normalizedS === normalizedLazy || s === lazyPath + '.tsx' || s === lazyPath + '.ts') {
      return 'LAZY_LOADED';
    }
  }

  // Barrel files (index.ts)
  if (s.endsWith('/index.ts') || s.endsWith('/index.tsx')) {
    return 'BARREL';
  }

  // Pages loaded via barrel index.ts that resolves to a lazy import
  if (s.includes('/pages/')) {
    // Check if this page's parent barrel is lazy-loaded
    const parts = s.split('/');
    for (let i = parts.length - 1; i >= 0; i--) {
      const parentPath = parts.slice(0, i).join('/');
      const parentBarrelNorm = parentPath;
      for (const lazyPath of lazyPaths) {
        if (parentBarrelNorm === lazyPath || parentBarrelNorm + '/index' === lazyPath) {
          return 'LAZY_LOADED';
        }
      }
    }
  }

  // If it's a component, hook, service, util, constant, context — likely dead code
  // or part of a barrel chain. Check if any barrel re-exports it.
  const isReExportedByBarrel = allModules.some((m) => {
    if (!m.source.endsWith('/index.ts') && !m.source.endsWith('/index.tsx')) return false;
    return m.dependencies.some((dep) => {
      const resolved = dep.resolved || '';
      return resolved.replace(/\\/g, '/') === s;
    });
  });

  if (isReExportedByBarrel) {
    // It's re-exported by a barrel, so it's indirectly consumed
    return 'BARREL_CHILD';
  }

  return 'DEAD_CODE';
}

const classified = orphans.map((m) => ({
  source: m.source.replace(/\\/g, '/'),
  classification: classify(m.source),
  dependenciesCount: m.dependencies.length,
}));

/* ── 5. Summarize ──────────────────────────────────────────────────── */
const groups = {};
for (const item of classified) {
  if (!groups[item.classification]) groups[item.classification] = [];
  groups[item.classification].push(item);
}

console.log('\n[4/4] Classification Summary:');
console.log('─'.repeat(50));
const order = [
  'ENTRY_POINT',
  'LAZY_LOADED',
  'TYPE_ONLY',
  'TEST_UTIL',
  'CONFIG',
  'BARREL',
  'BARREL_CHILD',
  'DEAD_CODE',
  'UNCERTAIN',
];
for (const cat of order) {
  const items = groups[cat] || [];
  const emoji = cat === 'DEAD_CODE' ? '🗑️' : cat === 'UNCERTAIN' ? '❓' : '✅';
  if (items.length > 0) {
    console.log(`  ${emoji} ${cat}: ${items.length} modules`);
  }
}
console.log('─'.repeat(50));
console.log(`  TOTAL orphan candidates: ${classified.length}`);

/* ── 6. Write output ───────────────────────────────────────────────── */
const output = {
  timestamp: new Date().toISOString(),
  totalModulesInGraph: allModules.length,
  totalOrphanCandidates: classified.length,
  summary: Object.fromEntries(order.map((cat) => [cat, (groups[cat] || []).length])),
  classified,
};

writeFileSync('scripts/orphans-diagnostic.json', JSON.stringify(output, null, 2), 'utf8');

console.log('\n✅ Full report written to scripts/orphans-diagnostic.json');

// If there are DEAD_CODE modules, list them
const deadCode = groups['DEAD_CODE'] || [];
if (deadCode.length > 0) {
  console.log(`\n🗑️  DEAD CODE candidates (${deadCode.length}):`);
  for (const item of deadCode) {
    console.log(`  - ${item.source}`);
  }
}
