import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const RULES = [
  { dir: 'src/frontend/pages', exts: ['.tsx'], max: 500, label: 'Page' },
  { dir: 'src/frontend/components', exts: ['.tsx'], max: 300, label: 'Component' },
  { dir: 'src/frontend/services', exts: ['.ts'], max: 400, label: 'Service' },
];

const BASELINE_PATH = 'scripts/file-line-baseline.json';
const SHOULD_WRITE_BASELINE = process.argv.includes('--write-baseline');
const SHOULD_RATCHET_BASELINE = process.argv.includes('--ratchet-baseline');
const SHOULD_CHECK_RATCHET = process.argv.includes('--check-ratchet');

const TEST_MARKERS = ['.test.', '.spec.'];
const EXCLUDED_PATH_SEGMENTS = ['/infrastructure/'];

function normalizePath(pathLike) {
  return pathLike.replace(/\\/g, '/');
}

function shouldSkip(filePath) {
  const normalizedPath = normalizePath(filePath);
  return (
    TEST_MARKERS.some((marker) => normalizedPath.includes(marker)) ||
    EXCLUDED_PATH_SEGMENTS.some((segment) => normalizedPath.includes(segment))
  );
}

function walkFiles(directory, exts) {
  if (!existsSync(directory)) return [];

  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, exts));
      continue;
    }

    const matchesExt = exts.some((ext) => entry.name.endsWith(ext));
    if (!matchesExt || shouldSkip(fullPath)) continue;
    files.push(fullPath);
  }

  return files;
}

function collectFileStats() {
  const stats = [];

  for (const rule of RULES) {
    const files = walkFiles(rule.dir, rule.exts);
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      const lines = source.split(/\r?\n/).length;
      stats.push({
        file: normalizePath(relative('.', file)),
        lines,
        rule,
      });
    }
  }

  return stats;
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return {};

  const parsed = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  return typeof parsed === 'object' && parsed !== null ? parsed : {};
}

function writeBaseline(entries) {
  const ordered = Object.fromEntries(
    Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(BASELINE_PATH, `${JSON.stringify(ordered, null, 2)}\n`);
}

function buildBaselineFromViolations(violations) {
  return Object.fromEntries(
    violations
      .sort((a, b) => a.file.localeCompare(b.file))
      .map((violation) => [violation.file, violation.lines]),
  );
}

function analyzeRatchet(baseline, statsByFile) {
  const nextBaseline = {};
  const changes = [];

  for (const [file, baselineLines] of Object.entries(baseline)) {
    if (typeof baselineLines !== 'number') {
      changes.push({
        file,
        previous: baselineLines,
        current: null,
        reason: 'invalid-baseline-entry',
      });
      continue;
    }

    const stat = statsByFile.get(file);
    if (!stat) {
      changes.push({
        file,
        previous: baselineLines,
        current: null,
        reason: 'file-not-found-or-not-tracked',
      });
      continue;
    }

    if (stat.lines <= stat.rule.max) {
      changes.push({
        file,
        previous: baselineLines,
        current: stat.lines,
        reason: 'now-within-limit',
      });
      continue;
    }

    if (stat.lines < baselineLines) {
      nextBaseline[file] = stat.lines;
      changes.push({
        file,
        previous: baselineLines,
        current: stat.lines,
        reason: 'tighten-baseline',
      });
      continue;
    }

    nextBaseline[file] = baselineLines;
  }

  return { changes, nextBaseline };
}

function formatRatchetChange(change) {
  if (change.reason === 'tighten-baseline') {
    return `- ${change.file}: baseline ${change.previous} -> ${change.current} (tighten).`;
  }

  if (change.reason === 'now-within-limit') {
    return `- ${change.file}: now ${change.current} lines (within limit), remove from baseline.`;
  }

  if (change.reason === 'file-not-found-or-not-tracked') {
    return `- ${change.file}: missing/not tracked, remove stale baseline entry.`;
  }

  return `- ${change.file}: invalid baseline value "${change.previous}", remove entry.`;
}

const fileStats = collectFileStats();
const statsByFile = new Map(fileStats.map((stat) => [stat.file, stat]));
const violations = fileStats
  .filter((stat) => stat.lines > stat.rule.max)
  .map((stat) => ({
    label: stat.rule.label,
    file: stat.file,
    lines: stat.lines,
    max: stat.rule.max,
  }));

if (SHOULD_WRITE_BASELINE) {
  const nextBaseline = buildBaselineFromViolations(violations);
  writeBaseline(nextBaseline);
  console.log(`Baseline written to ${BASELINE_PATH} with ${violations.length} over-limit file(s).`);
  process.exit(0);
}

const baseline = loadBaseline();
const { changes: ratchetChanges, nextBaseline } = analyzeRatchet(baseline, statsByFile);

if (SHOULD_CHECK_RATCHET) {
  if (ratchetChanges.length === 0) {
    console.log('Line baseline already ratcheted.');
    process.exit(0);
  }

  for (const change of ratchetChanges) {
    console.error(formatRatchetChange(change));
  }
  console.error(
    `\n${ratchetChanges.length} ratchet update(s) pending. Run "npm run check:lines:ratchet".`,
  );
  process.exit(1);
}

if (SHOULD_RATCHET_BASELINE) {
  if (ratchetChanges.length === 0) {
    console.log('No ratchet updates needed. Baseline is already up to date.');
    process.exit(0);
  }

  writeBaseline(nextBaseline);
  for (const change of ratchetChanges) {
    console.log(formatRatchetChange(change));
  }
  console.log(
    `\nBaseline updated at ${BASELINE_PATH} with ${ratchetChanges.length} ratchet change(s).`,
  );
  process.exit(0);
}

if (violations.length > 0) {
  const legacy = [];
  const regressions = [];

  for (const violation of violations) {
    const baselineLines = baseline[violation.file];
    if (typeof baselineLines === 'number') {
      if (violation.lines > baselineLines) {
        regressions.push({
          ...violation,
          baselineLines,
          delta: violation.lines - baselineLines,
          reason: 'grew-above-baseline',
        });
      } else {
        legacy.push({
          ...violation,
          baselineLines,
        });
      }
      continue;
    }

    regressions.push({
      ...violation,
      baselineLines: null,
      delta: violation.lines - violation.max,
      reason: 'new-over-limit-file',
    });
  }

  if (regressions.length > 0) {
    for (const regression of regressions) {
      if (regression.reason === 'new-over-limit-file') {
        console.error(
          `${regression.label} "${regression.file}" has ${regression.lines} lines (max: ${regression.max}). New over-limit file; add decomposition.`,
        );
      } else {
        console.error(
          `${regression.label} "${regression.file}" has ${regression.lines} lines (baseline: ${regression.baselineLines}, max: ${regression.max}). Reduced size or refresh baseline after approved decomposition.`,
        );
      }
    }
    console.error(`\n${regressions.length} line-limit regression(s) detected.`);
    process.exit(1);
  }

  if (legacy.length > 0) {
    console.warn(
      `${legacy.length} legacy over-limit file(s) tracked by baseline. No line-limit regressions detected.`,
    );
    if (ratchetChanges.length > 0) {
      console.warn(
        `${ratchetChanges.length} ratchet update(s) available. Run "npm run check:lines:ratchet" to tighten baseline.`,
      );
    }
    process.exit(0);
  }

  console.log('All files within line limits.');
  process.exit(0);
}

console.log('All files within line limits.');
