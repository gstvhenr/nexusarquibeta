import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const REQUIRED_VERIFY_STEPS = [
  'npm run typecheck',
  'npm run lint',
  'npm run format:check',
  'npm run check:docs:governance',
  'npm run check:lines',
  'npm run check:duplication',
  'npm run test:coverage',
  'npm run build',
];
const EXPECTED_VERIFY_LOOP_SCRIPT = 'node scripts/verify-loop.mjs';
const VERIFY_RAW_SCRIPT_KEY = 'verify:raw';

const CHECKLIST_PATH = '.agent/checklists/self-review-agent.md';
const COVERAGE_SUMMARY_PATH = 'coverage/coverage-summary.json';
const LINE_RATCHET_ARGS = ['scripts/check-file-lines.mjs', '--check-ratchet'];

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function fail(message) {
  console.error(`[FAIL] ${message}`);
}

function collectNewAnyUsages() {
  const diffResult = spawnSync('git', ['diff', '--unified=0', '--', 'src'], {
    encoding: 'utf8',
  });

  if (diffResult.status !== 0) {
    return {
      status: 'error',
      details: (diffResult.stderr || '').trim() || 'Unable to inspect git diff.',
    };
  }

  const addedLines = diffResult.stdout
    .split(/\r?\n/)
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'));

  const flagged = addedLines.filter((line) => /\bas any\b/.test(line));

  return {
    status: 'ok',
    count: flagged.length,
    examples: flagged.slice(0, 3),
  };
}

function validateVerifyOrder(verifyScript) {
  let previousIndex = -1;

  for (const step of REQUIRED_VERIFY_STEPS) {
    const index = verifyScript.indexOf(step);
    if (index === -1) {
      return {
        valid: false,
        reason: `Missing "${step}" inside verify script.`,
      };
    }
    if (index < previousIndex) {
      return {
        valid: false,
        reason: `Step "${step}" is out of expected order in verify script.`,
      };
    }
    previousIndex = index;
  }

  return { valid: true };
}

function validateLineBaselineRatchet() {
  const result = spawnSync('node', LINE_RATCHET_ARGS, {
    encoding: 'utf8',
  });

  if (result.error) {
    return {
      status: 'error',
      details: result.error.message || 'Unable to execute line-baseline ratchet check.',
    };
  }

  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
  if (result.status !== 0) {
    return {
      status: 'stale',
      details: output || 'Line-baseline ratchet check failed. Run "npm run check:lines:ratchet".',
    };
  }

  return {
    status: 'ok',
    details: output,
  };
}

let failures = 0;

if (!existsSync('package.json')) {
  fail('package.json not found.');
  failures++;
} else {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const verifyScript = packageJson?.scripts?.verify;
  const verifyRawScript = packageJson?.scripts?.[VERIFY_RAW_SCRIPT_KEY];

  if (typeof verifyScript !== 'string') {
    fail('scripts.verify is missing in package.json.');
    failures++;
  } else if (!verifyScript.includes('scripts/verify-loop.mjs')) {
    fail(
      `scripts.verify must use "${EXPECTED_VERIFY_LOOP_SCRIPT}" to emit structured tool-assisted output.`,
    );
    failures++;
  } else {
    pass('Canonical verify uses structured loop runner.');
  }

  if (typeof verifyRawScript !== 'string') {
    fail(`scripts.${VERIFY_RAW_SCRIPT_KEY} is missing in package.json.`);
    failures++;
  } else {
    const verifyValidation = validateVerifyOrder(verifyRawScript);
    if (!verifyValidation.valid) {
      fail(verifyValidation.reason);
      failures++;
    } else {
      pass(`scripts.${VERIFY_RAW_SCRIPT_KEY} contains required validation steps in order.`);
    }
  }
}

if (!existsSync(CHECKLIST_PATH)) {
  fail(`${CHECKLIST_PATH} not found.`);
  failures++;
} else {
  pass('Self-review checklist file exists.');
}

if (!existsSync(COVERAGE_SUMMARY_PATH)) {
  fail(
    `Coverage summary not found at ${COVERAGE_SUMMARY_PATH}. Run "npm run test:coverage" before self-review.`,
  );
  failures++;
} else {
  pass('Coverage summary generated.');
}

const lineRatchetCheck = validateLineBaselineRatchet();
if (lineRatchetCheck.status === 'error') {
  fail(`Unable to validate line-baseline ratchet: ${lineRatchetCheck.details}`);
  failures++;
} else if (lineRatchetCheck.status === 'stale') {
  fail(
    `Line-baseline ratchet is stale. Run "npm run check:lines:ratchet".\n${lineRatchetCheck.details}`,
  );
  failures++;
} else {
  pass('Line-baseline ratchet check passed.');
}

const anyCheck = collectNewAnyUsages();
if (anyCheck.status === 'error') {
  fail(`Unable to detect newly added "as any": ${anyCheck.details}`);
  failures++;
} else if (anyCheck.count > 0) {
  fail(`Detected ${anyCheck.count} new "as any" usage(s) in src diff.`);
  for (const example of anyCheck.examples) {
    console.error(`  ${example}`);
  }
  failures++;
} else {
  pass('No new "as any" usages detected in src diff.');
}

if (failures > 0) {
  console.error(`\nSelf-review failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log('\nSelf-review checks passed.');
