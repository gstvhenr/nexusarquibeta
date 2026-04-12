# Workflow: Verify First

// turbo-all

1. Understand change scope.
2. Implement in small diff.
3. Run canonical verify gate from `AGENTS.md`.
4. If failed, read `[VERIFY][GATE][FAIL]` and `[VERIFY][HINT]`.
5. Apply minimal fix for the failing gate only.
6. Rerun verify and repeat steps 4-6 until `[VERIFY][LOOP][PASS]`.
7. Run anti-pollution checks (regression + ratchet check) defined in `AGENTS.md`.
8. Run CI gate before final handoff.
9. If an error was fixed after gate failure, register it in `.agent/lessons-learned.md`.
10. If the same pattern appears 3+ times, promote it to `.agent/rules/nexusarqui.md`.
11. Update docs/ADR if structural.

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
