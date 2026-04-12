# AGENTS.md

## Produto

Nexus-Arqui é um ERP web exclusivo para a operação do profissional autônomo Rafael Munaro (clientes, propostas, projetos, financeiro e documentos), construído em React + TypeScript.

## Prioridade de regras

- Se houver conflito entre documentos, `AGENTS.md` vence.
- Comandos oficiais vivem somente neste arquivo.
- Detalhes operacionais complementares vivem em `docs/governance/core-contract.md`.

## Regra de sessão (memória zero)

- Ler no início: `AGENTS.md`, `CONTEXT.md`, `NEXT.md`, `.agent/lessons-learned.md`.
- Se tarefa envolver arquitetura/estrutura: ler também `ARCHITECTURE.md`.
- Em `.agent/lessons-learned.md`, ignorar entradas com `## Status: SUPERSEDED`.
- Usar `DECISIONS-active.md` como registro de decisões vigente.
- Atualizar `NEXT.md` ao final de toda sessão.
- Se houve mudança estrutural/contrato: atualizar `DECISIONS-active.md` e/ou `docs/adr/*`.

## Comandos oficiais

- Instalar: `npm install`
- Baseline rápido: `npm run baseline`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Formatação (check): `npm run format:check`
- Governança documental: `npm run check:docs:governance`
- Validação estrutural: `npm run validate:structure`
- Validação estrutural (ratchet): `npm run validate:structure:ratchet`
- Validação estrutural (check ratchet): `npm run validate:structure:ratchet:check`
- Complexidade por linhas: `npm run check:lines`
- Complexidade por linhas (ratchet): `npm run check:lines:ratchet`
- Validação de ratchet de linhas: `npm run check:lines:ratchet:check`
- Inventário do projeto (agente): `npm run inventory:generate`
- Poluição (regressão): `npm run check:pollution`
- Poluição (ratchet): `npm run check:pollution:ratchet`
- Poluição (validação de ratchet): `npm run check:pollution:ratchet:check`
- Duplicação de código: `npm run check:duplication`
- Testes: `npm run test`
- Testes com cobertura: `npm run test:coverage`
- Impacto em testes: `npm run test:impact`
- Build: `npm run build`
- Self-review automático: `npm run self-review:auto`
- Gate rápido (style/docs): `npm run verify:quick`
- Gate canônico: `npm run verify`
- Gate bruto (debug local): `npm run verify:raw`
- Gate completo de CI: `npm run verify:ci`
- Segurança (crítico): `npm run security:check`

## Pipeline canônico (fail-fast)

Ordem oficial do `npm run verify`:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run format:check`
4. `npm run check:docs:governance`
5. `npm run validate:structure`
6. `npm run check:lines`
7. `npm run check:duplication`
8. `npm run test:coverage`
9. `npm run build`

`npm run self-review:auto` é complementar e não bloqueia o gate canônico.

## Pipeline de CI

Ordem oficial do `npm run verify:ci`:

1. `npm run verify`
2. `npm run self-review:auto`
3. `npm run security:check`

## Escopo de verificação (tiered gates)

- Use `npm run verify:quick` para CSS, copy e documentação.
- Use `npm run verify` para componentes, hooks e lógica de negócio.
- Use `npm run verify:ci` para refatoração estrutural e mudança de contrato global.
- Na dúvida, default para `npm run verify`.

## Regras duras

- Não fazer refactor transversal big-bang.
- Não adicionar dependência sem aprovação explícita.
- UI não deve conter regra de negócio complexa.
- Antes de criar qualquer arquivo em `src/frontend`, consultar `docs/PLACEMENT_RULES.md`.
- Mudança estrutural exige ADR/decisão separada de feature funcional.
- Não alterar configs sensíveis (`tsconfig*`, `vite.config.ts`, `eslint.config.*`) sem justificativa e gate verde.
- Não mexer em persistência (`src/frontend/services/infrastructure/*`) sem validar leitura/escrita básica.
- Não introduzir `as any` em produção; se inevitável, justificar e registrar dívida técnica.
- Criar arquivo sem consultar `docs/PLACEMENT_RULES.md` é violação de protocolo.

## Don’t touch list (sensível)

- `src/frontend/services/infrastructure/api.ts`
- `src/frontend/services/infrastructure/storageService.ts`
- `src/frontend/types.ts` (manter compatibilidade durante migração para `src/frontend/types/*`)

## Definition of Done do agente

- `npm run verify` verde com `[VERIFY][LOOP][PASS]`.
- Se mudou regra de negócio: testes atualizados em `services`/`utils`.
- Se mudou contrato/interface: atualizar `docs/data-contracts/types-contracts.md`.
- Se houve mudança estrutural: registrar em `DECISIONS-active.md` e/ou ADR.
- Sem novos `any` sem justificativa explícita.
- `NEXT.md` atualizado.

## Referências ativas

- Contexto operacional: `CONTEXT.md`
- Contrato de governança enxuta: `docs/governance/core-contract.md`
- Regras de criação de arquivos: `docs/PLACEMENT_RULES.md`
- Workflow ativo do agente: `.agent/workflows/default-task-flow.md`
- Self-review checklist: `.agent/checklists/self-review-checklist.md`
- Histórico de decisões: `DECISIONS-active.md` e `docs/changelog/decisions-archive.md`

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
