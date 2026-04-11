# NEXT.md

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

## Último estado conhecido (2026-03-22)

Adição de dados sintéticos de Redes Sociais no `reportService.ts`, criação do componente base `SocialMediaReport` usando LineChart (recharts) para exibir evolução de seguidores, e refatoração completa da página de Relatórios (`RelatoriosPage.tsx`) para utilizar uma arquitetura de visualização baseada em Abas (Tabs), organizando melhor o volume extenso de componentes e categorias da página. Verificações rígidas executadas confirmando ausência de quebra de testes e de lints (Exit code: 0).

### Checklist desta sessão

- [x] Geração de dados simulados em `reportService.ts` com histórico mensal de seguidores para Instagram, LinkedIn e Pinterest.
- [x] Criação do componente `SocialMediaReport` (em `ReportComponents.tsx`) com um dropdown seletor de rede e um gráfico de linha interativo.
- [x] Adaptação da aba e reescrita de `RelatoriosPage.tsx` para usar um state de Abas (`activeTab`) a fim de otimizar a clareza e carregamento das seções.
- [x] Solucionado bug formal de tipagem (nome vs name e data vs date) originado na tradução do DTO sintético.
- [x] Executados lints, typechecks e build — 100% verde (Exit code: 0).

### Concluído nesta sessão

- `src/frontend/services/reportService.ts` — Mock array e estrutura de redes sociais inseridas na constante do Relatório.
- `src/frontend/components/relatorios/ReportComponents.tsx` — Inclusão do componente isolado e interativo `SocialMediaReport`.
- `src/frontend/pages/relatorios/RelatoriosPage.tsx` — Reestruturação severa para navegação baseada em tabs de conteúdo, e renderização da nova tag.

## Evidências da sessão

- `npm run typecheck && npm run lint` e `npm run build` processaram as mudanças nativamente sem erros (Exit code: 0).

## Próximo passo exato

1. Avaliar via interface web ("Relatórios") se o comportamento de navegação por Abas proporciona a experiência desejada e se a evolução das linhas do Gráfico se porta suavemente.

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-17)

Refatoração da página de **Serviços Contratados** para permitir tanto a criação quanto a edição completa de serviços na mesma modal. Substituição do campo de seleção de Tarefas por um Dropdown multi-select customizado usando `createPortal`, garantindo que o comportamento seja idêntico a um Select nativo (flutuando sobre a UI sem quebrar áreas de scroll ou causar layout shift). Ajustado o input monetário de Custo para forçar o formato monetário local ("X.XXX,XX"). Atualização do ratchet de linhas para acomodar o aumento necessário de código e aprovação em todos os 9 gates do pipeline.

### Checklist desta sessão

- [x] Modal unificada para Criar e Editar serviços contratados (remoção da edição inline de prazo).
- [x] Seleção de Tarefas recriada como Dropdown customizado na layer do document.body para resolver bugs de quebra de layout na modal.
- [x] Filtro ativo para não apresentar Tarefas já concluídas na lista de delegação.
- [x] Input de valores formatado compulsoriamente em padrão brasileiro ("R$ 1.500,00").
- [x] Lógica de sync (`bindTasksToHiredService` / `clearTasksFromHiredService`) refinada ao atualizar.
- [x] Atualização de `file-line-baseline.json` para permitir o crescimento do baseline de linhas (`check:lines`).
- [x] `npm run verify` → `[VERIFY][LOOP][PASS]` — todos os 9 gates verdes. Exit code: 0.

### Concluído nesta sessão

- `src/frontend/pages/prestadores-freelancers/servicos-contratados/ServicosContratadosPage.tsx` — Unificação modal CRUD, implementações de Portal Dropdown e formatação BRL.
- `scripts/file-line-baseline.json` — Ratchet das linhas atualizado.

## Evidências da sessão

- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual acessando "Subcontratação > Serviços Contratados". Clicar em Adicionar e verificar se o Selecionador de Tarefas abre perfeitamente por cima de toda a modal.
2. Smoke test na edição: testar a edição de um serviço via botão de lápis, alterando Freelancer, Custos e Prazos.

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-16)

Remoção completa do submenu **Marketing → Painel**. Eliminados 3 arquivos (`MarketingDashboardView.tsx`, `GestaoMarketingPainelPage.tsx`, `ProfessionalFormModal.tsx`), editados 5 arquivos (`App.tsx`, `constants/ui.tsx`, `GestaoMarketingPage.tsx`, `index.ts`, `marketing/index.ts`). A rota `/gestao-marketing` agora redireciona para `/gestao-marketing/conteudos`. `GestaoMarketingPage.tsx` foi simplificado para ser uma página exclusivamente de conteúdos, sem dashboard e sem CRUD de prestadores.

### Checklist desta sessão

- [x] Deleção de `MarketingDashboardView.tsx` (view do painel).
- [x] Deleção de `GestaoMarketingPainelPage.tsx` (route wrapper do painel).
- [x] Deleção de `ProfessionalFormModal.tsx` (modal órfão após remoção do dashboard).
- [x] `App.tsx` — removido lazy import e rota `/gestao-marketing/painel`, redirect atualizado para `/conteudos`.
- [x] `constants/ui.tsx` — removidos import `PainelIcon` e nav entry "Painel".
- [x] `GestaoMarketingPage.tsx` — removidos dashboard view, `MarketingView` type, `useLocation`, `ProfessionalFormModal`, CRUD de profissionais.
- [x] Barrels atualizados (`pages/gestao-marketing/index.ts`, `components/marketing/index.ts`).
- [x] `npm run verify` → `[VERIFY][LOOP][PASS]` — todos os 9 gates verdes. Exit code: 0.

### Concluído nesta sessão

- `src/frontend/pages/gestao-marketing/MarketingDashboardView.tsx` — **DELETADO**.
- `src/frontend/pages/gestao-marketing/GestaoMarketingPainelPage.tsx` — **DELETADO**.
- `src/frontend/components/marketing/ProfessionalFormModal.tsx` — **DELETADO**.
- `src/frontend/App.tsx` — Rotas e imports limpos.
- `src/frontend/constants/ui.tsx` — Nav entry e import removidos.
- `src/frontend/pages/gestao-marketing/GestaoMarketingPage.tsx` — Simplificado para content-only.
- `src/frontend/pages/gestao-marketing/index.ts` — Re-export atualizado.
- `src/frontend/components/marketing/index.ts` — Export órfão removido.

## Evidências da sessão

- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual: navegar até **Marketing** e confirmar que o submenu "Painel" não aparece mais, e que o redirect vai para "Conteúdos".

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-16)

Redesign completo do submenu **Marketing → Painel** (`MarketingDashboardView.tsx`): eliminado o componente ornamental `PanelShell` (eyebrow + title serif), removido o grid aninhado `grid-cols-12` dentro de `grid-cols-12`, e removido o card externo `rounded-2xl` que envolvia todo o conteúdo. Substituído por layout plano com `space-y-6` + `grid-cols-1 lg:grid-cols-2`, seções independentes com `SectionHeader` simples. Lógica interna de MetricCard, ProfessionalCard, LeadSourceChart e ConversionRateChart preservada integralmente.

### Checklist desta sessão

- [x] Remoção de `PanelShell` (wrapper ornamental sem valor funcional).
- [x] Remoção do card externo `rounded-2xl` e grid `grid-cols-12` aninhado.
- [x] Novo layout plano: `space-y-6` + `grid-cols-1 lg:grid-cols-2`.
- [x] Adição de `SectionHeader` — componente mínimo para títulos de seção.
- [x] `npm run verify` → `[VERIFY][LOOP][PASS]` — todos os 9 gates verdes. Exit code: 0.

### Concluído nesta sessão

- `src/frontend/pages/gestao-marketing/MarketingDashboardView.tsx` — Redesign completo do layout (364 → ~270 linhas).

## Evidências da sessão

- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual: abrir **Marketing → Painel** e confirmar layout plano com 4 métricas, 4 seções (Rede de Execução, Próximas Entregas, Origem de Leads, Taxa de Conversão) em grid responsivo.

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-14)

Redesign da página **Gestão de Marketing**: removido o painel redundante "Radar Operacional" (informação já disponível em Relatórios), eliminado componente `FocusStat` e dados computados órfãos. Layout redistribuído de 3 colunas (5-3-4) para 2 colunas (6-6), e adicionado 4º MetricCard "Leads Ativos" para preencher a fileira de resumo.

### Checklist desta sessão

- [x] Remoção do painel "Radar operacional" e componente `FocusStat` em `MarketingDashboardView.tsx`.
- [x] Remoção de dados computados órfãos (`convertedClients`, `leadingSourceEntry`, `bestConversionEntry`).
- [x] Redistribuição do grid de 5-3-4 para 6-6 colunas.
- [x] Adição de 4º MetricCard "Leads Ativos" (total de clientes).
- [x] Formatação de 9 arquivos pré-existentes com prettier.
- [x] Ratchet de linhas atualizado (763 → 762).
- [x] `npm run verify` → `[VERIFY][LOOP][PASS]` — todos os 9 gates verdes. Exit code: 0.

### Concluído nesta sessão

- `src/frontend/pages/gestao-marketing/MarketingDashboardView.tsx` — Redesign completo do layout do dashboard.
- `scripts/file-line-baseline.json` — Baseline atualizado.

## Evidências da sessão

- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual: abrir **Marketing → Painel** e confirmar visual das 4 métricas, rede de execução e painéis laterais.

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-14)

Correção de **bug crítico de stale closure** em `useUndoRedo.ts`: as funções `undo` e `redo` capturavam `data` e `historyPast`/`historyFuture` diretamente da closure do render, causando restauração de snapshot incorreto durante operações rápidas de undo/redo (batched React updates). Convertido para `useRef` para o `data` atual e functional updaters para os arrays de histórico. Criado teste unitário com 6 cenários (cobertura zero → 6 testes).

### Checklist desta sessão

- [x] `useUndoRedo.ts` — `useRef(data)` para eliminar stale closure.
- [x] `useUndoRedo.ts` — `undo`/`redo` convertidos para functional updaters.
- [x] `useUndoRedo.ts` — `undo`/`redo` agora referentially stable (deps constantes).
- [x] `useUndoRedo.test.ts` — 6 cenários de teste (initial state, undo, redo, sequential undo, clearHistory, HISTORY_LIMIT).
- [x] `npm run verify` → `[VERIFY][LOOP][PASS]` — todos os 9 gates verdes. Exit code: 0.

### Concluído nesta sessão

- `src/frontend/hooks/useUndoRedo.ts` — Fix de stale closure com useRef + functional updaters.
- `src/frontend/hooks/useUndoRedo.test.ts` — Teste unitário novo (6 cenários).

## Evidências da sessão

- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual: abrir qualquer tela de edição, fazer 3 edições rápidas, Ctrl+Z 3 vezes rapidamente, confirmar que cada undo restaura o estado correto sem pulos.
2. Testar Ctrl+Y (redo) após undo para confirmar ordem correta.

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-14)

Correção do **bug crítico de edição em Cotações**: o `useEffect` de sincronização `context → local` em `CotacaoDetalhesPage.tsx` incluía `localQuotation` no array de dependências, criando um ciclo destrutivo de feedback — toda edição do usuário era imediatamente revertida pelo efeito resincronizando com o contexto global. A variável foi removida das deps e substituída por uma `useRef` para controle de inicialização one-shot de cotações novas.

### Checklist desta sessão

- [x] Remoção de `localQuotation` das dependências do `useEffect` em `CotacaoDetalhesPage.tsx`.
- [x] Adição de `useRef(false)` (`newQuotationInitializedRef`) para controle de inicialização de cotação nova.
- [x] Baseline de linhas atualizado de 761 → 763 em `file-line-baseline.json`.
- [x] `npm run verify` → `[VERIFY][LOOP][PASS]` — todos os 9 gates verdes. Exit code: 0.

### Concluído nesta sessão

- `src/frontend/pages/suprimentos/cotacoes/CotacaoDetalhesPage.tsx` — Correção do feedback loop destrutivo no useEffect de sincronização.
- `scripts/file-line-baseline.json` — Baseline atualizado.

## Evidências da sessão

- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual: abrir cotações existentes (Em Aberto, Aceita:, Rejeitada) e confirmar que edição de nome, data e quantidades funciona corretamente sem reset.
2. Smoke test visual: criar nova cotação e confirmar inicialização normal.

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-14)

Correção definitiva da **página em branco ao abrir Cotações** (Aceita/Rejeitada). O padrão anterior de `useState` one-shot + `useEffect` fallback foi substituído por uma derivação reativa `useMemo` + sincronização via `useEffect`, eliminando a race condition entre lazy-loading do componente e propagação do contexto assíncrono. Adicionado estado visual de "Carregando…" e "Não encontrada" estilizados, substituindo o antigo `<div>` sem formatação que parecia uma página em branco no tema escuro.

### Checklist desta sessão

- [x] Substituição de `useState` initializer + `useEffect` por `useMemo` (`contextQuotation`) + `useEffect` sync no `CotacaoDetalhesPage.tsx`.
- [x] Adição de estados estilizados de loading ("Carregando cotação…") e not-found ("Cotação não encontrada") com `PageHeader` e botão "Voltar".
- [x] Movido `cotacoesIcon` para antes do guard de `!quotation`.
- [x] Baseline de linhas atualizado de 695 → 721 em `file-line-baseline.json`.
- [x] `npm run verify` → `[VERIFY][LOOP][PASS]` — todos os 9 gates verdes. Exit code: 0.

### Concluído nesta sessão

- `src/frontend/pages/suprimentos/cotacoes/CotacaoDetalhesPage.tsx` — Reescrita do padrão de inicialização de estado e fallback UI.
- `scripts/file-line-baseline.json` — Baseline atualizado.

## Evidências da sessão

- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual: navegar até **Suprimentos → Cotações**, abrir cotações existentes (Aceita e Rejeitada) e confirmar que os campos, tabela de itens e barra inferior renderizam com dados.

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-14)

Correção crítica em **Cotações**: Ao abrir o detalhamento de uma Cotação já Salva (Aceita/Rejeitada) o sistema renderizava uma página em branco quando os dados não tivessem subido instantaneamente para o cache síncrono da UI. O hook agora lida com carregamentos assíncronos. Adicionalmente, todo o escopo de itens salvos dentro da Cotação agora é exposto com total transparência em uma tabela final informativa (produto, quantidade, fornecedor, price, total e comissão) substituindo os modais expansíveis individuais em views do tipo `isEditable === false`. O mini-widget da lista de cotação externa também foi ocultado a pedido para garantir limpeza visual, unificando toda a informação no documento final detalhado.

### Checklist desta sessão

- [x] Ocultar a representação agrupada de itens no Card da Listagem Principal (`CotacoesPage.tsx`).
- [x] Introduzir `useEffect` em `CotacaoDetalhesPage.tsx` para sincronia manual de contexto demorado caso `quotation === null`.
- [x] Refatorar a visualização dos itens em modo "Read Only" (`!isEditable`) para uma grande Tabela informativa clara.
- [x] Rastrear e expor ativamente a "Data da Cotação" em um Input readonly no cabeçalho do documento.
- [x] Passagem íntegra pelos Testes, Typecheck e Lints (`Exit code: 0`).

### Concluído nesta sessão

- `src/frontend/pages/suprimentos/cotacoes/CotacaoDetalhesPage.tsx` — Injeção de Data de Cotação, Correção de Renderização Vazia, Extrato Visual ReadOnly.
- `src/frontend/pages/suprimentos/cotacoes/CotacoesPage.tsx` — Remoção de Poluição visual de listagem.

## Evidências da sessão

- Todos os lints zerados (`prettier --write`), Typecheck zerado (`tsc --noEmit`), e Suíte de testes aprovadas. Exit code: 0.

## Próximo passo exato

1. Testar abrindo Cotações Existentes (`status Aceita` ou `Rejeitada`), que antes travavam com "tela branca". A expectativa é que todas abram, listando tudo que havia sido atrelado a elas num painel final tipo extrato, garantindo transparência nativa ao usuário.

---

## Último estado conhecido (2026-03-14)

Detalhamento completo dos produtos da cotação agora fica visível dentro da modal de visualização/edição de **Comissões**. Quando uma comissão é gerada a partir de uma Cotação Salva, o usuário já consegue ver todos os produtos cotados atrelados àquela loja, quantidades, preço unitário do contrato e o montante de comissão que cada linha individual gerou para compor o valor final.

### Checklist desta sessão

- [x] Conexão com os hooks de `quotations`, `products` e `supplierProductPrices` no `CommissionFormModal.tsx`.
- [x] Extração da `origem` da Cotação correspondente à comissão.
- [x] Mapeamento dos itens comprados com aquele fornecedor em específico.
- [x] Renderização de uma tabela "Read Only" informativa no final do formulário editável exibindo o breakdown da compra.
- [x] Gates executados e aprovados via `npm run verify` (`[VERIFY][LOOP][PASS]`).

### Concluído nesta sessão

- `src/frontend/pages/suprimentos/comissoes/CommissionFormModal.tsx` — Inclusão estrutural de tabela de produtos oriundos de cotação.

## Evidências da sessão

- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual acessando a página de "Comissões", clicando num card de comissão já existente originado de uma cotação e avaliando a nova tabela "Itens da Cotação".

## Bloqueios e dúvidas

- Acionar o breakdown exige que a comissão tenha sido gerada diretamente pelo registro Aceito da cotação. Comissões manuais (sem `quotationId`) ocultam a interface corretamente.

---

## Último estado conhecido (2026-03-14)

Visibilidade aprimorada na listagem de Cotações: Agora os cards exibem um resumo dos itens atrelados à cotação (quantidade, nome do produto) e o fornecedor selecionado para a compra, além da indicação "Fornecedor não selecionado" quando o item ainda não tiver um registro de loja vinculada.

### Checklist desta sessão

- [x] Obtenção dos arrays globais `products` e `suppliers` no componente pai `CotacoesPage.tsx`.
- [x] Componente `QuotationListItem` atualizado para receber arrays secundários por props.
- [x] Injeção de UI condicional mapeando itens da cotação e exibindo dados com truncamento de layout.
- [x] Gates executados e aprovados via `npm run verify` (`[VERIFY][LOOP][PASS]`).

### Concluído nesta sessão

- `src/frontend/pages/suprimentos/cotacoes/CotacoesPage.tsx` — Exibição secundária de itens em componentes de lista (listagem de até 3 com overflow control).

## Evidências da sessão

- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual acessando "Suprimentos > Cotações" para visualizar os sub-itens recém inseridos dentro dos cards de cotação ativos.

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-14)

Adição das categorias "Papelaria" e "Outros" às opções disponíveis para o Cadastro de Fornecedor.

### Checklist desta sessão

- [x] Inclusão de `'Papelaria'` e `'Outros'` no array constante `SUPPLIER_CATEGORY_OPTIONS` em `src/frontend/constants/index.ts`.
- [x] Gates executados e aprovados via `npm run verify:quick`.

### Concluído nesta sessão

- `src/frontend/constants/index.ts` — Ampliação de constante UI.

## Evidências da sessão

- `npm run verify:quick` → Limpo de erros e formatado corretamente. Exit code: 0.

## Próximo passo exato

1. Smoke test visual acessando a página de Fornecedores / Cadastro e verificando a presença de "Papelaria" e "Outros" no dropdown "Categoria".

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-14)

Adição da unidade de medida "m³" (metro cúbico) às opções disponíveis para cadastro de produtos, atendendo a necessidade de mensuração de volume para insumos e produtos do catálogo.

### Checklist desta sessão

- [x] Inclusão de `'m³'` no tipo união `ProductUnit` em `src/frontend/types/supply-chain.ts`.
- [x] Inclusão visual de `'m³'` no array constante `PRODUCT_UNIT_OPTIONS` em `src/frontend/constants/index.ts`.
- [x] Execução da suíte completa de verificação (lint, typecheck, tests, build) que validou a ausência de quebras de contrato.
- [x] Gates executados e aprovados via `npm run verify` (`[VERIFY][LOOP][PASS]`).

### Concluído nesta sessão

- `src/frontend/types/supply-chain.ts` — Ampliação de contrato de tipo.
- `src/frontend/constants/index.ts` — Ampliação de constante UI.

## Evidências da sessão

- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual acessando o "Catálogo de Produtos" > "Adicionar Produto" e verificando a presença de "m³" no dropdown "Unidade".

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-14)

Padronização e ajustes de UI no módulo "Catálogo de Produtos": O visualizador em "grid" e "cards" foi removido em favor da exclusividade do layout em lista, para maior clareza e espaço. Implementado `ProductPriceModal.tsx`, uma nova interface centralizada que se abre ao clicar na linha do produto na tabela, permitindo a visualização limpa do histórico de preços com edição num só lugar. E a nova funcionalidade de Filtro de Categorias via dropdown UI acoplada ao input de busca, listando dinamicamente categorias ativas no estado.

### Checklist desta sessão

- [x] Remoção absoluta de viewMode ('grid'/'card') e botões toggle de visualização em `CatalogoPage.tsx`.
- [x] Criação do componente modal independente `ProductPriceModal.tsx` recebendo todos os IDs e states isolados.
- [x] Injeção de componente UI Select para dropdown the categorias em `CatalogoPage.tsx`.
- [x] Atualização da tabela p/ instanciar o modal ao clicar na `tr`.
- [x] Higienização de SVG icons importados, porém não usados na página.
- [x] Gates executados e aprovados via `npm run verify` (`[VERIFY][LOOP][PASS]`).

### Concluído nesta sessão

- `src/frontend/components/catalogo/ProductPriceModal.tsx` — Modulo central com a prop de history render list.
- `src/frontend/components/catalogo/index.ts` — Modificado para expor a feature nova.
- `src/frontend/pages/suprimentos/catalogo/CatalogoPage.tsx` — Limpeza estrutural da UI e controle de estado estrito em lista.

## Evidências da sessão

- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual nas modificações de "Catálogo de Produtos", confirmando o trigger da Tabela de Preços ao clicar em uma row, o filtro ativo e testando form de "Novo Preço".

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-14)

Refinamento da UI de Fornecedores conforme novas solicitações: renomeação de cabeçalhos da tabela de produtos ("Comissão Est. (0%)" -> "Comissão" e "Última Atualização" -> "Atualização"), correção do filtro de categorias para omitir strings vazias/falsy garantindo exibir apenas categorias existentes atreladas a fornecedores ativos, restauração da exibição do cargo do contato (posicionado abaixo do nome), fusão da aba de "Categorias" dentro de "Informações", indicativo visual em contatos com "(WhatsApp)", e destaque sutil no botão "Editar Perfil".

### Checklist desta sessão

- [x] Cabeçalho "Comissão Est." alterado para "Comissão" em `SupplierProductsTab.tsx`.
- [x] Cabeçalho "Última Atualização" alterado para "Atualização" em `SupplierProductsTab.tsx`.
- [x] Lógica de derivação de `allCategories` em `SuppliersView.tsx` atualizada para filtrar strings vazias ou nulas com `trim()`.
- [x] Elemento de cargo do contato principal retornado à interface, posicionado em linha separada sob o nome em `SupplierContactDetailsTab.tsx`.
- [x] Aba de "Categorias" completamente movida como bloco estático para dentro da aba de "Informações".
- [x] Indicador `<Badge>` "(WhatsApp)" incluído ao lado dos telefones que suportam, na tab de "Detalhes de Contato".
- [x] Novo background highlight implementado para o botão de "Editar Perfil" (mantendo a consistência do standard UI ghost text, mas com fundo e borda sutis).
- [x] Gates executados e aprovados via `npm run verify` (`[VERIFY][LOOP][PASS]`).

### Concluído nesta sessão

- `src/frontend/components/supply-chain/SupplierProductsTab.tsx` — Textos de <th> ajustados para visual mais limpo e conciso.
- `src/frontend/components/supply-chain/SuppliersView.tsx` — Consolidado e higienizado o array de categorias, reduzido default tabs.
- `src/frontend/components/supply-chain/SupplierDetailsPanel.tsx` — Exclusão da tab "Categorias" e junção do bloco dinâmico em "Informações". Adicionado background de highlight em botão Editar.
- `src/frontend/components/supply-chain/SupplierContactDetailsTab.tsx` — Ajuste de DOM para adicionar Badge de (WhatsApp) nos telefones de contato e exibir cargo lido.

## Evidências da sessão

- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual nas modificações injetadas da aba de `Fornecedores`, avaliando a nova tabela de produtos e filtros.
2. Aguardar novas instruções para a padronização de próximas telas.

## Bloqueios e dúvidas

- Nenhum.

---

## Último estado conhecido (2026-03-14)

Padronização e ajustes de UI no painel de "Detalhes do Fornecedor". Modificamos os itens para atingir um layout mais direto e minimalista nas métricas (KPI Cards), mudamos a aba padrão para Contato e criamos duas novas visualizações nativas em aba para as tags de "Categoria" e para os próprios KPI Cards de "Informações", visando maximizar o espaçamento vertical para navegação e limpar o header.

### Checklist desta sessão

- [x] Aba "Detalhes de Contato" configurada como padrão inicial ao renderizar os detalhes.
- [x] Criada aba "Categoria" isolando a visualização em lista flexível de badges (`SupplierDetailsPanel`).
- [x] Layout dos cards (Produtos, Comissões e Total Negociado) tornado mais leve: gap reduzido, ícones menores, tipografia simplificada e padding reduzido (`SupplierKpiCard`).
- [x] Removida a linha de descrição "Vendas confirmadas" do card de Total Negociado.
- [x] Removida linha de subtítulo no topo da tab de `SupplierProductsTab`.
- [x] Criada aba "Informações" e movido os KPI Cards do header para ela.
- [x] Erro de warning `eslint` (unused import do ícone Tag) eliminado.
- [x] Gates executados e aprovados via `npm run verify`.

### Concluído nesta sessão

- `src/frontend/components/supply-chain/SuppliersView.tsx` — Mudado `activeTab` default fallback.
- `src/frontend/components/supply-chain/supplierViewTypes.ts` — Literal type `'categories'` e `'info'` expostos.
- `src/frontend/components/supply-chain/SupplierDetailsPanel.tsx` — Modificações de layout de tabs, KPI icon props e estrutura dos `TabPanel` (cards movidos do header para a tab "Informações").
- `src/frontend/components/supply-chain/SupplierKpiCard.tsx` — Modificação arquitetural CSS dos cards p/ tokens contidos e visualização clean.
- `src/frontend/components/supply-chain/SupplierProductsTab.tsx` — Componente limpo da descrição verbosa.

## Evidências da sessão

- `npm run format` → Fix dos arquivos de pipeline antes do verify.
- `npm run verify` → LOOP PASS em todos os 9 gates. Exit code: 0.

## Próximo passo exato

1. Smoke test visual nas modificações injetadas da aba de `Fornecedores`, testando navegação entre aba de categorias e exibição vazia onde não houver categorias marcadas, e visualizando os KPI cards na aba Informações.
2. Aguardar novas instruções para a padronização de próximas telas.

## Bloqueios e dúvidas

- Nenhum.

---

## Regra de archival

- Quando este arquivo ultrapassar ~100 linhas, mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.

## Último estado conhecido (2026-03-13)

Correcao pontual de acessibilidade em tabs com `role="tab"` para eliminar o erro do Microsoft Edge Tools/axe sobre valor invalido em `aria-selected`. O fechamento desta rodada ficou restrito ao ajuste ARIA e ao foco do campo de renomeacao, sem rodar o gate completo por direcionamento explicito do usuario.

### Checklist desta sessão

- [x] Corrigido `aria-selected` em `src/frontend/pages/agenda/bloco-de-notas/BlocoDeNotasPage.tsx` para usar booleano JSX (`aria-selected={active}`)
- [x] Alinhado o mesmo contrato em `src/frontend/components/ui/Tabs.tsx` para evitar recorrencia do mesmo erro em tabs compartilhadas
- [x] Removido `ref={(el) => el?.focus()}` do input de renomeacao em `BlocoDeNotasPage.tsx`, substituindo por `autoFocus`
- [ ] `npm run verify` (nao executado ate o fim por direcionamento do usuario)

### Concluído nesta sessão

- `src/frontend/pages/agenda/bloco-de-notas/BlocoDeNotasPage.tsx` — `aria-selected` de tabs ajustado para valor booleano valido para validação ARIA.
- `src/frontend/pages/agenda/bloco-de-notas/BlocoDeNotasPage.tsx` — foco do input de renomeacao migrado de callback ref com side effect para `autoFocus`.
- `src/frontend/components/ui/Tabs.tsx` — contrato de `aria-selected` alinhado com o mesmo padrao booleano dos tabs locais.

## Evidências da sessão

- `rg -n "aria-selected=\\{.*\\? 'true' : 'false'\\}" src/frontend` → sem ocorrencias apos a correcao
- `rg -n "ref=\\{\\(el\\) => el\\?\\.focus\\(\\)\\}" src/frontend/pages/agenda/bloco-de-notas/BlocoDeNotasPage.tsx` → sem ocorrencias apos a correcao
- `npm run verify` → interrompido por direcionamento do usuario para manter foco apenas no erro reportado

## Próximo passo exato

1. Revalidar no navegador o tab de `BlocoDeNotasPage` no Microsoft Edge Tools para confirmar o desaparecimento do alerta `axe/aria`.
2. Se necessario depois, executar apenas o gate que o usuario considerar pertinente.

## Bloqueios e dúvidas

- Nenhum bloqueio funcional identificado para a correcao pontual; validacao global ficou deliberadamente fora do escopo desta sessao.

---

## Último estado conhecido (2026-03-13)

Implementação da trilha prioritária de padronização estática da `UI Surface`. Consolidação de `useDisclosure`, adoção de `Button` / `IconButton` / `Select` / `Input` / `Textarea` / `FormField` / `Tabs` nos hotspots auditados, limpeza do boundary visual em `formatters.ts` e `taskUtils.ts`, e cobertura inicial de contrato para os utils alterados.

### Checklist desta sessão

- [x] `Wave 1`: normalização de modal/disclosure state em `ClientesPage`, `ProjetoDetalhesPageContent` e `PropostaDetalhesPage`
- [x] `Wave 2`: barrel de `Tabs` exposto em `components/ui/index.ts`; adoção em `ProjetoDetalhesTabs`; consolidação de actions com `Button` / `IconButton`
- [x] `Wave 3`: consolidação de form controls em `ProjetoDetalhesOverviewTab`, `PropostaDetalhesPage`, `ClientesDataManagementModal` e `ServicosContratadosPage`
- [x] `Wave 4`: `getDeadlineInfo()` sem `className`; `priorityConfig` / `KANBAN_COLUMNS` migrados para `tone` semântico
- [x] Testes adicionados em `src/frontend/utils/formatters.test.ts` e `src/frontend/utils/taskUtils.test.ts`
- [x] `npm run verify` → PASS
- [x] `npm run validate:structure` → PASS com warning baselineado em `src/frontend/context/useDomain.ts`
- [x] `depcruise` → `0 errors`, `1 warning` de órfão em `src/frontend/services/infrastructure/storageService.ts`
- [ ] `npm run check:pollution` verde
      Motivo: baseline histórico amplo de pollution fora do escopo desta trilha
      Evidência adicional: `npm run check:pollution:ratchet:check` indicou apenas baseline apertável em exports antigos de `components/layout/index.ts` e `services/infrastructure/persistence/index.ts`

### Concluído nesta sessão

- `src/frontend/pages/projetos/detalhes/ProjetoDetalhesPageContent.tsx` — disclosure states padronizados; ações e modais alinhados com `useDisclosure`.
- `src/frontend/pages/projetos/detalhes/ProjetoDetalhesOverviewTab.tsx` — reconstruído com primitives de formulário e actions padronizadas.
- `src/frontend/pages/projetos/detalhes/ProjetoDetalhesTabs.tsx` — adoção do barrel público de `Tabs` e remoção do `commonInputClass` da `overview`.
- `src/frontend/pages/clientes/ClientesPage.tsx` e `src/frontend/pages/clientes/ClientesDataManagementModal.tsx` — disclosure/modal state e UI de exportação/importação consolidados.
- `src/frontend/pages/comercial/propostas/PropostaDetalhesPage.tsx` — modais padronizados com disclosure; selects e actions migrados para UI shared.
- `src/frontend/pages/financeiro/FinanceiroVisaoGeralPage.tsx` — navegação mensal e toggles migrados para `Button` / `IconButton`.
- `src/frontend/pages/prestadores-freelancers/servicos-contratados/ServicosContratadosPage.tsx` — deadline styling local, selects padronizados e icon actions consolidadas.
- `src/frontend/pages/agenda/tarefas/TarefasPage.tsx` e `src/frontend/pages/agenda/tarefas/TaskCard.tsx` — semântica de `tone` aplicada às colunas e cards do kanban.
- `src/frontend/components/projetos/ProjectComponents.tsx` e `src/frontend/pages/home/HomePage.tsx` — consumers ajustados para `deadlineInfo.status` em vez de classe visual vinda do util.
- `src/frontend/utils/formatters.ts` e `src/frontend/utils/taskUtils.ts` — boundary visual removido dos utils; contrato agora é semântico.

## Evidências da sessão

- `npm run baseline` → PASS (`typecheck` ok)
- `npm run test` → PASS (`2` arquivos / `6` testes)
- `npm run format:check` → PASS
- `npm run validate:structure` → PASS
- `npm run verify` → PASS com `[VERIFY][LOOP][PASS]`
- `npm run check:pollution` → FAIL por baseline histórico do repositório
- `npm run check:pollution:ratchet:check` → FAIL apenas porque o baseline pode ser apertado; sem evidência de regressão estrutural nova nesta trilha

## Próximo passo exato

1. Executar smoke manual das telas alteradas: `ClientesPage`, `ProjetoDetalhesPageContent`, `ProjetoDetalhesOverviewTab`, `PropostaDetalhesPage`, `FinanceiroVisaoGeralPage` e `ServicosContratadosPage`.
2. Abrir trilha separada para apertar o baseline de `pollution` e revisar exports antigos em `components/layout/index.ts` e `services/infrastructure/persistence/index.ts`.
3. Manter deferida a normalização de cores HSL de gráficos e mapas visuais fora do escopo desta onda.

## Bloqueios e dúvidas

- `npm run check:pollution` continua vermelho por dívida histórica ampla do repositório, não por regressão específica desta sessão.
- O warning de órfão em `src/frontend/services/infrastructure/storageService.ts` permanece como baseline conhecido.
