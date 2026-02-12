# ADR 0004: Repeatable Agent Workflow

- Status: Accepted
- Date: 2026-02-12

## Context

Agent execution varied between sessions and lacked a strict, repeatable sequence.

## Decision

Adopt a fixed 3.2 workflow: context -> plan -> small diff -> verify -> self-review -> handoff -> deliver.

## Alternatives

- Keep ad-hoc workflow.
- Depend on chat memory and informal process.

## Consequences

- Better predictability and less regression risk.
- Slight upfront process overhead.

## Reversal

Return to ad-hoc flow and simplify docs/checklists if process cost outweighs benefit.
