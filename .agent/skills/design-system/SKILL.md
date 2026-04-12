---
name: design-system
description: Referência completa do Design System do Nexus-Arqui. Paleta, tipografia, espaçamento, forma, elevação, z-index, classes de estado, animações. Consultar ao criar/editar qualquer componente UI.
skills:
  - frontend-design
  - tailwind-patterns
version: 1.0
priority: HIGH
---

# Design System — Nexus-Arqui

> **Consulta obrigatória** ao criar ou editar qualquer componente UI.
> Tokens canônicos: `tailwind.config.cjs` → `theme.extend`
> CSS vars e classes de estado: `src/frontend/index.css`

---

## Quando Ativar

- Criando ou editando componente React visual
- Aplicando cores, espaçamentos, tipografia
- Adicionando estados interativos (hover, focus, disabled)
- Escolhendo sombras, bordas ou border-radius
- Revisando contraste e acessibilidade visual

---

## 1. Paleta de Cores

> **Regra absoluta:** Nunca hex/rgb hardcoded. Sempre token semântico.

### Cores de Marca

| Token                | Hex Base | Uso Principal                                |
| -------------------- | -------- | -------------------------------------------- |
| `primary` (50–900)   | —        | Sidebar, títulos, botões primários           |
| `secondary` (50–900) | —        | Botões secondários, elementos complementares |
| `accent` / `accent2` | —        | Destaques, links, focus rings, indicadores   |

### Cores Semânticas de Superfície

| Token        | Uso                                     |
| ------------ | --------------------------------------- |
| `surface`    | Background de cards, modais, containers |
| `background` | Background geral da aplicação           |
| `border`     | Bordas, divisores, separadores          |
| `hover`      | Background sutil em hover de listas     |

### Cores de Texto

| Token            | Uso                                         |
| ---------------- | ------------------------------------------- |
| `text-primary`   | Texto principal (títulos, corpo importante) |
| `text-secondary` | Texto secundário (labels, subtítulos)       |
| `text-muted`     | Texto discreto (placeholders, metadados)    |

### Status Semânticos

| Status  | Tokens (bg / border / text)                  | Uso                              |
| ------- | -------------------------------------------- | -------------------------------- |
| Sucesso | `emerald-50` / `emerald-200` / `emerald-700` | Operações concluídas, aprovações |
| Aviso   | `amber-50` / `amber-200` / `amber-700`       | Pendências, alertas brandos      |
| Erro    | `red-50` / `red-200` / `red-700`             | Erros, rejeições, validação      |
| Info    | `sky-50` / `sky-200` / `sky-700`             | Informações neutras              |

### Tabela Proibido → Usar

| ❌ Proibido                       | ✅ Usar                                        |
| --------------------------------- | ---------------------------------------------- |
| `#XXXXXX` (hex hardcoded)         | Token da paleta (`text-primary`, `bg-surface`) |
| `rgb(...)` / `hsl(...)`           | Token da paleta                                |
| `bg-blue-600` (Tailwind genérico) | `bg-primary` (token semântico do projeto)      |
| `text-white` em cards             | `text-primary-content` ou token do tema        |
| `border-slate-200`                | `border-border`                                |
| `bg-white` em cards               | `bg-surface`                                   |
| `bg-gray-100`                     | `bg-background` ou `bg-hover`                  |

---

## 2. Tipografia

> Fonte principal definida no `tailwind.config.cjs` → `fontFamily`.

| Token                | Tamanho                 | Peso | Uso                             |
| -------------------- | ----------------------- | ---- | ------------------------------- |
| `text-page-title`    | clamp(1.75rem–2.5rem)   | 800  | Título principal da página      |
| `text-section-title` | clamp(1.05rem–1.25rem)  | 700  | Títulos de seções, cards        |
| `text-body`          | clamp(0.81rem–0.875rem) | 400  | Texto corrido, parágrafos       |
| `text-caption`       | 0.75rem                 | 600  | Labels, tags, metadados, badges |
| `text-stat`          | clamp(1.5rem–1.875rem)  | 800  | Valores de KPI/dashboard        |

### Regra

- **NUNCA** combinar manualmente `text-xl font-bold` se um token semântico existe.
- Se precisar de um novo estilo tipográfico → criar token em `tailwind.config.cjs`.

---

## 3. Espaçamento

> Sempre usar escala Tailwind (múltiplos de 4px). Nunca valores arbitrários.

| Token               | Valor           | Uso                           |
| ------------------- | --------------- | ----------------------------- |
| `page-x` / `page-y` | 2rem (p-8)      | Padding de conteúdo de página |
| `section-gap`       | 2rem (gap-8)    | Entre seções da página        |
| `card-gap`          | 1rem (gap-4)    | Entre cards em grid           |
| `field-gap`         | 1.25rem (gap-5) | Entre campos de formulário    |

### Tabela Proibido → Usar

| ❌ Proibido                               | ✅ Usar                             |
| ----------------------------------------- | ----------------------------------- |
| `p-[13px]` / `mt-[7px]`                   | Escala Tailwind: `p-3`, `mt-2`      |
| Espaçamento arbitrário fora da escala 4px | Múltiplos: 4, 8, 12, 16, 20, 24, 32 |

---

## 4. Forma e Elevação

### Border Radius

| Token           | Valor | Uso                               |
| --------------- | ----- | --------------------------------- |
| `rounded-ui`    | 12px  | Botões, inputs, badges, tags      |
| `rounded-card`  | 16px  | Cards, modais, alertas            |
| `rounded-panel` | 24px  | Hero sections, containers grandes |

### Sombras

| Token            | Uso                             |
| ---------------- | ------------------------------- |
| `shadow-soft`    | Repouso (cards, painéis)        |
| `shadow-lift`    | Hover interativo (card elevado) |
| `shadow-overlay` | Modais, dropdowns, popovers     |

### Tabela Proibido → Usar

| ❌ Proibido                           | ✅ Usar                       |
| ------------------------------------- | ----------------------------- |
| `rounded-lg` / `rounded-xl` (generic) | `rounded-ui` / `rounded-card` |
| `shadow-sm` / `shadow-md` (generic)   | `shadow-soft` / `shadow-lift` |
| `rounded-[7px]` (arbitrary)           | Token da escala               |
| `style={{ boxShadow: '...' }}`        | Classe Tailwind               |

---

## 5. Z-Index (Camadas)

| Token        | Valor | Camada                        |
| ------------ | ----- | ----------------------------- |
| `z-base`     | 0     | Fluxo normal de documento     |
| `z-raised`   | 10    | Cards com hover, FABs         |
| `z-dropdown` | 20    | Menus, tooltips, popovers     |
| `z-sticky`   | 30    | Headers fixos, barras de ação |
| `z-overlay`  | 40    | Backdrops de modal            |
| `z-modal`    | 50    | Modais e dialogs              |
| `z-toast`    | 60    | Notificações, toasts          |

> **Regra:** Nunca usar `z-[999]` ou valores arbitrários. Usar a escala.

---

## 6. Classes de Estado Interativo

> Definidas em `src/frontend/index.css` (se usar `@layer components`) ou diretamente via Tailwind.
> Todo componente interativo **deve** usar as classes de estado padronizadas.

| Classe / Padrão                                   | Substitui                          | Comportamento                |
| ------------------------------------------------- | ---------------------------------- | ---------------------------- |
| `transition-colors duration-150`                  | `transition-all duration-200`      | Transição padrão controlada  |
| Focus ring do projeto                             | `focus:ring-2 focus:ring-blue-500` | Focus visible ring com token |
| `disabled:opacity-50 disabled:cursor-not-allowed` | Variações de disabled              | Estado desabilitado padrão   |
| `active:scale-[0.97]`                             | Click feedback                     | Micro-feedback tátil         |
| `hover:shadow-lift hover:-translate-y-0.5`        | Hover em cards                     | Elevação suave               |
| `hover:bg-hover`                                  | Hover em listas/linhas             | Background sutil             |

### Tabela Proibido → Usar

| ❌ Proibido                                | ✅ Usar                                         |
| ------------------------------------------ | ----------------------------------------------- |
| `transition-all` (muito amplo)             | `transition-colors` ou `transition-transform`   |
| `duration-200` / `duration-300` arbitrário | `duration-150` (padrão do projeto)              |
| `focus:outline-none` sozinho               | Adicionar focus ring visível (a11y obrigatório) |

---

## 7. Animações

| Classe / Padrão                | Duração   | Uso                             |
| ------------------------------ | --------- | ------------------------------- |
| `animate-enter` / `animate-in` | 500ms     | Entrada de página/overlay       |
| `animate-fade-in`              | 300ms     | Aparecimento suave de elementos |
| `animate-slide-in-right`       | 350ms     | Sidebar, painéis laterais       |
| `animate-slide-in-up`          | 300ms     | Toasts, notificações bottom-up  |
| `animate-scale-in`             | 200ms     | Dropdowns, menus popover        |
| `animate-pulse` (Tailwind)     | 1.5s loop | Skeleton loaders                |

### Easing

| ❌ Proibido               | ✅ Usar                                         |
| ------------------------- | ----------------------------------------------- |
| `ease-in-out` genérico    | `ease-out` para entradas, `ease-in` para saídas |
| Sem easing (linear) em UI | Sempre usar curva de aceleração                 |

---

## 8. Ícones

| Biblioteca                               | Pattern de uso               |
| ---------------------------------------- | ---------------------------- |
| Phosphor Icons (`@phosphor-icons/react`) | Import direto em componentes |
| Lucide React (`lucide-react`)            | Import direto em componentes |

> **Nota:** Diferente de projetos com icon registry, no Nexus-Arqui o import direto é permitido.
> Se no futuro um icon registry for adotado, esta seção será atualizada.

---

## 9. Dados Ausentes / Fallback

| Cenário              | Correto                                 | Errado                     |
| -------------------- | --------------------------------------- | -------------------------- |
| Campo sem valor      | `user.name ?? '—'`                      | Esconder o campo           |
| Número ausente       | `'—'`                                   | `0` (que parece dado real) |
| Lista vazia          | Componente `<EmptyState />`             | Nada visível               |
| Erro de carregamento | Mensagem de erro clara                  | Tela em branco             |
| Runtime              | Nunca exibir `undefined`, `null`, `NaN` | —                          |

---

## 10. Regra de Ouro

> **Se um token semântico existe — use-o.**
> Nunca reconstruir o que já está abstraído no design system.
> Tokens existem para garantir consistência visual mesmo quando o agente muda entre sessões.

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
