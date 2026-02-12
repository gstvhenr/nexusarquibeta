# TESTING.md

## Comandos oficiais

Fonte única de comandos: `AGENTS.md`.

## Como o agente deve usar

- Antes de terminar qualquer tarefa: executar o gate canônico definido em `AGENTS.md`.
- Se mexeu em types/services: executar ao menos os gates mínimos de tipos + testes definidos em `AGENTS.md`.
- Se mexeu em UI: garantir build + testes relevantes conforme `AGENTS.md`.

## Convenções

- Nomes: `*.test.ts` / `*.test.tsx`.
- Prioridade de cobertura: services/utils -> hooks -> UI -> E2E smoke.
- Estilo agent-friendly: Given/When/Then, fixtures pequenas, evitar snapshots frágeis.

## CI

- Pipeline principal executa os gates oficiais definidos em `AGENTS.md`.
- Segurança crítica segue a política de `SECURITY.md` e comando oficial de `AGENTS.md`.
