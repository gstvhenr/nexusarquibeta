---
name: frontend-design
description: Design thinking e tomada de decisao para UI web. Use ao projetar componentes, layouts, paletas de cores, tipografia ou criar interfaces esteticas.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Frontend Design — Nexus-Arqui

> ERP b2b interno. Audiência: arquitetos e gestores. Prioridade: **densidade de informação + clareza**.
> Stack: React 18 + TailwindCSS v3 + dark mode via `.dark` class.

---

## 🎯 Selective Reading Rule

| File                                         | When to Read                       |
| -------------------------------------------- | ---------------------------------- |
| [ux-psychology.md](ux-psychology.md)         | 🔴 **SEMPRE** — leia primeiro      |
| [color-system.md](color-system.md)           | Decisões de cor/palette            |
| [typography-system.md](typography-system.md) | Tipografia                         |
| [visual-effects.md](visual-effects.md)       | Glassmorphism, sombras, gradientes |
| [animation-guide.md](animation-guide.md)     | Animações necessárias              |
| [decision-trees.md](decision-trees.md)       | Templates por contexto             |

---

## ⚠️ Contexto do Nexus-Arqui (LEIA ANTES DE PROJETAR)

### Audiência B2B — ERP Interno

| Audiência             | Implicação de design                       |
| --------------------- | ------------------------------------------ |
| Arquitetos e gestores | Professional, data-focused, trust          |
| Uso diário intensivo  | Densidade de informação alta, baixo scroll |
| Dark mode first       | Uso prolongado — menor fadiga visual       |

> 🔴 **Regra:** Este NÃO é um landing page. PRIORIZE eficiência sobre estética dramática.

---

## 1. Hierarchy de Prioridades de Design

```
1. Legibilidade e contraste (WCAG AA mínimo)
2. Densidade de informação adequada
3. Consistência com design system existente
4. Micro-animações de feedback (não decorativas)
5. Efeitos visuais (só se não comprometer 1-4)
```

---

## 2. UX Psychology — Leis Aplicadas ao ERP

| Lei                 | Aplicação                                                |
| ------------------- | -------------------------------------------------------- |
| **Hick's Law**      | Limite opções em formulários, use progressive disclosure |
| **Fitts' Law**      | CTAs primários com hit areas adequadas (min 44px)        |
| **Miller's Law**    | Max 7 itens por grupo / seção                            |
| **Serial Position** | Ações mais comuns primeiro e último em listas            |

---

## 3. Layout Principles

### Grid — ERP

```
Sidebar (fixed) + Content (flex-1):
├── Sidebar: w-64, fixo, bg-gray-900
├── Content: overflow-y-auto, p-6
└── Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
```

### Espaçamento (escala 4px — Tailwind)

```
Tight (intra-elemento): p-2 (8px)
Normal (card padding): p-4 (16px)
Loose (section gap): gap-6 (24px)
XL (entre seções): mt-8 (32px)
```

---

## 4. Color — Tokens do ERP

| Uso                  | Light             | Dark                   |
| -------------------- | ----------------- | ---------------------- |
| Background principal | `bg-gray-50`      | `dark:bg-gray-900`     |
| Surface (card)       | `bg-white`        | `dark:bg-gray-800`     |
| Border               | `border-gray-200` | `dark:border-gray-700` |
| Text primary         | `text-gray-900`   | `dark:text-gray-100`   |
| Text secondary       | `text-gray-500`   | `dark:text-gray-400`   |
| Accent / CTA         | `bg-blue-600`     | `dark:bg-blue-500`     |
| Danger               | `bg-red-600`      | `dark:bg-red-500`      |
| Success              | `bg-green-600`    | `dark:bg-green-500`    |

> 🔴 **Purple Ban ativo** — sem violet/purple no design.

---

## 5. Typography

```
Fonte atual do projeto: Inter (ou system-ui)

Body: text-sm (14px) — dados densos
Headings: text-base → text-xl
Labels: text-xs (12px)
Números financeiros: font-mono, font-medium
```

---

## 6. Animation Principles

```
✅ USE — feedback de interação:
- Hover: transition-colors duration-150
- Loading: animate-pulse em skeletons
- Toast/notificação: transition-opacity duration-200

❌ NÃO USE — decorativas sem propósito:
- Parallax
- Gradientes animados de fundo
- Partículas
```

---

## 7. "Wow Factor" — ERP Checklist

- [ ] Hierarquia visual clara (espaçamento consistente)
- [ ] Estados de loading com skeleton (não spinner cru)
- [ ] Empty states informativos e acionáveis
- [ ] Transições suaves em hover/focus
- [ ] Dados financeiros sempre formatados (`R$ 1.234,56`)
- [ ] Feedback imediato em ações (toast, disabled state)

---

## 8. Anti-Patterns (ERP Context)

| ❌ Evite                      | Por quê                                 |
| ----------------------------- | --------------------------------------- |
| Hero sections dramáticas      | Não é landing page                      |
| Mesh/Aurora gradients         | Distraem da informação                  |
| Bento grids decorativos       | Use apenas onde há dados reais          |
| Dark background + neon glow   | "AI look" — pouco profissional para ERP |
| Cores violet/purple           | Purple Ban ativo                        |
| Espaçamento arbitrário (13px) | Quebra consistência visual              |

---

> **Lembre:** Usuários abrem o ERP para trabalhar. Cada pixel deve servir à eficiência, não à exibição.
