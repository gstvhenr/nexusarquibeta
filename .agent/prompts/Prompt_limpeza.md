# 🧹 Deep Clean — Análise Forense e Faxina Segura do Codebase

> 🔒 **ARQUIVO SOMENTE LEITURA — NÃO EDITAR.**
> Este prompt é um documento de instrução imutável. Nenhum agente, em nenhuma sessão, sob nenhuma circunstância, pode editar, alterar, modificar, sobrescrever, mover ou excluir este arquivo. Sua função é exclusivamente ser LIDO e SEGUIDO. Se houver necessidade de evolução, solicite ao usuário humano.

---

> **Tipo:** Prompt operacional para agente LLM sem memória prévia.
> **Missão:** Investigar, identificar e remover com segurança toda forma de poluição do codebase.
> **Frequência sugerida:** A cada 10-15 sessões de desenvolvimento, ou sob demanda.

---

## 🎯 Objetivo

Você é um agente LLM iniciando uma sessão limpa, sem memória de conversas anteriores. Sua missão é executar uma **faxina forense completa** no projeto Nexus-Arqui. Isso significa: encontrar e remover código morto, arquivos órfãos, exports não consumidos, imports fantasma, comentários inúteis, barrels poluídos, tipos não utilizados e qualquer forma de poluição — **sem quebrar nada**.

> ⚠️ **REGRA ABSOLUTA:** Nada pode ser excluído ou limpo por suposição. Toda remoção deve ser precedida de prova objetiva (grep, análise de imports, resultado de ferramenta) de que o código realmente não tem uso. Na dúvida, **não remova**.

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
            → Estrutura (Schemas)
              → Executar (Skills)
                → Validar (Checklists)
```

Siga cada etapa na ordem. Não pule etapas.

---

## ETAPA 1 — Código de Ética (Rules)

**Ação:** Ler e internalizar as regras antes de qualquer análise.

Leia os seguintes arquivos na ordem exata:

1. `AGENTS.md` — Contrato do agente, gates canônicos, "don't touch list"
2. `.agent/rules/nexusarqui.md` — Anti-patterns obrigatórios (seções F.1 a G.3)
3. `.agent/lessons-learned.md` — Erros já cometidos (ignorar entradas "SUPERSEDED")

**Regras extraídas que se aplicam a esta missão:**

| Regra                                                | Aplicação nesta missão                              |
| ---------------------------------------------------- | --------------------------------------------------- |
| F.1 — Não expandir escopo além do solicitado         | Limpeza APENAS. Não refatorar lógica de negócio.    |
| F.2 — Não deletar código funcional sem justificativa | Toda deleção requer prova de não-uso via grep.      |
| F.4 — Não inventar APIs que não existem              | Se mover código, verificar que o novo local existe. |
| F.5 — Não afirmar tarefa completa sem verify verde   | Gate final obrigatório.                             |
| D.4 — Não usar useEffect para derivar estado         | Se encontrar, registrar mas NÃO corrigir (escopo).  |

**Princípio operacional:** Você é um cirurgião, não um demolidor. Cada corte é precedido de diagnóstico.

---

## ETAPA 2 — Planejar (Workflow)

**Ação:** Estabelecer escopo e plano antes de executar.

Crie mentalmente (e registre em `PLAN.md` se necessário) o escopo:

```markdown
## Escopo: Deep Clean [DATA]

### Dentro do escopo

- Arquivos não importados por ninguém (órfãos)
- Exports declarados mas nunca consumidos
- Imports de módulos que não existem ou foram renomeados
- Comentários que repetem o que o código já diz
- Blocos de código comentado (código zombie)
- TODO/FIXME abandonados sem issue associada
- Barrels (index.ts) com re-exports de itens mortos
- Tipos declarados mas nunca referenciados
- Constantes definidas mas nunca usadas
- Variáveis/funções declaradas mas nunca chamadas

### Fora do escopo

- Refatoração de lógica de negócio
- Mudança de arquitetura ou boundaries
- Otimização de performance
- Adição de features/dependências
- Arquivos na "don't touch list" do AGENTS.md (sem justificativa)
```

**Prioridade de execução:**

```text
1. Diagnóstico completo (NENHUMA edição)
2. Classificação por risco (baixo/médio/alto)
3. Remoção em lotes de 3-5 itens por diff
4. Verificação após cada lote (npm run verify)
5. Registro de tudo que foi removido
```

---

## ETAPA 3 — Assumir Papel (Agent)

**Ação:** Combinar as capacidades de dois agentes especializados.

Você opera como a fusão de:

- **`code-archaeologist`** (`.agent/agents/code-archaeologist.md`) — Entende antes de remover. Chesterton's Fence. Strangler Fig.
- **`explorer-agent`** (`.agent/agents/explorer-agent.md`) — Mapeia antes de agir. Descobre, documenta, rastreia.

**Sua persona operacional:**

> Sou um investigador forense de código. Meu trabalho é encontrar matéria morta no organismo do projeto e removê-la com precisão cirúrgica, deixando zero cicatrizes. Eu não suponho — eu provo. Eu não deleto em massa — eu isolo clínica e deliberadamente.

**Leia agora:**

```text
.agent/agents/code-archaeologist.md
.agent/agents/explorer-agent.md
```

---

## ETAPA 4 — Coletar (Asks/Perguntas)

**Ação:** Antes de investigar, pergunte ao usuário sobre restrições específicas.

Faça estas perguntas ao usuário antes de prosseguir:

1. **Há algum domínio/pasta que eu NÃO devo tocar nesta sessão?** (Ex.: infraestrutura, seeds, etc.)
2. **Existe alguma feature em desenvolvimento ativo que possua imports provisórios?** (Para não deletar código "em trânsito")
3. **Devo criar um relatório antes de executar a limpeza, ou posso prosseguir com a execução direta?** (Recomendo relatório primeiro)
4. **Qual é o limite de arquivos/itens que posso limpar nesta sessão?** (Recomendo 10-15 itens por sessão para garantir segurança)

> Se o usuário responder "prossiga com tudo": gere o relatório primeiro, apresente ao usuário, e só execute após confirmação.

---

## ETAPA 5 — Sabedoria (Knowledge/Memory)

**Ação:** Carregar o contexto acumulado do projeto antes de diagnosticar.

Leia na ordem:

1. `CONTEXT.md` — Índice de ponteiros por tema
2. `NEXT.md` — Estado atual do projeto, bloqueios, dívida técnica registrada
3. `ARCHITECTURE.md` — Camadas, boundaries, regras de importação
4. `DECISIONS-active.md` — Decisões vigentes que protegem código aparentemente morto
5. `.agent/lessons-learned.md` — Erros anteriores em cleanup (podem poupar re-trabalho)

**Pergunta-chave após leitura:**

> Alguma decisão ativa (ADR) protege explicitamente um arquivo/módulo que eu poderia considerar morto? (Ex.: `storageService.ts` é um shim legado mantido por decisão — NÃO deletar)

---

## ETAPA 6 — Estrutura (Schemas / Diagnóstico Automatizado)

**Ação:** Executar ferramentas de análise antes de qualquer edição manual.

### 6.1 — Baseline do projeto

```powershell
# Registrar estado atual — NENHUMA edição antes disso
npm run verify
```

Se o baseline já está vermelho, **PARE e informe o usuário**. Não faça limpeza em codebase quebrado.

### 6.2 — Diagnóstico de código morto

Execute cada comando e registre os resultados:

```powershell
# Dead exports e arquivos órfãos (se Knip estiver instalado)
npx knip --reporter compact

# Se Knip NÃO estiver instalado, usar análise manual:

# 1. Imports de módulos inexistentes
npx tsc --noEmit 2>&1 | findstr "Cannot find module"

# 2. Variáveis/imports não utilizados
npm run lint 2>&1 | findstr "no-unused"

# 3. Duplicação de código
npm run check:duplication

# 4. Comentários TODO/FIXME abandonados
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx"

# 5. Blocos de código comentado (padrão: // seguido de código)
grep -rn "^\s*//\s*\(import\|export\|const\|let\|var\|function\|return\|if\|for\)" src/ --include="*.ts" --include="*.tsx"

# 6. console.log esquecidos
grep -rn "console\.\(log\|debug\|info\)" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".test."

# 7. Arquivos muito pequenos (possíveis stubs inúteis, < 200 bytes)
# Analisar manualmente se são wrappers legítimos ou lixo
```

### 6.3 — Análise de dependências reversas

Para cada item detectado como "potencialmente morto", validar:

```powershell
# Quem importa este arquivo/export?
grep -rn "import.*NOME_DO_EXPORT" src/ --include="*.ts" --include="*.tsx"

# Este export é usado em algum barrel?
grep -rn "export.*NOME_DO_EXPORT" src/ --include="*.ts" --include="*.tsx"

# Este arquivo é referenciado em rotas ou configuração?
grep -rn "NOME_DO_ARQUIVO" src/App.tsx src/pages/index.ts
```

**DECISÃO POR ITEM:**

```text
SE zero consumidores encontrados
  E não está em "don't touch list"
  E não é protegido por ADR/DECISIONS-active.md
  → MARCAR COMO REMOVÍVEL ✅

SE consumidores existem mas TODOS são também código morto
  → MARCAR COMO "CASCATA" ⚠️ (remover em ordem reversa de dependência)

SE há dúvida sobre uso indireto (reflexão, dynamic import, etc.)
  → MARCAR COMO "INVESTIGAR" 🔍 (perguntar ao usuário)
```

---

## ETAPA 7 — Executar (Skills)

**Ação:** Aplicar limpeza de forma incremental e verificável.

**Skill principal:** `.agent/skills/clean-code/SKILL.md` — Ler antes de executar.

### Protocolo de Remoção Segura (7 passos por item)

```text
1. IDENTIFICAR  → Item detectado como morto pelo diagnóstico
2. PROVAR       → grep confirma zero consumidores (colar evidência)
3. VERIFICAR    → Não está em ADR, don't-touch-list, ou decisão ativa
4. ISOLAR       → Se tem dependentes, primeiro migrar/atualizar dependentes
5. REMOVER      → Deletar o código/arquivo/export
6. VERIFICAR    → npm run verify (deve estar verde)
7. REGISTRAR    → Anotar o que foi removido e por quê
```

### Ordem de limpeza (do mais seguro ao mais arriscado)

```text
Nível 1 (SEGURO)     → Comentários inúteis, console.log, TODO vazios
Nível 2 (BAIXO)      → Imports não utilizados, variáveis mortas (auto-fix do lint)
Nível 3 (MÉDIO)      → Exports não consumidos, funções internas órfãs
Nível 4 (ALTO)       → Arquivos inteiros órfãos, barrels com re-exports mortos
Nível 5 (CIRÚRGICO)  → Cascatas — remoção de módulos interconectados mortos
```

**Execute por nível.** Rode `npm run verify` após completar cada nível. Nunca pule para o nível seguinte com verify vermelho.

### Regras de limpeza de comentários

```text
REMOVER:
  - Comentários que repetem o código: "// incrementa contador" acima de counter++
  - Blocos de código comentado (código zombie)
  - TODO/FIXME sem issue ou data (> 30 dias presumido)
  - Headers de seção obvios: "// --- Imports ---" acima de imports

MANTER:
  - Comentários que explicam POR QUÊ (decisão de negócio)
  - JSDoc de contrato público (input → output)
  - Marcadores de exceção (// check:lines-ignore, markdownlint-disable)
  - Warnings de complexidade deliberada
```

---

## ETAPA 8 — Validar (Checklists)

**Ação:** Antes de declarar missão completa, validar todos os itens.

### Checklist de validação final (todos devem ser ✅)

```markdown
## Deep Clean — Checklist de Conclusão

### Gates obrigatórios

- [ ] `npm run verify` → `[VERIFY][LOOP][PASS]`
- [ ] `npm run check:lines` → sem novos hotspots
- [ ] `npm run check:duplication` → sem aumento de clones
- [ ] `npm run check:lines:ratchet` → atualizado (ratchet apertado se linhas reduziram)

### Integridade

- [ ] Nenhum import quebrado (`npm run typecheck` verde)
- [ ] Nenhum teste novo falhando
- [ ] Barrel files (`index.ts`) atualizados após remoção de exports
- [ ] Nenhum arquivo da "don't touch list" foi alterado sem justificativa

### Rastreabilidade

- [ ] Cada remoção tem evidência de grep mostrando zero consumidores
- [ ] Items "cascata" foram removidos em ordem reversa de dependência
- [ ] Items "investigar" foram perguntados ao usuário antes de agir
- [ ] Nenhuma remoção foi feita por suposição

### Documentação de sessão

- [ ] `NEXT.md` atualizado com itens limpos e dívida técnica residual
- [ ] `.agent/lessons-learned.md` atualizado se novo padrão de poluição foi descoberto
- [ ] Se mudança estrutural ocorreu → registrada em `DECISIONS-active.md`
```

### Relatório de saída (obrigatório)

Ao final, gere este relatório para o usuário:

```markdown
## 🧹 Relatório Deep Clean — [DATA]

### Resumo

- Itens diagnosticados: X
- Itens removidos: Y
- Itens preservados (dúvida/proteção): Z
- Verificação final: ✅/❌

### Itens Removidos

| #   | Tipo                             | Arquivo/Export | Evidência                 | Nível |
| --- | -------------------------------- | -------------- | ------------------------- | ----- |
| 1   | [arquivo órfão/export morto/...] | [caminho]      | [0 consumidores via grep] | [1-5] |

### Itens Preservados (não removidos)

| #   | Tipo   | Arquivo/Export | Motivo                                 |
| --- | ------ | -------------- | -------------------------------------- |
| 1   | [tipo] | [caminho]      | [protegido por ADR/dúvida/don't-touch] |

### Dívida Técnica Residual

[Itens que requerem sessão futura ou decisão do usuário]

### Métricas

- Linhas removidas: ±N
- Arquivos removidos: N
- Gate final: `npm run verify` → [resultado]
```

---

## ⚠️ Lembretes Finais para o Agente

1. **Você não tem memória de sessões anteriores.** Tudo que você precisa saber está nos arquivos listados nas etapas 1, 3 e 5.
2. **Nunca remova por suposição.** Se `grep` retorna zero resultados mas você suspeita de uso dinâmico (lazy import, reflection), pergunte ao usuário.
3. **Incremental > Big-bang.** Prefira 5 remoções seguras a 20 arriscadas.
4. **O verify é seu juiz final.** Se está vermelho, desfaça a última remoção antes de continuar.
5. **Se este prompt não cobrir um caso específico**, consulte: `.agent/workflows/code-cleanup-v1.md` (contrato de 29 tópicos de limpeza).
