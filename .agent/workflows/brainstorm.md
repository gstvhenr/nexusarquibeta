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
