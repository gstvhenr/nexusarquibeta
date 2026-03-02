import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const GATES = [
  { id: 'typecheck', command: 'npm run typecheck' },
  { id: 'lint', command: 'npm run lint' },
  { id: 'format:check', command: 'npm run format:check' },
  { id: 'check:docs:governance', command: 'npm run check:docs:governance' },
  { id: 'validate:structure', command: 'npm run validate:structure' },
  { id: 'check:lines', command: 'npm run check:lines' },
  { id: 'check:duplication', command: 'npm run check:duplication' },
  { id: 'test:coverage', command: 'npm run test:coverage' },
  { id: 'build', command: 'npm run build' },
];

const REPORT_PATH = '.agent/tmp/verify-loop-report.json';

function toLines(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function findFirstMatch(lines, predicates) {
  for (const predicate of predicates) {
    const match = lines.find((line) => predicate(line));
    if (match) return match;
  }
  return null;
}

function extractHint(gateId, output) {
  const lines = toLines(output);
  if (lines.length === 0) return 'No stdout/stderr captured from failing command.';

  if (gateId === 'typecheck') {
    return (
      findFirstMatch(lines, [
        (line) => /error TS\d+:/i.test(line),
        (line) => /Cannot find/i.test(line),
      ]) || 'TypeScript failure detected; inspect first compiler error above.'
    );
  }

  if (gateId === 'lint') {
    return (
      findFirstMatch(lines, [
        (line) => /\berror\b/i.test(line) && /\b[a-z-]+\b\/\b[a-z-]+\b/.test(line),
        (line) => /eslint/i.test(line) && /\berror\b/i.test(line),
      ]) || 'ESLint failure detected; inspect first lint error above.'
    );
  }

  if (gateId === 'format:check') {
    return (
      findFirstMatch(lines, [
        (line) => /\[warn\]/i.test(line),
        (line) => /Code style issues found/i.test(line),
      ]) || 'Prettier check failed; run format and re-run verify.'
    );
  }

  if (gateId === 'check:lines') {
    return (
      findFirstMatch(lines, [
        (line) => /has \d+ lines \(max:/i.test(line),
        (line) => /line-limit regression/i.test(line),
      ]) || 'Line-limit gate failed; decompose file or refresh baseline intentionally.'
    );
  }

  if (gateId === 'check:docs:governance') {
    return (
      findFirstMatch(lines, [
        (line) => /\[DOCS\]\[FAIL\]/i.test(line),
        (line) => /DECISIONS\.md/i.test(line),
        (line) => /governance bytes exceed budget/i.test(line),
      ]) || 'Governance docs gate failed; inspect [DOCS][FAIL] lines above.'
    );
  }

  if (gateId === 'validate:structure') {
    return (
      findFirstMatch(lines, [
        (line) => /\[STRUCTURE\]\[FAIL\]/i.test(line),
        (line) => /\[S\d{2}\]\[ERROR\]/i.test(line),
      ]) || 'Structural validation failed; inspect the first [Sxx][ERROR] above.'
    );
  }

  if (gateId === 'check:duplication') {
    return (
      findFirstMatch(lines, [
        (line) => /duplicated lines/i.test(line),
        (line) => /threshold/i.test(line),
        (line) => /clones found/i.test(line),
      ]) || 'Duplication gate failed; extract shared logic/components.'
    );
  }

  if (gateId === 'test:coverage') {
    return (
      findFirstMatch(lines, [
        (line) => /coverage/i.test(line) && /not met|threshold|failed/i.test(line),
        (line) => /Test Files/i.test(line) && /failed/i.test(line),
      ]) || 'Coverage/test gate failed; inspect failing tests or thresholds above.'
    );
  }

  if (gateId === 'build') {
    return (
      findFirstMatch(lines, [
        (line) => /error during build/i.test(line),
        (line) => /build failed/i.test(line),
      ]) || 'Build gate failed; inspect bundler error above.'
    );
  }

  return (
    findFirstMatch(lines, [(line) => /\berror\b|\bfail/i.test(line)]) ||
    'Gate failed; inspect output above.'
  );
}

function runGate(gate) {
  const startedAt = Date.now();
  console.log(
    `[VERIFY][GATE][START] id=${gate.id} command="${gate.command}" started_at=${new Date(
      startedAt,
    ).toISOString()}`,
  );

  const result = spawnSync(gate.command, {
    shell: true,
    encoding: 'utf8',
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  const durationMs = Date.now() - startedAt;
  const combinedOutput = `${result.stdout || ''}\n${result.stderr || ''}`;

  if (result.error) {
    const hint = result.error.message || 'Unknown command execution error.';
    console.error(
      `[VERIFY][GATE][FAIL] id=${gate.id} code=command_error duration_ms=${durationMs}`,
    );
    console.error(`[VERIFY][HINT] gate=${gate.id} message="${hint}"`);
    return {
      id: gate.id,
      command: gate.command,
      status: 'failed',
      durationMs,
      exitCode: 1,
      hint,
    };
  }

  if (result.status !== 0) {
    const hint = extractHint(gate.id, combinedOutput);
    console.error(
      `[VERIFY][GATE][FAIL] id=${gate.id} code=${result.status ?? 1} duration_ms=${durationMs}`,
    );
    console.error(`[VERIFY][HINT] gate=${gate.id} message="${hint}"`);
    return {
      id: gate.id,
      command: gate.command,
      status: 'failed',
      durationMs,
      exitCode: result.status ?? 1,
      hint,
    };
  }

  console.log(`[VERIFY][GATE][PASS] id=${gate.id} duration_ms=${durationMs}`);
  return {
    id: gate.id,
    command: gate.command,
    status: 'passed',
    durationMs,
    exitCode: 0,
    hint: null,
  };
}

const loopStartedAt = Date.now();
const gateResults = [];
let failedGate = null;

console.log(
  `[VERIFY][LOOP][START] total_gates=${GATES.length} started_at=${new Date(
    loopStartedAt,
  ).toISOString()}`,
);

for (const gate of GATES) {
  const result = runGate(gate);
  gateResults.push(result);

  if (result.status === 'failed') {
    failedGate = result;
    break;
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  totalDurationMs: Date.now() - loopStartedAt,
  status: failedGate ? 'failed' : 'passed',
  failedGateId: failedGate ? failedGate.id : null,
  gates: gateResults,
};

mkdirSync('.agent/tmp', { recursive: true });
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

if (failedGate) {
  console.error(
    `[VERIFY][LOOP][FAIL] failed_gate=${failedGate.id} total_duration_ms=${report.totalDurationMs}`,
  );
  console.error(
    '[VERIFY][NEXT] Apply a minimal fix for the failing gate, then run "npm run verify" again (iterative refinement loop).',
  );
  console.error(`[VERIFY][REPORT] path=${REPORT_PATH}`);
  process.exit(failedGate.exitCode || 1);
}

console.log(
  `[VERIFY][LOOP][PASS] total_duration_ms=${report.totalDurationMs} gates_passed=${gateResults.length}`,
);
console.log(`[VERIFY][REPORT] path=${REPORT_PATH}`);
