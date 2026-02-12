# AGENTS.md

## Produto

Nexus-Arqui é um ERP web para escritório de arquitetura (clientes, propostas, projetos, financeiro e documentos), construído em React + TypeScript.

## Não-objetivo

Não fazer reescrita big-bang da arquitetura nem mudanças transversais sem gates/documentação.

## Prioridade de regras

- Se houver conflito entre documentos, `AGENTS.md` vence.
- Depois da sessão, corrigir o documento que ficou desatualizado.

## Fonte de verdade (anti-drift)

- Comandos oficiais vivem somente neste arquivo.
- Tipos/contratos vivem em `src/types.ts` e `src/types/*` com rastreio em `docs/data-contracts/types-contracts.md`.
- Demais documentos devem referenciar este arquivo, sem duplicar lista de comandos.

## Regra de sessão (memória zero)

- No fim de toda sessão: atualizar `NEXT.md`.
- Se houve mudança estrutural/contrato: registrar em `DECISIONS.md` e/ou `docs/adr/*`.

## Decisões operacionais vigentes (Etapa 5.3)

- Host alvo oficial: GitHub (Actions + branch protection + Dependabot/CodeQL).
- Hooks padrão: Husky + lint-staged (stack Node-only).
- Modularização: decompor hotspots primeiro; adotar `src/features/*` de forma incremental por domínio.
- Fluxo crítico inicial (smoke): cliente -> proposta -> conversão para projeto -> recebível no financeiro -> evento/sinal na agenda.
- Execução no Antigravity: preferir execução direta de comandos pelo agente; se o ambiente bloquear, o operador executa os mesmos comandos e anexa saída.

## Comandos oficiais

- Instalar: `npm install`
- Baseline rápido: `npm run baseline`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Formatação (check): `npm run format:check`
- Testes: `npm run test`
- Build: `npm run build`
- Gate canônico: `npm run verify`
- Segurança (crítico): `npm run security:check`

## Mapa de alto nível

- `src/pages`: composição de telas (sem regra de negócio pesada).
- `src/components`: UI reaproveitável.
- `src/services`: regras de negócio e casos de uso.
- `src/context`: estado global/orquestração.
- `src/utils`: funções puras.

## Workflow operacional padrão (repetível)

1. Entender contexto sem codar: ler `AGENTS.md`, `NEXT.md`, `ARCHITECTURE.md`.
2. Checar baseline: `git status` + `npm run verify` (ou no mínimo `npm run typecheck`).
3. Planejar curto em `PLAN.md` (arquivos-alvo, fora de escopo, riscos, critérios binários).
4. Executar em diffs pequenos: 1 comportamento verificável por sessão/PR.
5. Limite de escopo: até 3-5 arquivos principais por mudança (exceções exigem justificativa).
6. Rodar checks e corrigir falhas antes de encerrar.
7. Self-review + atualizar `NEXT.md` + decisões/ADR quando aplicável.

## Evidências obrigatórias (sem depender de chain-of-thought)

- Toda entrega deve incluir: plano explícito, comandos executados e evidências objetivas (gates/testes/logs).
- Não considerar tarefa pronta com afirmação sem evidência verificável.

## Regras duras

- UI não contém regra de negócio complexa.
- Não adicionar dependência sem aprovação explícita.
- Não fazer refactor transversal big-bang.
- Mudança estrutural exige ADR/decisão e deve ser separada de feature funcional.
- Não alterar configs sensíveis (`tsconfig*`, `vite.config.ts`, `eslint.config.*`) sem justificativa e `npm run verify` verde.
- Não mexer em persistência (`src/services/infrastructure/*`) sem validar leitura/escrita básica no app.

## Don’t touch list (sensível)

- `src/services/infrastructure/api.ts`
- `src/services/infrastructure/storageService.ts`
- `src/types.ts` (manter compatibilidade enquanto migração para `src/types/*` não termina)

## Tipos e contratos

- Estado atual: coexistência de `src/types.ts` e `src/types/*`.
- Alterar com segurança: migrar incrementalmente + manter re-export compatível.
- Mudança de interface/contrato exige atualização de `docs/data-contracts/types-contracts.md` e registro de decisão.
- Mudanças de shape devem atualizar fixtures canônicas em `src/test/fixtures/*` e respectivos golden tests.

## Testes

- Convenção: `*.test.ts` e `*.test.tsx` próximos ao código.
- Prioridade: `services/utils` -> hooks -> UI -> E2E smoke.
- Estilo: Given/When/Then, fixtures pequenas, evitar snapshots frágeis.

## Definition of Done do agente

- `npm run verify` verde.
- Sem novos `any`; se inevitável, justificar e registrar dívida técnica.
- Se mudou regra de negócio: teste em `services`/`utils` adicionado/atualizado.
- Se mudou interface/contrato: documentação de tipos/contratos atualizada.
- `NEXT.md` atualizado.

## Como pedir revisão

- Informar: objetivo, arquivos-chave, fora de escopo, risco, evidência dos gates.

## Regra de atualização deste arquivo

Atualizar `AGENTS.md` sempre que mudar: comandos, paths, arquitetura, convenções, gates ou processo.

## Nota sobre Vite

Se a porta não estiver configurada, o padrão do Vite não é `3000` (comumente `5173`). Neste repo, a porta está explícita em `vite.config.ts`.
