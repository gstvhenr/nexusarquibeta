# .agent Index

## Ativo no fluxo diário

- `workflows/default-task-flow.md`
- `workflows/verify-first.md`
- `checklists/self-review-checklist.md`
- `checklists/domain-refactor-checklist.md`
- `lessons-learned.md`

## Evals — Regressão de comportamento de agentes

- `evals/eval-scenarios.md` — Cenários de regressão para validar que mudanças em agents/skills/workflows não degradam comportamento esperado

## Schemas — Validação de outputs estruturados

- `schemas/index.md` — Documentação do sistema de schemas e camada de validação
- `schemas/agent-task.schema.ts` — Schema de task para saídas estruturadas de agentes
- `schemas/skill-input.schema.ts` — Schema de input para skills
- `schemas/validator.ts` — Validador de runtime para schemas

## Prompts — Missões Operacionais

- `prompts/Prompt_limpeza.md` — Análise forense e faxina segura do codebase (código morto, arquivos órfãos, exports fantasma)
- `prompts/Prompt_clean_DNA.md` — Engenharia estrutural anti-poluição (modificar governança para prevenir sujeira futura)
- `prompts/Prompt_Agente.md` — Prompt de sistema para agente-orquestrador do projeto
- `prompts/Prompt_ArchPulse_Remediacao.md` — Remediação de saúde arquitetural (ArchPulse)
- `prompts/Prompt_Auditoria_Cobertura_Testes.md` — Auditoria de cobertura de testes
- `prompts/Prompt_Auditoria_Sincronizacao_Documental.md` — Auditoria de sincronização documental
- `prompts/Prompt_DNA_Padronizacao_Sistemica.md` — Padronização sistêmica de DNA
- `prompts/Prompt_Emulacao_03_mentes.md` — Emulação de 3 mentes para análise
- `prompts/Prompt_Imunizacao_Estrutural_DNA.md` — Imunização estrutural de DNA
- `prompts/Prompt_Padronizacao_Cirurgica.md` — Padronização cirúrgica
- `prompts/Prompt_Reorganizacao_Estrutural.md` — Reorganização estrutural

## Slash-command workflows (30 workflows)

- `workflows/audit-coverage.md` — Auditoria de cobertura de testes
- `workflows/brainstorm.md` — Exploração estruturada de ideias
- `workflows/circular-deps.md` — Detecção de dependências circulares
- `workflows/code-cleanup-v1.md` — Limpeza de código v1
- `workflows/componentize.md` — Auditoria de componentização
- `workflows/contract-check.md` — Validação de contratos de dados
- `workflows/coupling-check.md` — Análise de acoplamento
- `workflows/debug.md` — Investigação sistemática de bugs
- `workflows/default-task-flow.md` — Fluxo padrão de tarefa do agente
- `workflows/deps.md` — Atualização segura de dependências
- `workflows/docs-audit.md` — Auditoria e sync de documentação
- `workflows/enhance.md` — Adicionar ou atualizar features
- `workflows/entry-points.md` — Auditoria de entry points
- `workflows/epic.md` — Planejamento de épicos
- `workflows/health-check.md` — Diagnóstico rápido de saúde do repositório
- `workflows/migrate.md` — Migração segura de schema/dados
- `workflows/orchestrate.md` — Orquestração multi-agente
- `workflows/orphan-modules.md` — Identificação de módulos órfãos
- `workflows/perf.md` — Diagnóstico e otimização de performance
- `workflows/plan.md` — Planejamento sem código
- `workflows/prd.md` — Geração de PRD (Product Requirements Document)
- `workflows/preview.md` — Servidor de desenvolvimento local
- `workflows/refactor.md` — Refatoração segura e incremental
- `workflows/release.md` — Drafting de release e changelog
- `workflows/research.md` — Pesquisa profunda via Perplexity MCP
- `workflows/status.md` — Status do projeto e agentes
- `workflows/test-impact.md` — Verificação de impacto em testes
- `workflows/test.md` — Geração e execução de testes
- `workflows/ui-ux-pro-max.md` — Design e implementação de UI
- `workflows/verify-first.md` — Verificação pré-implementação

## Agentes — Classificação por uso

### 🟢 Uso diário (core do fluxo de desenvolvimento)

| Agente                       | Justificativa                              |
| ---------------------------- | ------------------------------------------ |
| `frontend-specialist`        | O projeto é React — ativado constantemente |
| `debugger`                   | Investigação e correção de bugs            |
| `orchestrator`               | Coordenação de tarefas multi-domínio       |
| `project-planner`            | Toda feature nova passa por plano          |
| `code-archaeologist`         | Refatorações frequentes no projeto         |
| `test-engineer`              | Testes unit/integration com Vitest         |
| `explorer-agent`             | Mapeamento e auditoria de codebase         |
| `architecture-health-doctor` | Saúde estrutural do grafo de dependências  |

### 🟡 Sob demanda (ativado quando necessário)

| Agente                  | Quando usar                                   |
| ----------------------- | --------------------------------------------- |
| `backend-specialist`    | Mudanças em services/infrastructure/IndexedDB |
| `performance-optimizer` | Quando performance é problema detectado       |
| `security-auditor`      | Auditoria de segurança explícita              |
| `documentation-writer`  | Apenas quando documentação é solicitada       |

### ⚪ Aspiracional (preparado para uso futuro)

| Agente                   | Por que ainda não é ativo                              |
| ------------------------ | ------------------------------------------------------ |
| `database-architect`     | Projeto usa IndexedDB simples, sem migrações complexas |
| `devops-engineer`        | SPA local, sem CI/CD pipeline configurado              |
| `qa-automation-engineer` | Playwright sem implementação E2E ainda                 |

## Regra

Comandos oficiais e gates vivem em `AGENTS.md`.
