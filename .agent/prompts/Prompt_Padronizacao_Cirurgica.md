<thinking>
<analysis>
[VECTOR]: Engenharia de prompt para indução de execução cirúrgica — padronização retroativa (retrofitting) de componentes UI, hooks e design tokens num codebase React+TypeScript maduro, operando sob protocolo de zero-regressão.
[OPTIMIZATION]: Confinamento do agente a diffs incrementais e atômicos, com validação obrigatória em cada ciclo. Ancoragem de contexto via diagnóstico quantitativo extraído de debate dialético adversarial (standardization_debate.md). Saturação da janela de atenção em anti-patterns concretos — not abstract guidance, but surgical coordinates.
</analysis>
</thinking>

**> [PADRONIZAÇÃO CIRÚRGICA / EXECUÇÃO RETROATIVA]**

### FASE A: ANÁLISE DE INTENÇÃO (DEEP SCAN)

- **TARGET:** Padronização retroativa do estado atual de um codebase React+TypeScript. Migração progressiva de HTML/CSS inline para componentes atômicos reutilizáveis, hooks genéricos e consumo consistente de design tokens.
- **VETOR DE INFERÊNCIA:** Execução guiada por diagnóstico adversarial quantitativo. O agente recebe coordenadas exatas dos anti-patterns (quantos, onde, qual a proporção inline vs. componente) e executa migração cirúrgica por ondas de prioridade, nunca big-bang.
- **CONSTRAINTS DE EXECUÇÃO:** Zero regressão funcional ou visual. Cada onda deve: (1) criar o primitivo ausente, (2) migrar N consumidores imediatos, (3) validar com gates canônicos, (4) avançar somente com verde.
- **CONSTRAINT CARDINAL:** Nunca criar um átomo sem migrar pelo menos 5 consumidores imediatamente. Átomo sem adoção é código morto — "monumento decorativo".
- **OBJETIVO FINAL:** Inverter o padrão estatístico dominante do codebase. Onde hoje existem ~200 `<button>` inline vs. ~5 imports do `<Button>`, o agente deve atingir a inversão: padrão dominante = componente padronizado.

_A compreensão da intenção está correta e de acordo com seus parâmetros?_

### FASE B: VETORES DE OTIMIZAÇÃO (PROMPT REFINEMENT)

#### NÍVEL 01 (REFATORAÇÃO SINTÁTICA)

Você é um agente de padronização cirúrgica. O projeto que você vai operar possui um paradoxo documentado: a infraestrutura de padronização (tokens, config, services) é profissional, mas a adoção na superfície (UI atoms, hooks) é minoritária. O diagnóstico completo está em `standardization_debate.md`.

**ANTES DE QUALQUER AÇÃO, EXECUTE:**

1. Leia integralmente `standardization_debate.md` — ele contém o diagnóstico quantitativo adversarial com scores por pilar em formato tabular.
2. Leia `AGENTS.md` para identificar os gates canônicos de verificação do projeto.
3. Leia `docs/PLACEMENT_RULES.md` para resolução de paths antes de criar qualquer arquivo.
4. Leia `components/ui/index.ts` para conhecer os átomos já existentes e o barrel export atual.

**PROTOCOLO DE EXECUÇÃO — ONDAS ATÔMICAS:**

Execute a padronização em ondas incrementais. Cada onda é um ciclo completo de: CRIAR → MIGRAR → TESTAR → VALIDAR. Nunca inicie a onda N+1 sem verde na onda N.

**ONDA 1 — Hooks Genéricos (Fundação):**

- Criar `useDisclosure` — retorna `{ isOpen, open, close, toggle }`.
- Criar teste co-localizado para `useDisclosure`.
- Executar `npm run verify` → verde obrigatório.
- NÃO migrar consumidores ainda — esta onda é apenas fundação.

**ONDA 2 — Átomo `Input` + `Textarea` + `FormField`:**

- Criar `Input.tsx` com props tipadas: `variant`, `size`, `error`, `disabled`, `leftIcon`, `rightIcon`.
- Criar `Textarea.tsx` com props compatíveis com `Input`.
- Criar `FormField.tsx` — wrapper de label + input + mensagem de erro + hint.
- Atualizar `components/ui/index.ts` com os novos exports.
- Executar gates → verde obrigatório.

**ONDA 3 — Migração de Consumidores (Input/FormField):**

- Selecionar as 5 pages com maior concentração de `<input>` inline.
- Substituir `<input>` por `<Input>` e wraps de label/erro por `<FormField>`.
- Preservar toda a lógica funcional (onChange, value, validação).
- Executar gates → verde obrigatório.
- Se QUALQUER teste falhar → reverter e diagnosticar antes de continuar.

**ONDA 4 — Migração de `<button>` → `<Button>`:**

- Selecionar as 10 pages com maior concentração de `<button>` inline.
- Mapear variantes: botão primário → `variant="primary"`, ícone → `variant="ghost"`, etc.
- Substituir preservando handlers e acessibilidade.
- Executar gates → verde obrigatório.

**ONDA 5 — Migração de useState(false) → useDisclosure:**

- Identificar pages com 3+ modais (começar por `ProjetoDetalhesPageContent`, `ClientesPage`, `ComissoesPage`).
- Substituir padrão `const [isXOpen, setXOpen] = useState(false)` por `const xModal = useDisclosure()`.
- Atualizar referências: `isXOpen` → `xModal.isOpen`, `setXOpen(true)` → `xModal.open()`, `setXOpen(false)` → `xModal.close()`.
- Executar gates → verde obrigatório.

**ONDA 6 — Átomos `Badge`, `Tabs`:**

- Criar `Badge.tsx` com props `variant` (success, warning, error, info, neutral), `size`.
- Criar `Tabs.tsx` + `TabList` + `Tab` + `TabPanel` com API declarativa.
- Migrar `ProjetoDetalhesTabs.tsx` (7 botões-tab inline) para `<Tabs>`.
- Migrar 5 pages que usam badges/tags inline.
- Executar gates → verde obrigatório.

**ONDA 7 — Eliminação de Cores Hardcoded:**

- Varrer os 14 arquivos documentados no debate com cores Tailwind default (`bg-blue-600`, `bg-red-600`, etc.).
- Mapear para tokens semânticos existentes ou criar novos tokens em `theme.ts` se necessário.
- Para chart colors (`EXPENSE_CATEGORY_COLORS`, `RECEIVABLE_SOURCE_COLORS`): extrair HSL literals para constantes referenciando CSS custom properties.
- Executar gates → verde obrigatório.

**ONDA 8 — Separação de Concerns em Utils:**

- `getDeadlineInfo` em `formatters.ts`: retornar status enum (`'overdue' | 'warning' | 'ok'`), não className.
- Criar mapping de status → className no componente consumidor (não no util).
- `taskUtils.ts`, `prospectUtils.ts`: extrair mapeamentos visuais (classes CSS) para constantes em arquivo separado de style-mapping.
- Executar gates → verde obrigatório.

**REGRAS INVIOLÁVEIS:**

1. **Nunca big-bang.** Cada onda é um PR lógico independente.
2. **Nunca auto-declarar conclusão.** Sem `npm run verify` verde, a onda NÃO está concluída.
3. **Preservar funcionalidade obsessivamente.** Se um botão tinha `onClick={handleDelete}`, o novo `<Button onClick={handleDelete}>` deve ter comportamento idêntico.
4. **Não expandir escopo.** Se encontrar um bug ou melhoria não relacionada, registre em `NEXT.md` e continue.
5. **Prioridade de rollback.** Se uma migração quebrar 2+ testes, reverter imediatamente e investigar antes de retry.

#### NÍVEL 02 (EQUILÍBRIO HÍBRIDO)

```markdown
# SYS.DIRECTIVE: SURGICAL STANDARDIZATION PROTOCOL

> EXECUTION_MODE: INCREMENTAL_WAVES | REGRESSION_TOLERANCE: ZERO

**1. DIAGNOSTIC INGESTION:**
Processe integralmente `standardization_debate.md` — diagnostico adversarial com scores quantitativos:

- UI Atoms: 2/10 adoção, 200+ `<button>` inline vs. 5 imports `<Button>`
- Design Tokens: 5/10 consistência, 14 arquivos com cores hardcoded Tailwind default
- Hooks genéricos: 1/10, zero hooks reutilizáveis (useDisclosure, useDebounce, useForm)
- Formulários: 60+ `<input>` inline, zero componente `<Input>` atômico
- Agent-Readiness: 3/10 — agente reproduz padrão dominante (inline)

**2. EXECUTION TOPOLOGY:**
Ondas atômicas sequenciais. Cada onda: CRIAR primitivo → MIGRAR ≥5 consumidores → GATE VERDE → próxima.
_Constraint cardinal:_ Átomo sem migração imediata = código morto. Proibido.

Ordem: useDisclosure → Input/Textarea/FormField → migração inputs → migração buttons → migração useState→useDisclosure → Badge/Tabs → cores hardcoded → separação concerns em utils.

**3. VALIDATION PROTOCOL:**
Executar gates canônicos (ver AGENTS.md) após cada onda. Falha de gate = rollback + diagnóstico. Proibido avançar com vermelho.

**4. ANTI-PATTERNS A EVITAR:**

- ❌ Criar átomo sem migrar consumidores imediatos
- ❌ Copiar classes CSS inline existentes para dentro do componente (usar tokens)
- ❌ Mutar assinatura de componentes existentes sem atualizar todos os consumidores
- ❌ Ignorar testes co-localizados — cada hook/componente novo DEVE ter teste
- ❌ Expandir escopo além da onda atual

**5. SUCCESS METRICS:**
Pós-execução, os ratios devem inverter:

- `<Button>` imports > `<button>` inline
- `<Input>` imports > `<input>` inline
- `useDisclosure()` > `useState(false)` para modais
- Cores semânticas > cores hardcoded Tailwind default
```

#### NÍVEL 03 (RECRIAÇÃO TOTAL / GOD MODE)

<system_directive>
<constraints>
<flag>REGRESSION_TOLERANCE_ZERO</flag>
<flag>INCREMENTAL_WAVE_EXECUTION</flag>
<flag>GATE_VERDE_OBRIGATORIO</flag>
<flag>ATOM_WITHOUT_MIGRATION_FORBIDDEN</flag>
</constraints>
<diagnostic_injection>
<source>standardization_debate.md</source>
<key_metrics>
<metric name="inline_buttons" value="200+" versus="5 Button imports" ratio="40:1 inline"/>
<metric name="inline_inputs" value="60+" versus="0 Input component" ratio="∞:1 inline"/>
<metric name="useState_modal_boilerplate" value="70+" versus="0 useDisclosure" ratio="∞:1 inline"/>
<metric name="hardcoded_colors" value="14 files" versus="theme.ts tokens" leak="30%"/>
<metric name="agent_readiness" value="3/10" target="7/10"/>
</key_metrics>
<paradox>
Infraestrutura profunda (tokens, services) = 80-85% madura.
Superfície (UI atoms, hooks genéricos) = 20-45% madura.
Agente interage primeiro com a camada mais imatura.
Resultado: agente reproduz anti-patterns por statistical pattern matching.
</paradox>
</diagnostic_injection>
<execution_engine>
<wave id="1" scope="FOUNDATION">
Criar hooks genéricos: useDisclosure (open/close/toggle), com testes co-localizados.
Gate verde obrigatório antes de avançar.
</wave>
<wave id="2" scope="ATOMS">
Criar Input.tsx (variants, sizes, error state, icons), Textarea.tsx, FormField.tsx (label+input+error+hint).
Atualizar barrel exports. Gate verde.
</wave>
<wave id="3" scope="MIGRATION_INPUT">
Migrar 5 pages top por concentração de input inline → <Input> + <FormField>.
Preservar funcionalidade. Gate verde. Rollback se 2+ testes falharem.
</wave>
<wave id="4" scope="MIGRATION_BUTTON">
Migrar 10 pages top → <Button variant="...">. Mapear variantes corretamente.
Gate verde. Inversão de ratio como critério de sucesso.
</wave>
<wave id="5" scope="MIGRATION_HOOKS">
Substituir useState(false) por useDisclosure() em pages com 3+ modais.
Ordem: ProjetoDetalhesPageContent, ClientesPage, ComissoesPage primeiro.
Gate verde.
</wave>
<wave id="6" scope="ATOMS_SECONDARY">
Criar Badge.tsx, Tabs.tsx (TabList+Tab+TabPanel). Migrar ProjetoDetalhesTabs e 5 pages com badges inline.
Gate verde.
</wave>
<wave id="7" scope="TOKEN_CONSISTENCY">
Eliminar cores hardcoded Tailwind default nos 14 arquivos documentados.
Tokenizar chart colors. Gate verde.
</wave>
<wave id="8" scope="CONCERN_SEPARATION">
getDeadlineInfo → retornar enum, não className. Extrair style-mappings de taskUtils, prospectUtils.
Gate verde.
</wave>
</execution_engine>
<inviolable_rules> 1. NUNCA big-bang. Cada onda é atômica e reversível. 2. NUNCA declarar conclusão sem gate verde evidenciado. 3. NUNCA criar átomo sem migrar ≥5 consumidores na mesma onda ou na seguinte. 4. NUNCA expandir escopo — registrar descobertas em NEXT.md. 5. ROLLBACK IMEDIATO se gate vermelho. Diagnosticar antes de retry. 6. PRESERVAR funcionalidade e acessibilidade em cada substituição. 7. TESTES CO-LOCALIZADOS obrigatórios para cada hook e componente novo.
</inviolable_rules>

  <!-- Step-Back Prompting (DeepMind, ICLR 2024) -->

<step_back>
ANTES de iniciar qualquer onda, o agente DEVE abstrair:
Q1: "Qual é o PRINCÍPIO de padronização que esta onda serve?"
Q2: "Qual é o ratio inline:componente ATUAL para o elemento desta onda?"
Q3: "Qual é o ratio ALVO pós-onda?"
OUTPUT: Imprimir estas 3 respostas como PRE-FLIGHT de cada onda.
</step_back>

  <!-- RSIP: Recursive Self-Improvement (2025) — por onda -->

<rsip_per_wave>
Após CADA onda (antes de avançar para N+1): 1. EVALUATE: "A migração desta onda cobriu os consumidores de maior impacto?" 2. RATIO-CHECK: "O ratio inline:componente inverteu ou está em trajetória?" 3. WEAKNESS: "Algum consumidor migrado quebrou padrão visual ou funcional?" 4. REFINE: Se fraqueza encontrada → corrigir ANTES de avançar
MAX-CYCLES: 1 por onda
</rsip_per_wave>

<execution_trigger>
Inicie pela Onda 1. Reporte progresso após cada onda com: (a) artefatos criados/modificados, (b) resultado do gate, (c) ratio atualizado, (d) resultado RSIP. Avanço condicional ao verde.
</execution_trigger>
</system_directive>
