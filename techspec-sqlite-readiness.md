# techspec-sqlite-readiness.md — Preparação Arquitetural para SQLite

## Contexto

O Nexus-Arqui persiste dados via **IndexedDB** (snapshot monolítico + entity-state + backups + preferences). A próxima etapa é adicionar **SQLite** como backend de persistência. Para isso, a camada `loadData.ts` e `autoBackupService.ts` estão **acopladas diretamente** ao `indexedDbService`, impedindo troca de backend sem rewrite.

Este TechSpec prepara o código com o **PersistencePort Pattern**: uma interface de contrato que abstrai TODAS as operações de persistência, permitindo trocar `IndexedDB → SQLite` (ou qualquer backend) alterando apenas o adapter — sem impacto em `api.ts`, `DataContext`, services ou UI.

> [!IMPORTANT] > **Este TechSpec NÃO instala SQLite.** Ele cria a camada de abstração e refatora os consumidores para usá-la, deixando o código 100% pronto para conectar qualquer adapter futuro (sql.js WASM, Tauri SQLite, backend REST, etc.).

## Escopo

- **Domínios afetados:** Infraestrutura de persistência (cross-cutting)
- **Camadas afetadas:** `services/infrastructure` apenas
- **Risco de boundary:** Sim — mudança estrutural na camada mais baixa. Exige ADR.
- **Don't Touch list:** `api.ts` e `storageService.ts` permanecem **inalterados**.
- **Breaking changes:** Zero. Todas as APIs públicas mantêm assinaturas idênticas.

---

## Arquitetura Antes vs Depois

### Antes (acoplamento direto)

```
DataContext → api.ts → loadData.ts → indexedDbService (hard-coded)
                       autoBackupService → indexedDbService (hard-coded)
```

### Depois (PersistencePort)

```
DataContext → api.ts → loadData.ts → PersistencePort (interface)
                       autoBackupService ──┘       ↓
                                        IndexedDbPersistenceAdapter → indexedDbService
                                        [futuro] SqlitePersistenceAdapter → sql.js / Tauri
```

---

## Sub-tarefas

### 1. Criar PersistencePort (interface de contrato) — @backend-specialist

#### [NEW] `src/services/infrastructure/persistence/PersistencePort.ts`

Interface TypeScript com todas as operações de persistência usadas pelo app:

```typescript
interface PersistencePort {
  // Lifecycle
  initialize(): Promise<void>;
  isAvailable(): boolean;

  // Snapshot (full AppData read/write)
  readSnapshot<T>(): Promise<T | null>;
  writeSnapshot<T>(snapshot: T): Promise<void>;
  clearSnapshot(): Promise<void>;

  // Entity state (per-entity read/write)
  readEntityState<T>(entities?: string[]): Promise<Partial<T> | null>;
  writeEntityState(state: Record<string, unknown>): Promise<void>;

  // UI Preferences
  readPreference<T>(key: string): Promise<T | null>;
  writePreference<T>(key: string, value: T): Promise<void>;
  removePreference(key: string): Promise<void>;

  // Backups
  listBackups(): Promise<BackupMetadata[]>;
  writeBackup<T>(payload: T, options: WriteBackupOptions): Promise<BackupMetadata>;
  readBackup<T>(id: string): Promise<{ payload: T } | null>;
  clearBackups(): Promise<void>;

  // Counter reservation (atomic)
  reserveGlobalIdentifier(): Promise<CounterReservationResult>;

  // Storage quota
  estimateStorageUsage(): Promise<StorageEstimate | null>;
}
```

- **Critério:** Arquivo compila sem erros. Interface cobre 100% dos call-sites de `indexedDbService` em `loadData.ts` e `autoBackupService.ts`.

---

### 2. Criar IndexedDbPersistenceAdapter — @backend-specialist

#### [NEW] `src/services/infrastructure/persistence/IndexedDbPersistenceAdapter.ts`

Implementa `PersistencePort` delegando para `indexedDbService` existente:

```typescript
class IndexedDbPersistenceAdapter implements PersistencePort {
  async readSnapshot<T>() {
    return indexedDbService.readSnapshot<T>();
  }
  async writeSnapshot<T>(s: T) {
    return indexedDbService.writeSnapshot(s);
  }
  // ... demais métodos delegando 1:1
}
```

- **Critério:** Todas as operações delegam para `indexedDbService` sem lógica nova.

---

### 3. Criar factory + barrel — @backend-specialist

#### [NEW] `src/services/infrastructure/persistence/createPersistenceAdapter.ts`

Factory que retorna o adapter ativo:

```typescript
let cachedAdapter: PersistencePort | null = null;

export function createPersistenceAdapter(): PersistencePort {
  if (!cachedAdapter) {
    cachedAdapter = new IndexedDbPersistenceAdapter();
  }
  return cachedAdapter;
}
```

#### [NEW] `src/services/infrastructure/persistence/index.ts`

Barrel re-exportando tipos e factory.

- **Critério:** `import { createPersistenceAdapter, PersistencePort } from './persistence'` funciona.

---

### 4. Refatorar loadData.ts — @backend-specialist

#### [MODIFY] `src/services/infrastructure/loadData.ts`

**Mudanças:**

1. Substituir `import { indexedDbService }` por `import { createPersistenceAdapter }`.
2. Criar `const persistence = createPersistenceAdapter();` no topo do módulo.
3. Trocar TODAS as chamadas `indexedDbService.X()` por `persistence.X()`:
   - `initializeDataStore()`: `indexedDbService.readSnapshot` → `persistence.readSnapshot`
   - `initializeDataStore()`: `indexedDbService.readEntityState` → `persistence.readEntityState`
   - `queuePersistSnapshot()`: `indexedDbService.writeSnapshot` → `persistence.writeSnapshot`
   - `queuePersistSnapshot()`: `indexedDbService.writeEntityState` → `persistence.writeEntityState`
   - `refreshFromPersistentSnapshot()`: `indexedDbService.readSnapshot` → `persistence.readSnapshot`
   - `reserveGlobalIdentifierCounter()`: `indexedDbService.reserveGlobalIdentifier` → `persistence.reserveGlobalIdentifier`
   - `resetPersistentDataAndNotify()`: `indexedDbService.clearSnapshot` → `persistence.clearSnapshot`

**O que NÃO muda:**

- Assinaturas de `loadData()`, `updateData()`, `initializeDataStore()`, `reserveGlobalIdentifierCounter()`, `resetPersistentDataAndNotify()`, `invalidateCacheAndNotify()` — todas idênticas.
- Lógica de normalização, migrations, seed, BroadcastChannel — intacta.

- **Critério:** `npm run typecheck` verde. Todos os testes existentes passam. Zero mudanças em consumidores.

---

### 5. Refatorar autoBackupService.ts — @backend-specialist

#### [MODIFY] `src/services/infrastructure/autoBackupService.ts`

**Mudanças:**

1. Substituir `import { indexedDbService }` por `import { createPersistenceAdapter }`.
2. Trocar chamadas diretas:
   - `indexedDbService.listAutomaticBackups()` → `persistence.listBackups()`
   - `indexedDbService.writeAutomaticBackup()` → `persistence.writeBackup()`
   - `indexedDbService.readAutomaticBackup()` → `persistence.readBackup()`
   - `indexedDbService.clearAutomaticBackups()` → `persistence.clearBackups()`

- **Critério:** Typecheck verde, testes existentes passam.

---

### 6. Refatorar storageQuotaService.ts — @backend-specialist

#### [MODIFY] `src/services/infrastructure/storageQuotaService.ts`

**Mudanças:**

- Se houver chamadas diretas a `indexedDbService`, substituir por `persistence`.
- Se já usa Navigator.storage, pode não precisar de mudanças.

- **Critério:** Typecheck verde, testes existentes passam.

---

### 7. Documentação e decisões — @project-planner

#### [MODIFY] `DECISIONS-active.md`

Nova entrada ADR:

```
### 2026-02-23 — PersistencePort: Abstração de persistência para SQLite readiness
- Contexto: loadData.ts e autoBackupService acoplados a indexedDbService.
- Decisão: introduzir PersistencePort interface + IndexedDbPersistenceAdapter.
- Consequência: troca de backend (SQLite) exige apenas novo adapter.
- Reversão: remover camada de abstração e restaurar imports diretos.
```

#### [MODIFY] `NEXT.md`

Atualizar estado da sessão com o trabalho realizado.

---

## Pontos de Contato (Mapa de Arquivos)

| Ação    | Arquivo                                                                  |
| ------- | ------------------------------------------------------------------------ |
| **NEW** | `src/services/infrastructure/persistence/PersistencePort.ts`             |
| **NEW** | `src/services/infrastructure/persistence/IndexedDbPersistenceAdapter.ts` |
| **NEW** | `src/services/infrastructure/persistence/createPersistenceAdapter.ts`    |
| **NEW** | `src/services/infrastructure/persistence/index.ts`                       |
| MODIFY  | `src/services/infrastructure/loadData.ts`                                |
| MODIFY  | `src/services/infrastructure/autoBackupService.ts`                       |
| MODIFY  | `src/services/infrastructure/storageQuotaService.ts` (se aplicável)      |
| MODIFY  | `DECISIONS-active.md`                                                    |
| MODIFY  | `NEXT.md`                                                                |
| ~~NO~~  | `src/services/infrastructure/api.ts` (Don't Touch ✅)                    |
| ~~NO~~  | `src/services/infrastructure/storageService.ts` (Don't Touch ✅)         |
| ~~NO~~  | `src/context/DataContext.tsx` (zero impacto ✅)                          |
| ~~NO~~  | Todos os services de domínio (zero impacto ✅)                           |
| ~~NO~~  | Todos os components/pages (zero impacto ✅)                              |

**Total: 4 arquivos novos + 4 arquivos modificados**

---

## Impacto de Dependências

- **Novas dependências npm:** Nenhuma.
- **Dependências internas criadas:**
  - `persistence/PersistencePort.ts` ← importado por `IndexedDbPersistenceAdapter`, `createPersistenceAdapter`
  - `persistence/IndexedDbPersistenceAdapter.ts` ← importa `indexedDbService` (existente)
  - `persistence/createPersistenceAdapter.ts` ← importa `IndexedDbPersistenceAdapter`
  - `loadData.ts` ← importa `createPersistenceAdapter` (substitui import de `indexedDbService`)
  - `autoBackupService.ts` ← importa `createPersistenceAdapter` (substitui import de `indexedDbService`)

---

## Verificação Final

### Automated Tests

```bash
# Gate canônico (all 8 gates)
npm run verify

# Testes existentes que validam a camada de persistência:
# - src/services/infrastructure/indexedDbService.test.ts (5 test cases)
# - src/services/infrastructure/storageQuotaService.test.ts
# - src/services/infrastructure/storageService.usage.test.ts
npx vitest run src/services/infrastructure/
```

### Manual Verification

1. Executar `npm run dev` → abrir a aplicação → navegar por páginas → verificar que dados carregam normalmente.
2. Testar import/export JSON (Configurações → Exportar, depois Importar arquivo).
3. Verificar que o app cria backups automáticos (aguardar ou triggerar reload).

---

## Contratos Afetados

- [ ] `docs/data-contracts/types-contracts.md` — novo PersistencePort type
- [ ] `DECISIONS-active.md` — ADR obrigatório (mudança estrutural)
- [ ] `NEXT.md` — atualização de sessão
- [ ] `src/test/fixtures/*` — sem impacto (fixtures de domínio, não de infraestrutura)
- [ ] `src/test/golden-fixtures.test.ts` — sem impacto
