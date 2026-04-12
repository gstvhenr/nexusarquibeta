---
description: Auditoria profunda de componentizacao e extracao de primitivos UI reutilizaveis. Padroniza identidade visual, elimina duplicacao de UI, e garante manutenibilidade.
---

# Workflow: Component Standardization (`/componentize`)

// turbo-all

## Objetivo

Auditar, extrair e padronizar componentes UI reutilizáveis no Nexus-Arqui, eliminando duplicação visual e garantindo identidade estática consistente. Alinhado ao `AGENTS.md`.

## Gatilho de uso

Use quando o comando for `/componentize` ou quando houver necessidade de:

- Extrair elementos visuais repetidos em componentes reutilizáveis
- Criar ou consolidar primitivos UI (`src/components/ui/`)
- Padronizar identidade visual entre páginas
- Auditar pages por UI inline que deveria ser componente

## Pré-flight obrigatório

1. Ler `AGENTS.md`, `ARCHITECTURE.md`, `NEXT.md`.
2. Ler skill `component-standardization` (`.agent/skills/component-standardization/SKILL.md`).
3. Ler skill `frontend-design` (`.agent/skills/frontend-design/SKILL.md`).
4. Rodar `npm run baseline` e confirmar verde.
5. Registrar escopo no PLAN.md: qual tipo de primitivo e quais páginas serão auditadas.
6. Verificar "don't touch list" do `AGENTS.md`.

## Fase 1 — Inventário e Auditoria (diagnóstico)

### 1.1 Inventariar primitivos existentes

```text
Listar tudo em src/components/ui/ → registrar o que já existe
Para cada arquivo: nome, props, variantes, quantas páginas importam
```

### 1.2 Escanear páginas por UI inline

```text
Para cada pasta em src/pages/:
  1. Contar linhas de JSX no render (>15 linhas de UI = flag)
  2. Identificar padrões visuais repetidos:
     - Cards com layout similar
     - Botões com estilos inline
     - Badges/status com cores hardcoded
     - Inputs/selects com label+error repetidos
     - Tabelas com headers similares
  3. Para cada padrão: registrar em qual arquivo aparece
```

### 1.3 Classificar candidatos

| Critério                                  | Classificação               | Destino                    |
| ----------------------------------------- | --------------------------- | -------------------------- |
| Aparece em 3+ páginas + puramente visual  | **Primitivo**               | `src/components/ui/`       |
| Aparece em 2+ páginas + lógica de domínio | **Domain component**        | `src/components/{domain}/` |
| Aparece em 1 página + >30 linhas          | **Subcomponente de página** | Manter na pasta da page    |
| Usa cores/espaçamentos hardcoded          | **Violação de token**       | Corrigir para usar theme   |

### 1.4 Gerar relatório de auditoria

Formato:

```markdown
## Relatório de Auditoria de Componentização

### Primitivos ausentes (alta prioridade)

| Primitivo | Ocorrências inline | Páginas afetadas |
| --------- | ------------------ | ---------------- |
| Button    | 47                 | 12 páginas       |
| Card      | 32                 | 9 páginas        |

...

### Violações de design token

| Arquivo | Linha | Violação | Correção   |
| ------- | ----- | -------- | ---------- |
| ...     | ...   | hex #xxx | bg-primary |

...

### Próximos passos priorizados

1. ...
```

## Fase 2 — Extração (implementação)

### Regras de escopo

- **Max 3 primitivos por sessão** (para manter diffs revisáveis).
- Cada primitivo é um diff isolado e verificável.
- NÃO alterar regra de negócio — apenas mover/consolidar UI.

### Protocolo de extração por primitivo

```text
1. DEFINIR a interface de Props:
   - Analisar TODAS as variantes encontradas na auditoria
   - Unificar em uma interface com variant/size/state
   - TypeScript strict — sem any

2. CRIAR o componente em src/components/ui/:
   - Seguir template da skill component-standardization §5
   - Usar APENAS tokens semânticos do design system
   - Variantes via Record<string, string> (não ifs)
   - className como prop de escape

3. EXPORTAR via barrel file:
   - Adicionar export em src/components/ui/index.ts

4. SUBSTITUIR em todas as páginas consumidoras:
   - Buscar todas as ocorrências inline
   - Trocar por <NomeDoComponente />
   - Verificar que props estão corretas

5. VERIFICAR:
   - npm run typecheck
   - npm run verify
```

### Ordem de prioridade para extração

```text
1. Button (mais reutilizado, maior impacto)
2. Card (container de dados, segundo mais comum)
3. Badge/StatusBadge (status labels, drift visual alto)
4. Input/Select (formulários, repetição alta)
5. EmptyState (UX, padronização de vazio)
6. Table (complexo, fazer por último)
```

## Fase 3 — Consolidação de Design Tokens

### Auditar violações de token

```text
Buscar em src/:
  - Cores hardcoded: hex (#xxx), rgb(), hsl() sem var()
  - Espaçamento arbitrário: p-[Npx], m-[Npx] fora da escala 4px
  - Sombras inline: style={{ boxShadow: ... }}
  - Raios arbitrários: rounded-[Npx]

Para cada violação:
  1. Substituir por token semântico existente
  2. Se não existe token adequado: avaliar se deve ser criado
  3. Registrar decisão se criar novo token
```

### Tokens existentes (referência rápida)

- **Cores**: `bg-primary`, `bg-surface`, `text-primary`, `text-secondary`, `bg-error`, `bg-success`, `bg-warning`, `bg-accent`
- **Espaçamento**: escala Tailwind (p-1 a p-32)
- **Sombras**: `shadow-soft`, `shadow-lifted`, `shadow-interactive`, `shadow-inner-soft`
- **Bordas**: `rounded-sm` a `rounded-xl`
- **Fonte**: `font-sans`, `font-serif`

## Evidências obrigatórias

- Relatório de auditoria com contagem de ocorrências.
- Componentes criados com props tipadas.
- Todos os consumidores migrados no mesmo diff.
- `npm run verify` verde após cada primitivo extraído.
- `NEXT.md` atualizado ao final da sessão.

## Saída mínima (Definition of Done)

- `npm run verify` verde.
- Sem UI genérica inline nas páginas auditadas.
- Componentes em `src/components/ui/` com props tipadas.
- Barrel file (`index.ts`) atualizado.
- Zero violações de design token nas áreas trabalhadas.
- `NEXT.md` atualizado.

## Template de evidências (colar em PLAN.md)

```text
- Escopo: [quais primitivos e quais páginas]
- Fora de escopo: [o que NÃO será tocado]
- Primitivos extraídos:
  - [ ] Button (X consumidores migrados)
  - [ ] Card (X consumidores migrados)
  - [ ] ...
- Violações de token corrigidas: [N]
- Gate final: npm run verify → [PASS/FAIL]
- Observações:
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
