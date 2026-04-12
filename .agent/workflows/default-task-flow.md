# Default Task Flow (.agent)

// turbo-all

1. Read `AGENTS.md`, `CONTEXT.md`, `NEXT.md`, `.agent/lessons-learned.md`, `ARCHITECTURE.md`.
   1.5. If `.agent/memory/project-inventory.md` exists, read it before creating any new hook/service/util/type.
2. If inventory file is missing, generate it with the official command from `AGENTS.md`.
3. Run baseline and quality gates using commands defined in `AGENTS.md`.
4. Update `PLAN.md` with scope, out-of-scope, risks, binary criteria.
5. Implement in small diff (1 behavior per change).
   5.5. **Test Impact Check** (obrigatório após cada diff):
   - Rodar `npx vitest related --run <arquivos-alterados>` para validar testes afetados.
   - Se testes quebraram → corrigir ANTES de prosseguir.
   - Se arquivo alterado contém lógica runtime e NÃO tem `.test.ts(x)` → criar teste antes de prosseguir.
   - Se contrato/tipo mudou → verificar fixtures em `src/test/fixtures/` e `golden-fixtures.test.ts`.
   - Referência completa: `.agent/workflows/test-impact.md`.
6. Run canonical verify gate (structured runner).
7. If failing, inspect `[VERIFY][GATE][FAIL]` + `[VERIFY][HINT]`, apply minimal fix, and rerun until `[VERIFY][LOOP][PASS]`.
8. Run self-review automático and use `.agent/checklists/self-review-checklist.md` as complementary checklist.
9. Before handoff/CI, run the CI gate defined in `AGENTS.md`.
10. Update `NEXT.md` and `DECISIONS-active.md`/ADR if structural.
11. Register evidence (executed commands + objective results).
12. If any error was fixed, register it in `.agent/lessons-learned.md`.
13. If a pattern repeats 3+ times, promote it to `.agent/rules/nexusarqui.md`.

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
