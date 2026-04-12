---
trigger: always_on
description: Regras de pureza funcional para utils e hooks — impede dependências circulares e side effects descontrolados no Nexus-Arqui
globs:
  - 'src/frontend/utils/**/*.ts'
  - 'src/frontend/hooks/**/*.ts'
  - 'src/frontend/services/**/*.ts'
---

# Purity Boundaries — Nexus-Arqui

## Utils: Funções Puras (Zero Side Effects)

`src/frontend/utils/` contém **apenas** funções puras de formatação, agregação e checagem. Uma função é pura quando:

1. Retorna o mesmo output para o mesmo input
2. Não modifica nada fora do escopo (sem side effects)
3. Não tem interface HTTP ou Browser (sem React DOM)

### Proibições em utils/

| Proibido                            | Motivo                               |
| ----------------------------------- | ------------------------------------ |
| `import { useState } from 'react'`  | Utils não dependem do React Cycle    |
| `import { useX } from '../hooks'`   | Utils não chamam hooks               |
| `import { X } from '../components'` | Utils não usam componentes           |
| `import { X } from '../pages'`      | Utils não conhecem telas             |
| `localStorage.setItem(...)`         | I/O imperativo (use Services/Hooks!) |
| `fetch(...)`                        | Use `src/frontend/services/`         |

## Hooks: Regras de Composição Reativa

`src/frontend/hooks/` agrupa custom hooks reativos e compartilhados.

### Obrigações em hooks/

| Regra                | Detalhe                                                                               |
| -------------------- | ------------------------------------------------------------------------------------- |
| Prefixo `use`        | Obrigatório (`useFeature`, `useFetchEntity`).                                         |
| Cleanup              | Todo `useEffect` com side effect imperativo deve retornar no cleanup.                 |
| Agnosticidade Visual | Hooks não controlam UI (Ex: JSX retornando do Hook é restrito, prefira Render Props). |

### Proibições em hooks/

| Proibido                            | Motivo                                                               |
| ----------------------------------- | -------------------------------------------------------------------- |
| `import { X } from '../components'` | Hooks não importam componentes, eles fornecem dados aos componentes. |
| `import { X } from '../pages'`      | Hooks não dependem de páginas particulares.                          |

## Services: Isolamento Restrito (Infrastructure)

O diretório `src/frontend/services/` não pode depender da árvore de componentes (DOM) ou hooks, sendo limitado ao protocolo de tráfego, parsers de domínio e API calls.

## Hierarquia de Dependências (Unidirecional / Flow de Arquitetura)

```text
pages/ → components/ → hooks/ → services/ → utils/ → types/
  ↓          ↓           ↓          ↓         ↓
  ✅         ✅          ✅         ✅        ✅

utils/ → components/  ❌ PROIBIDO
hooks/ → components/  ❌ PROIBIDO
services/ → hooks/    ❌ PROIBIDO
types/ → utils/       ❌ PROIBIDO (types devem exportar apenas tipos)
```

O fluxo é **sempre** da esquerda (páginas/consumidor) para a direita (primitivas absolutas).

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
