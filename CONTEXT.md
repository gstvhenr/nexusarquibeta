# CONTEXT.md — Mapa de Contexto (Lazy Loading)

Ponteiros hierárquicos para o agente. **Não carregar todos os arquivos no início** — buscar cada camada apenas quando a tarefa exigir.

## Camada 1 — Sempre ler no início da sessão

- `AGENTS.md` — Contrato, comandos oficiais, regras duras, Definition of Done.
- `NEXT.md` — Estado da última sessão + próximo passo exato + bloqueios.
- `CONTEXT.md` (este arquivo) — Índice de ponteiros.
- `.agent/lessons-learned.md` — Erros recorrentes corrigidos e regras negativas promovidas.

## Camada 2 — Ler se a tarefa envolver estes temas

### Arquitetura e estrutura

- `ARCHITECTURE.md` → ponteiro para `docs/architecture.md` e `docs/architecture-screaming.md`.
- `docs/architecture.md` — Detalhes completos de camadas e boundaries.
- `docs/architecture-screaming.md` — Screaming architecture por domínio.

### Contratos e tipos

- `docs/data-contracts/types-contracts.md` — Rastreio de todos os contratos de tipos.
- `src/types/*` — Módulos de domínio (`cashBox.ts`, `financial-series.ts`, `project.ts`, etc.).
- `src/test/fixtures/*` — Fixtures canônicas.

### Decisões e ADRs

- `DECISIONS-active.md` — Registro compacto e vigente de decisões.
- `docs/adr/*` — Architecture Decision Records detalhados (0001 a 0009+).
- `docs/changelog/decisions-archive.md` — Histórico arquivado de decisões superseded.

## Camada 3 — Ler apenas por demanda explícita

### Histórico de sessões

- `docs/changelog/session-log-2026-02.md` — Log completo de sessões de fevereiro/2026.

### Auditorias e checklists

- `docs/audits/*` — Relatórios de auditoria (higiene, estrutura, verificação).
- `docs/checklists/*` — Checklists operacionais (e.g. `e2e-smoke-critical-flow.md`).

### Exemplos e referências

- `docs/examples/*` — Exemplos canônicos para cópia pelo agente.
- `docs/process/*` — Documentação de processo.
- `docs/governance/core-contract.md` — Contrato de governança ativa vs arquivada.

### Workflows e prompts do agente

- `.agent/workflows/*` — Playbooks ativos (11 workflows: `default-task-flow`, `verify-first`, `brainstorm`, `debug`, `enhance`, `orchestrate`, `plan`, `preview`, `status`, `test`, `ui-ux-pro-max`).
- `.agent/archive/*` — Material arquivado (prompts e workflows longos fora do fluxo diário).

**Stack**: React + TypeScript strict + Vite + Vitest + TailwindCSS.
**Storage**: IndexedDB snapshot store (fallback volátil em memória para ambientes sem IDB).
**State**: React Context (`src/context/DataContext.tsx`).

## Regra de archival

Quando `NEXT.md` ultrapassar ~100 linhas:

1. Mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.
2. Manter no `NEXT.md` apenas: última sessão + próximo passo + bloqueios.
