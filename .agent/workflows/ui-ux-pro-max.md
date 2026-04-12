---
description: Plan and implement UI/UX for the Nexus-Arqui ERP. Design system generation and component implementation.
---

# /ui-ux-pro-max - Design e Implementação de UI

$ARGUMENTS

---

## Propósito

Workflow de design inteligente para o ERP Nexus-Arqui. Usa a skill `ui-ux-pro-max` para gerar sistemas de design completos e implementar componentes React com TailwindCSS.

---

## Contexto do ERP (SEMPRE considerar)

| Aspecto    | Decisão                                      |
| ---------- | -------------------------------------------- |
| Audiência  | B2B interno — arquitetos e gestores          |
| Prioridade | Densidade de informação > estética dramática |
| Dark mode  | Class-based (`.dark`) — suporte obrigatório  |
| Stack      | React 18 + TailwindCSS v3.4 (não v4)         |
| Purple Ban | Sem violet/purple — sem exceções             |

---

## Passo 1: Ativar skill de design

Antes de qualquer implementação de UI, chamar a skill:

```
Usar skill ui-ux-pro-max:
Query: "[tipo de componente] [contexto] [keywords visuais]"
```

**Exemplos de query:**

```
"ERP dashboard financeiro professional dark"         → Dashboard
"data table projects list compact professional"      → Tabela de dados
"form inputs clean professional sidebar dark"        → Formulário
"card proposal status indicator b2b dark"            → Card de proposta
```

---

## Passo 2: Aplicar Design System

Com base no output da skill, implementar com:

### Escala de Espaçamento (sempre múltiplos de 4px)

```
p-2 (8px) · p-4 (16px) · p-6 (24px) · p-8 (32px)
```

### Tokens de Cor (dark mode obrigatório)

```
bg-gray-900 / dark:bg-gray-950       → Background
bg-white / dark:bg-gray-800          → Surface/Card
text-gray-900 / dark:text-gray-100   → Text primary
text-gray-500 / dark:text-gray-400   → Text secondary
border-gray-200 / dark:border-gray-700 → Border
bg-blue-600 / dark:bg-blue-500       → Accent/CTA
```

---

## Passo 3: Implementar Componente React

```typescript
// ✅ Padrão Nexus-Arqui
function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-800 p-4 shadow-sm
                    transition-shadow hover:shadow-md">
      {/* Conteúdo */}
    </div>
  );
}
```

---

## Checklist Pré-Entrega (UI)

### Visual

- [ ] Sem cores hardcoded — usar tokens Tailwind
- [ ] Dark mode funciona (`.dark` class)
- [ ] Sem violet/purple (Purple Ban ativo)
- [ ] Espaçamento na escala de 4px

### Interação

- [ ] Hover states com feedback visual
- [ ] Transições suaves (`transition-colors duration-150`)
- [ ] Elementos clicáveis com `cursor-pointer`
- [ ] Focus visible para navegação por teclado

### Acessibilidade

- [ ] Imagens com `alt`
- [ ] Inputs com `label` associado
- [ ] Contraste WCAG AA mínimo (4.5:1)

### React

- [ ] Sem React.FC — função normal tipada
- [ ] `npm run verify` verde

---

## Anti-Patterns (ERP Context)

| ❌ Evite                            | Por quê                                  |
| ----------------------------------- | ---------------------------------------- |
| Hero sections dramáticas            | Não é landing page                       |
| Cores violet/purple                 | Purple Ban ativo                         |
| `@theme {}` no CSS                  | Diretiva TailwindCSS v4 — projeto usa v3 |
| Espaçamento arbitrário (`p-[13px]`) | Quebra consistência                      |
| Emojis como ícones                  | Use SVG (Lucide, Heroicons)              |
| Efeitos decorativos sem função      | Priorize eficiência                      |

---

## Exemplos de Uso

```
/ui-ux-pro-max nova tela de relatórios financeiros
/ui-ux-pro-max melhorar cards de Propostas
/ui-ux-pro-max redesenhar sidebar de navegação
/ui-ux-pro-max criar componente de filtros avançados
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
