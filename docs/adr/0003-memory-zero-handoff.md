# ADR 0003: Memory-Zero Handoff Discipline

- Status: Accepted
- Date: 2026-02-12

## Context

Agent sessions may not retain reliable conversational memory across runs.

## Decision

Adopt mandatory session handoff with `NEXT.md` updates at the end of every session.
Structural changes must be recorded in `DECISIONS-active.md` and/or `docs/adr/*`.

## Alternatives

- Rely only on chat memory.
- Keep handoff notes outside repository.

## Consequences

- Better continuity and lower context-reconstruction cost.
- Slight documentation overhead per session.

## Reversal

If a better versioned handoff mechanism is adopted, deprecate `NEXT.md` and update AGENTS/process docs.
