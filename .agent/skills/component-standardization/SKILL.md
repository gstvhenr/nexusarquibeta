---
name: component-standardization
description: Auditoria de componentizacao e extracao de primitivos UI reutilizaveis. Padronizacao visual, design tokens, e catalogo de componentes base para garantir identidade visual consistente e manutenibilidade.
allowed-tools: Read, Write, Edit, Glob, Grep
skills:
  - frontend-design
  - tailwind-patterns
  - clean-code
version: 1.0
priority: HIGH
---

# Component Standardization — Nexus-Arqui

> **Skill de padronização fronted profunda.** Audita, extrai e padroniza componentes UI reutilizáveis.
> Stack: React 18 + TypeScript strict + TailwindCSS v3 + Design Tokens via CSS vars.

---

## Quando usar esta skill

| Trigger                          | Ação                                                  |
| -------------------------------- | ----------------------------------------------------- |
| Padrão UI repetido em 2+ páginas | Extrair componente compartilhado                      |
| Nova página/feature              | Verificar se primitivos existem antes de criar inline |
| Drift visual detectado           | Consolidar para componente base                       |
| Comando `/componentize`          | Executar workflow completo                            |

---

## 1. Anatomia de Componentes — Pirâmide de Reutilização

```text
┌─────────────────────────────────────────┐
│          PAGES (src/pages/)             │  ← Composição e orquestração
│   Importam componentes, não definem UI  │
├─────────────────────────────────────────┤
│     DOMAIN COMPONENTS (src/components/) │  ← Lógica de domínio + UI
│   ClientCard, ProposalForm, GanttChart  │
├─────────────────────────────────────────┤
│      PRIMITIVES (src/components/ui/)    │  ← Reutilizáveis, sem lógica
│   Button, Card, Input, Badge, Table     │
├─────────────────────────────────────────┤
│        DESIGN TOKENS (src/theme.ts)     │  ← Cores, espaçamento, sombras
│   tailwind.config.cjs + CSS vars        │
└─────────────────────────────────────────┘
```

### Regra de ouro

> **Páginas NÃO devem conter JSX de UI genérica inline.**
> Se um elemento visual (card, botão, badge, input, tabela) aparece em mais de 1 lugar, ele é um candidato a primitivo.

---

## 2. Catálogo de Primitivos Obrigatórios

Componentes base que todo projeto maduro deve ter em `src/components/ui/`:

| Primitivo           | Arquivo               | Props mínimas                                       | Status esperado |
| ------------------- | --------------------- | --------------------------------------------------- | --------------- |
| **Button**          | `Button.tsx`          | `variant`, `size`, `disabled`, `loading`, `onClick` | ✅ Existe       |
| **CardShell**       | `CardShell.tsx`       | `className`, `children`, `glow`                     | ✅ Existe       |
| **Input**           | `Input.tsx`           | `label`, `error`, `helper`, `type`                  | ✅ Existe       |
| **Select**          | `Select.tsx`          | `label`, `options`, `error`                         | ✅ Existe       |
| **Badge**           | `Badge.tsx`           | `variant`, `size`, `children`                       | ✅ Existe       |
| **Table**           | `Table.tsx`           | `columns`, `data`, `sortable`                       | ✅ Existe       |
| **Tabs**            | `Tabs.tsx`            | `items`, `active`, `onChange`                       | ✅ Existe       |
| **EmptyState**      | `EmptyState.tsx`      | `icon`, `title`, `description`, `action`            | ✅ Existe       |
| **Skeleton**        | `Skeleton.tsx`        | `width`, `height`, `variant`                        | ✅ Existe       |
| **StatusBadge**     | `StatusBadge.tsx`     | `variant`, `size`, `children`                       | ✅ Existe       |
| **Tooltip**         | `Tooltip.tsx`         | `content`, `children`, `position`                   | ✅ Existe       |
| **Modal**           | `Modal.tsx`           | `isOpen`, `onClose`, `title`, `children`            | ✅ Existe       |
| **LoadingFallback** | `LoadingFallback.tsx` | -                                                   | ✅ Existe       |

> **Atualizar esta tabela** à medida que primitivos forem criados. Marcar ✅.

---

## 3. Processo de Auditoria de Componentização

### Fase 1 — Detecção de Padrões Duplicados

```text
1. Escanear src/pages/ por JSX inline (>15 linhas de UI no render)
2. Para cada padrão encontrado, verificar:
   a. Aparece em 2+ páginas? → Candidato a componente
   b. Tem lógica de domínio? → Domain component (src/components/{domain}/)
   c. É puramente visual? → Primitivo (src/components/ui/)
3. Registrar achados em tabela de auditoria
```

### Fase 2 — Extração e Padronização

```text
Para cada candidato:
1. Definir interface de Props (TypeScript strict)
2. Criar componente em src/components/ui/ ou src/components/{domain}/
3. Usar design tokens do theme.ts (NUNCA hardcoded)
4. Adicionar variantes necessárias (via prop variant/size)
5. Substituir inline em todas as páginas consumidoras
6. Rodar npm run verify após cada extração
```

### Fase 3 — Validação

```text
1. Zero JSX de UI genérica inline nas páginas auditadas
2. Todos os componentes usam tokens do design system
3. npm run verify verde
4. Documentar no NEXT.md
```

---

## 4. Regras de Design Token

### Cores — SEMPRE via token semântico

```tsx
// ❌ ERRADO — hardcoded
<div className="bg-[#8B4513] text-[#fff]">

// ❌ ERRADO — Tailwind genérico (quebrará se theme mudar)
<div className="bg-blue-600 text-white">

// ✅ CORRETO — token semântico do projeto
<div className="bg-primary text-primary-content">
```

### Espaçamento — SEMPRE escala Tailwind (múltiplos de 4px)

```tsx
// ❌ ERRADO
<div className="p-[13px] mt-[7px]">

// ✅ CORRETO
<div className="p-3 mt-2">
```

### Sombras — SEMPRE via token

```tsx
// ❌ ERRADO
<div style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>

// ✅ CORRETO
<div className="shadow-soft">
```

### Raios de borda — SEMPRE via escala

```tsx
// ❌ ERRADO
<div className="rounded-[7px]">

// ✅ CORRETO
<div className="rounded-lg">
```

---

## 5. Padrão de Componente Primitivo

```tsx
// src/components/ui/Button.tsx

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const VARIANT_STYLES: Record<Required<ButtonProps>['variant'], string> = {
  primary: 'bg-primary text-primary-content hover:bg-primary-focus',
  secondary: 'bg-secondary text-secondary-content hover:bg-secondary-focus',
  danger: 'bg-error text-white hover:bg-error/90',
  ghost: 'bg-transparent text-text-primary hover:bg-surface',
};

const SIZE_STYLES: Record<Required<ButtonProps>['size'], string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        rounded-lg transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `.trim()}
    >
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
}
```

### Checklist de Qualidade por Componente

- [ ] Props tipadas com TypeScript strict (sem `any`)
- [ ] Variantes via Record<string, string> (não ifs)
- [ ] Tokens do design system (nunca hardcoded)
- [ ] `className` como prop de escape (customização pontual)
- [ ] Acessibilidade básica (role, aria-label, tabIndex)
- [ ] Transição suave em hover/focus (`transition-colors duration-150`)

---

## 6. Anti-Patterns de Componentização

| ❌ Não faça                             | ✅ Faça                                                 |
| --------------------------------------- | ------------------------------------------------------- |
| Componente que recebe 15+ props         | Decomponha em subcomponentes                            |
| Props `style` inline                    | Use className + tokens Tailwind                         |
| Componente que sabe de regra de negócio | Regra vai em service/hook, componente recebe dados      |
| Cores hex/rgb no JSX                    | Use classes semânticas do theme                         |
| Copiar JSX de uma página para outra     | Extraia para `src/components/`                          |
| `@apply` para tudo                      | Use componentes React, `@apply` só para pseudo-elements |

---

## 7. Barrel File (index.ts) — API Pública

```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';
export { Badge } from './Badge';
export { Modal } from './Modal';
// ... apenas componentes públicos
```

> Consumidores importam via: `import { Button, Card } from '../components/ui';`
