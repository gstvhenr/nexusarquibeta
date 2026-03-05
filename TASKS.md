# TASKS.md

## P0

- [x] Configurar remoto oficial no GitHub e publicar branch `main`.

  - Escopo: conectar remoto e publicar baseline validado.
  - Evidência: `origin=https://github.com/gstvhenr/nexus_arqui.git` + push de `main` concluído.
  - Risco: baixo (concluído).

- [ ] Ativar branch protection + required checks no GitHub.

  - Escopo: habilitar regras mínimas de merge na `main`.
  - Arquivos-alvo: documentação de processo (se necessário).
  - Risco: médio (governança e CI).

- [ ] Validar aderência automática do Antigravity ao `AGENTS.md` em sessão limpa (A/B com `.cursorrules`).

  - Escopo: experimento curto com evidência em `docs/audits/`.
  - Arquivos-alvo: `docs/audits/*`, `DECISIONS-active.md` (se houver descoberta estrutural).
  - Risco: médio (impacta previsibilidade do fluxo agent-first).

- [ ] Executar checklist do fluxo crítico E2E smoke.
  - Escopo: `docs/checklists/e2e-smoke-critical-flow.md` + registro de evidência.
  - Arquivos-alvo: `docs/audits/*`.
  - Risco: alto (cobre regressão ponta-a-ponta).

## P1

- [ ] Continuar fragmentação de `src/frontend/types.ts` para `src/frontend/types/*` por domínio.

  - Escopo: migração incremental com compatibilidade.
  - Risco: médio/alto.

- [ ] Refatorar próximo hotspot de página para reduzir acoplamento.
  - Escopo: 1 página por vez.
  - Risco: médio.

## P2

- [ ] Incrementar checklists por domínio em `.agent/checklists/`.
