# ADR 0001: Agent Instruction Source Of Truth

- Status: Accepted
- Date: 2026-02-12

## Context

Agent interactions can lose context between sessions. Tool-specific rule files are not universally portable.

## Decision

Use `AGENTS.md` in repository root as the primary and portable instruction contract for agents.

## Consequences

- Instructions become versioned and reviewable.
- Behavior becomes more consistent across sessions/tools.
- Tool-specific files remain optional and secondary.
