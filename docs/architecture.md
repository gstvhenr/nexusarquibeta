# Architecture Overview

## Camadas e limites

- `src/frontend/pages`: composição de tela, roteamento local e wiring de eventos.
- `src/frontend/components`: UI reutilizável e apresentação.
- `src/frontend/services`: regras de negócio, orquestração de domínio e casos de uso.
- `src/frontend/context`: estado global e integração com serviços.
- `src/frontend/utils`: funções puras e helpers sem efeito colateral relevante.
- `src/frontend/services/infrastructure`: persistência/integradores (sensível).

## Invariantes por domínio

- Clientes: validação de CPF/CNPJ e status financeiro centralizada em `services`.
- Projetos: progresso e financeiro derivados por funções de domínio (não em UI).
- Propostas: cálculo de totais/remuneração em funções testáveis.
- Financeiro: agregações mensais e status normalizados em `services`.

## Protocolo de criação de arquivos

1. Antes de criar qualquer arquivo em `src/frontend`, consultar `docs/PLACEMENT_RULES.md`.
2. Criar o arquivo no path resultante da árvore de decisão.
3. Criar/atualizar `index.ts` quando o diretório expuser múltiplos módulos reutilizáveis.
4. Executar `npm run validate:structure` e corrigir violações antes de seguir.

## Invariantes estruturais

- Não deixar arquivos `.ts/.tsx` soltos na raiz de `src/frontend/pages` (exceto `index.ts`).
- Não deixar arquivos `.ts/.tsx` soltos na raiz de `src/frontend/components` (exceto `index.ts`).
- Arquivos `*Service.ts` pertencem a `src/frontend/services/**`.
- Arquivos `use*.ts` pertencem a `src/frontend/hooks/**` ou `src/frontend/pages/**`.
- Testes `*.test.ts(x)` são co-localizados com o source, exceto `src/frontend/test/**`.

## Padrão de pastas (direção incremental)

Direção incremental para screaming architecture:

```text
src/
  frontend/
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
- Regras de placement: `docs/PLACEMENT_RULES.md`
- Processo de contribuição: `CONTRIBUTING.md`
- Workflow operacional: `docs/process/agent-workflow.md`
- Decisões: `DECISIONS-active.md` e `docs/adr/*`
- Handoff: `NEXT.md`
- Backlog: `TASKS.md`
- Estratégia de testes: `TESTING.md`
- Segurança: `SECURITY.md`
- Contratos de dados/tipos: `docs/data-contracts/types-contracts.md`
