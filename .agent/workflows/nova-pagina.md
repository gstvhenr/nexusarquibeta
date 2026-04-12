---
description: Criar nova página/rota no Nexus-Arqui. Scaffolding completo com PLACEMENT_RULES, App.tsx, tipos e quality gate.
---

# /nova-pagina — Scaffolding de Rota

> **Trigger automático:** "nova página", "criar rota", "adicionar página", "criar tela"
> **Agent:** `frontend-specialist` ou `orchestrator` (se multi-arquivo)

---

## Fase 0: Consultar PLACEMENT_RULES (OBRIGATÓRIO)

Antes de criar qualquer arquivo, ler `docs/PLACEMENT_RULES.md` para resolver:

```
É uma rota de menu/submenu?
├─ SIM → src/frontend/pages/<dominio>/<feature>/<NomePage>.tsx
│        Domínios válidos: home, agenda, comercial, projetos, clientes,
│        financeiro, documentos, suprimentos, gestao-marketing,
│        prestadores-freelancers, relatorios, configuracoes
│
└─ NÃO → Reavaliar se é realmente uma página (pode ser modal, drawer, tab)
```

**Naming obrigatório:** Sufixo `Page.tsx` (ex: `FinanceiroGestaoCaixaPage.tsx`)

---

## Fase 1: Definir dados da rota

Responda antes de prosseguir:

| Campo                 | Valor                         | Exemplo                     |
| --------------------- | ----------------------------- | --------------------------- |
| **domínio**           | Qual módulo do ERP?           | `financeiro`                |
| **feature**           | Nome kebab-case da feature    | `gestao-caixa`              |
| **path**              | Segmento de URL               | `gestao-caixa`              |
| **nome**              | PascalCase + sufixo Page      | `FinanceiroGestaoCaixaPage` |
| **pai**               | Se sub-rota, qual rota pai?   | `financeiro`                |
| **tipos necessários** | DTOs/interfaces que precisará | `CashEntry`, `CashSummary`  |

---

## Fase 2: Criar tipos (se necessário)

```
Precisa de tipos novos?
├─ SIM → Os tipos são reutilizáveis entre domínios?
│        ├─ SIM → src/frontend/types/<dominio>.ts
│        └─ NÃO → src/frontend/pages/<dominio>/<feature>/types.ts
│
└─ NÃO → Prosseguir
```

// turbo

## Fase 3: Criar a página

Criar `src/frontend/pages/<dominio>/<feature>/<NomePage>.tsx`:

```tsx
// Imports seguindo ordem de camadas (AGENTS.md §6.3)
import { useState } from 'react';

// Tipos (se houver)
// import type { MinhaInterface } from '../../../types/<dominio>';

/**
 * <NomePage> — Breve descrição do propósito da página.
 */
export default function NomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Título da Página</h1>
      <p className="text-text-secondary">Conteúdo em construção.</p>
    </div>
  );
}
```

### Checklist do arquivo

- [ ] `export default function` (não arrow function)
- [ ] Sufixo `Page` no nome da função
- [ ] Tokens semânticos (não hardcoded)
- [ ] JSDoc com descrição de propósito
- [ ] Sem lógica de negócio (usar hooks/services)
- [ ] Sem acesso direto a localStorage/IndexedDB (usar services)

---

## Fase 4: Registrar rota no App.tsx

1. Adicionar `import` no topo (lazy se possível):

```tsx
// Lazy loading (recomendado para páginas)
const NomePage = lazy(() => import('./pages/<dominio>/<feature>/<NomePage>'));

// Ou import direto (para páginas menores)
import NomePage from './pages/<dominio>/<feature>/<NomePage>';
```

2. Adicionar `<Route>` no JSX dentro do grupo correto:

```tsx
// Se rota top-level
<Route path="<path>" element={<NomePage />} />

// Se sub-rota (dentro do bloco pai)
<Route path="<pai>">
  <Route path="<feature>" element={<NomePage />} />
</Route>
```

---

## Fase 5: Verificar navegação lateral (se aplicável)

Se a nova página deve aparecer no menu/sidebar:

1. Localizar a configuração de navegação do projeto
2. Adicionar o item de menu no local correto
3. Garantir que ícone, label e path estão sincronizados

---

## Fase 6: Verificar consistência

- [ ] `PLACEMENT_RULES.md` foi consultado
- [ ] Path do arquivo segue naming conventions (`*Page.tsx`)
- [ ] `App.tsx` tem o `import` no topo
- [ ] `App.tsx` tem o `<Route>` no local correto
- [ ] A pasta existe com o arquivo correto
- [ ] Se tem tipos: estão em `types/` ou co-locados conforme regra
- [ ] Se sub-rota: path é relativo ao pai
- [ ] Se lazy: Suspense wrapper existe no App.tsx

// turbo

## Fase 7: Quality Gate

```bash
npm run verify
```

Deve retornar `[VERIFY][LOOP][PASS]`. Se falhar, corrigir antes de reportar conclusão.

---

## Fase 8: Atualizar NEXT.md

Registrar a nova página no `NEXT.md` se ela precisa de iteração futura (tabela de dados, formulário, integração, etc.).

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
