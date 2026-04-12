---
description: Criar novo componente React no Nexus-Arqui. Resolve localização, aplica design tokens, a11y e quality gate.
---

# /novo-componente — Scaffolding de Componente

> **Trigger automático:** "novo componente", "criar componente", "extrair componente"
> **Agent:** `frontend-specialist`

---

## Fase 0: Classificar — Onde vai o componente?

```
É usado por mais de 1 página/domínio?
├─ SIM → É um primitivo visual genérico (Button, Card, Modal, Badge)?
│        ├─ SIM → src/frontend/components/ui/<Nome>.tsx
│        └─ NÃO → É componente de domínio (ClientCard, ProposalForm)?
│                 └─ SIM → src/frontend/components/<dominio>/<Nome>.tsx
│
└─ NÃO → É exclusivo de uma única página?
         └─ SIM → Co-locar em src/frontend/pages/<dominio>/<feature>/<Nome>.tsx
                  (Ou src/frontend/pages/<dominio>/<feature>/components/<Nome>.tsx
                   se a page já tem múltiplos subcomponentes)
```

> **Regra de promoção:** Se no futuro outra página precisar dele → **MOVER** para `components/ui/` ou `components/<dominio>/`. NUNCA duplicar.

---

## Fase 1: Definir dados do componente

| Campo                      | Valor                             | Exemplo                   |
| -------------------------- | --------------------------------- | ------------------------- |
| **nome**                   | PascalCase                        | `ProjectTimeline`         |
| **localização**            | Resultado da árvore acima         | `components/projetos/`    |
| **props**                  | Variantes e comportamentos        | `variant`, `size`, `data` |
| **interativo?**            | Sim/Não (define a11y obrigatória) | Sim                       |
| **precisa de forwardRef?** | Input/form element?               | Não                       |

---

## Fase 2: Verificar se já existe

Antes de criar, buscar no inventário:

```bash
# Buscar componente similar no codebase
grep -r "export.*function.*<NomeParecido>" src/frontend/components/ --include="*.tsx" -l
```

Consultar `.agent/memory/project-inventory.md` se existir.

Se componente parecido existe → **estender** ao invés de duplicar.

---

// turbo

## Fase 3: Criar o arquivo

```tsx
// src/frontend/components/<localização>/<NomeComponente>.tsx

interface NomeComponenteProps {
  /** Variante visual do componente */
  variant?: 'default' | 'muted';
  /** Classes CSS adicionais */
  className?: string;
  /** Conteúdo do componente */
  children: React.ReactNode;
}

/** Lookup table de variantes — FORA do componente para evitar re-render */
const VARIANT_STYLES: Record<Required<NomeComponenteProps>['variant'], string> = {
  default: 'bg-surface border border-border',
  muted: 'bg-background border-transparent',
};

/**
 * NomeComponente — Breve descrição do propósito.
 *
 * @example
 * <NomeComponente variant="muted">Conteúdo</NomeComponente>
 */
export function NomeComponente({
  variant = 'default',
  className = '',
  children,
}: NomeComponenteProps) {
  return (
    <div
      className={`
        rounded-lg shadow-soft transition-colors duration-150
        ${VARIANT_STYLES[variant]}
        ${className}
      `.trim()}
      data-testid="nome-componente"
    >
      {children}
    </div>
  );
}
```

### Checklist do arquivo

- [ ] Interface `<Nome>Props` com sufixo Props e JSDoc nos campos
- [ ] Lookup table `VARIANT_STYLES` fora da função (evita re-render)
- [ ] Named export `export function` (não default, exceto pages)
- [ ] `className = ''` no destructuring (customização pontual)
- [ ] Tokens semânticos Tailwind (nunca hex/rgb hardcoded)
- [ ] `data-testid` se componente é interativo
- [ ] `forwardRef` se for input/form element
- [ ] JSDoc com `@example` de uso

---

## Fase 4: Acessibilidade (OBRIGATÓRIO para interativos)

Se o componente é interativo, aplicar a regra correspondente:

| Cenário                        | Implementação                                                |
| ------------------------------ | ------------------------------------------------------------ |
| Botão sem texto visível        | `aria-label="Descrição da ação"`                             |
| Input de formulário            | Prop `label` + `<label htmlFor>` internamente                |
| Imagem/ícone decorativo        | `aria-hidden="true"`                                         |
| Imagem informativa             | `alt="Descrição relevante"`                                  |
| Elemento clicável (não-button) | `role="button"` + `tabIndex={0}` + `onKeyDown` (Enter/Space) |
| Modal/Dialog                   | Focus trap + retorno de foco ao fechar                       |
| Select customizado             | `role="listbox"` + `role="option"` nos filhos                |
| Contraste de cores             | Usar apenas tokens da paleta (garantem WCAG AA)              |

> **Regra:** Componente interativo **SEM** mecanismo de acessibilidade = bug de a11y.

---

## Fase 5: Barrel export (se aplicável)

```
Onde está o componente?
├─ src/frontend/components/ui/   → SIM, atualizar barrel (se index.ts existir)
├─ src/frontend/components/<dom>/→ SIM, criar/atualizar barrel
├─ src/frontend/pages/           → NÃO (import direto)
```

Se barrel necessário:

```typescript
// src/frontend/components/<localização>/index.ts
export { NomeComponente } from './NomeComponente';
```

---

// turbo

## Fase 6: Validação estrutural + Quality Gate

```bash
# Validar que o arquivo está no local correto
npm run validate:structure

# Quality gate completo
npm run verify
```

Ambos devem passar. Se `validate:structure` reclamar → o arquivo está no local errado. Consultar `PLACEMENT_RULES.md`.

---

## Fase 7: Uso correto

Consumidores importam via barrel (quando disponível):

```tsx
// ✅ CORRETO — via barrel
import { NomeComponente } from '../../components/<dominio>';

// ❌ ERRADO — path direto quando barrel existe
import { NomeComponente } from '../../components/<dominio>/NomeComponente';
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
