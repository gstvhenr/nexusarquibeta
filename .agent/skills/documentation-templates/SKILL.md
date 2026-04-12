---
name: documentation-templates
description: Templates de documentacao e diretrizes de estrutura. README, documentacao de API, comentarios de codigo e documentacao para IA.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Documentation Templates — Nexus-Arqui

> Documentação vive em `docs/`. ADRs em `docs/decisions/`. Contratos em `docs/data-contracts/`.
> Comentários em código: JSDoc apenas para funções públicas de services e utils.

---

## 1. JSDoc — Padrão do Projeto

```typescript
// src/services/proposalService.ts

/**
 * Busca propostas filtradas por status.
 * @param options.status - Status para filtrar ('won' | 'lost' | 'pending')
 * @returns Array de propostas correspondentes ao filtro
 * @example
 * const wonProposals = await getProposals({ status: 'won' });
 */
export async function getProposals(options: GetProposalsOptions): Promise<Proposal[]> { ... }
```

> **Regra:** JSDoc apenas para serviços públicos (`src/services/`, `src/utils/`).
> Não documente óbvio. Se o nome explica, não precisa de JSDoc.

---

## 2. ADR — Architectural Decision Record

```markdown
# ADR-XXX: [Título da Decisão]

**Data:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated

## Context

[Por que precisamos decidir isso? Qual é o problema?]

## Decision

[O que decidimos fazer]

## Rationale

[Por que essa opção foi escolhida sobre as alternativas]

## Consequences

**Positivo:** [Benefícios]
**Negativo:** [Trade-offs]
**Mitigação:** [Como lidar com os negativos]
```

> Salve em: `docs/adr/ADR-XXX-slug.md`

---

## 3. NEXT.md — Próximos Passos

```markdown
# NEXT.md — Próximas tarefas

## Prioridade Alta

- [ ] [Task específica com contexto]

## Prioridade Média

- [ ] [Task com mais detalhe quando necessário]

## Backlog / Sugestões do Agente

- [ ] [Extras identificados durante implementação]

---

_Atualizado por: [agente/contexto] em [data]_
```

---

## 4. Changelog de Feature (task-slug.md)

```markdown
# [Feature Name]

## Goal

Uma frase descrevendo o objetivo.

## Changes Made

- `src/services/X.ts` — [O que mudou]
- `src/components/Y.tsx` — [O que mudou]

## Verification

- [ ] npm run verify — ✅ verde
- [ ] [Critério de aceite principal]
```

---

## 5. Contrato de Tipo — types-contracts.md

Qualquer mudança em tipos que são **contratos de interface** (interfaces de services, tipos de dados persistidos) deve ser refletida em `docs/data-contracts/types-contracts.md`:

```typescript
// Ao adicionar novo campo em type existente:
interface Project {
  id: string;
  name: string;
  // [NOVO] status adicionado em ADR-012
  status: 'active' | 'archived' | 'completed';
}
```

> E atualizar `src/test/fixtures/` para incluir o novo campo.

---

## 6. Comentários em Código — Regras

| Tipo       | Regra                              |
| ---------- | ---------------------------------- |
| Óbvio      | ❌ Não comente                     |
| "Por que"  | ✅ Comente brevemente              |
| TODO       | ❌ Não deixe — use NEXT.md         |
| Workaround | ✅ Explique por que com referência |

```typescript
// ❌ Comentário óbvio
// Soma os valores do array
const total = values.reduce((sum, v) => sum + v, 0);

// ✅ Comentário de "por que"
// IndexedDB não suporta transações cross-store; persistimos em lotes separados
await persistBatch(storeA);
await persistBatch(storeB);
```

---

## 7. O que Manter Atualizado

| Arquivo                                  | Quando atualizar                  |
| ---------------------------------------- | --------------------------------- |
| `NEXT.md`                                | Após toda implementação           |
| `docs/decisions/ADR-XXX.md`              | Toda decisão arquitetural         |
| `docs/data-contracts/types-contracts.md` | Mudança em tipos públicos         |
| `src/test/fixtures/`                     | Novo campo em type existente      |
| `CONTEXT.md`                             | Mudança significativa de contexto |

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
