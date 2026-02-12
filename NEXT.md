# NEXT.md

## Regra de sessão (obrigatória)

- Atualizar este arquivo ao final de toda sessão de agente.
- Se houver mudança estrutural, registrar também em `DECISIONS.md` e/ou ADR.

## Último estado conhecido (2026-02-12)

- Etapas 1, 2, 3, 3.1, 3.2, 3.3 e 3.4 concluídas.
- Fonte de verdade de comandos consolidada em `AGENTS.md`; docs operacionais passaram a referenciar o contrato.
- Services públicos receberam JSDoc com `input -> output` + exemplo.
- Contratos canônicos adicionados com fixtures em `src/test/fixtures/*` e golden tests em `src/test/golden-fixtures.test.ts`.
- Exemplos canônicos para cópia do agente adicionados em `docs/examples/*`.
- Decisão registrada em `DECISIONS.md` + ADR `docs/adr/0006-agent-drift-controls-and-golden-contracts.md`.
- Evidência de gates: sequência oficial de `AGENTS.md` executada com status verde.
- Etapa 5 executada e registrada em `docs/audits/etapa5-verificacao-2026-02-12.md`.
- Validações objetivas 5.2: `typecheck`, `lint`, `build` verdes; dev server confirmou fallback para `http://localhost:3001/` (porta 3000 ocupada).
- Decisões da 5.3 fechadas e formalizadas em `docs/adr/0007-agent-first-operating-decisions.md`.
- Checklist do fluxo crítico publicado em `docs/checklists/e2e-smoke-critical-flow.md`.

## Próximo passo exato

Executar implementação operacional das decisões 5.3:

1. configurar remoto GitHub e branch protection/checks obrigatórios;
2. rodar teste A/B de aderência de regras (`AGENTS.md` vs `.cursorrules`) em conversa limpa;
3. executar o smoke crítico e registrar evidências em `docs/audits/`.

### Critérios

- Registrar resultado em `docs/audits/` com evidências capturadas.
- Atualizar `DECISIONS.md` se houver descoberta estrutural.

## Bloqueios e dúvidas

- Remoto GitHub ainda não configurado neste clone (sem `git remote`).
- Suporte automático a `.agent/workflows` e `.cursorrules` ainda não comprovado em sessão limpa do Antigravity.

## Comandos a rodar

- Usar somente os comandos oficiais definidos em `AGENTS.md` (baseline, gate canônico, segurança e ambiente de desenvolvimento).

## Onde olhar

- `AGENTS.md`
- `docs/process/agent-workflow.md`
- `docs/data-contracts/types-contracts.md`
- `docs/audits/etapa5-verificacao-2026-02-12.md`
- `docs/adr/0007-agent-first-operating-decisions.md`
- `docs/checklists/e2e-smoke-critical-flow.md`
- `src/test/golden-fixtures.test.ts`
- `docs/examples/canonical-service-client.md`
- `docs/examples/canonical-component-client-row.md`
- `.agent/workflows/default-task-flow.md`
