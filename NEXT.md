# NEXT.md

## Regra de sessão (obrigatória)

- Atualizar este arquivo ao final de toda sessão de agente.
- Se houver mudança estrutural, registrar também em `DECISIONS-active.md` e/ou ADR.

## Regra de archival

- Quando este arquivo ultrapassar ~100 linhas, mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.
- Manter aqui apenas: última sessão + próximo passo + bloqueios.
- Histórico completo até 2026-02-16: `docs/changelog/session-log-2026-02.md`.

## Último estado conhecido (2026-03-02, sessão 24)

Fechamento total das pendências da trilha estrutural concluído no mesmo ciclo: `S06` + `S07` zerados, baseline estrutural e baseline de poluição ratchetados, com `verify:ci` totalmente verde.

### O que mudou

- [x] Converteu em lote as pendências de `S06` (imports profundos) para alias `@/...` com base no baseline ativo.
- [x] Criou barrels `index.ts` para todos os 7 diretórios pendentes de `S07`.
- [x] Ajustou ambiente de testes para alias `@/...` via `vitest.config.ts`.
- [x] Removeu re-export de `storageService` em `src/frontend/services/infrastructure/index.ts` para manter o guard de legado verde.
- [x] Ratchet estrutural completo aplicado: `baseline_removals=231` em `scripts/structure-baseline.json`.
- [x] Ratchet de poluição aplicado após varredura estrutural: `baseline_additions=12` e `baseline_removals=5` em `scripts/pollution-baseline.json`.
- [x] Regenerou inventário ativo: `.agent/memory/project-inventory.md`.
- [x] Registrou decisão desta sessão em `DECISIONS-active.md`.

### Validação executada

- [x] `npm run verify` com `[VERIFY][LOOP][PASS]` (9 gates)
- [x] `npm run validate:structure:ratchet`
- [x] `npm run validate:structure:ratchet:check`
- [x] `npm run validate:structure`
- [x] `npm run inventory:generate`
- [x] `npm run verify:quick`
- [x] `npm run verify:ci` (incluindo `self-review:auto` e `security:check`)

## Próximo passo exato

1. Consolidar commit(s) atômico(s) do lote estrutural (imports, barrels, baselines e documentação).
2. Avaliar, em sessão dedicada, curadoria de exports dos novos barrels para reduzir superfície pública sem quebrar consumidores.
3. Manter `npm run verify:ci` como gate obrigatório para próximos lotes funcionais.

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
