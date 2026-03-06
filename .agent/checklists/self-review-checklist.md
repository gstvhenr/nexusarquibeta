# Self-review Checklist (Agent)

## Core

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
- [ ] Test impact: `vitest related --run` executado nos arquivos alterados e todos passaram.
- [ ] Test gap: arquivos de lógica runtime sem `.test.ts(x)` foram identificados e tratados.
- [ ] Contract/interface changes have docs updates.
- [ ] Contract shape changes updated fixtures/golden tests.
- [ ] `NEXT.md` updated.
- [ ] Structural decisions recorded in `DECISIONS-active.md`/ADR.
- [ ] Evidence attached (commands executed + objective results).

## Anti-Poluição (Binário)

- [ ] Inventory do projeto existe em `.agent/memory/project-inventory.md`.
- [ ] Gate de poluição sem regressão foi executado e aprovado.
- [ ] Ratchet de poluição está atualizado.
- [ ] Nenhum `console.log` novo foi adicionado em `src/**`.
- [ ] Nenhum marcador `TODO`/`FIXME`/`HACK`/`XXX` novo foi adicionado em `src/**`.
- [ ] Nenhum export novo ficou sem consumidor fora do baseline de poluição.
