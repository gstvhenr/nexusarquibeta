# Default Task Flow (.agent)

// turbo-all

1. Read `AGENTS.md`, `CONTEXT.md`, `NEXT.md`, `.agent/lessons-learned.md`, `ARCHITECTURE.md`.
2. Run baseline and quality gates using commands defined in `AGENTS.md`.
3. Update `PLAN.md` with scope, out-of-scope, risks, binary criteria.
4. Implement in small diff (1 behavior per change).
5. Run canonical verify gate (structured runner).
6. If failing, inspect `[VERIFY][GATE][FAIL]` + `[VERIFY][HINT]`, apply minimal fix, and rerun until `[VERIFY][LOOP][PASS]`.
7. Run self-review automático and use `.agent/checklists/self-review-checklist.md` as complementary checklist.
8. Before handoff/CI, run the CI gate defined in `AGENTS.md`.
9. Update `NEXT.md` and `DECISIONS-active.md`/ADR if structural.
10. Register evidence (executed commands + objective results).
11. If any error was fixed, register it in `.agent/lessons-learned.md`.
12. If a pattern repeats 3+ times, promote it to `.agent/rules/nexusarqui.md`.
