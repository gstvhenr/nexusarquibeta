---
name: tailwind-patterns
description: TailwindCSS v3 patterns para o Nexus-Arqui (React 18 + Vite + TailwindCSS 3.4).
allowed-tools: Read, Write, Edit, Glob, Grep
---

# TailwindCSS Patterns — Nexus-Arqui

> Stack: **TailwindCSS v3.4** (não v4). Configuração via `tailwind.config.js`, não CSS-first.
> Projeto usa dark mode via classe `.dark`.

---

## 1. Arquitetura v3 (atual do projeto)

| Conceito          | Como é no v3                                         |
| ----------------- | ---------------------------------------------------- |
| **Config**        | `tailwind.config.js` (JavaScript)                    |
| **Dark mode**     | `darkMode: 'class'` — toggle via `.dark` no `<html>` |
| **JIT**           | Habilitado por padrão desde v3                       |
| **Purge/Content** | `content: ['./src/**/*.{ts,tsx}']`                   |

```javascript
// tailwind.config.js (v3)
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        /* tokens customizados */
      },
    },
  },
};
```

> ⚠️ **NOT v4**: Não use `@theme {}` ou `@import "tailwindcss"` — são diretivas v4 que quebram o build.

---

## 2. Sistema de Cores (tokens do projeto)

Use sempre tokens semânticos, nunca cores hardcoded:

```tsx
// ❌ ERRADO — cor hardcoded
<div className="bg-[#1a2b3c] text-[#ffffff]">

// ✅ CORRETO — token do design system
<div className="bg-gray-900 dark:bg-gray-950 text-white">
```

| Camada        | Exemplo v3                            |
| ------------- | ------------------------------------- |
| **Primitive** | `gray-900`, `blue-600`                |
| **Semantic**  | Defines via `extend.colors` no config |
| **Dark mode** | `dark:bg-gray-950 dark:text-gray-100` |

---

## 3. Layout — Padrões do ERP

### Sidebar + Content (layout principal)

```tsx
<div className="flex h-screen overflow-hidden">
  <aside className="w-64 shrink-0 bg-gray-900 dark:bg-gray-950">{/* Sidebar */}</aside>
  <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">{/* Content */}</main>
</div>
```

### Card de Dados

```tsx
<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
```

### Grid Responsivo (tabelas/listagens)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 4. Dark Mode

| Elemento       | Light                     | Dark                   |
| -------------- | ------------------------- | ---------------------- |
| Background     | `bg-white` / `bg-gray-50` | `dark:bg-gray-900`     |
| Surface        | `bg-gray-100`             | `dark:bg-gray-800`     |
| Text primary   | `text-gray-900`           | `dark:text-gray-100`   |
| Text secondary | `text-gray-500`           | `dark:text-gray-400`   |
| Border         | `border-gray-200`         | `dark:border-gray-700` |

---

## 5. Spacing — Escala do Design System

Use múltiplos de 4px (escala Tailwind):

| Token | px   | Classes        |
| ----- | ---- | -------------- |
| xs    | 4px  | `p-1`, `gap-1` |
| sm    | 8px  | `p-2`, `gap-2` |
| md    | 16px | `p-4`, `gap-4` |
| lg    | 24px | `p-6`, `gap-6` |
| xl    | 32px | `p-8`, `gap-8` |

> ❌ Nunca: `p-[13px]`, `mt-[7px]` — spacing arbitrário quebra consistência.

---

## 6. Animações e Transições

```tsx
// Hover state
<button className="transition-colors duration-150 hover:bg-blue-700 active:bg-blue-800">

// Fade in
<div className="transition-opacity duration-200 opacity-0 data-[visible=true]:opacity-100">
```

> Animate apenas `transform` e `opacity` para performance.

---

## 7. Anti-Patterns

| ❌ Don't                    | ✅ Do                               |
| --------------------------- | ----------------------------------- |
| Hex/rgb arbitrários         | Use tokens da escala Tailwind       |
| `!important`                | Resolva especificidade corretamente |
| Classes duplicadas longas   | Extraia componente React            |
| Misturar v3 e v4 sintaxe    | Permaneça em v3                     |
| `@apply` em excesso         | Prefira componentes React           |
| `style={{ color: '#fff' }}` | Use classes Tailwind                |
