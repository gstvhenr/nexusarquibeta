# Scripts

## verify wrappers

- Windows: `scripts/verify.cmd`
- Unix: `scripts/verify.sh`

Ambos chamam `npm run verify`.

## baseline wrappers

- Windows: `scripts/baseline.cmd`
- Unix: `scripts/baseline.sh`

Ambos executam `git status --short` + `npm run typecheck`.
