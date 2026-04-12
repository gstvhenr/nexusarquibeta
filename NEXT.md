# NEXT.md

## Regra de archival

- Quando este arquivo ultrapassar ~100 linhas, mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.

## Último estado conhecido (2026-04-12)

Foi gerado um commit neutro adicional apenas para forçar um novo ciclo de deploy no GitHub/Vercel, sem alteração funcional do app. A mudança aplicada no código foi um comentário HTML inofensivo em `index.html`, mantendo o estado técnico igual ao da sessão anterior. O estado atual agora é:

- o branch `main` continua alinhado com os remotos GitHub conectados;
- o código funcional segue inalterado em relação ao diagnóstico anterior de Firebase/Vercel;
- existe um novo diff mínimo apenas para disparar um redeploy limpo do projeto publicado.

### Checklist desta sessão

- [x] Criado diff mínimo e neutro em `index.html`.
- [x] Mantido o escopo estritamente não funcional.
- [ ] Commitar e publicar o novo snapshot no GitHub para disparar o redeploy.

### Próximo passo exato

1. Criar commit do diff neutro.
2. Publicar em `upstream/main` e `origin/main`.
3. Acompanhar o novo deploy no Vercel.

### Bloqueios e dúvidas

- Nenhum bloqueio local. O efeito esperado desta sessão é apenas operacional: produzir um novo deployment.

---

## Último estado conhecido (2026-04-12)

Validação local em `http://localhost:3001` confirmou que o app já consegue inicializar Firebase e abrir o fluxo Google com as `VITE_FIREBASE_*` corretas. A revisão do lote anterior encontrou um ponto cego específico do Vercel: a versão commitada de `firebaseConfig.ts` ainda usava `import.meta.env[key]`, o que quebra o build estático do Vite mesmo quando as envs existem no provider. Na sequência desta sessão, o erro persistente em produção foi rastreado até um problema operacional adicional: o commit corrigido (`b093ce1`) tinha sido publicado apenas em `upstream/main`, enquanto `origin/main` ainda estava atrás em `e8a9f0b`. Como o Vercel pode estar vinculado ao fork `gstvhenr/nexusarquibeta`, o deploy continuava servindo um bundle antigo. O estado atual agora é:

- `firebaseConfig.ts` foi corrigido para usar um mapa explícito de `import.meta.env.VITE_*`, preservando compatibilidade com Vercel estático e com o runtime injetado por `server.mjs`;
- entrou um teste de regressão (`firebaseConfig.test.ts`) para impedir retorno do acesso dinâmico inválido;
- `README.md` passou a separar claramente o contrato de Cloud Run/container do contrato de Vercel estático;
- `.gitignore` passou a cobrir `.env.*`, mantendo `!.env.example`, para evitar commit acidental de `.env.production`;
- `origin/main` e `upstream/main` agora estão alinhados no mesmo commit `b093ce1`, eliminando a divergência entre os dois repositórios GitHub candidatos a alimentar o Vercel.

### Checklist desta sessão

- [x] Confirmado `localhost:3001` como host válido para o fluxo de autenticação Google.
- [x] Reproduzido bootstrap Firebase funcional no browser local autorizado.
- [x] Identificado e corrigido o ponto cego do build estático do Vite/Vercel em `firebaseConfig.ts`.
- [x] Atualizada a documentação operacional do split Cloud Run vs Vercel.
- [x] Confirmado que `origin/main` ainda estava sem `b093ce1` e publicado o mesmo commit também no fork `gstvhenr/nexusarquibeta`.

### Próximo passo exato

1. Confirmar no Vercel qual repositório GitHub está vinculado ao projeto (`gstvhenr/nexusarquibeta` ou `rafaelmunaroarquitetura/nexusarqui`) e verificar se o último deploy já aponta para `b093ce1`.
2. Confirmar no Vercel que `VITE_PERSISTENCE_ADAPTER` e todas as `VITE_FIREBASE_*` estão definidas em `Production` e `Preview`.
3. Forçar novo deploy no Vercel e validar no ambiente publicado a ausência da mensagem “Firebase indisponível”, além do fluxo de login Google e dos assets/binários em Firebase Storage.

### Bloqueios e dúvidas

- O ponto pendente agora é exclusivamente **externo** ao repositório: o Vercel precisa rebuildar o projeto correto com as envs corretas. Sem isso, o site pode continuar servindo um bundle antigo ou um build sem `VITE_FIREBASE_*`.

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
