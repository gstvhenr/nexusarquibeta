<thinking>
<analysis>
[VECTOR]: Prompt para induzir reorganização estrutural incremental com segurança de runtime (delta funcional zero), priorizando legibilidade por domínio e previsibilidade para agentes.
[OPTIMIZATION]: Micro-batches atômicos + gate canônico obrigatório + política explícita de placement para `src/pages` espelhando menu/submenu.
</analysis>
</thinking>

**> [REORGANIZAÇÃO ESTRUTURAL CAUTELOSA DO PROJETO]**

### FASE A: ANÁLISE DE INTENÇÃO (DEEP SCAN)

- **TARGET:** reorganização incremental e segura do filesystem, sem regressão funcional.
- **TARGET ESPECÍFICO DE PAGES:** em `src/pages`, o caminho deve refletir a navegação real do produto (menu/submenu), incluindo páginas de detalhe dentro do mesmo domínio do menu pai.
- **TARGET DE ESTRUTURA FUTURA:** preparar separação frontend/backend com envelope de raiz `frontend/` quando aprovado, mantendo `frontend/src` (não renomear `src`).
- **CONSTRAINTS DE I/O:** mover arquivos com atualização de todos os imports afetados. Não deletar arquivos como atalho de limpeza.
- **CONSTRAINTS DE VERIFICAÇÃO:** cada batch deve fechar com gate canônico (`npm run verify`), sem avançar com gate vermelho.
- **CONSTRAINTS DE ESCOPO:** não alterar comportamento, regra de negócio, assinatura pública ou nomenclatura funcional; só organização de diretórios/imports/barrels.
- **OBJETIVO FINAL:** estrutura coerente por domínio em `pages`, imports íntegros, barrels mínimos e gates verdes.

_A compreensão da intenção está correta e de acordo com seus parâmetros?_

### FASE B: REGRAS OPERACIONAIS

#### REGRA-MESTRA DE PLACEMENT

1. **`src/pages` segue menu/submenu**:
   - Exemplo: `/gestao-marketing/redes-sociais/:networkId` deve viver no domínio `pages/gestao-marketing` ou `pages/redes-sociais` (convenção escolhida no projeto), sem pasta paralela órfã fora desse domínio.
2. **Camadas fora de pages NÃO seguem menu**:
   - `services`, `utils`, `types`, `hooks` e `components` compartilhados seguem domínio/camada técnica.
3. **Envelope futuro frontend/backend**:
   - Quando aprovado na sessão, mover o app atual para `frontend/` preservando `frontend/src`.
   - Não transformar `src` em `frontend`; `src` continua como raiz de código do app frontend.

#### NÍVEL 01 (REFATORAÇÃO SINTÁTICA)

[EXECUTION_OVERRIDE: SURGICAL_INCREMENTAL]
Modo: micro-cirurgia atômica, 1 domínio por vez, com verificação obrigatória.

Antes de tocar em arquivos, auditar o filesystem e classificar:

1. **CORRETO:** já está no local ideal pela convenção vigente.
2. **DESLOCADO:** está fora do local ideal.
3. **AMBÍGUO:** sem decisão determinística (exige decisão humana prévia).

Apresentar mapeamento ao usuário e aguardar confirmação explícita.

Ordem de execução:

- **P-1 (opcional, somente com aprovação):** criar envelope `frontend/` e mover app atual preservando `frontend/src`.
- **P0:** Types
- **P1:** Utils
- **P2:** Services
- **P3:** Hooks
- **P4:** Components
- **P5:** Pages (aplicar regra menu/submenu de forma estrita)

Para cada arquivo movido:

a) mover para local correto
b) atualizar todos os imports consumidores
c) atualizar barrel `index.ts` de origem/destino (mínimo necessário)
d) executar gate de verificação
e) reportar VERDE ou VERMELHO (com diagnóstico/reversão do sub-batch)

Limite: máximo 5 arquivos por verificação; preferir 1-3.

#### NÍVEL 02 (PROTOCOLO CANÔNICO)

```markdown
# SYS.DIRECTIVE: SURGICAL FILESYSTEM REORGANIZATION

> MODE: INCREMENTAL_ATOMIC | REGRESSION_TOLERANCE: ZERO

**1. PRE-FLIGHT AUDIT**

- Escanear estrutura atual.
- Para cada arquivo, definir:
  - Path atual -> Path ideal
  - Imports impactados
  - Risk score: LOW (0-2), MEDIUM (3-8), HIGH (9+)
  - Regra aplicada: MENU_PATH (apenas pages) ou LAYER_PATH (demais camadas)

_Output obrigatório:_ [Arquivo | Atual | Ideal | Imports Afetados | Risk | Regra]
Ordenar por Risk ASC. Não executar sem aprovação do usuário.

**2. EXECUTION PROTOCOL (BATCH)**

- Batch: 1 domínio por iteração; até 5 arquivos por sub-batch.
- Para cada arquivo:
  2.1 localizar consumidores (`grep`/`rg`)
  2.2 mover mantendo nome
  2.3 atualizar todos os imports afetados
  2.4 ajustar barrel de origem/destino
  2.5 rodar `npm run verify`
  2.6 VERDE -> registrar e seguir
  2.7 VERMELHO -> reverter sub-batch e diagnosticar

**3. POST-FLIGHT VALIDATION**
3.1 rodar gate canônico completo
3.2 garantir zero page `.tsx/.ts` solta em raiz de `src/pages`
3.3 garantir coerência menu->pages para todas as rotas de submenu
3.4 regenerar inventário (`npm run inventory:generate`)
3.5 reportar resumo final [Arquivos movidos | Imports ajustados | Gates]

**4. ABORT CONDITIONS**

- 3 sub-batches vermelhos consecutivos -> parar e reportar padrão sistêmico.
- Classificação AMBÍGUA -> parar e solicitar decisão humana.
- Dependência circular introduzida -> parar e não resolver inline.
```

#### NÍVEL 03 (GOD MODE / ESPECIFICAÇÃO DE MÁQUINA)

<system_directive>
<constraints>
<flag>MODE_SURGICAL_INCREMENTAL</flag>
<flag>REGRESSION_TOLERANCE_ZERO</flag>
<flag>BATCH_SIZE_MAX_5</flag>
<flag>RENAME_PROHIBITED</flag>
<flag>LOGIC_MUTATION_PROHIBITED</flag>
<flag>FUNCTIONAL_DELTA_ZERO</flag>
</constraints>
<classification_rules>
For each file F:

1. Detect category (PAGE, COMPONENT, HOOK, SERVICE, UTIL, TYPE, TEST).
2. If category == PAGE:
   - idealPath must mirror active menu/submenu route tree.
   - detail pages inherit parent menu domain (no parallel orphan folder).
3. If category != PAGE:
   - idealPath follows domain/layer architecture, not menu labels.
4. If workspace strategy approved for backend readiness:
   - place frontend app under `frontend/` preserving `frontend/src`.
5. Mark as DISPLACED when currentPath != idealPath.
6. Mark as AMBIGUOUS when more than one idealPath is valid.
   </classification_rules>

  <!-- Graph-of-Thoughts (2025): raciocínio não-linear com dependências -->

<graph_reasoning>
Arquivos NÃO devem ser classificados isoladamente.
Usar raciocínio em grafo para respeitar dependências:

    1. NODOS: cada arquivo é um nó com path atual e path(s) candidato(s)
    2. ARESTAS: dependências de import entre arquivos
    3. CONSTRAINT: mover A pode invalidar o path ideal de B se B importa A
    4. RESOLUÇÃO: classificar primeiro arquivos com 0 dependentes (folhas),
       depois propagar decisões para os nós internos
    5. CICLOS: se A→B→A detectado → marcar AMBOS como AMBÍGUO e escalar
    6. BATCHING: agrupar nós conectados no mesmo sub-batch para mover juntos

    OUTPUT: grafo de decisão em tabela, não lista linear.
    Colunas: [Arquivo | Depende de | Importado por | Decisão | Batch #]

</graph_reasoning>

  <!-- RSIP: autoavaliação antes de executar -->

<rsip_pre_execution>
Após classificar todos os arquivos e ANTES de executar movimentações: 1. EVALUATE: "A classificação respeita todas as dependências do grafo?" 2. WEAKNESS: "Algum arquivo DESLOCADO tem >5 importadores não classificados?" 3. REFINE: Se risco alto detectado → re-classificar com prioridade mais baixa
MAX-CYCLES: 1
</rsip_pre_execution>
<execution_engine>
<per_file_protocol>

1. scan consumers
2. move file
3. patch all imports
4. adjust barrel exports
5. run canonical verify
6. if red -> revert sub-batch and halt
   </per_file_protocol>
   </execution_engine>
   <post_flight>
   <validation>
7. full verify green
8. zero root-level pages in `src/pages`
9. menu/submenu <-> pages path coherence
10. inventory regenerated
    </validation>
    </post_flight>
    <abort_conditions>
    <condition trigger="3_consecutive_red_gates">HARD_STOP</condition>
    <condition trigger="ambiguous_classification">HARD_STOP</condition>
    <condition trigger="circular_dependency_detected">HARD_STOP</condition>
    </abort_conditions>
    </system_directive>
