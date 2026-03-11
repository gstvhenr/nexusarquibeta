# Types and Data Contracts

## Estado atual

- Migração completa: todos os tipos vivem em `src/types/*` (módulos de domínio).
- `src/types.ts` é um barrel puro que re-exporta de `src/types/index.ts`.
- Contratos de séries financeiras adicionados em `src/types/financial-series.ts` para padronizar período/filtros/agregação mensal.

## Fonte de verdade de contratos

- Tipos canônicos vivem em `src/types/*` (módulos de domínio).
- `src/types.ts` e `src/types/index.ts` são barrels puros — não contêm definições.
- Este documento rastreia decisões de shape e fixtures canônicas.
- Mudança em contrato público sem atualização deste documento é considerada incompleta.

## Regra de mudança

- Alteração de interface pública deve atualizar este documento e registrar decisão em `DECISIONS-active.md`/ADR.
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

## Subtask (Agenda / Projeto)

- Arquivo: `src/types/project.ts`
- Campos: `id`, `title`, `completed`, `completedAt?` (ISO datetime de conclusão), `taskId?`
- Usada em `AgendaEvent.subtasks` e `ProjectTask.subtasks`
- `completedAt` é gravado automaticamente ao marcar como concluída e limpo ao desmarcar.

## Contrato de navegação (UI-agnostic)

- Arquivo: `src/types/common.ts`
- Tipo: `NavLinkItem`
- Campos canônicos:
  - `icon: JSX.Element`
  - `iconName: NavIconName`
- `NavIconName` é definido como union por template literal:
  - `` `${string}Icon` | `${string}IconNew` ``
- Objetivo: manter o contrato de tipos desacoplado de `src/components/ui/icons.tsx` para evitar dependência de camada de implementação em `src/types/*`.

## Contratos de séries financeiras (Financeiro)

- Arquivo: `src/types/financial-series.ts`
- Tipos canônicos:
  - `PeriodMode`: `LAST_12_MONTHS | QUARTER | SEMESTER | YEAR`
  - `PeriodSelection`: `{ mode, year? }`
  - `Filters`: `{ origin?, category?, item? }`
  - `SeriesPoint`: `{ label: \"YYYY-MM\", value: number }`
  - `SeriesFilterOptions`: listas de `origins`, `categories`, `items`
  - `FinancialSeriesSource`: payload tipado para consulta de séries (dados financeiros de entrada)
- Uso:
  - `getReceivablesSeries(period, filters, source)`
  - `getExpensesSeries(period, filters, source)`
  - `getReceivablesFilterOptions(source, filters)`
  - `getExpensesFilterOptions(source, filters)`

## Contrato de proteção de caixa (Financeiro)

- Arquivo: `src/frontend/types/finance.ts`
- Tipo canônico: `EmergencyFund`
- Shape:
  - `currentValue: number`
  - `targetValue?: number`
- Persistência:
  - `AppData.emergencyFund`
  - default: `{ currentValue: 0 }`
  - armazenamento escalar em `system_config` no adaptador SQLite/WASM
- Uso:
  - `getEmergencyFund()`
  - `updateEmergencyFund(fund)`
  - `getEmergencyFundInsight(fund, monthlyExpenseBaseline)`
- Regra:
  - `targetValue` continua opcional para permitir acompanhamento por meses de fôlego quando não houver meta explícita.
