# techspec-sqlite-integration.md — Integração SQLite ao Nexus-Arqui

## Contexto

O Nexus-Arqui hoje persiste dados via **IndexedDB** (snapshot + entity-state) abstrato pelo **PersistencePort**. Este TechSpec define a integração do **SQLite via WASM no browser** como backend de persistência com **máxima proteção contra corrupção e perda de dados**.

> [!CAUTION] > **Requisito #1 do usuário:** Segurança CONTRA PERDA DE DADOS é prioridade absoluta. Não se trata de criptografia ou vazamento — trata-se de garantir que nenhum dado seja corrompido ou perdido, mesmo em crash do browser, fechamento abrupto, ou falha de energia.

> [!NOTE] > **Investigação COOP/COEP (2026-02-23):** Auditoria completa do codebase confirma **ZERO recursos externos**: nenhum CDN, Google Fonts, iframe, script externo em `index.html` ou qualquer arquivo fonte. Todos os `https://` encontrados são xmlns de SVG, placeholders de input ou fixtures de teste. **Headers COOP/COEP são 100% seguros para ativar.**

---

## Decisões Arquiteturais

### 1. Arquivo Único ou Múltiplos?

**DECISÃO: UM ÚNICO arquivo SQLite com múltiplas tabelas.**

| Alternativa                      | Prós                                                                            | Contras                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Um arquivo, múltiplas tabelas ✅ | Transações atômicas cross-entity, um WAL journal, um ponto de backup, menor I/O | Arquivo maior                                                                                 |
| Um arquivo por entidade ❌       | Isolamento por file                                                             | Sem transações entre entidades, 25 WAL journals, 25 opens, muito mais superficie de corrupção |

**Justificativa:** SQLite foi projetado para um arquivo com múltiplas tabelas. Operações que criam um projeto E vinculam a um cliente precisam estar na MESMA transação. Com múltiplos arquivos, se o browser fechar entre dois writes → inconsistência irrecuperável. **Um arquivo = uma fronteira transacional = um ponto de proteção.**

### 2. Biblioteca WASM

**DECISÃO: `wa-sqlite` com `OPFSCoopSyncVFS`**

| Biblioteca           | Prós                                                                               | Contras                                              |
| -------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **wa-sqlite** ✅     | VFS flexível, OPFS nativo, cooperative locking cross-tab, leve, IndexedDB fallback | Menos "oficial"                                      |
| Official sqlite-wasm | Referência oficial, testado pelo Notion                                            | Setup complexo, bundle pesado, COOP/COEP obrigatório |
| sql.js               | Simples, popular                                                                   | In-memory only, SEM persistência nativa → eliminado  |

### 3. Camada de Persistência (VFS)

**Prioridade de fallback:**

```
1. OPFS (Origin Private File System) — byte-level disk I/O, máxima durabilidade
2. IndexedDB VFS — fallback para browsers sem OPFS ou sem cross-origin headers
3. Volatile (in-memory) — último recurso, sem persistência
```

### 4. Modelo de Dados: JSON Column Store

**DECISÃO: Uma tabela por tipo de entidade, dados como JSON TEXT.**

```sql
-- Exemplo: tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY NOT NULL,
  data TEXT NOT NULL,           -- JSON serializado do objeto Client
  updated_at INTEGER NOT NULL   -- Timestamp em ms
);
```

| Alternativa           | Prós                                                              | Contras                                                           |
| --------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| JSON Column Store ✅  | Shape idêntica ao atual, migração trivial, zero refactor de types | Não-queryable via SQL (mas services fazem isso em JS)             |
| Full Normalization ❌ | Queries SQL poderosas                                             | Dezenas de tabelas extras, FK complexas, refactor maciço de types |

**Justificativa:** Os domain services já recebem arrays de objetos e filtram em JS. Não precisamos de queries SQL complexas. O JSON Column Store mantém a mesma shape de dados, tornando a migração IndexedDB→SQLite trivial.

---

## Arquitetura de Durabilidade (Zero Data Loss)

### PRAGMA Configuration

```sql
PRAGMA journal_mode = WAL;           -- Write-Ahead Logging (crash-safe)
PRAGMA synchronous = FULL;           -- fsync após CADA write (mais lento, mais seguro)
PRAGMA wal_autocheckpoint = 100;     -- Flush WAL a cada 100 pages
PRAGMA busy_timeout = 5000;          -- Espera até 5s por locks
PRAGMA foreign_keys = ON;            -- Integridade referencial
PRAGMA auto_vacuum = INCREMENTAL;    -- Previne bloat
PRAGMA cache_size = -2000;           -- 2MB cache em memória
PRAGMA temp_store = MEMORY;          -- Temp em RAM
```

### Disciplina Transacional

```
REGRA 1: Todo write é envolvido em transação explícita (BEGIN IMMEDIATE ... COMMIT)
REGRA 2: Em erro → ROLLBACK automático (nunca half-written)
REGRA 3: Checkpoint periódico (flush WAL → main DB file)
REGRA 4: Nunca escritas fora de transação
```

### Proteção Contra Browser Close Mid-Write

```
Cenário: Usuário fecha a aba no meio de um write.

✅ SQLite WAL + PRAGMA synchronous=FULL garante:
   - Transações commitadas → SOBREVIVEM crash (bytes no arquivo)
   - Transações não-commitadas → ROLLBACK automático no próximo open
   - WAL journal → recuperação automática

✅ Writes são atômicos: ou TUDO é salvo, ou NADA é salvo (nunca parcial)
```

### Cross-Tab Safety

```
wa-sqlite OPFSCoopSyncVFS:
   - Cooperative locking: uma tab escreve, outras esperam
   - BroadcastChannel (já existe!) notifica tabs sobre mudanças
   - Fallback: SharedWorker para session-level singleton
```

---

## Schema SQL Completo

```sql
-- ============================================================
-- DATABASE: nexus_arqui.sqlite (ARQUIVO ÚNICO)
-- ============================================================

-- Versionamento do schema
CREATE TABLE IF NOT EXISTS schema_meta (
  version INTEGER NOT NULL DEFAULT 1,
  migrated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
);

-- Configurações escalares (globalIdentifierCounter, contractDeadlines, etc.)
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
);

-- Uma tabela por entidade (JSON Column Store)
CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS proposals (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS suppliers (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS supplier_product_prices (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS quotations (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS commissions (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS marketing_professionals (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS marketing_activities (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS marketing_ideas (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS social_networks (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS freelancers (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS agenda_events (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS manual_expenses (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS manual_incomes (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS prospects (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS hired_services (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS cash_box_expenses (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS cash_box_credits (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS reminders (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);

-- document_storage (singleton — não tem id, é um objeto)
CREATE TABLE IF NOT EXISTS document_storage (id INTEGER PRIMARY KEY DEFAULT 1, data TEXT NOT NULL, updated_at INTEGER NOT NULL);

-- Listas simples (sem id, valores diretos)
CREATE TABLE IF NOT EXISTS dismissed_focus_items (item TEXT PRIMARY KEY NOT NULL);
CREATE TABLE IF NOT EXISTS accepted_payment_methods (data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS budget_template (data TEXT, updated_at INTEGER NOT NULL);

-- Backups automáticos
CREATE TABLE IF NOT EXISTS automatic_backups (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER NOT NULL,
  payload TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  hash TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT 'auto'
);

-- UI Preferences
CREATE TABLE IF NOT EXISTS ui_preferences (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
);
```

---

## Arquitetura de Runtime

```
                      ┌──────────────────────────────────┐
                      │         Main Thread               │
                      │                                   │
                      │  SqlitePersistenceAdapter         │
                      │    implements PersistencePort      │
                      │    ├── postMessage(operation)  ────┼───► sqliteWorker.ts
                      │    └── await response          ◄──┼────  (Web Worker)
                      │                                   │        │
                      │  createPersistenceAdapter()       │        ├── wa-sqlite WASM
                      │    detects OPFS → returns Sqlite  │        ├── OPFSCoopSyncVFS
                      │    no OPFS → returns IndexedDb    │        ├── nexus_arqui.sqlite
                      │                                   │        └── PRAGMA config
                      └──────────────────────────────────┘
```

---

## Sub-tarefas (Fases de Implementação)

### Fase 1 — Dependências e Configuração

#### [NEW] npm: `wa-sqlite`

- `npm install wa-sqlite`

#### [MODIFY] `vite.config.ts`

- Adicionar headers COOP/COEP para dev server (necessários para `SharedArrayBuffer`):
  ```ts
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  }
  ```
- Configurar Worker bundling (Vite já suporta `new Worker(url, { type: 'module' })`)

---

### Fase 2 — Web Worker SQLite

#### [NEW] `src/services/infrastructure/persistence/sqlite/sqliteWorker.ts`

- Inicializa wa-sqlite com OPFSCoopSyncVFS (ou IndexedDB VFS fallback)
- Aplica PRAGMAs de durabilidade
- Executa schema creation (CREATE TABLE IF NOT EXISTS)
- Message handler para operações CRUD
- Checkpoint periódico

#### [NEW] `src/services/infrastructure/persistence/sqlite/sqliteRpc.ts`

- Camada RPC type-safe entre main thread e worker
- `sqliteRpc.exec(sql, params)` → Promise
- `sqliteRpc.transaction(statements[])` → Promise (atômico)
- Serialização de erros, timeout handling, retry

#### [NEW] `src/services/infrastructure/persistence/sqlite/sqliteSchema.ts`

- Todas as `CREATE TABLE` statements (conforme schema acima)
- Versão do schema (em `schema_meta`)
- Função `applySchema(db): Promise<void>`

#### [NEW] `src/services/infrastructure/persistence/sqlite/sqliteMigrations.ts`

- Migrations SQL versionadas (ALTER TABLE, nova coluna, etc.)
- Função `runMigrations(currentVersion, targetVersion): SQL[]`
- Padrão idêntico ao `migrations.ts` existente

---

### Fase 3 — Adapter

#### [NEW] `src/services/infrastructure/persistence/SqlitePersistenceAdapter.ts`

- Implementa `PersistencePort`
- Cada método traduz para operações SQL via `sqliteRpc`:

| PersistencePort método           | SQL equivalente                                                              |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `readSnapshot<T>()`              | `SELECT * FROM {cada tabela}` → monta AppData                                |
| `writeSnapshot<T>(s)`            | `BEGIN; INSERT OR REPLACE INTO {cada tabela}; COMMIT`                        |
| `clearSnapshot()`                | `BEGIN; DELETE FROM {cada tabela}; COMMIT`                                   |
| `readEntityState<T>(entities?)`  | `SELECT * FROM {tabelas filtradas}`                                          |
| `writeEntityState(state)`        | `BEGIN; INSERT OR REPLACE INTO {tabelas}; COMMIT`                            |
| `readPreference<T>(key)`         | `SELECT value FROM ui_preferences WHERE key = ?`                             |
| `writePreference<T>(key, value)` | `INSERT OR REPLACE INTO ui_preferences ...`                                  |
| `removePreference(key)`          | `DELETE FROM ui_preferences WHERE key = ?`                                   |
| `listBackups()`                  | `SELECT * FROM automatic_backups ORDER BY created_at DESC`                   |
| `writeBackup<T>(payload, opts)`  | `BEGIN; INSERT INTO automatic_backups; DELETE oldest; COMMIT`                |
| `readBackup<T>(id)`              | `SELECT * FROM automatic_backups WHERE id = ?`                               |
| `clearBackups()`                 | `DELETE FROM automatic_backups`                                              |
| `reserveGlobalIdentifier(d)`     | `BEGIN; UPDATE system_config SET value=value+1 WHERE key='globalId'; COMMIT` |
| `isSupported()`                  | Feature detection: `navigator.storage?.getDirectory`                         |

---

### Fase 4 — Factory e Feature Detection

#### [MODIFY] `src/services/infrastructure/persistence/createPersistenceAdapter.ts`

- Adicionar feature detection:
  ```ts
  function detectBestBackend(): 'sqlite-opfs' | 'sqlite-indexeddb' | 'indexeddb' {
    if (supportsOpfs()) return 'sqlite-opfs';
    if (supportsWasmWorker()) return 'sqlite-indexeddb';
    return 'indexeddb';
  }
  ```
- Retornar `SqlitePersistenceAdapter` quando SQLite estiver disponível
- Manter `IndexedDbPersistenceAdapter` como fallback garantido

---

### Fase 5 — Migração de Dados (IndexedDB → SQLite)

#### [NEW] `src/services/infrastructure/persistence/sqlite/indexedDbToSqliteMigrator.ts`

- Executada UMA VEZ no primeiro lançamento pós-upgrade
- Fluxo:
  1. Detectar se SQLite já tem dados → skip
  2. Ler TUDO do IndexedDB (via `indexedDbService.readSnapshot`)
  3. `BEGIN IMMEDIATE`
  4. Inserir cada entidade na tabela correspondente
  5. `COMMIT`
  6. Marcar migração como completa em `system_config`
  7. **MANTER IndexedDB intacto** como backup (não deletar)
- Rollback: se migração falhar → continuar usando IndexedDB normalmente

---

### Fase 6 — Testes

#### [NEW] `src/services/infrastructure/persistence/sqlite/sqliteWorker.test.ts`

- Testa inicialização do worker
- Testa CRUD operations
- Testa transações atômicas (sucesso + rollback em erro)

#### [NEW] `src/services/infrastructure/persistence/SqlitePersistenceAdapter.test.ts`

- Testa cada método do PersistencePort via adapter
- Reutiliza os mesmos cenários de `indexedDbService.test.ts` (AAA pattern)

---

## Pontos de Contato (Mapa de Arquivos)

| Ação    | Caminho                                                                       |
| ------- | ----------------------------------------------------------------------------- |
| **NEW** | `src/services/infrastructure/persistence/sqlite/sqliteWorker.ts`              |
| **NEW** | `src/services/infrastructure/persistence/sqlite/sqliteRpc.ts`                 |
| **NEW** | `src/services/infrastructure/persistence/sqlite/sqliteSchema.ts`              |
| **NEW** | `src/services/infrastructure/persistence/sqlite/sqliteMigrations.ts`          |
| **NEW** | `src/services/infrastructure/persistence/sqlite/indexedDbToSqliteMigrator.ts` |
| **NEW** | `src/services/infrastructure/persistence/SqlitePersistenceAdapter.ts`         |
| **NEW** | `src/services/infrastructure/persistence/sqlite/sqliteWorker.test.ts`         |
| **NEW** | `src/services/infrastructure/persistence/SqlitePersistenceAdapter.test.ts`    |
| MODIFY  | `src/services/infrastructure/persistence/createPersistenceAdapter.ts`         |
| MODIFY  | `src/services/infrastructure/persistence/index.ts` (barrel update)            |
| MODIFY  | `vite.config.ts` (headers COOP/COEP + worker config)                          |
| MODIFY  | `package.json` (dependência `wa-sqlite`)                                      |
| MODIFY  | `DECISIONS-active.md` (ADR)                                                   |
| MODIFY  | `NEXT.md` (estado da sessão)                                                  |
| ~~NO~~  | `loadData.ts` (já usa PersistencePort ✅)                                     |
| ~~NO~~  | `autoBackupService.ts` (já usa PersistencePort ✅)                            |
| ~~NO~~  | `api.ts` (Don't Touch ✅)                                                     |
| ~~NO~~  | `DataContext.tsx` (zero impacto ✅)                                           |
| ~~NO~~  | Services de domínio (zero impacto ✅)                                         |
| ~~NO~~  | Components/Pages (zero impacto ✅)                                            |

**Total: 8 novos + 4 modificados | 0 breaking changes**

---

## Impacto de Dependências

### Novas (npm)

| Pacote      | Versão | Tamanho     | Propósito                     |
| ----------- | ------ | ----------- | ----------------------------- |
| `wa-sqlite` | ^0.9+  | ~300KB WASM | SQLite WASM engine + OPFS VFS |

### Internas (criadas)

```
persistence/sqlite/sqliteWorker.ts      ← wa-sqlite, OPFSCoopSyncVFS
persistence/sqlite/sqliteRpc.ts         ← main↔worker message passing
persistence/sqlite/sqliteSchema.ts      ← CREATE TABLE statements
persistence/sqlite/sqliteMigrations.ts  ← ALTER TABLE scripts
persistence/sqlite/indexedDbToSqliteMigrator.ts ← one-time migration
persistence/SqlitePersistenceAdapter.ts ← PersistencePort implementation
```

---

## Camadas de Segurança Contra Perda de Dados

```
Camada 1: WAL Mode
  └── Writes vão para WAL file primeiro (crash-safe)
  └── Main DB file só é modificado durante checkpoint (atômico)

Camada 2: PRAGMA synchronous = FULL
  └── fsync após CADA commit (dados no disco antes de retornar)
  └── Mais lento, mas GARANTE que dados sobrevivem a crash

Camada 3: Transações Atômicas
  └── BEGIN IMMEDIATE → operações → COMMIT
  └── Em erro: ROLLBACK automático (nenhum dado parcial)

Camada 4: Backup Automático (existente)
  └── autoBackupService cria snapshots periódicos
  └── Armazenados na tabela automatic_backups

Camada 5: IndexedDB Retained
  └── Dados originais NÃO são deletados após migração
  └── Fallback de emergência se SQLite corromper

Camada 6: Export JSON
  └── importExport.ts continua funcionando
  └── Usuário pode baixar backup manual a qualquer momento
```

---

## Riscos e Mitigações

| Risco                                      | Probabilidade | Impacto | Mitigação                                                        |
| ------------------------------------------ | ------------- | ------- | ---------------------------------------------------------------- |
| Browser sem OPFS suporte                   | Média         | Alto    | Fallback para IndexedDB VFS → fallback para IndexedDbAdapter     |
| COOP/COEP headers bloqueiam iframes/embeds | Baixa         | Médio   | Headers apenas no dev server; produção usa build estático        |
| Corrupção do arquivo WAL                   | Muito baixa   | Alto    | SQLite tem recovery automático; backups em tabela separada       |
| Tab concurrency race condition             | Média         | Médio   | OPFSCoopSyncVFS usa cooperative locking                          |
| WASM bundle aumenta load time              | Baixa         | Baixo   | ~300KB gzipped; carregado lazy via Worker                        |
| Migração IndexedDB→SQLite falha            | Baixa         | Alto    | Transação atômica; em falha → mantém IndexedDB; retry automático |

---

## Verification Gate

```bash
# Gate canônico (all 8 gates)
npm run verify

# Testes específicos de persistence
npx vitest run src/services/infrastructure/persistence/

# Testes de durabilidade (manual)
# 1. Abrir app → adicionar dados → fechar aba abruptamente → reabrir → dados intactos
# 2. Abrir em duas abas → editar na tab 1 → verificar sync na tab 2
# 3. Exportar JSON → limpar dados → importar JSON → tudo restaurado
# 4. DevTools → Application → OPFS → verificar nexus_arqui.sqlite existe
```
