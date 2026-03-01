# DECISIONS-active.md

Decisões arquiteturais/processuais vigentes. Para histórico completo, consulte `docs/changelog/decisions-archive.md`.

## Regra

- Mudança estrutural relevante exige registro aqui e/ou ADR em `docs/adr/`.
- Cada entrada deve apontar contexto, decisão, consequência e como reverter.
- Quando uma decisão for superseded ou irrelevante, mover para `docs/changelog/decisions-archive.md`.

## Entradas

### 2026-03-01 — Reorganização estrutural cautelosa (P5): Relatórios e Propostas consolidados por domínio

- Contexto: após P4.3c, ainda restavam páginas de `Relatórios` e `Propostas` na raiz de `src/pages/`, mantendo acoplamento estrutural e dispersão de domínio.
- Decisão:
  1. Executar sub-batch `P5.1`: mover `RelatoriosLayout.tsx`, `RelatorioFinanceiroPage.tsx`, `RelatorioProjetosPage.tsx` e `RelatorioAquisicaoPage.tsx` para `src/pages/relatorios/`, ajustando imports relativos e lazy imports em `src/App.tsx`.
  2. Criar barrel de domínio em `src/pages/relatorios/index.ts`.
  3. Executar sub-batch `P5.2`: mover `PropostasPage.tsx`, `PropostaDetalhesPage.tsx` e `PropostasPage.test.tsx` para `src/pages/propostas/`, ajustando imports relativos e lazy imports em `src/App.tsx`.
  4. Criar barrel de domínio em `src/pages/propostas/index.ts`.
  5. Validar ambos os sub-batches com `npm run verify` até `[VERIFY][LOOP][PASS]` (8/8), incluindo correção automática de formatação em `PropostaDetalhesPage.tsx`.
- Consequência: domínio de relatórios e propostas ficou coeso no filesystem, com roteamento preservado, teste de integração de propostas mantido co-localizado e zero regressão funcional observada.
- Reversão:
  1. Mover os sete arquivos de volta para `src/pages/`.
  2. Restaurar imports anteriores em `src/App.tsx`, pages e teste afetados.
  3. Remover barrels adicionados em `src/pages/relatorios/index.ts` e `src/pages/propostas/index.ts`.
- Referências: `src/pages/relatorios/RelatoriosLayout.tsx`, `src/pages/relatorios/RelatorioFinanceiroPage.tsx`, `src/pages/relatorios/RelatorioProjetosPage.tsx`, `src/pages/relatorios/RelatorioAquisicaoPage.tsx`, `src/pages/relatorios/index.ts`, `src/pages/propostas/PropostasPage.tsx`, `src/pages/propostas/PropostaDetalhesPage.tsx`, `src/pages/propostas/PropostasPage.test.tsx`, `src/pages/propostas/index.ts`, `src/App.tsx`, `NEXT.md`.

### 2026-03-01 — Reorganização estrutural cautelosa (P4.3c): Orçamentos, Prestadores, ProjetoDetalhes e Tarefas migrados por domínio

- Contexto: após P4.3b, ainda havia páginas de alta relevância (`OrcamentosPage`, `PrestadoresFreelancersPage`, `ProjetoDetalhesPage`, `ProjetoDetalhesPageContent`, `TarefasPage`) soltas na raiz de `src/pages/`, apesar de os domínios já existirem.
- Decisão:
  1. Executar micro-batch `P4.3c.1`: mover `OrcamentosPage.tsx` para `src/pages/orcamentos/` e `PrestadoresFreelancersPage.tsx` para `src/pages/prestadores-freelancers/`, com ajuste de imports/barrels e `npm run verify` verde.
  2. Executar micro-batch `P4.3c.2`: mover `ProjetoDetalhesPage.tsx` e `ProjetoDetalhesPageContent.tsx` para `src/pages/projeto-detalhes/`, e `TarefasPage.tsx` para `src/pages/tarefas/`, com ajuste de imports/barrels e `npm run verify` verde.
  3. Atualizar lazy imports em `src/App.tsx` para os novos caminhos de domínio.
  4. Atualizar/introduzir barrels em `src/pages/orcamentos/index.ts`, `src/pages/prestadores-freelancers/index.ts`, `src/pages/projeto-detalhes/index.ts` e `src/pages/tarefas/index.ts`.
- Consequência: coesão estrutural aumentada em domínios críticos, com redução adicional da raiz de `src/pages/` e sem regressão funcional (dois runs de `verify`, ambos `8/8`).
- Reversão:
  1. Mover os cinco arquivos de volta para `src/pages/`.
  2. Restaurar imports anteriores nos arquivos movidos e no `src/App.tsx`.
  3. Remover exports de pages adicionados nos barrels de domínio criados/atualizados nesta etapa.
- Referências: `src/pages/orcamentos/OrcamentosPage.tsx`, `src/pages/orcamentos/index.ts`, `src/pages/prestadores-freelancers/PrestadoresFreelancersPage.tsx`, `src/pages/prestadores-freelancers/index.ts`, `src/pages/projeto-detalhes/ProjetoDetalhesPage.tsx`, `src/pages/projeto-detalhes/ProjetoDetalhesPageContent.tsx`, `src/pages/projeto-detalhes/index.ts`, `src/pages/tarefas/TarefasPage.tsx`, `src/pages/tarefas/index.ts`, `src/App.tsx`, `NEXT.md`.

### 2026-03-01 — Reorganização estrutural cautelosa (P4.3b): Instagram alinhado a Redes Sociais e Prospects co-localizado

- Contexto: após P4.3a, ainda havia `InstagramDetailPage.tsx` e `ProspectsPage.tsx` soltos na raiz de `src/pages/`. Como `Instagram` pertence ao menu de **Marketing > Redes Sociais** e novas redes já cadastradas devem entrar no mesmo domínio, manter a page na raiz aumentava desalinhamento estrutural.
- Decisão:
  1. Mover `InstagramDetailPage.tsx` para `src/pages/redes-sociais/InstagramDetailPage.tsx`, mantendo os subcomponentes instagram-específicos em `src/pages/instagram-detail/` nesta etapa.
  2. Mover `ProspectsPage.tsx` para `src/pages/prospects/ProspectsPage.tsx`.
  3. Ajustar imports relativos internos das pages movidas e lazy imports em `src/App.tsx`.
  4. Criar/atualizar barrels de domínio (`src/pages/redes-sociais/index.ts` e `src/pages/prospects/index.ts`).
  5. Validar o batch com `npm run verify` até `[VERIFY][LOOP][PASS]` (8/8).
- Consequência: `InstagramDetailPage` passa a refletir corretamente o domínio de redes sociais e `ProspectsPage` fica co-localizada com seus componentes/utilitários, sem alteração comportamental.
- Reversão:
  1. Mover `src/pages/redes-sociais/InstagramDetailPage.tsx` e `src/pages/prospects/ProspectsPage.tsx` de volta para `src/pages/`.
  2. Restaurar imports anteriores em `src/App.tsx` e nas pages afetadas.
  3. Remover export adicionado em `src/pages/prospects/index.ts` e excluir `src/pages/redes-sociais/index.ts` (se não houver consumidores).
- Referências: `src/pages/redes-sociais/InstagramDetailPage.tsx`, `src/pages/redes-sociais/index.ts`, `src/pages/prospects/ProspectsPage.tsx`, `src/pages/prospects/index.ts`, `src/App.tsx`, `NEXT.md`.

### 2026-03-01 — Reorganização estrutural cautelosa (P4.3a): domínio de gestão de marketing consolidado

- Contexto: após P4.1/P4.2, as páginas de entrada de gestão de marketing ainda estavam soltas na raiz de `src/pages/`, enquanto os subcomponentes de domínio já residiam em `src/pages/gestao-marketing/`.
- Decisão:
  1. Mover `GestaoMarketingPage.tsx`, `GestaoMarketingPainelPage.tsx`, `GestaoMarketingConteudosPage.tsx` e `GestaoMarketingBancoIdeiasPage.tsx` para `src/pages/gestao-marketing/`.
  2. Ajustar imports relativos internos de `GestaoMarketingPage.tsx` para manter boundaries corretos após a movimentação.
  3. Atualizar lazy imports em `src/App.tsx` para os novos caminhos de domínio.
  4. Atualizar barrel de domínio em `src/pages/gestao-marketing/index.ts` com re-exports explícitos das pages.
  5. Validar o batch com `npm run verify` até `[VERIFY][LOOP][PASS]` (8/8), com autocorreção de formatação em `GestaoMarketingPage.tsx`.
- Consequência: domínio de marketing passa a ficar coeso no filesystem (pages + views no mesmo diretório), reduzindo dispersão na raiz de `src/pages/` sem alteração comportamental.
- Reversão:
  1. Mover os quatro arquivos de volta para `src/pages/`.
  2. Restaurar imports anteriores em `src/App.tsx` e em `src/pages/gestao-marketing/GestaoMarketingPage.tsx`.
  3. Remover os re-exports das pages adicionados em `src/pages/gestao-marketing/index.ts`.
- Referências: `src/pages/gestao-marketing/GestaoMarketingPage.tsx`, `src/pages/gestao-marketing/GestaoMarketingPainelPage.tsx`, `src/pages/gestao-marketing/GestaoMarketingConteudosPage.tsx`, `src/pages/gestao-marketing/GestaoMarketingBancoIdeiasPage.tsx`, `src/pages/gestao-marketing/index.ts`, `src/App.tsx`, `NEXT.md`.

### 2026-03-01 — Reorganização estrutural cautelosa (P4.1 + P4.2): Documentos e Financeiro migrados para subdiretórios

- Contexto: após P3.2, ainda havia wrappers de documentos e páginas financeiras de alto tráfego soltas na raiz de `src/pages/`, contrariando o padrão incremental por domínio já adotado nos batches anteriores.
- Decisão:
  1. Mover `DocumentosPessoalPage.tsx` e `DocumentosProjetosPage.tsx` para `src/pages/documentos/`.
  2. Mover `FinanceiroDebitosPage.tsx`, `FinanceiroRecebiveisPage.tsx`, `FinanceiroPrevisaoCaixaPage.tsx` e `FinanceiroVisaoGeralPage.tsx` para `src/pages/financeiro/`.
  3. Ajustar imports relativos internos dos arquivos movidos e lazy imports em `src/App.tsx`.
  4. Atualizar/introduzir barrels de domínio em `src/pages/documentos/index.ts` e `src/pages/financeiro/index.ts`.
  5. Validar cada micro-batch com `npm run verify` até `[VERIFY][LOOP][PASS]` (8/8).
- Consequência: redução da dispersão em `src/pages/`, com roteamento estável e zero delta funcional; domínio financeiro passou a ter pasta própria com barrel dedicado.
- Reversão:
  1. Mover os 6 arquivos de volta para `src/pages/`.
  2. Restaurar imports anteriores em `src/App.tsx` e nos wrappers/pages afetados.
  3. Remover exports adicionados em `src/pages/documentos/index.ts` e excluir `src/pages/financeiro/index.ts` (se não houver consumidores).
- Referências: `src/pages/documentos/DocumentosPessoalPage.tsx`, `src/pages/documentos/DocumentosProjetosPage.tsx`, `src/pages/documentos/index.ts`, `src/pages/financeiro/FinanceiroDebitosPage.tsx`, `src/pages/financeiro/FinanceiroRecebiveisPage.tsx`, `src/pages/financeiro/FinanceiroPrevisaoCaixaPage.tsx`, `src/pages/financeiro/FinanceiroVisaoGeralPage.tsx`, `src/pages/financeiro/index.ts`, `src/App.tsx`, `NEXT.md`.

### 2026-03-01 — Reorganização estrutural cautelosa (P3.2): Agenda e ClienteDetalhes migrados para subdiretórios

- Contexto: após P3.1, ainda havia `AgendaPage` e `ClienteDetalhesPage` (com seus testes) soltos na raiz de `src/pages/`, apesar de existirem os diretórios de domínio `agenda/` e `cliente-detalhes/`.
- Decisão:
  1. Mover `AgendaPage.tsx` e `AgendaPage.test.tsx` para `src/pages/agenda/`.
  2. Mover `ClienteDetalhesPage.tsx` e `ClienteDetalhesPage.test.tsx` para `src/pages/cliente-detalhes/`.
  3. Atualizar imports relativos internos das pages/testes e lazy imports em `src/App.tsx`.
  4. Criar barrels mínimos de domínio em `src/pages/agenda/index.ts` e `src/pages/cliente-detalhes/index.ts`.
  5. Validar o batch com `npm run verify` até `[VERIFY][LOOP][PASS]`.
- Consequência: redução adicional de pages soltas na raiz, mantendo co-location de testes por domínio e zero delta funcional (8/8 gates verdes).
- Reversão:
  1. Mover os quatro arquivos de volta para `src/pages/`.
  2. Restaurar imports anteriores em `src/App.tsx`, pages e testes afetados.
  3. Remover `index.ts` criados em `agenda/` e `cliente-detalhes/` (se não forem mais necessários).
- Referências: `src/pages/agenda/AgendaPage.tsx`, `src/pages/agenda/AgendaPage.test.tsx`, `src/pages/agenda/index.ts`, `src/pages/cliente-detalhes/ClienteDetalhesPage.tsx`, `src/pages/cliente-detalhes/ClienteDetalhesPage.test.tsx`, `src/pages/cliente-detalhes/index.ts`, `src/App.tsx`, `NEXT.md`.

### 2026-03-01 — Reorganização estrutural cautelosa (P3.1): pages raiz para subdiretórios de domínio

- Contexto: havia pages de domínio ainda soltas em `src/pages/` raiz, enquanto os domínios já possuíam subpastas dedicadas (`clientes`, `comissoes`, `configuracoes`). A execução segue o protocolo incremental-atômico definido no prompt de reorganização estrutural, com gate obrigatório por batch.
- Decisão:
  1. Mover `ClientesPage.tsx`, `ComissoesPage.tsx` e `ConfiguracoesPage.tsx` para `src/pages/clientes/`, `src/pages/comissoes/` e `src/pages/configuracoes/`.
  2. Atualizar imports relativos internos nas pages movidas e lazy imports em `src/App.tsx`.
  3. Atualizar barrels de destino para incluir re-export explícito das pages.
  4. Validar o batch com `npm run verify` até `[VERIFY][LOOP][PASS]` antes de avançar para P3.2.
- Consequência: redução de dispersão estrutural em `src/pages/`, com alinhamento ao modelo por domínio e sem delta funcional (8/8 gates verdes).
- Reversão:
  1. Mover os três arquivos de volta para `src/pages/` raiz.
  2. Restaurar imports anteriores em `src/App.tsx` e nas pages afetadas.
  3. Remover os re-exports adicionados nos barrels de domínio.
- Referências: `src/pages/clientes/ClientesPage.tsx`, `src/pages/comissoes/ComissoesPage.tsx`, `src/pages/configuracoes/ConfiguracoesPage.tsx`, `src/pages/clientes/index.ts`, `src/pages/comissoes/index.ts`, `src/pages/configuracoes/index.ts`, `src/App.tsx`, `NEXT.md`.

### 2026-03-01 — Clean DNA v1: anti-poluição automatizada com ratchet + inventário vivo

- Contexto: o fluxo diário ainda dependia de memória do agente para evitar poluição (exports mortos, logs de debug, marcadores TODO/FIXME e duplicação por ausência de inventário vivo). Havia desalinhamento entre o checklist canônico em `.agent/checklists/self-review-checklist.md` e a referência usada por `run-self-review`.
- Decisão:
  1. Introduzir gate automático de poluição com baseline ratchet (`scripts/check-pollution-ratchet.mjs` + `scripts/pollution-baseline.json`) usando `knip` em modo JSON para detectar regressão incremental sem bloquear por dívida legada.
  2. Introduzir inventário vivo do projeto (`scripts/generate-inventory.mjs` -> `.agent/memory/project-inventory.md`) para orientar reuso antes de criar novos hooks/services/utils/types.
  3. Endurecer `self-review:auto` para exigir inventário existente, executar checks de poluição (regressão + ratchet) e bloquear linhas novas de `console.log`/`TODO|FIXME|HACK|XXX` em `src/**`.
  4. Alinhar governança ativa para checklist único (`self-review-checklist.md`) em AGENTS/workflows/core-contract.
- Consequência: prevenção de poluição deixa de ser honor system e passa a ter enforcement automático no fechamento de sessão (`self-review:auto`) e no CI (`verify:ci`), mantendo `verify` canônico de 8 gates inalterado.
- Reversão:
  1. Remover scripts de inventário/poluição e comandos correspondentes em `package.json`.
  2. Remover enforcement adicional de `run-self-review.mjs`.
  3. Reverter ajustes documentais de AGENTS/workflows/checklist/core-contract para estado anterior.
- Referências: `scripts/check-pollution-ratchet.mjs`, `scripts/generate-inventory.mjs`, `scripts/pollution-baseline.json`, `.agent/memory/project-inventory.md`, `scripts/run-self-review.mjs`, `package.json`, `AGENTS.md`, `.agent/workflows/default-task-flow.md`, `.agent/workflows/verify-first.md`, `.agent/checklists/self-review-checklist.md`, `docs/governance/core-contract.md`.

### 2026-02-28 — Hardening arquitetural incremental: ciclos e reconciliação ArchPulse

- Contexto: o ArchPulse reportou dois ciclos (`src/types/index.ts <-> src/types/appData.ts` e `src/index.tsx -> src/index.tsx`). O primeiro era real; o segundo não reproduzia no `dependency-cruiser`.
- Decisão:
  1. Remover ciclo real de tipos em `src/types` substituindo import via barrel em `appData.ts` por imports diretos de módulos de domínio.
  2. Zerar violações locais do `depcruise` sem tocar arquivos sensíveis: desacoplamento de `NavLinkItem` da camada UI, exclusão explícita de `storageService.ts` na regra de órfãos e exceção de `src/vite-env.d.ts` para unresolvable.
  3. Tratar `dependency-cruiser` como fonte canônica local para circularidade; manter ArchPulse com reconciliação externa até ajuste do parser/config no pipeline.
- Consequência: análise arquitetural local ficou determinística (sem violações) e o falso positivo de self-cycle no bootstrap passou a ter evidência rastreável para correção externa.
- Reversão:
  1. Restaurar import de `AppData` via barrel em `src/types/appData.ts`.
  2. Reverter ajustes de `.dependency-cruiser.cjs` e tipagem de `src/types/common.ts`.
  3. Remover documentação de reconciliação em `docs/audits/archpulse-reconciliation-2026-02-28.md`.
- Referências: `.dependency-cruiser.cjs`, `src/types/appData.ts`, `src/types/common.ts`, `docs/audits/archpulse-reconciliation-2026-02-28.md`.

### 2026-02-23 — PersistencePort: Abstração de persistência para SQLite readiness

- Contexto: `loadData.ts`, `autoBackupService.ts`, `storageQuotaService.ts` e `uiPreferenceService.ts` estavam acoplados diretamente ao `indexedDbService`, impedindo troca de backend sem rewrite.
- Decisão: introduzir `PersistencePort` (interface) + `IndexedDbPersistenceAdapter` (implementação) + factory singleton em `src/services/infrastructure/persistence/`. Refatorar os 4 consumidores para usar a interface via `createPersistenceAdapter()`. `api.ts` e `storageService.ts` permaneceram intocados (Don't Touch list).
- Consequência: troca de backend de persistência (SQLite, REST, etc.) exige apenas criar novo adapter implementando `PersistencePort` e alterar a factory — zero impacto em services de domínio, contextos, hooks ou UI.
- Reversão: remover diretório `persistence/`, restaurar imports diretos de `indexedDbService` nos 4 consumidores refatorados.
- Referências: `src/services/infrastructure/persistence/PersistencePort.ts`, `src/services/infrastructure/persistence/IndexedDbPersistenceAdapter.ts`, `src/services/infrastructure/persistence/createPersistenceAdapter.ts`, `src/services/infrastructure/persistence/index.ts`, `src/services/infrastructure/loadData.ts`, `src/services/infrastructure/autoBackupService.ts`, `src/services/infrastructure/storageQuotaService.ts`, `src/services/infrastructure/uiPreferenceService.ts`.

### 2026-02-18 — Persistência entity-first + backup automático + preferências UI fora de localStorage

- Contexto: mesmo após migração do `AppData` para IndexedDB, ainda havia uso de `localStorage` em preferências/sessão de UI, não existia backup automático e o runtime dependia de snapshot único sem leitura por entidade.
- Decisão: expandir `indexedDbService` com stores modelados (`app_entity_state`, `ui_preferences`, `app_auto_backups`) e índices; tornar `loadData` entity-first (fallback para snapshot legado), integrar backup automático por `autoBackupService`, migrar `useLocalStorage` para `uiPreferenceService` (IndexedDB) e remover usos diretos de `localStorage` em páginas (`AgendaPage`, `BlocoDeNotasPage`); manter `storageService.ts` isolado sem consumidores e com guard de não-uso em teste.
- Consequência: produção deixa de depender de `localStorage` para fluxos de UI/sessão e dados de negócio; backups automáticos passam a existir com retenção; persistência ganha leitura/escrita por entidade sem big-bang.
- Reversão: reverter `useLocalStorage`/páginas para `window.localStorage`, remover stores e serviços novos (`autoBackupService`, `uiPreferenceService`) e voltar bootstrap para snapshot-only.
- Referências: `src/services/infrastructure/indexedDbService.ts`, `src/services/infrastructure/loadData.ts`, `src/services/infrastructure/autoBackupService.ts`, `src/services/infrastructure/uiPreferenceService.ts`, `src/services/infrastructure/storageQuotaService.ts`, `src/hooks/useLocalStorage.ts`, `src/pages/AgendaPage.tsx`, `src/pages/BlocoDeNotasPage.tsx`, `src/services/infrastructure/storageService.usage.test.ts`.

### 2026-02-18 — Persistência principal migrada de localStorage para IndexedDB

- Contexto: o ERP estava usando `localStorage` como base de dados principal, com limites de capacidade baixos e sem transações reais para escrita do estado.
- Decisão: adotar `IndexedDB` como fonte de verdade única de persistência do `AppData` via snapshot transacional (`indexedDbService` + fila de persistência), removendo fallback/migração automática por `localStorage` no runtime.
- Consequência: elimina dependência de `localStorage` na persistência principal e no lock do contador global; mantém sincronização cross-tab por `BroadcastChannel` e fallback apenas volátil em memória para ambientes sem IDB.
- Reversão: remover `indexedDbService`, voltar `loadData/updateData` para escrita por chave em `storageService` (`localStorage`) e restaurar lock de contador legado.
- Referências: `src/services/infrastructure/indexedDbService.ts`, `src/services/infrastructure/loadData.ts`, `src/services/infrastructure/api.ts`, `src/services/infrastructure/indexedDbService.test.ts`, `src/services/infrastructure/storageQuotaService.ts`, `src/index.tsx`, `CONTEXT.md`, `docs/architecture.md`.

### 2026-02-17 — Governança core-enxuta com anti-drift automático

- Contexto: o volume de documentação/processo estava desproporcional ao tamanho da base de produção e o custo de manutenção de `AGENTS.md` estava crescendo por duplicação de comandos/regras em múltiplos arquivos.
- Decisão: adotar governança ativa enxuta com taxonomia explícita (`docs/governance/core-contract.md`), arquivar biblioteca de prompts/workflow longo em `.agent/archive/*`, manter `AGENTS.md` como núcleo de comandos/gates e introduzir gate automático `check:docs:governance` no `verify:quick` e `verify`.
- Consequência: redução do escopo de manutenção diária, bloqueio automático de drift documental (referência legada de decisões e duplicação de comandos fora de `AGENTS.md`) e budget explícito de bytes para governança ativa.
- Reversão: restaurar `.agent/prompts/*` e workflow arquivado para o fluxo ativo, remover `check:docs:governance` dos scripts de verificação e voltar ao modelo documental anterior.
- Referências: `AGENTS.md`, `docs/governance/core-contract.md`, `.agent/README.md`, `.agent/archive/prompts-v1/*`, `.agent/archive/workflows/code-cleanup-v1.md`, `scripts/check-governance-docs.mjs`, `scripts/verify-loop.mjs`, `package.json`, `scripts/run-self-review.mjs`.

### 2026-02-15 — Contexto hierárquico com lazy loading (MVI)

- Contexto: `NEXT.md` cresceu para 448 linhas (~31KB), consumindo ~8-10K tokens por sessão. ~80% é histórico irrelevante para a tarefa atual.
- Decisão: implementar Progressive Disclosure em 3 camadas — `CONTEXT.md` como índice de ponteiros, `NEXT.md` slim (apenas última sessão), histórico arquivado em `docs/changelog/session-log-YYYY-MM.md`.
- Consequência: redução de ~70% no consumo de tokens no bootstrap (587→249 linhas). Histórico preservado e consultável.
- Reversão: mover conteúdo de `docs/changelog/session-log-*.md` de volta para `NEXT.md` e remover `CONTEXT.md`.
- Referências: `CONTEXT.md`, `NEXT.md`, `docs/changelog/session-log-2026-02.md`, `docs/adr/0009-hierarchical-context-lazy-loading.md`.

### 2026-02-16 — Gate canônico expandido com auto-validação incremental

- Contexto: `verify` não media cobertura, não detectava duplicação, não checava complexidade por tamanho e o self-review era apenas checklist passivo.
- Decisão: expandir `npm run verify` com `check:lines`, `check:duplication`, `test:coverage` e `self-review:auto`; adotar baseline versionado para limites de linha (`scripts/file-line-baseline.json`) para bloquear regressões sem travar por dívida histórica.
- Consequência: feedback determinístico e interpretável para o agente com enforcement automático no pipeline.
- Reversão: remover scripts/configs novos e restaurar `verify` anterior (apenas typecheck/lint/format/test/build).
- Referências: `package.json`, `scripts/check-file-lines.mjs`, `scripts/file-line-baseline.json`, `.jscpd.json`, `scripts/run-self-review.mjs`, `vitest.config.ts`.

### 2026-02-16 — Loop fechado de validação assistida por ferramentas

- Contexto: mesmo com gates expandidos, faltava contrato operacional explícito para o ciclo "falha -> interpretação -> correção -> nova execução".
- Decisão: tornar `npm run verify` um runner estruturado (`scripts/verify-loop.mjs`) com marcadores determinísticos por gate (`[VERIFY][GATE][START|PASS|FAIL]`, `[VERIFY][HINT]`, `[VERIFY][LOOP][PASS|FAIL]`) e relatório em `.agent/tmp/verify-loop-report.json`; manter `verify:raw` como referência da ordem canônica.
- Consequência: agentes passam a ter saída parseável e protocolo fechado obrigatório para reação a falhas, reduzindo viés de confirmação de self-review textual.
- Reversão: apontar `verify` de volta para cadeia shell e remover runner estruturado/documentação de loop.
- Referências: `scripts/verify-loop.mjs`, `package.json`, `scripts/run-self-review.mjs`, `AGENTS.md`, `.agent/workflows/verify-first.md`.

### 2026-02-16 — Endurecimento dos gates de Etapa 3 (thresholds efetivos)

- Contexto: faltava ativar thresholds mais rígidos para duplicação e cobertura de services, mantendo feedback determinístico no loop fechado.
- Decisão: reduzir `jscpd` para `5%` em `.jscpd.json`; habilitar thresholds de cobertura em `vitest.config.ts` para `src/services/**/*.ts` (`lines 70`, `branches 60`, `functions 70`, `statements 70`); adicionar testes para `clientExportService` e `clientFinancialSummaryService` para sustentar o novo piso.
- Consequência: `test:coverage` e `check:duplication` passam a bloquear regressões com limites explícitos e mensuráveis.
- Reversão: retornar thresholds anteriores (`jscpd 8%` e sem thresholds de coverage) e remover os testes adicionados.
- Referências: `.jscpd.json`, `vitest.config.ts`, `src/services/clientExportService.test.ts`, `src/services/clientFinancialSummaryService.test.ts`.

### 2026-02-16 — Pipeline final canônico em 7 gates (Etapa 4)

- Contexto: após Etapas 1-3, o `verify` ainda incluía `self-review:auto` no caminho canônico, mas o pipeline final aprovado é de 7 gates técnicos em ordem fail-fast.
- Decisão: fixar `npm run verify` e `npm run verify:raw` na sequência: `typecheck` -> `lint` -> `format:check` -> `check:lines` -> `check:duplication` -> `test:coverage` -> `build`; manter `self-review:auto` como comando complementar fora do gate canônico.
- Consequência: gate principal fica mais enxuto e alinhado ao custo/benefício da ordem rápida->cara, preservando self-review para uso operacional sem bloquear o pipeline final.
- Reversão: recolocar `self-review:auto` dentro do `verify` e atualizar scripts/documentação.
- Referências: `package.json`, `scripts/verify-loop.mjs`, `scripts/run-self-review.mjs`, `AGENTS.md`.

### 2026-02-16 — Enforcement documental da autocorreção (Etapa 5)

- Contexto: pipeline técnico já estava consolidado, mas faltava explicitar no DoD/checklist ações obrigatórias quando cobertura, complexidade ou duplicação estourassem.
- Decisão: reforçar `AGENTS.md` com critérios explícitos no Definition of Done (cobertura >=70% para regras novas em `services/`, decomposição de pages >500 linhas e ação sobre duplicação reportada por `jscpd`); alinhar `.agent/checklists/self-review-agent.md` com itens explícitos de linhas, duplicação e thresholds de cobertura.
- Consequência: reduz ambiguidade na conclusão de tarefas e fortalece o padrão closed-loop tool-assisted validation.
- Reversão: remover os critérios adicionais do DoD/checklist e retornar ao texto anterior.
- Referências: `AGENTS.md`, `.agent/checklists/self-review-agent.md`.

### 2026-02-16 — Hardening de CI com self-review obrigatório e ratchet de baseline

- Contexto: `verify` já era determinístico, mas `self-review:auto` ainda era opcional no CI e o baseline de linhas não tinha mecanismo explícito de aperto incremental.
- Decisão: tornar `self-review:auto` obrigatório em `verify:ci` (`verify -> self-review:auto -> security:check`); adicionar comandos de ratchet em `check-file-lines` (`--check-ratchet` e `--ratchet-baseline`) e enforcement automático desse ratchet dentro de `run-self-review`.
- Consequência: o CI passa a bloquear drift de checklist e baseline de complexidade, forçando redução progressiva da dívida legada quando houver oportunidade.
- Reversão: retirar `self-review:auto` de `verify:ci` e remover as flags de ratchet/enforcement dos scripts.
- Referências: `package.json`, `scripts/check-file-lines.mjs`, `scripts/run-self-review.mjs`, `AGENTS.md`, `scripts/README.md`.

### 2026-02-16 — Formalização do padrão Given/When/Then nos testes

- Contexto: havia incoerência entre regra declarada em `AGENTS.md` e prática observada em testes sem marcação explícita de intenção.
- Decisão: manter padrão GWT e exigir comentários explícitos `// Given`, `// When`, `// Then`; consolidar o modelo canônico em `docs/examples/service-with-tests.md` e iniciar migração incremental por arquivo.
- Consequência: maior previsibilidade para agentes e revisão humana; redução de ambiguidade na leitura de casos de teste.
- Reversão: atualizar regra de testes para `describe/it` simples e remover exigência de comentários GWT.
- Referências: `AGENTS.md`, `docs/examples/service-with-tests.md`, `src/services/clientService.test.ts`.

### 2026-02-16 — Decomposição incremental da ClienteDetalhesPage (C1)

- Contexto: `src/pages/ClienteDetalhesPage.tsx` seguia acima do limite operacional de linhas e bloqueava avanço ordenado do Bloco C.
- Decisão: extrair o conteúdo de tabs para módulos dedicados de page em `src/pages/cliente-detalhes/` (`ClienteDetalhesInfoTab.tsx`, `ClienteDetalhesSecondaryTabs.tsx`), mantendo a page como orquestradora de estado e navegação.
- Consequência: `ClienteDetalhesPage.tsx` caiu para 281 linhas e o baseline de legados >500 reduziu de 26 para 25 sem regressão funcional.
- Reversão: reintegrar os blocos de tabs no arquivo da page e remover os módulos extraídos.
- Referências: `src/pages/ClienteDetalhesPage.tsx`, `src/pages/cliente-detalhes/ClienteDetalhesInfoTab.tsx`, `src/pages/cliente-detalhes/ClienteDetalhesSecondaryTabs.tsx`.

### 2026-02-16 — Enforcement progressivo de ESLint (J1/J2)

- Contexto: `eslint.config.mjs` estava permissivo (`no-explicit-any` e `no-unused-vars` desligados), mas a estratégia aprovada para o Bloco J exige endurecimento por lotes sem big-bang.
- Decisão: manter `react-hooks/exhaustive-deps` em `warn` e aplicar endurecimento incremental sustentável: `no-console` em `error` com allowlist para `warn/error`, e `@typescript-eslint/no-explicit-any` em `error` para escopo controlado (`src/services/**/*.ts`, `src/hooks/**/*.ts`, `src/utils/**/*.ts`).
- Consequência: enforcement ativo sem ruptura no gate canônico; dívida alta de `no-unused-vars` permanece mapeada para lotes futuros.
- Reversão: remover o bloco de regras incrementais e restaurar severidades anteriores em `eslint.config.mjs`.
- Referências: `eslint.config.mjs`, `NEXT.md`, `.agent/lessons-learned.md`.

### 2026-02-16 — Async Counter Lock / Busy-Wait Removal (ADR 0010)

- Contexto: `api.reserveGlobalIdentifier()` usava busy-wait sync bloqueando main thread por até 250ms.
- Decisão: refatorar para `async` com `await new Promise(resolve => setTimeout(resolve, COUNTER_LOCK_RETRY_MS))`.
- Consequência: main thread liberada; return type muda para `Promise<number>`. Único caller (`OrcamentosPage.tsx`) atualizado.
- Reversão: remover `async`/`await`, restaurar loop sync.
- Referência: `docs/adr/0010-async-counter-lock.md`

### 2026-02-16 — Domain Context Decomposition (ADR 0011)

- Contexto: `DataContext.tsx` gerenciava 27 entidades em single React Context, causando re-renders excessivos em 37 consumers.
- Decisão: decompor em 5 domain contexts (Core, Finance, SupplyChain, Marketing, System) com `useData()` como façade backward-compatible.
- Consequência: consumers com domain hooks re-rendem apenas em mudanças do domínio. Zero breaking changes.
- Reversão: reverter para single context e remover domain hooks.
- Referência: `docs/adr/0011-domain-context-decomposition.md`

### 2026-02-16 — Histórico transacional no DataContext (undo/redo)

- Contexto: havia mutação centralizada via `setField`, mas sem mecanismo de reversão de alterações.
- Decisão: adicionar `DataHistoryContext` com `undo`, `redo`, `clearHistory`, `canUndo`, `canRedo`, com snapshots limitados (`HISTORY_LIMIT = 50`) e persistência de snapshot em storage.
- Consequência: operações de mutação via contexto agora possuem mecanismo nativo de rollback/redo sem quebrar `useData()`.
- Reversão: remover `DataHistoryContext` e restaurar `DataContext.tsx` sem pilhas de histórico.
- Referências: `src/context/DataContext.tsx`, `src/context/index.ts`.

### 2026-02-16 — Versionamento explícito de schema no bootstrap do storage

- Contexto: migrações existiam sem chave explícita de versão persistida, dificultando evolução controlada do formato.
- Decisão: introduzir `schema_version` em `loadData` e pipeline incremental `runStorageSchemaMigrations` (v1) em `migrations.ts`.
- Consequência: aplicação passa a registrar versão do schema em storage e executar migrações por versão de forma determinística.
- Reversão: remover `schema_version` de `KEYS` e voltar ao bootstrap sem versionamento explícito.
- Referências: `src/services/infrastructure/loadData.ts`, `src/services/infrastructure/migrations.ts`.

### 2026-02-16 — Split incremental de ícones comuns com API estável

- Contexto: hotspot em `src/components/ui/icons.tsx` seguia alto e pressionava manutenção/ratchet de linhas.
- Decisão: extrair ícones comuns para `icons-common.tsx` e `icons-common-extra.tsx`, com base compartilhada em `iconBase.tsx`, mantendo import/re-export em `icons.tsx`.
- Consequência: redução substancial do baseline de `icons.tsx` (ratchet 1047 -> 569) sem quebra de imports existentes.
- Reversão: consolidar novamente os módulos no arquivo único `icons.tsx`.
- Referências: `src/components/ui/icons.tsx`, `src/components/ui/icons-common.tsx`, `src/components/ui/icons-common-extra.tsx`, `src/components/ui/iconBase.tsx`, `scripts/file-line-baseline.json`.

### 2026-02-16 — Migração completa de consumo para hooks de domínio

- Contexto: após ADR 0011, ainda existiam consumers legados de `useData()` em páginas/componentes, mantendo acoplamento e re-render transversal.
- Decisão: migrar todos os consumers de `src/pages` e `src/components` para hooks de domínio (`useCoreData`, `useFinanceData`, `useSupplyChainData`, `useMarketingData`, `useSystemData`), mantendo `useData()` apenas como façade de compatibilidade.
- Consequência: consumo de contexto ficou explícito por domínio em toda a UI; `useData()` deixou de ser ponto de acesso em produção de páginas/componentes.
- Reversão: restaurar imports de `useData()` nos consumers e remover os hooks de domínio dos arquivos migrados.
- Referências: `src/pages/AgendaPage.tsx`, `src/pages/HomePage.tsx`, `src/pages/RelatoriosPage.tsx`, `src/pages/RelatoriosLayout.tsx`, `src/components/projetos/ProjetoDetalhesWidgets.tsx`.

### 2026-02-16 — Eliminação de efeito derivado em filtros financeiros

- Contexto: páginas de débito/recebíveis usavam `useEffect` para sanitizar filtros derivados de opções, criando ciclo de atualização de estado pós-render.
- Decisão: substituir o `useEffect` de sanitização por normalização determinística em `useMemo` + `handleFilterChange` explícito.
- Consequência: remove efeitos derivados em `FinanceiroDebitosPage` e `FinanceiroRecebiveisPage` sem alterar comportamento funcional dos filtros.
- Reversão: voltar ao padrão anterior de sanitização em `useEffect` com `setFilters`.
- Referências: `src/pages/FinanceiroDebitosPage.tsx`, `src/pages/FinanceiroRecebiveisPage.tsx`.

### 2026-03-01 — Reorganização estrutural cautelosa (P6): conclusão da raiz de `src/pages`

- Contexto: após P5, ainda restavam pages na raiz (`DocumentosPage.tsx`, `FinanceiroGestaoCaixaPage.tsx`, `ProjetosPage.tsx` + teste), mantendo inconsistência de estrutura por domínio.
- Decisão:
  1. Mover `DocumentosPage.tsx` para `src/pages/documentos/DocumentosPage.tsx` e ajustar wrappers (`DocumentosPessoalPage.tsx` e `DocumentosProjetosPage.tsx`) para import local.
  2. Mover `FinanceiroGestaoCaixaPage.tsx` para `src/pages/financeiro-gestao-caixa/FinanceiroGestaoCaixaPage.tsx` e atualizar barrel de domínio.
  3. Mover `ProjetosPage.tsx` e `ProjetosPage.test.tsx` para `src/pages/projetos/`, criar `src/pages/projetos/index.ts` e atualizar lazy route em `src/App.tsx`.
  4. Validar incrementalmente com `npm run verify` até `[VERIFY][LOOP][PASS]`.
- Consequência: raiz de `src/pages/` ficou sem arquivos de page soltos (apenas diretórios de domínio), com co-location consistente e sem regressão funcional.
- Reversão:
  1. Reverter os moves para `src/pages/` raiz.
  2. Restaurar imports originais em `src/App.tsx`, wrappers e teste de projetos.
  3. Remover barrel `src/pages/projetos/index.ts`.
- Referências: `src/pages/documentos/DocumentosPage.tsx`, `src/pages/documentos/DocumentosPessoalPage.tsx`, `src/pages/documentos/DocumentosProjetosPage.tsx`, `src/pages/financeiro-gestao-caixa/FinanceiroGestaoCaixaPage.tsx`, `src/pages/projetos/ProjetosPage.tsx`, `src/pages/projetos/ProjetosPage.test.tsx`, `src/pages/projetos/index.ts`, `src/pages/documentos/index.ts`, `src/pages/financeiro-gestao-caixa/index.ts`, `src/App.tsx`.

### 2026-03-01 — Estabilização de testes assíncronos no gate canônico

- Contexto: durante `verify` do lote estrutural, surgiram flakes em `test:coverage` (`useLocalStorage.test.ts` e hook de `loadData.test.ts`) por condições de corrida e timeout de setup sob carga.
- Decisão:
  1. Em `useLocalStorage.test.ts`, aguardar hidratação inicial antes do `setValue` no cenário de persistência.
  2. Em `loadData.test.ts`, endurecer hooks com timeout explícito no `beforeEach` (`20000`) e teardown defensivo (`resetPersistentDataAndNotify?.()`).
- Consequência: execução de `npm run verify` voltou a fechar em loop completo sem falhas intermitentes nos testes afetados.
- Reversão:
  1. Remover espera de hidratação inicial no teste de `useLocalStorage`.
  2. Restaurar timeout padrão e chamada não-defensiva no teardown de `loadData.test.ts`.
- Referências: `src/hooks/useLocalStorage.test.ts`, `src/services/infrastructure/loadData.test.ts`.
