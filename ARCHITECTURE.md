# ARCHITECTURE.md

## Mapa rápido de camadas

- `src/frontend/pages`: composição/orquestração de telas.
- `src/frontend/components`: apresentação/UI reutilizável.
- `src/frontend/services`: regra de negócio.
- `src/frontend/context`: estado global e integração.
- `src/frontend/utils`: funções puras.
- `src/frontend/services/infrastructure`: persistência e integrações sensíveis.

## Domains

- `home`: visão inicial e dashboard.
- `agenda`: calendário, tarefas, lembretes e bloco de notas.
- `comercial`: prospects, orçamentos e propostas.
- `projetos`: ciclo de vida e detalhes de projetos.
- `clientes`: gestão de clientes e detalhes.
- `financeiro`: gestão de caixa, visão geral, recebíveis e despesas.
- `documentos`: documentos pessoais e de projetos.
- `suprimentos`: fornecedores, catálogo, cotações e comissões.
- `gestao-marketing`: painel, conteúdos, ideias e redes sociais.
- `prestadores-freelancers`: freelancers e serviços contratados.
- `relatorios`: relatórios financeiros, projetos e aquisição.
- `configuracoes`: preferências e operações administrativas.

## Regra de boundary

- Regra de negócio não deve viver em `pages/components`.
- Mudanças de boundary devem ser registradas em `DECISIONS-active.md` e/ou `docs/adr/*`.

## Structural Invariants

- Nenhum arquivo `.ts/.tsx` solto na raiz de `src/frontend/pages` (exceto `index.ts`).
- Nenhum arquivo `.ts/.tsx` solto na raiz de `src/frontend/components` (exceto `index.ts`).
- Arquivos `*Service.ts` existem somente em `src/frontend/services/**`.
- Testes `*.test.ts(x)` permanecem co-localizados com o source, exceto `src/frontend/test/**`.
- A criação de novos arquivos segue `docs/PLACEMENT_RULES.md`.

## File Creation Protocol

1. Consultar `docs/PLACEMENT_RULES.md` e resolver path de destino.
2. Criar o arquivo no path determinado pela árvore de decisão.
3. Criar/atualizar barrel `index.ts` quando o diretório expuser múltiplos módulos.
4. Executar `validate:structure` e corrigir violações antes de seguir.

## Governance

- Regras prescritivas: `docs/PLACEMENT_RULES.md`.
- Enforcement automatizado: `scripts/validate-structure.mjs`.
- Contrato operacional do agente: `AGENTS.md`.

## Referências detalhadas

- `docs/architecture.md`
- `docs/architecture-screaming.md`
- `docs/PLACEMENT_RULES.md`
