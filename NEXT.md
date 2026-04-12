# NEXT.md

## Regra de archival

- Quando este arquivo ultrapassar ~100 linhas, mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.

## Último estado conhecido (2026-04-12)

Sincronização com o repositório remoto concluída e limpeza do log de sessão (`NEXT.md`). As métricas de governança estavam quebrando pipelines anteriores pelo limite de tamanho total de documento, então as sessões de março/abril anteriores foram arquivadas em `docs/changelog/session-log-2026-04.md`.

### Checklist desta sessão

- [x] Sincronizado repositório local com remotos (`git push origin main`, `git push upstream main`).
- [x] Arquivado log histórico para enxugar o orçamento de governança de documentos (`check:docs:governance`).
- [x] Constatada árvore limpa ("working tree clean") e pronta para entrega externa.

### Próximo passo exato

1. Aguardar o redeploy automático do provedor (Vercel) conectado ao GitHub para que levante a nova revisão.
2. Confirmar no ambiente remoto que as `VITE_FIREBASE_*` estão perfeitamente definidas no painel de configurações do ambiente.
3. Validar no navegador publicado que o app inicia de forma estável, autenticação ocorre como devido, e que as imagens/avatares funcionam atreladas ao Firebase Storage sem falhas de persistência legadas.

### Bloqueios e dúvidas

- Temos um ponto pendente exclusivamente **externo** ao repositório: se as variáveis `VITE_FIREBASE_*` não estiverem expostas pelo provedor (Vercel), a aplicação não reativará o Firebase apropriadamente no ambiente remoto.

---

## Último estado conhecido (2026-04-12)

Erro publicado de configuração do app e falha do SQLite WASM diagnosticados e corrigidos. O problema combinava duas causas: o browser publicado dependia apenas de envs embutidas no build para inicializar Firebase, e o caminho SQLite ainda tentava acessar a tabela inexistente `document_storage`. Na continuidade desta sessão foi confirmado que o fix já estava em `upstream/main` (`796d88e`), mas o repositório `origin/main` ainda estava parado em `497b30f`, mantendo o deploy remoto defasado. O estado atual é:

- `server.mjs` agora injeta `window.__NEXUS_ARQUI_RUNTIME_CONFIG` com `VITE_PERSISTENCE_ADAPTER` e `VITE_FIREBASE_*` no HTML servido em produção;
- `firebaseConfig.ts` e `createPersistenceAdapter.ts` passaram a priorizar a configuração pública de runtime antes de usar `import.meta.env`;
- `sqlite` foi bloqueado em host publicado, com fallback automático para Firebase ou IndexedDB;
- `documentStorage` foi removido do `ENTITY_TABLE_MAP` do SQLite, encerrando a consulta inválida a `document_storage`.
- `origin/main` foi alinhado com `upstream/main`, publicando o commit de correção no GitHub que provavelmente alimenta o deploy.

O contrato anterior de deploy para Cloud Run/Developer Connect continua válido: `Dockerfile` multi-stage, `server.mjs` como runtime HTTP, `.dockerignore`, `gcp-build`, `start` e `engines.node = 22.x`.

### Checklist prévio

- [x] Mapeado o erro remoto de configuração do app e a falha do SQLite WASM.
- [x] Criado `runtimePublicEnv.ts` para leitura de env pública injetada no `window`.
- [x] `server.mjs` atualizado para injetar config no HTML servido.
- [x] `firebaseConfig.ts` atualizado para priorizar env de runtime.
- [x] `createPersistenceAdapter.ts` configurado para fallback fora de sqlite em hosts online.
- [x] Smoke local do runtime com `PORT=8080 npm run start`.
- [x] Commits em `origin` e `upstream` alinhados.
