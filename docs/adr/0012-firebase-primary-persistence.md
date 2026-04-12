# ADR 0012 — Firebase como persistência primária

## Status

Aceito em 2026-04-12.

## Contexto

O Nexus-Arqui vinha operando com IndexedDB local e Google Drive como camada principal de nuvem. Esse desenho adicionava complexidade operacional, dependia de múltiplos modos de acesso (API e pasta local) e mantinha regras de sincronização específicas do Drive espalhadas na infraestrutura e na UI.

## Decisão

1. Firestore passa a ser a camada primária de persistência em nuvem.
2. Firebase Auth com provedor Google passa a ser a única fonte de autenticação do app.
3. Firebase Storage passa a armazenar binários gerenciados:
   - documentos internos;
   - anexos de agenda;
   - avatares de clientes;
   - backups JSON grandes.
4. IndexedDB continua obrigatório como cache local/offline:
   - cache do próprio Firestore via `enableIndexedDbPersistence()` com fallback multi-tab;
   - `IndexedDbPersistenceAdapter` como fallback explícito quando Firebase não estiver configurado.
5. O stack de Google Drive deixa de existir no runtime final.

## Modelo adotado

- `users/{uid}`: metadados do workspace.
- `users/{uid}/domains/{domain}`: metadados do domínio e payload de valores escalares.
- `users/{uid}/domains/{domain}/items/{recordId}`: coleções identificáveis por `id`.
- `users/{uid}/domains/documentStorage/nodes/{nodeId}`: árvore documental normalizada.
- `users/{uid}/preferences/ui`: preferências sincronizadas.
- `users/{uid}/counters/globalIdentifier`: reserva transacional de blocos do contador global.
- `users/{uid}/backups/{backupId}`: metadados de backup.
- Storage:
  - `users/{uid}/documents/**`
  - `users/{uid}/attachments/**`
  - `users/{uid}/avatars/**`
  - `users/{uid}/backups/**`

## Estratégia de cutover

1. Exportar um snapshot completo do estado legado antes da troca final.
2. Publicar esse snapshot como backup versionado em `users/{uid}/backups/{backupId}.json`.
3. Importar dados escalares e coleções identificáveis para Firestore mantendo os `id`s existentes.
4. Migrar binários embutidos:
   - `DocumentSource.content` com `data:` deve ser enviado para `users/{uid}/documents/**`;
   - `Client.avatarUrl` em `data:` deve ser enviado para `users/{uid}/avatars/**`;
   - anexos antigos devem ser copiados para `users/{uid}/attachments/**`.
5. Marcar o estado de migração em `users/{uid}/meta/migration` com:
   - `backupId`
   - `startedAt`
   - `completedAt`
   - `lastError`
   - `schemaVersion`
6. Só remover o stack legado do runtime depois de:
   - backup confirmado;
   - contagem de registros validada;
   - abertura de arquivos binários validada;
   - leitura/escrita em duas abas validada.

## Consequências

- A sincronização deixa de depender de artefatos `_meta.json`, pasta local e API do Drive.
- O runtime fica mais simples: uma única pilha para auth, realtime e arquivos.
- A resolução de conflitos continua incremental e baseada em merge por registro com tombstones.
- Dados binários deixam de ser persistidos como base64 em Firestore por padrão.

## Reversão

1. Restaurar o stack de Google Drive e os componentes/UI removidos.
2. Reverter `createPersistenceAdapter.ts` para a seleção anterior.
3. Restaurar `googleDriveService`, `driveSyncEngine`, `driveFileService` e contratos derivados.
