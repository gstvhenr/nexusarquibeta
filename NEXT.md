# NEXT.md

## Regra de sessão (obrigatória)

- Atualizar este arquivo ao final de toda sessão de agente.
- Se houver mudança estrutural, registrar também em `DECISIONS-active.md` e/ou ADR.

## Regra de archival

- Quando este arquivo ultrapassar ~100 linhas, mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.
- Manter aqui apenas: última sessão + próximo passo + bloqueios.
- Histórico completo até 2026-02-16: `docs/changelog/session-log-2026-02.md`.

## Último estado conhecido (2026-03-01, sessão 19)

Execução da imunização estrutural do DNA concluída: regras prescritivas de placement + gate estrutural phaseado integrados ao fluxo canônico.

### O que mudou

- [x] Criou `docs/PLACEMENT_RULES.md` (árvore decisória + naming + co-location + anti-patterns).
- [x] Criou `scripts/validate-structure.mjs` com regras:
  - bloqueantes: `S01`, `S02`, `S03`, `S05`
  - phaseadas por baseline: `S04`, `S06`, `S07`
- [x] Criou baseline versionado `scripts/structure-baseline.json` (248 entradas iniciais).
- [x] Adicionou comandos oficiais no `package.json`:
  - `validate:structure`
  - `validate:structure:ratchet`
  - `validate:structure:ratchet:check`
- [x] Integrou `validate:structure` ao `verify-loop` e ao `verify:raw`.
- [x] Atualizou governança/documentação:
  - `AGENTS.md`
  - `ARCHITECTURE.md`
  - `.agent/rules/nexusarqui.md`
  - `docs/governance/core-contract.md`
  - `scripts/check-governance-docs.mjs`
  - `scripts/README.md`
- [x] Registrou decisão estrutural em `DECISIONS-active.md`.

### Validação executada

- [x] `npm run validate:structure:ratchet`
- [x] `npm run validate:structure`
- [x] `npm run validate:structure:ratchet:check`
- [x] `npm run verify` com `[VERIFY][LOOP][PASS]` (9 gates)

## Próximo passo exato

1. Executar ratchet incremental do legado estrutural, priorizando `S06` (imports profundos) com migração gradual para alias `@/`.
2. Planejar redução de `S07` (barrels ausentes) por domínio em micro-batches sem big-bang.
3. Quando backend for adicionado, criar `src/backend/` ao lado de `src/frontend/` e evoluir o validador para dual-root.

## Bloqueios e dúvidas

- Sem bloqueios técnicos.

---

<details>
<summary>Sessão 17 (2026-03-01)</summary>

Prompt operacional de reorganização estrutural foi atualizado para refletir a convenção definida na sessão:

- `src/pages` deve espelhar menu/submenu.
- Preparação para backend futuro deve usar envelope de raiz `frontend/` preservando `frontend/src` (sem renomear `src`).

- [x] Atualizou `.agent/prompts/Prompt_Reorganizacao_Estrutural.md` com regra explícita de placement para `pages` por menu/submenu.
- [x] Atualizou o mesmo prompt com regra explícita para cenário futuro de separação frontend/backend via pasta `frontend/`.
- [x] Ajustou protocolo de auditoria/execução para distinguir `MENU_PATH` (pages) e `LAYER_PATH` (demais camadas).
- [x] Validou documentação e governança com `npm run verify:quick` (verde).

</details>
