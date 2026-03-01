# NEXT.md

## Regra de sessão (obrigatória)

- Atualizar este arquivo ao final de toda sessão de agente.
- Se houver mudança estrutural, registrar também em `DECISIONS-active.md` e/ou ADR.

## Regra de archival

- Quando este arquivo ultrapassar ~100 linhas, mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.
- Manter aqui apenas: última sessão + próximo passo + bloqueios.
- Histórico completo até 2026-02-16: `docs/changelog/session-log-2026-02.md`.

## Último estado conhecido (2026-03-01, sessão 11)

Reorganização estrutural cautelosa concluída até **P6**, com `verify` verde.

### Checklist desta sessão

- [x] Moveu `DocumentosPage.tsx` para `src/pages/documentos/DocumentosPage.tsx`.
- [x] Corrigiu wrappers `DocumentosPessoalPage.tsx` e `DocumentosProjetosPage.tsx` para import local `./DocumentosPage`.
- [x] Moveu `FinanceiroGestaoCaixaPage.tsx` para `src/pages/financeiro-gestao-caixa/FinanceiroGestaoCaixaPage.tsx`.
- [x] Moveu `ProjetosPage.tsx` e `ProjetosPage.test.tsx` para `src/pages/projetos/`.
- [x] Criou/atualizou barrels de domínio (`src/pages/documentos/index.ts`, `src/pages/financeiro-gestao-caixa/index.ts`, `src/pages/projetos/index.ts`).
- [x] Atualizou lazy imports em `src/App.tsx` para os novos paths.
- [x] Endureceu testes assíncronos para estabilidade do gate (`src/hooks/useLocalStorage.test.ts`, `src/services/infrastructure/loadData.test.ts`).
- [x] Gate canônico validado: `npm run verify` -> `[VERIFY][LOOP][PASS]` (8/8).

## Próximo passo exato

1. Executar P7 com decisão explícita sobre utils co-locados em pages (`budgetHelpers`, `prospectUtils`, `taskUtils`): manter no domínio ou mover para `src/utils/` com critério arquitetural e lote incremental.
2. Reavaliar o plano de `instagram-detail/*` quando entrarem novas redes no menu `Redes Sociais`, para possível consolidação por domínio.

## Bloqueios e dúvidas

- Sem bloqueios técnicos.
- `src/pages/` raiz agora está normalizada (somente diretórios de domínio).
- Decisão operacional mantida: `InstagramDetailPage` permanece em `pages/redes-sociais/`; subcomponentes instagram-específicos seguem em `pages/instagram-detail/` até entrada de novas redes.
- Decisão pendente: estratégia final para utilitários co-locados em pages (`budgetHelpers`, `prospectUtils`, `taskUtils`).
