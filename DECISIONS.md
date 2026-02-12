# DECISIONS.md

Registro resumido de decisões arquiteturais/processuais.

## Regra

- Mudança estrutural relevante exige registro aqui e/ou ADR em `docs/adr/`.
- Cada entrada deve apontar contexto, decisão, consequência e como reverter.

## Entradas

### 2026-02-12 — AGENTS como fonte primária

- Contexto: sessões de agente sem memória estável.
- Decisão: `AGENTS.md` é contrato primário versionado.
- Consequência: previsibilidade maior entre sessões/ferramentas.
- Reversão: migrar contrato primário para outro padrão e atualizar docs.
- Referência: `docs/adr/0001-agent-source-of-truth.md`

### 2026-02-12 — Comando canônico de pronto

- Contexto: validação inconsistente gerava falso-verde.
- Decisão: `npm run verify` como gate único.
- Consequência: CI/local padronizados.
- Reversão: alterar pipeline e atualizar AGENTS/README/CONTRIBUTING.
- Referência: `docs/adr/0002-canonical-verify-gate.md`

### 2026-02-12 — Memória zero por handoff explícito

- Contexto: perda de continuidade entre sessões.
- Decisão: atualizar `NEXT.md` no fim de toda sessão.
- Consequência: retomada objetiva e menor custo de contexto.
- Reversão: adotar outro mecanismo de handoff versionado.
- Referência: `docs/adr/0003-memory-zero-handoff.md`

### 2026-02-12 — Workflow repetível de agente (3.2)

- Contexto: execução variava por sessão e gerava inconsistência.
- Decisão: adotar fluxo fixo de tarefa com baseline, planejamento curto, diffs pequenos, gates, self-review e handoff.
- Consequência: maior previsibilidade operacional e menos regressões.
- Reversão: simplificar processo para fluxo ad-hoc.
- Referência: `docs/adr/0004-repeatable-agent-workflow.md`

### 2026-02-12 — Pre-commit + gate de segurança crítica (3.3)

- Contexto: faltavam guardrails locais de commit e enforcement de segurança crítica.
- Decisão: Husky + lint-staged no pre-commit e `npm run security:check` no CI.
- Consequência: feedback mais cedo e bloqueio de vulnerabilidade crítica.
- Reversão: remover hooks locais e manter apenas CI.
- Referência: `docs/adr/0005-precommit-and-security-gates.md`

### 2026-02-12 — Controles anti-drift e contratos canônicos (3.4)

- Contexto: alucinação/drift em sessões sem memória e risco de mudança silenciosa de shape.
- Decisão: centralizar comandos em `AGENTS.md`, padronizar JSDoc de services públicos e manter fixtures/golden tests canônicos por domínio.
- Consequência: menor divergência documental, contratos mais explícitos e detecção precoce de regressões de shape.
- Reversão: voltar para validação ad-hoc sem fixtures canônicas.
- Referência: `docs/adr/0006-agent-drift-controls-and-golden-contracts.md`

### 2026-02-12 — Diretrizes operacionais agent-first (5.3)

- Contexto: faltavam decisões executivas para fechar host, hooks, estratégia de modularização, fluxo crítico e política de execução no Antigravity.
- Decisão: adotar GitHub como host alvo, manter Husky + lint-staged, priorizar decomposição de páginas antes de `src/features/*`, fixar smoke crítico ponta-a-ponta e exigir evidência de comandos executados.
- Consequência: governança técnica mais previsível e menor risco de regressão silenciosa em sessões de agente.
- Reversão: trocar host/hook/estratégia mediante ADR nova e atualização de contratos operacionais.
- Referência: `docs/adr/0007-agent-first-operating-decisions.md`
