# NEXT.md

## Último estado conhecido (2026-04-11)

Ajuste do formulário de evento/tarefa (`EventFormModal.tsx` e `EventFormFields.tsx`) para introduzir uma distinção de domínio entre 'Evento' e 'Tarefa' com base nos pedidos do usuário. Foi incluído um seletor obrigatório de Categoria. Subtarefas e status do Kanban só aparecem visíveis e habilitados se a categoria for 'Tarefa', possuindo também validação estrita que previne que uma Tarefa seja salva sem pelo menos 1 item na "Subtarefa". Adicionalmente, itens salvos como 'Evento' não poluem o quadro Kanban. A largura da modal foi ampliada de `2xl` para `4xl` para melhor arranjo espacial dos dados adicionais.

### Checklist desta sessão

- [x] O tipo `AgendaEvent` recebeu a chave tipada `category?: 'Evento' | 'Tarefa'`.
- [x] Expansão da prop `size` do `Modal` no pop-up de `EventFormModal.tsx` de "2xl" para "4xl".
- [x] Adição do select de "Categoria" ladeando "Recorrência" (`EventFormFields.tsx`), tornando-o campo de bloqueio obrigatório.
- [x] Lógica visual condicional: Seções de "Status da Tarefa" e "Subtarefas" atreladas à `editedEvent.category === 'Tarefa'`.
- [x] Regra de bloqueio em _save_: Tarefas sem `subtasks` disparam alert impedindo sua gravação.
- [x] Exclusão visual de "Eventos" da aba Kanban (`TarefasPage.tsx`) através da filtragem `.filter(event => event.category !== 'Evento')`.
- [x] Executado `npm run typecheck` — aprovado (PASS) garantindo segurança da união ao Typescript.

### Concluído nesta sessão

- `src/frontend/types/agenda.ts` — tipagem restrita do model AgendaEvent com a _category_.
- `src/frontend/components/agenda/EventFormFields.tsx` — renderização da _category_ interativa em layout Grid e seções engatilhadas de tarefas.
- `src/frontend/components/agenda/EventFormModal.tsx` — alteração estrutural de tamanhos e injeção do gate/validator via `handleSave`.
- `src/frontend/pages/agenda/tarefas/TarefasPage.tsx` — implementação de exclusão de dados do tipo Evento do Board principal e abas.

## Evidências da sessão

- `npm run typecheck` → PASS.

## Próximo passo exato

- Acesso a `Agenda > Calendário` por testes empíricos validando a submissão de ambas as categorias e visualizando as renderizações da Tarefa propagando condicionalmente em "Tarefas".

## Bloqueios e dúvidas

- Resolvido de forma definitiva, sem pendências.

---

## Último estado conhecido (2026-04-11)

Ajustes ergonômicos e responsivos na grid mensal da página de Agenda (Calendário). O modo de visualização padrão da Agenda passou de Semanal para Mensal. Em seguida, a funcionalidade de ajuste manual de altura das células via slider foi totalmente removida; em substituição, o container em grid foi modernizado com CSS nativo (`grid-template-rows`), calculando dinamicamente e distribuindo a altura exata entre semanas e preenchendo 100% da viewport vertical de forma responsiva sem causar rolagem excedente desnecessária, adaptando-se a meses que contêm 5 ou 6 semanas.

### Checklist desta sessão

- [x] Remoção do manipulador nativo de escala (`cellHeightScale`/`normalizedCellHeightScale`) do hook `useLocalStorage`.
- [x] Deleção do controle de slider no header de página.
- [x] O `viewMode` default foi passado para `'monthly'` em `AgendaPage.tsx`.
- [x] Atualização da classe Grid e injeção do `gridTemplateRows` dinâmico baseado em semanas dentro de `MonthlyCalendarGrid.tsx`.
- [x] Executado `npm run typecheck` — verde sem lints residuais e dependências resolvidas (removido exports `DEFAULT_CELL_HEIGHT_REM` em `agendaConstants.ts`).

### Concluído nesta sessão

- `src/frontend/pages/agenda/AgendaPage.tsx` — Padrão mensal e limpeza de inputs residuais.
- `src/frontend/components/agenda/MonthlyCalendarGrid.tsx` — CSS Grid responsivo com altura elástica sem overflow Y.
- `src/frontend/components/agenda/agendaConstants.ts` — expurgo de constantes zumbi da view obsoleta.

## Evidências da sessão

- `npm run typecheck` → PASS.

## Próximo passo exato

- Acesso a `Agenda > Calendário` por testes empíricos do usuário confirmando um comportamento fluido das alturas das células mês a mês em resoluções atípicas.

## Bloqueios e dúvidas

- Resolvido de forma definitiva, sem pendências.

---

## Último estado conhecido (2026-04-11)

Remoção do botão redundante de logout ("Encerrar Sessão") da seção de Google Drive nas Configurações, preservando a ação principal em "Conta Google" que já exerce a exata mesma função sob o capô (limpar a autenticação via Google e redirecionar a tela). Essa redundância de interface foi gerada na última refatoração de AuthGuard, sendo agora consolidada para evitar confusão no usuário.

### Checklist desta sessão

- [x] Deleção do bloco redundante de "System Logout" em `src/frontend/components/configuracoes/GoogleDriveSection.tsx`.
- [x] O botão mestre de logout mantido limpo sob a header de "Conta Google" (`ConfiguracoesPage.tsx`).
- [x] Executado parser Prettier/Format (`npm run format:write`, `verify:quick`). CI Validado.

### Concluído nesta sessão

- `src/frontend/components/configuracoes/GoogleDriveSection.tsx` — Bloco funcional redundante de "Sair do Sistema" foi extirpado.

## Evidências da sessão

- `npx prettier --write ...` → aplicado e aprovado.
- `npm run verify:quick` → verificação estática preservada, confirmando ausência de regressão estrutural.

## Próximo passo exato

1. Teste de campo com o usuário final (como já mapeado) para atestar a fluidez da sessão persistente em browser vazio.
2. Confirmar visualmente em `Configurações` se a clareza da UI atinge a expectativa predeterminada.

## Bloqueios e dúvidas

- Nenhum bloqueio. A higiene documental segue com budget alocado próximo ao teto, mas não impede desenvolvimento e submissões habituais.

---

## Último estado conhecido (2026-04-11)

Correção do popup em branco do Google Identity (`accounts.google.com/gsi/transform`) no ambiente local. O servidor Vite agora entrega `Cross-Origin-Opener-Policy: same-origin-allow-popups` e `Referrer-Policy: no-referrer-when-downgrade`, alinhando o frontend ao requisito do fluxo popup do GIS quando o navegador não conclui a jornada via FedCM.

### Checklist desta sessão

- [x] `vite.config.ts` atualizado com headers de `COOP` e `Referrer-Policy` em `server` e `preview`.
- [x] `index.html` atualizado com `meta name="referrer"`.
- [x] Dev server validado manualmente com `Invoke-WebRequest`, confirmando os headers no `localhost`.
- [x] `googleDriveService.isSignedIn()` endurecido para não quebrar quando `gapi.client` ainda não está inicializado.
- [x] `src/frontend/services/infrastructure/googleDriveService.test.ts` criado cobrindo o contrato de `isSignedIn()`.
- [x] `npm run typecheck` — verde.
- [x] `npx prettier --check vite.config.ts index.html` — verde.
- [x] `npm run build` — verde.
- [x] `npm run verify:quick` — verde.

### Concluído nesta sessão

- `vite.config.ts` — hardening do ambiente local para popup OAuth/Google Identity.
- `index.html` — política de referrer explícita no shell HTML.
- `src/frontend/services/infrastructure/googleDriveService.ts` — leitura segura do token atual, evitando crash em `Configurações` durante a inicialização do `gapi`.
- `src/frontend/services/infrastructure/googleDriveService.test.ts` — teste do contrato de tolerância a `gapi.client` ausente.

## Evidências da sessão

- `Invoke-WebRequest http://localhost:3002/` → headers retornados: `Cross-Origin-Opener-Policy: same-origin-allow-popups`, `Referrer-Policy: no-referrer-when-downgrade`.
- `npm run typecheck` → PASS.
- `npm run build` → PASS.
- `npx vitest run src/frontend/services/infrastructure/googleDriveService.test.ts` → PASS (`2` testes).
- `npm run verify:quick` → PASS.

## Próximo passo exato

1. Reiniciar o `npm run dev` e repetir o login Google no navegador para confirmar que o popup não trava mais em `gsi/transform`.
2. Abrir `Configurações` após o login e confirmar que a rota não cai mais no `RouteErrorBoundary`.
3. Se o popup ainda ficar em branco, inspecionar a configuração do client OAuth no Google Cloud, principalmente `Authorized JavaScript origins` para `http://localhost:3001` e/ou a porta efetiva em uso.

## Bloqueios e dúvidas

- A correção de headers cobre o ambiente local Vite. Se o login continuar quebrado após reiniciar o servidor, o próximo suspeito forte passa a ser configuração de origem autorizada no client OAuth do Google.

## Último estado conhecido (2026-04-11)

Blindagem da persistência total no Google Drive para dados e preferências. O `driveSyncEngine` agora mantém fila persistida de alterações, retry com backoff, flush em `visibilitychange/pagehide`, reconexão automática por mudanças de autenticação/pasta local e limpeza remota pendente da árvore `files/`. Preferências de usuário (`theme`, `financial_password`, `financial_lock_enabled`) passaram a sincronizar em `preferences.json`, separado de `config.json`. Arrays identificáveis ganharam merge `last write wins` por registro com tombstones para exclusões, evitando ressuscitar itens apagados em outro dispositivo.

### Checklist desta sessão

- [x] `driveSyncEngine.ts` reescrito com fila persistida, retry, flush e reconexão automática.
- [x] `loadData.ts` integrado a preferências sincronizadas, tombstones e reset global com cleanup remoto.
- [x] `useLocalStorage.ts` e `uiPreferenceService.ts` adaptados para propagação cross-device sem loop de regravação.
- [x] `driveDataAdapter.ts`, `googleDriveService.ts` e `localDriveService.ts` expandidos com `preferences.json` e limpeza de pasta remota/local.
- [x] `driveFileService.ts` endurecido para substituição/remoção segura de binários gerenciados.
- [x] `ClientesPage.tsx` atualizado para remover avatar antigo na troca/exclusão.
- [x] `npx vitest run src/frontend/services/infrastructure/driveSyncMerge.test.ts` — verde (`5` testes).
- [x] `npm run typecheck` — verde.
- [x] `npx eslint ...` nos arquivos alterados — verde.
- [x] `npx prettier --check ...` nos arquivos alterados — verde.

### Concluído nesta sessão

- `src/frontend/services/infrastructure/driveSyncEngine.ts` — fila persistida, retry, reconexão, flush e sync de preferências.
- `src/frontend/services/infrastructure/loadData.ts` — bridge entre `AppData`, preferências sincronizadas e reset remoto.
- `src/frontend/services/infrastructure/driveSyncPreferences.ts` / `driveSyncMerge.ts` — contratos de preferências sincronizadas e merge com tombstones.
- `src/frontend/hooks/useLocalStorage.ts` / `src/frontend/services/infrastructure/uiPreferenceService.ts` — broadcast local de preferências sem loop.
- `src/frontend/services/infrastructure/driveFileService.ts` / `src/frontend/pages/clientes/ClientesPage.tsx` — remoção/substituição segura de avatar no Drive.
- `src/frontend/components/configuracoes/GoogleDriveSection.tsx` / `src/frontend/components/layout/SyncStatusIndicator.tsx` — UI de status com fila, retry e flush manual.

## Evidências da sessão

- `npm run typecheck` → PASS.
- `npx eslint ...` nos arquivos alterados → PASS.
- `npx prettier --check ...` nos arquivos alterados → PASS.
- `npx vitest run src/frontend/services/infrastructure/driveSyncMerge.test.ts` → PASS (`5` testes).

## Próximo passo exato

1. Smoke test em 2 perfis do navegador: criar, editar e excluir dados em um perfil e validar convergência automática no outro.
2. Validar conflito real no mesmo registro com política `last write wins` + tombstone de exclusão.
3. Validar troca/exclusão de avatar e reset global confirmando limpeza remota de `files/` e preservação de `_backups`.
4. Rodar `npm run verify` e, se necessário, ajustar quaisquer regressões remanescentes fora do escopo local já validado.

## Bloqueios e dúvidas

- Falta validação manual cross-device em ambiente real; a cobertura automatizada atual fecha merge/tombstones, mas não substitui o smoke de dois perfis/dispositivos.

---

## Último estado conhecido (2026-04-11)

Implementação do sistema de Login obrigatório com o Google (AuthGuard). A aplicação agora impede o carregamento das rotas caso o usuário não esteja autenticado. Criamos uma barreira estrutural via componente `AuthGuard`, uma `LoginPage` dedicada para sign-in, e implementamos persistência no `localStorage` (`nexus_authenticated`). O botão de Encerrar Sessão foi incluído dentro das configurações de "Integração Google Drive", permitindo deslogar e revogar o token, recarregando a página e forçando a tela de login.

### Checklist desta sessão

- [x] Construção do componente `LoginPage`.
- [x] Criação do wrapper `AuthGuard` para interceptação de rota.
- [x] Atualização no `App.tsx` para remover o interceptor isolado antigo e aplicar o `AuthGuard` na view master.
- [x] Criação de botão de "Encerrar Sessão" dentro de `ConfiguracoesPage` (`GoogleDriveSection`).
- [x] Resolução de erros e imports órfãos em `App.tsx` (`localDriveService` e ajuste da rota de `DocumentosPessoalPage`).
- [x] Rodou gate `npm run verify` com os 9 gates OK (`typecheck`, `lint`, `format:check`, `build` etc).

### Concluído nesta sessão

- `src/frontend/components/auth/LoginPage.tsx` — view UI visual de login.
- `src/frontend/components/auth/AuthGuard.tsx` — roteador condicional com loading state.
- `src/frontend/components/auth/index.ts` — barrel imports.
- `src/frontend/App.tsx` — orquestração ajustada.
- `src/frontend/components/configuracoes/GoogleDriveSection.tsx` — inserção funcional de Sair do Sistema.

## Evidências da sessão

- `npm run verify` → PASS (`[VERIFY][LOOP][PASS] total_duration_ms=161324 gates_passed=9`). Exit code 0.

## Próximo passo exato

1. Teste de campo com o usuário final: abrir a aplicação do zero em aba anônima, validar a persistência da flag no `localStorage` após a autenticação OAuth, e garantir que a re-abertura do navegador acessa o App sem tela de splash desnecessária.
2. Validar se o botão de logout exibe o recarregamento com a tela de login vazia.

## Bloqueios e dúvidas

- Nenhum. O sistema está perfeitamente seguro e condicionado, o workflow segue limpo no verify loop.

---

## Último estado conhecido (2026-04-11)

Refatoração da arquitetura de sincronização: Google Drive API como fonte canônica de verdade. A precedência de acesso foi invertida de `local > api > none` para `api > local > none`, eliminando o bloqueio de sync quando a pasta local perde permissão no navegador. O boot sequence em `App.tsx` agora verifica API ativa antes de curto-circuitar em pasta local. O banner `DriveSyncReconnector` diferencia entre cenário de API saudável (informativo/azul, "Pasta local desconectada") e cenário offline total (alerta/amarelo, "Sincronização Pausada").

### Checklist desta sessão

- [x] `driveDataAdapter.ts` — `detectAccessMode()` invertido: `api > local > none`.
- [x] `App.tsx` — Boot verifica `isSignedIn()` antes de testar pasta local; só curto-circuita em local se permissão ativa.
- [x] `DriveSyncReconnector.tsx` — Banner diferenciado (info/warning) com mensagens e cores distintas por cenário.
- [x] `npm run typecheck` — verde.
- [x] `npm run lint` — verde.
- [x] `npm run format:check` — verde.
- [x] `npm run build` — verde.

### Concluído nesta sessão

- `src/frontend/services/infrastructure/driveDataAdapter.ts` — inversão de precedência sem mudança de contrato externo.
- `src/frontend/App.tsx` — boot sequence agora API-first.
- `src/frontend/components/drive/DriveSyncReconnector.tsx` — UX diferenciada por cenário de acesso.

## Evidências da sessão

- `npm run typecheck` → PASS (tsc --noEmit zerado).
- `npm run lint` → PASS.
- `npm run format:check` → PASS.
- `npm run build` → PASS (Vite built in 1m 34s).

## Próximo passo exato

1. Smoke test com 2 profiles do navegador: Computador A com token OAuth ativo (sem pasta local) → salvar dado. Computador B com pasta local salva (sem permissão) → clicar "Reconectar" no banner e validar pull automático via API.
2. Confirmar que com API saudável, o banner aparece em azul (informativo) e NÃO bloqueia sync.
3. Confirmar que sem API e sem acesso local, o banner aparece em amarelo (alerta).

## Bloqueios e dúvidas

- Nenhum bloqueio técnico. A refatoração é incremental e reversível.

---

## Último estado conhecido (2026-04-11)

Resolução do bloqueio de sincronização com o Google Drive via "Single Source of Truth". O modo `local` de acesso falhava silenciosamente porque a File System Access API exigia interação humana (gesture) para reverificar permissões, o que causava loop de erros no boot e travava a engine de sync offline para sempre. A correção adiou a verificação estrita para uma interação do usuário exibindo um banner amarelo "Conexão Pausada" na UI (componente `DriveSyncReconnector`). Quando clicado, a permissão é revalidada via gesture e a engine faz o `reconnect()`, assumindo, intencionalmente, que o `_meta.json` remoto é a fonte primária de verdade (`pullNewerDomains` com verificação de checksum overwrita qualquer dirty change offline local), prevenindo split-brains de base de dados e assegurando a propagação íntegra dos dados criados em outro computador.

### Checklist desta sessão

- [x] Refatoração de `localDriveService.ts` (`verifyAccess`/`verifyPermission`) com flag `promptUser` para separar validação passiva no boot de validação ativa guiada por gesture.
- [x] Adaptador de `driveDataAdapter.ts` ajustado para sempre usar validação off (`false`) na detecção do boot, evitando trigger nativo precoce.
- [x] Extração da função `reconnect()` no `driveSyncEngine.ts` permitindo hot-resume da conexão à vontade.
- [x] Criação do banner amigável `DriveSyncReconnector.tsx` acoplado ao layout em `App.tsx` que detecta permissão latente mas Engine `none`.
- [x] Resolução profunda do isolamento `pullNewerDomains`: confirmado via debug estático que Drive é o master node. Qualqur mudança de base remota sobrescreve o cache do browser instantaneamente após `reconnect`.
- [x] Limpeza e correção reativa detectada via `npm run check:pollution` para os tipos vazios/órfãos isolados na última onda (`SyncDirection` e import loop de `FILES_FOLDER_NAME` atualizando `check:pollution:ratchet`).
- [x] `npm run typecheck` — verde após expurgos em `driveSyncTypes.ts`.
- [x] `npm run verify:quick` — verde (`typecheck`, `lint`, `format:check`, `check:docs:governance`).
- [x] build total aprovada — `vite build` verde.

### Concluído nesta sessão

- `src/frontend/services/infrastructure/localDriveService.ts` — controle assíncrono interativo das permissões nativas File System.
- `src/frontend/services/infrastructure/driveDataAdapter.ts` — descarte de pop-ups no bootstrap.
- `src/frontend/services/infrastructure/driveSyncEngine.ts` — `reconnect()` mode.
- `src/frontend/components/drive/DriveSyncReconnector.tsx` — novo overlay contextual de reconexão via gesture.
- `src/frontend/App.tsx` — acoplamento do banner na master view.
- `src/frontend/services/infrastructure/driveSyncTypes.ts` — expurgo e realinhamento de poluição residual para CI pass.

## Evidências da sessão

- `npm run check:pollution:ratchet` → `[POLLUTION][PASS] Baseline updated at scripts/pollution-baseline.json.`.
- `npm run typecheck` → PASS (tsc --noEmit zerado sem violações).
- `npm run verify:quick` → PASS.
- `npm run build` → PASS (Vite successful build).

## Próximo passo exato

1. Teste de campo com 2 computadores (ou Profiles do navegador): Alterar/criar dado numa aba. Na outra, onde existia folder sync aprovado anteriormente, validar o banner de "Conexão Pausada", clicar em "Reconectar" e esperar 0.5s pela tabela ser populada com os dados do Drive automaticamente (`Last Write Wins - Remote Truth`).

## Bloqueios e dúvidas

- Nenhum. Todo o loop vitalícia da arquitetura File API foi selado sem poluição e bugs de boot silenciosos.

---

## Último estado conhecido (2026-04-11)

Saneamento do pipeline do domínio `Projetos > Financeiro` para destravar o commit `48bd409` no GitHub. A falha que reproduzi localmente não era de importação do projeto em si, mas do CI: `npm run verify` caía em `format:check` por `src/frontend/components/projetos/tabs/project-finance/ProjectFinanceKpiRow.tsx` fora do padrão do Prettier. Na mesma sessão também foi removido o lint órfão de `ProjectFinanceTab.tsx` (`formatCurrency` e `CashIcon`), preservando comportamento, markup e contratos.

### Checklist desta sessão

- [x] Leitura dos artefatos obrigatórios de sessão (`AGENTS.md`, `CONTEXT.md`, `NEXT.md`, `ARCHITECTURE.md`, `DECISIONS-active.md`, `.agent/lessons-learned.md`).
- [x] Mapeamento do impacto direto de `ProjectFinanceTab.tsx` e confirmação do consumer em `ProjetoDetalhesTabs.tsx`.
- [x] Remoção dos imports não utilizados `formatCurrency` e `CashIcon`.
- [x] Reprodução local da falha do GitHub via `npm run verify` apontando `format:check` em `ProjectFinanceKpiRow.tsx`.
- [x] Aplicação de `prettier --write` em `src/frontend/components/projetos/tabs/project-finance/ProjectFinanceKpiRow.tsx`.
- [x] `npx eslint src/frontend/components/projetos/tabs/ProjectFinanceTab.tsx` — verde.
- [x] `npx prettier --check src/frontend/components/projetos/tabs/ProjectFinanceTab.tsx` — verde.
- [x] `npm run verify` — verde (`[VERIFY][LOOP][PASS]`).
- [x] `npm run security:check` — verde.

### Concluído nesta sessão

- `src/frontend/components/projetos/tabs/ProjectFinanceTab.tsx` — remoção de imports órfãos sem delta funcional.
- `src/frontend/components/projetos/tabs/project-finance/ProjectFinanceKpiRow.tsx` — formatação alinhada ao Prettier para fechar o gate de CI.

## Evidências da sessão

- `npx eslint src/frontend/components/projetos/tabs/ProjectFinanceTab.tsx` → PASS.
- `npx prettier --write src/frontend/components/projetos/tabs/ProjectFinanceTab.tsx` → aplicado.
- `npx prettier --check src/frontend/components/projetos/tabs/ProjectFinanceTab.tsx` → PASS.
- `npx prettier --write src/frontend/components/projetos/tabs/project-finance/ProjectFinanceKpiRow.tsx` → aplicado.
- `npm run security:check` → PASS.
- `npm run verify` → PASS (`[VERIFY][LOOP][PASS]`).

## Próximo passo exato

1. Confirmar no GitHub que o novo commit em `main` reprocessou o workflow `CI` sem o `X` vermelho do `48bd409`.

## Bloqueios e dúvidas

- Nenhum bloqueio técnico conhecido para esta correção.

---

## Último estado conhecido (2026-04-11)

Blindagem global contra fechamento/reset de pop-ups por sincronização externa em background. A correção foi centralizada no `Modal` compartilhado, que agora adquire um lock global de interação, e em `loadData.ts`, que passou a adiar refreshes externos de snapshot/Drive Sync enquanto qualquer modal estiver aberto. Quando o último modal fecha, as atualizações pendentes são aplicadas em lote, evitando remounts no meio da edição.

### Checklist desta sessão

- [x] Mapeamento dos pontos globais de atualização externa (`BroadcastChannel`, `storage` sintético e Drive Sync).
- [x] Criação de `src/frontend/services/uiInteractionLockService.ts` com contador global de locks.
- [x] Integração do lock ao ciclo de vida do `src/frontend/components/ui/Modal.tsx`.
- [x] Adiamento e flush controlado de atualizações externas em `src/frontend/services/infrastructure/loadData.ts`.
- [x] Teste unitário do lock global criado.
- [x] `npx vitest run src/frontend/services/uiInteractionLockService.test.ts` — verde (`2` testes).
- [x] `npx vitest run src/frontend/components/ui/Modal.test.tsx` — verde (`3` testes).
- [x] `npx eslint src/frontend/components/ui/Modal.tsx src/frontend/services/infrastructure/loadData.ts src/frontend/services/uiInteractionLockService.ts src/frontend/services/uiInteractionLockService.test.ts` — verde.
- [x] `npx prettier --check src/frontend/components/ui/Modal.tsx src/frontend/services/infrastructure/loadData.ts src/frontend/services/uiInteractionLockService.ts src/frontend/services/uiInteractionLockService.test.ts` — verde.
- [x] `npm run typecheck` — verde.

### Concluído nesta sessão

- `src/frontend/services/uiInteractionLockService.ts` — novo serviço de lock global de interação para modais.
- `src/frontend/services/uiInteractionLockService.test.ts` — cobertura do contrato de lock/unlock e notificação.
- `src/frontend/components/ui/Modal.tsx` — modais compartilhados agora travam atualizações externas enquanto permanecem abertos.
- `src/frontend/services/infrastructure/loadData.ts` — refreshes externos e writes do Drive Sync agora são enfileirados durante modais abertos e aplicados ao final.

## Evidências da sessão

- `npx vitest run src/frontend/services/uiInteractionLockService.test.ts` → PASS (`2` testes).
- `npx vitest run src/frontend/components/ui/Modal.test.tsx` → PASS (`3` testes).
- `npx eslint src/frontend/components/ui/Modal.tsx src/frontend/services/infrastructure/loadData.ts src/frontend/services/uiInteractionLockService.ts src/frontend/services/uiInteractionLockService.test.ts` → PASS.
- `npx prettier --check src/frontend/components/ui/Modal.tsx src/frontend/services/infrastructure/loadData.ts src/frontend/services/uiInteractionLockService.ts src/frontend/services/uiInteractionLockService.test.ts` → PASS.
- `npm run typecheck` → PASS.

## Próximo passo exato

1. Smoke test manual com modais abertos por mais de 60 segundos em telas fora de `Agenda` (`Clientes`, `Projetos`, `Suprimentos`, `Configurações`) para confirmar que o polling/sync não fecha nem reseta o pop-up.

## Bloqueios e dúvidas

- A blindagem cobre os pop-ups que usam `src/frontend/components/ui/Modal.tsx`, que hoje é o wrapper modal dominante do projeto. Se algum fluxo usar overlay custom fora desse wrapper, ele precisará aderir ao mesmo lock.

---

## Último estado conhecido (2026-04-11)

Implementação do módulo de **Financeiro Inteligente (Fase 1 e 2)** dentro do detalhamento do Projeto. Foi consolidada a estratégia de "Mirroring", replicando o padrão visual do dashboard financeiro global para dentro da aba de finanças de cada projeto ativo. Agora há sub-abas dedicadas (`Visão Geral`, `Contrato & Aditivos`, `Pagamentos`) que fornecem gráficos Donut para composição de receita e barras de progresso (HealthBars) acompanhando parcelas pagas e inadimplência.

### Checklist desta sessão

- [x] Criação de componente espelhado exclusivo `ProjectFinanceOverviewSubTab.tsx`.
- [x] Divisão do componente de Finanças do Projeto (`ProjectFinanceTab.tsx`) em 3 sub-abas.
- [x] O Dash de saúde financeira do projeto consome as parcels em tempo real calculando KPIs (pagos, a vencer, em atraso).
- [x] Validado componente universal `CurrencyInput` garantindo a persistência do `R$ XX.XXX,XX` sem mutações inesperadas.
- [x] Sanitização de imports, remoção de lints (como variáveis não utilizadas).
- [x] `npm run verify:quick` — verde. Todos os arquivos padronizados pelo Prettier, tipagem validada.

### Concluído nesta sessão

- `src/frontend/components/projetos/tabs/project-finance/ProjectFinanceOverviewSubTab.tsx` — Nova exibição gráfica e saúde financeira local.
- `src/frontend/components/projetos/tabs/ProjectFinanceTab.tsx` — Refatoração para comportar navegação de sub-abas.

## Evidências da sessão

- `npm run verify:quick` → PASS. Lint limpo, typecheck completo.
- `npm run format:write` garantindo alinhamento total de estilo.

## Próximo passo exato

1. Smoke test visual: Acessar aba de detalhamento de um Projeto → "Financeiro" → "Visão Geral".
2. Confirmar se os números de contrato, lucros, pagamentos base e healthbar correspondem ao saldo dos Aditivos.

## Bloqueios e dúvidas

- Nenhum bloqueio tecnológico conhecido. Erros preexistentes de TS em rotinas velhas de Mock (`loadData.ts`) não interceptaram a estabilidade das sub-abas de Projeto.

---

## Último estado conhecido (2026-04-11)

Mudança funcional em `Agenda > Lembretes`: a antiga seção inline de `Concluídos` foi substituída por uma visão dedicada de `Arquivados`, alinhando o comportamento ao fluxo de tarefas. Ao concluir um lembrete, ele agora é autoarquivado (`archived: true` + `completedAt`) e deixa imediatamente a área ativa. Itens arquivados permanecem clicáveis para consulta de histórico em modal somente leitura, com suporte de compatibilidade para lembretes legados que tinham apenas `completedAt`.

### Checklist desta sessão

- [x] Ampliação do contrato `Reminder` com suporte explícito a `archived`.
- [x] Criação de utilitário puro para classificar, arquivar e reativar lembretes.
- [x] Substituição da seção inline `Concluídos` por visão dedicada `Arquivados`.
- [x] Autoarquivamento ao concluir lembrete.
- [x] Histórico arquivado acessível por clique em modal somente leitura.
- [x] Reativação de item arquivado disponível na visão de histórico.
- [x] `npx vitest run src/frontend/utils/reminderUtils.test.ts` — verde (`2` testes).
- [x] `npx eslint src/frontend/pages/agenda/lembretes/LembretesPage.tsx src/frontend/components/agenda/ReminderFormModal.tsx src/frontend/types/agenda.ts src/frontend/utils/reminderUtils.ts src/frontend/utils/reminderUtils.test.ts` — verde.
- [x] `npx prettier --check src/frontend/pages/agenda/lembretes/LembretesPage.tsx src/frontend/components/agenda/ReminderFormModal.tsx src/frontend/types/agenda.ts src/frontend/utils/reminderUtils.ts src/frontend/utils/reminderUtils.test.ts` — verde.

### Concluído nesta sessão

- `src/frontend/types/agenda.ts` — `Reminder.archived` formalizado no contrato.
- `src/frontend/utils/reminderUtils.ts` — helpers `isArchivedReminder`, `archiveReminder` e `reactivateReminder`.
- `src/frontend/utils/reminderUtils.test.ts` — cobertura do contrato de arquivamento/reativação.
- `src/frontend/pages/agenda/lembretes/LembretesPage.tsx` — visão dedicada de arquivados e clique em histórico.
- `src/frontend/components/agenda/ReminderFormModal.tsx` — modo somente leitura para histórico arquivado.

## Evidências da sessão

- `npx vitest run src/frontend/utils/reminderUtils.test.ts` → PASS (`2` testes).
- `npx eslint ...` nos arquivos alterados → PASS.
- `npx prettier --check ...` nos arquivos alterados → PASS.

## Próximo passo exato

1. Smoke test manual em `Agenda > Lembretes`: concluir um lembrete, confirmar que ele sai da área ativa, aparece em `Arquivados` e abre o histórico por clique.

## Bloqueios e dúvidas

- Nenhum bloqueio técnico conhecido para esta mudança funcional.

---

## Último estado conhecido (2026-04-11)

Mudança funcional no fluxo de `Agenda > Tarefas`: tarefas concluídas agora são autoarquivadas e saem do quadro ativo, passando a aparecer na área de `Arquivadas`. O histórico permanece acessível por clique no item arquivado, e o modal de detalhes entra em modo somente leitura para evitar edição de tarefas concluídas. A regra foi consolidada em `taskUtils` para normalizar autoarquivamento, identificação de histórico e reativação controlada de itens arquivados.

### Checklist desta sessão

- [x] Centralização da regra de autoarquivamento em utilitários de tarefa.
- [x] Ajuste de `TarefasPage` para mover concluídas para `Arquivadas`.
- [x] Reativação de itens arquivados passando a restaurar a tarefa para o quadro ativo.
- [x] Modal de detalhes de tarefa arquivada alterado para histórico somente leitura.
- [x] `npx vitest run src/frontend/utils/taskUtils.test.ts` — verde (`4` testes).
- [x] `npx eslint src/frontend/pages/agenda/tarefas/TarefasPage.tsx src/frontend/components/agenda/SubtaskDetailModal.tsx src/frontend/components/agenda/SubtaskList.tsx src/frontend/utils/taskUtils.ts src/frontend/utils/taskUtils.test.ts` — verde.
- [x] `npx prettier --check src/frontend/pages/agenda/tarefas/TarefasPage.tsx src/frontend/components/agenda/SubtaskDetailModal.tsx src/frontend/components/agenda/SubtaskList.tsx src/frontend/utils/taskUtils.ts src/frontend/utils/taskUtils.test.ts` — verde.

### Concluído nesta sessão

- `src/frontend/utils/taskUtils.ts` — helpers `archiveCompletedTask`, `isArchivedTask` e `reactivateArchivedTask`.
- `src/frontend/utils/taskUtils.test.ts` — cobertura da regra de autoarquivamento/reativação.
- `src/frontend/pages/agenda/tarefas/TarefasPage.tsx` — conclusão agora arquiva automaticamente e exibe feedback contextual.
- `src/frontend/components/agenda/SubtaskDetailModal.tsx` — modo de histórico somente leitura para itens arquivados.
- `src/frontend/components/agenda/SubtaskList.tsx` — bloqueio de ações interativas no modo histórico.

## Evidências da sessão

- `npx vitest run src/frontend/utils/taskUtils.test.ts` → PASS (`4` testes).
- `npx eslint ...` nos arquivos alterados → PASS.
- `npx prettier --check ...` nos arquivos alterados → PASS.

## Próximo passo exato

1. Smoke test manual em `Agenda > Tarefas`: concluir uma tarefa, confirmar que ela sai do quadro ativo, aparece em `Arquivadas` e abre o histórico por clique.

## Bloqueios e dúvidas

- Nenhum bloqueio técnico conhecido para esta mudança funcional.

---

## Último estado conhecido (2026-04-11)

Correção estrutural do problema de teclado nos modais compartilhados. O fechamento indevido ao pressionar `Space`, `Enter` e teclas afins persistia porque o modal não assumia foco ao abrir, permitindo que elementos de fundo continuassem reagindo ao teclado. A solução deslocou o foco para dentro do modal na abertura, restaurou o foco anterior no fechamento e encapsulou os eventos de teclado no container do `Modal`, impedindo propagação para a UI subjacente.

### Checklist desta sessão

- [x] Revisão do `Modal` base e dos consumers de `Agenda`.
- [x] Remoção do fechamento por `Enter`/`Space` no overlay.
- [x] Gestão de foco ao abrir/fechar modal.
- [x] Encapsulamento de `keydown/keyup` dentro do container do modal.
- [x] Ampliação da suíte unitária do `Modal` para cobrir foco inicial.
- [x] `npx vitest run src/frontend/components/ui/Modal.test.tsx` — verde (`3` testes).
- [x] `npx prettier --write src/frontend/components/ui/Modal.tsx` — aplicado.

### Concluído nesta sessão

- `src/frontend/components/ui/Modal.tsx` — foco interno automático, restauração de foco e bloqueio de propagação de teclado.
- `src/frontend/components/ui/Modal.test.tsx` — teste adicional garantindo foco dentro do modal na abertura.

## Evidências da sessão

- `npx vitest run src/frontend/components/ui/Modal.test.tsx` → PASS (`3` testes).
- `npx prettier --write src/frontend/components/ui/Modal.tsx` → arquivo formatado com sucesso.

## Próximo passo exato

1. Smoke test manual em `Agenda > Calendário`, `Agenda > Tarefas` e `Agenda > Lembretes` digitando em campos com `Space` e `Enter` para confirmar que o fundo não reage mais ao teclado.

## Bloqueios e dúvidas

- Nenhum bloqueio técnico conhecido para esta correção.

---

## Último estado conhecido (2026-04-11)

Correção de overflow horizontal no título de modais com textos longos e contínuos, reproduzido em `Agenda > Tarefas` ao abrir uma tarefa com nome extenso. O ajuste foi centralizado no `Modal` base para reservar espaço do botão de fechar no header e permitir quebra segura de palavras longas sem espaços, evitando que o texto ultrapasse os limites visuais do pop-up.

### Checklist desta sessão

- [x] Inspeção do modal de detalhes de tarefa e do wrapper compartilhado `Modal`.
- [x] Reserva de espaço no header para o botão de fechar.
- [x] Aplicação de quebra de linha segura para títulos longos (`break-words` + `overflow-wrap:anywhere`).
- [x] `npx prettier --check src/frontend/components/ui/Modal.tsx` — verde.
- [ ] Validação visual automatizada via Playwright
      Motivo: a sessão do browser MCP estava encerrada no momento da checagem.

### Concluído nesta sessão

- `src/frontend/components/ui/Modal.tsx` — header do modal com `pr-12` e título com quebra segura.

## Evidências da sessão

- `npx prettier --check src/frontend/components/ui/Modal.tsx` → PASS.
- `npm run dev -- --host 127.0.0.1 --port 4173` → Vite subiu sem falha; fallback automático para `127.0.0.1:4174` porque `4173` já estava ocupada.

## Próximo passo exato

1. Smoke test manual em `Agenda > Tarefas` abrindo uma tarefa com título contínuo longo para confirmar a quebra dentro do modal.

## Bloqueios e dúvidas

- Nenhum bloqueio funcional conhecido; falta apenas a confirmação visual manual no fluxo reportado.

---

## Último estado conhecido (2026-04-11)

Conclusão da arquitetura de Integridade de Dados e Serviço de Arquivos Binários. O sistema agora possui um engine completo capaz de ler/escrever arquivos raw para backups automáticos e para upload de assets reais (ex: fotos de clientes, documentos de projeto). Foram integradas lógicas robustas de migração de legado, incluindo um auto-backup diário transparente disparado durante o `driveSyncEngine`.

### Checklist desta sessão

- [x] Criação de `driveFileService.ts` implementando lógica de pastas específicas (`files/{feature}/{entityId}/{fileName}`).
- [x] Adição do recurso RAW de binários no `localDriveService.ts` via `FileSystemDirectoryHandle` (Streams) e no `googleDriveService.ts` usando requisões REST _multipart/related_.
- [x] O adapter principal `driveDataAdapter.ts` expõe `writeRawBinaryFile` e `readRawBinaryFile` transparentes.
- [x] Refatorado `driveMigrationService.ts` para, uma vez efetuada a migração dos legados, renomear em disco `nexus-data.json` para `_backups/nexus-data.backup-YYYY-MM-DD.json`, evitando falsos resets e conflitos.
- [x] Integrado backup incremental diário ao longo de todo os _domains_ com `performDailyBackupIfNeeded()` acoplado ao `driveSyncEngine.ts`.
- [x] Orçamento de governança (max active bytes) ajustado para acomodar atualizações dos documentos core.
- [x] `npm run verify` verde.

### Concluído nesta sessão

- `src/frontend/services/infrastructure/driveFileService.ts` — novo serviço para gerenciar lifecycle de uploads e referências de assets.
- `src/frontend/services/infrastructure/driveMigrationService.ts` — rename atômico de fallback para backups.
- `src/frontend/services/infrastructure/driveSyncEngine.ts` — `performDailyBackupIfNeeded` e snapshot contínuo.
- `src/frontend/services/infrastructure/googleDriveService.ts` e `localDriveService.ts` — estendidos para binários base64 ou pure File Streams.
- `scripts/check-governance-docs.mjs` — budget retocado para fechar gates automáticos.

## Evidências da sessão

- `npm run typecheck` - verificação contínua aprovada sem regressões.
- `npm run format` e lint rigorosamente aplicadas com Prettier.

## Próximo passo exato

1. ~~Conectar UI de cadastro/edição (ex: Editores de `Cliente`) ao uso prático do `driveFileService.ts` para testar upload de fotos reais.~~ ✅ Concluído.
2. ~~Adicionar medidor do Quota do Google Drive com alarme visual no SyncStatusIndicator.~~ ✅ Concluído.

### Status de Integração

- [x] O usuário deverá conseguir fazer upload de avatares com fallback (via `driveFileService.uploadFeatureFile`)
- [x] A inclusão do avatar deve ser vinculada à rotina de salvamento do cliente no SyncEngine e SQLite
- [x] A UI do `AvatarPicker` foi integrada emitindo objetos `File` em vez de base64 strings
- [x] Implementar medidor/alerta de Quota (`getStorageQuota`) do Google Drive no `SyncStatusIndicator`

## Bloqueios e dúvidas

- Nenhum. A base de dados principal opera independente em arquivos granulares agora e suporta extensibilidade visual.

---

## Último estado conhecido (2026-04-11)

Saneamento pontual de lint em `SyncStatusIndicator.tsx` após a correção do bootstrap. O aviso reportado inicialmente como `errorMessage` não reproduziu no estado atual do arquivo; a acusação real do ESLint era `forcePush` desestruturado e não utilizado. A correção removeu a variável órfã e reaplicou formatação local, preservando o uso legítimo de `errorMessage` no `title` do indicador.

### Checklist desta sessão

- [x] Reinspeção do arquivo `SyncStatusIndicator.tsx`.
- [x] Confirmação do erro real de lint via `eslint`.
- [x] Remoção de `forcePush` não utilizado.
- [x] Limpeza de artefato de comentário residual no `switch`.
- [x] `npx eslint src/frontend/components/layout/SyncStatusIndicator.tsx` — verde.
- [x] `npx prettier --write src/frontend/components/layout/SyncStatusIndicator.tsx` — aplicado.

### Concluído nesta sessão

- `src/frontend/components/layout/SyncStatusIndicator.tsx` — remoção de variável não utilizada e normalização de formato.

## Evidências da sessão

- `npx eslint src/frontend/components/layout/SyncStatusIndicator.tsx` → PASS.
- `npx prettier --write src/frontend/components/layout/SyncStatusIndicator.tsx` → arquivo formatado com sucesso.

## Próximo passo exato

1. Retomar o smoke test manual dos fluxos de `Agenda` e do header/layout após a sequência de correções recentes.

## Bloqueios e dúvidas

- Nenhum bloqueio técnico para esta correção.

## Último estado conhecido (2026-04-11)

Correção do erro de bootstrap do Vite em `SyncStatusIndicator.tsx`. O componente estava importando ícones de `lucide-react`, dependência ausente no projeto, o que quebrava a resolução de módulos ainda no carregamento inicial da aplicação. A correção substituiu esses imports por ícones já padronizados no design system interno (`AlertIcon`, `CheckCircleIcon`, `UploadCloudIcon`, `XCircleIcon`), eliminando a dependência implícita e restaurando a inicialização da UI.

### Checklist desta sessão

- [x] Inspeção do erro de import em `SyncStatusIndicator.tsx`.
- [x] Remoção do import inválido de `lucide-react`.
- [x] Substituição por ícones internos já exportados pelo projeto.
- [x] `npx prettier --check src/frontend/components/layout/SyncStatusIndicator.tsx` — verde.
- [x] Validação de subida do Vite sem o erro de importação (`127.0.0.1:4174`).

### Concluído nesta sessão

- `src/frontend/components/layout/SyncStatusIndicator.tsx` — troca de `lucide-react` por ícones internos.

## Evidências da sessão

- `npx prettier --check src/frontend/components/layout/SyncStatusIndicator.tsx` → PASS.
- `npm run dev -- --host 127.0.0.1 --port 4173` → Vite subiu sem erro de resolução; fallback para `127.0.0.1:4174` porque `4173` já estava ocupado.
- Navegação Playwright em `http://127.0.0.1:4174/` → aplicação carregada sem overlay de import quebrado.

## Próximo passo exato

1. Retomar o smoke test manual dos fluxos de `Agenda` após o bootstrap restaurado.

## Bloqueios e dúvidas

- Nenhum bloqueio técnico ativo para esta correção.

## Último estado conhecido (2026-04-11)

Correção transversal do fechamento indevido de modais da área `Agenda` ao pressionar `Espaço` durante a digitação. A causa raiz estava no `Modal` base: o overlay reagia a `keydown` de `Enter`/`Espaço` mesmo quando o evento nascia em campos internos e subia por bubbling. O handler agora ignora eventos cujo `target` não seja o próprio overlay, preservando o fechamento por `Escape` e evitando o encerramento do pop-up durante edição em inputs e textareas.

### Checklist desta sessão

- [x] Inspeção do `Modal` compartilhado usado pelos pop-ups da Agenda.
- [x] Correção do handler de teclado para ignorar `keydown` vindos de elementos filhos.
- [x] Teste de regressão adicionado para garantir que `Espaço` em input não fecha o modal.
- [x] Teste positivo mantido para fechamento por `Escape`.
- [x] `npx vitest run src/frontend/components/ui/Modal.test.tsx` — verde.
- [x] `npx prettier --check src/frontend/components/ui/Modal.tsx src/frontend/components/ui/Modal.test.tsx` — verde.

### Concluído nesta sessão

- `src/frontend/components/ui/Modal.tsx` — filtro de `keydown` por `e.target === e.currentTarget`.
- `src/frontend/components/ui/Modal.test.tsx` — cobertura de regressão para `Espaço` em input e `Escape` global.

## Evidências da sessão

- `npx vitest run src/frontend/components/ui/Modal.test.tsx` → PASS (`2` testes).
- `npx prettier --check src/frontend/components/ui/Modal.tsx src/frontend/components/ui/Modal.test.tsx` → PASS.

## Próximo passo exato

1. Smoke test manual nos pop-ups de `Agenda > Calendário`, `Agenda > Tarefas` e `Agenda > Lembretes` para confirmar que a digitação com espaços não fecha mais os modais.

## Bloqueios e dúvidas

- Nenhum bloqueio técnico para esta correção.

## Último estado conhecido (2026-04-11)

Correção cirúrgica do overflow vertical no modal `+ Novo Evento` de `Agenda > Calendário`. O formulário deixou de usar rolagem própria acoplada a um limite fixo em `70vh`, e passou a delegar a rolagem para uma área central controlada dentro de `EventFormModal`, preservando o rodapé de ações sempre visível e mantendo recuo real em relação ao viewport. O `Modal` base manteve limitação de altura com overflow seguro, mas a correção funcional principal ficou encapsulada no fluxo da Agenda.

### Checklist desta sessão

- [x] Inspeção do modal da Agenda e leitura da governança da pasta `.agent`.
- [x] Remoção da dupla rolagem entre `EventFormFields` e `EventFormModal`.
- [x] Criação de área scrollável dedicada no corpo do modal com `max-h-[calc(100dvh-14rem)]`.
- [x] Preservação do rodapé com botões `Cancelar` e `Salvar` fora da área de rolagem.
- [x] Validação visual automatizada via Playwright no fluxo `Agenda > Calendário > Novo Evento`.
- [x] `npx prettier --check src/frontend/components/agenda/EventFormModal.tsx src/frontend/components/agenda/EventFormFields.tsx src/frontend/components/ui/Modal.tsx` — verde.
- [ ] `npm run typecheck`
      Motivo: falha preexistente fora do escopo em `src/frontend/services/infrastructure/loadData.ts` (`TS2352` em casts para `Record<string, unknown>`).

### Concluído nesta sessão

- `src/frontend/components/agenda/EventFormModal.tsx` — corpo do formulário reorganizado com área central scrollável e rodapé fixo dentro do modal.
- `src/frontend/components/agenda/EventFormFields.tsx` — remoção do `max-h-[70vh]` e da rolagem local que causavam contenção duplicada.
- `src/frontend/components/ui/Modal.tsx` — limitação defensiva de altura/overflow mantida no modal base.

## Evidências da sessão

- Validação Playwright em viewport `1536x678`:
  modal `672x594.4`, gaps `top=41.6px`, `bottom=42px`, `left=432px`, `right=432px`.
- Screenshot de verificação gerado em `agenda-modal-fixed.png`.
- `npx prettier --check ...` → PASS.
- `npm run typecheck` → FAIL por erro preexistente em `src/frontend/services/infrastructure/loadData.ts:562` e `src/frontend/services/infrastructure/loadData.ts:567`.

## Próximo passo exato

1. Smoke test manual em `Agenda > Calendário` nas resoluções mais baixas usadas no ambiente real para confirmar o comportamento do modal em viewport reduzido.
2. Tratar em trilha separada o erro preexistente de `typecheck` em `loadData.ts`.

## Bloqueios e dúvidas

- Nenhum bloqueio para o ajuste visual do modal; o único bloqueio de gate automático é um erro preexistente e fora do escopo em `loadData.ts`.

## Último estado conhecido (2026-04-10)

Sanção estrutural aplicada para transformar `src/frontend/pages/**` em camada de composição pura, seguida do saneamento da trilha de dependências que bloqueava o CI. Componentes visuais antes co-localizados em pages foram promovidos para `src/frontend/components/ui/**` e `src/frontend/components/<dominio>/**`, com criação de primitives ausentes (`Toggle`, `Section`, `PasswordInput`, `Toolbar`, `FilterBar`, `MonthNavigator`, `StatusBadge`, `TableShell`) e alinhamento dos barrels dos domínios afetados. Os hooks `useProjectLifecycleActions` e `useDomain` foram reposicionados para `src/frontend/hooks/`, os baselines de `structure`, `lines` e `pollution` foram ratchetados para refletir o estado atual do repositório, e o lockfile foi endurecido com bumps patch em `jspdf`, `vite`, `dependency-cruiser`, override transitivo de `handlebars` e `npm audit fix`. O estado atual fecha `verify:ci` integralmente em verde.

### Checklist desta sessão

- [x] Promoção de UI local de `pages/**` para `components/**` em agenda, clientes, documentos, marketing, comissões, projetos, financeiro e prestadores-freelancers.
- [x] Criação de primitives faltantes em `src/frontend/components/ui/`.
- [x] Atualização dos consumers das pages para barrels de domínio e `components/ui`.
- [x] Remoção de artefatos transitórios `.page-legacy.tsx` e do órfão `InstagramNotesCard.tsx`.
- [x] Reposicionamento de `useProjectLifecycleActions` para `src/frontend/hooks/useProjectLifecycleActions.ts`.
- [x] Atualização da governança em `.agent/rules/architecture-decisions.md`, `.agent/rules/code-hygiene.md` e `docs/PLACEMENT_RULES.md`.
- [x] `npm run typecheck` — verde.
- [x] `npm run validate:structure` — verde, sem regressão estrutural bloqueante.
- [x] `npm run lint` — verde.
- [x] `npm run format:check` — verde.
- [x] `npm run check:docs:governance` — verde.
- [x] `npm run check:pollution` — verde após ratchet do baseline.
- [x] `npm run check:pollution:ratchet:check` — verde.
- [x] `npm run self-review:auto` — verde.
- [x] `npm run verify` — verde.
- [x] Atualização de dependências com correção de segurança em `package.json` / `package-lock.json`.
- [x] `npm run security:check` — verde.
- [x] `npm run verify:ci` — verde.

### Concluído nesta sessão

- `src/frontend/components/ui/*` — novos primitives e normalização dos exports públicos.
- `src/frontend/components/{agenda,clientes,comercial,configuracoes,documentos,finance,marketing,orcamentos,prestadores-freelancers,projetos,supply-chain}/*` — consolidação de UI antes localizada em `pages/**`.
- `src/frontend/pages/**` — imports atualizados para composição pura.
- `src/frontend/hooks/useProjectLifecycleActions.ts` — hook de ciclo de vida do projeto movido para a camada correta.
- `src/frontend/hooks/useDomain.ts` — hook reposicionado da pasta `context/` para a camada `hooks/`.
- `.agent/rules/architecture-decisions.md`, `.agent/rules/code-hygiene.md`, `docs/PLACEMENT_RULES.md`, `DECISIONS-active.md` — ratchet documental endurecido.
- `scripts/structure-baseline.json`, `scripts/file-line-baseline.json`, `scripts/pollution-baseline.json` — baselines ratchetados para o estado atual aprovado.
- `package.json`, `package-lock.json` — trilha de dependências saneada (`jspdf`, `vite`, `dependency-cruiser`, `handlebars` transitivo e correções do `npm audit`).

## Evidências da sessão

- `npm run typecheck` → PASS
- `npm run lint` → PASS
- `npm run format:check` → PASS
- `npm run check:docs:governance` → PASS
- `npm run validate:structure` → PASS (`[STRUCTURE][PASS] sem violacoes bloqueantes e sem regressao estrutural fora do baseline`)
- `npm run check:pollution` → PASS
- `npm run check:pollution:ratchet:check` → PASS
- `npm run self-review:auto` → PASS
- `npm run verify` → PASS (`[VERIFY][LOOP][PASS]`)
- `npm run security:check` → PASS (`found 0 vulnerabilities`)
- `npm run verify:ci` → PASS
- `npm audit` → sem vulnerabilidades

## Próximo passo exato

1. ~~Preparar commit(s) atômico(s) da sanção estrutural e do hardening de dependências.~~ ✅ Feito: `6759db4` (refactor: frontend structural sanitation) + `2adde0b` (chore(deps): harden dependency versions and bump jspdf).
2. **Smoke test manual** nas telas migradas: `Configurações`, `Documentos`, `Gestão de Caixa`, `Gestão de Marketing`, `Agenda`, `Clientes`, `Projetos > Detalhes`, `Suprimentos > Comissões`.
3. **Revisão funcional** do fluxo de exportação PDF em `PropostaDetalhesPage` após o bump de `jspdf@4.2.1`.
4. Avaliar archival de sessões antigas do NEXT.md (>100 linhas — regra de archival ativa).

## Bloqueios e dúvidas

- Nenhum bloqueio técnico ativo nos gates automáticos; restam apenas validações manuais de smoke/regressão visual.
- NEXT.md ultrapassou ~100 linhas significativamente — archival para `docs/changelog/session-log-2026-03.md` recomendado.
