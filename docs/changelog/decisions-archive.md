# DECISIONS — Archive

Entradas históricas arquivadas. Consulte `DECISIONS-active.md` para decisões vigentes.

Arquivo atualizado em 2026-03-03; cobre entradas de 2026-02-12 a 2026-02-28.

## Entradas

### 2026-02-12 — AGENTS como fonte primária

- Contexto: sessões de agente sem memória estável.
- Decisão: `AGENTS.md` é contrato primário versionado.
- Consequência: previsibilidade maior entre sessões/ferramentas.
- Reversão: migrar contrato primário para outro padrão e atualizar docs.
- Referência: `docs/adr/0001-agent-source-of-truth.md`

### 2026-02-12 — Comando canônico de pronto

- Contexto: validação inconsistente gerava falso-verde.
- Decisão: `npm run verify` como gate único.
- Consequência: CI/local padronizados.
- Reversão: alterar pipeline e atualizar AGENTS/README/CONTRIBUTING.
- Referência: `docs/adr/0002-canonical-verify-gate.md`

### 2026-02-12 — Memória zero por handoff explícito

- Contexto: perda de continuidade entre sessões.
- Decisão: atualizar `NEXT.md` no fim de toda sessão.
- Consequência: retomada objetiva e menor custo de contexto.
- Reversão: adotar outro mecanismo de handoff versionado.
- Referência: `docs/adr/0003-memory-zero-handoff.md`

### 2026-02-12 — Workflow repetível de agente (3.2)

- Contexto: execução variava por sessão e gerava inconsistência.
- Decisão: adotar fluxo fixo de tarefa com baseline, planejamento curto, diffs pequenos, gates, self-review e handoff.
- Consequência: maior previsibilidade operacional e menos regressões.
- Reversão: simplificar processo para fluxo ad-hoc.
- Referência: `docs/adr/0004-repeatable-agent-workflow.md`

### 2026-02-12 — Pre-commit + gate de segurança crítica (3.3)

- Contexto: faltavam guardrails locais de commit e enforcement de segurança crítica.
- Decisão: Husky + lint-staged no pre-commit e `npm run security:check` no CI.
- Consequência: feedback mais cedo e bloqueio de vulnerabilidade crítica.
- Reversão: remover hooks locais e manter apenas CI.
- Referência: `docs/adr/0005-precommit-and-security-gates.md`

### 2026-02-12 — Controles anti-drift e contratos canônicos (3.4)

- Contexto: alucinação/drift em sessões sem memória e risco de mudança silenciosa de shape.
- Decisão: centralizar comandos em `AGENTS.md`, padronizar JSDoc de services públicos e manter fixtures/golden tests canônicos por domínio.
- Consequência: menor divergência documental, contratos mais explícitos e detecção precoce de regressões de shape.
- Reversão: voltar para validação ad-hoc sem fixtures canônicas.
- Referência: `docs/adr/0006-agent-drift-controls-and-golden-contracts.md`

### 2026-02-12 — Diretrizes operacionais agent-first (5.3)

- Contexto: faltavam decisões executivas para fechar host, hooks, estratégia de modularização, fluxo crítico e política de execução no Antigravity.
- Decisão: adotar GitHub como host alvo, manter Husky + lint-staged, priorizar decomposição de páginas antes de `src/features/*`, fixar smoke crítico ponta-a-ponta e exigir evidência de comandos executados.
- Consequência: governança técnica mais previsível e menor risco de regressão silenciosa em sessões de agente.
- Reversão: trocar host/hook/estratégia mediante ADR nova e atualização de contratos operacionais.
- Referência: `docs/adr/0007-agent-first-operating-decisions.md`

### 2026-02-12 — Modularização de types.ts e api.ts

- Contexto: `types.ts` (866 linhas) era monolítico e `api.ts` (696 linhas) acumulava 5 responsabilidades distintas.
- Decisão: decompor `types.ts` em 11 módulos de domínio sob `src/types/*` com barrel; decompor `api.ts` em 5 módulos (`counterLock`, `migrations`, `seedData`, `loadData`, `importExport`) com facade fina.
- Consequência: melhor coesão, menor risco de conflito, e cada módulo tem responsabilidade única.
- Reversão: reverter para os arquivos monolíticos originais via git.
- Gate: `npm run verify` verde (typecheck, lint, 18 tests, build).

### 2026-02-12 — Financeiro com séries mensais e componente reutilizável de linha

- Contexto: telas `Recebíveis` e `Despesas` estavam centradas em tabela/formulário e não ofereciam leitura temporal por período/filtros.
- Decisão: padronizar consultas de série no `financeService` (`getReceivablesSeries`, `getExpensesSeries`) e criar o componente reaproveitável `FinanceLineChart`.
- Consequência: duas páginas financeiras passam a compartilhar o mesmo contrato de período/filtros e regra de agregação mensal, reduzindo duplicação.
- Reversão: restaurar páginas anteriores e remover `financial-series.ts`/queries de série.
- Referências: `src/types/financial-series.ts`, `src/services/financeService.ts`, `src/components/finance/FinanceLineChart.tsx`.

### 2026-02-13 — Limpeza final de demo financeiro e alinhamento de contrato de período

- Contexto: dados fictícios de 2025 foram usados temporariamente para validação visual e deixaram artefatos de código/estado.
- Decisão: remover `cashBoxDemo2025` (código + testes + ações de UI), sanitizar automaticamente registros demo legados no `DataContext` e retirar `SINCE_BEGINNING` do contrato `PeriodMode` por não existir na UI.
- Consequência: elimina dados sujos, reduz código morto e mantém contrato de período consistente com a experiência real da tela.
- Reversão: reintroduzir módulo de demo dedicado e readicionar modo de período no tipo/componente se voltar a ser requisito de produto.
- Referências: `src/context/DataContext.tsx`, `src/pages/FinanceiroGestaoCaixaPage.tsx`, `src/pages/FinanceiroDebitosPage.tsx`, `src/types/financial-series.ts`, `docs/data-contracts/types-contracts.md`.

### 2026-02-13 — Convergência incremental de componentes financeiros

- Contexto: coexistência de `src/components/finance/` e `src/components/financeiro/` aumenta ambiguidade para navegação de agentes.
- Decisão: formalizar convergência incremental com etapas pequenas e gate `npm run verify`, evitando refactor big-bang.
- Consequência: melhora de previsibilidade sem ruptura transversal.
- Reversão: manter dualidade temporária e retomar migração em etapas menores se houver regressão.
- Referência: `docs/adr/0008-incremental-finance-component-convergence.md`

### 2026-02-13 — Convergência financeira concluída (`financeiro` removido)

- Contexto: fase incremental de convergência foi concluída sem regressões de typecheck/lint/tests/build.
- Decisão: consolidar definitivamente componentes de caixa em `src/components/finance/*` e remover `src/components/financeiro/`.
- Consequência: elimina ambiguidade estrutural e reduz risco de import em caminho legado.
- Reversão: restaurar diretório legado apenas se surgir regressão comprovada com plano de transição documentado.
- Referências: `src/components/finance/index.ts`, `src/components/finance/CashBoxExpenseFormModal.tsx`, `src/components/finance/CashBoxCreditFormModal.tsx`, `docs/adr/0008-incremental-finance-component-convergence.md`.

### 2026-02-14 — Extração da aba de Projetos em ClienteDetalhes

- Contexto: `src/pages/ClienteDetalhesPage.tsx` é o maior arquivo em `src/pages`, dificultando manutenção.
- Decisão: extrair a seção da aba "Projetos" para `ClientProjectsTab` em `src/components/clientes/`.
- Consequência: página mais coesa e componente dedicado sem alterar comportamento.
- Reversão: reverter a extração e reintegrar o JSX no arquivo original.
- Referências: `src/pages/ClienteDetalhesPage.tsx`, `src/components/clientes/ClientProjectsTab.tsx`, `src/components/clientes/index.ts`.

### 2026-02-14 — Extração da aba de Anotações em ProjetoDetalhes

- Contexto: `src/pages/ProjetoDetalhesPageContent.tsx` permanece como hotspot grande em `src/pages`.
- Decisão: extrair a seção da aba "Anotações" para `ProjectNotesTab` em `src/components/projetos/tabs/`.
- Consequência: redução de acoplamento visual e melhoria de coesão sem alterar comportamento.
- Reversão: reverter a extração e reintegrar o JSX no arquivo original.
- Referências: `src/pages/ProjetoDetalhesPageContent.tsx`, `src/components/projetos/tabs/ProjectNotesTab.tsx`, `src/components/projetos/tabs/index.ts`.

### 2026-02-14 — Extração do BudgetTableBlock em PropostaDetalhes

- Contexto: `src/pages/PropostaDetalhesPage.tsx` contém subcomponentes extensos no mesmo arquivo.
- Decisão: mover `BudgetTableBlock` para `src/components/propostas/BudgetTableBlock.tsx`.
- Consequência: página menos monolítica e bloco de orçamento reutilizável sem alterar comportamento.
- Reversão: reverter a extração e reintegrar o bloco no arquivo da página.
- Referências: `src/pages/PropostaDetalhesPage.tsx`, `src/components/propostas/BudgetTableBlock.tsx`, `src/components/propostas/index.ts`.

### 2026-02-14 — Extração do modal de credenciais do Instagram

- Contexto: `src/pages/InstagramDetailPage.tsx` concentra lógica de modais inline.
- Decisão: mover `CredentialModal` para `InstagramCredentialModal` em `src/components/marketing/`.
- Consequência: página mais coesa e modal dedicado sem alterar comportamento.
- Reversão: reverter a extração e reintegrar o modal no arquivo da página.
- Referências: `src/pages/InstagramDetailPage.tsx`, `src/components/marketing/InstagramCredentialModal.tsx`, `src/components/marketing/index.ts`.

### 2026-02-14 — Extração do modal de seleção de clientes

- Contexto: `src/pages/ClientesPage.tsx` contém o modal de seleção manual inline.
- Decisão: mover a seleção para `ClientSelectionModal` em `src/components/clientes/`.
- Consequência: página menos monolítica e modal reutilizável sem alterar comportamento.
- Reversão: reverter a extração e reintegrar o modal no arquivo da página.
- Referências: `src/pages/ClientesPage.tsx`, `src/components/clientes/ClientSelectionModal.tsx`, `src/components/clientes/index.ts`.

### 2026-02-14 — Extração do BudgetSectionComponent em Orçamentos

- Contexto: `src/pages/OrcamentosPage.tsx` concentra um bloco grande de edição de seções.
- Decisão: mover `BudgetSectionComponent` para `src/components/orcamentos/BudgetSectionComponent.tsx`.
- Consequência: página menos monolítica e componente dedicado sem alterar comportamento.
- Reversão: reverter a extração e reintegrar o bloco no arquivo da página.
- Referências: `src/pages/OrcamentosPage.tsx`, `src/components/orcamentos/BudgetSectionComponent.tsx`, `src/components/orcamentos/index.ts`.

### 2026-02-14 — Workflow agent-first de limpeza com snapshot do stack

- Contexto: necessidade de um playbook operacional de limpeza alinhado ao `AGENTS.md` e ao stack real do repo.
- Decisão: manter o workflow `.agent/workflows/code-cleanup.md` com o contrato das 29 regras e adicionar snapshot do stack/configs para reduzir ambiguidade operacional.
- Consequência: maior previsibilidade para agentes em sessões sem memória sem duplicar lista de comandos oficiais.
- Reversão: remover o snapshot e voltar ao workflow genérico caso gere drift.
- Referências: `.agent/workflows/code-cleanup.md`, `PLAN.md`.

### 2026-02-14 — Templates operacionais no workflow de limpeza

- Contexto: necessidade de evidências objetivas e repetíveis sem depender da memória do agente.
- Decisão: adicionar templates de evidências, decisão e checklist de revisão em `.agent/workflows/code-cleanup.md`.
- Consequência: facilita auditoria e reduz omissões em sessões rápidas.
- Reversão: remover templates se gerarem ruído ou duplicação indevida.
- Referências: `.agent/workflows/code-cleanup.md`.

### 2026-02-14 — Extração do ReminderFormModal em Lembretes

- Contexto: `src/pages/LembretesPage.tsx` concentra modal grande de criação/edição/reagendamento.
- Decisão: mover `ReminderFormModal` para `src/components/agenda/ReminderFormModal.tsx` e exportar via barrel.
- Consequência: página mais coesa e modal isolado sem alterar comportamento.
- Reversão: reverter a extração e reintegrar o modal no arquivo da página.
- Referências: `src/pages/LembretesPage.tsx`, `src/components/agenda/ReminderFormModal.tsx`, `src/components/agenda/index.ts`.

### 2026-02-14 — Extração de ícones e paleta em Lembretes

- Contexto: `src/pages/LembretesPage.tsx` mantém ícones inline e paleta/rotações no próprio arquivo.
- Decisão: mover ícones para `src/components/agenda/ReminderIcons.tsx` e paleta/rotações para `src/components/agenda/reminderPalette.ts`, consumidos via barrel.
- Consequência: página mais enxuta e módulos reutilizáveis sem mudança de comportamento.
- Reversão: reverter a extração e reintegrar ícones/paleta no arquivo da página.
- Referências: `src/pages/LembretesPage.tsx`, `src/components/agenda/ReminderIcons.tsx`, `src/components/agenda/reminderPalette.ts`, `src/components/agenda/index.ts`.

### 2026-02-14 — Extração do empty state em Lembretes

- Contexto: `src/pages/LembretesPage.tsx` contém bloco inline de estado vazio.
- Decisão: mover o empty state para `src/components/agenda/ReminderEmptyState.tsx` e exportar via barrel.
- Consequência: página mais coesa e componente reutilizável sem alteração visual.
- Reversão: reverter a extração e reintegrar o bloco no arquivo da página.
- Referências: `src/pages/LembretesPage.tsx`, `src/components/agenda/ReminderEmptyState.tsx`, `src/components/agenda/index.ts`.

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
