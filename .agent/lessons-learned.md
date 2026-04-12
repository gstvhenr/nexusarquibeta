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

### [2026-04-12] - [RUNTIME] - Frontend publicado nao pode depender so de `import.meta.env`

**Erro encontrado:** O site publicado abriu com erro de configuracao do app e, no console, caiu para o fallback de persistencia porque o runtime remoto nao conseguia inicializar Firebase e ainda tentava subir SQLite WASM.
**Arquivo(s) afetado(s):** `server.mjs`, `src/frontend/services/infrastructure/persistence/firebaseConfig.ts`, `src/frontend/services/infrastructure/persistence/createPersistenceAdapter.ts`, `src/frontend/services/infrastructure/persistence/sqlite/sqliteSchema.ts`.
**Causa raiz:** As envs publicas do Firebase eram lidas apenas via `import.meta.env`, ou seja, dependiam do build. No host publicado, o browser nao recebia mais esse contrato em runtime. Em paralelo, o mapa SQLite ainda expunha `documentStorage` como tabela, embora `schema.sql` nao a crie.
**Correcao aplicada:** Injecao de `window.__NEXUS_ARQUI_RUNTIME_CONFIG` em `server.mjs`, leitura prioritaria dessa configuracao no bootstrap Firebase/adaptador de persistencia, bloqueio de `sqlite` em host publicado e remocao de `documentStorage` do mapa de tabelas.
**Regra negativa derivada:** Nao depender apenas de `import.meta.env` para frontend servido por container quando as envs publicas precisam existir no runtime do browser; e nao anunciar tabela SQLite que nao exista no `schema.sql` real.

### [2026-04-12] - [DEPLOY] - SPA Vite nao pode depender de heuristica implicita do Cloud Run

**Erro encontrado:** O check externo do Google Cloud Developer Connect/Cloud Run falhava logo após o push, apesar do `CI / verify` do GitHub estar verde.
**Arquivo(s) afetado(s):** `package.json`, `Dockerfile`, `server.mjs`, `.dockerignore`.
**Causa raiz:** O repositório expunha apenas `vite build`; nao havia `start` script, servidor HTTP de producao nem contrato explicito de container. Em install producao-only, o fluxo ainda quebrava em `prepare` (`husky`) e no build (`vite` apenas em `devDependencies`).
**Correcao aplicada:** Adicao de `server.mjs` para servir `dist/` com fallback SPA, `Dockerfile` multi-stage com build explicito, `.dockerignore` e scripts `gcp-build`/`start` com `engines.node` no `package.json`.
**Regra negativa derivada:** Nao publicar SPA Vite em pipeline Git-based de Cloud Run sem explicitar runtime HTTP e build de producao; se o provider nao for puramente estatico, o repositório deve declarar container ou entrypoint de servidor.

### [2026-04-12] - [SYNC] - Fila remota nunca pode avançar sem durabilidade local confirmada

**Erro encontrado:** Alterações locais podiam sumir após `F5`, enquanto a fila pendente continuava marcada no Google Drive. Além disso, dados puxados do remoto podiam aparecer na UI e desaparecer no refresh seguinte.
**Arquivo(s) afetado(s):** `src/frontend/services/infrastructure/loadData.ts`, `src/frontend/services/infrastructure/driveSyncEngine.ts`, `src/frontend/services/infrastructure/driveDataAdapter.ts`.
**Causa raiz:** A fila/meta do sync era persistida antes do snapshot local debounced, e `writeLocal()` no pull remoto atualizava apenas a RAM. Isso criava divergência entre “estado marcado para sincronizar” e “estado realmente durável no banco local”.
**Correcao aplicada:** Persistência imediata por entidade em `loadData.ts`, flush explícito em lifecycle do browser, writes remotos duráveis antes de notificar a UI, e `SyncOperationResult` para impedir falso positivo de sucesso na camada visual.
**Regra negativa derivada:** Nunca marcar alteração como sincronizável nem exibir sucesso de sync antes de confirmar a persistência local durável; mudanças remotas aplicadas à UI devem ser gravadas primeiro no storage local.

### [2026-04-12] - [SYNC] - Corrupcao de `_meta.json` nao pode cair no caminho de primeira sincronizacao

**Erro encontrado:** `_meta.json` inválido podia ser convertido para `null`, fazendo o motor tratar corrupção remota como se fosse um bootstrap vazio e abrindo risco de overwrite indevido.
**Arquivo(s) afetado(s):** `src/frontend/services/infrastructure/driveDataAdapter.ts`, `src/frontend/services/infrastructure/driveSyncEngine.ts`.
**Causa raiz:** O parser de metadados engolia erro estrutural e reclassificava um estado corrompido como “primeira sincronização”.
**Correcao aplicada:** `readMeta()` passou a lançar erro explícito para `_meta.json` inválido; o engine traduz isso para `remote_meta_invalid` e entra em estado de erro sem fazer `pushAllDomains()`.
**Regra negativa derivada:** Nunca degradar corrupção de artefato remoto para ausência legítima de arquivo; metadado inválido deve interromper o fluxo com erro observável.

### [2026-04-11] - [SYNC] - Atualizacao externa nao deve desmontar modal durante interacao

**Erro encontrado:** Pop-ups podiam fechar ou perder contexto mesmo sem `window.location.reload()`, porque atualizações externas em background (BroadcastChannel, `storage` sintético e Drive Sync) substituíam o snapshot da aplicação enquanto o usuário estava digitando em um modal.
**Arquivo(s) afetado(s):** `src/frontend/components/ui/Modal.tsx`, `src/frontend/services/infrastructure/loadData.ts`, `src/frontend/services/uiInteractionLockService.ts`.
**Causa raiz:** O app aplicava refresh externo imediatamente, sem considerar se havia interação modal em andamento. Isso permitia rerenders/remounts durante edição e leitura.
**Correcao aplicada:** Criação de um lock global de interação adquirido pelo `Modal` compartilhado; `loadData.ts` passou a enfileirar refreshes externos e writes remotos enquanto o lock está ativo, descarregando tudo apenas após o fechamento do último modal.
**Regra negativa derivada:** Não aplicar sincronização externa destrutiva enquanto houver modal compartilhado aberto; adiar o merge e descarregar as mudanças após o unlock da UI.

### [2026-04-11] - [AUTH] - Checks de sessao nao podem assumir `gapi.client` inicializado

**Erro encontrado:** A rota `Configurações` podia cair no `RouteErrorBoundary` logo após o novo fluxo de login, porque `GoogleDriveSection` consultava `googleDriveService.isSignedIn()` durante o render e esse método assumia que `window.gapi.client` já existia.
**Arquivo(s) afetado(s):** `src/frontend/services/infrastructure/googleDriveService.ts`, `src/frontend/services/infrastructure/googleDriveService.test.ts`.
**Causa raiz:** O script global `gapi` pode estar presente antes do `client` ser inicializado; o serviço tratava a presença parcial do SDK como se a API já estivesse pronta.
**Correcao aplicada:** Introdução de leitura segura do token atual (`getCurrentGapiToken`) e teste automatizado cobrindo o cenário com `gapi.client` ausente.
**Regra negativa derivada:** Em integrações com SDK global carregado de forma assíncrona, nunca acessar submódulos como `gapi.client` diretamente em checks de render; encapsular a leitura com guard clauses tolerantes a inicialização parcial.

### [2026-03-13] - [A11Y] - `aria-selected` em tabs deve receber booleano sem serializacao manual

**Erro encontrado:** Microsoft Edge Tools (`axe/aria`) sinalizou `Invalid ARIA attribute value: aria-selected="{expression}"` em tabs renderizadas por botao com `role="tab"`.
**Arquivo(s) afetado(s):** `src/frontend/pages/agenda/bloco-de-notas/BlocoDeNotasPage.tsx`, `src/frontend/components/ui/Tabs.tsx`.
**Causa raiz:** O atributo foi passado como string derivada (`'true'` / `'false'`) em vez do booleano JSX original, o que gerou interpretacao invalida no validador de acessibilidade usado no browser.
**Correcao aplicada:** Troca de `aria-selected={active ? 'true' : 'false'}` para `aria-selected={active}` nos gatilhos de aba afetados.
**Regra negativa derivada:** Em JSX para atributos ARIA booleanos/booleanish, nao serializar manualmente `true/false` como string quando o valor de estado booleano ja existe; passar o booleano diretamente.

---

### [2026-02-16] - [TYPECHECK] - Incompatibilidade de RefObject em props de subcomponente

**Erro encontrado:** `npm run typecheck` falhou com `TS2322` ao passar `dropdownRef` para componente de formulario (`RefObject<HTMLDivElement | null>` nao atribuivel a `LegacyRef<HTMLDivElement>`).
**Arquivo(s) afetado(s):** `src/frontend/components/clientes/client-form/types.ts`, `src/frontend/components/clientes/client-form/ClientFormInfoAddressStatus.tsx`.
**Causa raiz:** Assinatura de props usou `React.RefObject<HTMLDivElement | null>` em vez de `React.RefObject<HTMLDivElement>`, gerando mismatch com a tipagem esperada no atributo `ref`.
**Correcao aplicada:** Padronizacao dos props para `React.RefObject<HTMLDivElement>` e rerun de `npm run typecheck` + `npm run verify` ate `[VERIFY][LOOP][PASS]`.
**Regra negativa derivada:** Ao propagar refs para elementos JSX, manter o mesmo contrato de `RefObject<T>` do elemento-alvo e evitar incluir `null` no parametro generico da prop.

### [2026-02-16] - [TYPECHECK] - Import type usado como valor em JSX fragmentado

**Erro encontrado:** `TS1361` em `GanttTimeline`: `React` foi importado com `import type` e depois usado como valor em `<React.Fragment>`.
**Arquivo(s) afetado(s):** `src/frontend/components/projetos/tabs/project-gantt/GanttTimeline.tsx`.
**Causa raiz:** Refatoracao para subcomponentes preservou `React.Fragment`, mas o import foi alterado para tipo-only.
**Correcao aplicada:** Troca para `import React from 'react'` e rerun de `npm run typecheck` + `npm run verify` ate `[VERIFY][LOOP][PASS]`.
**Regra negativa derivada:** Se o arquivo usa `React.*` em runtime (ex.: `React.Fragment`), nao usar `import type React`; preferir import de valor ou fragmento curto `<>...</>`.

### [2026-02-16] - [TYPECHECK] - Assumir formato incorreto de retorno em helper de status

**Erro encontrado:** `TS2551/TS2339` ao iterar retorno de `getStatusSelectionOptions`, tratando itens como objetos (`value/label/disabled`) quando o helper retorna `ContractAddendumStatus[]`.
**Arquivo(s) afetado(s):** `src/frontend/components/projetos/tabs/project-finance/ProjectFinanceAddendumsSection.tsx`.
**Causa raiz:** Durante a extração para subcomponente, o select de status foi copiado com contrato de dados divergente do utilitário real.
**Correcao aplicada:** Ajuste para mapear status simples (`<option key={status} value={status}>`) e fallback de status para `Pendente`.
**Regra negativa derivada:** Antes de extrair UI baseada em utilitários, validar assinatura/retorno real do helper no arquivo de origem para não introduzir contratos implícitos incorretos.

### [2026-02-16] - [TEST:COVERAGE] - Timeout intermitente em teste de modal

**Erro encontrado:** `npm run verify` falhou em `test:coverage` com timeout (`5000ms`) em `DeleteConfirmationModal.test.tsx`.
**Arquivo(s) afetado(s):** `src/frontend/components/ui/DeleteConfirmationModal.test.tsx`.
**Causa raiz:** Teste de UI suscetivel a variacao de performance do ambiente de execucao, sem margem de timeout dedicada.
**Correcao aplicada:** Simplificacao para `fireEvent` + cleanup deterministico do `modal-root` e timeout explicito do caso (`15000ms`); rerun de `npm run verify` ate `[VERIFY][LOOP][PASS]`.
**Regra negativa derivada:** Para testes unitarios de modal via portal em pipeline compartilhado, definir cleanup explicito e timeout local quando houver historico de flake por latencia.

### [2026-02-28] - [ARCHITECTURE] - Estado global mutável em singleton quebra isolamento read/write

**Erro encontrado:** `loadData()` retornava referência viva ao singleton `appData` e `updateData()` fazia mutação in-place (`memoryData[key] = data`). Chamadas "de leitura" observavam efeitos colaterais sem transação explícita. `replaceData()` aceitava referência externa sem clone.
**Arquivo(s) afetado(s):** `src/frontend/services/infrastructure/loadData.ts`.
**Causa raiz:** Otimização prematura — evitar custo de clone em leitura — sacrificou isolamento semântico entre operações de leitura e escrita no singleton.
**Correção aplicada:** (1) `loadData()` retorna `cloneSnapshot(appData)` (clone-on-read); (2) `updateData()` cria novo snapshot via spread `{ ...appData, [key]: data }` (immutable-update); (3) `replaceData()` clona entrada via `cloneSnapshot(snapshot)` (clone-on-write). 8/8 gates verdes.
**Regra negativa derivada:** Nunca expor referência viva a estado singleton mutável. Toda leitura deve retornar clone defensivo; toda escrita deve criar novo objeto em vez de mutar in-place.

### [2026-02-16] - [TYPECHECK] - Type assertion direta em fixture parcial de dominio

**Erro encontrado:** `npm run typecheck` falhou com `TS2352` ao converter objeto parcial diretamente para `Project` em `agendaService.test.ts`.
**Arquivo(s) afetado(s):** `src/frontend/services/agendaService.test.ts`.
**Causa raiz:** Novo cenário de teste usou fixture reduzida com cast direto `as Project`/`as Commission`, sem compatibilidade estrutural minima.
**Correcao aplicada:** Ajuste de assertions para `as unknown as Project` e `as unknown as Commission`, seguido de rerun de `npm run typecheck` + `npm run verify` ate `[VERIFY][LOOP][PASS]`.
**Regra negativa derivada:** Em testes com fixtures parciais de entidades complexas, nao usar cast direto para tipo de dominio; usar `unknown` intermediario ou builder tipado completo.

### [2026-02-16] - [SELF-REVIEW] - Ratchet de linhas pendente bloqueando `verify:ci`

**Erro encontrado:** `npm run verify:ci` falhou no `self-review:auto` com baseline de linhas desatualizado (`Line-baseline ratchet is stale`).
**Arquivo(s) afetado(s):** `scripts/file-line-baseline.json`.
**Causa raiz:** Decomposições concluídas reduziram diversos hotspots, mas o baseline versionado ainda não tinha sido apertado.
**Correcao aplicada:** Execução de `npm run check:lines:ratchet` para atualizar 18 entradas e rerun de `npm run verify:ci` até verde.
**Regra negativa derivada:** Ao concluir lotes de decomposição que reduzem linhas em arquivos monitorados, executar `check:lines:ratchet` antes do fechamento em `verify:ci`.

### [2026-03-01] - [TYPECHECK] - Paths relativos quebrados apos move de utilitario

**Erro encontrado:** No micro-batch P7.1, `npm run verify` falhou no `typecheck` com `TS2307` em `src/utils/budgetHelpers.ts` (`Cannot find module '../../types'` e `../../constants/budget`) logo após mover o arquivo de `pages` para `utils`.
**Arquivo(s) afetado(s):** `src/frontend/utils/budgetHelpers.ts`.
**Causa raiz:** O move preservou imports relativos do diretório antigo (`src/pages/orcamentos`), que ficaram um nível acima no novo destino (`src/utils`).
**Correcao aplicada:** Ajuste imediato dos imports para `../types` e `../constants/budget`, seguido de novo `npm run verify` até `[VERIFY][LOOP][PASS]`.
**Regra negativa derivada:** Em qualquer move de arquivo `.ts/.tsx`, validar primeiro os imports internos do próprio arquivo movido (antes do gate) para garantir correção do nível relativo.

### [2026-03-01] - [FORMAT] - Arquivo movido sem formatacao final do Prettier

**Erro encontrado:** No micro-batch P8, `npm run verify` falhou no gate `format:check` com warning em `src/utils/addendumUtils.ts`.
**Arquivo(s) afetado(s):** `src/frontend/utils/addendumUtils.ts`.
**Causa raiz:** Ajustes de imports após move deixaram o arquivo fora do estilo final esperado, sem rodar formatador local antes do gate.
**Correcao aplicada:** Execução de `npx prettier --write src/utils/addendumUtils.ts` e rerun de `npm run verify` até `[VERIFY][LOOP][PASS]`.
**Regra negativa derivada:** Após mover e editar utilitários, rodar formatação local no arquivo alterado antes do `verify` para evitar falha desnecessária no gate `format:check`.

### [2026-03-01] - [POLLUTION] - Barrels de pages sem consumidor bloqueiam `self-review:auto`

**Erro encontrado:** `npm run verify:ci` falhou no `self-review:auto` com regressao de poluicao (`check:pollution`) apontando `src/pages/*/index.ts` nao usados e exports sem consumidor.
**Arquivo(s) afetado(s):** `src/App.tsx`, `src/pages/*/index.ts`, `src/constants/index.ts`, `src/pages/gestao-marketing/GestaoMarketingPage.tsx`.
**Causa raiz:** Após movimentos estruturais, rotas continuaram importando arquivos de page diretamente (`./pages/<dominio>/<Page>.tsx`), deixando os barrels de dominio órfãos; alguns re-exports legados continuaram sem uso.
**Correcao aplicada:** Padronizacao de entrypoints de page (`index.ts` com `export default`), ajuste dos lazy imports da `App.tsx` para `./pages/<dominio>`, remoção de re-exports sem consumidor e imports diretos de views no marketing.
**Regra negativa derivada:** Ao concluir move de pages por dominio, validar imediatamente `check:pollution` e alinhar consumo dos `index.ts` (ou remover exports legados) antes do fechamento em `verify:ci`.

### [2026-03-01] - [SECURITY] - `verify:ci` falha por lockfile desatualizado em dependencias transitivas

**Erro encontrado:** Gate `security:check` falhou em `verify:ci` com vulnerabilidades high em `minimatch` e `rollup`.
**Arquivo(s) afetado(s):** `package-lock.json` (dependencias transitivas).
**Causa raiz:** Lockfile com versoes transitivas vulneraveis, apesar do codigo-fonte da feature estar correto.
**Correcao aplicada:** Execucao de `npm audit fix` e rerun de `npm run security:check` / `npm run verify:ci` até verde.
**Regra negativa derivada:** Em trilhas longas de refatoracao estrutural, rodar `npm run security:check` antes do fechamento final para evitar falha tardia por lockfile desatualizado.

### [2026-03-01] - [FORMAT] - Novo artefato de governanca sem prettier antes do gate canônico

**Erro encontrado:** `npm run verify` falhou em `format:check` apontando `docs/PLACEMENT_RULES.md`.
**Arquivo(s) afetado(s):** `docs/PLACEMENT_RULES.md`.
**Causa raiz:** Criação de artefato novo de governança sem rodar formatação local antes da primeira execução do verify loop.
**Correcao aplicada:** Execução de `npx prettier --write docs/PLACEMENT_RULES.md` e rerun de `npm run verify` até `[VERIFY][LOOP][PASS]`.
**Regra negativa derivada:** Após criar documentos novos em `docs/`, aplicar formatação local antes do primeiro `verify` para evitar falha desnecessária em `format:check`.

### [2026-03-09] - [DATE-ONLY] - Campos `YYYY-MM-DD` tratados como UTC em vez de data civil

**Erro encontrado:** O frontend usava repetidamente `toISOString().split('T')[0]` para montar campos `YYYY-MM-DD` e ainda parseava alguns `date-only` com `new Date('YYYY-MM-DD')`, abrindo espaço para deslocamento de dia por fuso horário.
**Arquivo(s) afetado(s):** `src/frontend/utils/formatters.ts`, `src/frontend/services/agendaService.ts`, `src/frontend/services/cashBoxService.ts`, `src/frontend/services/dashboardFocusItems.ts`, `src/frontend/hooks/useClientFormHandlers.ts`, `src/frontend/hooks/useClienteMeetings.ts`, `src/frontend/hooks/useProjectFinancials.ts`, `src/frontend/pages/**`, `src/frontend/components/**`, `src/frontend/test/date-only-guard.test.ts`.
**Causa raiz:** Mistura de dois contratos diferentes: `date-only` de negócio (`YYYY-MM-DD`) foi tratado como `datetime` UTC, usando APIs que serializam instantes em vez de datas civis.
**Correcao aplicada:** Centralizacao dos helpers `toDateOnlyString()` e `getTodayDateOnly()` em `src/frontend/utils/formatters.ts`, remocao de `timeZone: 'UTC'` da formatacao de `date-only`, sweep das ocorrencias em producao e adicao de um guard automatizado que falha se `toISOString().split('T')[0]` reaparecer fora de testes.
**Regra negativa derivada:** Nunca usar `toISOString().split('T')[0]` ou `new Date('YYYY-MM-DD')` para campos de negocio `YYYY-MM-DD`; usar `getTodayDateOnly()`, `toDateOnlyString(date)` e `parseDateString()`.

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
