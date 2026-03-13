# NEXT.md

## Regra de archival

- Quando este arquivo ultrapassar ~100 linhas, mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.

## Último estado conhecido (2026-03-13)

Segunda rodada de auditoria de `docs/`. Cruzamento completo dos ~30 arquivos em `docs/` contra a árvore real de `src/frontend/`. Correção dos 4 últimos arquivos com paths legados.

### Checklist desta sessão

- [x] Auditoria completa de ~30 arquivos em `docs/` contra árvore real
- [x] Correção de `docs/design-system/design-tokens.md` (2 paths: theme.ts e ThemeContext)
- [x] Correção de `docs/process/continuous-update-policy.md` (2 paths: test/fixtures)
- [x] Correção de `docs/examples/canonical-component-client-row.md` (FinanceiroRecebiveisPage → FinanceiroVisaoGeralPage)
- [x] Correção de `docs/examples/hook-extraction.md` (ProjetoDetalhesPageContent path completo)
- [x] Prettier + `npm run verify:quick` → PASS

### Concluído nesta sessão

- `docs/design-system/design-tokens.md` — paths corrigidos para `src/frontend/constants/theme.ts` e `src/frontend/context/ThemeContext.tsx`.
- `docs/process/continuous-update-policy.md` — paths corrigidos para `src/frontend/test/`.
- `docs/examples/canonical-component-client-row.md` — referência a página inexistente substituída.
- `docs/examples/hook-extraction.md` — path completo para `projetos/detalhes/`.

## Evidências da sessão

- `npm run verify:quick` → PASS (typecheck + lint + format:check + check:docs:governance)

## Próximo passo exato

1. Aguardar direcionamento do usuário para novas tarefas de engenharia, features, ou auditorias de outros escopos críticos.

## Bloqueios e dúvidas

- Sem bloqueios.
