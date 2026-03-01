<thinking>
<analysis>
[VECTOR]: Engenharia de prompt para meta-programação de projeto — o agente não reorganiza arquivos, ele programa as REGRAS que governam a organização futura. O alvo é o "DNA estrutural" do repositório: documentos prescritivos, scripts de enforcement, e configuração de CI que impeçam a entropia antes que ela ocorra. Otimizado para sistemas agent-first onde cada sessão é memoryless.
[OPTIMIZATION]: Inversão do vetor de controle — em vez de corrigir entropia post-hoc (reativo), o prompt injeta mecanismos de prevenção no repositório (proativo). O output é composto por artefatos de governança (docs + scripts + rules) que formam um sistema imunológico contra desorganização estrutural, independente do agente ou IDE que toque no projeto.
</analysis>
</thinking>

**> [IMUNIZAÇÃO ESTRUTURAL — DNA DO PROJETO]**

### FASE A: ANÁLISE DE INTENÇÃO (DEEP SCAN)

- **TARGET:** Incorporação de mecanismos de prevenção de entropia estrutural no DNA do projeto, garantindo que a organização se mantenha indefinidamente — independente de qual agente, IDE ou humano interaja com o codebase.
- **VETOR DE INFERÊNCIA:** Meta-programação de repositório. O agente não move arquivos — ele cria/modifica os DOCUMENTOS PRESCRITIVOS, SCRIPTS DE ENFORCEMENT e REGRAS AGÊNTICAS que governam onde cada arquivo DEVE ser criado. O alvo é o sistema imunológico do projeto, não o corpo.
- **CONSTRAINTS DE I/O:** Mutação PERMITIDA exclusivamente em arquivos de governança: `.agent/`, `docs/`, `ARCHITECTURE.md`, arquivos de configuração (`tsconfig.json`, etc). Código-fonte (`src/`) é READ-ONLY durante esta operação.
- **CONSTRAINTS DE ESCOPO:** O agente NÃO toca em código funcional. Ele produz 4 artefatos de governança: (1) Regras de localização prescritivas, (2) Script de validação estrutural, (3) Atualização de ARCHITECTURE.md, (4) Integração nos rules do agente.
- **OBJETIVO FINAL:** Ao final da execução, qualquer agente futuro que inicie uma sessão neste projeto deve ser capaz de responder deterministicamente: "Onde eu crio este arquivo?" — em menos de 5 segundos de leitura de contexto, com enforcement automático que rejeite violações.

_A compreensão da intenção está correta e de acordo com seus parâmetros?_

### FASE B: VETORES DE OTIMIZAÇÃO (PROMPT REFINEMENT)

#### NÍVEL 01 (REFATORAÇÃO SINTÁTICA)

[EXECUTION_OVERRIDE: META_GOVERNANCE]
Modo de operação: programação de regras, não de código. O output deve ser artefatos que governam o comportamento de agentes futuros.

Analise a estrutura atual do projeto, seus documentos de governança existentes (`ARCHITECTURE.md`, `.agent/rules/`, `AGENTS.md`, `docs/architecture.md`), e o output do debate das 3 mentes sobre organização estrutural. Sintetize tudo em 4 entregas concretas:

**ENTREGA 1 — PLACEMENT_RULES.md**
Crie o arquivo `docs/PLACEMENT_RULES.md` contendo uma árvore de decisão binária e exaustiva que responda: "dado um novo arquivo de tipo X pertencente ao domínio Y, em qual path exato eu o crio?". A árvore deve cobrir:

- Types/Interfaces
- Services (domain vs infrastructure)
- Hooks (global vs page-scoped)
- Components (ui primitives vs domain-specific)
- Pages
- Utils
- Test files (co-location rules)
- Constants
- Context providers

Formato: decision tree com perguntas binárias (SIM/NÃO). Sem prosa explicativa. Cada folha da árvore termina em um path concreto com exemplo. Máximo 150 linhas.

**ENTREGA 2 — Script de Validação Estrutural**
Crie um script (`scripts/validate-structure.ts` ou `.js`) que:

- Escaneie `src/` recursivamente
- Valide naming conventions (`*Service.ts` em `services/`, `use*.ts` em `hooks/`, etc)
- Valide que nenhum arquivo `.tsx` está solto na raiz de `pages/` ou `components/`
- Valide que test files estão co-localizados com seus sources
- Emita erros claros com path atual e path esperado
- Exit code 1 se houver violações, 0 se limpo

Integre este script no `package.json` como `"validate:structure"` e referencie no fluxo de verificação.

**ENTREGA 3 — Atualização de ARCHITECTURE.md**
Expanda o `ARCHITECTURE.md` atual (21 linhas) para incluir:

- Referência explícita ao `PLACEMENT_RULES.md`
- Mapa de domínios reconhecidos pelo projeto
- Regra explícita: "Antes de criar qualquer arquivo, consulte PLACEMENT_RULES.md"
- Seção "Structural Invariants" com as regras que NUNCA devem ser violadas

**ENTREGA 4 — Integração nas Agent Rules**
Atualize os arquivos em `.agent/rules/` e/ou `AGENTS.md` para incluir:

- Referência ao `PLACEMENT_RULES.md` como leitura obrigatória pré-criação de arquivo
- Referência ao `validate:structure` como gate obrigatório pré-merge
- Anti-pattern: "Criar arquivo sem consultar PLACEMENT_RULES.md"

Apresente o plano ao usuário antes de criar qualquer artefato. Aguarde aprovação.

#### NÍVEL 02 (EQUILÍBRIO HÍBRIDO)

```markdown
# SYS.DIRECTIVE: STRUCTURAL DNA EMBEDDING

> MODE: META_GOVERNANCE | SRC_MUTATION: DISABLED | TARGET: GOVERNANCE_ARTIFACTS

**1. CONTEXT INGESTION:**
Parse todos os documentos de governança existentes:

- `ARCHITECTURE.md` (raiz)
- `AGENTS.md` (raiz)
- `docs/architecture.md`
- `docs/architecture-screaming.md`
- `.agent/rules/*`
- `.agent/memory/project-inventory.md`
- `.agent/lessons-learned.md`

Extraia:

- Convenções de naming existentes (explícitas e implícitas)
- Regras de boundary já documentadas
- Gaps: regras que DEVERIAM existir mas NÃO estão documentadas
- Contradições: regras documentadas que conflitam entre si

_Output:_ Gap Analysis report. NÃO prossiga sem apresentar ao usuário.

**2. ARTEFATO 1 — PLACEMENT_RULES.md (docs/):**
_Formato:_ Decision Tree bináriO, máximo 150 linhas.
_Requisito:_ Cada decisão deve terminar em um path concreto com exemplo real do projeto.
_Teste de qualidade:_ Para cada arquivo existente em `src/`, a árvore deve produzir o path correto. Se não produzir → a árvore está incompleta.
_Seções obrigatórias:_

- Domains Registry (lista canônica de domínios reconhecidos)
- Decision Tree (pergunta binária → path)
- Naming Conventions (tabela: pattern → local obrigatório)
- Co-location Rules (test files, sub-components, page-scoped hooks)
- Anti-patterns (exemplOS concretos do que NÃO fazer)

**3. ARTEFATO 2 — validate-structure script:**
_Linguagem:_ TypeScript (executável via `tsx` ou `ts-node`).
_Validações obrigatórias:_
3.1. NENHUM .tsx/.ts na raiz de `src/pages/` (exceto index.ts)
3.2. NENHUM .tsx/.ts na raiz de `src/components/` (exceto index.ts)
3.3. Arquivos _Service.ts → DEVEM estar em `src/services/` ou `src/services/{subdir}/`
3.4. Arquivos use_.ts → DEVEM estar em `src/hooks/` ou `src/pages/*/hooks/`
3.5. Arquivos *.test.ts(x) → DEVEM estar co-localizados (mesmo diretório que o source)
3.6. Nenhum import relativo com mais de 2 níveis de profundidade
*Output:* Lista de violações com sugestão de path correto.
*Integration:\* Adicionar ao `package.json` scripts: `"validate:structure": "tsx scripts/validate-structure.ts"`

**4. ARTEFATO 3 — ARCHITECTURE.md expansion:**
_Ação:_ NÃO reescrever — EXPANDIR o existente.
_Adições:_

- Seção "Domains" — lista canônica: clientes, projetos, financeiro, agenda, marketing, supply-chain, propostas, orcamentos, documentos, configuracoes, comissoes, relatorios, tarefas
- Seção "Structural Invariants" — regras binarias que devem SEMPRE ser verdadeiras
- Seção "Governance Docs" — links para PLACEMENT_RULES.md e validate-structure
- Atualizar "Referências detalhadas" com novos docs

**5. ARTEFATO 4 — Agent Rules Integration:**
_Ação:_ Inserir em `.agent/rules/` ou `.agent/agents/` conforme mais apropriado:

- Nova regra: "Antes de criar arquivo → ler PLACEMENT_RULES.md"
- Nova regra: "Após criar arquivo → executar validate:structure"
- Novo anti-pattern: "Criar arquivo sem consultar PLACEMENT_RULES.md = VIOLAÇÃO"
- Referência ao validate:structure no gate canônico

**6. VALIDATION:**
Após criar todos os artefatos:
6.1. Executar `validate:structure` contra o estado atual do projeto
6.2. Verificar que PLACEMENT_RULES.md classifica corretamente pelo menos 90% dos arquivos existentes
6.3. Verificar que ARCHITECTURE.md não tem contradições internas
6.4. Apresentar relatório ao usuário
```

#### NÍVEL 03 (RECRIAÇÃO TOTAL / GOD MODE)

<system_directive>
<constraints>
<flag>SRC_CODE_READ_ONLY</flag>
<flag>GOVERNANCE_ARTIFACTS_WRITE_ENABLED</flag>
<flag>OUTPUT_TARGET_DOCS_AND_AGENT_CONFIG</flag>
<flag>FUNCTIONAL_DELTA_ZERO</flag>
</constraints>
<context_ingestion>
<sources>
<source>ARCHITECTURE.md</source>
<source>AGENTS.md</source>
<source>docs/architecture.md</source>
<source>docs/architecture-screaming.md</source>
<source>.agent/rules/_</source>
<source>.agent/memory/project-inventory.md</source>
<source>.agent/lessons-learned.md</source>
<source>src/\*\*/_ (structural scan only — no content read)</source>
</sources>
<extract> 1. EXISTING_CONVENTIONS: naming patterns, layer rules, barrel patterns 2. GAPS: undocumented structural decisions 3. CONTRADICTIONS: conflicting rules across documents 4. DOMAIN_REGISTRY: infer canonical domain list from filesystem
</extract>
<output>GAP_ANALYSIS_REPORT → present to user → GATE: require approval</output>
</context_ingestion>
<artifact_pipeline>
<artifact id="1" path="docs/PLACEMENT_RULES.md" priority="P0">
<format>BINARY_DECISION_TREE</format>
<max_lines>150</max_lines>
<required_sections>
<section>DOMAINS_REGISTRY — canonical list of project domains</section>
<section>DECISION_TREE — binary questions → concrete paths with examples</section>
<section>NAMING_CONVENTIONS — table: glob pattern → required location</section>
<section>CO_LOCATION_RULES — tests, sub-components, page-scoped hooks</section>
<section>ANTI_PATTERNS — concrete examples of violations with corrections</section>
</required_sections>
<quality_gate>
For each file F in src/:
IF decision_tree(F) ≠ F.currentPath AND F.currentPath is valid → tree is WRONG
IF decision_tree(F) = F.idealPath → tree is CORRECT
Threshold: ≥ 90% accuracy against existing codebase
</quality_gate>
</artifact>
<artifact id="2" path="scripts/validate-structure.ts" priority="P0">
<language>TypeScript</language>
<executor>tsx</executor>
<validations>
<rule id="S01">No .tsx/.ts files at root of src/pages/ (except index.ts)</rule>
<rule id="S02">No .tsx/.ts files at root of src/components/ (except index.ts)</rule>
<rule id="S03">_Service.ts files MUST reside in src/services/ or src/services/{subdir}/</rule>
<rule id="S04">use_.ts files MUST reside in src/hooks/ or src/pages/_/hooks/</rule>
<rule id="S05">_.test.ts(x) files MUST be co-located with source file</rule>
<rule id="S06">No relative imports deeper than ../../ (prefer @/ alias)</rule>
<rule id="S07">Every subdirectory with >1 file MUST have index.ts barrel</rule>
</validations>
<output_format>
For each violation:
[RULE_ID] VIOLATION: {currentPath}
→ EXPECTED: {expectedPath}
→ FIX: move to {expectedPath} and update imports
</output_format>
<exit_code>
violations.length === 0 ? 0 : 1
</exit_code>
<integration>
package.json → scripts → "validate:structure": "tsx scripts/validate-structure.ts"
AGENTS.md → canonical gate chain → append validate:structure
</integration>
</artifact>
<artifact id="3" path="ARCHITECTURE.md" priority="P1">
<action>EXPAND — do NOT rewrite</action>
<additions>
<section name="Domains">Canonical domain list with descriptions</section>
<section name="Structural Invariants">Binary rules that MUST always be true</section>
<section name="Governance">Links to PLACEMENT_RULES.md, validate-structure</section>
<section name="File Creation Protocol">
Step 1: Consult PLACEMENT_RULES.md decision tree
Step 2: Create file at determined path
Step 3: Create/update barrel export
Step 4: Run validate:structure
</section>
</additions>
</artifact>
<artifact id="4" target=".agent/rules/" priority="P1">
<action>INSERT rules into existing governance layer</action>
<new_rules>
<rule type="PRE_CREATE">
Before creating ANY new file in src/ → READ docs/PLACEMENT_RULES.md
Determine exact path from decision tree BEFORE writing first line
</rule>
<rule type="POST_CREATE">
After creating ANY new file → run validate:structure
If violation detected → move file to correct location BEFORE proceeding
</rule>
<rule type="ANTI_PATTERN">
Creating file without consulting PLACEMENT_RULES.md = PROTOCOL VIOLATION
Creating file in root of pages/ or components/ = STRUCTURAL VIOLATION
Creating _Service.ts outside services/ = BOUNDARY VIOLATION
Creating use_.ts outside hooks/ or page-scoped hooks/ = CONVENTION VIOLATION
</rule>
<rule type="GATE_INTEGRATION">
validate:structure MUST pass before declaring any task complete
Structural violations are blocking — same severity as typecheck errors
</rule>
</new_rules>
</artifact>
</artifact_pipeline>
<post_flight>
<validation> 1. Execute validate:structure against current codebase → capture baseline violations 2. Verify PLACEMENT_RULES.md coverage ≥ 90% of existing files 3. Verify ARCHITECTURE.md has no internal contradictions 4. Verify .agent/rules reference PLACEMENT_RULES.md 5. Verify package.json contains validate:structure script
</validation>
<deliverable>
Summary: [Artifacts Created | Baseline Violations Found | Coverage % | Integration Points]
</deliverable>
</post_flight>
<abort_conditions>
<condition trigger="contradictions_in_existing_rules">HALT → present contradictions → request human resolution</condition>
<condition trigger="coverage_below_70_percent">HALT → decision tree is insufficient → iterate</condition>
<condition trigger="gate_chain_conflict">HALT → validate:structure conflicts with existing gates → resolve</condition>
</abort_conditions>
</system_directive>
