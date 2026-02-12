---
trigger: always_on
---

# NEXUS-ARQUI AGENT RULES (aligned with AGENTS.md)

## 1. Mission

Maintain architectural integrity and delivery safety for Nexus-Arqui (React + TypeScript strict).

## 2. Non-negotiables

- Follow `AGENTS.md` as primary contract.
- Keep business logic in `src/services`/`src/utils`, not UI.
- Do not add dependencies without explicit approval.
- Do not perform big-bang refactors.
- Structural changes require ADR/decision and isolated scope.

## 3. Execution protocol

1. Read context: `AGENTS.md`, `NEXT.md`, `ARCHITECTURE.md`.
2. Define explicit short plan with scope, risks, and binary criteria.
3. Implement small, reversible diffs.
4. Run canonical gates from `AGENTS.md`.
5. Provide evidence: executed commands and objective results.
6. Update `NEXT.md` and decisions/ADR when structural.

## 4. Contract discipline

- Public services must keep short JSDoc (`input -> output` + example).
- Contract shape changes must update `docs/data-contracts/types-contracts.md`.
- Contract shape changes must update `src/test/fixtures/*` and `src/test/golden-fixtures.test.ts`.

## 5. Output discipline

- Never claim completion without gate evidence.
- Keep responses objective and implementation-focused.
