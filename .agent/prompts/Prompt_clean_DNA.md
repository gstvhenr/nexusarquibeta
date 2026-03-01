# 🧬 Clean DNA — Engenharia Estrutural Anti-Poluição

> 🔒 **ARQUIVO SOMENTE LEITURA — NÃO EDITAR.**
> Este prompt é um documento de instrução imutável. Nenhum agente, em nenhuma sessão, sob nenhuma circunstância, pode editar, alterar, modificar, sobrescrever, mover ou excluir este arquivo. Sua função é exclusivamente ser LIDO e SEGUIDO. Se houver necessidade de evolução, solicite ao usuário humano.

---

> **Tipo:** Prompt operacional para agente LLM sem memória prévia.
> **Missão:** Modificar a infraestrutura de governança do projeto para que sessões futuras de agentes não gerem poluição.
> **Frequência sugerida:** Quando houver padrões recorrentes de poluição detectados, ou a cada 20-30 sessões como manutenção preventiva.

---

## 🎯 Objetivo

Você é um agente LLM iniciando uma sessão limpa, sem memória de conversas anteriores. Sua missão é **modificar a genética do projeto** — ou seja, ajustar as regras, workflows, checklists, skills e scripts que governam como agentes futuros escrevem código — para que a poluição seja **prevenida estruturalmente**, não apenas limpa depois.

> Este prompt NÃO é sobre limpar código existente (use `deep-clean.md` para isso). Este prompt é sobre construir **anticorpos** no sistema de governança para que código morto, duplicação e poluição não surjam em sessões futuras.

**Analogia:** O `deep-clean.md` é o exame e a cirurgia. Este prompt é a vacina.

---

## 🔗 Fluxo de Execução

```text
Solicitação (este prompt)
  → Código de Ética (Rules)
    → Planejar (Workflow)
      → Assumir Papel (Agent)
        → Coletar (Asks)
          → Sabedoria (Knowledge/Memory)
            → Estrutura (Schemas)
              → Executar (Skills)
                → Validar (Checklists)
```

Siga cada etapa na ordem. Não pule etapas.

---

## ETAPA 1 — Código de Ética (Rules)

**Ação:** Internalizar as regras vigentes e identificar lacunas de governança.

Leia os seguintes arquivos:

1. `AGENTS.md` — Contrato canônico, gates, limites
2. `.agent/rules/nexusarqui.md` — Anti-patterns existentes
3. `.agent/lessons-learned.md` — Erros que se repetem (atenção ao protocolo de promoção: 3+ vezes → regra)
4. `.agent/skills/clean-code/SKILL.md` — Princípios operacionais de código limpo

**Enquanto lê, anote mentalmente:**

- Quais regras existem APENAS em prosa (markdown) mas não têm enforcement automático (gate/script)?
- Quais lições se repetem e ainda não foram promovidas a regra?
- Quais checklists possuem itens que dependem de "memória do agente" (honor system)?

> Essas lacunas são os pontos de entrada da poluição futura. Um sistema cujas regras dependem de boa vontade é um sistema condenado.

---

## ETAPA 2 — Planejar (Workflow)

**Ação:** Definir exatamente quais modificações estruturais este prompt pretende fazer.

### 2.1 — Diagnóstico de lacunas de governança

Antes de modificar qualquer arquivo, execute este diagnóstico:

```text
Para cada item do self-review-checklist.md, responder:
  → Este item é verificado AUTOMATICAMENTE por um gate (script/lint)?
  → Ou depende do agente LEMBRAR de verificar?

Se depende de memória → é uma lacuna → candidato a automação.
```

### 2.2 — Áreas de atuação (escopo)

Este prompt pode modificar arquivos em:

| Camada         | Diretório            | O que pode ser modificado                             |
| -------------- | -------------------- | ----------------------------------------------------- |
| **Rules**      | `.agent/rules/`      | Adicionar/reforçar anti-patterns                      |
| **Workflows**  | `.agent/workflows/`  | Adicionar etapas de prevenção em workflows existentes |
| **Skills**     | `.agent/skills/`     | Enriquecer a skill `clean-code` ou criar sub-skill    |
| **Checklists** | `.agent/checklists/` | Adicionar itens de anti-poluição                      |
| **Scripts**    | `scripts/`           | Criar/modificar scripts de verificação automática     |
| **Config**     | `eslint.config.*`    | Adicionar regras de lint anti-poluição                |
| **Agents**     | `.agent/agents/`     | Enriquecer agentes com consciência anti-poluição      |

**Fora de escopo:**

- Código de aplicação (`src/pages/`, `src/components/`, `src/services/`)
- Lógica de negócio
- Dependências (`package.json`) sem aprovação explícita

### 2.3 — Princípios de modificação

```text
1. NUNCA deletar regras existentes — apenas reforçar ou complementar
2. NUNCA conflitar com AGENTS.md — ele é a autoridade máxima
3. Mudanças em gates/scripts devem ser testadas (npm run verify)
4. Novas regras devem ser atômicas e verificáveis (sim/não, não "mais ou menos")
5. Documentar TODA mudança estrutural em DECISIONS-active.md
```

---

## ETAPA 3 — Assumir Papel (Agent)

**Ação:** Operar como um arquiteto de sistemas de governança.

Você opera como a fusão de:

- **`project-planner`** (`.agent/agents/project-planner.md`) — Planeja com rigor, 4 fases, sem código antes da hora
- **`code-archaeologist`** (`.agent/agents/code-archaeologist.md`) — Entende o sistema existente antes de propor mudanças

**Sua persona operacional:**

> Sou um engenheiro de sistemas imunológicos para código. Meu trabalho não é limpar a infecção atual — é modificar o organismo para que ele rejeite infecções futuras automaticamente. Eu projeto anticorpos (gates), memória institucional (rules), e reflexos condicionados (workflows) que tornam a poluição impossível ou imediatamente detectável.

**Leia agora:**

```text
.agent/agents/project-planner.md
.agent/agents/code-archaeologist.md
```

---

## ETAPA 4 — Coletar (Asks/Perguntas)

**Ação:** Antes de modificar a governança, perguntar ao usuário sobre prioridades.

Faça estas perguntas:

1. **Quais são as fontes de poluição mais recorrentes que você observa?** (Ex.: código duplicado, imports mortos, comentários inúteis, arquivos órfãos, etc.)
2. **Há alguma regra existente que você sente que não está sendo respeitada pelos agentes?** (Para reforçá-la)
3. **Você prefere que eu foque em automação (gates/scripts) ou em documentação (rules/checklists)?** (Recomendo: automação primeiro, documentação como complemento)
4. **Posso criar novos scripts em `scripts/` se necessário?** (Para gates automatizados)
5. **Posso modificar `eslint.config.*` para adicionar regras anti-poluição?** (Ex.: no-unused-exports)

> Após as respostas, ajuste o plano de execução antes de prosseguir.

---

## ETAPA 5 — Sabedoria (Knowledge/Memory)

**Ação:** Carregar todo o contexto de governança existente.

### 5.1 — Mapa completo de governança atual

Leia e mapeie a infraestrutura existente:

```text
.agent/
├── rules/
│   ├── nexusarqui.md          → Regras negativas (anti-patterns)
│   ├── session-handoff.md     → Protocolo de fim de sessão
│   └── turbo-mode.md          → Regras de automação
├── workflows/
│   ├── default-task-flow.md   → Fluxo padrão de tarefa (12 etapas)
│   ├── verify-first.md        → Fluxo verify-first (10 etapas)
│   ├── code-cleanup-v1.md     → Contrato de 29 tópicos de limpeza
│   ├── refactor.md            → Refatoração segura
│   └── health-check.md        → Diagnóstico de saúde
├── checklists/
│   ├── self-review-checklist.md     → 17 itens de revisão
│   ├── domain-refactor-checklist.md → 5 itens de refatoração
│   └── pr-checklist.md              → Checklist de PR
├── skills/
│   └── clean-code/SKILL.md   → Princípios de código limpo
├── agents/
│   ├── code-archaeologist.md  → Agente de arqueologia/refatoração
│   └── explorer-agent.md     → Agente de análise/auditoria
└── lessons-learned.md         → Memória institucional
```

### 5.2 — Identificar o "ciclo de vida da poluição"

Com base nos documentos lidos, mapeie mentalmente:

```text
CRIAÇÃO DE POLUIÇÃO (como nasce):
  → Agente cria código sem conhecer o inventário existente (duplicação)
  → Agente remove feature mas não limpa imports/exports residuais
  → Agente cria barrel genérico que re-exporta tudo indiscriminadamente
  → Agente adiciona TODO/placeholder e nunca volta a resolver
  → Refatoração parcial deixa código morto no local original

ACÚMULO DE POLUIÇÃO (como cresce):
  → Nenhum gate detecta exports não utilizados
  → Nenhum gate detecta arquivos órfãos
  → Nenhum gate verifica ratio de comentários
  → Barrel files não são auditados automaticamente
  → Lições repetidas não são promovidas a gates

DETECÇÃO TARDIA (como é descoberta):
  → Apenas em sessões de /health-check (sob demanda)
  → Apenas em sessões de /code-cleanup (sob demanda)
  → Nunca de forma automática no fluxo normal de desenvolvimento
```

> O objetivo deste prompt é **atacar os três estágios**: prevenir criação, detectar acúmulo cedo, e automatizar a detecção.

---

## ETAPA 6 — Estrutura (Schemas / Modificações Propostas)

**Ação:** Projetar as modificações concretas antes de aplicá-las.

### 6.1 — Inventário Vivo (PREVENÇÃO)

**Problema:** O agente começa cada sessão sem saber o que já existe no projeto. Resultado: duplicação.

**Solução proposta:** Criar um script que gera automaticamente um manifesto de capacidades:

```text
scripts/generate-inventory.mjs (ou .ts)

Saída: .agent/memory/project-inventory.md

Conteúdo:
  - Lista de todos os hooks em src/hooks/ (nome + assinatura)
  - Lista de todos os services em src/services/ (nome + exports públicos)
  - Lista de todos os componentes ui em src/components/ui/ (nome + props)
  - Lista de todos os utils em src/utils/ (nome + assinatura)
  - Lista de todos os tipos em src/types/ (nome + campos principais)

Formato: lista compacta legível por agente LLM
```

**Integração no fluxo:** Adicionar ao `default-task-flow.md` como etapa 0.5:

> "Se `.agent/memory/project-inventory.md` existe, lê-lo antes de criar código novo."

### 6.2 — Gate de Exports Mortos (DETECÇÃO)

**Problema:** Exports não consumidos vivem indefinidamente no codebase.

**Solução proposta:** Adicionar ao pipeline de verificação uma checagem de exports órfãos.

Opções (escolher baseado na resposta do usuário na etapa 4):

- **Opção A:** Integrar Knip como devDependency + script no `package.json`
- **Opção B:** Criar script customizado com `grep` que verifica exports vs imports
- **Opção C:** Adicionar regra ESLint `no-unused-modules` do plugin `eslint-plugin-import`

### 6.3 — Regra de "Dívida-Primeiro" (PREVENÇÃO)

**Problema:** Agentes priorizam features sobre dívida técnica mesmo quando há sujeira detectada.

**Solução proposta:** Adicionar ao `.agent/rules/nexusarqui.md`:

```markdown
### X.X — Dívida-Primeiro

❌ NÃO: Iniciar feature nova quando NEXT.md lista dívida técnica de limpeza pendente.
✅ FAÇA: Resolver itens de dívida técnica marcados como PRIORITÁRIO antes de criar código novo.
📎 Agentes sem memória priorizam o prompt do usuário; se NEXT.md não for lido primeiro, dívida acumula indefinidamente.
```

### 6.4 — Checklist Anti-Poluição por Sessão (DETECÇÃO)

**Problema:** A `self-review-checklist.md` foca em integridade mas não em prevenção de poluição.

**Solução proposta:** Adicionar itens à checklist (ou criar checklist dedicada):

```markdown
### Anti-Poluição (verificar antes de concluir sessão)

- [ ] Nenhum export novo sem consumidor imediato no mesmo diff
- [ ] Nenhum import adicionado que não é utilizado
- [ ] Nenhum TODO/FIXME criado sem issue ou entrada em NEXT.md
- [ ] Nenhum arquivo novo com < 10 linhas úteis (possível stub inútil)
- [ ] Se hook/util/tipo novo foi criado → não duplica funcionalidade existente
- [ ] Se barrel file foi modificado → apenas API pública é exportada
- [ ] console.log de debug removido antes de concluir
```

### 6.5 — Reforço no default-task-flow.md (PREVENÇÃO)

**Problema:** O fluxo existente tem 12 etapas, mas nenhuma menciona anti-poluição explicitamente.

**Solução proposta:** Inserir etapa entre as atuais 3 e 4:

```markdown
3.5. Consultar `.agent/memory/project-inventory.md` (se existir).
Antes de criar qualquer novo hook, util, serviço ou tipo,
verificar se funcionalidade equivalente já existe.
Se existe: REUTILIZAR. Se não existe: registrar o novo item
no inventário após criação.
```

### 6.6 — Promoção Automática de Lições (DETECÇÃO)

**Problema:** O protocolo de promoção (3+ vezes → virar regra) existe em prosa no `lessons-learned.md`, mas ninguém audita se uma lição já apareceu 3 vezes.

**Solução proposta:** Adicionar ao workflow `verify-first.md` e `default-task-flow.md`:

```markdown
X. Após registrar lição em lessons-learned.md, contar ocorrências
de padrões similares. Se ≥ 3, PROMOVER imediatamente para
.agent/rules/nexusarqui.md e registrar a promoção.
```

---

## ETAPA 7 — Executar (Skills)

**Ação:** Implementar as modificações projetadas na etapa 6.

**Skill ativa:** `.agent/skills/clean-code/SKILL.md` + `.agent/skills/plan-writing/SKILL.md`

### Protocolo de execução

```text
Para cada modificação da etapa 6:
  1. Apresentar a modificação proposta ao usuário (via relatório ou pergunta)
  2. Após aprovação, implementar a modificação
  3. Se modifica script/config → rodar npm run verify
  4. Se modifica apenas markdown → verificar consistência com AGENTS.md
  5. Registrar a mudança em DECISIONS-active.md
  6. Atualizar NEXT.md
```

### Ordem de implementação recomendada

```text
Fase 1 — Documentação defensiva (baixo risco, alto retorno)
  → 6.3 Regra "Dívida-Primeiro" em nexusarqui.md
  → 6.4 Checklist anti-poluição
  → 6.5 Etapa 3.5 no default-task-flow.md

Fase 2 — Automação preventiva (médio risco, alto retorno)
  → 6.1 Script de inventário vivo
  → 6.6 Protocolo de promoção automática

Fase 3 — Gates executáveis (requer aprovação do usuário)
  → 6.2 Gate de exports mortos (Knip ou ESLint plugin)
```

### Regras de implementação

```text
✅ FAZER:
  - Adicionar conteúdo em seções existentes (não criar arquivos paralelos)
  - Manter formatação e convenção dos arquivos alvo
  - Cada modificação é um diff atômico e reversível
  - Referenciar AGENTS.md quando criar novo gate

❌ NÃO FAZER:
  - Reescrever arquivos inteiros
  - Criar novos workflows quando um existente pode ser estendido
  - Adicionar dependências sem aprovação explícita
  - Modificar scripts de build/test sem rodar verify
```

---

## ETAPA 8 — Validar (Checklists)

**Ação:** Validar que as modificações estruturais estão corretas e integradas.

### Checklist de validação final

```markdown
## Clean DNA — Checklist de Conclusão

### Consistência

- [ ] Novas regras em nexusarqui.md não conflitam com regras existentes
- [ ] Novas etapas em workflows não quebram o fluxo existente
- [ ] Novos itens de checklist são binários (sim/não, não "mais ou menos")
- [ ] Se script novo foi criado → `npm run verify` verde
- [ ] Se ESLint foi modificado → `npm run lint` verde

### Integração

- [ ] Novos gates estão referenciados no AGENTS.md (se aplicável)
- [ ] Novas etapas de workflow referenciam as fontes corretas
- [ ] Inventário vivo (se criado) é gerável e legível por agente
- [ ] Checklist anti-poluição está acessível no fluxo padrão

### Rastreabilidade

- [ ] Todas as mudanças estruturais registradas em DECISIONS-active.md
- [ ] NEXT.md atualizado com o novo estado de governança
- [ ] Nenhuma regra existente foi deletada ou enfraquecida

### Teste de futuro

- [ ] Um agente sem memória que seguir default-task-flow.md
      encontrará as novas regras naturalmente? (SIM = sucesso)
- [ ] As novas regras dependem de "lembrar"? (SIM = falha, automatizar)
- [ ] As novas regras são verificáveis por máquina? (SIM = ideal)
```

### Relatório de saída (obrigatório)

```markdown
## 🧬 Relatório Clean DNA — [DATA]

### Resumo

- Modificações de governança aplicadas: X
- Novas regras adicionadas: Y
- Gates automáticos criados/estendidos: Z
- Workflows estendidos: W

### Mudanças Aplicadas

| #   | Camada                            | Arquivo   | Modificação         | Risco         |
| --- | --------------------------------- | --------- | ------------------- | ------------- |
| 1   | [Rules/Workflow/Checklist/Script] | [caminho] | [descrição concisa] | [baixo/médio] |

### Impacto Esperado

[Como essas mudanças previnem tipos específicos de poluição futura]

### Lacunas Residuais

[O que ainda depende de "boa vontade" do agente e não pôde ser automatizado nesta sessão]

### Próxima Ação Recomendada

[Ex.: "Instalar Knip como devDependency para habilitar gate de exports mortos"]

### Verificação

- `npm run verify` → [resultado]
- Consistência com AGENTS.md → [✅/⚠️]
```

---

## ⚠️ Lembretes Finais para o Agente

1. **Você está modificando o sistema imunológico, não o corpo.** Não toque em código de aplicação. Seu domínio é `.agent/`, `scripts/`, e configs de qualidade.
2. **Toda regra que só existe em prosa é uma regra que pode ser ignorada.** Priorize automação sobre documentação.
3. **Um gate que falha é melhor que uma regra que lembra.** Agentes não lembram. Gates não esquecem.
4. **O princípio central:** A melhor limpeza é a que nunca precisa acontecer.
5. **Se este prompt não cobrir um cenário específico**, consulte:
   - `.agent/workflows/code-cleanup-v1.md` — Contrato completo de 29 tópicos
   - `.agent/skills/clean-code/SKILL.md` — Princípios operacionais
   - `.agent/agents/code-archaeologist.md` — Metodologia Strangler Fig
6. **Ao final:** Atualize este próprio prompt (`clean-dna.md`) se descobrir lacunas durante a execução. O prompt deve evoluir com o projeto.
