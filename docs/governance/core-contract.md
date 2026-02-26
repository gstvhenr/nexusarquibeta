# Core Governance Contract

## Objetivo

Definir governança ativa mínima para operação agent-first com baixo custo de manutenção.

## Fonte de verdade

- `AGENTS.md`: comandos oficiais, gates, regras duras e DoD.
- `DECISIONS-active.md`: decisões vigentes.
- `docs/changelog/decisions-archive.md`: decisões superseded.

## Taxonomia de documentação

### Tier ativo (manutenção diária)

- `AGENTS.md`
- `CONTEXT.md`
- `NEXT.md`
- `DECISIONS-active.md`
- `ARCHITECTURE.md`
- `README.md`
- `CONTRIBUTING.md`
- `TESTING.md`
- `SECURITY.md`
- `TASKS.md`
- `docs/process/*`
- `docs/data-contracts/types-contracts.md`
- `.agent/README.md`
- `.agent/lessons-learned.md`
- `.agent/checklists/self-review-checklist.md`
- `.agent/checklists/domain-refactor-checklist.md`
- `.agent/workflows/default-task-flow.md`
- `.agent/workflows/verify-first.md`

### Tier arquivado (fora do fluxo padrão)

- `.agent/archive/prompts-v1/**`
- `.agent/archive/workflows/**`
- `docs/changelog/**`

## Regras anti-drift

- O arquivo legado de decisões é proibido fora de histórico arquivado.
- Lista de comandos oficiais não deve ser duplicada fora de `AGENTS.md`.
- Mudança estrutural exige atualização de `DECISIONS-active.md` e/ou ADR.

## Ownership e atualização

- Toda sessão que alterar governança deve atualizar `NEXT.md`.
- Toda alteração em comandos/gates deve atualizar `AGENTS.md` na mesma entrega.
- Toda alteração relevante de processo deve refletir este arquivo.

## Métrica operacional

- Budget de governança ativa: `<= 150435` bytes.
- Enforcement automático via check documental oficial definido em `AGENTS.md`.
