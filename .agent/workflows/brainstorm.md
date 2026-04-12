---
description: Structured brainstorming for projects and features. Explores multiple options before implementation.
---

# /brainstorm - Exploração Estruturada de Ideias

$ARGUMENTS

---

## Propósito

Ativa o modo BRAINSTORM para exploração de opções **antes** de qualquer implementação. Obrigatório para features novas, decisões de arquitetura ou requisitos ambíguos no Nexus-Arqui.

---

## Comportamento

Quando `/brainstorm` for acionado:

1. **Entender o problema**
   - Qual funcionalidade do ERP está sendo discutida?
   - Quais dados estão envolvidos? (Projetos, Propostas, Clientes?)
   - Persiste em IndexedDB ou é UI state temporário?
   - Há impacto em tipos existentes (`docs/data-contracts/types-contracts.md`)?

2. **Gerar opções**
   - Mínimo 3 abordagens diferentes
   - Prós, contras e esforço estimado para cada
   - Considerar soluções não-óbvias

3. **Comparar e recomendar**
   - Resumir trade-offs
   - Dar recomendação com justificativa

---

## Output Format

```markdown
## 🧠 Brainstorm: [Tópico]

### Contexto

[Descrição concisa do problema no ERP]

---

### Opção A: [Nome]

[Descrição]

✅ **Prós:**

- [benefício 1]

❌ **Contras:**

- [custo 1]

📊 **Esforço:** Baixo | Médio | Alto

---

### Opção B: [Nome]

[Descrição]
...

---

## 💡 Recomendação

**Opção [X]** porque [justificativa em 1-2 frases].

Qual direção você quer explorar?
```

---

## Princípios

- **Sem código** — brainstorm é sobre ideias, não implementação
- **Diagramas quando útil** — use mermaid para arquitetura
- **Trade-offs honestos** — não esconda complexidade
- **Defira ao usuário** — apresente opções, deixe ele decidir

---

## Exemplos de Uso

```
/brainstorm como modelar recorrência de projetos
/brainstorm nova tela de dashboard financeiro
/brainstorm migração de localStorage para IndexedDB
/brainstorm refatoração do Context de Propostas
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
