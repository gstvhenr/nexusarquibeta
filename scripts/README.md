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

## validation scripts

- `scripts/check-file-lines.mjs`:
  - valida limites de linhas por camada (`pages`, `components`, `services`);
  - usa baseline versionado em `scripts/file-line-baseline.json` para bloquear regressões;
  - suporta ratchet incremental do baseline:
    - `npm run check:lines:ratchet:check` (falha se baseline puder ser reduzido);
    - `npm run check:lines:ratchet` (atualiza baseline para menor valor observado e remove entradas obsoletas).
- `scripts/run-self-review.mjs`:
  - executa checks automáticos de self-review complementar (runner `verify`, ordem canônica em `verify:raw`, cobertura gerada e `as any` novo).
  - valida também se o baseline de linhas está ratchetado.
- `scripts/check-governance-docs.mjs`:
  - valida anti-drift de governança ativa (`DECISIONS-active.md` como referência vigente);
  - bloqueia duplicação de comandos oficiais fora de `AGENTS.md` em documentos ativos;
  - mede bytes de governança ativa e aplica budget máximo.
