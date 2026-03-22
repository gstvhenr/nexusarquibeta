---
description: Criar novo custom hook no Nexus-Arqui. Resolve localização (global vs page-scoped), aplica purity boundaries e quality gate.
---

# /novo-hook — Scaffolding de Custom Hook

> **Trigger automático:** "novo hook", "criar hook", "extrair hook", "useAlgo"
> **Agent:** `frontend-specialist`

---

## Fase 0: Classificar — Global ou Page-Scoped?

```
O hook será usado por mais de 1 página/domínio?
├─ SIM → src/frontend/hooks/use<Feature>.ts
│        Regra: genérico, sem lógica de página específica
│        Exemplo: useDebounce, useFormValidation, useProjectFinancials
│
└─ NÃO → É escopado a uma única feature/página?
         ├─ SIM → Co-locar com a página:
         │        src/frontend/pages/<domínio>/<feature>/use<Feature>.ts
         │        Ou: src/frontend/pages/<domínio>/<feature>/hooks/use<Feature>.ts
         │        Exemplo: useProjectLifecycleActions.ts
         │
         └─ TALVEZ → Comece page-scoped. Promova para global quando 2ª página precisar.
```

---

## Fase 1: Definir dados do hook

| Campo            | Valor                            | Exemplo                                |
| ---------------- | -------------------------------- | -------------------------------------- |
| **nome**         | Prefixo `use` + camelCase        | `useProjectBudget`                     |
| **propósito**    | Que lógica repetida substitui?   | "Carrega e formata dados de orçamento" |
| **dependências** | Usa services? utils? outro hook? | `budgetService`, `formatCurrency`      |
| **retorno**      | Tuple, object ou valor simples?  | `{ data, isLoading, error, refetch }`  |
| **localização**  | Resultado da árvore acima        | `hooks/` (global)                      |

---

## Fase 2: Verificar se já existe (ANTI-DUPLICAÇÃO)

> ⚠️ **Criar hook duplicado é a violação mais comum em projetos React grandes.**
> Antes de criar, é obrigatório verificar 3 fontes.

### 2.1 Consultar inventário do projeto

Se `.agent/memory/project-inventory.md` existir, verificar se já lista um hook com funcionalidade similar.

### 2.2 Buscar hooks existentes no codebase

```bash
# Hooks globais
grep -r "export function use" src/frontend/hooks/ --include="*.ts" -l

# Hooks page-scoped
grep -r "export function use" src/frontend/pages/ --include="*.ts" -l
```

### 2.3 Avaliar hooks existentes contra o novo

Para cada hook encontrado, avaliar se **compor** ou **estender** resolve o caso:

```
Hook similar encontrado?
├─ SIM → É a mesma funcionalidade com parâmetros diferentes?
│        ├─ SIM → ESTENDER o hook existente (generics, parâmetro extra)
│        └─ NÃO → É funcionalidade complementar?
│                 ├─ SIM → COMPOR: novo hook pode chamar o existente
│                 └─ NÃO → OK, criar hook novo
│
└─ NÃO → OK, criar hook novo
```

> **Regra:** Se hook parecido existe → **estender/compor**, não duplicar.

---

## Fase 3: Verificar Purity Boundaries (OBRIGATÓRIO)

Antes de escrever o hook, validar que as dependências respeitam a hierarquia:

```
✅ hooks/ PODE importar:
   ├─ React hooks (useState, useEffect, useCallback, useRef, useMemo)
   ├─ Outros hooks de src/frontend/hooks/
   ├─ Services de src/frontend/services/
   ├─ Utils de src/frontend/utils/
   └─ Types de src/frontend/types/

❌ hooks/ NÃO PODE importar:
   ├─ Componentes de src/frontend/components/
   ├─ Páginas de src/frontend/pages/
   └─ Infraestrutura diretamente (usar services como intermediário)
```

---

// turbo

## Fase 4: Criar o arquivo

```typescript
// src/frontend/hooks/use<Feature>.ts

import { useState, useEffect, useCallback } from 'react';
// import { minhaService } from '../services/minhaService';
// import type { MeuTipo } from '../types/<dominio>';

/**
 * use<Feature> — Breve descrição do propósito.
 *
 * @param param - Descrição do parâmetro
 * @returns { data, isLoading, error } — Descrição do retorno
 *
 * @example
 * const { data, isLoading } = useFeature(projectId);
 */
export function useFeature(param: string) {
  const [data, setData] = useState<SeuTipo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // const result = await minhaService.get(param);
      // setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [param]);

  useEffect(() => {
    fetchData();
    // Cleanup para abort controller (se aplicável)
    // return () => controller.abort();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
```

### Checklist do arquivo

- [ ] Prefixo `use` no nome da função (obrigatório)
- [ ] Named export `export function` (não `export default`)
- [ ] JSDoc com `@param`, `@returns`, `@example`
- [ ] Types importados com `import type` quando são somente tipo
- [ ] Cleanup em todo `useEffect` com side effect (return, abort controller, clearTimeout)
- [ ] Dependency array correto em `useEffect` e `useCallback`
- [ ] Sem dependência de `components/` ou `pages/` (purity boundary)
- [ ] Sem `as any` (tipar corretamente)
- [ ] Sem `console.log` de debug

---

## Fase 5: Barrel export (se global)

Se o hook é global (`src/frontend/hooks/`), verificar se barrel index existe:

```
Existe src/frontend/hooks/index.ts ?
├─ SIM → Adicionar: export { useFeature } from './useFeature';
└─ NÃO → Criar barrel com o export
```

Se page-scoped → import direto, sem barrel.

---

// turbo

## Fase 6: Quality Gate

```bash
npm run verify
```

Deve retornar `[VERIFY][LOOP][PASS]`.

---

## Fase 7: Uso correto

```tsx
// ✅ CORRETO — via barrel (hooks globais)
import { useFeature } from '../../hooks';

// ✅ CORRETO — import direto (hooks page-scoped)
import { useFeature } from './useFeature';

// ❌ ERRADO — path direto quando barrel existe
import { useFeature } from '../../hooks/useFeature';
```
