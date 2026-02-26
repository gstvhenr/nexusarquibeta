---
description: Technical Specification (TechSpec) generator. Maps exact file changes, architecture boundaries, and dependencies based on a PRD or requirement. No code writing - only plan file generation.
---

# /plan - Especificação Técnica (TechSpec)

$ARGUMENTS

---

## Propósito

A fase 3 da esteira de engenharia rigorosa (`/research` ➔ `/prd` ➔ `/plan` ➔ `/enhance`). O workflow abandona qualquer discussão de produto/negócio e abstrai o "Como" em um mapa arquitetural estrito: quais arquivos em `src/` serão criados/modificados, quais hooks serão chamados, quais dependências de `package.json` serão necessárias e qual o critério binário de teste.

---

## 🔴 Regras Críticas

1. **PROIBIDO CRIAR REGRAS DE NEGÓCIO:** O agente não deve inventar casos de uso ou métricas aqui. (Se o usuário não souber o que quer, aborte e recomende `/prd`).
2. **PENSAMENTO SEQUENCIAL OBRIGATÓRIO:** O agente deve obrigatoriamente usar a tool `mcp_sequential-thinking` para testar mentalmente a arquitetura (ex: dependências cruzadas e estados) antes de escrever o plano.
3. **MAREAMENTO CIRÚRGICO:** Liste os caminhos absolutos/relativos dos arquivos que serão impactados pela feature.
4. **SEM CÓDIGO FINAL:** Este comando cria apenas o arquivo de especificação técnica.
5. **Nomenclatura dinâmica:** Criação de arquivo `{task-slug}.md` na raiz.

---

## Task

Usar o agente `project-planner` e/ou `orchestrator` com este contexto:

```text
CONTEXTO:
- Request/PRD Base: $ARGUMENTS
- Modo: APENAS ESPECIFICAÇÃO TÉCNICA (TechSpec)
- Output: {task-slug}.md (na raiz do projeto)

REGRAS DE NOMENCLATURA:
1. Extrair 2-3 palavras-chave do request
2. Minúsculas, separadas por hífen
3. Máx 30 caracteres
4. Exemplo: "tela de propostas" → techspec-propostas.md

INSTRUÇÕES:
1. Leia a tag <MEMORY[nexusarqui.md]> ou `ARCHITECTURE.md` para respeitar os boundaries do projeto (camadas de service vs UI).
2. Criar {task-slug}.md com breakdown técnico atômico:
   - Arquivos DTO/Types a criar/mudar em `src/types` e `docs/data-contracts`.
   - Modificações em `src/services` (Sem lógica de UI).
   - Componentes React em `src/components` e `src/pages`.
3. Informar o nome exato do arquivo criado para aprovação inicial.
```

---

## Output Esperado

| Entregável                              | Localização                                |
| --------------------------------------- | ------------------------------------------ |
| Especificação Técnica (TechSpec)        | `{task-slug}.md` (raiz do projeto)         |
| Lista de "Pontos de Contato" (Arquivos) | Dentro do arquivo                          |
| Impacto de Dependências                 | Dentro do arquivo                          |
| Gate de verificação                     | Declaração da Evidência (`npm run verify`) |

---

## Após o Planejamento

```text
[OK] TechSpec mapeada: {task-slug}.md

### 🗺️ Pontos de Contato Identificados:
- `src/types/[file].ts`
- `src/pages/[file].tsx`
- (Total de N arquivos mapeados)

Próximos passos:
- Revise as assinaturas arquiteturais mapeadas no plano.
- Acione `/enhance` (com ou sem o slug) para iniciarmos a execução, arquivo por arquivo.
```

---

## Exemplos de Uso

```text
/plan usar o prd docs/prd/modulo-comissoes.md para criar o techspec
/plan adicionar filtro de data na api de receitas e na UI
/plan migrar o Context de propostas para Zustand
```
