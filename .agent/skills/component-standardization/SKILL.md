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

// 1. Interface — SEMPRE PascalCase + sufixo Props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

// 2. Lookup tables — FORA do componente (evita recriação a cada render)
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

// 3. Componente — defaults na desestruturação, ...rest no elemento raiz
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '', // className passthrough OBRIGATÓRIO
  ...rest // rest spread OBRIGATÓRIO
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        rounded-lg transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `.trim()}
      data-testid="btn-action"
      {...rest} // ← rest spread no elemento raiz
    >
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
}
```

> **Para inputs/form elements:** usar `forwardRef` para permitir ref forwarding:
>
> ```tsx
> export const Input = forwardRef<HTMLInputElement, InputProps>(
>   ({ label, error, className = '', ...rest }, ref) => (
>     <input ref={ref} className={className} {...rest} />
>   ),
> );
> ```

### Checklist de Qualidade por Componente

- [ ] 1 componente = 1 arquivo (sem múltiplos componentes por arquivo)
- [ ] Props tipadas com TypeScript strict (sem `any`)
- [ ] Props extends HTML attributes quando aplicável (`extends HTMLAttributes<HTMLDivElement>`)
- [ ] Variantes via `Record<string, string>` fora do corpo da função (não ifs)
- [ ] Tokens do design system (nunca hardcoded)
- [ ] `className = ''` na desestruturação (passthrough obrigatório)
- [ ] `...rest` spread no elemento raiz (permite attrs HTML nativos)
- [ ] `forwardRef` para inputs/form elements
- [ ] `data-testid` em componentes interativos
- [ ] Acessibilidade básica (role, aria-label, tabIndex)
- [ ] Transição suave em hover/focus (`transition-colors duration-150`)
- [ ] Named export (`export function X`) para componentes e hooks
- [ ] Barrel export atualizado em `index.ts` do diretório pai

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

---

## 8. Acessibilidade (a11y) — Obrigatório para Todo Componente Interativo

> Um ERP que não é acessível é um ERP que exclui usuários.
> Toda interação deve funcionar: mouse, teclado, leitor de tela.

### Regras Universais

| Regra                          | Implementação                                  | Quando                  |
| ------------------------------ | ---------------------------------------------- | ----------------------- |
| Botão sem texto visível        | `aria-label="Descrição da ação"`               | Botões com apenas ícone |
| Input de formulário            | Prop `label` + `<label htmlFor>` internamente  | **Todos** os inputs     |
| Imagem decorativa              | `aria-hidden="true"`                           | Ícones ilustrativos     |
| Imagem informativa             | `alt="Descrição relevante"`                    | Logos, gráficos, fotos  |
| Elemento clicável (não-button) | `role="button"` + `tabIndex={0}` + `onKeyDown` | Divs com onClick        |
| Links visuais                  | `<a>` ou `<Link>` com texto descritivo         | Nunca "clique aqui"     |

### Focus Management

| Cenário             | Implementação                                 |
| ------------------- | --------------------------------------------- |
| Modal/Dialog aberto | Focus trap: foco fica preso dentro do modal   |
| Modal fechado       | Retornar foco ao elemento que abriu o modal   |
| Dropdown aberto     | Foco no primeiro item; Escape fecha e retorna |
| Toast/Notificação   | `role="alert"` + `aria-live="polite"`         |
| Loading state       | `aria-busy="true"` no container que carrega   |
| Conteúdo dinâmico   | `aria-live="polite"` em regiões que atualizam |

### Keyboard Navigation

| Tecla             | Comportamento esperado                    |
| ----------------- | ----------------------------------------- |
| `Tab`             | Navega para o próximo elemento interativo |
| `Shift+Tab`       | Navega para o anterior                    |
| `Enter` / `Space` | Ativa botões e links                      |
| `Escape`          | Fecha modais, dropdowns, popups           |
| `Arrow Up/Down`   | Navega em listas, selects, menus          |
| `Home` / `End`    | Vai ao primeiro/último item de lista      |

```tsx
// Padrão para elementos clicáveis não-nativos
<div
  role="button"
  tabIndex={0}
  onClick={handleAction}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAction();
    }
  }}
>
```

### Padrões ARIA para Componentes ERP

| Componente             | ARIA obrigatório                                                        |
| ---------------------- | ----------------------------------------------------------------------- |
| **DataTable**          | `role="grid"`, `aria-label="Nome da tabela"`, headers com `scope="col"` |
| **Select customizado** | `role="listbox"` no container, `role="option"` nos filhos               |
| **Tabs**               | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`      |
| **Modal**              | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` com título      |
| **Badge/Status**       | `aria-label` descritivo (ex: "Status: Aprovado", não apenas cor)        |
| **Tooltip**            | `role="tooltip"`, `aria-describedby` no elemento trigger                |
| **Accordion**          | `aria-expanded`, `aria-controls` no header                              |
| **Skeleton/Loading**   | `aria-busy="true"`, `aria-label="Carregando dados"`                     |
| **EmptyState**         | `role="status"`, texto descritivo para screen reader                    |

### Contraste de Cores

- Usar **apenas** tokens da paleta do design system (garantem WCAG AA: ratio ≥ 4.5:1)
- **Nunca** transmitir informação apenas por cor: StatusBadge deve ter ícone + texto + cor
- Testar com Chrome DevTools → Rendering → Emulate vision deficiencies

### Regra de Ouro

> **Proibido:** Componente interativo sem **nenhum** mecanismo de acessibilidade.
> Se não sabe qual ARIA usar → comece com semantic HTML (`<button>`, `<input>`, `<select>`).
> HTML semântico já é acessível por padrão. Só use ARIA para preencher lacunas.

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
