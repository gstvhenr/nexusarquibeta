# ADR 0002: Canonical Verify Gate

- Status: Accepted
- Date: 2026-02-12

## Context

Ad-hoc command usage leads to inconsistent validation and false-green outcomes.

## Decision

Adopt `npm run verify` as canonical readiness gate. It must run, in order:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run format:check`
4. `npm run test`
5. `npm run build`

## Consequences

- Single objective command for local readiness and CI.
- Fewer merge regressions and easier automation.
