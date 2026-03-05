<thinking>
<analysis>
[VECTOR]: Engenharia de prompt para auditoria documental exaustiva e sincronização de estado em repositórios agent-first. O agente executa varredura completa do projeto, cruzando o estado real do código-fonte contra toda documentação prescritiva, detectando defasagens, obsolescências e conflitos de regras entre camadas de governança.
[OPTIMIZATION]: Pipeline de auditoria em 3 fases (SCAN → CROSS-REFERENCE → RECONCILE) com abort conditions para conflitos não-resolvíveis. Estruturação pseudo-XML para saturar a atenção do LLM nas restrições de escopo e nos critérios de verdade. Output tabulado e acionável — nenhuma descoberta sem classificação de severidade e ação recomendada.
</analysis>
</thinking>

**> [AUDITORIA DOCUMENTAL COMPLETA — SINCRONIZAÇÃO DE ESTADO DO PROJETO]**

### FASE A: ANÁLISE DE INTENÇÃO (DEEP SCAN)

- **TARGET:** Verificação exaustiva de todo o projeto, pasta por pasta, arquivo por arquivo, confrontando o estado real do codebase contra toda documentação, regras, workflows, skills, schemas, checklists e arquivos informativos. Identificação e correção de defasagens, obsolescências e conflitos.
- **VETOR DE INFERÊNCIA:** Auditoria de sincronização documental. O agente opera como um auditor forense que não implementa features — ele **detecta drift** entre o que a documentação diz e o que o projeto realmente é.
- **CONSTRAINTS DE I/O:** Código-fonte (`src/`) é **READ-ONLY** para inspeção estrutural (nomes, paths, exports, imports). Mutação PERMITIDA exclusivamente em arquivos de documentação e governança (`.agent/`, `docs/`, arquivos `.md` na raiz). Configurações de build/lint são READ-ONLY (apenas reportar se obsoletos).
- **CONSTRAINTS DE ESCOPO:** O agente NÃO refatora código funcional, NÃO adiciona features, NÃO altera lógica de negócio. Ele audita, reporta e atualiza DOCUMENTAÇÃO.
- **OBJETIVO FINAL:** Ao término, toda a documentação do projeto deve refletir com precisão o estado real do codebase. Conflitos de regras devem ser catalogados e apresentados ao usuário para resolução humana.

_A compreensão da intenção está correta e de acordo com seus parâmetros?_

### FASE B: VETORES DE OTIMIZAÇÃO (PROMPT REFINEMENT)

#### NÍVEL 01 (REFATORAÇÃO SINTÁTICA)

[EXECUTION_OVERRIDE: DOCUMENTATION_AUDIT]
Modo de operação: auditoria forense documental. Nenhuma mutação de código-fonte. Output é diagnóstico + correção documental.

Execute uma auditoria completa do projeto seguindo este pipeline:

**PIPELINE DE 8 ETAPAS:**

---

**ETAPA 1 — Código de Ética (Rules)**

Leia e internalize as regras vigentes do projeto. Estes arquivos definem o contrato de comportamento:

1. `AGENTS.md` — Contrato canônico, gates, limites operacionais
2. `ARCHITECTURE.md` — Estrutura arquitetural prescrita
3. `CONTEXT.md` — Contexto operacional do projeto
4. `.agent/rules/*` — Todas as regras negativas e anti-patterns
5. `.agent/lessons-learned.md` — Memória institucional
6. `docs/PLACEMENT_RULES.md` — Regras de localização de arquivos

**Critério de sucesso:** Você deve ser capaz de responder: "Quais são as 10 regras mais importantes deste projeto?" antes de prosseguir.

---

**ETAPA 2 — Mapear o Estado Real do Projeto (Scan)**

Execute scan estrutural completo. Mapeie recursivamente:

```text
CAMADA 1 — Raiz do projeto (pasta pai):
  → Listar todos os arquivos .md na raiz
  → Verificar: AGENTS.md, ARCHITECTURE.md, CONTEXT.md, NEXT.md,
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

---

**ETAPA 3 — Cross-Reference: Documentação vs Realidade (Detect Drift)**

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

---

**ETAPA 4 — Detecção de Conflitos entre Regras**

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

> **ABORT CONDITION:** Se forem encontradas contradições 🔴, PARAR e apresentar TODAS ao usuário antes de qualquer modificação. Contradições requerem decisão humana.

---

**ETAPA 5 — Classificar e Priorizar Descobertas**

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

---

**ETAPA 6 — Apresentar Relatório ao Usuário (GATE OBRIGATÓRIO)**

Antes de qualquer modificação, apresentar:

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

---

**ETAPA 7 — Executar Correções Aprovadas (Skills)**

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

**ETAPA 8 — Validação e Relatório Final (Checklists)**

```markdown
## Checklist de Validação — Auditoria Documental

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
- [ ] Conflitos de regras apresentados ao usuário
- [ ] NEXT.md atualizado com itens residuais

### Verificação

- [ ] npm run verify verde (se documentos alterados afetam gates)
- [ ] Nenhum documento funcional deletado
```

**Relatório de saída obrigatório:**

```markdown
## 🔍 Relatório Final — Auditoria Documental [DATA]

### Resumo

- Documentos auditados: X
- Descobertas totais: Y / Corrigidas: Z / Pendentes: W
- Conflitos de regras: N (resolvidos: R / pendentes: P)

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
```

---

#### NÍVEL 02 (EQUILÍBRIO HÍBRIDO)

```markdown
# SYS.DIRECTIVE: FULL PROJECT DOCUMENTATION AUDIT & SYNC

> MODE: DOC_FORENSICS | SRC_MUTATION: DISABLED | DOC_MUTATION: ENABLED

**1. CONTEXT INGESTION (EXHAUSTIVE):**
Parse TODOS os componentes de governança:

Raiz:
AGENTS.md, ARCHITECTURE.md, CONTEXT.md, NEXT.md, CONTRIBUTING.md,
SECURITY.md, TESTING.md, README.md, PLAN.md, TASKS.md, DECISIONS-active.md

.agent/:
agents/_, workflows/_, skills/_/SKILL.md, rules/_, checklists/_,
schemas/_, memory/_, prompts/_, lessons-learned.md, README.md

docs/:
PLACEMENT*RULES.md, architecture.md, architecture-screaming.md,
adr/*, audits/_, changelog/_, checklists/_, data-contracts/_,
design-system/_, examples/_, governance/\_, process/\*

src/ (STRUCTURAL SCAN ONLY — NO CONTENT READ):
Mapear árvore → extrair: domínios, contagens, naming patterns

**2. AUDIT PIPELINE:**

Phase 1: SCAN — Criar manifesto do estado real do projeto
Phase 2: CROSS-REF — Para cada doc, verificar se reflete a realidade
Phase 3: CONFLICT-DETECT — Cruzar regras entre todas as fontes P0-P6
Phase 4: CLASSIFY — Taxonomia S1-S5 + T1-T8 para cada descoberta
Phase 5: REPORT — Apresentar ao usuário com ações propostas
Phase 6: GATE — Aguardar aprovação
Phase 7: EXECUTE — Aplicar correções aprovadas (patch cirúrgico)
Phase 8: VALIDATE — Verificar integridade pós-correção

**3. CONFLICT RESOLUTION PROTOCOL:**
Conflitos 🔴 (contradições) → HALT → apresentar ao usuário
Conflitos 🟡 (ambiguidades) → propor resolução + aguardar
Conflitos 🟢 (duplicações) → propor unificação + aguardar
Conflitos ⚪ (obsolescências) → corrigir + reportar

**4. OUTPUT:**
Relatório tabulado com severidade, arquivo, problema, correção proposta.
Health Score antes/depois. Itens residuais em NEXT.md.
```

#### NÍVEL 03 (RECRIAÇÃO TOTAL / GOD MODE)

<system*directive>
<constraints>
<flag>SRC_CODE_READ_ONLY</flag>
<flag>GOVERNANCE_DOCS_WRITE_ENABLED</flag>
<flag>OUTPUT_TARGET_AUDIT_REPORT</flag>
<flag>FUNCTIONAL_DELTA_ZERO</flag>
<flag>HUMAN_GATE_ON_CONTRADICTIONS</flag>
</constraints>
<context_ingestion>
<scope>EXHAUSTIVE — every file in project</scope>
<sources>
<layer id="root">AGENTS.md, ARCHITECTURE.md, CONTEXT.md, NEXT.md, CONTRIBUTING.md, SECURITY.md, TESTING.md, README.md, PLAN.md, TASKS.md, DECISIONS-active.md</layer>
<layer id="agent">.agent/agents/*, .agent/workflows/_, .agent/skills/_/SKILL.md, .agent/rules/_, .agent/checklists/_, .agent/schemas/_, .agent/memory/_, .agent/prompts/_, .agent/lessons-learned.md</layer>
<layer id="docs">docs/PLACEMENT_RULES.md, docs/architecture.md, docs/architecture-screaming.md, docs/adr/_, docs/audits/_, docs/changelog/_, docs/checklists/_, docs/data-contracts/_, docs/design-system/_, docs/examples/_, docs/governance/_, docs/process/_</layer>
<layer id="src_structure">src/\*\*/\_ (STRUCTURAL SCAN — directory tree, file names, export names — NO content read)</layer>
<layer id="config">package.json (scripts section), tsconfig.json, vite.config.ts, eslint.config.mjs, tailwind.config.cjs</layer>
</sources>
<extract> 1. REAL_STATE: complete filesystem manifest (paths, counts, domains) 2. DOCUMENTED_STATE: what governance docs claim the project looks like 3. DRIFT: delta between REAL_STATE and DOCUMENTED_STATE 4. CONFLICTS: contradictions between rule sources P0-P6 5. OBSOLESCENCES: references to non-existent files, scripts, features 6. DUPLICATIONS: same rule stated in multiple locations
</extract>
</context_ingestion>

  <!-- Step-Back Prompting (DeepMind, ICLR 2024) -->

<step_back>
ANTES de iniciar a auditoria, o agente DEVE abstrair:
Q1: "Qual é o PRINCÍPIO de integridade documental que esta auditoria serve?"
Q2: "Quais são os 3 tipos de drift mais perigosos para agentes sem memória?"
Q3: "Em que ordem de prioridade os drifts devem ser corrigidos?"
OUTPUT: Imprimir respostas como FRAMEWORK que restringe toda a auditoria.
</step_back>

<audit_engine>
<phase id="1" name="SCAN">
Build exhaustive manifest of project state.
Count: files per directory, components, hooks, services, utils, types, pages.
Identify: active domains, naming patterns, barrel files.
Output: PROJECT_MANIFEST (internal, not shown to user yet).
</phase>
<phase id="2" name="CROSS_REFERENCE">
For each governance document: - Extract all path references → verify existence - Extract all feature/component references → verify existence - Extract all script/command references → verify in package.json - Extract all cross-document references → verify target exists - Extract all directory trees shown → verify against reality
Classify each finding: S1-S5 severity + T1-T8 type.
</phase>
<phase id="3" name="CONFLICT_DETECT">
Rule sources hierarchy: P0(AGENTS.md) > P1(.agent/rules) > P2(.agent/agents) > P3(.agent/skills) > P4(.agent/workflows) > P5(docs) > P6(.agent/checklists)
For each pair of sources: - Extract affirmative rules and negative rules - Detect: CONTRADICTION (🔴), AMBIGUITY (🟡), DUPLICATION (🟢), OBSOLESCENCE (⚪)
Output: CONFLICT_REGISTER (tabulated).
</phase>
<phase id="4" name="REPORT">
Compile all findings into structured report.
Group by: severity → type → source file.
Include: proposed correction for each finding.
Present to user.
</phase>
<phase id="5" name="GATE">
HALT execution.
Wait for user approval per severity group.
🔴 CONTRADICTIONS require individual human decision.
S1-S2 corrections require explicit approval.
S3-S5 corrections may be batch-approved.
</phase>
<phase id="6" name="EXECUTE">
Apply approved corrections only.
Rules: surgical patch (no rewrites), atomic diffs, AGENTS.md is sacrosanct.
Order: S1 → S2 → S3 → S4 → S5 → duplications.
</phase>
<phase id="7" name="VALIDATE">
Post-correction integrity check.
Verify: no broken references, no new conflicts, consistency with AGENTS.md.
Run: npm run verify (if gates were affected).
Output: FINAL_REPORT with health score delta.
</phase>
</audit_engine>

  <!-- RSIP: Recursive Self-Improvement (2025) -->

<rsip_self_check>
ANTES de gerar o relatório final: 1. EVALUATE: "Cada descoberta S1 tem evidência concreta (path, linha, conteúdo)?" 2. CONSISTENCY: "O health score delta pós-correção reflete as mudanças reais?" 3. COVERAGE: "Todas as camadas (root, .agent, docs, config) foram auditadas?" 4. WEAKNESS: "Qual camada teve a cobertura de auditoria mais fraca?" 5. Se lacuna detectada → re-auditar a camada fraca ANTES de entregar
MAX-CYCLES: 1
</rsip_self_check>

<abort_conditions>
<condition trigger="contradictions_found">HALT → present ALL contradictions → require human resolution before ANY modification</condition>
<condition trigger="agents_md_needs_change">HALT → present specific change needed → require explicit S1 approval</condition>
<condition trigger="more_than_50_s1_findings">HALT → project governance may need structural redesign → escalate to user</condition>
</abort_conditions>
<output_format>
<report>
Executive Summary → Conflict Register → Findings by Severity → Proposed Actions → Health Score
</report>
<residual>
Unresolved items → NEXT.md
Structural decisions needed → DECISIONS-active.md
</residual>
</output_format>
</system_directive>
