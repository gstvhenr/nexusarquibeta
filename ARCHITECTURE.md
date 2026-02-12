# ARCHITECTURE.md

## Mapa rápido de camadas

- `src/pages`: composição/orquestração de telas.
- `src/components`: apresentação/UI reutilizável.
- `src/services`: regra de negócio.
- `src/context`: estado global e integração.
- `src/utils`: funções puras.
- `src/services/infrastructure`: persistência e integrações sensíveis.

## Regra de boundary

- Regra de negócio não deve viver em `pages/components`.
- Mudanças de boundary devem ser registradas em `DECISIONS.md` e/ou `docs/adr/*`.

## Referências detalhadas

- `docs/architecture.md`
- `docs/architecture-screaming.md`
