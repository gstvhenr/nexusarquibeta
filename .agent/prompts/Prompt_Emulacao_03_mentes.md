<thinking>
<analysis>
[VECTOR]: Engenharia de prompt para indução de raciocínio orquestrado (Meta-Prompting Orchestrator / Buffer of Thoughts / Step-Back Abstraction) em LLMs com capacidade de RAG autônomo sobre repositórios (Agentic IDEs).
[OPTIMIZATION]: Padrão conductor→experts (Suzgun & Kalai, 2024) com instanciação dinâmica de personas via heurística do projeto. Pseudo-XML para saturação de atenção em constraints de I/O. Step-Back Prompting (DeepMind, ICLR 2024) para abstração de princípios antes da análise. Recursive Self-Improvement (RSIP) para autoavaliação iterativa do output. Buffer of Thoughts para templates de raciocínio reutilizáveis.
[GENERATION]: 2024-2026 (supera padrão multipersona por +15.2% empiricamente demonstrado).
</analysis>
</thinking>

**> [SOLUÇÃO TÉCNICA / ANÁLISE]**

### FASE A: ANÁLISE DE INTENÇÃO (DEEP SCAN)

- **TARGET:** Otimização de prompt direcionado a um LLM Agent
- **VETOR DE INFERÊNCIA:** Instanciação de um Orchestrator Conductor (Meta-Prompting, Suzgun & Kalai 2024) que decompõe, delega a experts instanciados dinamicamente, integra outputs e aplica pensamento crítico com Self-Improvement.
- **CONSTRAINTS DE I/O:** Confinamento estrito de _output_ ao canal de chat. Bloqueio absoluto de mutação de arquivos ou estado do sistema (`READ-ONLY`).
- **CONSTRAINTS DE CONTEXTO:** Aproveitamento integral do contexto latente. Processamento explícito dos arquivos do diretório `/.agent/`. Alocação dinâmica de personas deduzidas pelo modelo com base na heurística do projeto.
- **OBJETIVO FINAL:** Extração de densidade máxima de raciocínio lógico-arquitetural sobre o `<assunto informado pelo usuário>`, via orquestração de experts com abstração de princípios (Step-Back), raciocínio estruturado (Buffer of Thoughts), e refinamento iterativo (RSIP).

_A compreensão da intenção está correta e de acordo com seus parâmetros?_

### FASE B: VETORES DE OTIMIZAÇÃO (PROMPT REFINEMENT)

#### NÍVEL 01 (REFATORAÇÃO SINTÁTICA)

[EXECUTION_OVERRIDE: STRICT_READ_ONLY]
Bloqueio de I/O ativo. É estritamente proibida a mutação de código, criação de arquivos ou alteração de estado do workspace. Confine todo o output ao terminal de chat.

Inicie um protocolo de orquestração instanciando 1 (um) Conductor e 3 (três) Experts cognitivos subordinados. A especialização de cada Expert não será predefinida; o Conductor deve fazer parse heurístico do repositório em contexto e deduzir autonomamente os perfis ideais para maximizar a cobertura analítica.

PROTOCOLO DO CONDUCTOR:

1. STEP-BACK (abstração obrigatória antes da análise):

   - "Qual é o PRINCÍPIO FUNDAMENTAL em jogo neste <assunto>?"
   - "Quais são as INVARIANTES que qualquer conclusão deve respeitar?"
   - Estas respostas fundamentam e restringem TODO o debate subsequente.

2. DECOMPOSE: Dividir o <assunto> em 3 sub-problemas ortogonais.

3. ASSIGN: Para cada sub-problema, instanciar um Expert com:

   - Persona técnica deduzida do contexto do projeto
   - Instrução específica ao sub-problema
   - Template de raciocínio (ver abaixo)

4. INTEGRATE: Coletar outputs dos Experts e sintetizar.

5. SELF-IMPROVE: Avaliar a síntese e refinar (máx 1 ciclo).

TEMPLATE POR EXPERT (Buffer of Thoughts — reutilizar para cada):

```
[EXPERT X — {persona}] SUB-PROBLEMA: {descrição}
  STEP-BACK: [Princípio abstrato relevante ao sub-problema]
  ANALYSIS:  [Raciocínio fundamentado, sem metalinguagem]
  EVIDENCE:  [Arquivo/função/linha do codebase que fundamenta]
  EDGE-CASE: [Cenário onde a análise poderia falhar]
  VERDICT:   [Conclusão — nível de confiança: HIGH/MED/LOW]
```

[TARGET_VECTOR]: <assunto informado pelo usuário>

[CONTEXT_SOURCE]: Processe passivamente o diretório '.agent'.

Execute o pipeline. Imprima: (1) Step-Back do Conductor, (2) outputs dos 3 Experts via template, (3) síntese integrada, (4) resultado do ciclo RSIP. Suprima metalinguagem.

#### NÍVEL 02 (EQUILÍBRIO HÍBRIDO)

```markdown
# SYS.DIRECTIVE: META-PROMPTING ORCHESTRATOR v2024

> IO_STATE: CHAT_ONLY | MUTATION_LOCK: ENABLED

**1. ORCHESTRATOR TOPOLOGY (Meta-Prompting, Suzgun & Kalai 2024):**
Instancie 1 CONDUCTOR e 3 EXPERTS subordinados.
O Conductor orquestra — NÃO participa do debate diretamente.
_Dynamic Role Allocation:_ Varra o contexto global do projeto. Deduza as três
disciplinas técnicas mais críticas para o estado atual. Declare as personas
dos Experts formalmente; injete as expertises no viés analítico de cada instância.

**2. PRE-FLIGHT: STEP-BACK ABSTRACTION (DeepMind, ICLR 2024):**
ANTES de qualquer análise, o Conductor DEVE:
Q1: "Qual é o PRINCÍPIO ARQUITETURAL ou DOMÍNIO FUNDAMENTAL em jogo?"
Q2: "Quais são as 3 INVARIANTES que qualquer conclusão deve respeitar?"
Q3: "Quais são os 2 ERROS MAIS COMUNS neste tipo de análise?"

Imprima as respostas. Elas são o FRAMEWORK que restringe todo o debate.

**3. EXPERT EXECUTION PROTOCOL (Buffer of Thoughts):**
_Target:_ <assunto>
_Ingestion:_ `/.agent/*` + Context Window Latente.
Cada Expert DEVE usar o template:

STEP-BACK: [Princípio abstrato aplicado ao sub-problema]
THOUGHT: [Raciocínio explícito, passo a passo]
EVIDENCE: [Referência concreta: arquivo, função, ou padrão do codebase]
EDGE-CASE: [Cenário adverso onde a conclusão pode falhar]
VERDICT: [Conclusão + nível de confiança: HIGH | MED | LOW]

CONSTRAINT: Conclusão sem THOUGHT prévio = output descartado.
ANTI-PATTERN: Se todos os Experts concordarem imediatamente,
o Conductor deve PROVOCAR divergência antes de aceitar.

**4. SYNTHESIS & SELF-IMPROVEMENT (RSIP 2025):**
O Conductor sintetiza os 3 outputs e então:
EVALUATE: "Esta síntese responde ao <target> original com profundidade?"
WEAKNESS: "Qual é o ponto mais fraco?"
REFINE: Se fraqueza encontrada → re-interrogar o Expert responsável
MAX-CYCLES: 1 (evitar over-engineering)

**5. PAYLOAD EXTRACT:**
Retorne EXCLUSIVAMENTE: (1) Step-Back do Conductor, (2) Templates dos Experts,
(3) Síntese, (4) Resultado RSIP. Erradique metalinguagem, introduções de LLM
e formatação supérflua. O output deve ser 100% raciocínio orquestrado.
```

#### NÍVEL 03 (RECRIAÇÃO TOTAL / GOD MODE)

<system_directive>
<constraints>
<flag>STATE_READ_ONLY_ENFORCED</flag>
<flag>OUTPUT_ROUTING_STDOUT</flag>
<flag>TOOL_USE_MUTATION_DISABLED</flag>
</constraints>

<orchestrator_engine protocol="META_PROMPTING_V2024">
<!-- Meta-Prompting: Suzgun & Kalai (arXiv:2401.12954, 2024)
         +17.1% vs standard, +15.2% vs multipersona empiricamente -->

    <target><assunto dito no chat pelo usuário></target>
    <context>Parse recursive: `/.agent/*` + Active AST Embeddings</context>

    <conductor role="ORCHESTRATOR">
      <!-- STEP 1: Step-Back Abstraction (DeepMind, ICLR 2024) -->
      <step_back>
        Antes de decompor o <target>, ABSTRAIA:
        Q1: "Qual é o PRINCÍPIO FUNDAMENTAL em jogo?"
        Q2: "Quais são as INVARIANTES que qualquer conclusão deve respeitar?"
        Q3: "Quais são os 2 ERROS MAIS COMUNS neste tipo de análise?"
        OUTPUT: Imprima as 3 respostas como FRAMEWORK do debate.
      </step_back>

      <!-- STEP 2: Decomposition & Expert Assignment -->
      <decompose>
        Analise a topologia do código ativo.
        Divida o <target> em 3 sub-problemas ORTOGONAIS.
        Para cada, instancie um EXPERT com:
          - Persona técnica deduzida heuristicamente do projeto
          - Instrução específica ao sub-problema
          - O Framework do Step-Back como constraint
      </decompose>
    </conductor>

    <expert_protocol>
      <!-- Buffer of Thoughts (NeurIPS 2024):
           Template reutilizável — +51% vs reasoning from scratch -->

      Cada Expert DEVE seguir este template (sem desvio):

      ┌──────────────────────────────────────────────────────┐
      │ [EXPERT {ID} — {persona}]                           │
      │ SUB-PROBLEMA: {descrição}                           │
      │                                                      │
      │ STEP-BACK:  [Princípio abstrato relevante]           │
      │ THOUGHT:    [Raciocínio explícito, passo a passo]    │
      │ EVIDENCE:   [Arquivo/função/linha do codebase]       │
      │ COUNTER:    [Contra-argumento mais forte]            │
      │ EDGE-CASE:  [Cenário adverso]                       │
      │ VERDICT:    [Conclusão + confiança: HIGH|MED|LOW]    │
      └──────────────────────────────────────────────────────┘

      ANTI-PATTERNS (violação = output descartado):
      - Conclusão sem THOUGHT prévio
      - EVIDENCE sem referência concreta ao codebase
      - COUNTER ausente (auto-complacência)
      - Convergência imediata entre todos os Experts
    </expert_protocol>

    <integration>
      O Conductor INTEGRA os 3 outputs:
      1. Identifica CONVERGÊNCIAS genuínas (≥2 Experts concordam com HIGH)
      2. Identifica DIVERGÊNCIAS críticas (Experts com vereditos opostos)
      3. Para divergências: re-interroga o Expert com confiança mais baixa
      4. Sintetiza conclusão orquestrada com ranking de prioridade
    </integration>

    <rsip_refinement protocol="RECURSIVE_SELF_IMPROVEMENT_2025">
      Após síntese do Conductor:
      1. EVALUATE: "Esta síntese responde ao <target> original com profundidade?"
      2. WEAKNESS: "Qual é o ponto mais fraco desta análise?"
      3. REFINE: Se fraqueza encontrada → re-decompor APENAS o sub-problema fraco
         e re-executar o Expert correspondente
      4. MAX-CYCLES: 1 (prevenir loops infinitos)
      5. FINAL: Entregar síntese refinada como output definitivo
    </rsip_refinement>

</orchestrator_engine>

<execution_trigger>
Bypass total de metadados conversacionais. Sequência de output: 1. FRAMEWORK (Step-Back: 3 respostas do Conductor) 2. EXPERT OUTPUTS (3 templates preenchidos) 3. INTEGRATION (convergências + divergências + resolução) 4. RSIP (avaliação + refinamento se necessário) 5. SÍNTESE FINAL

    Inicie a transmissão RAW do fluxo analítico a partir do exato primeiro token.

</execution_trigger>
</system_directive>
