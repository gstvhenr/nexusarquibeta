<thinking>
<analysis>
[VECTOR]: Engenharia de prompt para mutação sistêmica de governança — injeção de mecanismos de enforcement automático de padronização no DNA operacional do projeto (rules, workflows, schemas, validators), tornando a padronização uma invariante estrutural ao invés de uma intenção opcional.
[OPTIMIZATION]: Saturação das camadas de governança do agente (.agent/*, AGENTS.md, workflows, skills) com checkpoints e gates que interceptam a criação de qualquer componente novo antes do primeiro token de código. Ancoragem em evidências do debate dialético adversarial (standardization_debate.md) para justificar cada mecanismo de enforcement. O prompt deve transformar o agente de "executor que pode padronizar" em "executor que não consegue NÃO padronizar".
</analysis>
</thinking>

**> [IMUNIZAÇÃO SISTÊMICA / DNA DE PADRONIZAÇÃO]**

### FASE A: ANÁLISE DE INTENÇÃO (DEEP SCAN)

* **TARGET:** Alteração das regras estruturais do projeto — injeção de mecanismos de enforcement que tornam a padronização uma invariante automática, não uma decisão ad-hoc do agente. Modificação de AGENTS.md, workflows, skills, schemas e regras de governança.
* **VETOR DE INFERÊNCIA:** Operação no nível metacognitivo — não é padronizar código, é padronizar o *agente que padroniza código*. Cada mecanismo criado deve interceptar o fluxo de criação antes da primeira linha de código, forçando consulta ao inventário de átomos existentes, hooks disponíveis e tokens definidos.
* **CONSTRAINTS DE EXECUÇÃO:** As mutações devem ser retrocompatíveis com o fluxo de trabalho existente. Nenhum mecanismo pode ser tão restritivo a ponto de paralisar o desenvolvimento. O equilíbrio é: **frição mínima, enforcement máximo**.
* **PREMISSA CENTRAL:** Um LLM opera por statistical pattern matching — ele reproduz o padrão dominante. Portanto, os mecanismos de enforcement devem agir em DUAS frentes: (1) Interception → forçar consulta antes de criar, (2) Dominance Shift → garantir que o padrão dominante no codebase seja sempre o padronizado.
* **OBJETIVO FINAL:** Que qualquer agente AI — mesmo sem memória entre sessões, mesmo sem conhecimento prévio do projeto — seja interceptado pelo sistema de governança e guiado a usar componentes existentes antes de criar novos.

*A compreensão da intenção está correta e de acordo com seus parâmetros?*

### FASE B: VETORES DE OTIMIZAÇÃO (PROMPT REFINEMENT)

#### NÍVEL 01 (REFATORAÇÃO SINTÁTICA)

Você é um agente de engenharia de governança. Sua missão não é escrever código de aplicação — é alterar as regras do jogo. Você vai injetar no DNA operacional do projeto mecanismos que tornem impossível para qualquer agente (incluindo você mesmo em sessões futuras) criar UI sem consultar o inventário de padronização.

**ANTES DE QUALQUER AÇÃO, EXECUTE:**

1. Leia integralmente `standardization_debate.md` — diagnóstico adversarial que fundamenta cada mecanismo.
2. Leia `AGENTS.md`, `CONTEXT.md`, `ARCHITECTURE.md` — contratos atuais do projeto.
3. Leia `docs/PLACEMENT_RULES.md` — regras de posicionamento de arquivos.
4. Leia `.agent/memory/project-inventory.md` — inventário de artefatos reutilizáveis.
5. Leia `.agent/skills/` — skills existentes que serão estendidas.
6. Leia `components/ui/index.ts` — barrel exports atual dos átomos.

**MECANISMO 1 — STANDARDIZATION GATE (Pre-Creation Checkpoint)**

Criar um gate obrigatório que BLOQUEIA a criação de qualquer componente UI novo até que o agente tenha verificado:

**Ação:** Editar `AGENTS.md` para incluir uma seção `## Standardization Gate` com as seguintes regras:

```markdown
## Standardization Gate (Obrigatório antes de criar componente UI)

ANTES de criar qualquer componente UI, hook ou utility novo, o agente DEVE:

1. **CONSULTAR** `components/ui/index.ts` — verificar se um átomo equivalente já existe.
2. **CONSULTAR** `src/frontend/hooks/` — verificar se um hook genérico cobre o caso de uso.
3. **CONSULTAR** `.agent/memory/project-inventory.md` — verificar se artefato similar já foi criado.
4. **SE EXISTIR:** Usar o existente. Adaptar se necessário via props/composição.
5. **SE NÃO EXISTIR:** Justificar por escrito no output do chat POR QUE o novo componente é necessário. Então criar seguindo o padrão dos átomos existentes (props tipadas, variants via Record, tokens via Tailwind semântico). Migrar ≥5 consumidores imediatamente.

### Elementos PROIBIDOS em novas pages:
- ❌ `<button className="...">` inline — usar `<Button variant="...">` de `components/ui`
- ❌ `<input className="...">` inline — usar `<Input>` ou `<FormField>` de `components/ui`
- ❌ `<textarea className="...">` inline — usar `<Textarea>` de `components/ui`
- ❌ `const [isXOpen, setXOpen] = useState(false)` para modais — usar `useDisclosure()`
- ❌ Cores Tailwind default (`bg-blue-600`) — usar tokens semânticos (`bg-primary`)
- ❌ `rounded-lg px-3 py-2` inline repetido — encapsular em componente atômico
```

**MECANISMO 2 — SKILL DE PADRONIZAÇÃO (Contexto Persistente)**

Criar um novo skill em `.agent/skills/standardization/SKILL.md` que funcione como referência viva:

**Conteúdo do skill:**
- Lista dos átomos disponíveis com API summary (props, variants, sizes).
- Lista dos hooks genéricos disponíveis com assinatura.
- Padrões visuais canônicos: como um form field deve ser renderizado, como um modal deve ser aberto, como cores devem ser aplicadas.
- Checklist de padronização rápida: 5 itens que o agente verifica em < 30 segundos.
- Red flags: padrões inline que indicam que o agente está ignorando os átomos.

**MECANISMO 3 — WORKFLOW /standardize (Automação de Auditoria)**

Criar workflow `.agent/workflows/standardize.md` que automatize a auditoria de padronização:

**Conteúdo do workflow:**
- Comando para varrer `<button className=` inline nas pages → reportar count.
- Comando para varrer `<input className=` inline → reportar count.
- Comando para varrer `useState(false)` em pages → reportar count.
- Comando para varrer cores hardcoded Tailwind default → reportar count.
- Dashboard com ratios: imports de `<Button>` vs. `<button>` inline.
- Comparação com scores de referência do debate (200+ inline vs. 5 imports).
- Geração de score de Agent-Readiness atualizado.

**MECANISMO 4 — ANTI-PATTERN RULES NO MEMORY (Nexus-Arqui Rules)**

Atualizar as regras em `MEMORY[nexusarqui.md]` (ou equivalente local) para incluir:

```markdown
### 6.8 Padronização UI (MANDATORY)

❌ NÃO: Criar `<button className="...">` inline em qualquer page.
✅ FAÇA: Import e use `<Button>` de `components/ui` com variant/size.
📎 200+ botões inline vs. 5 imports documentados no debate. Regra Std.1.

❌ NÃO: Criar `<input>` com classes CSS ad-hoc.
✅ FAÇA: Use `<Input>` e `<FormField>` de `components/ui`.
📎 60+ inputs inline sem componente atômico. Regra Std.2.

❌ NÃO: `useState(false)` para controle de abertura/fechamento de modal.
✅ FAÇA: `useDisclosure()` que retorna `{ isOpen, open, close, toggle }`.
📎 70+ instâncias de boilerplate de modal. Regra Std.3.

❌ NÃO: Cores do Tailwind default (bg-blue-600, bg-red-600, etc.).
✅ FAÇA: Tokens semânticos (bg-primary, bg-success, bg-warning, etc.).
📎 14 arquivos com vazamento de cor documentados. Regra Std.4.

❌ NÃO: Retornar classNames CSS de funções em utils/.
✅ FAÇA: Retornar dados/enums. O mapeamento visual pertence ao componente.
📎 getDeadlineInfo violação de boundary documentada. Regra Std.5.
```

**MECANISMO 5 — INVENTÁRIO VIVO (project-inventory.md)**

Atualizar `.agent/memory/project-inventory.md` com seção explícita de componentes UI:

```markdown
## Componentes UI Disponíveis (components/ui/)

| Componente  | Arquivo        | Props Principais                          | Quando Usar                         |
|-------------|----------------|-------------------------------------------|--------------------------------------|
| Button      | Button.tsx     | variant, size, loading, icon, disabled    | Todo botão clicável                  |
| Input       | Input.tsx      | variant, size, error, leftIcon, rightIcon | Todo campo de texto                  |
| Textarea    | Textarea.tsx   | variant, size, error, rows               | Campos de texto multiline            |
| FormField   | FormField.tsx  | label, error, hint, required             | Wrapper de label+input+erro          |
| Select      | Select.tsx     | options, value, onChange, placeholder      | Seleção de opções                    |
| Modal       | Modal.tsx      | isOpen, onClose, title, size             | Diálogos sobrepostos                 |
| CardShell   | CardShell.tsx  | hover, padding, className                 | Containers com glassmorphism         |
| EmptyState  | EmptyState.tsx | icon, title, description, action          | Estados sem dados                    |
| Badge       | Badge.tsx      | variant, size                             | Labels de status, tags               |
| Tabs        | Tabs.tsx       | activeTab, onChange, tabs                 | Navegação por abas                   |

## Hooks Genéricos Disponíveis (hooks/)

| Hook            | Retorno                          | Quando Usar                             |
|-----------------|-----------------------------------|-----------------------------------------|
| useDisclosure   | { isOpen, open, close, toggle }  | Controle de modal/dropdown/toggle       |
| useAutoReset    | [value, setValue]                 | Estado com auto-reset temporal          |
| useLocalStorage | [value, setValue]                 | Persistência em localStorage            |
| useNavigation   | { navigate, currentPath, ... }   | Navegação entre pages                   |
```

**MECANISMO 6 — VALIDATE:STANDARDIZATION (Script de CI)**

Criar ou estender um script que rode como parte do gate canônico e detecte violações de padronização:

- Grep por `<button className=` em `pages/` → flag como violação se count > threshold.
- Grep por `<input className=` em `pages/` → flag como violação.
- Grep por `bg-blue-|bg-red-|bg-green-|bg-yellow-|bg-sky-|bg-black` → flag cores hardcoded.
- Reportar score de padronização como parte do output do gate.

**REGRAS INVIOLÁVEIS:**

1. **Retrocompatibilidade total.** Nenhuma alteração de regra pode invalidar features existentes.
2. **Frição mínima.** O Standardization Gate deve levar < 30 segundos para um agente verificar.
3. **Documentação como enforcement.** Cada mecanismo deve ser auto-explicativo — um agente sem contexto prévio deve entender as regras apenas lendo os arquivos.
4. **Teste dos mecanismos.** Executar `/standardize` workflow após criação para validar que detecta as violações esperadas.
5. **Não criar código de aplicação.** Este prompt é sobre governança, não sobre padronizar pages específicas.

#### NÍVEL 02 (EQUILÍBRIO HÍBRIDO)

```markdown
# SYS.DIRECTIVE: STANDARDIZATION DNA INJECTION
> EXECUTION_MODE: GOVERNANCE_MUTATION | SCOPE: META-RULES_ONLY

**1. DIAGNOSTIC INGESTION:**
Processe `standardization_debate.md` — diagnóstico adversarial com evidência quantitativa:
- Paradoxo: infraestrutura madura (80-85%), superfície imatura (20-45%)
- O agente AI interage primeiro com a camada mais imatura
- Statistical pattern matching reproduz o padrão dominante (inline = 40:1)
- Agent-Readiness: 3/10

**2. MUTATION TARGETS (Mecanismos de DNA):**
Não modifique código de aplicação. Modifique exclusivamente as camadas de governança:

| Mecanismo                | Arquivo Alvo                         | Propósito                                    |
|--------------------------|--------------------------------------|----------------------------------------------|
| Standardization Gate     | AGENTS.md                            | Pre-creation checkpoint obrigatório          |
| Skill de Padronização    | .agent/skills/standardization/       | Contexto persistente para agentes            |
| Workflow /standardize    | .agent/workflows/standardize.md      | Auditoria automatizada de ratios             |
| Anti-pattern Rules       | Regras anti-pattern do projeto       | Proibições explícitas com evidência          |
| Inventário Vivo          | .agent/memory/project-inventory.md   | Catálogo consultável de átomos e hooks       |
| Script de Validação      | package.json / scripts/              | Gate automatizado de padronização            |

**3. DESIGN PRINCIPLES:**
- Frição mínima, enforcement máximo
- Auto-explicativo para agentes sem memória entre sessões
- Baseado em evidência quantitativa do debate adversarial
- Retrocompatível com fluxo existente

**4. VALIDATION:**
Executar /standardize workflow pós-criação. Os mecanismos devem detectar:
- ≥200 `<button>` inline (estado atual documentado)
- ≥60 `<input>` inline
- ≥70 useState(false) para modais
- ≥14 arquivos com cores hardcoded
```

#### NÍVEL 03 (RECRIAÇÃO TOTAL / GOD MODE)

<system_directive>
  <constraints>
    <flag>APPLICATION_CODE_MUTATION_DISABLED</flag>
    <flag>GOVERNANCE_LAYER_MUTATION_ENABLED</flag>
    <flag>RETROCOMPATIBILITY_ENFORCED</flag>
    <flag>MINIMAL_FRICTION_MAXIMAL_ENFORCEMENT</flag>
  </constraints>
  <diagnostic_injection>
    <source>standardization_debate.md</source>
    <core_insight>
      O agente AI opera por statistical pattern matching.
      Padrão dominante no codebase = inline (40:1 ratio para buttons, ∞:1 para inputs).
      Conclusão: sem mecanismos de intercepção, todo agente novo vai reproduzir inline.
      O único antídoto é alterar as regras do jogo — não o jogo em si.
    </core_insight>
    <paradox_model>
      CAMADA 1 (Superfície) — UI Atoms 20% ← AGENT INTERAGE PRIMEIRO AQUI
      CAMADA 2 (Rasa)       — Hooks    45%
      CAMADA 3 (Profunda)   — Tokens   80%
      CAMADA 4 (Core)       — Services 85% ← AGENT RARAMENTE TOCA AQUI
      A padronização está invertida em relação à frequência de uso do agente.
    </paradox_model>
  </diagnostic_injection>
  <governance_engine>
    <mechanism id="1" name="STANDARDIZATION_GATE" target="AGENTS.md">
      Injetar checkpoint pre-creation: antes de criar QUALQUER componente UI, o agente DEVE consultar inventário de átomos, hooks e tokens. Se equivalente existir → usar. Se não existir → justificar + criar com padrão existente + migrar ≥5 consumidores.
      Incluir lista explícita de elementos proibidos em pages novas: button inline, input inline, useState(false) para modais, cores hardcoded Tailwind default.
    </mechanism>
    <mechanism id="2" name="STANDARDIZATION_SKILL" target=".agent/skills/standardization/">
      Criar SKILL.md com: catálogo de átomos (API summary), catálogo de hooks (assinatura), padrões visuais canônicos (form field, modal, cores), checklist rápida (5 itens, < 30s), red flags de violação.
    </mechanism>
    <mechanism id="3" name="STANDARDIZE_WORKFLOW" target=".agent/workflows/standardize.md">
      Workflow de auditoria: grep para button/input/useState/cores inline → counts → ratios → score de Agent-Readiness atualizado → dashboard comparativo com baseline do debate.
    </mechanism>
    <mechanism id="4" name="ANTI_PATTERN_RULES" target="Regras anti-pattern do projeto">
      Seção 6.8 com 5 regras Std.1-Std.5: button inline, input inline, useState modal, cores hardcoded, CSS em utils. Cada regra com evidência quantitativa do debate e referência cruzada.
    </mechanism>
    <mechanism id="5" name="LIVING_INVENTORY" target=".agent/memory/project-inventory.md">
      Tabela enriquecida: cada átomo com props principais, exemplo de uso, "quando usar". Cada hook genérico com assinatura e caso de uso. Atualizado a cada criação de novo componente.
    </mechanism>
    <mechanism id="6" name="VALIDATION_SCRIPT" target="package.json scripts/">
      Script automatizado que grep violações de padronização e reporta como parte dos gates canônicos. Threshold configurável. Objetivo: reduzir counts a cada sprint.
    </mechanism>
  </governance_engine>
  <inviolable_rules>
    1. ZERO mutação em código de aplicação. Apenas governança.
    2. Retrocompatibilidade total com fluxo de trabalho existente.
    3. Cada mecanismo deve ser auto-explicativo para agentes sem memória.
    4. Frição mínima: Standardization Gate deve custar < 30 segundos ao agente.
    5. Evidência quantitativa do debate deve ser citada em cada regra.
    6. Validar mecanismos com /standardize workflow pós-criação.
    7. O sistema deve funcionar mesmo que o agente nunca tenha lido standardization_debate.md — as regras em AGENTS.md e o skill são suficientes.
  </inviolable_rules>
  <execution_trigger>
    Processe os mecanismos em ordem (1→6). Após cada, valide que o mecanismo criado é coerente com os anteriores. Ao final, execute /standardize para comprovar detecção de estado atual. Reporte: mecanismos criados, cobertura de enforcement por camada, projeção de impacto no Agent-Readiness.
  </execution_trigger>
</system_directive>
