---
description: Utilize the Perplexity MCP to run deep research on market trends, best practices, and modern tech stacks before planning any capability. No assumptions allowed.
---

# /research - Descoberta Técnica e de Mercado

$ARGUMENTS

---

## Propósito

Eliminar adivinhações e alucinações sobre bibliotecas, arquiteturas e casos de uso de negócio. Forçar o uso de **dados reais, links e documentações atualizadas** através do motor de busca web do Perplexity (RAG) antes de escrever qualquer PRD ou Plano Técnico.

---

## 🔴 Regras Invioláveis

1. **OBRIGATÓRIO:** O agente deve, sem exceção, acionar a tool de MCP do Perplexity (`mcp_perplexity-ask_deep_research` ou `mcp_perplexity-ask_search`) com a query fornecida.
2. **NENHUMA ALUCINAÇÃO:** Baseie a resposta _estritamente_ nos resultados trazidos pelo Perplexity.
3. **CITAÇÕES:** Inclua URLs de referência nos resultados sempre que o Perplexity as fornecer.
4. **SEM CÓDIGO:** Este workflow gera pesquisa, não código.

---

## Comportamento

Quando `/research` for acionado com um argumento:

### 1. Invocação do Oráculo (MCP)

1. Extraia o tópico do usuário.
2. Formule uma query de pesquisa profunda. Exemplo interno: _"Qual a arquitetura mais moderna em React para fazer [TÓPICO], considerando boas práticas de 2025?"_ ou _"Quais as métricas financeiras essenciais para um ERP de arquitetura relacionadas a [TÓPICO]?"_
3. Chame a tool do Perplexity correspondente.

### 2. Formatação do Dossiê

Ao receber a resposta, formate as informações em categorias úteis para o processo de engenharia do Nexus-Arqui.

---

## Output Format

```markdown
## 🔎 Dossiê de Pesquisa: [Tópico]

📅 Data: [YYYY-MM-DD] | Fonte primária: Perplexity MCP

### 🌐 Contexto de Mercado / Negócio

[Resumo de como o mercado ou usuários finais lidam com o problema. Casos de uso típicos.]

### 🛠️ Padrões Tecnológicos Recomendados

[Resumo das bibliotecas modernas, padrões de arquitetura (ex: Hooks, Zustand, IndexedDB) aprovados pela comunidade neste ano].

### ⚠️ Armadilhas e Anti-Patterns (Gotchas)

[O que NÃO fazer. Quais problemas de performance ou segurança comuns existem ao implementar isto].

### 🔗 Referências

- [Doc 1](url)
- [Artigo 2](url)

---

**Próximo passo sugerido:** Com esta pesquisa em mãos, rode `/prd [Tópico]` para definir as regras de negócio e de Tracking do Nexus-Arqui.
```

---

## Exemplos de Uso

```text
/research virtualização de tabelas com tanstack e react 18
/research melhores métricas financeiras para um dashboard gerencial de arquitetura
/research estratégias offline-first para sincronização de indexeddb
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
