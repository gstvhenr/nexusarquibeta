# Checklist — Refatorar Hotspot (Agent-friendly)

## Planejamento

- [ ] Identificar hotspot (arquivo, responsabilidade, tamanho, riscos).
- [ ] Definir limite de lote (1 responsabilidade por PR).
- [ ] Definir testes mínimos para travar comportamento atual.

## Execução

- [ ] Extrair lógica pura para `src/frontend/services` ou `src/frontend/utils`.
- [ ] Reduzir a página/componente para composição.
- [ ] Evitar mudanças visuais acidentais junto do refactor.

## Validação

- [ ] Gate canônico de `AGENTS.md` verde.
- [ ] Cobertura de cenários críticos adicionada/ajustada.
- [ ] Dependências e imports ficaram mais simples (não mais complexos).

## Documentação

- [ ] Atualizar checklist da tarefa.
- [ ] Atualizar ADR se houver nova regra arquitetural.
