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
