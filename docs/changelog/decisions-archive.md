# DECISIONS — Archive

Entradas históricas arquivadas. Consulte `DECISIONS-active.md` para decisões vigentes.

Arquivo gerado em 2026-02-17; cobre entradas de 2026-02-12 a 2026-02-14.

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
