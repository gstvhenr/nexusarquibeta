# Working Agreement

## Pull Request Discipline

- Keep PRs small and scoped.
- Separate behavior changes from pure refactors where possible.
- Include test updates for changed behavior.

## Required Validation Before Merge

- Run canonical gates defined in `AGENTS.md`.
- Ensure CI gates are green.
- Attach evidence (executed commands + objective outputs).

## Refactor Sequencing

- Start from high-risk hotspots (`types`, large pages) in incremental steps.
- Preserve public contracts during transitions.
- Structural refactor must be isolated from functional changes and registered via ADR/decision.
