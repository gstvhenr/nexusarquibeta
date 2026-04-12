---
name: plan-writing
description: Planejamento estruturado de tarefas com divisoes claras, dependencias e criterios de verificacao. Use ao implementar features, refatorar ou qualquer trabalho de multiplas etapas.
allowed-tools: Read, Glob, Grep
---

# Plan Writing — Nexus-Arqui

> Planos de task criados como `{task-slug}.md` na raiz do projeto.
> Gate de verificação: `npm run verify` (lint + typecheck + test + build)

---

## Task Breakdown Principles

### 1. Tasks Pequenas e Focadas

- Cada task: 2-5 minutos
- Um resultado claro por task
- Independentemente verificável

### 2. Verificação Clara

- Como sabe que está pronta?
- O que pode testar?
- Qual é o output esperado?

### 3. Ordenação Lógica

- Dependências identificadas
- Trabalho paralelo onde possível
- **Fase de Verificação é SEMPRE A ÚLTIMA**

### 4. Arquivo no projeto

- Nome derivado da task: `add-proposal-status.md`
- **Salvar na raiz do projeto** — nunca em `.agent/` ou `docs/`

---

## Planning Principles

> 🔴 **NÃO use templates fixos. Cada plano é único para a task.**

### Princípio 1: Seja CURTO

| ❌ Errado                  | ✅ Correto              |
| -------------------------- | ----------------------- |
| 50 tasks com sub-sub-tasks | 5-10 tasks max          |
| Cada micro-step listado    | Apenas itens acionáveis |
| Descrições verbosas        | Uma linha por task      |

> **Regra:** Se o plano tem mais de 1 página, está longo demais.

---

### Princípio 2: ESPECÍFICO, não genérico

| ❌ Errado           | ✅ Correto                                             |
| ------------------- | ------------------------------------------------------ |
| "Adicionar feature" | "Adicionar campo `status` em `ProposalCard.tsx`"       |
| "Testar"            | "Executar `npm run verify` verde"                      |
| "Estilizar"         | "Usar `bg-blue-600 hover:bg-blue-700` em `Button.tsx`" |

---

### Princípio 3: Gates Específicos do Nexus-Arqui

| Escopo da mudança            | Gate recomendado       |
| ---------------------------- | ---------------------- |
| Mudança em 1 arquivo simples | `npm run verify:quick` |
| Feature completa             | `npm run verify`       |
| CI/Deploy                    | `npm run verify:ci`    |

> ❌ **Não liste scripts Python** — o projeto não usa `ux_audit.py`, `api_validator.py`, etc.

---

## Plan Structure

```markdown
# [Task Name]

## Goal

Uma frase: O que estamos construindo/corrigindo?

## Tasks

- [ ] Task 1: [Ação específica] → Verify: [Como verificar]
- [ ] Task 2: [Ação específica] → Verify: [Como verificar]
- [ ] Task N: npm run verify → verde ✅

## Done When

- [ ] npm run verify passa
- [ ] [Critério de aceite principal]
```

---

## Domínios do Nexus-Arqui (para contexto nos planos)

| Área              | Arquivos relevantes             |
| ----------------- | ------------------------------- |
| Componentes React | `src/components/`, `src/pages/` |
| Business Logic    | `src/services/`, `src/utils/`   |
| State             | `src/context/`, `src/hooks/`    |
| Testes            | `src/test/`, `*.test.ts(x)`     |
| Tipos             | `src/types/`, `src/types.ts`    |
| Estilos           | TailwindCSS via classes         |

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
