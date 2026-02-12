# CONTRIBUTING.md

## Fluxo padrão

1. Criar branch (`feature/*`, `fix/*`, `chore/*`).
2. Confirmar baseline (`git status` + baseline definido em `AGENTS.md`).
3. Planejar escopo em `PLAN.md` (alvo, fora de escopo, riscos, critérios).
4. Implementar em diffs pequenos.
5. Rodar gates oficiais de `AGENTS.md` e corrigir antes de abrir PR.
6. Atualizar `NEXT.md` e decisões/ADR quando aplicável.

## Política de tamanho de PR

- 1 comportamento verificável por PR.
- Até 3-5 arquivos principais por mudança (exceção exige justificativa).
- Mudança estrutural exige ADR/decisão e deve ser separada de mudança funcional.

## Checklist de PR

- [ ] Gate canônico definido em `AGENTS.md`
- [ ] Sem novos `any` sem justificativa
- [ ] Testes atualizados para comportamento alterado
- [ ] Contratos/tipos/documentação atualizados quando necessário
- [ ] `NEXT.md` atualizado
- [ ] `DECISIONS.md`/ADR atualizado se estrutural
- [ ] Evidências anexadas (comandos executados + resultado objetivo)

## Dependências e segurança

- Dependência nova só com aprovação explícita.
- Nunca commitar segredos (`.env`, tokens, chaves).
- Vulnerabilidade crítica bloqueia merge.
- CI executa os gates oficiais descritos em `AGENTS.md`.
