# Scripts

## verify wrappers

- Windows: `scripts/verify.cmd`
- Unix: `scripts/verify.sh`

Ambos chamam `npm run verify`.

## verify loop runner

- `scripts/verify-loop.mjs`:
  - executa os 8 gates canônicos em ordem fixa com `fail-fast`;
  - emite status estruturado por etapa (`[VERIFY][GATE][START|PASS|FAIL]`);
  - gera relatório em `.agent/tmp/verify-loop-report.json`;
  - quando falha, imprime hint interpretável e próximo passo do loop iterativo.

## baseline wrappers

- Windows: `scripts/baseline.cmd`
- Unix: `scripts/baseline.sh`

Ambos executam `git status --short` + `npm run typecheck`.

## depcruise graph prerequisite

- `npm run depcruise:graph` usa o binário de sistema `dot` (Graphviz) para gerar `dependency-graph.svg`.
- Se `dot` não estiver disponível no PATH, instale o Graphviz no sistema operacional antes de executar o script.

## validation scripts

- `scripts/check-file-lines.mjs`:
  - valida limites de linhas por camada (`pages`, `components`, `services`);
  - usa baseline versionado em `scripts/file-line-baseline.json` para bloquear regressões;
  - suporta ratchet incremental do baseline:
    - `npm run check:lines:ratchet:check` (falha se baseline puder ser reduzido);
    - `npm run check:lines:ratchet` (atualiza baseline para menor valor observado e remove entradas obsoletas).
- `scripts/check-pollution-ratchet.mjs`:
  - executa `knip` em JSON e compara com baseline versionado em `scripts/pollution-baseline.json`;
  - categorias monitoradas: `unused files`, `unlisted binaries`, `unused exports`, `unused exported types`;
  - comandos:
    - `npm run check:pollution` (falha apenas em regressão fora do baseline);
    - `npm run check:pollution:ratchet:check` (falha se baseline puder ser apertado);
    - `npm run check:pollution:ratchet` (atualiza baseline para o estado atual).
- `scripts/generate-inventory.mjs`:
  - gera `.agent/memory/project-inventory.md` para consulta de reuso por agentes;
  - mapeia exports em hooks, services, componentes UI, utils e types;
  - comando: `npm run inventory:generate`.
- `scripts/run-self-review.mjs`:
  - executa checks automáticos de self-review complementar (runner `verify`, ordem canônica em `verify:raw`, cobertura gerada e higiene de diff);
  - valida baseline de linhas ratchetado e baseline de poluição ratchetado;
  - exige inventário `.agent/memory/project-inventory.md` existente.
- `scripts/check-governance-docs.mjs`:
  - valida anti-drift de governança ativa (`DECISIONS-active.md` como referência vigente);
  - bloqueia duplicação de comandos oficiais fora de `AGENTS.md` em documentos ativos;
  - mede bytes de governança ativa e aplica budget máximo.
