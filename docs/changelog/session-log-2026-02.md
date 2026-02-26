# Session Log — 2026-02

Arquivo de histórico arquivado do `NEXT.md`. Não carregado automaticamente pelo agente.
Consultar apenas se precisar de contexto histórico detalhado de sessões anteriores.

---

## Estado acumulado até 2026-02-12

- Etapas 1, 2, 3, 3.1, 3.2, 3.3 e 3.4 concluídas.
- Fonte de verdade de comandos consolidada em `AGENTS.md`; docs operacionais passaram a referenciar o contrato.
- Services públicos receberam JSDoc com `input -> output` + exemplo.
- Contratos canônicos adicionados com fixtures em `src/test/fixtures/*` e golden tests em `src/test/golden-fixtures.test.ts`.
- Exemplos canônicos para cópia do agente adicionados em `docs/examples/*`.
- Decisão registrada em `DECISIONS.md` + ADR `docs/adr/0006-agent-drift-controls-and-golden-contracts.md`.
- Evidência de gates: sequência oficial de `AGENTS.md` executada com status verde.
- Etapa 5 executada e registrada em `docs/audits/etapa5-verificacao-2026-02-12.md`.
- Validações objetivas 5.2: `typecheck`, `lint`, `build` verdes; dev server confirmou fallback para `http://localhost:3001/` (porta 3000 ocupada).
- Decisões da 5.3 fechadas e formalizadas em `docs/adr/0007-agent-first-operating-decisions.md`.
- Checklist do fluxo crítico publicado em `docs/checklists/e2e-smoke-critical-flow.md`.
- Remoto configurado e publicação inicial concluída: `origin` apontando para `https://github.com/gstvhenr/nexus_arqui.git`, commit `c0f5110` em `main`.
- Auditoria de estrutura da raiz concluída em `docs/audits/estrutura-root-auditoria-2026-02-12.md`.
- Higiene aplicada: remoção de resíduo local `.agent/tmp/dev.log` e atualização de `.husky/pre-commit` para formato não deprecado.
- **Migração de tipos concluída**: `src/types.ts` (866 linhas) decomposto em 11 módulos de domínio sob `src/types/*`; `types.ts` convertido em barrel puro.
- **Decomposição de `api.ts` concluída**: `api.ts` (696 linhas) decomposto em 5 módulos (`counterLock`, `migrations`, `seedData`, `loadData`, `importExport`); `api.ts` reduzido a ~75 linhas de facade.
- Gate `npm run verify` verde após ambas mudanças (typecheck, lint, 18 tests, build).
- **Gestão de Caixa — Fase 1 (Despesas) implementada**:
  - Novo tipo de domínio `CashBoxExpense` em `src/types/cashBox.ts`.
  - Novo serviço `src/services/cashBoxService.ts`: validação, filtragem de categorias por origem, geração de datas para parcelas/recorrência indefinida com clamp no último dia do mês.
  - Novo componente `src/components/financeiro/CashBoxExpenseFormModal.tsx`: modal com Origem, Categoria (dinâmica), Item (placeholder), Recorrência, Data de Vencimento, Parcelas.
  - Página `FinanceiroGestaoCaixaPage.tsx` reescrita: tabela com agrupamento por dia, badges de origem/recorrência, navegação por mês, toast de confirmação.
  - Infraestrutura: `cashBoxExpenses` adicionado a `AppData`, `KEYS`, `storageKeyMap`, `loadData`, `DataContext`.
  - **Integração com pipeline financeiro**: `cashBoxExpenses` convertidos em `FinancialDebit` e mergeados em `allDebits` no `financeService.ts`.
  - **Todas as páginas financeiras atualizadas**: `VisaoGeral`, `Debitos`, `Recebiveis` passam `cashBoxExpenses` para `getFinancialPageData` — despesas de caixa agora aparecem nos KPIs, fluxo de caixa, donut de categorias, e transações recentes.
  - **`FinancialDebit` ampliado**: `category` aceita `CashBoxCategory`, `source` aceita `'CashBox'`.
  - **Cores de categorias**: todas as novas categorias (profissionais e pessoais) adicionadas a `EXPENSE_CATEGORY_COLORS`.
  - Gates: `typecheck` ✅, `lint` ✅, `build` ✅, `tests (6/6)` ✅.
- **Financeiro (Recebíveis + Despesas) migrado para série temporal em linha**:
  - Novo contrato em `src/types/financial-series.ts`: `PeriodMode`, `PeriodSelection`, `Filters`, `SeriesPoint`, `SeriesFilterOptions`, `FinancialSeriesSource`.
  - Novo componente reutilizável `src/components/finance/FinanceLineChart.tsx` com período, filtros (origem/categoria/item), ação `Limpar filtros`, loading leve e estado vazio.
  - `src/services/financeService.ts` expandido com queries únicas de série:
    - `getReceivablesSeries(period, filters, source)`
    - `getExpensesSeries(period, filters, source)`
    - `getReceivablesFilterOptions(source, filters)`
    - `getExpensesFilterOptions(source, filters)`
  - Páginas `FinanceiroRecebiveisPage.tsx` e `FinanceiroDebitosPage.tsx` reescritas para remover tabela/formulário da tela principal.
  - Cobertura de serviço atualizada em `src/services/financeService.test.ts` (20 testes totais no projeto).
  - Contrato/documentação atualizados em `docs/data-contracts/types-contracts.md` e decisão registrada em `DECISIONS.md`.
- **Ajuste de origem nos filtros (Recebíveis + Despesas)**:
  - Filtro `Origem` mantém `Profissional` e `Pessoal` para ambos os submenus.
  - `financeService` passou a preservar origem por recebível (`receivableOriginById`) para permitir filtragem real quando a entrada trouxer origem explícita.
  - Regressão coberta em `src/services/financeService.test.ts` para origem `Pessoal` em recebíveis.
  - Checks da sessão: `typecheck` ✅, `lint` ✅, `test` ✅ (21/21).
- **Espelhamento Gestão de Caixa -> gráfico de Despesas reforçado**:
  - Ajuste no `financeService` para ancorar períodos relativos (`LAST_12_MONTHS`, `QUARTER`, `SEMESTER`) no mês mais recente entre hoje e os registros filtrados.
  - Com isso, lançamentos de Gestão de Caixa com vencimento futuro passam a aparecer imediatamente no gráfico de linhas de `Despesas`.
  - Regressão adicionada em `src/services/financeService.test.ts` para lançamento futuro em `LAST_12_MONTHS`.
  - Checks da sessão: `typecheck` ✅, `test` ✅ (22/22), `lint` ✅, `format:check` ✅.
- **Seed demonstrativo temporário para visualização rápida**:
  - Novo módulo isolado `src/services/cashBoxDemoData.ts` com lançamentos de exemplo em 2025 e em janeiro/fevereiro de 2026.
  - `FinanceiroGestaoCaixaPage.tsx` agora auto-carrega esse seed quando `cashBoxExpenses` está vazio.
  - A página ganhou ações rápidas `Carregar demo` e `Limpar demo` para inserir/remover sem intervenção manual no storage.
  - Testes do módulo adicionados em `src/services/cashBoxDemoData.test.ts`.
  - Checks da sessão: `typecheck` ✅, `test` ✅ (24/24), `lint` ✅, `format:check` ✅.
- **Ajuste de layout dos filtros no gráfico financeiro**:
  - `FinanceLineChart` atualizado para manter controles em uma linha quando `Ano completo` estiver ativo (`lg:grid-cols-6`).
  - Label alterado de `Ano (YYYY)` para `Ano`.
  - Campo `Período` deixou de ocupar coluna dupla, reduzindo largura excessiva.
  - Checks da sessão: `typecheck` ✅, `lint` ✅.
- **Botão Limpar filtros alinhado na mesma linha dos campos**:
  - `FinanceLineChart` atualizado para incluir `Limpar filtros` dentro do mesmo grid dos filtros.
  - Botão agora usa altura visual e tipografia equivalentes aos campos de seleção.
  - Checks da sessão: `typecheck` ✅, `lint` ✅.
- **Remoção do demo temporário e ajustes finais de visualização**:
  - Opção `Desde o início` removida do seletor de período no gráfico.
  - Visual de `Limpar filtros` ajustado (label visível e estilo coerente com inputs).
  - Gráfico de linha passa a renderizar sempre; quando sem dados, mantém aviso de estado vazio abaixo.
  - Seed de demonstração removido por completo:
    - `src/services/cashBoxDemoData.ts` removido.
    - `src/services/cashBoxDemoData.test.ts` removido.
    - `src/pages/FinanceiroGestaoCaixaPage.tsx` sem import/auto-carga/botões de demo.
  - Gate canônico validado: `npm run verify` ✅ (typecheck, lint, format, test 22/22, build).
- **Visibilidade do gráfico sem dados reforçada**:
  - `FinanceLineChart` passou a usar domínio Y mínimo (`0..1` quando dataMax=0) para evitar colapso visual em séries zeradas.
  - Linha agora renderiza pontos (`dot`) para manter leitura visual mesmo com valores baixos/zerados.
  - Regressão adicionada em `financeService.test.ts` para garantir que lançamento de Gestão de Caixa no mês atual entra no `LAST_12_MONTHS`.
  - Checks da sessão: `typecheck` ✅, `test` ✅ (23/23), `lint` ✅.
- **Limpeza de dados sujos + demo 2025 controlada**:
  - Novo módulo `src/services/cashBoxDemo2025.ts` criado para:
    - remover demos legadas por prefixo (`demo_cashbox_`, `demo_cashbox_2025_`, `demo_2025_`);
    - aplicar 12 lançamentos fictícios (jan-dez/2025) de forma previsível.
  - `FinanceiroGestaoCaixaPage.tsx` atualizada para:
    - aplicar automaticamente a demo 2025 uma vez por montagem (com limpeza prévia de demos antigas);
    - permitir remoção posterior com botão `Remover Demo 2025`;
    - permitir reaplicação com botão `Recarregar Demo 2025`.
  - `FinanceiroDebitosPage.tsx` também aplica demo 2025 na montagem para garantir visualização imediata da linha em `Despesas`, mesmo sem abrir `Gestão de Caixa` antes.
  - Testes adicionados em `src/services/cashBoxDemo2025.test.ts` cobrindo aplicação completa de 2025 e remoção de demos legadas.
  - Gate canônico validado: `npm run verify` ✅ (typecheck, lint, format, test 25/25, build).

---

## Sessão 2026-02-13

- **Correção de visibilidade do gráfico em `Despesas` aplicada**:
  - Causa raiz identificada no componente `FinanceLineChart`: cor da linha/eixos sendo enviada ao SVG com `hsl(var(--token))`, sem resolver o `var(...)` para valor computado.
  - Ajuste implementado em `src/components/finance/FinanceLineChart.tsx`:
    - resolução de CSS variables para cor real via `getComputedStyle(document.documentElement)`;
    - aplicação da cor resolvida em `Line`, `XAxis`, `YAxis` e `CartesianGrid`;
    - altura explícita para a área do gráfico (`h-[320px] md:h-[360px]`) para evitar colapso visual.
  - Validação funcional visual com screenshot:
    - `Despesas`: `.agent/tmp/debitos-fixed.png` (linha mensal visível com valores);
    - `Recebíveis`: `.agent/tmp/recebiveis-fixed.png` (linha zerada visível + estado vazio).
  - Checks executados: `npm run typecheck` ✅, `npm run test -- financeService.test.ts cashBoxDemo2025.test.ts` ✅.
- **Ajuste de espaçamento fino (filtros + recuo inferior global)**:
  - `FinanceLineChart` ajustado para aproximar sutilmente os filtros do título e liberar mais área útil do gráfico:
    - `gap` do card reduzido para `gap-2`;
    - `gap` do grid de filtros reduzido para `gap-2`;
    - labels dos filtros com `mb-0.5`;
    - altura do gráfico ampliada para `h-[350px] md:h-[400px]`.
  - `App.tsx` atualizado para criar recuo inferior padronizado nas páginas especiais (`Agenda`, `Financeiro`, `Prestadores/Freelancers`) via `mainPaddingClass` com `pb-4 md:pb-5`.
  - Check executado: `npm run typecheck` ✅.
- **Padronização final de recuo inferior para todas as páginas**:
  - `App.tsx` atualizado para usar o mesmo `padding-bottom` (`pb-4 md:pb-5`) em todas as rotas.
  - Check executado: `npm run typecheck` ✅.
- **Centralização do bloco de filtros em `Recebíveis` e `Despesas`**:
  - Ajuste feito no componente compartilhado `src/components/finance/FinanceLineChart.tsx`.
  - O container dos filtros agora usa `w-full max-w-[1080px] mx-auto`, centralizando horizontalmente.
  - Check executado: `npm run typecheck` ✅.
- **Reversão da centralização de filtros (alinhamento à esquerda restaurado)**:
  - Por solicitação, removido o wrapper de centralização (`max-w + mx-auto`) em `src/components/finance/FinanceLineChart.tsx`.
  - Check executado: `npm run typecheck` ✅.
- **Limpeza final (remoção de obsoletos e demos 2025)**:
  - Arquivos de demo removidos: `src/services/cashBoxDemo2025.ts` e `src/services/cashBoxDemo2025.test.ts`.
  - Removido código de auto-seed/demo e botões de demo nas páginas.
  - Sanitização central adicionada em `src/context/DataContext.tsx` para limpar demos legadas.
  - Contrato alinhado com a UI: `PeriodMode` removeu `SINCE_BEGINNING`.
  - Artefatos temporários locais removidos.
- **Previsão de Caixa — submenu próprio implementado**:
  - Nova função `getCashFlowForecastSeries` em `src/services/financeService.ts`.
  - Nova página `src/pages/FinanceiroPrevisaoCaixaPage.tsx`: `AreaChart` dual-line.
  - Rota e nav entry adicionados.
  - Gates: `typecheck` ✅, `test` ✅ (24/24).
- **Instagram — layout solicitado e cadastro inicial aplicados**:
  - `src/pages/InstagramDetailPage.tsx` ajustada para o formato solicitado.
  - Seed inicial automático implementado.
  - Checks da sessão: `npm run lint` ✅, `npm run format:check` ✅, `npm run typecheck` ❌ (falhas pré-existentes).

---

## Sessão 2026-02-13 — auditoria do relatório de higiene

- Relatório auditado: `docs/audits/relatorio-higiene-codebase-2026-02-13.md`.
- Validação objetiva executada no repositório (sem mudanças de código-fonte):
  - `rg -n "TODO|FIXME|HACK" src` -> `NO_MATCH`.
  - `rg -n "console\\.log" src` -> `NO_MATCH`.
  - `rg -n as\\s+any src` -> 9 ocorrências confirmadas.
  - `npm run test` -> 24 testes passando.
  - `npm run verify` -> falha em `typecheck` por `paymentDate` ausente em `src/services/financeService.test.ts`.
- Entrega desta sessão: plano executável e auditável com classificação A/B/C/D por item do relatório.

---

## Sessão 2026-02-13 — execução completa dos ajustes de higiene

- **Barrels e descobribilidade corrigidos**:
  - `src/pages/index.ts` exporta agora `DocumentosPage`, `RelatoriosPage`, `GestaoMarketingPage`, `ProjetoDetalhesPageContent`.
  - Novo barrel em `src/components/financeiro/index.ts`.
  - `ErrorBoundary` exportado em `src/components/layout/index.ts` e `src/index.tsx` passou a consumir via barrel.
  - `useLocalStorage` exportado em `src/hooks/index.ts`.
- **Type escapes eliminados**:
  - `rg -n as\\s+any src` -> `NO_MATCH`.
  - Remoções aplicadas em 7 arquivos.
- **Wrappers documentados**:
  - JSDoc adicionado em 5 wrappers de rota.
- **Higiene estrutural e governança**:
  - Diretório vazio `src/@types` removido.
  - Relatório auditado e corrigido.
  - Regra de higiene contínua adicionada em `AGENTS.md`.
  - Decisão registrada em `DECISIONS.md` + ADR.
- **Cobertura de testes ampliada**:
  - Novos testes: `cashBoxService`, `agendaService`, `proposalService`, `reportService`, `useLocalStorage`, `useNavigation`, `DeleteConfirmationModal`.
  - `financeService.test.ts` corrigido com `paymentDate`.
- **Evidência de gates**:
  - `npm run verify` ✅ (typecheck + lint + format:check + test 39/39 + build)

---

## Sessão 2026-02-13 — revisão crítica + execução de correções do relatório

- **Convergência financeira concluída (sem estado transitório)**:
  - `CashBoxExpenseFormModal.tsx` e `CashBoxCreditFormModal.tsx` movidos para `src/components/finance/`.
  - Diretório legado `src/components/financeiro/` removido.
- **Decomposição incremental de monólito aplicada em Marketing**:
  - Modais extraídos de `src/pages/GestaoMarketingPage.tsx` para `src/components/marketing/`.
  - `GestaoMarketingPage.tsx` reduziu de ~1275 linhas para 671 linhas.
- **Colisão de naming resolvida em Fornecedores**.
- **Relatório auditado e reescrito em formato executável/auditável**.
- **Gates**: `npm run verify` ✅ (typecheck + lint + format:check + test 39/39 + build)

---

## Sessão 2026-02-16 — Plano anti-drift A→J (multiple sprints)

### Follow-up dos pontos 1-10

- **God Context (item 1) — migração de consumo concluída**:
  - Removido o uso de `useData()` em `src/pages` e `src/components` (0 ocorrências).
  - Consumers migrados para hooks de domínio (`useCoreData`, `useFinanceData`, `useSupplyChainData`, `useMarketingData`, `useSystemData`).
  - `useData()` permanece apenas como façade de compatibilidade em `src/context/DataContext.tsx`.
- **useEffect derivados (item 6) — redução adicional**:
  - `FinanceiroDebitosPage.tsx` e `FinanceiroRecebiveisPage.tsx` removeram `useEffect` de saneamento de filtros.
  - Saneamento passou para `useMemo` + `handleFilterChange`.
- **Validação fechada**: `npm run verify` → PASS (`gates_passed=7`, 3 tentativas com correções intermediárias).

### Correções dos pontos de atenção 1-10

- Baseline corrigido: `storageQuotaService.test.ts` ajustado.
- God Context: adicionado `DataHistoryContext` (undo/redo/clearHistory). Exportados hooks por domínio + `useDataHistory`. Estado legado de `useData(` reduziu para 26 ocorrências.
- useEffect derivados: `CatalogoPage.tsx` e `CommissionFormModal.tsx` refatorados para `useMemo`/cálculo determinístico.
- icons.tsx split: criados `iconBase.tsx`, `icons-common.tsx`, `icons-common-extra.tsx`.
- Versionamento de dados: nova chave `schema_version` em `loadData.ts` + `migrations.ts` com `runStorageSchemaMigrations`.
- Items 2,3,4,5,8: revalidados no estado atual.
- `npm run verify` → PASS (7 gates).

### Design System & Estilização

- `docs/design-system/design-tokens.md` criado.
- `src/components/ui/icons-social.tsx` extraído (7 social/brand icons).
- `icons.tsx` reduzido de 1047 para ~845 linhas.
- JSDoc adicionado a `DocumentIcons.tsx`.
- `docs/design-system/component-catalog.md` criado.
- `npm run verify` → PASS (7 gates).

### Pipeline & Gates Fixes

- `format:check` expandido para `src/**/*.{ts,tsx}` + configs + markdown.
- Gate de cobertura global adicionado em `vitest.config.ts`.
- `file-line-baseline.json` atualizado.
- `npm run verify` → PASS (7 gates).

### Test Coverage Sprint

- 6 novas factories em `src/test/factories.ts`.
- 10 novos arquivos de teste (94 testes).
- `npm run verify` → PASS (7 gates).

### ESLint & Code Quality Sprint

- ESLint hardening: `no-explicit-any`, `no-unused-vars`, `prefer-const` escalados de `warn` para `error`.
- `dashboardService.ts` boundary fix: removido `import React`, substituído por `iconKey` string union.
- `src/test/factories.ts` criado, 4 arquivos de teste refatorados para usar factories.
- `npm run verify` → PASS (7 gates).

### Decomposição de monólitos (Blocos C2-C12, D2-D4, E-J)

- **C2-C12**: Decomposição de ~15 páginas/componentes em subcomponentes menores (~80+ extrações).
- **D2-D4**: `React.FC`/`React.FunctionComponent` eliminados (0 ocorrências em `src`).
- **E**: `key={index}` inexistente em `src`.
- **F**: `.push(` inexistente em `src/pages`.
- **G**: Exceção documentada em `icons.tsx`, sem `style={{...}}` inline.
- **H**: Workflows e regras já continham leitura/registro em `lessons-learned.md`.
- **I1/I2**: Padronização GWT em testes, cobertura de `agendaService` elevada para 83.41%.
- **J1**: Auditoria de dívida ESLint executada.
- **J2**: Enforcement progressivo (`no-console` error + `no-explicit-any` error em escopo controlado).
- Fechamento geral: `npm run verify:ci` → PASS.

### Architectural Diagnostic

- Diagnóstico dos 5 pontos críticos (boundary violation → já corrigido, useEffect anti-patterns → 1 caso real, God Context → mitigado, localStorage → sem quota, busy-wait → confirmado).
- Fix: `isDirty` em `ProjetoDetalhesPageContent.tsx` refatorado de `useState + useEffect` para `useMemo`.
- `npm run verify` → PASS (7 gates).

---

## Sessão 2026-02-13 — subtarefas no Quadro Kanban

- **Subtarefas implementadas no Quadro de Tarefas (`Agenda > Tarefas`)**.
  - Tipo `Subtask` estendido com `completedAt`.
  - Novo componente `SubtaskDetailModal`.
  - `TarefasPage.tsx` reescrita com edição, detalhes, preview de subtarefas, bloqueio de drag, botões +.
  - `EventFormModal` recebeu `initialKanbanStatus`.
- **Gates**: `npm run verify` ✅ (typecheck + lint + test 39/39 + build)

---

## Sessão 2026-02-14 — Ajuste de scrollbar na Agenda

- **Remoção de scrollbar horizontal no Calendário**:
  - `AgendaPage.tsx`: `overflow-x-hidden` + `p-1` buffer para scale.
  - Gates: `typecheck` ✅, `lint` ✅, `format:check` ✅.

---

## Sessão 2026-02-14 — workflow code-cleanup snapshot

- Diagnóstico e planejamento em `PLAN.md`.
- `.agent/workflows/code-cleanup.md` atualizado com snapshot e templates.
- Decisão registrada em `DECISIONS.md`.
- Gates: `npm run verify` ✅

---

## Sessão 2026-02-14 — cleanup LembretesPage (3 iterações)

- `ReminderFormModal` extraído para `src/components/agenda/ReminderFormModal.tsx`.
- Ícones extraídos para `ReminderIcons.tsx`, paleta para `reminderPalette.ts`.
- Empty state extraído para `ReminderEmptyState.tsx`.
- Tudo consumido via barrel `src/components/agenda/index.ts`.
- Gates: `npm run verify` ✅ (em todas as iterações)

---

## Sessão 2026-02-14 — workflow code-cleanup (playbook)

- Playbook agent-first criado em `.agent/workflows/code-cleanup.md`.
- Contrato de 29 regras mantido.
- Gates: `npm run verify` ✅

---

## Sessão 2026-02-14 — cleanup ClienteDetalhes

- Aba de Projetos extraída para `ClientProjectsTab` em `src/components/clientes/`.
- Gates: `npm run verify` ✅

---

## Sessão 2026-02-14 — cleanup ProjetoDetalhes

- Aba "Anotações" extraída para `ProjectNotesTab` em `src/components/projetos/tabs/`.
- Gates: `npm run verify` ✅

---

## Sessão 2026-02-14 — cleanup PropostaDetalhes

- `BudgetTableBlock` extraído para `src/components/propostas/BudgetTableBlock.tsx`.
- Gates: `npm run verify` ✅

---

## Sessão 2026-02-14 — cleanup InstagramDetail

- `CredentialModal` extraído para `InstagramCredentialModal` em `src/components/marketing/`.
- Gates: `npm run verify` ✅

---

## Sessão 2026-02-14 — cleanup ClientesPage

- Modal de seleção manual extraído para `ClientSelectionModal` em `src/components/clientes/`.
- Gates: `npm run verify` ✅

---

## Sessão 2026-02-14 — cleanup OrcamentosPage

- `BudgetSectionComponent` extraído para `src/components/orcamentos/`.
- Gates: `npm run verify` ✅

---

## Sessão 2026-02-14 — code-cleanup Fase 1 decomposição + Fase 2 type safety

- **Fase 1 — Decomposição de monólitos concluída**:
  - `ProjetoDetalhesPageContent` — hooks `useProjectChecklist`, `useProjectFinancials`.
  - `ClientesPage` — `clientExportService.ts`.
  - `PropostaDetalhesPage` — `BudgetTableBlock`.
  - `CatalogoPage` — modais para `src/components/catalogo/`.
  - `ClientFormModal` — avaliado (953 linhas), decomposição de tabs = fase futura.
- **Fase 2 — Type safety (`value: any` → tipagem correta) concluída**:
  - 22 ocorrências de `any` eliminadas em 14 arquivos.
  - `grep "value: any" src/` → 0 resultados.
  - `grep "currentVal: any" src/` → 0 resultados.
- **Gates**: `npm run verify` ✅ (typecheck + lint + format:check + test 39/39 + build)
