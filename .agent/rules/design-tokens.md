---
trigger: always_on
description: Regra de tokens visuais — proibições de hardcoded values em cores, espaçamento, tipografia, elevação e forma. Garante consistência visual via design system.
globs:
  - 'src/frontend/**/*.tsx'
  - 'src/frontend/**/*.ts'
  - 'src/frontend/**/*.css'
---

# Design Tokens — Nexus-Arqui

> **Regra absoluta:** Todo valor visual DEVE vir dos tokens definidos no design system.
> Hardcoded values são proibidos. Tokens existem para garantir consistência entre agentes e sessões.
> Fonte de verdade: `tailwind.config.cjs` → `theme.extend`

---

## Cores — SEMPRE via token semântico

```tsx
// ❌ ERRADO — hardcoded
<div className="bg-[#8B4513] text-[#fff]">

// ❌ ERRADO — Tailwind genérico (quebrará se theme mudar)
<div className="bg-blue-600 text-white">

// ✅ CORRETO — token semântico do projeto
<div className="bg-primary text-primary-content">
```

| ❌ Proibido                       | ✅ Usar                                        |
| --------------------------------- | ---------------------------------------------- |
| `#XXXXXX` (hex)                   | Token da paleta (`bg-primary`, `text-primary`) |
| `rgb(...)` / `hsl(...)`           | Token da paleta                                |
| `bg-blue-600` (Tailwind genérico) | `bg-primary`                                   |
| `text-white` em cards             | `text-primary-content`                         |
| `border-slate-200`                | `border-border`                                |
| `bg-white`                        | `bg-surface`                                   |
| `bg-gray-100`                     | `bg-background` / `bg-hover`                   |
| `text-gray-500`                   | `text-muted`                                   |
| `text-gray-900`                   | `text-primary`                                 |
| `text-gray-700`                   | `text-secondary`                               |

---

## Espaçamento — SEMPRE escala Tailwind

| ❌ Proibido                  | ✅ Usar                                  |
| ---------------------------- | ---------------------------------------- |
| `p-[13px]` / `mt-[7px]`      | Escala Tailwind: `p-3`, `mt-2`           |
| Múltiplos fora da escala 4px | Escala: 4, 8, 12, 16, 20, 24, 32, 40, 48 |
| `style={{ margin: '13px' }}` | Classes Tailwind                         |

---

## Tipografia — Tokens do projeto

| ❌ Proibido                           | ✅ Usar                                                |
| ------------------------------------- | ------------------------------------------------------ |
| `text-xl font-bold` combinação manual | Token tipográfico se disponível (`text-section-title`) |
| `font-size: 14px` inline              | `text-sm` ou token tipográfico                         |
| `line-height: 1.5` inline             | `leading-normal`                                       |

---

## Forma e Elevação

| ❌ Proibido                                   | ✅ Usar                                |
| --------------------------------------------- | -------------------------------------- |
| `rounded-[7px]` (arbitrary)                   | `rounded-ui` / `rounded-card`          |
| `shadow-sm` / `shadow-md` (Tailwind genérico) | `shadow-soft` / `shadow-lift`          |
| `style={{ boxShadow: '...' }}`                | Classe Tailwind                        |
| `z-[999]` / `z-[9999]`                        | `z-modal` / `z-toast` (escala z-index) |

---

## Transições e Animações

| ❌ Proibido                                         | ✅ Usar                                         |
| --------------------------------------------------- | ----------------------------------------------- |
| `transition-all` (muito amplo, impacta performance) | `transition-colors` ou `transition-transform`   |
| `duration-200` / `duration-300` arbitrário          | `duration-150` (padrão do projeto)              |
| `focus:outline-none` sozinho                        | Adicionar focus ring visível (a11y obrigatório) |
| Animação sem easing                                 | `ease-out` para entradas, `ease-in` para saídas |

---

## Imports de Estilo

| ❌ Proibido                                     | ✅ Usar                                                       |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `import './Component.css'` (CSS modules ad-hoc) | Tailwind classes no className                                 |
| `style={{ ... }}` inline para layout            | Classes Tailwind                                              |
| `@apply` extensivo                              | Componentes React (usar `@apply` apenas para pseudo-elements) |

---

## Regra de Ouro

> Antes de usar qualquer valor visual, pergunte: **"Existe token para isso?"**
> Se SIM → use o token. Se NÃO → crie o token no `tailwind.config.cjs` e então use-o.
> Se em dúvida → consulte `.agent/skills/design-system/SKILL.md` para a referência completa.
