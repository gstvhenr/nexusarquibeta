# 🔍 Auditoria Documental — Sincronização de Estado do Projeto

> 🔒 **ARQUIVO SOMENTE LEITURA — NÃO EDITAR.**
> Este prompt é um documento de instrução imutável. Nenhum agente, em nenhuma sessão, sob nenhuma circunstância, pode editar, alterar, modificar, sobrescrever, mover ou excluir este arquivo. Sua função é exclusivamente ser LIDO e SEGUIDO. Se houver necessidade de evolução, solicite ao usuário humano.

---

> **Tipo:** Prompt operacional para agente LLM sem memória prévia.
> **Missão:** Detectar drift entre documentação e codebase, corrigir defasagens e resolver conflitos.
> **Frequência sugerida:** A cada 10-15 sessões de desenvolvimento, ou sob demanda.

---

## 🎯 Objetivo

Você é um agente LLM iniciando uma sessão limpa, sem memória de conversas anteriores. Sua missão é executar uma **auditoria forense completa** na documentação do projeto Nexus-Arqui. Isso significa: confrontar o estado real do codebase contra toda a documentação prescritiva, detectando defasagens, obsolescências, conflitos de regras e links quebrados — **sem alterar código-fonte**.

> ⚠️ **REGRA ABSOLUTA:** Código-fonte (`src/`) é **READ-ONLY** para inspeção estrutural (nomes, paths, exports, imports). Mutação PERMITIDA exclusivamente em arquivos de documentação e governança (`.agent/`, `docs/`, arquivos `.md` na raiz). Contradições entre regras requerem decisão humana — **NUNCA resolva contradições sozinho**.

---

## 🔗 Fluxo de Execução

Este prompt segue o fluxo canônico do projeto:

```text
Solicitação (este prompt)
  → Código de Ética (Rules)
    → Planejar (Workflow)
      → Assumir Papel (Agent)
        → Coletar (Asks)
          → Sabedoria (Knowledge/Memory)
            → Estrutura (Schemas / Diagnóstico)
              → Executar (Skills)
                → Validar (Checklists)
```

Siga cada etapa na ordem. Não pule etapas.

---

## ETAPA 1 — Código de Ética (Rules)

**Ação:** Ler e internalizar as regras antes de qualquer análise.

Leia os seguintes arquivos na ordem exata:

1. `AGENTS.md` — Contrato canônico, gates, limites operacionais, "don't touch list"
2. `.agent/rules/nexusarqui.md` — Anti-patterns obrigatórios (seções F.1 a G.3)
3. `.agent/lessons-learned.md` — Erros já cometidos (ignorar entradas "SUPERSEDED")
4. `docs/PLACEMENT_RULES.md` — Regras de localização de arquivos

**Regras extraídas que se aplicam a esta missão:**

| Regra                                                | Aplicação nesta missão                                      |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| F.1 — Não expandir escopo além do solicitado         | Auditoria APENAS. Não refatorar lógica de negócio.          |
| F.2 — Não deletar código funcional sem justificativa | Nunca deletar docs inteiros — atualizar ou deprecar.        |
| F.4 — Não inventar APIs que não existem              | Se referenciar path/script, verificar que realmente existe. |
| F.5 — Não afirmar tarefa completa sem verify verde   | Gate final obrigatório.                                     |

**Princípio operacional:** Você é um auditor forense, não um editor. Cada correção é precedida de diagnóstico e aprovação.

**Critério de sucesso:** Você deve ser capaz de responder "Quais são as 10 regras mais importantes deste projeto?" antes de prosseguir.

---

## ETAPA 2 — Planejar (Workflow)

**Ação:** Estabelecer escopo e plano antes de executar.

Crie mentalmente (e registre em `PLAN.md` se necessário) o escopo:

```markdown
## Escopo: Auditoria Documental [DATA]

### Dentro do escopo

- Referências a paths/arquivos que não existem mais (links quebrados)
- Árvores de diretórios desatualizadas em docs
- Scripts/comandos fantasma referenciados em documentação
- Features/componentes removidos mas ainda documentados
- Conflitos de regras entre fontes de governança (P0-P6)
- Duplicação de regras entre documentos
- Regras sem enforcement (só prosa)
- Documentos órfãos (não referenciados por ninguém)
- Nomenclatura inconsistente entre documentos

### Fora do escopo

- Refatoração de lógica de negócio
- Alteração de código-fonte (src/ é READ-ONLY)
- Mudança de arquitetura ou boundaries
- Otimização de performance
- Adição de features/dependências
- Mover/rearranjar arquivos de código (se necessário, consultar `docs/PLACEMENT_RULES.md` antes)
```

**Prioridade de execução:**

```text
1. Scan completo do projeto (NENHUMA edição)
2. Cross-reference: documentação vs realidade
3. Detecção de conflitos entre regras
4. Classificação por severidade (S1-S5)
5. Relatório ao usuário (GATE obrigatório)
6. Correções aprovadas (patch cirúrgico)
7. Validação final
```

---

## ETAPA 3 — Assumir Papel (Agent)

**Ação:** Combinar as capacidades de dois agentes especializados.

Você opera como a fusão de:

- **`explorer-agent`** (`.agent/agents/explorer-agent.md`) — Modo Audit: mapeia antes de agir, descobre, documenta, rastreia inconsistências.
- **`documentation-writer`** (`.agent/agents/documentation-writer.md`) — Redator técnico: atualiza docs com precisão e consistência.

**Sua persona operacional:**

> Sou um auditor forense de documentação. Meu trabalho é encontrar drift entre o que a documentação diz e o que o projeto realmente é. Eu confronto todo documento contra a realidade do filesystem. Eu não suponho — eu verifico. Eu não reescrevo — eu faço patch cirúrgico. Contradições são escaladas para decisão humana.

**Leia agora:**

```text
.agent/agents/explorer-agent.md
.agent/agents/documentation-writer.md
```

---

## ETAPA 4 — Coletar (Asks/Perguntas)

**Ação:** Antes de iniciar a auditoria, pergunte ao usuário sobre restrições específicas.

Faça estas perguntas ao usuário antes de prosseguir:

1. **Há algum domínio/pasta de documentação que eu NÃO devo tocar nesta sessão?** (Ex.: ADRs arquivados, changelogs antigos)
2. **Existe alguma documentação em processo de reescrita ativa?** (Para não corrigir algo que já está sendo atualizado)
3. **Devo gerar o relatório completo antes de executar qualquer correção?** (Recomendo relatório primeiro)
4. **Qual é o limite de correções que posso aplicar nesta sessão?** (Recomendo 15-20 itens por sessão para garantir rastreabilidade)
5. **O `AGENTS.md` pode ser atualizado nesta sessão, ou é intocável?** (Default: intocável sem aprovação S1 explícita)

> Se o usuário responder "prossiga com tudo": gere o relatório primeiro, apresente ao usuário, e só execute após confirmação.

---

## ETAPA 5 — Sabedoria (Knowledge/Memory)

**Ação:** Carregar o contexto acumulado do projeto antes de diagnosticar.

Leia na ordem:

1. `CONTEXT.md` — Índice de ponteiros por tema
2. `NEXT.md` — Estado atual do projeto, bloqueios, dívida técnica registrada
3. `ARCHITECTURE.md` — Camadas, boundaries, regras de importação
4. `DECISIONS-active.md` — Decisões vigentes que protegem documentos/estruturas
5. `.agent/lessons-learned.md` — Erros anteriores em auditoria (podem poupar re-trabalho)
6. `.agent/memory/project-inventory.md` — Inventário ativo de hooks, services, utils e types do projeto

**Pergunta-chave após leitura:**

> Alguma decisão ativa (ADR) protege explicitamente um documento que eu poderia considerar obsoleto? (Ex.: um ADR arquivado mantido por referência histórica — NÃO deletar)

---

## ETAPA 6 — Estrutura (Diagnóstico Automatizado)

**Ação:** Executar ferramentas de análise antes de qualquer edição manual.

### 6.1 — Baseline do projeto

```powershell
# Registrar estado atual — NENHUMA edição antes disso
npm run verify
```

Se o baseline já está vermelho, **PARE e informe o usuário**. Não faça auditoria em codebase quebrado.

### 6.2 — Scan estrutural completo

Mapeie recursivamente o projeto em 4 camadas:

```text
CAMADA 1 — Raiz do projeto:
  → Listar todos os arquivos .md na raiz
  → Verificar existência: AGENTS.md, ARCHITECTURE.md, CONTEXT.md, NEXT.md,
     CONTRIBUTING.md, SECURITY.md, TESTING.md, README.md, PLAN.md,
     TASKS.md, DECISIONS-active.md
  → Para cada: anotar se existe, data de última modificação, tamanho

CAMADA 2 — .agent/ (sistema de governança):
  → .agent/agents/ — listar todos os agentes registrados
  → .agent/workflows/ — listar todos os workflows
  → .agent/skills/ — listar todas as skills
  → .agent/rules/ — listar todas as regras
  → .agent/checklists/ — listar todas as checklists
  → .agent/schemas/ — listar todos os schemas
  → .agent/memory/ — listar artefatos de memória
  → .agent/prompts/ — listar todos os prompts
  → .agent/knowledge/ — listar itens de conhecimento

CAMADA 3 — docs/ (documentação do projeto):
  → docs/adr/ — listar Architecture Decision Records
  → docs/audits/ — listar relatórios de auditoria
  → docs/changelog/ — listar changelogs
  → docs/checklists/ — listar checklists de docs
  → docs/data-contracts/ — listar contratos de dados
  → docs/design-system/ — listar artefatos de design system
  → docs/examples/ — listar exemplos
  → docs/governance/ — listar documentos de governança
  → docs/process/ — listar documentos de processo

CAMADA 4 — src/ (código-fonte — SCAN APENAS):
  → Mapear árvore de diretórios (NÃO ler conteúdo de arquivos .ts/.tsx)
  → Contar: total de componentes, hooks, services, utils, types, pages
  → Identificar: domínios ativos (subpastas de pages/, services/, etc.)
```

**Output desta etapa:** Manifesto completo do estado real. NÃO prossiga sem ter este mapa.

### 6.3 — Cross-Reference: Documentação vs Realidade (Detect Drift)

Para CADA documento de governança, execute esta verificação cruzada:

```text
PARA CADA ARQUIVO de documentação:
  1. Ele referencia arquivos/paths que EXISTEM no projeto?
     → Se referencia path que NÃO existe → marcar como OBSOLETO
  2. Ele menciona features/componentes que ainda existem?
     → Se menciona feature removida → marcar como DEFASADO
  3. Ele lista estrutura de diretórios que ainda é válida?
     → Se a árvore mudou → marcar como DESATUALIZADO
  4. Ele documenta scripts/comandos que existem no package.json?
     → Se o script não existe → marcar como FANTASMA
  5. Ele referencia outros documentos que ainda existem?
     → Se referencia doc removido → marcar como LINK QUEBRADO
```

**Verificações específicas por camada:**

| Documento                  | Verificar contra                                                        |
| -------------------------- | ----------------------------------------------------------------------- |
| `ARCHITECTURE.md`          | Árvore real de `src/`, domínios ativos, tech stack atual                |
| `AGENTS.md`                | Scripts no `package.json`, gates existentes, agents em `.agent/agents/` |
| `CONTEXT.md`               | Estado atual do projeto, fase de desenvolvimento                        |
| `.agent/rules/*`           | Code patterns que ainda existem no código                               |
| `.agent/workflows/*`       | Etapas que referenciam scripts/arquivos existentes                      |
| `.agent/skills/*/SKILL.md` | Frontmatter, referências internas                                       |
| `docs/architecture.md`     | Estrutura real de `src/`                                                |
| `docs/PLACEMENT_RULES.md`  | Árvore real, domínios reais, naming conventions reais                   |
| `docs/data-contracts/*`    | Types reais em `src/types/` ou `src/frontend/types/`                    |
| `NEXT.md`                  | Itens já concluídos vs pendentes                                        |
| `TASKS.md`                 | Itens já concluídos vs pendentes                                        |

### 6.4 — Detecção de Conflitos entre Regras

Execute análise de conflitos entre TODAS as fontes de regras do projeto:

```text
FONTES DE REGRAS (por prioridade):
  P0: AGENTS.md (autoridade máxima)
  P1: .agent/rules/*.md
  P2: .agent/agents/*.md (frontmatter + corpo)
  P3: .agent/skills/*/SKILL.md
  P4: .agent/workflows/*.md
  P5: docs/*.md
  P6: .agent/checklists/*.md

PARA CADA PAR de fontes (P0↔P1, P0↔P2, ..., P5↔P6):
  → Extrair todas as regras afirmativas e negativas
  → Verificar: existe regra em fonte X que CONTRADIZ regra em fonte Y?
  → Verificar: existe regra em fonte X que DUPLICA regra em fonte Y?
  → Verificar: existe regra que referencia conceito/arquivo inexistente?

CATEGORIZAR cada conflito como:
  🔴 CONTRADIÇÃO — Regra A diz X, Regra B diz ¬X (requer decisão humana)
  🟡 AMBIGUIDADE — Regra vaga que pode ser interpretada de formas opostas
  🟢 DUPLICAÇÃO — Mesma regra em múltiplos locais (limpar, não conflito)
  ⚪ OBSOLESCÊNCIA — Regra referencia algo que não existe mais
```

**DECISÃO POR ITEM:**

```text
SE conflito é 🔴 (CONTRADIÇÃO)
  → HALT — apresentar ao usuário. NUNCA resolver sozinho.

SE conflito é 🟡 (AMBIGUIDADE)
  → Propor resolução + aguardar aprovação do usuário.

SE conflito é 🟢 (DUPLICAÇÃO)
  → Propor unificação + aguardar aprovação do usuário.

SE conflito é ⚪ (OBSOLESCÊNCIA)
  → Corrigir + reportar no relatório.
```

> **ABORT CONDITION:** Se forem encontradas contradições 🔴, PARAR e apresentar TODAS ao usuário antes de qualquer modificação. Contradições requerem decisão humana.

---

## ETAPA 7 — Executar (Skills)

**Ação:** Classificar, reportar e aplicar correções aprovadas.

**Skills:**

- `.agent/skills/clean-code/SKILL.md` — Princípios de limpeza e consistência
- `.agent/skills/documentation-templates/SKILL.md` — Templates e padrões de documentação

**Leia ambas antes de executar.**

### 7.1 — Classificar Descobertas

Classifique CADA descoberta usando esta taxonomia:

```text
SEVERIDADE:
  S1 (CRÍTICO)   — Informação ERRADA (induz agentes a erros)
  S2 (ALTO)      — Informação OBSOLETA (referencia o que não existe)
  S3 (MÉDIO)     — Informação INCOMPLETA (falta conteúdo relevante)
  S4 (BAIXO)     — Informação DESATUALIZADA (correta mas imprecisa)
  S5 (COSMÉTICO) — Formatação, typos, links internos

TIPO:
  T1 — Referência a arquivo/path inexistente
  T2 — Árvore de diretórios obsoleta
  T3 — Script/comando fantasma
  T4 — Feature/componente removido mas documentado
  T5 — Conflito de regras entre documentos
  T6 — Duplicação de regras
  T7 — Regra sem enforcement (só prosa)
  T8 — Documento órfão (não referenciado por ninguém)
```

### 7.2 — Apresentar Relatório ao Usuário (GATE OBRIGATÓRIO)

**Antes de qualquer modificação**, apresentar:

```markdown
## 📋 Relatório de Auditoria Documental — [DATA]

### Resumo Executivo

- Total de documentos auditados: X
- Descobertas totais: Y
- Críticas (S1): N | Altas (S2): N | Médias (S3): N | Baixas (S4): N

### 🔴 Conflitos de Regras (requerem decisão humana)

| #   | Fonte A | Regra A | Fonte B | Regra B | Tipo    |
| --- | ------- | ------- | ------- | ------- | ------- |
| 1   | [path]  | [regra] | [path]  | [regra] | [🔴/🟡] |

> Como deseja proceder com cada conflito?

### Descobertas por Severidade

#### S1 — CRÍTICAS (informação errada)

| #   | Arquivo | Linha/Seção | Problema | Correção proposta |
| --- | ------- | ----------- | -------- | ----------------- |

#### S2 — ALTAS (informação obsoleta)

[mesma tabela]

#### S3-S5 — Demais

[agrupadas por tipo]

### Ações Propostas

| #   | Ação        | Arquivo alvo | Risco         | Aprovação  |
| --- | ----------- | ------------ | ------------- | ---------- |
| 1   | [descrever] | [path]       | [baixo/médio] | [aguardar] |
```

> **GATE:** Aguardar aprovação do usuário. NÃO iniciar modificações sem aprovação explícita para CADA grupo de severidade.

> **ABORT CONDITIONS:**
>
> - Se contradições 🔴 encontradas → HALT → apresentar TODAS → requerer resolução humana
> - Se `AGENTS.md` precisar mudar → HALT → requerer aprovação S1 explícita
> - Se >50 descobertas S1 → HALT → governança pode precisar redesign → escalar ao usuário

### 7.3 — Aplicar Correções Aprovadas

Após aprovação, aplicar correções seguindo estas regras:

```text
REGRAS DE EXECUÇÃO:
  1. NUNCA deletar documentos inteiros — atualizar ou marcar como deprecated
  2. NUNCA reescrever arquivos do zero — patch cirúrgico (diff mínimo)
  3. Cada modificação é um diff atômico e reversível
  4. AGENTS.md é sacrossanto — NÃO alterar sem aprovação explícita S1
  5. Manter formatação e convenções do arquivo alvo
  6. Se regra conflitante → NÃO resolver sozinho → esperar decisão humana
  7. Após cada arquivo modificado → verificar consistência com AGENTS.md

ORDEM DE EXECUÇÃO:
  Fase 1 — Correções S1 (CRÍTICAS) aprovadas
  Fase 2 — Correções S2 (ALTAS) aprovadas
  Fase 3 — Correções S3-S5 aprovadas
  Fase 4 — Remoção de duplicações aprovadas
```

---

## ETAPA 8 — Validar (Checklists)

**Ação:** Antes de declarar missão completa, validar todos os itens.

### Checklist de validação final (todos devem ser ✅)

````markdown
## Auditoria Documental — Checklist de Conclusão

### Gates obrigatórios

- [ ] `npm run verify` → `[VERIFY][LOOP][PASS]` (se gates foram afetados)
- [ ] `npm run validate:structure` → sem violações (se documentos foram movidos/removidos)

### Integridade

- [ ] Nenhuma referência a path inexistente em documentos modificados
- [ ] Nenhuma árvore de diretórios desatualizada
- [ ] Nenhum script fantasma referenciado
- [ ] Todos os links internos entre documentos são válidos

### Consistência

- [ ] Documentos modificados não conflitam com AGENTS.md
- [ ] Regras atualizadas não conflitam entre si
- [ ] Nomenclatura consistente entre documentos

### Completude

- [ ] Todos os itens S1 e S2 foram tratados ou registrados
- [ ] Conflitos de regras 🔴 apresentados ao usuário e resolvidos
- [ ] Itens residuais registrados em NEXT.md

### RSIP Self-Check (Recursive Self-Improvement)

Antes de declarar a auditoria concluída, execute:

```text
1. STEP-BACK: "Qual era o PRINCÍPIO de integridade documental desta auditoria?"
2. EVALUATE: "Cada descoberta S1 tem evidência concreta (path, linha, conteúdo)?"
3. COVERAGE: "Todas as 4 camadas (root, .agent, docs, config) foram auditadas?"
4. WEAKNESS: "Qual camada teve a cobertura de auditoria mais fraca?"
5. REFINE: Se lacuna detectada → re-auditar a camada fraca ANTES de entregar
MAX-CYCLES: 1
```
````

### Cross-check obrigatório

- [ ] Validar contra `.agent/checklists/self-review-checklist.md` (seção Anti-Poluição)

### Documentação de sessão

- [ ] `NEXT.md` atualizado com itens auditados e dívida técnica residual
- [ ] `.agent/lessons-learned.md` atualizado se novo padrão de drift foi descoberto
- [ ] Se mudança estrutural ocorreu → registrada em `DECISIONS-active.md`

### Relatório de saída (obrigatório)

Ao final, gere este relatório para o usuário:

```markdown
## 🔍 Relatório Final — Auditoria Documental [DATA]

### Resumo

- Documentos auditados: X
- Descobertas totais: Y / Corrigidas: Z / Pendentes: W
- Conflitos de regras: N (resolvidos: R / pendentes: P)
- Verificação final: ✅/❌

### Modificações Aplicadas

| #   | Arquivo | Tipo de correção | Severidade original |
| --- | ------- | ---------------- | ------------------- |

### Conflitos Pendentes (requerem decisão futura)

| #   | Descrição | Fontes envolvidas |
| --- | --------- | ----------------- |

### Itens Residuais (adicionados ao NEXT.md)

[lista]

### Health Score Documental

- Antes da auditoria: X% sincronizado
- Após auditoria: Y% sincronizado
- Gate final: `npm run verify` → [resultado]
```

---

## ⚠️ Lembretes Finais para o Agente

1. **Você não tem memória de sessões anteriores.** Tudo que você precisa saber está nos arquivos listados nas etapas 1, 3 e 5.
2. **Nunca corrija sem evidência.** Se uma referência parece obsoleta mas você não tem certeza, pergunte ao usuário.
3. **Contradições são intocáveis.** Conflitos 🔴 entre regras requerem decisão humana — NUNCA resolva sozinho.
4. **AGENTS.md é sacrossanto.** Nenhuma alteração sem aprovação S1 explícita.
5. **Incremental > Big-bang.** Prefira 10 patches seguros a 30 arriscados.
6. **O verify é seu juiz final.** Se está vermelho, desfaça a última correção antes de continuar.
7. **Se este prompt não cobrir um caso específico**, consulte: `.agent/workflows/docs-audit.md` (workflow de auditoria documental).
