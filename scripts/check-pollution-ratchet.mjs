import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const BASELINE_PATH = 'scripts/pollution-baseline.json';
const SHOULD_RATCHET_BASELINE = process.argv.includes('--ratchet-baseline');
const SHOULD_CHECK_RATCHET = process.argv.includes('--check-ratchet');

const EMPTY_BASELINE = {
  files: [],
  unlistedBinaries: [],
  unusedExports: [],
  unusedTypes: [],
};

function normalizeItems(items) {
  return [...new Set(items.filter((item) => typeof item === 'string' && item.length > 0))].sort(
    (a, b) => a.localeCompare(b),
  );
}

function normalizeBaseline(rawBaseline) {
  return {
    files: normalizeItems(rawBaseline?.files ?? []),
    unlistedBinaries: normalizeItems(rawBaseline?.unlistedBinaries ?? []),
    unusedExports: normalizeItems(rawBaseline?.unusedExports ?? []),
    unusedTypes: normalizeItems(rawBaseline?.unusedTypes ?? []),
  };
}

function readBaseline() {
  if (!existsSync(BASELINE_PATH)) {
    return null;
  }

  try {
    const rawContent = readFileSync(BASELINE_PATH, 'utf8');
    const parsed = JSON.parse(rawContent);
    return normalizeBaseline(parsed);
  } catch (error) {
    console.error(`[POLLUTION][FAIL] Unable to parse baseline at ${BASELINE_PATH}.`);
    console.error(`[POLLUTION][HINT] ${(error && error.message) || 'Unknown JSON parsing error.'}`);
    process.exit(1);
  }
}

function writeBaseline(baseline) {
  const normalized = normalizeBaseline(baseline);
  writeFileSync(BASELINE_PATH, `${JSON.stringify(normalized, null, 2)}\n`);
}

function parsePossiblyNoisyJson(stdout) {
  const trimmed = stdout.trim();
  if (trimmed.length === 0) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }
}

function runKnipJson() {
  const result = spawnSync('npx knip --reporter json', {
    encoding: 'utf8',
    shell: true,
  });

  if (result.error) {
    console.error('[POLLUTION][FAIL] Unable to execute knip.');
    console.error(`[POLLUTION][HINT] ${result.error.message}`);
    process.exit(1);
  }

  const parsed = parsePossiblyNoisyJson(result.stdout || '');
  if (!parsed || typeof parsed !== 'object') {
    console.error('[POLLUTION][FAIL] Knip JSON output is invalid or empty.');
    if (result.stdout) {
      console.error('[POLLUTION][STDOUT]');
      console.error(result.stdout.trim());
    }
    if (result.stderr) {
      console.error('[POLLUTION][STDERR]');
      console.error(result.stderr.trim());
    }
    process.exit(1);
  }

  return parsed;
}

function collectCurrentPollution(knipReport) {
  const files = normalizeItems(Array.isArray(knipReport?.files) ? knipReport.files : []);
  const unlistedBinaries = [];
  const unusedExports = [];
  const unusedTypes = [];

  const issues = Array.isArray(knipReport?.issues) ? knipReport.issues : [];
  for (const issue of issues) {
    const filePath = typeof issue?.file === 'string' ? issue.file : 'unknown-file';
    for (const binary of issue?.binaries ?? []) {
      if (binary?.name) {
        unlistedBinaries.push(`${filePath}:${binary.name}`);
      }
    }
    for (const exportedSymbol of issue?.exports ?? []) {
      if (exportedSymbol?.name) {
        unusedExports.push(`${filePath}:${exportedSymbol.name}`);
      }
    }
    for (const exportedType of issue?.types ?? []) {
      if (exportedType?.name) {
        unusedTypes.push(`${filePath}:${exportedType.name}`);
      }
    }
  }

  return normalizeBaseline({
    files,
    unlistedBinaries,
    unusedExports,
    unusedTypes,
  });
}

function computeDelta(currentItems, baselineItems) {
  const currentSet = new Set(currentItems);
  const baselineSet = new Set(baselineItems);
  const regressions = currentItems.filter((item) => !baselineSet.has(item));
  const ratchetCandidates = baselineItems.filter((item) => !currentSet.has(item));
  return { regressions, ratchetCandidates };
}

function printGroup(label, items) {
  if (items.length === 0) {
    return;
  }

  console.error(`[POLLUTION][DETAIL] ${label} (${items.length})`);
  for (const item of items) {
    console.error(`  - ${item}`);
  }
}

function compareAgainstBaseline(current, baseline) {
  const filesDelta = computeDelta(current.files, baseline.files);
  const binariesDelta = computeDelta(current.unlistedBinaries, baseline.unlistedBinaries);
  const exportsDelta = computeDelta(current.unusedExports, baseline.unusedExports);
  const typesDelta = computeDelta(current.unusedTypes, baseline.unusedTypes);

  const regressions = [
    ...filesDelta.regressions.map((item) => ({ category: 'unused files', item })),
    ...binariesDelta.regressions.map((item) => ({ category: 'unlisted binaries', item })),
    ...exportsDelta.regressions.map((item) => ({ category: 'unused exports', item })),
    ...typesDelta.regressions.map((item) => ({ category: 'unused exported types', item })),
  ];

  const ratchetCandidates = [
    ...filesDelta.ratchetCandidates.map((item) => ({ category: 'unused files', item })),
    ...binariesDelta.ratchetCandidates.map((item) => ({ category: 'unlisted binaries', item })),
    ...exportsDelta.ratchetCandidates.map((item) => ({ category: 'unused exports', item })),
    ...typesDelta.ratchetCandidates.map((item) => ({ category: 'unused exported types', item })),
  ];

  return { regressions, ratchetCandidates };
}

function groupedItems(entries) {
  const groups = new Map();
  for (const entry of entries) {
    if (!groups.has(entry.category)) {
      groups.set(entry.category, []);
    }
    groups.get(entry.category).push(entry.item);
  }
  return groups;
}

function printSummary(current) {
  console.log(
    `[POLLUTION][INFO] current files=${current.files.length} binaries=${current.unlistedBinaries.length} exports=${current.unusedExports.length} types=${current.unusedTypes.length}`,
  );
}

const currentPollution = collectCurrentPollution(runKnipJson());
printSummary(currentPollution);

if (SHOULD_RATCHET_BASELINE) {
  const previousBaseline = readBaseline() ?? EMPTY_BASELINE;
  const deltas = compareAgainstBaseline(currentPollution, normalizeBaseline(previousBaseline));
  writeBaseline(currentPollution);

  console.log(`[POLLUTION][PASS] Baseline updated at ${BASELINE_PATH}.`);
  console.log(
    `[POLLUTION][INFO] baseline_additions=${deltas.regressions.length} baseline_removals=${deltas.ratchetCandidates.length}`,
  );
  process.exit(0);
}

const baseline = readBaseline();
if (!baseline) {
  console.error(`[POLLUTION][FAIL] Baseline not found at ${BASELINE_PATH}.`);
  console.error('[POLLUTION][HINT] Run the baseline ratchet command to initialize it.');
  process.exit(1);
}

const deltas = compareAgainstBaseline(currentPollution, baseline);

if (SHOULD_CHECK_RATCHET) {
  if (deltas.ratchetCandidates.length > 0) {
    console.error('[POLLUTION][FAIL] Pollution baseline can be tightened.');
    const groups = groupedItems(deltas.ratchetCandidates);
    for (const [category, items] of groups) {
      printGroup(category, items);
    }
    console.error('[POLLUTION][HINT] Run the baseline ratchet command to tighten the baseline.');
    process.exit(1);
  }

  console.log('[POLLUTION][PASS] Pollution baseline is already ratcheted.');
  process.exit(0);
}

if (deltas.regressions.length > 0) {
  console.error('[POLLUTION][FAIL] New pollution regression(s) detected outside baseline.');
  const groups = groupedItems(deltas.regressions);
  for (const [category, items] of groups) {
    printGroup(category, items);
  }
  process.exit(1);
}

console.log('[POLLUTION][PASS] No new pollution regressions detected.');
if (deltas.ratchetCandidates.length > 0) {
  console.log(
    `[POLLUTION][INFO] baseline_tightening_available=${deltas.ratchetCandidates.length}. Run ratchet command to tighten baseline.`,
  );
}
