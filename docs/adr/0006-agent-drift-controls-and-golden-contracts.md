# ADR 0006 — Agent Drift Controls and Golden Contracts

## Context

Agent sessions without memory were still vulnerable to drift: duplicated command definitions, implicit service contracts, and untracked JSON shape changes.

## Decision

- Keep command source-of-truth only in `AGENTS.md`.
- Require short JSDoc (`input -> output` + example) on public services.
- Maintain canonical fixtures in `src/test/fixtures/*` and enforce shape via `src/test/golden-fixtures.test.ts`.
- Require explicit evidence (plan + executed commands + gate results) for task completion.

## Alternatives Considered

- Keep duplicated command lists across docs.
- Rely only on typecheck/tests without contract fixtures.
- Depend on model reasoning style instead of objective evidence.

## Consequences

- Higher consistency between sessions.
- Lower risk of silent contract regressions.
- Slight maintenance overhead when legitimate shape changes happen.

## Rollback

- Remove fixture-based contract checks and revert to prior validation approach.
- Reintroduce command lists in other docs if centralization proves impractical.

## References

- `AGENTS.md`
- `docs/data-contracts/types-contracts.md`
- `src/test/golden-fixtures.test.ts`
