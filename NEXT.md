# NEXT.md

## Regra de sessão (obrigatória)

- Atualizar este arquivo ao final de toda sessão de agente.
- Se houver mudança estrutural, registrar também em `DECISIONS-active.md` e/ou ADR.

## Regra de archival

- Quando este arquivo ultrapassar ~100 linhas, mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.
- Manter aqui apenas: última sessão + próximo passo + bloqueios.
- Histórico completo até 2026-02-16: `docs/changelog/session-log-2026-02.md`.
- Histórico de sessões 36-56 (2026-03-04 a 2026-03-06): `docs/changelog/session-log-2026-03.md`.

## Último estado conhecido (2026-03-10, Marketing > Painel recompactado para tela operacional única)

- A view [MarketingDashboardView.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/pages/gestao-marketing/MarketingDashboardView.tsx) foi refeita de novo para obedecer ao padrão operacional do sistema: um único canvas principal abaixo do `PageHeader`, sem hero, sem faixa editorial, sem cards altos e sem composição expansiva.
- O conteúdo foi reorganizado em uma malha compacta: KPIs pequenos na primeira linha e, abaixo, um workspace único com três zonas internas controladas (`rede de execução`, `radar operacional` e análises), todas com `min-h-0` e `no-scrollbar` apenas onde necessário.
- A página [GestaoMarketingPage.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/pages/gestao-marketing/GestaoMarketingPage.tsx) manteve o padrão `overflow-hidden` + `no-scrollbar` no container principal, alinhado às telas compactas do produto.
- O dashboard manteve o mesmo contrato de dados e interações existentes: edição de prestadores por clique/teclado, leitura de origens de lead, taxa de conversão e resumo de atividades pendentes.
- Os testes de [MarketingDashboardView.test.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/pages/gestao-marketing/MarketingDashboardView.test.tsx), [GestaoMarketingPage.test.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/pages/gestao-marketing/GestaoMarketingPage.test.tsx) e [GestaoMarketingPainelPage.test.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/pages/gestao-marketing/GestaoMarketingPainelPage.test.tsx) permaneceram verdes após essa recompactação.

### O que mudou

- [src/frontend/pages/gestao-marketing/MarketingDashboardView.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/pages/gestao-marketing/MarketingDashboardView.tsx): layout refeito em um único workspace compacto, com KPIs menores, blocos internos enxutos e altura controlada.
- [src/frontend/pages/gestao-marketing/GestaoMarketingPage.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/pages/gestao-marketing/GestaoMarketingPage.tsx): container alinhado ao padrão `no-scrollbar` do app.
- [src/frontend/pages/gestao-marketing/MarketingDashboardView.test.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/pages/gestao-marketing/MarketingDashboardView.test.tsx): assertivas ajustadas para os labels compactos finais (`Pendentes`) e para textos repetidos.
- `NEXT.md`: atualizado com o status desta sessão.

### Bloqueios e dúvidas

- `npx vitest run src/frontend/pages/gestao-marketing/MarketingDashboardView.test.tsx src/frontend/pages/gestao-marketing/GestaoMarketingPage.test.tsx src/frontend/pages/gestao-marketing/GestaoMarketingPainelPage.test.tsx` passou (`8/8` testes) após a recompactação final.
- `npx prettier --check` passou nos arquivos de Marketing alterados.
- `npm run typecheck` falhou por erro preexistente fora desta mudança em [src/frontend/components/finance/EmergencyFundCard.test.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/finance/EmergencyFundCard.test.tsx): `TS2322` relacionado ao campo `targetValue`.
- `npm run verify` não foi executado, porque o primeiro gate oficial (`typecheck`) já está quebrado por esse arquivo externo ao escopo desta sessão.

## Próximo passo exato

- Validar visualmente o [MarketingDashboardView.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/pages/gestao-marketing/MarketingDashboardView.tsx) em viewport desktop e mobile para confirmar que o workspace único realmente evita scroll visível na página e mantém legibilidade.
- Corrigir o erro de tipagem em [src/frontend/components/finance/EmergencyFundCard.test.tsx](/mnt/c/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/finance/EmergencyFundCard.test.tsx) para destravar `npm run typecheck`, e só então reexecutar `npm run verify`.
