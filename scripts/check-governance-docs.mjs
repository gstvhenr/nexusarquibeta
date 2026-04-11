/* eslint-env node */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const MAX_ACTIVE_BYTES = 200_000;

const ACTIVE_FILES = [
  'AGENTS.md',
  'CONTEXT.md',
  'NEXT.md',
  'DECISIONS-active.md',
  'ARCHITECTURE.md',
  'README.md',
  'CONTRIBUTING.md',
  'TESTING.md',
  'SECURITY.md',
  'TASKS.md',
  'docs/PLACEMENT_RULES.md',
  'docs/data-contracts/types-contracts.md',
  'docs/governance/core-contract.md',
  '.agent/README.md',
  '.agent/lessons-learned.md',
  '.agent/checklists/domain-refactor-checklist.md',
  '.agent/workflows/default-task-flow.md',
  '.agent/workflows/verify-first.md',
];

const ACTIVE_DIRECTORIES = ['docs/process'];
const COMMAND_EXCEPTIONS = new Set([
  'AGENTS.md',
  'NEXT.md',
  'DECISIONS-active.md',
  '.agent/lessons-learned.md',
]);

function normalize(filePath) {
  return filePath.replaceAll('\\', '/');
}

function collectMarkdownFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
      continue;
    }
    if (entry.isFile() && fullPath.toLowerCase().endsWith('.md')) {
      files.push(normalize(fullPath));
    }
  }
  return files;
}

function unique(items) {
  return [...new Set(items)];
}

let failures = 0;
const activeFiles = unique([
  ...ACTIVE_FILES,
  ...ACTIVE_DIRECTORIES.flatMap((directory) => collectMarkdownFiles(directory)),
]);

let activeBytes = 0;

for (const filePath of activeFiles) {
  const stats = statSync(filePath);
  activeBytes += stats.size;
  const content = readFileSync(filePath, 'utf8');

  if (/DECISIONS\.md/.test(content)) {
    console.error(
      `[DOCS][FAIL] file=${filePath} reason="Legacy decision file reference found. Use DECISIONS-active.md."`,
    );
    failures++;
  }

  if (!COMMAND_EXCEPTIONS.has(filePath)) {
    if (/\bnpm\s+run\b/i.test(content) || /\bnpm\s+install\b/i.test(content)) {
      console.error(
        `[DOCS][FAIL] file=${filePath} reason="Command duplication outside AGENTS.md is not allowed."`,
      );
      failures++;
    }
  }
}

console.log(
  `[DOCS][INFO] active_files=${activeFiles.length} active_governance_bytes=${activeBytes} max_bytes=${MAX_ACTIVE_BYTES}`,
);

if (activeBytes > MAX_ACTIVE_BYTES) {
  console.error(
    `[DOCS][FAIL] reason="Active governance bytes exceed budget." current=${activeBytes} max=${MAX_ACTIVE_BYTES}`,
  );
  failures++;
}

if (failures > 0) {
  console.error(`[DOCS][FAIL] checks=${failures}`);
  process.exit(1);
}

console.log('[DOCS][PASS] governance checks passed.');
