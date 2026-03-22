---
name: component-patterns
description: Padrões de composição de componentes React, anti-patterns, e regras de localização. Use ao criar ou editar componentes, definir Props, compor layouts de página ou decidir onde posicionar um componente no Nexus-Arqui.
skills:
  - component-standardization
  - clean-code
  - design-system
---

# Component Patterns — Nexus-Arqui

> Complementa `component-standardization` (que cobre auditoria e a11y).
> Este skill foca em **composição, localização e anti-patterns**.
> Stack: React 18 + TypeScript strict + TailwindCSS v3.

---

## Quando Ativar

- Criando novo componente reutilizável
- Editando interface de Props
- Adicionando variantes a componente existente
- Compondo layout de nova página
- Decidindo onde posicionar um componente (ui/ vs pages/ vs domain)
- Atualizando barrel exports

---

## 1. Anatomia Obrigatória de Componente UI

```tsx
// src/frontend/components/ui/CardExample.tsx

// 1. Imports
import type { HTMLAttributes } from 'react';

// 2. Interface — SEMPRE PascalCase + sufixo Props
interface CardExampleProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted';
  hoverable?: boolean;
}

// 3. Lookup tables — FORA do componente (evita re-render)
const VARIANT_STYLES: Record<string, string> = {
  default: 'bg-surface border-border',
  muted: 'bg-background border-transparent',
};

// 4. Componente — named export com function declaration
export function CardExample({
  variant = 'default', // defaults na desestruturação
  hoverable = false,
  className = '', // className passthrough OBRIGATÓRIO
  children,
  ...rest // rest spread OBRIGATÓRIO
}: CardExampleProps) {
  return (
    <div
      className={`
        rounded-card border shadow-soft
        ${VARIANT_STYLES[variant]}
        ${hoverable ? 'transition-colors duration-150 hover:shadow-lift cursor-pointer' : ''}
        ${className}
      `.trim()}
      data-testid="card-example"
      {...rest}
    >
      {children}
    </div>
  );
}
```

### Regras da Anatomia

| #   | Regra                                                  | Obrigatório |
| --- | ------------------------------------------------------ | ----------- |
| 1   | 1 componente = 1 arquivo                               | Sim         |
| 2   | Props com defaults na desestruturação                  | Sim         |
| 3   | `className` passthrough                                | Sim         |
| 4   | `...rest` spread no elemento raiz                      | Sim         |
| 5   | Tokens semânticos (nunca valores hardcoded)            | Sim         |
| 6   | Lookup tables fora do componente (quando há variantes) | Sim         |
| 7   | `forwardRef` para inputs/form elements                 | Sim         |
| 8   | `data-testid` em componentes interativos               | Sim         |
| 9   | Barrel export atualizado                               | Sim         |
| 10  | Named export (`export function X`)                     | Sim         |

---

## 2. Localização de Componentes

### Árvore de Decisão: "Onde coloco este componente?"

```
É usado por mais de 1 página?
├─ SIM → src/frontend/components/ui/ (primitivo reutilizável)
│        ou src/frontend/components/{domínio}/ (componente de domínio)
│
│        É puramente visual (sem lógica de negócio)?
│        ├─ SIM → src/frontend/components/ui/
│        └─ NÃO → src/frontend/components/{domínio}/
│
└─ NÃO → src/frontend/pages/{rota}/components/
          Se no futuro outra página precisar dele:
          → MOVER para components/ui/ (não duplicar)
```

### Tabela de localização

| Tipo                   | Caminho                                 | Quando                               |
| ---------------------- | --------------------------------------- | ------------------------------------ |
| Primitivo reutilizável | `src/frontend/components/ui/`           | Button, Card, Input, Badge, Table    |
| Componente de domínio  | `src/frontend/components/{domínio}/`    | ClientCard, ProposalForm, GanttChart |
| Privado de página      | `src/frontend/pages/{rota}/components/` | Usado apenas naquela rota            |
| Layout estrutural      | `src/frontend/components/layout/`       | MainLayout, Header, Sidebar          |

### Proibições de localização

| Proibido                              | Motivo                         | Correto                       |
| ------------------------------------- | ------------------------------ | ----------------------------- |
| Componente reutilizável em `pages/`   | Invisível para outras rotas    | Mover para `components/ui/`   |
| Hook em `components/ui/`              | Quebra hierarquia              | Mover para `hooks/`           |
| Componente duplicado entre páginas    | Sinal de extração necessária   | Extrair para `components/ui/` |
| Componente sem barrel export em `ui/` | Impossível importar via barrel | Adicionar ao `index.ts`       |

---

## 3. Composição de Página — Padrão Obrigatório

Toda página no Nexus-Arqui deve seguir esta estrutura de composição:

```tsx
// src/frontend/pages/{dominio}/{feature}/{FeaturePage}.tsx
import { useState } from 'react';
import { useFeatureData } from './useFeatureData'; // hook da feature

export function FeaturePage() {
  // 1. Hooks no topo
  const { data, isLoading } = useFeatureData();

  // 2. Handlers
  const handleAction = () => { /* ... */ };

  // 3. Render: composição de componentes, NUNCA UI inline
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="..." value="..." />
      </div>

      {/* Seção principal */}
      <CardShell>
        <SectionHeader title="..." action={<Button size="sm">Ação</Button>} />
        <Table columns={[...]} data={data} />
      </CardShell>
    </div>
  );
}
```

### Regras de composição

1. **Importar, nunca reconstruir** — Se um componente existe em `ui/`, use-o
2. **Hooks no topo** — Estado e lógica antes do return
3. **Handlers antes do render** — Funções de evento declaradas antes do JSX
4. **Sem JSX inline extenso** — Se um bloco de JSX tem >15 linhas, extraia componente
5. **Sem lógica de negócio no render** — Lógica em hooks ou services

---

## 4. Anti-Patterns (Proibido)

| ❌ Não faça                               | ✅ Faça                                                          |
| ----------------------------------------- | ---------------------------------------------------------------- |
| Componente que recebe 15+ props           | Decomponha em subcomponentes                                     |
| Props `style` inline                      | Use className + tokens Tailwind                                  |
| Componente que sabe de regra de negócio   | Regra vai em service/hook, componente recebe dados               |
| Cores hex/rgb no JSX                      | Use classes semânticas do theme                                  |
| Copiar JSX de uma página para outra       | Extraia para `src/frontend/components/`                          |
| `if/else` inline para variantes de estilo | Lookup table `Record<string, string>` fora do componente         |
| `<div>` wrapper sem propósito             | Use Fragment `<>...</>` ou componente semântico                  |
| `export default function`                 | Use `export function` (named export)                             |
| Múltiplos componentes por arquivo         | 1 componente = 1 arquivo                                         |
| Props genéricas (`data`, `value`, `item`) | Nomes que revelam intenção (`clientProposals`, `monthlyRevenue`) |

---

## 5. Regras de Variantes

Quando um componente tem variantes visuais (estilo, tamanho, status):

```tsx
// ✅ CORRETO — lookup table FORA do componente
const SIZE_STYLES: Record<Required<ButtonProps>['size'], string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

// ❌ ERRADO — if/else inline
const getSize = (size: string) => {
  if (size === 'sm') return 'px-3 py-1.5 text-xs';
  if (size === 'md') return 'px-4 py-2 text-sm';
  return 'px-6 py-3 text-base';
};
```

### Regras

1. **Lookup tables para variantes visuais** — `Record<VariantType, string>`
2. **UPPER_SNAKE_CASE** para constantes de lookup
3. **Declarar FORA** da função do componente (evita recriação a cada render)
4. **Tipar com `Required<Props>['variant']`** para type safety

---

## 6. Barrel Export — Checklist

Ao criar novo componente em `src/frontend/components/ui/`:

```
1. Criar arquivo: src/frontend/components/ui/{NomeComponente}.tsx
2. Verificar se index.ts existe no diretório pai
3. Adicionar export no barrel:
   export { NomeComponente } from './{NomeComponente}';
4. Consumidores importam via barrel:
   import { NomeComponente } from '../../components/ui';
```

> **NUNCA** importar componente UI via path direto quando barrel existe.
>
> ```tsx
> // ❌ import { Button } from '../../components/ui/Button';
> // ✅ import { Button } from '../../components/ui';
> ```
