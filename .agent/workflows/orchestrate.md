---
description: Coordinate multiple agents for complex tasks. Use for multi-perspective analysis, comprehensive reviews, or tasks requiring different domain expertise.
---

# /orchestrate - Orquestração Multi-Agente

$ARGUMENTS

---

## 🔴 Requisito Mínimo

> ⚠️ **ORQUESTRAÇÃO = MÍNIMO 3 AGENTES DIFERENTES**
>
> Se usar menos de 3, não é orquestração — é delegação simples.

---

## Agentes Disponíveis — Nexus-Arqui (14 ativos)

| Agente                   | Domínio      | Quando Usar                     |
| ------------------------ | ------------ | ------------------------------- |
| `project-planner`        | Planejamento | Breakdown de tasks, PLAN.md     |
| `explorer-agent`         | Descoberta   | Mapeamento de codebase          |
| `frontend-specialist`    | UI/UX        | React, componentes, TailwindCSS |
| `backend-specialist`     | Serviços     | Services, IndexedDB, lógica     |
| `database-architect`     | Dados        | Schema IndexedDB, estrutura     |
| `security-auditor`       | Segurança    | OWASP, XSS, dados financeiros   |
| `test-engineer`          | Testes       | Vitest, fixtures, cobertura     |
| `qa-automation-engineer` | E2E          | Playwright, fluxos críticos     |
| `devops-engineer`        | Ops          | Gates, CI, verify               |
| `performance-optimizer`  | Performance  | Re-renders, bundle Vite         |
| `debugger`               | Debug        | Erros, root cause               |
| `code-archaeologist`     | Refatoração  | Legado, cleanup                 |
| `documentation-writer`   | Docs         | JSDoc, ADRs, NEXT.md            |
| `orchestrator`           | Meta         | Coordenação                     |

---

## Matriz de Seleção

| Tipo de Task          | Agentes Recomendados (mínimos)                                    |
| --------------------- | ----------------------------------------------------------------- |
| **Feature React**     | `frontend-specialist`, `test-engineer`, `devops-engineer`         |
| **Service/IndexedDB** | `backend-specialist`, `database-architect`, `test-engineer`       |
| **Segurança**         | `security-auditor`, `backend-specialist`, `devops-engineer`       |
| **Performance**       | `performance-optimizer`, `frontend-specialist`, `devops-engineer` |
| **Debug complexo**    | `debugger`, `explorer-agent`, `test-engineer`                     |
| **Refactor**          | `code-archaeologist`, `test-engineer`, `devops-engineer`          |

---

## 2-Phase Orchestration

### FASE 1: Planejamento (somente project-planner)

| Step | Agente                      | Ação                           |
| ---- | --------------------------- | ------------------------------ |
| 1    | `project-planner`           | Criar `{task-slug}.md` na raiz |
| 2    | (opcional) `explorer-agent` | Discovery do codebase          |

> 🔴 **SEM OUTROS AGENTES durante o planejamento!**

### ⏸️ CHECKPOINT: Aprovação do Usuário

```
"✅ Plano criado: {task-slug}.md

Você aprova? (S/N)
- S: Iniciar implementação
- N: Vou revisar o plano"
```

### FASE 2: Implementação (paralelo após aprovação)

| Grupo Paralelo | Agentes                                     |
| -------------- | ------------------------------------------- |
| Fundação       | `database-architect`, `security-auditor`    |
| Core           | `backend-specialist`, `frontend-specialist` |
| Verificação    | `test-engineer`, `devops-engineer`          |

---

## Gate de Verificação (OBRIGATÓRIO)

O último agente **DEVE** rodar:

```bash
npm run verify
```

> ❌ Orquestração NÃO está completa sem `npm run verify` verde.

---

## Output Format

```markdown
## 🎼 Relatório de Orquestração

### Task

[Resumo da task original]

### Agentes Invocados (MÍNIMO 3)

| #   | Agente              | Área          | Status |
| --- | ------------------- | ------------- | ------ |
| 1   | project-planner     | Planejamento  | ✅     |
| 2   | frontend-specialist | Implementação | ✅     |
| 3   | test-engineer       | Verificação   | ✅     |

### Verificação

- [x] npm run verify → ✅ Verde

### Entregáveis

- [ ] Plano criado
- [ ] Código implementado
- [ ] Testes passando
- [ ] verify verde
```

---

## 🔴 Exit Gate

Antes de finalizar:

1. ✅ **Contagem de agentes:** `agentes_invocados >= 3`
2. ✅ **Verificação:** `npm run verify` verde
3. ✅ **Relatório:** Relatório de orquestração gerado

---

## Exemplos de Uso

```
/orchestrate implementar módulo de comissões completo
/orchestrate refatorar sistema de Contextos para performance
/orchestrate auditoria completa de segurança do ERP
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
