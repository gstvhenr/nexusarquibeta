# Canonical Example: Template de ADR

## Objetivo

Modelo preenchido para novas ADRs. Usar caso fictício realista do domínio.

## ADRs de referência

- `docs/adr/0001-agent-source-of-truth.md` (formato básico)
- `docs/adr/0009-hierarchical-context-lazy-loading.md` (formato estendido)

## Template preenchido (exemplo fictício)

```markdown
# ADR NNNN: Adotar validação de CPF/CNPJ no service layer

## Status

Accepted

## Date

2026-MM-DD

## Author

[Nome do decisor]

## Context

A validação de CPF/CNPJ estava duplicada em 3 componentes de UI diferentes.
Correções de bug afetavam um componente mas não os outros, gerando
inconsistência. A regra de boundary do ARCHITECTURE.md proíbe lógica de
negócio em componentes.

## Decision

Centralizar toda validação de CPF/CNPJ em `clientService.ts` como funções
puras exportadas. Componentes devem apenas chamar o service.

## Rationale

Alternativas consideradas:

1. Hook compartilhado (`useValidation`) — rejeitado porque hooks têm lifecycle
   de componente e a validação é pura.
2. Manter duplicação com lint rule — rejeitado porque não previne drift.
3. Service centralizado (escolhido) — função pura, testável, sem lifecycle.

## Consequences

### Positivas

- Validação única e consistente.
- Testável com testes unitários puros.
- Alinhado com boundary rules do projeto.

### Negativas

- Componentes que usavam validação local precisam ser migrados.
- Aumenta dependência de componentes no service layer.

### Riscos

- Se a interface do service mudar, múltiplos componentes são afetados
  (mitigação: manter contrato estável com tipo discriminado).

## Reversao

Mover funções de validação de volta para os componentes individuais.

## References

- `AGENTS.md` (regras de boundary)
- `ARCHITECTURE.md` (mapa de camadas)
- Relacionado a: ADR 0006 (golden contracts)
```

## Diferenciais vs ADRs existentes

- Adiciona `Author` (rastreabilidade).
- Adiciona `Rationale` com alternativas descartadas.
- Separa `Consequences` em `Positivas`, `Negativas` e `Riscos`.
- Adiciona `Reversao` (presente só no ADR 0009 atualmente).

## Regra de manutenção

Novas ADRs devem seguir este template. Se o formato evoluir, atualizar este
documento antes de criar a próxima ADR.
