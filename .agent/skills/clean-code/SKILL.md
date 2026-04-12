---
name: clean-code
description: Padroes pragmaticos de codigo - conciso, direto, sem excesso de engenharia, sem comentarios desnecessarios
allowed-tools: Read, Write, Edit
version: 2.0
priority: CRITICAL
---

# Clean Code — Nexus-Arqui

> **CRITICAL SKILL** — Conciso, direto, focado em solução.
> Stack: React 18 + TypeScript strict + Vite 6 + Vitest 3 + TailwindCSS v3 + IndexedDB

---

## Core Principles

| Principle     | Rule                                       |
| ------------- | ------------------------------------------ |
| **SRP**       | Cada função/componente faz UMA coisa       |
| **DRY**       | Extraia duplicatas, reutilize              |
| **KISS**      | Solução mais simples que funciona          |
| **YAGNI**     | Não construa o que não foi pedido          |
| **Boy Scout** | Deixe o código mais limpo do que encontrou |

---

## Naming Rules

| Element       | Convention                                       |
| ------------- | ------------------------------------------------ |
| **Variables** | Revela intenção: `proposalCount` não `n`         |
| **Functions** | Verbo + noun: `getProposalById()`                |
| **Booleans**  | Pergunta: `isActive`, `hasPermission`, `canEdit` |
| **Constants** | SCREAMING_SNAKE: `MAX_RETRY_COUNT`               |

> **Regra:** Se precisa de comentário para explicar o nome, renomeie.

---

## Function Rules

| Rule                | Description                     |
| ------------------- | ------------------------------- |
| **Small**           | Max 20 linhas, ideal 5-10       |
| **One Thing**       | Faz uma coisa, faz bem          |
| **Few Args**        | Max 3 argumentos, prefer 0-2    |
| **No Side Effects** | Não mute inputs inesperadamente |

---

## TypeScript (strict) — Nexus-Arqui

```typescript
// ❌ ERRADO — React.FC deprecated
const MyComponent: React.FC<Props> = ({ name }) => ...

// ✅ CORRETO — função normal tipada
function MyComponent({ name }: Props) { ... }

// ❌ ERRADO — any
const data: any = fetchProject();

// ✅ CORRETO — tipo explícito
const project: Project | null = fetchProject();

// ❌ ERRADO — acesso sem guard
project.client.name

// ✅ CORRETO — optional chaining
project?.client?.name ?? 'Sem cliente'
```

---

## Code Structure

| Pattern           | Apply                         |
| ----------------- | ----------------------------- |
| **Guard Clauses** | Early returns para edge cases |
| **Flat > Nested** | Máx 2 níveis de nesting       |
| **Colocation**    | Código relacionado próximo    |

---

## 🔴 Antes de Editar QUALQUER Arquivo

| Pergunta                           | Por quê                   |
| ---------------------------------- | ------------------------- |
| **Quem importa este arquivo?**     | Podem quebrar             |
| **O que este arquivo importa?**    | Mudanças de interface     |
| **Quais testes cobrem isso?**      | Testes podem falhar       |
| **É um componente compartilhado?** | Múltiplos pontos afetados |

> **Regra:** Edite o arquivo + todas as dependências na MESMA tarefa.

---

## Self-Check Antes de Completar (OBRIGATÓRIO)

| Check              | Pergunta                         |
| ------------------ | -------------------------------- |
| ✅ **Goal met?**   | Fiz exatamente o que foi pedido? |
| ✅ **Types pass?** | `npm run typecheck` verde?       |
| ✅ **Tests pass?** | `npm run test` verde?            |
| ✅ **Verify?**     | `npm run verify` verde?          |

> **Gate canônico:** `npm run verify` (lint + typecheck + test + build)

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
