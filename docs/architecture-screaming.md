# Screaming Architecture (Agent-friendly)

## Objetivo

Organizar o código para que a estrutura “grite” o domínio de negócio, e não o framework.

## Estrutura alvo (incremental)

```text
src/
  features/
    clientes/
      components/
      services/
      hooks/
      types.ts
      index.ts
    projetos/
      components/
      services/
      hooks/
      types.ts
      index.ts
    financeiro/
      ...
  shared/
    ui/
    utils/
    infra/
```

## Regras para migração segura

1. Não fazer big-bang.
2. Migrar um domínio por vez.
3. Manter adaptadores/re-exports temporários para compatibilidade.
4. Mover primeiro funções puras e contratos estáveis.
5. Só depois mover composição de UI.

## Estratégia prática para este repo

1. Consolidar lógica de cliente/projeto em serviços reutilizáveis.
2. Continuar a fragmentação de `src/types.ts` para `src/types/*`.
3. Criar fronteiras de domínio por pasta e barrel mínimo por domínio.
4. Manter o gate canônico de `AGENTS.md` verde a cada passo.

## Anti-padrões para agentes

- Misturar refactor estrutural + mudança comportamental grande no mesmo lote.
- Criar dependências cruzadas entre domínios sem contrato explícito.
- Duplicar regras de negócio entre páginas.
