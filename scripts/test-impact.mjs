#!/usr/bin/env node

/* global console, process */

/**
 * test-impact.mjs
 *
 * Intelligent test-impact analysis script.
 * Detects changed source files, classifies by layer, checks for missing tests,
 * runs vitest related, and emits a JSON report.
 *
 * Usage: node scripts/test-impact.mjs
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

// ── Constants ──────────────────────────────────────────────────────────────────

const REPORT_DIR = resolve('.agent/tmp');
const REPORT_PATH = resolve(REPORT_DIR, 'test-impact-report.json');

const LAYER_PATTERNS = [
  { layer: 'service', pattern: /^src\/frontend\/services\/.*\.ts$/ },
  { layer: 'util', pattern: /^src\/frontend\/utils\/.*\.ts$/ },
  { layer: 'hook', pattern: /^src\/frontend\/hooks\/.*\.ts$/ },
  { layer: 'component', pattern: /^src\/frontend\/components\/.*\.tsx$/ },
  { layer: 'page', pattern: /^src\/frontend\/pages\/.*\.tsx$/ },
  { layer: 'type', pattern: /^src\/frontend\/types\/.*\.ts$/ },
];

const REQUIRES_TEST = new Set(['service', 'util', 'hook', 'component', 'page']);

const CONTRACT_PATTERNS = [/^src\/frontend\/types\//, /types\.ts$/, /\.types\.ts$/];

// ── Helpers ────────────────────────────────────────────────────────────────────

function getChangedFiles() {
  try {
    const output = execSync("git diff --name-only HEAD -- 'src/frontend/**'", {
      encoding: 'utf-8',
    }).trim();
    if (!output) return [];
    return output.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function isTestFile(filePath) {
  return /\.test\.tsx?$/.test(filePath);
}

function classifyLayer(filePath) {
  for (const { layer, pattern } of LAYER_PATTERNS) {
    if (pattern.test(filePath)) return layer;
  }
  return 'other';
}

function findTestFile(filePath) {
  const dir = dirname(filePath);
  const base = basename(filePath);

  // helpers.ts → helpers.test.ts, Component.tsx → Component.test.tsx
  const ext = base.endsWith('.tsx') ? '.test.tsx' : '.test.ts';
  const testName = base.replace(/\.(tsx?$)/, ext);
  const testPath = resolve(dir, testName);
  return existsSync(testPath) ? testPath : null;
}

function isContractChange(filePath) {
  return CONTRACT_PATTERNS.some((p) => p.test(filePath));
}

function checkFixtures() {
  const fixturesDir = resolve('src/test/fixtures');
  const goldenTest = resolve('src/test/golden-fixtures.test.ts');
  const typesDoc = resolve('docs/data-contracts/types-contracts.md');

  return {
    fixturesDirExists: existsSync(fixturesDir),
    goldenTestExists: existsSync(goldenTest),
    typesDocExists: existsSync(typesDoc),
  };
}

function runVitestRelated(sourceFiles) {
  if (sourceFiles.length === 0) return { exitCode: 0, output: 'No files to test.' };

  const fileArgs = sourceFiles.join(' ');
  try {
    const output = execSync(`npx vitest related --run ${fileArgs}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { exitCode: 0, output };
  } catch (error) {
    return { exitCode: error.status ?? 1, output: error.stdout ?? error.message };
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────

function main() {
  console.log('🧪 Test Impact Analysis\n');

  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    console.log('No changed source files detected under src/frontend/.');
    const emptyReport = {
      timestamp: new Date().toISOString(),
      files: [],
      actions: [],
      vitestResult: null,
    };
    mkdirSync(REPORT_DIR, { recursive: true });
    writeFileSync(REPORT_PATH, JSON.stringify(emptyReport, null, 2));
    console.log(`\nReport saved to ${REPORT_PATH}`);
    return;
  }

  // Filter out test files from analysis targets
  const sourceFiles = changedFiles.filter((f) => !isTestFile(f));
  const testFiles = changedFiles.filter((f) => isTestFile(f));

  console.log(
    `Changed files: ${changedFiles.length} (${sourceFiles.length} source, ${testFiles.length} test)\n`,
  );

  // Classify each file
  const fileAnalysis = sourceFiles.map((filePath) => {
    const layer = classifyLayer(filePath);
    const requiresTest = REQUIRES_TEST.has(layer);
    const testFile = layer !== 'type' ? findTestFile(filePath) : null;
    const hasTest = testFile !== null;
    const isContract = isContractChange(filePath);

    let status;
    if (layer === 'type') {
      status = 'EXEMPT';
    } else if (!requiresTest) {
      status = 'OPTIONAL';
    } else if (hasTest) {
      status = 'COVERED';
    } else {
      status = 'GAP';
    }

    return { filePath, layer, requiresTest, hasTest, testFile, isContract, status };
  });

  // Print table
  console.log('| Arquivo Alterado | Camada | Teste Existe? | Status |');
  console.log('| --- | --- | --- | --- |');
  for (const f of fileAnalysis) {
    const testCol = f.layer === 'type' ? 'N/A' : f.hasTest ? '✅' : '❌';
    const statusEmoji = {
      EXEMPT: '➖ ISENTO',
      COVERED: '✅ OK',
      GAP: '⚠️ GAP',
      OPTIONAL: '❔ OPTIONAL',
    };
    console.log(
      `| ${f.filePath} | ${f.layer} | ${testCol} | ${statusEmoji[f.status] ?? f.status} |`,
    );
  }

  // Detect actions needed
  const actions = [];
  const gaps = fileAnalysis.filter((f) => f.status === 'GAP');
  for (const g of gaps) {
    actions.push({ action: 'CREATE_TEST', file: g.filePath, layer: g.layer });
  }

  // Contract checks
  const contractChanges = fileAnalysis.filter((f) => f.isContract);
  if (contractChanges.length > 0) {
    const fixtureStatus = checkFixtures();
    actions.push({
      action: 'CHECK_FIXTURES',
      contractFiles: contractChanges.map((c) => c.filePath),
      ...fixtureStatus,
    });
  }

  // Run vitest related on eligible source files
  const testableFiles = sourceFiles.filter(
    (f) => !CONTRACT_PATTERNS.some((p) => p.test(f)) || REQUIRES_TEST.has(classifyLayer(f)),
  );
  const vitestResult = runVitestRelated(testableFiles);

  console.log(`\n--- Vitest Related ---`);
  console.log(`Exit code: ${vitestResult.exitCode}`);
  if (vitestResult.exitCode !== 0) {
    console.log(`\n⚠️  Some tests failed. Review output above.`);
  }

  // Actions summary
  if (actions.length > 0) {
    console.log('\n### Ações Necessárias\n');
    for (const a of actions) {
      if (a.action === 'CREATE_TEST') {
        console.log(`- [ ] Criar teste para \`${a.file}\``);
      } else if (a.action === 'CHECK_FIXTURES') {
        console.log(`- [ ] Verificar fixtures (contrato mudou em: ${a.contractFiles.join(', ')})`);
      }
    }
  }

  // Emit report
  const report = {
    timestamp: new Date().toISOString(),
    files: fileAnalysis,
    actions,
    vitestResult: { exitCode: vitestResult.exitCode },
    summary: {
      total: fileAnalysis.length,
      covered: fileAnalysis.filter((f) => f.status === 'COVERED').length,
      gaps: gaps.length,
      exempt: fileAnalysis.filter((f) => f.status === 'EXEMPT').length,
    },
  };

  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to ${REPORT_PATH}`);

  // Exit with non-zero if gaps or test failures
  if (gaps.length > 0 || vitestResult.exitCode !== 0) {
    process.exit(1);
  }
}

main();
