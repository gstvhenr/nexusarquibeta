# Architecture Overview

## Camadas e limites

- `src/pages`: composição de tela, roteamento local, wiring de eventos.
- `src/components`: UI reutilizável e apresentação.
- `src/services`: regras de negócio, orquestração de domínio e casos de uso.
- `src/context`: estado global e integração com serviços.
- `src/utils`: funções puras e helpers sem efeito colateral relevante.
- `src/services/infrastructure`: persistência/integradores (sensível).

## Invariantes por domínio

- Clientes: validação de CPF/CNPJ e status financeiro centralizada em `services`.
- Projetos: progresso e financeiro derivados por funções de domínio (não em UI).
- Propostas: cálculo de totais/remuneração em funções testáveis.
- Financeiro: agregações mensais e status normalizados em `services`.

## Onde colocar o quê (bom/ruim)

Bom:

- cálculo de KPI em `src/services/dashboardService.ts`
- função de formatação em `src/utils/formatters.ts`
- componente consumindo dados prontos em `src/components/*`

Ruim:

- cálculo financeiro complexo direto em `src/pages/*`
- regra de validação de contrato espalhada em múltiplos componentes
- acesso a `localStorage` direto fora de `services/infrastructure`

## Tipos e contratos

- Estado atual: `src/types.ts` (legado) + `src/types/*` (alvo).
- Migração deve manter compatibilidade por re-export.
- Mudança estrutural em tipos exige registro em `DECISIONS.md` e/ou ADR.

## Padrão de pastas (direção)

Direção incremental para screaming architecture:

```text
src/
  features/
    clientes/
    projetos/
    financeiro/
  shared/
    ui/
    utils/
    infra/
```

Referência: `docs/architecture-screaming.md`.

## Gates de qualidade

- Gates e comandos oficiais são definidos em `AGENTS.md`.

## Artefatos operacionais

- Contrato do agente: `AGENTS.md`
- Processo de contribuição: `CONTRIBUTING.md`
- Workflow operacional: `docs/process/agent-workflow.md`
- Decisões: `DECISIONS.md` e `docs/adr/*`
- Handoff: `NEXT.md`
- Backlog: `TASKS.md`
- Estratégia de testes: `TESTING.md`
- Segurança: `SECURITY.md`
- Contratos de dados/tipos: `docs/data-contracts/types-contracts.md`
