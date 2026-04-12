# Types and Data Contracts

## Estado atual

- Migração completa: todos os tipos vivem em `src/frontend/types/*` (módulos de domínio).
- `src/frontend/types.ts` é um barrel puro que re-exporta de `src/frontend/types/index.ts`.
- Contratos de séries financeiras adicionados em `src/frontend/types/financial-series.ts` para padronizar período/filtros/agregação mensal.

## Fonte de verdade de contratos

- Tipos canônicos vivem em `src/frontend/types/*` (módulos de domínio).
- `src/frontend/types.ts` e `src/frontend/types/index.ts` são barrels puros — não contêm definições.
- Este documento rastreia decisões de shape e fixtures canônicas.
- Mudança em contrato público sem atualização deste documento é considerada incompleta.

## Regra de mudança

- Alteração de interface pública deve atualizar este documento e registrar decisão em `DECISIONS-active.md`/ADR.
- Sempre manter compatibilidade incremental durante migração.
- Services públicos devem expor JSDoc curto com `input -> output` e exemplo.
- Se houver import/export JSON de domínio, atualizar também fixtures e golden tests.

## Golden fixtures (anti-regressão de shape)

- Local: `src/frontend/test/fixtures/`.
- Domínios canônicos iniciais:
  - `client.fixture.json`
  - `project.fixture.json`
  - `proposal.fixture.json`
- Teste de contrato: `src/frontend/test/golden-fixtures.test.ts`.

## Checklist de alteração de contrato

- [ ] Tipo alterado mapeado (quem consome).
- [ ] Impacto em services/pages identificado.
- [ ] Fixtures canônicas atualizadas (`src/frontend/test/fixtures/*`) quando houver mudança de shape.
- [ ] Golden tests atualizados (`src/frontend/test/golden-fixtures.test.ts`).
- [ ] Testes atualizados.
- [ ] Gate canônico de `AGENTS.md` verde.

## Subtask (Agenda / Projeto)

- Arquivo: `src/frontend/types/project.ts`
- Campos: `id`, `title`, `completed`, `completedAt?` (ISO datetime de conclusão), `taskId?`
- Usada em `AgendaEvent.subtasks` e `ProjectTask.subtasks`
- `completedAt` é gravado automaticamente ao marcar como concluída e limpo ao desmarcar.

## Contrato de navegação (UI-agnostic)

- Arquivo: `src/frontend/types/common.ts`
- Tipo: `NavLinkItem`
- Campos canônicos:
  - `icon: JSX.Element`
  - `iconName: NavIconName`
- `NavIconName` é definido como union por template literal:
  - `` `${string}Icon` | `${string}IconNew` ``
- Objetivo: manter o contrato de tipos desacoplado de `src/frontend/components/ui/icons.tsx` para evitar dependência de camada de implementação em `src/frontend/types/*`.

## Contratos de séries financeiras (Financeiro)

- Arquivo: `src/frontend/types/financial-series.ts`
- Tipos canônicos:
  - `PeriodMode`: `LAST_12_MONTHS | QUARTER | SEMESTER | YEAR`
  - `PeriodSelection`: `{ mode, year? }`
  - `Filters`: `{ origin?, category?, item? }`
  - `SeriesPoint`: `{ label: \"YYYY-MM\", value: number }`
  - `SeriesFilterOptions`: listas de `origins`, `categories`, `items`
  - `FinancialSeriesSource`: payload tipado para consulta de séries (dados financeiros de entrada)
- Uso:
  - `getReceivablesSeries(period, filters, source)`
  - `getExpensesSeries(period, filters, source)`
  - `getReceivablesFilterOptions(source, filters)`
  - `getExpensesFilterOptions(source, filters)`

## Contrato de proteção de caixa (Financeiro)

- Arquivo: `src/frontend/types/finance.ts`
- Tipo canônico: `EmergencyFund`
- Shape:
  - `currentValue: number`
  - `targetValue?: number`
- Persistência:
  - `AppData.emergencyFund`
  - default: `{ currentValue: 0 }`
  - armazenamento escalar em `system_config` no adaptador SQLite/WASM
- Uso:
  - `getEmergencyFund()`
  - `updateEmergencyFund(fund)`
  - `getEmergencyFundInsight(fund, monthlyExpenseBaseline)`
- Regra:
  - `targetValue` continua opcional para permitir acompanhamento por meses de fôlego quando não houver meta explícita.

## Contrato de sincronização Firebase

- Arquivos canônicos:
  - `src/frontend/services/infrastructure/cloudSyncTypes.ts`
  - `src/frontend/services/infrastructure/cloudSyncPreferences.ts`
  - `src/frontend/services/infrastructure/cloudConflictMerge.ts`
  - `src/frontend/services/infrastructure/firebaseSyncEngine.ts`
  - `src/frontend/services/infrastructure/persistence/firebasePersistenceAdapter.ts`
- Estrutura remota canônica:
  - `users/{uid}` — metadados do workspace (`schemaVersion`, `migratedAt`, `lastSeenAt`).
  - `users/{uid}/domains/{domain}` — metadados por domínio e payload de valores escalares.
  - `users/{uid}/domains/{domain}/items/{recordId}` — coleções identificáveis por `id`.
  - `users/{uid}/domains/documentStorage/nodes/{nodeId}` — árvore documental normalizada.
  - `users/{uid}/preferences/ui` — preferências sincronizadas em `entries`.
  - `users/{uid}/counters/globalIdentifier` — alocação transacional do contador global.
  - `users/{uid}/backups/{backupId}` — metadados dos backups.
- Estrutura canônica de Storage:
  - `users/{uid}/documents/{fileId}/{sourceId}/{fileName}`
  - `users/{uid}/attachments/{feature}/{entityId}/{fileName}`
  - `users/{uid}/avatars/{clientId}/avatar.jpg`
  - `users/{uid}/backups/{backupId}.json`
- Contratos canônicos:
  - `SyncEngineState`:
    - `status: 'idle' | 'syncing' | 'error' | 'offline' | 'initializing'`
    - `accessMode: 'firebase' | 'none'`
    - `lastSyncTimestamp: number | null`
    - `dirtyDomains: string[]`
    - `dirtyPreferences: string[]`
    - `errorMessage: string | null`
    - `retryScheduledAt: number | null`
    - `pendingChangesCount: number`
  - `SyncOperationResult`:
    - `ok: boolean`
    - `action: 'flushPendingWrites' | 'forcePush' | 'forcePull' | 'reconnectWithRepermission'`
    - `cause: 'success' | 'no_changes' | 'no_access' | 'push_failed' | 'pull_failed' | 'reconnect_failed'`
    - `accessMode: 'firebase' | 'none'`
    - `message: string | null`
  - `PersistenceSyncState`:
    - `status`
    - `accessMode`
    - `lastSyncTimestamp`
    - `errorMessage`
    - `retryScheduledAt`
    - `pendingWrites`
    - `userEmail`
    - `quota`
- Regra de conflito:
  - arrays identificáveis usam merge `last write wins` por registro;
  - exclusões usam tombstones por domínio;
  - valores escalares e preferências usam `last write wins` por timestamp.
- Regra de binários:
  - `DocumentSource.content` permanece apenas para links e fallback local;
  - uploads permanentes devem usar `DocumentSource.storagePath` + `storageProvider: 'firebase-storage'`;
  - `Client.avatarStoragePath` identifica o arquivo gerenciado do avatar;
  - `AgendaEvent.attachments[].storagePath` identifica anexos persistidos no Storage.
