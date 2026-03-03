# NEXT.md

## Regra de sessão (obrigatória)

- Atualizar este arquivo ao final de toda sessão de agente.
- Se houver mudança estrutural, registrar também em `DECISIONS-active.md` e/ou ADR.

## Regra de archival

- Quando este arquivo ultrapassar ~100 linhas, mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.
- Manter aqui apenas: última sessão + próximo passo + bloqueios.
- Histórico completo até 2026-02-16: `docs/changelog/session-log-2026-02.md`.

## Último estado conhecido (2026-03-03, sessão 28)

Continuação adaptada ao novo baseline estrutural: padronização visual avançou com `Tabs` em 2 consumidores e migração cirúrgica de status/tags para `Badge` em 5 consumidores, sem regressões nos gates canônicos/CI.

### O que mudou

- [x] Auditou alterações paralelas da branch e confirmou novo baseline estrutural ativo:
  - `src/frontend/context/DataContext.tsx` recomposto como orquestrador fino;
  - novos módulos `src/frontend/hooks/useLegacyCleanup.ts`, `src/frontend/hooks/useUndoRedo.ts` e `src/frontend/context/createDomainSetter.ts`.
- [x] Consolidou o átomo `Tabs`:
  - `src/frontend/components/ui/Tabs.tsx` + `src/frontend/components/ui/Tabs.test.tsx`;
  - migração de `src/frontend/pages/projetos/detalhes/ProjetoDetalhesTabs.tsx`;
  - migração adicional de `src/frontend/components/supply-chain/SupplierDetailsPanel.tsx`.
- [x] Executou micro-batch de `Badge` em 5 consumidores com tags/status inline:
  - `src/frontend/components/clientes/ClientTableRow.tsx`
  - `src/frontend/components/supply-chain/SupplierProductsTab.tsx`
  - `src/frontend/components/supply-chain/SupplierDetailsPanel.tsx`
  - `src/frontend/pages/comercial/prospects/ProspectCard.tsx`
  - `src/frontend/pages/suprimentos/comissoes/CommissionsTable.tsx`

### Validação executada

- [x] `npm run verify` com `[VERIFY][LOOP][PASS]` (9 gates)
- [x] `npm run verify:ci` com pass completo (`verify` + `self-review:auto` + `security:check`)

## Próximo passo exato

1. Fechar commits atômicos separados por trilha (`DataContext` estrutural vs. padronização visual `Tabs/Badge`), preservando rastreabilidade.
2. Executar próximo micro-batch de padronização visual para reduzir remanescentes de status/tag inline (priorizar domínio `clientes` e `financeiro`).
3. Reexecutar `npm run verify:ci` no fechamento do próximo lote.

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
