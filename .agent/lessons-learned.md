# Lessons Learned

## Protocolo

- Quando um erro e encontrado e corrigido, documenta-lo aqui.
- Quando o mesmo padrao se repetir 3+ vezes, promover para regra
  permanente em .agent/rules/nexusarqui.md.
- Ler este arquivo no inicio de toda sessao de agente.

## Formato por entrada

### [DATA] - [CATEGORIA] - [TITULO CURTO]

**Erro encontrado:** [Descricao especifica]
**Arquivo(s) afetado(s):** [Caminhos]
**Causa raiz:** [Por que aconteceu]
**Correcao aplicada:** [O que foi feito]
**Regra negativa derivada:** [DO NOT para evitar recorrencia]

---

### [2026-02-16] - [TYPECHECK] - Incompatibilidade de RefObject em props de subcomponente

**Erro encontrado:** `npm run typecheck` falhou com `TS2322` ao passar `dropdownRef` para componente de formulario (`RefObject<HTMLDivElement | null>` nao atribuivel a `LegacyRef<HTMLDivElement>`).
**Arquivo(s) afetado(s):** `src/components/clientes/client-form/types.ts`, `src/components/clientes/client-form/ClientFormInfoAddressStatus.tsx`.
**Causa raiz:** Assinatura de props usou `React.RefObject<HTMLDivElement | null>` em vez de `React.RefObject<HTMLDivElement>`, gerando mismatch com a tipagem esperada no atributo `ref`.
**Correcao aplicada:** Padronizacao dos props para `React.RefObject<HTMLDivElement>` e rerun de `npm run typecheck` + `npm run verify` ate `[VERIFY][LOOP][PASS]`.
**Regra negativa derivada:** Ao propagar refs para elementos JSX, manter o mesmo contrato de `RefObject<T>` do elemento-alvo e evitar incluir `null` no parametro generico da prop.

### [2026-02-16] - [TYPECHECK] - Import type usado como valor em JSX fragmentado

**Erro encontrado:** `TS1361` em `GanttTimeline`: `React` foi importado com `import type` e depois usado como valor em `<React.Fragment>`.
**Arquivo(s) afetado(s):** `src/components/projetos/tabs/project-gantt/GanttTimeline.tsx`.
**Causa raiz:** Refatoracao para subcomponentes preservou `React.Fragment`, mas o import foi alterado para tipo-only.
**Correcao aplicada:** Troca para `import React from 'react'` e rerun de `npm run typecheck` + `npm run verify` ate `[VERIFY][LOOP][PASS]`.
**Regra negativa derivada:** Se o arquivo usa `React.*` em runtime (ex.: `React.Fragment`), nao usar `import type React`; preferir import de valor ou fragmento curto `<>...</>`.

### [2026-02-16] - [TYPECHECK] - Assumir formato incorreto de retorno em helper de status

**Erro encontrado:** `TS2551/TS2339` ao iterar retorno de `getStatusSelectionOptions`, tratando itens como objetos (`value/label/disabled`) quando o helper retorna `ContractAddendumStatus[]`.
**Arquivo(s) afetado(s):** `src/components/projetos/tabs/project-finance/ProjectFinanceAddendumsSection.tsx`.
**Causa raiz:** Durante a extração para subcomponente, o select de status foi copiado com contrato de dados divergente do utilitário real.
**Correcao aplicada:** Ajuste para mapear status simples (`<option key={status} value={status}>`) e fallback de status para `Pendente`.
**Regra negativa derivada:** Antes de extrair UI baseada em utilitários, validar assinatura/retorno real do helper no arquivo de origem para não introduzir contratos implícitos incorretos.

### [2026-02-16] - [TEST:COVERAGE] - Timeout intermitente em teste de modal

**Erro encontrado:** `npm run verify` falhou em `test:coverage` com timeout (`5000ms`) em `DeleteConfirmationModal.test.tsx`.
**Arquivo(s) afetado(s):** `src/components/ui/DeleteConfirmationModal.test.tsx`.
**Causa raiz:** Teste de UI suscetivel a variacao de performance do ambiente de execucao, sem margem de timeout dedicada.
**Correcao aplicada:** Simplificacao para `fireEvent` + cleanup deterministico do `modal-root` e timeout explicito do caso (`15000ms`); rerun de `npm run verify` ate `[VERIFY][LOOP][PASS]`.
**Regra negativa derivada:** Para testes unitarios de modal via portal em pipeline compartilhado, definir cleanup explicito e timeout local quando houver historico de flake por latencia.

### [2026-02-28] - [ARCHITECTURE] - Estado global mutável em singleton quebra isolamento read/write

**Erro encontrado:** `loadData()` retornava referência viva ao singleton `appData` e `updateData()` fazia mutação in-place (`memoryData[key] = data`). Chamadas "de leitura" observavam efeitos colaterais sem transação explícita. `replaceData()` aceitava referência externa sem clone.
**Arquivo(s) afetado(s):** `src/services/infrastructure/loadData.ts`.
**Causa raiz:** Otimização prematura — evitar custo de clone em leitura — sacrificou isolamento semântico entre operações de leitura e escrita no singleton.
**Correção aplicada:** (1) `loadData()` retorna `cloneSnapshot(appData)` (clone-on-read); (2) `updateData()` cria novo snapshot via spread `{ ...appData, [key]: data }` (immutable-update); (3) `replaceData()` clona entrada via `cloneSnapshot(snapshot)` (clone-on-write). 8/8 gates verdes.
**Regra negativa derivada:** Nunca expor referência viva a estado singleton mutável. Toda leitura deve retornar clone defensivo; toda escrita deve criar novo objeto em vez de mutar in-place.

### [2026-02-16] - [TYPECHECK] - Type assertion direta em fixture parcial de dominio

**Erro encontrado:** `npm run typecheck` falhou com `TS2352` ao converter objeto parcial diretamente para `Project` em `agendaService.test.ts`.
**Arquivo(s) afetado(s):** `src/services/agendaService.test.ts`.
**Causa raiz:** Novo cenário de teste usou fixture reduzida com cast direto `as Project`/`as Commission`, sem compatibilidade estrutural minima.
**Correcao aplicada:** Ajuste de assertions para `as unknown as Project` e `as unknown as Commission`, seguido de rerun de `npm run typecheck` + `npm run verify` ate `[VERIFY][LOOP][PASS]`.
**Regra negativa derivada:** Em testes com fixtures parciais de entidades complexas, nao usar cast direto para tipo de dominio; usar `unknown` intermediario ou builder tipado completo.

### [2026-02-16] - [SELF-REVIEW] - Ratchet de linhas pendente bloqueando `verify:ci`

**Erro encontrado:** `npm run verify:ci` falhou no `self-review:auto` com baseline de linhas desatualizado (`Line-baseline ratchet is stale`).
**Arquivo(s) afetado(s):** `scripts/file-line-baseline.json`.
**Causa raiz:** Decomposições concluídas reduziram diversos hotspots, mas o baseline versionado ainda não tinha sido apertado.
**Correcao aplicada:** Execução de `npm run check:lines:ratchet` para atualizar 18 entradas e rerun de `npm run verify:ci` até verde.
**Regra negativa derivada:** Ao concluir lotes de decomposição que reduzem linhas em arquivos monitorados, executar `check:lines:ratchet` antes do fechamento em `verify:ci`.

---

## Archived (SUPERSEDED — enforced by gates)

<!-- markdownlint-disable MD033 -->
<details>
<summary>3 entradas superseded (2026-02-16)</summary>

### [2026-02-16] - [CHECK:LINES] - Extracao excedendo limite de components

Enforced by `npm run check:lines` gate. Regra: não extrair blocos grandes para `src/components/*` sem checar limite de linhas.

### [2026-02-16] - [CHECK:LINES] - Comentario de excecao elevando baseline em arquivo legacy

Enforced by `npm run check:lines` gate. Regra: em hotspots monitorados, registrar excecoes em texto compacto.

### [2026-02-16] - [CHECK:LINES] - Regressão de +1 linha após migração de imports

Enforced by `npm run check:lines` gate. Regra: em arquivos legacy monitorados, conferir impacto de line-count após troca de imports.

</details>
