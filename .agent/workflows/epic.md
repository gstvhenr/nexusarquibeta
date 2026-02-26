---
description: Macro-orchestrator workflow. Guides the user and agents through the complete engineering funnel: from /research, to /prd, to /plan (TechSpec).
---

# /epic - Funil de Engenharia de Produto

$ARGUMENTS

---

## Propósito

Automatizar a disciplina de engenharia de software sênior. Em vez do usuário (ou agente) pular direto para o código, o `/epic` obriga a passagem pelo funil de maturidade: Descoberta Técnica (Research) ➔ Regras de Negócio e Telemetria (PRD) ➔ Especificação Técnica de Arquitetura (TechSpec).

---

## 🔴 Regras Invioláveis

1. **NÃO PULAR ETAPAS:** O agente `orchestrator` deve executar os fluxos em ordem estrita: `1. /research` ➔ `2. /prd` ➔ `3. /plan`.
2. **APROVAÇÃO HUMANA (WAIT):** O agente DEVE parar e pedir a aprovação do usuário no final de CADA etapa antes de prosseguir para a próxima.
3. **PASSAGEM DE BASTÃO:** O output de uma fase é o input da próxima. O Dossiê de Research alimenta o PRD. O PRD alimenta a criação do TechSpec (`{task-slug}.md`).

---

## Comportamento (A Esteira Completa)

Quando `/epic` for acionado com a ideia do usuário, o agente orquestrador deve seguir este roteiro exato:

### Fase 1: Descoberta (Research)

1. Avise o usuário: `"Iniciando fase 1: Descoberta via Perplexity..."`
2. Acione o fluxo interno de `/research` usando o MCP.
3. Apresente o resumo executivo e armadilhas (anti-patterns) ao usuário.
4. **PERGUNTE:** _"A pesquisa trouxe os insights certos? Posso avançar para a criação do PRD e mapeamento das métricas de negócio?"_

### Fase 2: Negócio e Tracking (PRD)

1. Gere o documento de PRD em `docs/prd/[feature-slug].md`.
2. Inclua as histórias de usuário e a tabela obrigatória de **Telemetria/Tracking**.
3. Apresente o PRD ao usuário.
4. **PERGUNTE:** _"As regras de negócio, os edge cases e os eventos de telemetria estão corretos? Posso avançar para mapear a Arquitetura (TechSpec)?"_

### Fase 3: Especificação Técnica (TechSpec)

1. Acione o fluxo de `/plan` fornecendo o PRD recém aprovado como contexto.
2. Gere o arquivo `{task-slug}.md` mapeando os pontos de contato técnicos exatos (arquivos em `src/`, types, services, UI). Nenhuma regra de negócio deve ser re-inventada aqui.
3. Diga ao usuário que a esteira de planejamento está concluída.

---

## Output Esperado

O output final do workflow `/epic` não é código, e sim a entrega formal de **2 artefatos blindados**:

1. O Documento Funcional: `docs/prd/[feature-slug].md`
2. O Planejamento Arquitetural: `{task-slug}.md` na raiz do projeto.

---

## Após o Epic

```text
[OK] Épico de Engenharia Concluído.

Artefatos Gerados:
- PRD: docs/prd/[feature].md
- TechSpec: [techspec-feature].md

Próximos passos:
- Iniciar a execução do código executando `/enhance [techspec-feature].md` ou task por task.
```

---

## Exemplos de Uso

```text
/epic refatoração do sistema de permissões de RBAC
/epic novo módulo de gestão financeira de construtoras associadas
/epic integração offline com o aplicativo mobile
```
