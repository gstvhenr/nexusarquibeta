# ADR 0007 — Agent-First Operating Decisions

## Context

Etapa 5 apontou pendências decisórias que bloqueavam padronização operacional: host remoto, padrão de hooks, ordem de modularização, fluxo crítico de smoke e política de execução no Antigravity.

## Decision

- Definir GitHub como host alvo oficial do repositório.
- Manter Husky + lint-staged como padrão de hook local.
- Modularizar em duas fases: decomposição dos hotspots atuais e, depois, migração incremental para `src/features/*`.
- Fixar fluxo crítico de smoke inicial: cliente -> proposta -> conversão para projeto -> financeiro (recebível) -> agenda.
- Exigir execução de comandos com evidência objetiva (ou execução pelo operador com output anexado quando o ambiente bloquear o agente).

## Alternatives Considered

- Host alternativo sem integração nativa com Actions/Dependabot/CodeQL.
- Migrar para `pre-commit` sem necessidade real em stack Node-only.
- Migrar direto para `src/features/*` antes de reduzir monólitos atuais.
- Definir smoke apenas de UI sem cobrir fluxo de negócio ponta-a-ponta.

## Consequences

- Melhora da previsibilidade do fluxo agent-first.
- Menor fricção de onboarding para agentes e humanos.
- Decisões explícitas para priorização de backlog técnico.

## Rollback

Criar ADR substituta alterando um ou mais itens (host/hooks/arquitetura/smoke) e atualizar `AGENTS.md`, `NEXT.md` e checklist correspondente.

## References

- `AGENTS.md`
- `docs/audits/etapa5-verificacao-2026-02-12.md`
- `docs/process/agent-workflow.md`
