# Trade-off Analysis & ADR

> Document every architectural decision with trade-offs.

## Decision Framework

For EACH architectural component, document:

```markdown
## Architecture Decision Record

### Context

- **Problem**: [What problem are we solving?]
- **Constraints**: [Team size, scale, timeline, budget]

### Options Considered

| Option   | Pros      | Cons   | Complexity | When Valid   |
| -------- | --------- | ------ | ---------- | ------------ |
| Option A | Benefit 1 | Cost 1 | Low        | [Conditions] |
| Option B | Benefit 2 | Cost 2 | High       | [Conditions] |

### Decision

**Chosen**: [Option B]

### Rationale

1. [Reason 1 - tied to constraints]
2. [Reason 2 - tied to requirements]

### Trade-offs Accepted

- [What we're giving up]
- [Why this is acceptable]

### Consequences

- **Positive**: [Benefits we gain]
- **Negative**: [Costs/risks we accept]
- **Mitigation**: [How we'll address negatives]

### Revisit Trigger

- [When to reconsider this decision]
```

## ADR Template

```markdown
# ADR-[XXX]: [Decision Title]

## Status

Proposed | Accepted | Deprecated | Superseded by [ADR-YYY]

## Context

[What problem? What constraints?]

## Decision

[What we chose - be specific]

## Rationale

[Why - tie to requirements and constraints]

## Trade-offs

[What we're giving up - be honest]

## Consequences

- **Positive**: [Benefits]
- **Negative**: [Costs]
- **Mitigation**: [How to address]
```

## ADR Storage

```
docs/
└── adr/
    ├── 0001-use-react-vite.md
    ├── 0002-indexeddb-over-localstorage.md
    └── 0003-adopt-service-layer.md
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
