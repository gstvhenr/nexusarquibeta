# ADR 0005: Pre-commit and Security Gates

- Status: Accepted
- Date: 2026-02-12

## Context

Quality gates existed, but local commit-time guardrails and critical security enforcement were incomplete.

## Decision

Use Husky + lint-staged for pre-commit and enforce critical security checks via `npm run security:check` in CI.

## Alternatives

- No pre-commit hooks.
- Python `pre-commit` framework in a Node-first repo.
- Security checks as non-blocking.

## Consequences

- Faster defect detection before merge.
- Commits may take longer due local checks.

## Reversal

Disable pre-commit hooks and move checks to CI-only if developer throughput is negatively impacted.
