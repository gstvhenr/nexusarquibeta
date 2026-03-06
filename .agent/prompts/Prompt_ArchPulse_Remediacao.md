# 🏗️ ArchPulse — Remediação Arquitetural do Nexus-Arqui

> 🔒 **ARQUIVO SOMENTE LEITURA — NÃO EDITAR.**
> Este prompt é um documento de instrução imutável. Nenhum agente, em nenhuma sessão, sob nenhuma circunstância, pode editar, alterar, modificar, sobrescrever, mover ou excluir este arquivo. Sua função é exclusivamente ser LIDO e SEGUIDO.

---

> **Tipo:** Prompt operacional para agente LLM sem memória prévia.
> **Missão:** Investigar e remediar problemas arquiteturais detectados pelo ArchPulse.
> **Gatilho:** Output do ArchPulse com findings de saúde (circular deps, orphans, high coupling).
> **Frequência sugerida:** Após cada execução do ArchPulse, ou sob demanda.

---

## 🎯 Objetivo

Você é um agente LLM iniciando uma sessão limpa, sem memória de conversas anteriores. Sua missão é executar uma **remediação arquitetural sistemática** no projeto Nexus-Arqui, atacando os problemas identificados pelo ArchPulse em ordem de severidade.

> ⚠️ **REGRA ABSOLUTA:** Nenhuma correção pode ser aplicada sem prova objetiva de que é segura. Cada mudança deve preservar delta funcional zero (mesmo comportamento antes e depois). Na dúvida, **não altere — registre em NEXT.md**.

---

## 🔗 Fluxo de Execução

Este prompt segue o fluxo canônico do projeto:

```text
Solicitação (este prompt)
  → Código de Ética (Rules: AGENTS.md)
    → Planejar (Workflow: /refactor + /debug)
      → Assumir Papel (Agent: por fase)
        → Executar (Passos abaixo)
          → Verificar (npm run verify)
```

---

## 📋 PRÉ-FLIGHT OBRIGATÓRIO

Antes de qualquer ação, LEIA na ordem:

1. `AGENTS.md` — contrato, comandos canônicos, regras duras
2. `CONTEXT.md` — ponteiros de contexto ativo
3. `NEXT.md` — estado atual e próximos passos
4. `.agent/lessons-learned.md` — erros recorrentes (ignorar SUPERSEDED)
5. `docs/PLACEMENT_RULES.md` — regras de posicionamento de arquivos
6. `.agent/memory/project-inventory.md` — inventário ativo do projeto

> 🔴 **Sem ler esses arquivos, NÃO iniciar nenhuma fase.**

---

## 📊 DIAGNÓSTICO ARCHPULSE (Input)

Cole abaixo o output completo do ArchPulse para esta sessão. Os campos esperados:

```
Files analyzed: [N]
Total dependencies: [N]
Layers detected: [N]
Health Metrics:
  • Average coupling: [0.XX]
  • Entry points: [N]
  • Circular dependencies: [N]
  • High coupling modules: [N]
  • Orphan modules: [N]
⚠️ Circular Dependencies: [lista]
```

---

## 🔄 FASES DE REMEDIAÇÃO

### FASE 1: Dependências Circulares 🔴 (Severidade: CRÍTICA)

**Agente:** `@debugger` (skill: `systematic-debugging`)
**Workflow:** `/debug`

**Protocolo:**

1. **REPRODUZIR** — Para cada dependência circular reportada:

   - Verificar se é real ou falso positivo (artefato de barrel export, self-reference, etc.)
   - `grep -r "import.*from" <arquivo>` para mapear a cadeia de imports
   - Construir o ciclo completo: `A → B → C → A`

2. **DIAGNOSTICAR** — Para cada ciclo confirmado como real:

   - Classificar o tipo:
     - **Type-only cycle**: imports apenas de tipos (`import type { ... }`)
     - **Runtime cycle**: imports de valores/funções (⚠️ perigoso)
     - **Self-reference**: arquivo importa a si mesmo (quase sempre barrel)
   - Identificar a causa raiz (shared barrel? dependência cruzada? responsabilidade misturada?)

3. **REMEDIAR** — Aplicar a correção incremental adequada:

   - **Self-reference** → Remover o re-export circular do barrel
   - **Type-only cycle** → Migrar para `import type` (se ainda não for) — seguro
   - **Runtime cycle** → Extrair a dependência compartilhada para módulo neutro
   - ⚠️ **Nunca resolver circular dep movendo lógica para onde não pertence**

4. **VERIFICAR** — Após cada correção:
   ```bash
   npm run verify
   ```
   Gate verde → avançar. Gate vermelho → reverter e investigar.

---

### FASE 2: Módulos com Alto Acoplamento 🟠 (Severidade: ALTA)

**Agente:** `@frontend-specialist` (skill: `react-best-practices`, `clean-code`)
**Workflow:** `/refactor`

**Protocolo:**

1. **IDENTIFICAR** — Para cada módulo reportado como "high coupling":

   - Listar todos os seus importadores: `grep -r "from.*<módulo>" src/`
   - Listar todas as suas importações: analisar imports do arquivo
   - Calcular fan-in (quem importa) e fan-out (quem é importado)

2. **CLASSIFICAR** — Determinar se o alto acoplamento é:

   - **Legítimo**: módulo de tipos compartilhados, utils fundacionais, constantes globais → **documentar e aceitar**
   - **Problemático**: módulo "god object" que mistura responsabilidades → **refatorar**

3. **REMEDIAR** (apenas para acoplamento problemático):

   - Aplicar **Single Responsibility**: dividir em módulos menores por domínio
   - Usar **barrel exports** para manter interface pública estável
   - Atualizar TODOS os imports afetados (verificar com grep)
   - ⚠️ **Micro-batches**: máximo 5 arquivos por commit

4. **VERIFICAR** — Após cada micro-batch:
   ```bash
   npm run verify
   ```

---

### FASE 3: Módulos Órfãos 🟡 (Severidade: MÉDIA)

**Agente:** `@debugger` + `@frontend-specialist`
**Workflow:** `/refactor` (modo análise)

**Protocolo:**

1. **INVENTARIAR** — Para cada módulo órfão, classificar:

   | Categoria                | Critério                                         | Ação                                                  |
   | ------------------------ | ------------------------------------------------ | ----------------------------------------------------- |
   | **Entry point legítimo** | Arquivo de rota, page, vite config, script       | ✅ Manter — documentar como entry point               |
   | **Teste**                | Arquivo `*.test.*` ou `*.spec.*`                 | ✅ Manter — é consumido pelo test runner              |
   | **Type-only**            | Arquivo apenas com `type`/`interface` exportados | 🔍 Verificar se os tipos são usados via `import type` |
   | **Código morto**         | Não é importado, não é entry point, não é teste  | 🗑️ Candidato a remoção (com prova)                    |
   | **Arquivo novo/WIP**     | Criado recentemente, possivelmente em progresso  | ⏸️ Registrar em NEXT.md, não remover                  |

2. **VALIDAR CANDIDATOS** — Para cada candidato a remoção:

   - `grep -rn "<nome-do-export>" src/` — confirmar zero usos
   - `grep -rn "<nome-do-arquivo>" src/` — confirmar zero referências
   - Verificar se não é referenciado em `vite.config`, `tsconfig`, `tailwind.config`, rotas
   - ⚠️ **Dupla confirmação obrigatória antes de qualquer remoção**

3. **REMEDIAR** — Em micro-batches de no máximo 10 arquivos:

   - Remover arquivo
   - Remover export do barrel (se existir)
   - Atualizar inventário (`.agent/memory/project-inventory.md`)

4. **VERIFICAR** — Após cada micro-batch:
   ```bash
   npm run verify
   ```

> 📌 **NOTA:** Dos órfãos esperados, muitos serão entry points legítimos (pages, configs, scripts). O número real de "código morto" será significativamente menor que o total reportado.

---

### FASE 4: Validação Final 🟢 (Consolidação)

**Agente:** `@orchestrator`
**Workflow:** `/health-check`

**Protocolo:**

1. **Re-executar ArchPulse** e comparar métricas antes/depois:

   | Métrica          | Antes | Depois | Delta |
   | ---------------- | ----- | ------ | ----- |
   | Circular deps    | ?     | ?      | ?     |
   | High coupling    | ?     | ?      | ?     |
   | Orphan modules   | ?     | ?      | ?     |
   | Average coupling | ?     | ?      | ?     |

2. **Executar gate canônico completo:**

   ```bash
   npm run verify
   ```

3. **Atualizar documentação:**

   - `NEXT.md` — registrar o que foi feito e o que ficou pendente
   - `.agent/lessons-learned.md` — registrar padrões encontrados
   - `docs/decisions/` — criar ADR se houve decisão arquitetural

4. **Relatório final** — Resumo objetivo com:
   - Problemas encontrados vs. resolvidos
   - Falsos positivos identificados
   - Itens adiados (com justificativa)
   - Métricas comparativas

---

## 🛡️ REGRAS DE SEGURANÇA

1. **DELTA FUNCIONAL ZERO**: nenhuma mudança pode alterar comportamento. Apenas organização, imports e remoção de código comprovadamente morto.
2. **MICRO-BATCHES ATÔMICOS**: cada batch deve ser verificável isoladamente com `npm run verify`.
3. **GATE VERMELHO = STOP**: se o gate falhar, reverter IMEDIATAMENTE. Não acumular dívida.
4. **NÃO EXPANDIR ESCOPO**: se encontrar problemas fora do escopo do ArchPulse (bugs, features, refatorações de lógica), registre em `NEXT.md` e PROSSIGA. Nunca corrija oportunisticamente.
5. **PRESERVAR CÓDIGO FUNCIONAL**: nunca deletar ou reescrever código que funciona sem justificativa comprovada com evidência.
6. **PLACEMENT RULES**: antes de mover qualquer arquivo, consultar `docs/PLACEMENT_RULES.md`.

---

## 📐 CRITÉRIOS DE SUCESSO

A sessão é considerada completa quando:

- [ ] Todas as dependências circulares foram resolvidas ou documentadas como falso positivo
- [ ] Módulos de alto acoplamento foram analisados e, se problemáticos, refatorados
- [ ] Módulos órfãos foram classificados (entry point / teste / morto)
- [ ] Código morto confirmado foi removido com prova
- [ ] `npm run verify` passa verde
- [ ] ArchPulse re-executado mostra melhoria nas métricas
- [ ] `NEXT.md` atualizado com pendências (se houver)
- [ ] Relatório comparativo antes/depois entregue

---

## 🤖 Resumo de Roteamento de Agentes

| Fase                | Agente Principal                     | Skills Requeridas                    | Workflow        |
| ------------------- | ------------------------------------ | ------------------------------------ | --------------- |
| 1 — Circular Deps   | `@debugger`                          | `systematic-debugging`, `clean-code` | `/debug`        |
| 2 — High Coupling   | `@frontend-specialist`               | `react-best-practices`, `clean-code` | `/refactor`     |
| 3 — Orphan Modules  | `@debugger` + `@frontend-specialist` | `systematic-debugging`, `clean-code` | `/refactor`     |
| 4 — Validação Final | `@orchestrator`                      | `plan-writing`, `clean-code`         | `/health-check` |

---

> 💡 **Dica para o usuário:** Execute este prompt fase a fase. Cada fase é independente e pode ser executada em sessões separadas. Se o ArchPulse reportar apenas um tipo de problema, pule diretamente para a fase correspondente.
