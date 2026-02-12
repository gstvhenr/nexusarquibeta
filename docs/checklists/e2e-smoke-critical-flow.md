# Checklist — E2E Smoke (Fluxo Crítico)

## Objetivo

Validar o fluxo de negócio ponta-a-ponta com maior risco de regressão funcional.

## Fluxo

1. Criar cliente válido.
2. Criar proposta vinculada ao cliente.
3. Converter proposta em projeto.
4. Confirmar recebível no financeiro.
5. Confirmar evento/sinal correspondente na agenda.

## Critérios de aceite

- [ ] Cliente criado e visível em listagem/detalhe.
- [ ] Proposta criada com total consistente.
- [ ] Conversão gera projeto sem erro e com vínculo correto.
- [ ] Recebível esperado aparece em financeiro com status coerente.
- [ ] Agenda contém evento associado ao projeto/prazo financeiro.
- [ ] Gate canônico de `AGENTS.md` permanece verde após o smoke.

## Evidências mínimas

- Comandos executados.
- Resultado dos gates.
- Registro resumido em `docs/audits/`.
