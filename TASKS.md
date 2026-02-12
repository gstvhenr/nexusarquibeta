# TASKS.md

## P0

- [ ] Configurar remoto oficial no GitHub e ativar branch protection + required checks.

  - Escopo: conectar remoto e ativar regras mínimas de merge.
  - Arquivos-alvo: documentação de processo (se necessário).
  - Risco: médio (governança e CI).

- [ ] Validar aderência automática do Antigravity ao `AGENTS.md` em sessão limpa (A/B com `.cursorrules`).

  - Escopo: experimento curto com evidência em `docs/audits/`.
  - Arquivos-alvo: `docs/audits/*`, `DECISIONS.md` (se houver descoberta estrutural).
  - Risco: médio (impacta previsibilidade do fluxo agent-first).

- [ ] Executar checklist do fluxo crítico E2E smoke.
  - Escopo: `docs/checklists/e2e-smoke-critical-flow.md` + registro de evidência.
  - Arquivos-alvo: `docs/audits/*`.
  - Risco: alto (cobre regressão ponta-a-ponta).

## P1

- [ ] Continuar fragmentação de `src/types.ts` para `src/types/*` por domínio.

  - Escopo: migração incremental com compatibilidade.
  - Risco: médio/alto.

- [ ] Refatorar próximo hotspot de página para reduzir acoplamento.
  - Escopo: 1 página por vez.
  - Risco: médio.

## P2

- [ ] Incrementar checklists por domínio em `.agent/checklists/`.
