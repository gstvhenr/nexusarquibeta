# Types and Data Contracts

## Estado atual

- Contratos legados centralizados em `src/types.ts`.
- Migração incremental em andamento para `src/types/*`.

## Fonte de verdade de contratos

- Tipos canônicos vivem em `src/types.ts` e `src/types/*`.
- Este documento rastreia decisões de shape e fixtures canônicas.
- Mudança em contrato público sem atualização deste documento é considerada incompleta.

## Regra de mudança

- Alteração de interface pública deve atualizar este documento e registrar decisão em `DECISIONS.md`/ADR.
- Sempre manter compatibilidade incremental durante migração.
- Services públicos devem expor JSDoc curto com `input -> output` e exemplo.
- Se houver import/export JSON de domínio, atualizar também fixtures e golden tests.

## Golden fixtures (anti-regressão de shape)

- Local: `src/test/fixtures/`.
- Domínios canônicos iniciais:
  - `client.fixture.json`
  - `project.fixture.json`
  - `proposal.fixture.json`
- Teste de contrato: `src/test/golden-fixtures.test.ts`.

## Checklist de alteração de contrato

- [ ] Tipo alterado mapeado (quem consome).
- [ ] Impacto em services/pages identificado.
- [ ] Fixtures canônicas atualizadas (`src/test/fixtures/*`) quando houver mudança de shape.
- [ ] Golden tests atualizados (`src/test/golden-fixtures.test.ts`).
- [ ] Testes atualizados.
- [ ] Gate canônico de `AGENTS.md` verde.
