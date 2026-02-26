---
name: brainstorming
description: Protocolo de questionamento socratico + comunicacao com usuario. OBRIGATORIO para pedidos complexos, novas features ou requisitos incertos. Inclui relatorios de progresso e tratamento de erros.
allowed-tools: Read, Glob, Grep
---

# Brainstorming — Nexus-Arqui

> **OBRIGATÓRIO** para features novas, refatorações complexas ou requisitos vagos.
> Pergunte antes de implementar.

---

## 🛑 Quando Ativar

| Tipo de Request               | Ação                            |
| ----------------------------- | ------------------------------- |
| Feature nova ou significativa | Perguntas Socráticas — MÍNIMO 3 |
| Requisito vago ou ambíguo     | Clarification Gate              |
| Mudança arquitetural          | STOP — alinhar antes            |
| "Implemente [coisa complexa]" | Decompor → validar escopo       |

> **Regra de ouro:** Se 1% está incerto, pergunte antes.

---

## Socratic Gate Protocol

### Estrutura de Perguntas

1. **Goal:** Qual é o problema que estamos resolvendo?
2. **Scope:** Quais arquivos/componentes serão afetados?
3. **Constraints:** Há restrições (breaking changes, performance, prazo)?
4. **Trade-offs:** Você aceita X em troca de Y?
5. **Edge Cases:** O que acontece quando [caso extremo]?

### Exemplo — Feature Nova no ERP

```
Antes de implementar, algumas perguntas:

1. **Fluxo:** Quem usa esta feature e em qual contexto do ERP?
2. **Dados:** Quais dados ela precisa? (Projetos, Propostas, Clientes?)
3. **Estado:** Persiste em IndexedDB ou é UI state temporário?
4. **Impacto:** Afeta alguma tela existente?
```

---

## 3-Option Strategy

Para decisões de design ou arquitetura, sempre ofereça 3 opções:

```markdown
## Opções para [Decisão de Design]

**Opção A: [Nome]** — Simplicidade

- Prós: [benefício]
- Contras: [custo]

**Opção B: [Nome]** — Equilíbrio ⭐

- Prós: [benefício]
- Contras: [custo]

**Opção C: [Nome]** — Poder

- Prós: [benefício]
- Contras: [custo]

Recomendação: **Opção B** — [razão em 1 frase]
```

---

## Progress Reporting

Para tasks longas, reporte progresso de forma concisa:

```markdown
📍 **Progresso:**

- [x] Análise de dependências
- [/] Implementando serviço
- [ ] Testes
- [ ] npm run verify

ETA: ~10-15 min
```

---

## Error Handling — Comunicação

```markdown
### ❌ Erro Encontrado

**O que aconteceu:** [Descrição direta]
**Impacto:** [Escopo do problema]
**Opções:**

1. [Abordagem alternativa]
2. [Retornar a uma versão prévia]
```

---

## Contextos Específicos do Nexus-Arqui

| Perguntar sempre                        | Por quê                                  |
| --------------------------------------- | ---------------------------------------- |
| O dado persiste? (IndexedDB vs memória) | Arquitetura de storage é central         |
| Afeta o gate `npm run verify`?          | Todo código pass pelo gate               |
| Há fixture de teste para isso?          | `src/test/fixtures/`                     |
| Breaking change no contrato de tipo?    | `docs/data-contracts/types-contracts.md` |
