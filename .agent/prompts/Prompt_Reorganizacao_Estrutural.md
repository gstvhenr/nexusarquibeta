<thinking>
<analysis>
[VECTOR]: Engenharia de prompt para indução de comportamento cirúrgico-incremental em LLMs agentic. O objetivo é forçar o modelo a operar como um "cirurgião de filesystem" — cada diff é atômico, testado e reversível. Otimizado contra o anti-pattern primordial de vibe coding: big-bang refactors que quebram 40 imports de uma vez.
[OPTIMIZATION]: Decomposição da tarefa em "micro-cirurgias" de escopo binário (mover arquivo X → verificar gate → commit lógico → próximo). Saturação da atenção via checklist de pré-condição e pós-condição por operação. Injeção de gate-verification como barreira de progressão: o agente NÃO PODE avançar para o próximo arquivo sem evidência verde do gate anterior.
</analysis>
</thinking>

**> [REORGANIZAÇÃO ESTRUTURAL CAUTELOSA DO PROJETO]**

### FASE A: ANÁLISE DE INTENÇÃO (DEEP SCAN)

- **TARGET:** Reorganização incremental e segura de todos os arquivos do projeto para seus locais semanticamente corretos, sem regressão.
- **VETOR DE INFERÊNCIA:** Instanciação de um pipeline de "cirurgia de filesystem" — operando em micro-batches atômicos, onde cada batch contém no máximo 1 domínio e é seguido de verificação compulsória.
- **CONSTRAINTS DE I/O:** Mutação controlada. Cada operação de mover/renomear deve ser seguida de atualização de TODOS os imports afetados. Nenhum arquivo pode ser deletado — apenas movido.
- **CONSTRAINTS DE VERIFICAÇÃO:** Após cada batch, executar o gate canônico do projeto (`npm run verify` ou equivalente em `AGENTS.md`). Se o gate falhar, REVERTER o batch antes de prosseguir. O agente NÃO PODE avançar com gates vermelhos.
- **CONSTRAINTS DE ESCOPO:** O agente reorganiza APENAS a estrutura de diretórios e imports. Ele NÃO refatora lógica, NÃO altera nomes de componentes, NÃO modifica comportamento. O delta funcional de cada diff deve ser ZERO.
- **OBJETIVO FINAL:** Ao final da execução, cada arquivo do projeto deve residir no local prescrito pela convenção do projeto, com todos os imports resolvidos, barrel exports atualizados, e zero regressão nos gates.

_A compreensão da intenção está correta e de acordo com seus parâmetros?_

### FASE B: VETORES DE OTIMIZAÇÃO (PROMPT REFINEMENT)

#### NÍVEL 01 (REFATORAÇÃO SINTÁTICA)

[EXECUTION_OVERRIDE: SURGICAL_INCREMENTAL]
Modo de operação: micro-cirurgia atômica. Cada batch é um domínio. Cada domínio é verificado antes de prosseguir.

Antes de mover qualquer arquivo, execute uma auditoria completa do filesystem do projeto. Mapeie cada arquivo existente em `src/` e classifique-o de acordo com as seguintes categorias:

1. CORRETO: O arquivo já está no local adequado segundo a convenção do projeto.
2. DESLOCADO: O arquivo existe num diretório incorreto (ex: page solta na raiz de `pages/` quando deveria estar em `pages/{domínio}/`).
3. AMBÍGUO: A classificação correta não é determinística — requerer decisão humana.

Apresente este mapeamento completo ao usuário antes de tocar em qualquer arquivo. Aguarde confirmação explícita.

Após confirmação, execute a reorganização na seguinte ordem de prioridade:

P0. Types — mover/consolidar types dispersos (menor blast radius).
P1. Utils — funções puras sem dependência de React.
P2. Services — lógica de negócio (médio blast radius).
P3. Hooks — custom hooks (atenção a re-exports).
P4. Components — componentes UI (cuidado com barrel exports).
P5. Pages — view layer (maior blast radius — mover por último).

Para CADA arquivo movido:
a) Mover o arquivo para o local correto.
b) Atualizar TODOS os imports que referenciam o caminho antigo (use grep/search antes).
c) Atualizar barrel exports (`index.ts`) nos diretórios de origem e destino.
d) Executar o gate de verificação.
e) Reportar resultado: VERDE (prosseguir) ou VERMELHO (reverter e diagnosticar).

Nunca mova mais de 5 arquivos entre verificações. Preferir batches de 1-3.

#### NÍVEL 02 (EQUILÍBRIO HÍBRIDO)

```markdown
# SYS.DIRECTIVE: SURGICAL FILESYSTEM REORGANIZATION

> MODE: INCREMENTAL_ATOMIC | REGRESSION_TOLERANCE: ZERO

**1. PRE-FLIGHT AUDIT:**
Execute um scan exaustivo de `src/`. Para cada arquivo, determine:

- Path atual → Path ideal (baseado em naming convention + layer rules)
- Número de imports afetados pela movimentação
- Risk score: LOW (0-2 imports), MEDIUM (3-8), HIGH (9+)

_Output:_ Tabela de reorganização com colunas: [Arquivo | Local Atual | Local Ideal | Imports Afetados | Risk]. Ordene por risk ASC. Apresente ao usuário. NÃO prossiga sem aprovação.

**2. EXECUTION PROTOCOL (POR BATCH):**
_Batch Size:_ Máximo 1 domínio por iteração. Dentro do domínio, máximo 5 arquivos por sub-batch.
_Dependency Order:_ Types → Utils → Services → Hooks → Components → Pages.
_Para cada arquivo:_
2.1. `grep -r "antigo/path"` → localizar todos os consumers.
2.2. Mover arquivo. Manter nome original (não renomear).
2.3. Atualizar TODOS os imports encontrados em 2.1.
2.4. Atualizar/criar barrel export (`index.ts`) no diretório destino.
2.5. Remover re-export do barrel de origem (se aplicável).
2.6. Executar `npm run verify` (ou gate canônico).
2.7. Se VERDE → registrar em log de progresso → próximo arquivo.
2.8. Se VERMELHO → reverter todas as mudanças do sub-batch → diagnosticar → reportar ao usuário.

**3. POST-FLIGHT VALIDATION:**
Após completar todos os batches:
3.1. Executar gate canônico completo (lint + typecheck + test + build).
3.2. Verificar que NENHUM import usa path relativo com mais de 2 níveis (`../../..`).
3.3. Verificar que NENHUM arquivo `.tsx`/`.ts` está solto na raiz de `pages/` ou `components/`.
3.4. Regenerar `project-inventory.md`.
3.5. Apresentar diff summary ao usuário: [Arquivos movidos | Imports atualizados | Gates status].

**4. ABORT CONDITIONS (HARD STOP):**

- Mais de 3 sub-batches consecutivos com gate VERMELHO → PARAR. Reportar padrão sistêmico.
- Arquivo classificado como AMBÍGUO → PARAR. Solicitar decisão humana.
- Circular dependency detectada durante movimentação → PARAR. Não resolver inline.
```

#### NÍVEL 03 (RECRIAÇÃO TOTAL / GOD MODE)

<system_directive>
<constraints>
<flag>MODE_SURGICAL_INCREMENTAL</flag>
<flag>REGRESSION_TOLERANCE_ZERO</flag>
<flag>BATCH_SIZE_MAX_5</flag>
<flag>RENAME_PROHIBITED</flag>
<flag>LOGIC_MUTATION_PROHIBITED</flag>
<flag>FUNCTIONAL_DELTA_ZERO</flag>
</constraints>
<audit_phase>
<action>FULL_FILESYSTEM_SCAN of src/\*_/_</action>
<classification>
For each file F in src/: 1. Extract F.name, F.extension, F.currentPath 2. Infer F.category from naming convention: - _Service.ts → CATEGORY:SERVICE - use_.ts → CATEGORY:HOOK - *Page.tsx → CATEGORY:PAGE - *Modal.tsx → CATEGORY:COMPONENT - _Icon_.tsx → CATEGORY:UI_PRIMITIVE - _.test.ts(x) → CATEGORY:TEST (co-locate with source) - types/_.ts → CATEGORY:TYPE - utils/_.ts → CATEGORY:UTIL 3. Determine F.idealPath based on: - F.category + F.domain (extracted from F.name prefix) - Layer rules: `ARCHITECTURE.md` + `PLACEMENT_RULES.md` 4. If F.currentPath ≠ F.idealPath → Mark as DISPLACED 5. If F.domain is ambiguous → Mark as AMBIGUOUS → REQUIRE_HUMAN_INPUT
</classification>
<output>REORGANIZATION_MAP: sorted by risk ASC</output>
<gate>USER_APPROVAL_REQUIRED before proceeding</gate>
</audit_phase>
<execution_engine>
<order>TYPES → UTILS → SERVICES → HOOKS → COMPONENTS → PAGES</order>
<per_file_protocol> 1. SCAN: grep all consumers of current path 2. MOVE: relocate file to idealPath 3. PATCH: update ALL import statements in ALL consumers 4. BARREL: update/create index.ts in destination directory 5. CLEAN: remove stale re-export from origin barrel 6. GATE: execute canonical verification gate 7. BRANCH: - IF gate.status === GREEN → LOG_SUCCESS → NEXT_FILE - IF gate.status === RED → REVERT_BATCH → DIAGNOSE → HALT
</per_file_protocol>
<batch_rules> - Max 5 files per verification cycle - Max 1 domain per macro-batch - Test files MUST move with their source files (co-location) - Path alias (@/) MUST be used in all new imports
</batch_rules>
</execution_engine>
<post_flight>
<validation> 1. Full gate execution (lint → typecheck → test → build) 2. Assert: zero files in src/pages/_.tsx (root-level) 3. Assert: zero relative imports deeper than ../../ 4. Regenerate: .agent/memory/project-inventory.md
</validation>
<deliverable>
Summary table: [Domain | Files Moved | Imports Patched | Gate Status]
</deliverable>
</post_flight>
<abort_conditions>
<condition trigger="3_consecutive_red_gates">HARD_STOP → systemic pattern report</condition>
<condition trigger="ambiguous_classification">HARD_STOP → request human decision</condition>
<condition trigger="circular_dependency_detected">HARD_STOP → do not resolve inline</condition>
<condition trigger="barrel_export_conflict">HARD_STOP → present options to user</condition>
</abort_conditions>
</system_directive>
