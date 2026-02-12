# Etapa 5 — Verificação (2026-02-12)

## 5.1 Checklist de verificação (Antigravity / agent runtime)

### 1) Arquivos injetados automaticamente no contexto

Status: **parcialmente verificado**.

- Evidência no runtime atual: as instruções de `AGENTS.md` foram carregadas no contexto de sessão.
- Pendente em Antigravity (teste limpo): iniciar conversa nova sem repetir regra e validar aderência automática.

Teste sugerido:

1. Inserir regra única em `AGENTS.md` (ex.: sempre rodar gate canônico antes de finalizar).
2. Abrir sessão limpa.
3. Solicitar alteração simples e verificar se o agente executa o gate sem lembrete.

### 2) Suporte a regras por projeto (`.cursorrules`, `.agent/rules`)

Status: **não conclusivo no runtime atual**.

- Regras existem e foram reforçadas no repositório.
- Falta evidência A/B em sessão limpa do Antigravity comparando regra única em `.cursorrules` vs `AGENTS.md`.

### 3) Acesso a terminal/comandos

Status: **confirmado no runtime atual**.

Evidências:

- `npm -v` -> `10.9.3`
- `node -v` -> `v22.20.0`
- `npm run typecheck` -> verde

### 4) Ver diff e trabalhar em PR pequeno

Status: **parcialmente verificado**.

- O agente editou arquivos individuais e executou gates.
- O repositório local está sem commit base (arquivos ainda não commitados), então o fluxo de PR/diff incremental precisa de baseline Git para validação completa.

## 5.2 Repo — validações objetivas

### Dev server (`npm run dev`)

- Resultado real: porta `3000` ocupada; Vite subiu em `http://localhost:3001/`.
- Observação: `vite.config.ts` define `server.port = 3000`; fallback para porta livre ocorre automaticamente quando a porta está em uso.

### Build (`npm run build`)

- Resultado: **verde**.

### Lint e typecheck (`npm run lint`, `npm run typecheck`)

- Resultado: **verdes**.
- Conclusão: não há evidência de “falso verde” nestes comandos atualmente.

### Presença de testes (`find src -name "*.test.*"` equivalente)

Comando executado: `rg --files -g *.test.* -g *.spec.* src`

Resultado:

- `src/utils/projectFinancials.test.ts`
- `src/utils/formatters.test.ts`
- `src/test/golden-fixtures.test.ts`
- `src/services/financeService.test.ts`
- `src/services/dashboardService.test.ts`
- `src/services/clientService.test.ts`

### Maiores monólitos em `src/pages/*.tsx` (equivalente a `wc -l`)

Comando executado (linhas não vazias): `rg -c . -g *.tsx src\pages`

Top arquivos:

1. `src/pages/ClientesPage.tsx` -> 834
2. `src/pages/ProjetoDetalhesPageContent.tsx` -> 733
3. `src/pages/FornecedoresPage.tsx` -> 729
4. `src/pages/ClienteDetalhesPage.tsx` -> 648
5. `src/pages/PropostaDetalhesPage.tsx` -> 634
6. `src/pages/OrcamentosPage.tsx` -> 513
7. `src/pages/GestaoMarketingPage.tsx` -> 487

### `ls -la` na raiz (equivalente)

Comando executado: `dir /a`

- Nenhum arquivo “suspeito” evidente na raiz.
- Estrutura principal esperada presente: `.agent`, `.github`, `.husky`, `docs`, `scripts`, `src`, contratos e políticas na raiz.

## 5.3 Perguntas mínimas para destravar decisões

Decisões adotadas para modo agent-first:

1. Host oficial: **GitHub** (Actions + branch protection + Dependabot/CodeQL).
2. Hooks: **manter Husky + lint-staged** (stack Node-only).
3. Arquitetura: **decompor hotspots primeiro** e migrar para `src/features/*` incrementalmente por domínio.
4. Fluxo crítico inicial (E2E smoke): **cliente -> proposta -> conversão para projeto -> financeiro (recebível) -> agenda**.
5. Execução no Antigravity: **agente executa comandos quando suportado**; se bloqueado, operador executa e anexa output para evidência.

Referências:

- `docs/adr/0007-agent-first-operating-decisions.md`
- `docs/checklists/e2e-smoke-critical-flow.md`
