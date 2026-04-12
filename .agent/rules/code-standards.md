---
trigger: always_on
description: Padrões de nomenclatura, imports e testabilidade para o Nexus-Arqui. Complementa nexusarqui.md com regras concentradas e consultáveis.
globs:
  - 'src/frontend/**/*.tsx'
  - 'src/frontend/**/*.ts'
---

# Code Standards — Nexus-Arqui

---

## 1. Nomenclatura de Arquivos

| Tipo           | Padrão                              | Exemplo                         |
| -------------- | ----------------------------------- | ------------------------------- |
| Página         | `PascalCase` + sufixo `Page.tsx`    | `FinanceiroGestaoCaixaPage.tsx` |
| Componente     | `PascalCase.tsx`                    | `ProjectTimeline.tsx`           |
| Hook           | `camelCase` + prefixo `use` + `.ts` | `useProjectBudget.ts`           |
| Service        | `camelCase` + sufixo `Service.ts`   | `propostaService.ts`            |
| Util           | `camelCase.ts`                      | `formatCurrency.ts`             |
| Tipo/Interface | `camelCase.ts` (nome do domínio)    | `financeiro.ts`, `projeto.ts`   |
| Barrel         | `index.ts`                          | `index.ts`                      |
| Teste          | `NomeOriginal.test.ts(x)`           | `Button.test.tsx`               |
| Constantes     | `camelCase.ts`                      | `statusOptions.ts`              |

---

## 2. Nomenclatura de Código

| Elemento            | Padrão                            | Exemplo                           |
| ------------------- | --------------------------------- | --------------------------------- |
| Componente (função) | `PascalCase`                      | `function ProjectTimeline()`      |
| Hook (função)       | `camelCase` + prefixo `use`       | `function useProjectBudget()`     |
| Interface de Props  | `PascalCase` + sufixo `Props`     | `interface ProjectTimelineProps`  |
| Tipo de domínio     | `PascalCase`                      | `interface Proposta`              |
| Lookup table        | `UPPER_SNAKE_CASE`                | `const VARIANT_STYLES`            |
| Constante literal   | `UPPER_SNAKE_CASE`                | `const MAX_RETRY_COUNT = 3`       |
| Função de service   | `camelCase`                       | `function calculateBudgetTotal()` |
| Variável de estado  | `camelCase`                       | `const [isLoading, setIsLoading]` |
| Event handler       | `handle` + `PascalCase`           | `function handleSubmitProposal()` |
| Boolean             | Prefixo `is`/`has`/`should`/`can` | `isVisible`, `hasPermission`      |

### Proibições de nomenclatura

| ❌ Proibido                           | ✅ Usar                                           |
| ------------------------------------- | ------------------------------------------------- |
| `data`, `result`, `value` (genérico)  | `clientProposals`, `monthlyRevenue`               |
| `temp`, `tmp`, `aux`                  | Nome que revela intenção                          |
| `func`, `fn`, `cb`                    | Nome descritivo do callback                       |
| Siglas obscuras (`prcCnt`, `clntLst`) | Palavras completas (`processCount`, `clientList`) |
| Prefixo `I` em interfaces (`IClient`) | `Client` (TypeScript infere a diferença)          |

---

## 3. Regras de Import (5 regras canônicas)

### Regra 1: Ordem de imports

```typescript
// 1. React e bibliotecas core
import { useState, useEffect } from 'react';

// 2. Bibliotecas de terceiros
import { AnimatePresence } from 'framer-motion';

// 3. Hooks do projeto
import { useProjectBudget } from '../../hooks';

// 4. Components do projeto
import { Button, Card } from '../../components/ui';

// 5. Services, utils, types e constantes
import { propostaService } from '../../services/propostaService';
import { formatCurrency } from '../../utils/formatters';
import type { Proposta } from '../../types/comercial';
```

### Regra 2: Barrel imports quando disponíveis

```typescript
// ✅ CORRETO — via barrel
import { Button, Card } from '../../components/ui';

// ❌ ERRADO — path direto quando barrel existe
import { Button } from '../../components/ui/Button';
```

### Regra 3: Type-only imports

```typescript
// ✅ Quando import é SOMENTE tipo
import type { Proposta } from '../../types/comercial';

// ❌ Misturar tipo com valor no mesmo import
import { Proposta, propostaService } from '../../services';
```

### Regra 4: Sem imports circulares

```
pages/ → components/ → hooks/ → services/ → utils/ → types/
A seta é SOMENTE para a direita. Nunca para a esquerda.
```

### Regra 5: Sem deep imports em node_modules

```typescript
// ❌ ERRADO
import { X } from 'lucide-react/dist/esm/icons/x';

// ✅ CORRETO
import { X } from 'lucide-react';
```

---

## 4. Testabilidade (data-testid)

Todo componente **interativo** deve ter `data-testid` para seleção em testes:

```tsx
// ✅ CORRETO
<button data-testid="submit-proposal-btn" onClick={handleSubmit}>

// ❌ ERRADO — sem testid em elemento interativo
<button onClick={handleSubmit}>
```

### Convenção de nomes de testid

| Padrão                     | Exemplo                     |
| -------------------------- | --------------------------- |
| `{ação}-{entidade}-{tipo}` | `submit-proposal-btn`       |
| `{entidade}-{campo}-input` | `client-name-input`         |
| `{entidade}-{ação}-link`   | `project-details-link`      |
| `{entidade}-table`         | `clients-table`             |
| `{entidade}-modal`         | `delete-confirmation-modal` |

---

## 5. Regra de Ouro

> **Código que não se explica pelo nome não está pronto.**
> Se precisou comentar para explicar "o que" faz → renomeie.
> Comentários são para "por quê", nunca para "o que".

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
