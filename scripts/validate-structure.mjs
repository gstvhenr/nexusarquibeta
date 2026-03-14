import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';

const ROOT = 'src/frontend';
const BASELINE_PATH = 'scripts/structure-baseline.json';
const SHOULD_RATCHET_BASELINE = process.argv.includes('--ratchet-baseline');
const SHOULD_CHECK_RATCHET = process.argv.includes('--check-ratchet');

const PHASED_RULES = ['S04', 'S06', 'S07'];

const EMPTY_BASELINE = {
  version: 1,
  rules: {
    S04: [],
    S06: [],
    S07: [],
  },
};

function normalizePath(pathLike) {
  return pathLike.replace(/\\/g, '/');
}

function toRelative(filePath) {
  return normalizePath(relative('.', filePath));
}

function pathExists(pathLike) {
  return existsSync(pathLike);
}

function isTypeScriptModule(filePath) {
  return /\.(ts|tsx)$/.test(filePath) && !filePath.endsWith('.d.ts');
}

function isTestFile(filePath) {
  return /\.(test|spec)\.(ts|tsx)$/.test(filePath);
}

function walkFiles(directory) {
  if (!pathExists(directory)) return [];

  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

function walkDirectories(directory) {
  if (!pathExists(directory)) return [];

  const dirs = [directory];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    dirs.push(...walkDirectories(join(directory, entry.name)));
  }
  return dirs;
}

function normalizeList(items) {
  return [...new Set(items.filter((item) => typeof item === 'string' && item.length > 0))].sort(
    (a, b) => a.localeCompare(b),
  );
}

function readBaseline() {
  if (!pathExists(BASELINE_PATH)) {
    return EMPTY_BASELINE;
  }

  try {
    const parsed = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
    return {
      version: 1,
      rules: {
        S04: normalizeList(parsed?.rules?.S04 ?? []),
        S06: normalizeList(parsed?.rules?.S06 ?? []),
        S07: normalizeList(parsed?.rules?.S07 ?? []),
      },
    };
  } catch (error) {
    console.error(`[STRUCTURE][FAIL] Baseline invalida em ${BASELINE_PATH}.`);
    console.error(
      `[STRUCTURE][HINT] ${(error && error.message) || 'Erro desconhecido ao parsear JSON.'}`,
    );
    process.exit(1);
  }
}

function writeBaseline(rules) {
  const payload = {
    version: 1,
    rules: {
      S04: normalizeList(rules.S04 ?? []),
      S06: normalizeList(rules.S06 ?? []),
      S07: normalizeList(rules.S07 ?? []),
    },
  };
  writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`);
}

function printViolation(level, ruleId, currentPath, expected, fix) {
  console[level === 'ERROR' ? 'error' : 'warn'](`[${ruleId}][${level}] VIOLATION: ${currentPath}`);
  console[level === 'ERROR' ? 'error' : 'warn'](`EXPECTED: ${expected}`);
  console[level === 'ERROR' ? 'error' : 'warn'](`FIX: ${fix}`);
}

function collectRootTsViolations(layerPath, ruleId) {
  if (!pathExists(layerPath)) return [];

  const violations = [];
  for (const entry of readdirSync(layerPath, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    if (entry.name === 'index.ts') continue;

    const currentPath = toRelative(join(layerPath, entry.name));
    violations.push({
      ruleId,
      currentPath,
      expected: `${normalizePath(layerPath)}/index.ts (somente barrel na raiz)`,
      fix: 'mover arquivo para subdiretorio de dominio/feature e manter apenas index.ts na raiz da camada',
    });
  }

  return violations;
}

function collectServicePlacementViolations(tsFiles) {
  const violations = [];
  for (const filePath of tsFiles) {
    const normalized = normalizePath(filePath);
    if (!normalized.endsWith('Service.ts')) continue;
    if (normalized.startsWith(`${ROOT}/services/`)) continue;

    const currentPath = toRelative(filePath);
    const fileName = basename(filePath);
    violations.push({
      ruleId: 'S03',
      currentPath,
      expected: `${ROOT}/services/**/${fileName}`,
      fix: `mover para ${ROOT}/services/ e atualizar imports`,
    });
  }
  return violations;
}

function resolveSourceForTest(testFilePath) {
  const fileName = basename(testFilePath);
  const extension = extname(fileName);
  const rootName = fileName.slice(0, -extension.length);
  const baseWithoutTest = rootName.replace(/\.(test|spec)$/, '');
  const targetDir = dirname(testFilePath);
  const segments = baseWithoutTest.split('.');

  for (let size = segments.length; size >= 1; size -= 1) {
    const candidateBase = segments.slice(0, size).join('.');
    for (const sourceExt of ['.ts', '.tsx']) {
      const candidatePath = join(targetDir, `${candidateBase}${sourceExt}`);
      if (!pathExists(candidatePath)) continue;
      if (candidatePath === testFilePath) continue;
      if (isTestFile(candidatePath)) continue;
      return candidatePath;
    }
  }

  return null;
}

function collectTestColocationViolations(tsFiles) {
  const violations = [];
  for (const filePath of tsFiles) {
    const normalized = normalizePath(filePath);
    if (!isTestFile(normalized)) continue;
    if (normalized.startsWith(`${ROOT}/test/`)) continue;

    const sourcePath = resolveSourceForTest(filePath);
    if (sourcePath) continue;

    const currentPath = toRelative(filePath);
    const fileName = basename(filePath);
    const sourceHint = fileName.replace(/\.(test|spec)\.(ts|tsx)$/, '.$2');
    violations.push({
      ruleId: 'S05',
      currentPath,
      expected: `arquivo-fonte co-localizado no mesmo diretorio (ex.: ${sourceHint})`,
      fix: 'co-locar teste com seu source correspondente ou mover para src/frontend/test/** quando for harness global',
    });
  }
  return violations;
}

function collectHookPlacementWarnings(tsFiles) {
  const issues = [];
  for (const filePath of tsFiles) {
    const normalized = normalizePath(filePath);
    const fileName = basename(normalized);
    if (!/^use[A-Z].*\.ts$/.test(fileName)) continue;
    if (isTestFile(fileName)) continue;

    const isGlobalHook = normalized.startsWith(`${ROOT}/hooks/`);
    const isPageScopedHook = normalized.startsWith(`${ROOT}/pages/`);
    if (isGlobalHook || isPageScopedHook) continue;

    const relPath = toRelative(filePath);
    issues.push({
      key: relPath,
      currentPath: relPath,
      expected: `${ROOT}/hooks/use*.ts ou ${ROOT}/pages/**/use*.ts`,
      fix: 'mover hook para camada hooks global ou co-locar na feature de page',
    });
  }
  return issues;
}

function countRelativeDepth(specifier) {
  let depth = 0;
  let cursor = specifier;
  while (cursor.startsWith('../')) {
    depth += 1;
    cursor = cursor.slice(3);
  }
  return depth;
}

function collectDeepRelativeImportWarnings(tsFiles) {
  const warnings = [];
  const seen = new Set();
  const importPatterns = [/from\s+['"]([^'"]+)['"]/g, /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g];

  for (const filePath of tsFiles) {
    const content = readFileSync(filePath, 'utf8');
    const relPath = toRelative(filePath);

    for (const pattern of importPatterns) {
      pattern.lastIndex = 0;
      for (let match = pattern.exec(content); match !== null; match = pattern.exec(content)) {
        const specifier = match[1];
        if (!specifier.startsWith('../')) continue;

        const depth = countRelativeDepth(specifier);
        if (depth <= 2) continue;

        const key = `${relPath}::${specifier}`;
        if (seen.has(key)) continue;
        seen.add(key);

        warnings.push({
          key,
          currentPath: `${relPath} (import: ${specifier})`,
          expected: 'import relativo com no maximo ../../',
          fix: "adotar alias '@/...' ou reduzir profundidade do import relativo",
        });
      }
    }
  }

  return warnings;
}

function shouldEvaluateBarrel(directoryPath) {
  const normalized = normalizePath(directoryPath);
  if (!normalized.startsWith(`${ROOT}/`)) return false;
  if (normalized.startsWith(`${ROOT}/test/`)) return false;

  const relToRoot = normalizePath(relative(ROOT, directoryPath));
  if (!relToRoot || relToRoot === '.') return false;
  if (!relToRoot.includes('/')) return false;
  return true;
}

function collectMissingBarrelWarnings(allDirectories) {
  const warnings = [];

  for (const directoryPath of allDirectories) {
    if (!shouldEvaluateBarrel(directoryPath)) continue;

    const entries = readdirSync(directoryPath, { withFileTypes: true });
    const sourceFiles = entries.filter((entry) => {
      if (!entry.isFile()) return false;
      if (entry.name === 'index.ts') return false;
      if (!/\.(ts|tsx)$/.test(entry.name)) return false;
      if (entry.name.endsWith('.d.ts')) return false;
      if (/\.(test|spec)\.(ts|tsx)$/.test(entry.name)) return false;
      return true;
    });

    if (sourceFiles.length <= 1) continue;

    const hasBarrel = entries.some((entry) => entry.isFile() && entry.name === 'index.ts');
    if (hasBarrel) continue;

    const relDir = toRelative(directoryPath);
    warnings.push({
      key: relDir,
      currentPath: relDir,
      expected: `${relDir}/index.ts`,
      fix: 'criar barrel index.ts para consolidar exports do diretorio',
    });
  }

  return warnings;
}

function toSet(items) {
  return new Set(items);
}

function getAdditions(currentItems, baselineItems) {
  const baselineSet = toSet(baselineItems);
  return currentItems.filter((item) => !baselineSet.has(item));
}

function getRemovals(currentItems, baselineItems) {
  const currentSet = toSet(currentItems);
  return baselineItems.filter((item) => !currentSet.has(item));
}

function printPhaseWarnings(ruleId, issues) {
  if (issues.length === 0) return;

  const maxPreview = 10;
  const preview = issues.slice(0, maxPreview);
  for (const issue of preview) {
    printViolation('WARN', ruleId, issue.currentPath, issue.expected, issue.fix);
  }
  if (issues.length > maxPreview) {
    console.warn(
      `[${ruleId}][WARN] +${issues.length - maxPreview} violacoes adicionais rastreadas no baseline.`,
    );
  }
}

const allFiles = walkFiles(ROOT);
const tsFiles = allFiles.filter(isTypeScriptModule);
const allDirectories = walkDirectories(ROOT);

const blockingViolations = [
  ...collectRootTsViolations(join(ROOT, 'pages'), 'S01'),
  ...collectRootTsViolations(join(ROOT, 'components'), 'S02'),
  ...collectServicePlacementViolations(tsFiles),
  ...collectTestColocationViolations(tsFiles),
];

if (blockingViolations.length > 0) {
  for (const violation of blockingViolations) {
    printViolation(
      'ERROR',
      violation.ruleId,
      violation.currentPath,
      violation.expected,
      violation.fix,
    );
  }
  console.error(`[STRUCTURE][FAIL] ${blockingViolations.length} violacao(oes) bloqueante(s).`);
  process.exit(1);
}

const phaseWarningsByRule = {
  S04: collectHookPlacementWarnings(tsFiles),
  S06: collectDeepRelativeImportWarnings(tsFiles),
  S07: collectMissingBarrelWarnings(allDirectories),
};

const currentBaseline = {
  S04: normalizeList(phaseWarningsByRule.S04.map((item) => item.key)),
  S06: normalizeList(phaseWarningsByRule.S06.map((item) => item.key)),
  S07: normalizeList(phaseWarningsByRule.S07.map((item) => item.key)),
};

const baseline = readBaseline();

if (SHOULD_RATCHET_BASELINE) {
  const additions = PHASED_RULES.reduce((acc, ruleId) => {
    acc += getAdditions(currentBaseline[ruleId], baseline.rules[ruleId]).length;
    return acc;
  }, 0);
  const removals = PHASED_RULES.reduce((acc, ruleId) => {
    acc += getRemovals(currentBaseline[ruleId], baseline.rules[ruleId]).length;
    return acc;
  }, 0);

  writeBaseline(currentBaseline);
  console.log(`[STRUCTURE][PASS] baseline atualizado em ${BASELINE_PATH}.`);
  console.log(`[STRUCTURE][INFO] baseline_additions=${additions} baseline_removals=${removals}`);
  process.exit(0);
}

if (SHOULD_CHECK_RATCHET) {
  const pendingRemovals = [];
  for (const ruleId of PHASED_RULES) {
    const removals = getRemovals(currentBaseline[ruleId], baseline.rules[ruleId]);
    pendingRemovals.push(...removals.map((item) => ({ ruleId, item })));
  }

  if (pendingRemovals.length > 0) {
    console.error('[STRUCTURE][FAIL] baseline estrutural pode ser apertado.');
    for (const pending of pendingRemovals) {
      console.error(`[${pending.ruleId}][ERROR] VIOLATION: ${pending.item}`);
      console.error('EXPECTED: remover entrada obsoleta do baseline');
      console.error('FIX: executar validate:structure:ratchet');
    }
    process.exit(1);
  }

  console.log('[STRUCTURE][PASS] baseline estrutural ja esta ratchetado.');
  process.exit(0);
}

const regressionIssues = [];
for (const ruleId of PHASED_RULES) {
  const issuesByKey = new Map(phaseWarningsByRule[ruleId].map((issue) => [issue.key, issue]));
  const additions = getAdditions(currentBaseline[ruleId], baseline.rules[ruleId]);
  for (const key of additions) {
    const issue = issuesByKey.get(key);
    if (!issue) continue;
    regressionIssues.push({ ruleId, ...issue });
  }
}

if (regressionIssues.length > 0) {
  for (const issue of regressionIssues) {
    printViolation('ERROR', issue.ruleId, issue.currentPath, issue.expected, issue.fix);
  }
  console.error(
    `[STRUCTURE][FAIL] ${regressionIssues.length} regressao(oes) fora do baseline phaseado.`,
  );
  process.exit(1);
}

for (const ruleId of PHASED_RULES) {
  printPhaseWarnings(ruleId, phaseWarningsByRule[ruleId]);
}

const ratchetCandidates = PHASED_RULES.reduce((acc, ruleId) => {
  return acc + getRemovals(currentBaseline[ruleId], baseline.rules[ruleId]).length;
}, 0);

if (ratchetCandidates > 0) {
  console.warn(`[STRUCTURE][INFO] baseline_tightening_available=${ratchetCandidates}.`);
}

console.log(
  '[STRUCTURE][PASS] sem violacoes bloqueantes e sem regressao estrutural fora do baseline.',
);
