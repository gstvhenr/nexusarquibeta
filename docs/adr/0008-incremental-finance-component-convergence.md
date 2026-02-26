# ADR 0008 — Convergência Incremental de `components/finance` e `components/financeiro`

## Contexto

A auditoria de higiene identificou coexistência de dois diretórios para o mesmo domínio (`finance` e `financeiro`), o que reduz descobribilidade para agentes e aumenta risco de imports inconsistentes.

Ao mesmo tempo, `AGENTS.md` proíbe refactor transversal big-bang sem gates/documentação.

## Decisão

Adotar convergência **incremental** com governança explícita:

1. Manter os dois diretórios no curto prazo, com boundaries claros.
2. Todo novo componente financeiro deve seguir target único definido por etapa de migração.
3. Migração de componentes legados deve ocorrer por PRs pequenos, com testes e `npm run verify`.
4. Quando a migração atingir 100%, remover diretório legado em PR dedicado de limpeza.

## Alternativas consideradas

- Migração total imediata em um único PR (rejeitada por risco operacional e conflito com `AGENTS.md`).
- Manter dualidade sem plano formal (rejeitada por perpetuar ambiguidade).

## Consequências

- Reduz risco de regressão e melhora rastreabilidade da mudança.
- Mantém o projeto aderente ao princípio de diffs pequenos e verificáveis.

## Status de execução (2026-02-13)

- Migração concluída para `src/components/finance/*`.
- Arquivos movidos:
  - `CashBoxExpenseFormModal.tsx`
  - `CashBoxCreditFormModal.tsx`
- Re-export transitório removido de `src/components/finance/index.ts`.
- Diretório legado `src/components/financeiro/` removido.
- Consumo consolidado em `src/pages/FinanceiroGestaoCaixaPage.tsx` via `../components/finance`.
- Validação de gate: `npm run verify` verde.

## Rollback

Se a convergência gerar regressões relevantes, manter dualidade temporária e retomar com etapas menores, preservando o diretório anterior até estabilização.

## Referências

- `AGENTS.md`
- `docs/changelog/decisions-archive.md` (registro da convergência)
