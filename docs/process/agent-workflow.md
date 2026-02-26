# Agent Workflow Operacional (3.2)

## Fluxo padrão por tarefa

1. Entender contexto sem codar:
   - Ler `AGENTS.md`, `NEXT.md`, `ARCHITECTURE.md`.
   - Checar baseline com `git status` e comandos baseline definidos em `AGENTS.md`.
2. Planejar:
   - Atualizar `PLAN.md` com arquivos-alvo, fora de escopo, riscos e critérios binários.
3. Executar em diffs pequenos:
   - 1 comportamento verificável por PR/sessão.
   - Limite de 3-5 arquivos principais por mudança (exceção justificada).
4. Rodar checks:
   - Executar os gates oficiais definidos em `AGENTS.md` antes de concluir.
5. Revisar:
   - Self-review com checklist do agente.
6. Documentar estado:
   - Atualizar `NEXT.md`.
   - Se estrutural, atualizar `DECISIONS-active.md` e/ou ADR.
7. Entregar:
   - Só marcar como pronto com gates verdes e estado documentado.
   - Anexar evidências objetivas (comandos executados + resultado de gates/testes).

## Definition of Done do agente

- Gate canônico de `AGENTS.md` verde.
- Sem novos `any` (ou dívida registrada e justificada).
- Mudança de regra de negócio com teste atualizado em `services`/`utils`.
- Mudança de interface/contrato com docs de tipos/contratos atualizadas.
- `NEXT.md` atualizado.

## Guardrails

- Não alterar config sensível sem justificativa + gates oficiais verdes.
- Não instalar dependência sem aprovação explícita.
- Não fazer refactor big-bang.
- Mudança estrutural exige ADR/decisão e deve ser separada de feature.
- Sempre atualizar `NEXT.md` ao final da sessão.
- Não usar \"chain of thought\" como critério de qualidade; exigir plano explícito + comandos executados + evidências.
