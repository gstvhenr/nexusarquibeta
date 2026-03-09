# NEXT.md

## Regra de sessão (obrigatória)

- Atualizar este arquivo ao final de toda sessão de agente.
- Se houver mudança estrutural, registrar também em `DECISIONS-active.md` e/ou ADR.

## Regra de archival

- Quando este arquivo ultrapassar ~100 linhas, mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.
- Manter aqui apenas: última sessão + próximo passo + bloqueios.
- Histórico completo até 2026-02-16: `docs/changelog/session-log-2026-02.md`.
- Histórico de sessões 36-56 (2026-03-04 a 2026-03-06): `docs/changelog/session-log-2026-03.md`.

## Último estado conhecido (2026-03-09, remoção temporária de teste flakey em detalhes de projeto)

- O teste [ProjetoDetalhesPageContent.test.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/pages/projetos/detalhes/ProjetoDetalhesPageContent.test.tsx) foi removido por solicitação explícita do usuário.
- O motivo foi instabilidade recorrente e custo alto de manutenção no fluxo integrado de detalhes de projeto durante `test:coverage`.
- A página de produção [ProjetoDetalhesPageContent.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/pages/projetos/detalhes/ProjetoDetalhesPageContent.tsx) não foi alterada nesta sessão.

### O que mudou

- `src/frontend/pages/projetos/detalhes/ProjetoDetalhesPageContent.test.tsx`: arquivo removido temporariamente.

### Bloqueios e dúvidas

- O cenário de dirty-state / beforeunload da página de detalhes de projeto está sem cobertura automatizada neste momento.
- `npm run verify` não foi executado nesta sessão após a remoção do teste, por decisão do usuário.

## Próximo passo exato

- Rodar `npm run verify` manualmente nesta branch sem esse teste.
- Em sessão futura, recriar cobertura menor e mais estável para `ProjetoDetalhesPageContent`, preferencialmente quebrada em testes menores por comportamento.
