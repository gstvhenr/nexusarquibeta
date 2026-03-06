# Knowledge Promotion Protocol

> **Propósito:** Definir quando e como promover conhecimento tácito para
> `.agent/knowledge/` como itens consultáveis por agentes.

---

## Fontes de Conhecimento

| Fonte                 | Tipo de conhecimento                            |
| --------------------- | ----------------------------------------------- |
| `lessons-learned.md`  | Erros encontrados + causa raiz + regra derivada |
| `DECISIONS-active.md` | Decisões arquiteturais com trade-offs           |
| Conversas passadas    | Investigações profundas, debugs, análises       |
| `docs/adr/*`          | Architecture Decision Records                   |

---

## Critérios de Promoção

Um item DEVE ser promovido para `.agent/knowledge/` quando:

1. **Complexidade:** O raciocínio completo (causa raiz + alternativas + trade-offs) excede o que cabe em uma regra binária de `lessons-learned.md`.
2. **Reutilização:** O conhecimento é consultável em mais de 1 tipo de tarefa (ex: padrão que serve para debug E implementação).
3. **Profundidade:** A explicação detalhada seria valiosa para um agente que não participou da sessão original.

Um item NÃO precisa ser promovido quando:

- A regra derivada em `lessons-learned.md` é suficiente e autocontida.
- O conhecimento já está coberto por um skill existente em `.agent/skills/`.

---

## Formato de Knowledge Item

```markdown
# [Título Descritivo]

> Referência para agente consultar ao lidar com [situação].

## Contexto

[Por que este conhecimento existe. Qual problema motivou a investigação.]

## Decisão / Padrão

[O que foi decidido ou descoberto. Detalhes técnicos.]

## Alternativas Consideradas

[O que foi descartado e por quê.]

## Referências

- Lesson learned: `[DATA] - [CATEGORIA]` em `.agent/lessons-learned.md`
- ADR: `docs/adr/ADR-XXXX.md` (se aplicável)
- Sessão original: [Conversation ID ou data]
```

---

## Processo

1. Ao promover uma lesson-learned a regra permanente (3× repetição), avaliar se o raciocínio completo merece knowledge item.
2. Se sim: criar arquivo em `.agent/knowledge/[slug-descritivo].md`.
3. Na lesson-learned original, adicionar nota: `📚 Promovido para knowledge: [slug].md`.
4. O knowledge item deve ser autocontido — um agente deve conseguir entender o padrão sem ler a sessão original.

---

## Exemplos de Knowledge Items Válidos

| Slug                          | Conteúdo                                              |
| ----------------------------- | ----------------------------------------------------- |
| `singleton-isolation-pattern` | Padrão clone-on-read/write para estado global mutável |
| `fixture-partial-casting`     | Estratégias de cast para fixtures parciais em testes  |
| `barrel-orphan-detection`     | Como detectar e resolver barrels sem consumidor       |
| `git-hooks-test-impact`       | ✅ Já existe — script de test impact automation       |
