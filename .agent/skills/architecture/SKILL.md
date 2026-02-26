---
name: architecture
description: Framework de tomada de decisao arquitetural. Analise de requisitos, avaliacao de trade-offs, documentacao ADR. Use ao tomar decisoes de arquitetura ou analisar o design do sistema.
allowed-tools: Read, Glob, Grep
---

# Architecture — Nexus-Arqui

> ADRs salvos em `docs/decisions/`. Framework: React 18 + TypeScript strict + Vite + IndexedDB.

---

## Core Principle

> **Comece simples. Adicione complexidade APENAS quando os dados provam necessidade.**

Simples → Complicado após 3x o problema → Complexo com escala real

---

## Requirements Analysis

Antes de qualquer decisão arquitetural, responda:

| Pergunta                           | Por quê importa                     |
| ---------------------------------- | ----------------------------------- |
| Quais são os requisitos de dados?  | Schema IndexedDB, contratos de tipo |
| Fluxo de usuário esperado?         | Afeta hierarquia de componentes     |
| Impacto de performance?            | Context decomposition, lazy loading |
| Haverá mais usuários ou contextos? | Escalabilidade futura do ERP        |
| Restrições de tempo?               | MVP vs solução ideal                |

---

## Trade-off Evaluation

### Template de Decisão

```markdown
**Opção A:** [Nome da abordagem]

- Complexidade: Baixa
- Manutenção: Fácil
- Performance: [impacto]
- Risco: [risco]

**Opção B:** [Nome da abordagem]

- Complexidade: Média
- Manutenção: Moderada
- Performance: [impacto]
- Risco: [risco]
```

---

## ADR Format — Nexus-Arqui

```markdown
# ADR-XXX: [Decision Title]

**Data:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated

## Context

[O problema que precisamos resolver]

## Decision

[A decisão tomada]

## Rationale

[Por que esta opção foi escolhida]

## Consequences

**Positivo:** [benefícios]
**Negativo:** [trade-offs]
**Mitigação:** [como lidar com os negativos]
```

> Salve em: `docs/adr/ADR-XXX-slug.md`

---

## Padrões Arquiteturais do Projeto

| Camada           | Responsabilidade          | Localização                     |
| ---------------- | ------------------------- | ------------------------------- |
| **Presentation** | UI, componentes React     | `src/components/`, `src/pages/` |
| **State**        | Gerenciamento de estado   | `src/context/`, `src/hooks/`    |
| **Service**      | Business logic, IndexedDB | `src/services/`                 |
| **Utils**        | Funções puras, formatters | `src/utils/`                    |
| **Types**        | Contratos de tipo         | `src/types/`                    |

### Regras de Dependência

```
components → hooks → services → utils
                ↓
         IndexedDB (storage)
```

> ❌ Componentes não acessam IndexedDB diretamente
> ❌ Services não importam componentes React
> ✅ Lógica de negócio fica em `src/services/`

---

## Quando Criar ADR

| Situação                                  | Criar ADR? |
| ----------------------------------------- | ---------- |
| Mudança de storage (ex: IndexedDB schema) | ✅ Sim     |
| Novo padrão de Context                    | ✅ Sim     |
| Adição de dependência npm                 | ✅ Sim     |
| Refatoração de service existente          | ✅ Sim     |
| Bugfix trivial                            | ❌ Não     |
| Mudança de estilo/UI                      | ❌ Não     |

---

## Checklist de Revisão Arquitetural

- [ ] Segue a hierarquia de camadas?
- [ ] Não viola a separação de concerns?
- [ ] Breaking change no tipo? → Atualizar `docs/data-contracts/types-contracts.md`
- [ ] ADR criado?
- [ ] `npm run verify` verde?
