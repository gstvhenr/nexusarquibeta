import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUTPUT_PATH = '.agent/memory/project-inventory.md';
const SECTIONS = [
  {
    title: 'Hooks',
    root: 'src/frontend/hooks',
    extensions: ['.ts', '.tsx'],
  },
  {
    title: 'Services',
    root: 'src/frontend/services',
    extensions: ['.ts'],
  },
  {
    title: 'UI Components',
    root: 'src/frontend/components/ui',
    extensions: ['.ts', '.tsx'],
  },
  {
    title: 'Utils',
    root: 'src/frontend/utils',
    extensions: ['.ts'],
  },
  {
    title: 'Types',
    root: 'src/frontend/types',
    extensions: ['.ts'],
  },
];

const TEST_MARKERS = ['.test.', '.spec.'];

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function shouldSkipFile(fileName) {
  return TEST_MARKERS.some((marker) => fileName.includes(marker));
}

function walkFiles(directory, extensions) {
  let files = [];
  const entries = readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walkFiles(fullPath, extensions));
      continue;
    }

    const hasValidExtension = extensions.some((extension) => entry.name.endsWith(extension));
    if (!hasValidExtension || shouldSkipFile(entry.name)) {
      continue;
    }

    files.push(normalizePath(fullPath));
  }
  return files;
}

function extractNamedExports(source) {
  const exportNames = new Set();

  const declarationPatterns = [
    /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g,
    /export\s+const\s+([A-Za-z0-9_]+)/g,
    /export\s+let\s+([A-Za-z0-9_]+)/g,
    /export\s+var\s+([A-Za-z0-9_]+)/g,
    /export\s+class\s+([A-Za-z0-9_]+)/g,
    /export\s+interface\s+([A-Za-z0-9_]+)/g,
    /export\s+type\s+([A-Za-z0-9_]+)/g,
    /export\s+enum\s+([A-Za-z0-9_]+)/g,
  ];

  for (const pattern of declarationPatterns) {
    const matches = source.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        exportNames.add(match[1]);
      }
    }
  }

  const namedExportMatches = source.matchAll(/export\s*\{([^}]+)\}/g);
  for (const match of namedExportMatches) {
    const rawGroup = match[1] || '';
    for (const item of rawGroup.split(',')) {
      const cleaned = item.trim();
      if (!cleaned) continue;
      const aliasMatch = cleaned.match(/^([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)$/);
      if (aliasMatch) {
        exportNames.add(aliasMatch[2]);
      } else {
        exportNames.add(cleaned);
      }
    }
  }

  if (/export\s+default\s+function\b/.test(source)) {
    exportNames.add('default');
  }

  return [...exportNames].sort((a, b) => a.localeCompare(b));
}

function collectSectionEntries(section) {
  const files = walkFiles(section.root, section.extensions).sort((a, b) => a.localeCompare(b));
  const entries = [];

  for (const filePath of files) {
    const source = readFileSync(filePath, 'utf8');
    const exportsFound = extractNamedExports(source);
    if (exportsFound.length === 0) {
      continue;
    }

    entries.push({
      file: normalizePath(relative('.', filePath)),
      exportsFound,
    });
  }

  return entries;
}

function renderSection(section, entries) {
  const lines = [`## ${section.title} (${section.root})`];
  if (entries.length === 0) {
    lines.push('- _No exports found._');
    return lines.join('\n');
  }

  for (const entry of entries) {
    lines.push(`- \`${entry.file}\`: ${entry.exportsFound.map((name) => `\`${name}\``).join(', ')}`);
  }

  return lines.join('\n');
}

const generatedAt = new Date().toISOString();
const contentBlocks = [
  '# Project Inventory',
  '',
  `Generated at: ${generatedAt}`,
  '',
  'Auto-generated manifest for anti-duplication checks in agent workflows.',
];

for (const section of SECTIONS) {
  const entries = collectSectionEntries(section);
  contentBlocks.push('');
  contentBlocks.push(renderSection(section, entries));
}

mkdirSync('.agent/memory', { recursive: true });
writeFileSync(OUTPUT_PATH, `${contentBlocks.join('\n')}\n`);
console.log(`[INVENTORY][PASS] Generated ${OUTPUT_PATH}.`);
