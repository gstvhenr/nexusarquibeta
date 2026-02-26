# Self-review Checklist (Agent)

- [ ] Self-review automático executado (comando oficial em `AGENTS.md`).
- [ ] Scope stayed inside planned files.
- [ ] No big-bang refactor.
- [ ] No new `any` without justification.
- [ ] Canonical gate from `AGENTS.md` passed.
- [ ] Structured runner finished with `[VERIFY][LOOP][PASS]`.
- [ ] Verify report generated at `.agent/tmp/verify-loop-report.json`.
- [ ] No file exceeds line limits (pages: 500, components: 300, services: 400).
- [ ] Line baseline ratchet is up to date (comando oficial em `AGENTS.md`).
- [ ] No new duplication detected by jscpd.
- [ ] Coverage thresholds met for services layer.
- [ ] Business-rule changes have tests.
- [ ] Contract/interface changes have docs updates.
- [ ] Contract shape changes updated fixtures/golden tests.
- [ ] `NEXT.md` updated.
- [ ] Structural decisions recorded in `DECISIONS-active.md`/ADR.
- [ ] Evidence attached (commands executed + objective results).
