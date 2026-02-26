# ADR 0009 — Contexto Hierárquico com Lazy Loading (MVI)

## Status

Aceito (2026-02-15)

## Contexto

O `NEXT.md` cresceu para ~448 linhas (~31KB) contendo o histórico acumulado de todas as sessões desde a criação do projeto. Isso consome ~8.000-10.000 tokens do contexto do agente a cada início de sessão, sendo que ~80% desse conteúdo é histórico irrelevante para a tarefa atual.

A pesquisa de melhores práticas (Anthropic Context Engineering, GitHub Copilot AGENTS.md, Cline Memory Bank, OpenAI Agents SDK) convergiu em um padrão claro: **Progressive Disclosure** com lazy loading hierárquico.

## Decisão

Implementar contexto hierárquico em 3 camadas:

1. **Camada 1 — Sempre carregada**: `AGENTS.md`, `CONTEXT.md` (ponteiros), `NEXT.md` (slim, apenas última sessão).
2. **Camada 2 — Carregada quando necessário**: architecture, contracts, decisions.
3. **Camada 3 — Carregada por demanda explícita**: changelogs arquivados, audits, checklists.

Ações concretas:

- Criar `CONTEXT.md` (~60 linhas) como índice de ponteiros hierárquicos.
- Reduzir `NEXT.md` para ~50 linhas (apenas última sessão + próximo passo + bloqueios).
- Mover histórico para `docs/changelog/session-log-YYYY-MM.md` (archival por mês).
- Estabelecer regra de archival: quando NEXT.md > 100 linhas, arquivar sessões antigas.

## Consequências

- **Positivo**: Economia de ~70% de tokens no bootstrap da sessão (~7K tokens economizados). Mais espaço para código fonte no contexto. Histórico preservado e consultável.
- **Negativo**: Agente precisa de um passo extra para consultar histórico antigo (lazy load).
- **Risco mitigado**: Truncamento silencioso pelo GitHub Copilot (limite de 32KiB para `project_doc_max_bytes`) deixa de ser uma ameaça.

## Reversão

Mover o conteúdo de `docs/changelog/session-log-*.md` de volta para `NEXT.md` e remover `CONTEXT.md`.

## Referências

- Anthropic — Context Engineering Guide (structured note-taking, just-in-time context)
- GitHub Blog — AGENTS.md (layered instructions, truncation limit)
- Cline Memory Bank (progressive disclosure, activeContext.md)
- OpenAI Agents SDK (trimming, context summarization)
