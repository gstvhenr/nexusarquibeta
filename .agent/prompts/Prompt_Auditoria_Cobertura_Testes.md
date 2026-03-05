# Prompt_Auditoria_Cobertura_Testes.md

> **DOCUMENT TYPE:** Agentic Execution Prompt — Test Coverage Audit Protocol
> **ACTIVATION:** Paste the content of the selected LEVEL into the chat to initiate.
> **PHASES:** PHASE 1 = Read-only audit + report. PHASE 2 = Triggered by user to fix/create tests.

---

## ⚙️ ENGENHARIA DE PROMPT — NOTAS TÉCNICAS

Este prompt utiliza as seguintes técnicas de engenharia de prompt avançadas:

| Técnica                          | Aplicação                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| **State Machine Flags**          | `MUTATION_LOCK` → garante read-only na Fase 1                                            |
| **Pseudo-XML Constraint Blocks** | Delimita com clareza os escopos do agente                                                |
| **Chain-of-Thought forçado**     | O agente deve justificar cada ausência de teste detectada                                |
| **Contextual Skill Injection**   | Aciona `@[skills/testing-patterns]`, `@[skills/clean-code]` e `@[skills/webapp-testing]` |
| **Workflow Binding**             | Vincula ao `/test`, `/health-check` e `/audit-coverage` para reutilizo                   |
| **Two-Phase Gating**             | Fase 1 é somente análise; Fase 2 só inicia após confirmação explícita do usuário         |
| **Canonical Gate Protocol**      | Fecha apenas com `npm run verify` verde, idêntico ao AGENTS.md                           |
| **Structured Output Mandate**    | Força output em tabelas e seções fixas — elimina resposta em prosa não escaneável        |
| **Buffer of Thoughts** _(2024)_  | Template reutilizável de análise por arquivo — raciocínio estruturado, não ad-hoc        |
| **Context-Aware Decomposition**  | Fórmula de criticidade baseada em tipo de lógica + dependentes + frequência              |
| **RSIP** _(2025)_                | Autoavaliação iterativa do relatório antes de entregar ao usuário                        |
| **Anti-Hallucination Guards**    | Verificação obrigatória via filesystem; classificação sem evidência é proibida           |
| **Evidence Protocol**            | Toda classificação deve citar o path verificado como prova                               |

---

## 📋 INVENTÁRIO DE ASSETS DISPONÍVEIS

> O agente ativado por este prompt DEVE fazer parse destes recursos antes de qualquer análise.

### Skills (LEITURA OBRIGATÓRIA antes da Fase 1)

- `@[skills/testing-patterns]` — Padrões de teste, TDD, mocks, ciclo RED-GREEN-REFACTOR para Nexus-Arqui
  - **INSTRUÇÃO:** Leia o conteúdo de `.agent/skills/testing-patterns/SKILL.md` ANTES de iniciar. Aplique os padrões de lá como critério de avaliação de qualidade dos testes existentes.
- `@[skills/clean-code]` — Código conciso, AAA Pattern, pirâmide de testes
  - **INSTRUÇÃO:** Leia `.agent/skills/clean-code/SKILL.md`. Use como régua para avaliar se testes existentes seguem boas práticas.
- `@[skills/webapp-testing]` — Principios E2E, Playwright, fluxos críticos do ERP
  - **INSTRUÇÃO:** Leitura opcional. Use como referência para avaliar gaps de cobertura E2E nos fluxos críticos listados na skill.
- `@[skills/plan-writing]` — Usado na Fase 2 para criar plano de execução de testes
- `@[skills/behavioral-modes]` — Adapta o comportamento entre AUDIT (Fase 1) e EXECUTE (Fase 2)

### Workflows

- `/test` — Geração e execução de testes. Invocado na Fase 2 como pipeline de execução.
- `/health-check` — Diagnóstico geral de qualidade. Complementar à auditoria de testes.
- `/audit-coverage` — Workflow wrapper que invoca este prompt (para invocação via slash command).

### Docs de Governança

- `AGENTS.md` — Extrair comando canônico de verificação (`npm run test` / `npm run verify`). **LEITURA OBRIGATÓRIA EM TODOS OS NÍVEIS.**

### Tarefas / Tasks

- Verificar a existência de arquivos em `.agent/tasks/` que descrevam work-in-progress relacionado a testes antes de criar novos.

---

## ── NÍVEL 01 — FAST SCAN (Modo Direto) ──

```
[EXECUTION_OVERRIDE: STRICT_READ_ONLY | PHASE_1_ONLY]

Você é um agente de auditoria de cobertura de testes. Sua única missão nesta fase é ANALISAR e REPORTAR. É estritamente proibida a criação, modificação ou exclusão de qualquer arquivo.

LEITURA PRÉVIA OBRIGATÓRIA:
Antes de iniciar qualquer análise, leia efetivamente o conteúdo destes arquivos:
1. .agent/skills/testing-patterns/SKILL.md → aplique como critério de qualidade
2. .agent/skills/clean-code/SKILL.md → use como régua de boas práticas
3. AGENTS.md → extraia o comando canônico de verificação de testes

SKILLS ATIVAS: @[skills/testing-patterns] | @[skills/clean-code]

<VERIFICACAO_OBRIGATORIA>
Regras anti-alucinação para classificação de cobertura:

1. Para cada classificação de COVERED (✅), você DEVE ter verificado a existência do arquivo de teste via filesystem real (glob, find, ou listagem de diretório). Classificações baseadas em suposição ou memória são PROIBIDAS.
2. Se não conseguiu verificar a existência de um arquivo de teste → classificar como UNKNOWN (❓), NUNCA como COVERED.
3. Não invente nomes de arquivos de teste. Liste apenas os que existem de fato.
4. Se houver dúvida sobre se um arquivo de teste é não-trivial (ex: arquivo vazio, apenas imports) → classificar como BROKEN (⚠️).
</VERIFICACAO_OBRIGATORIA>

<PROTOCOLO_EVIDENCIA>
Cada classificação deve ser fundamentada:

1. ✅ COVERED → informar o path completo do arquivo de teste verificado.
2. ❌ UNCOVERED → confirmar que NENHUM arquivo .test.ts/.test.tsx existe no diretório.
3. ⚠️ BROKEN → informar path + razão (ex: "arquivo vazio", "somente imports").
4. ❓ UNKNOWN → declarar "não foi possível verificar" — nunca forçar uma classificação.
</PROTOCOLO_EVIDENCIA>

PROTOCOLO DE EXECUÇÃO:

1. Faça o parse recursivo de `src/frontend/` e identifique TODOS os arquivos `.ts` e `.tsx` que NÃO sejam arquivos de teste (excluir padrões `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`, `*.usage.test.ts`).

2. Para cada arquivo encontrado, verifique VIA FILESYSTEM REAL se existe um arquivo de teste correspondente no mesmo diretório.

3. Agrupe os resultados por CAMADA:
   - `hooks/`
   - `services/` (raiz)
   - `services/finance/`
   - `services/infrastructure/`
   - `utils/`
   - `components/ui/`
   - `pages/` (recursivo)
   - `context/`
   - `types/`

4. Para cada camada, retorne:
   - Lista de arquivos COM teste ✅ (com path do teste verificado)
   - Lista de arquivos SEM teste ❌
   - Percentual de cobertura de arquivos na camada

5. Retorne o TOTAL GERAL de cobertura ao final.

OUTPUT OBRIGATÓRIO: Tabelas markdown por camada + resumo final. Sem prosa desnecessária.

Aguarde a confirmação do usuário antes de iniciar qualquer ação corretiva.
```

---

## ── NÍVEL 02 — AUDIT PROTOCOL (Modo Híbrido) ──

```markdown
# SYS.DIRECTIVE: COVERAGE_AUDIT_PROTOCOL_V2

> IO_STATE: CHAT_ONLY | MUTATION_LOCK: ENABLED | PHASE: 1_OF_2

## LEITURA PRÉVIA OBRIGATÓRIA

ANTES de iniciar qualquer análise, leia efetivamente o conteúdo destes arquivos:

1. `.agent/skills/testing-patterns/SKILL.md` → aplique padrões como critério de avaliação
2. `.agent/skills/clean-code/SKILL.md` → use como régua de boas práticas
3. `AGENTS.md` → extraia o comando canônico de verificação de testes
4. `.agent/tasks/` → verifique tasks abertas relacionadas a testes (não duplicar trabalho)

Aplique os padrões aprendidos nestas skills como CRITÉRIO DE AVALIAÇÃO durante a auditoria.

## CONTEXT INGESTION

Parse passivo e completo de:

- `src/frontend/**` (excluir `node_modules/`, `dist/`, `*.d.ts`)
- `.agent/skills/testing-patterns/SKILL.md` → aplicar padrões
- `.agent/tasks/` → verificar tasks abertas relacionadas a testes
- `AGENTS.md` → extrair comando canônico de verificação (`npm run test` / `npm run verify`)

## COGNITIVE ROLE

Você é o **Test Coverage Auditor** do projeto Nexus-Arqui.
Sua especialidade é auditoria sistemática de cobertura por camada arquitetural.
Você não opina sobre implementação nesta fase — apenas mapeia e reporta com precisão cirúrgica.

## GUARDRAILS ANTI-ALUCINAÇÃO

<VERIFICACAO_OBRIGATORIA>

1. Para CADA arquivo, verifique a existência do teste correspondente VIA FILESYSTEM REAL (glob, find, ou listagem de diretório). Classificações baseadas em suposição são PROIBIDAS.
2. Se não conseguiu verificar → classificar como UNKNOWN (❓), NUNCA como COVERED.
3. Não invente nomes de arquivos de teste. Liste apenas os que existem de fato.
4. Se houver dúvida sobre qualidade do teste (vazio, só imports) → classificar como BROKEN (⚠️).
5. ANTES de apresentar o relatório: releia cada classificação e confirme que possui evidência filesystem para cada ✅.
   </VERIFICACAO_OBRIGATORIA>

<PROTOCOLO_EVIDENCIA>
Cada classificação deve ser fundamentada com evidência:

1. ✅ COVERED → citar o path completo do arquivo de teste verificado.
2. ❌ UNCOVERED → confirmar via listagem que nenhum .test.ts/.test.tsx existe.
3. ⚠️ BROKEN → citar path + razão (ex: "arquivo vazio", "somente imports", "testes falhando").
4. ❓ UNKNOWN → declarar "não foi possível verificar no filesystem".
   </PROTOCOLO_EVIDENCIA>

## EXECUTION PIPELINE — FASE 1

### STEP 1: LAYER DISCOVERY

Enumere cada arquivo implementado em `src/frontend/` agrupado pela camada:
`hooks` | `services` | `services/finance` | `services/infrastructure` | `utils` | `components/ui` | `pages` | `context` | `types`

### STEP 2: COVERAGE MAPPING

Para cada arquivo `.ts` / `.tsx` (excluindo test, spec, `index.ts`, `*.d.ts`):

- Verifique VIA FILESYSTEM a existência de arquivo `*.test.ts` / `*.test.tsx` correspondente
- Classifique: ✅ (coberto — com path do teste) | ❌ (sem cobertura) | ⚠️ (test existe mas broken) | ❓ (não verificável)

### STEP 3: REPORT GENERATION

Produza o relatório estruturado:
```

## 📊 RELATÓRIO DE COBERTURA DE TESTES — NEXUS-ARQUI

### [CAMADA] hooks/

| Arquivo   | Status  | Evidência (path do teste)                  |
| --------- | ------- | ------------------------------------------ |
| useXxx.ts | ✅ / ❌ | `src/frontend/hooks/useXxx.test.ts` ou N/A |

**Cobertura da camada: X/Y (Z%)**

[Repita para cada camada]

---

## 🏁 RESUMO EXECUTIVO

| Camada    | Arquivos | Com Teste | Sem Teste | Cobertura |
| --------- | -------- | --------- | --------- | --------- |
| hooks/    | X        | X         | X         | X%        |
| ...       |          |           |           |           |
| **TOTAL** | **X**    | **X**     | **X**     | **X%**    |

```

### STEP 4: GATE
Exiba ao final:
> ⏸️ **FASE 1 CONCLUÍDA.** Nenhum arquivo foi alterado.
> Para prosseguir com a criação ou correção de testes, responda: **"Prosseguir"** ou especifique quais camadas priorizar.
```

---

## ── NÍVEL 03 — FULL AUDIT ENGINE (God Mode) ──

```xml
<sys.directive id="NEXUS_TEST_AUDIT_ENGINE_V3">

  <constraints>
    <flag>STATE_READ_ONLY_ENFORCED</flag>
    <flag>OUTPUT_ROUTING_STDOUT</flag>
    <flag>TOOL_USE_MUTATION_DISABLED</flag>
    <flag>PHASE_GATE_ACTIVE: REQUIRE_USER_CONFIRMATION_BEFORE_PHASE_2</flag>
  </constraints>

  <mandatory_pre_read>
    ANTES de iniciar qualquer análise, o agente DEVE ler efetivamente:
    1. .agent/skills/testing-patterns/SKILL.md → aplicar padrões como critério de avaliação
    2. .agent/skills/clean-code/SKILL.md → usar como régua de boas práticas
    3. AGENTS.md → extrair comando canônico de verificação
    4. .agent/tasks/ → verificar tasks abertas de testes (não duplicar trabalho)
    5. .agent/memory/project-inventory.md → verificar hooks/services registrados

    Estes padrões devem ser APLICADOS como critério durante a auditoria,
    não apenas listados como referência.
  </mandatory_pre_read>

  <skill_injection>
    <skill ref="@[skills/testing-patterns]" priority="P0" read="MANDATORY_BEFORE_START" />
    <skill ref="@[skills/clean-code]" priority="P1" read="MANDATORY_BEFORE_START" />
    <skill ref="@[skills/webapp-testing]" priority="P2" use_in="OPTIONAL_E2E_LAYER" />
    <skill ref="@[skills/plan-writing]" priority="P2" use_in="PHASE_2_ONLY" />
  </skill_injection>

  <workflow_binding>
    <workflow ref="/test" activation="PHASE_2_PIPELINE" />
    <workflow ref="/health-check" activation="COMPLEMENTARY" />
    <workflow ref="/audit-coverage" activation="SELF_REFERENCE" />
  </workflow_binding>

  <context_ingestion>
    <source>src/frontend/**/*.ts</source>
    <source>src/frontend/**/*.tsx</source>
    <exclude>*.test.ts | *.test.tsx | *.spec.ts | *.d.ts | node_modules/ | dist/</exclude>
    <meta_sources>
      <read>AGENTS.md → extrair canonical test command</read>
      <read>.agent/skills/testing-patterns/SKILL.md</read>
      <read>.agent/skills/clean-code/SKILL.md</read>
      <read>.agent/tasks/ → verificar tasks de teste em aberto</read>
      <read>.agent/memory/project-inventory.md → verificar hooks/services registrados</read>
    </meta_sources>
  </context_ingestion>

  <anti_hallucination id="VERIFICACAO_OBRIGATORIA">
    Guardrails obrigatórios para evitar fabricação de classificações:

    1. VERIFICAÇÃO FILESYSTEM: Para CADA classificação de COVERED (✅), o agente
       DEVE ter verificado a existência do arquivo de teste via filesystem real
       (glob, find, ou listagem de diretório). Classificações baseadas em suposição,
       memória ou inferência são ESTRITAMENTE PROIBIDAS.

    2. FALLBACK SEGURO: Se não conseguiu verificar a existência de um arquivo de
       teste → classificar como UNKNOWN (❓), NUNCA como COVERED.

    3. SEM INVENÇÃO: Não invente nomes de arquivos de teste. Liste apenas os que
       existem de fato no filesystem.

    4. TESTE VAZIO: Se houver dúvida sobre se um arquivo de teste é não-trivial
       (ex: arquivo vazio, apenas imports, sem assertions) → classificar como BROKEN (⚠️).

    5. AUTOCHECAGEM: ANTES de apresentar o relatório, releia CADA classificação ✅
       e confirme que possui evidência filesystem. Se não tiver → rebaixar para ❓.
  </anti_hallucination>

  <evidence_protocol id="PROTOCOLO_EVIDENCIA">
    Toda classificação deve ser fundamentada com evidência verificável:

    1. ✅ COVERED → OBRIGATÓRIO: citar o path completo do .test.ts/.test.tsx verificado.
    2. ❌ UNCOVERED → confirmar via listagem de diretório que nenhum arquivo de teste existe.
    3. ⚠️ BROKEN → citar path do teste + razão específica (ex: "0 assertions", "vazio").
    4. ❓ UNKNOWN → declarar "verificação filesystem não conclusiva" + sugerir como verificar.

    Regra: classificação SEM evidência = classificação INVÁLIDA. Não apresentar ao usuário.
  </evidence_protocol>

  <phase id="1" name="AUDIT" state="READ_ONLY">
    <cognitive_role>
      Test Coverage Auditor — especialista em pirâmide de testes (Unit > Integration > E2E)
      e nos padrões AAA do Nexus-Arqui. Opera com precisão cirúrgica. Zero especulação.
      Aplica os critérios de qualidade lidos em @[skills/testing-patterns] e @[skills/clean-code].
    </cognitive_role>

    <layer_taxonomy>
      <layer id="L1">hooks/</layer>
      <layer id="L2">services/ (raiz)</layer>
      <layer id="L3">services/finance/</layer>
      <layer id="L4">services/infrastructure/</layer>
      <layer id="L5">utils/</layer>
      <layer id="L6">components/ui/</layer>
      <layer id="L7">pages/ (recursivo)</layer>
      <layer id="L8">context/</layer>
      <layer id="L9">types/ e outros</layer>
    </layer_taxonomy>

    <for_each_file>
      <classify>
        COVERED     → arquivo .test.(ts|tsx) correspondente existe (VERIFICADO VIA FILESYSTEM) e é não-trivial
        UNCOVERED   → nenhum arquivo de teste correspondente existe (CONFIRMADO VIA FILESYSTEM)
        BROKEN      → test file existe mas contém erros conhecidos, está vazio, ou sem assertions
        UNKNOWN     → não foi possível verificar via filesystem — NUNCA classificar como COVERED
      </classify>

      <!-- Buffer of Thoughts (NeurIPS 2024): template reutilizável por arquivo -->
      <analysis_template reuse="true">
        Para cada arquivo, preencher este template (não inventar formato):
        ┌──────────────────────────────────────────────────┐
        │ ARQUIVO:      [nome]                             │
        │ CAMADA:       [hooks/services/pages/...]          │
        │ STATUS:       [COVERED | UNCOVERED | BROKEN | UNKNOWN] │
        │ EVIDÊNCIA:    [path do .test.ts verificado ou "N/A"] │
        │ DEPENDENTES:  [N arquivos que importam este]     │
        │ TIPO LÓGICA:  [business | UI | infra | glue]    │
        │ CRITICIDADE:  [usar fórmula abaixo]              │
        └──────────────────────────────────────────────────┘
      </analysis_template>

      <!-- Context-Aware Decomposition: fórmula de criticidade -->
      <criticality_formula>
        Se tipo=business E dependentes>5  → CRÍTICA
        Se tipo=business E dependentes≤5  → ALTA
        Se tipo=infra   E dependentes>3   → ALTA
        Se tipo=UI      E dependentes>10  → MÉDIA
        Demais                            → BAIXA

        SELF-CONSISTENCY: se houver dúvida entre dois níveis → usar o mais alto.
      </criticality_formula>
    </for_each_file>

    <e2e_coverage_layer optional="true">
      Se @[skills/webapp-testing] foi lida, avaliar adicionalmente:
      - Os 4 fluxos críticos do ERP (CRUD Projetos, Criação Proposta, Dashboard, Login)
        possuem cobertura E2E?
      - Reportar como seção separada "Cobertura E2E" no relatório.
      - Esta seção é INFORMATIVA — não altera o percentual de cobertura unit.
    </e2e_coverage_layer>

    <output_contract>
      <format>Tabelas markdown por camada com colunas: Arquivo | Status | Evidência | Criticidade</format>
      <summary_table>Linha por camada + linha TOTAL com percentual geral</summary_table>
      <priority_list>Top-5 arquivos sem teste de maior risco arquitetural</priority_list>
      <no_prose>Suprimir introdução, conclusão narrativa e meta-comentários sobre o prompt</no_prose>
    </output_contract>

    <!-- RSIP: Recursive Self-Improvement (2025) -->
    <rsip_self_check>
      ANTES de apresentar o relatório ao usuário:
      1. EVIDENCE: Cada classificação ✅ possui evidência filesystem? Se não → rebaixar para ❓.
      2. EVALUATE: Releia o relatório — cada classificação de criticidade é coerente com a fórmula?
      3. CONSISTENCY: O percentual total bate com a soma das camadas?
      4. TOP-5: Os 5 arquivos mais críticos sem teste são realmente os mais impactantes?
      5. Se inconsistência detectada → corrigir ANTES de apresentar.
      MAX-CYCLES: 1 (não iterar mais que uma vez)
    </rsip_self_check>

    <phase_gate>
      Exibir ao final da Fase 1:
      ⏸️ AUDIT COMPLETO. Estado atual mapeado. Nenhum arquivo foi criado ou modificado.
      → Para ativar a Fase 2 (criação/correção de testes), diga "Prosseguir" ou especifique camadas de prioridade.
    </phase_gate>
  </phase>

  <phase id="2" name="EXECUTE" state="MUTATION_ENABLED" activation="USER_TRIGGER_REQUIRED">
    <trigger_keywords>Prosseguir | Continuar | Fix testes | Criar testes | Corrigir</trigger_keywords>

    <pre_execution_checklist>
      1. Verificar .agent/tasks/ para tasks abertas de teste → não duplicar trabalho
      2. Verificar .agent/memory/project-inventory.md → confirmar artefatos existentes
      3. Definir escopo (todas as camadas ou subset confirmado pelo usuário)
      4. Ler .agent/workflows/test.md → usar como pipeline de execução para cada arquivo
    </pre_execution_checklist>

    <execution_protocol>
      1. Ativar @[skills/plan-writing] → gerar plano incremental por camada
      2. Para cada arquivo UNCOVERED (por ordem de criticidade descendente):
         a. Seguir o pipeline definido no workflow /test:
            i.   Analisar o código (funções, hooks, componentes, edge cases, dependências)
            ii.  Gerar casos de teste (happy path, erro, edge cases, fixtures canônicas)
            iii. Criar <arquivo>.test.ts seguindo padrão AAA + @[skills/testing-patterns]
         b. Executar `npm run test -- --run <arquivo>` para validar (não apenas criar)
         c. Se BROKEN: diagnosticar causa, corrigir, re-executar
      3. Após cada camada: executar gate parcial `npm run test`
      4. Ao final: executar gate canônico `npm run verify` — sem verde, não declarar conclusão
    </execution_protocol>

    <contract_discipline>
      - Novos test files devem ser auto-suficientes: NÃO importar fixtures de outros módulos
        sem verificar que existem em src/test/fixtures/
      - Alterar golden-fixtures.test.ts apenas se houver mudança de contrato documentada
    </contract_discipline>

    <output_contract>
      Relatório de execução: lista de arquivos criados/corrigidos + resultado do gate final
    </output_contract>
  </phase>

</sys.directive>
```

---

## 📌 COMO USAR ESTE PROMPT

1. Escolha o **Nível** adequado à complexidade desejada (01 = rápido, 03 = máximo)
2. Cole o conteúdo do nível selecionado no chat
3. O agente executará a **Fase 1** automaticamente (read-only)
4. Após revisar o relatório, diga **"Prosseguir"** para ativar a **Fase 2**

> **Dica:** Use o Nível 03 quando for fazer uma auditoria completa antes de um release ou após um refactor estrutural significativo.

> **Alternativa:** Use o workflow `/audit-coverage` para invocar diretamente via slash command sem precisar colar o prompt.
