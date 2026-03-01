# .agent Index

## Ativo no fluxo diário

- `workflows/default-task-flow.md`
- `workflows/verify-first.md`
- `checklists/self-review-checklist.md`
- `checklists/domain-refactor-checklist.md`
- `lessons-learned.md`

## Prompts — Missões Operacionais

- `prompts/deep-clean.md` — Análise forense e faxina segura do codebase (código morto, arquivos órfãos, exports fantasma)
- `prompts/clean-dna.md` — Engenharia estrutural anti-poluição (modificar governança para prevenir sujeira futura)

## Slash-command workflows

- `workflows/brainstorm.md` — Exploração estruturada de ideias
- `workflows/debug.md` — Investigação sistemática de bugs
- `workflows/enhance.md` — Adicionar ou atualizar features
- `workflows/orchestrate.md` — Orquestração multi-agente
- `workflows/plan.md` — Planejamento sem código
- `workflows/preview.md` — Servidor de desenvolvimento local
- `workflows/status.md` — Status do projeto e agentes
- `workflows/test.md` — Geração e execução de testes
- `workflows/ui-ux-pro-max.md` — Design e implementação de UI

## Agentes — Classificação por uso

### 🟢 Uso diário (core do fluxo de desenvolvimento)

| Agente                | Justificativa                              |
| --------------------- | ------------------------------------------ |
| `frontend-specialist` | O projeto é React — ativado constantemente |
| `debugger`            | Investigação e correção de bugs            |
| `orchestrator`        | Coordenação de tarefas multi-domínio       |
| `project-planner`     | Toda feature nova passa por plano          |
| `code-archaeologist`  | Refatorações frequentes no projeto         |
| `test-engineer`       | Testes unit/integration com Vitest         |
| `explorer-agent`      | Mapeamento e auditoria de codebase         |

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
