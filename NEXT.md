# NEXT.md

## Regra de sessão (obrigatória)

- Atualizar este arquivo ao final de toda sessão de agente.
- Se houver mudança estrutural, registrar também em `DECISIONS-active.md` e/ou ADR.

## Regra de archival

- Quando este arquivo ultrapassar ~100 linhas, mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.
- Manter aqui apenas: última sessão + próximo passo + bloqueios.
- Histórico completo até 2026-02-16: `docs/changelog/session-log-2026-02.md`.

## Último estado conhecido (2026-02-24)

Migração progressiva para Primitivos UI (Lote 1: Gestão de Marketing) finalizada. Tags nativas `<button>` foram substituídas pelo componente `Button` em `GestaoMarketingPage.tsx`, `MarketingContentListView.tsx` e `MarketingIdeasView.tsx`. `npm run verify` verde (8/8 gates). Verificou-se também que a persistência em SQLite já estava devidamente implementada.

### Checklist desta sessão

- [x] Migrado `<button>` para `<Button>` em `GestaoMarketingPage.tsx`.
- [x] Migrado `<button>` para `<Button>` em `MarketingContentListView.tsx`.
- [x] Migrado `<button>` para `<Button>` em `MarketingIdeasView.tsx`.
- [x] `npm run verify` verde (8/8 gates).

## Próximo passo exato

1. ~~**Adicionar SQLite:** Implementar `SqlitePersistenceAdapter` (já concluído em sessão anterior).~~
2. **Migração incremental das páginas restantes** para primitivos UI (Lote 2: páginas restantes ainda com raw HTML).
3. **Token violations** — migrar 16+ arquivos de cores Tailwind genéricas para tokens semânticos.
4. **Code Cleanup v3** — próximos hot spots: marketing modals (2 clones) e outras redundâncias apontadas no jscpd.

## Bloqueios e dúvidas

- Sem bloqueios.
