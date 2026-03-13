---
trigger: always_on
---

<!-- SOURCE OF TRUTH: este arquivo é a versão canônica das regras negativas.
     As user rules do Antigravity (RULE[nexusarqui.md]) contêm uma cópia
     sincronizada deste conteúdo. Ao alterar este arquivo, a cópia nas
     user rules DEVE ser atualizada manualmente pelo usuário para manter
     consistência. Última sincronização: 2026-03-12. -->

# NEXUS-ARQUI AGENT RULES (aligned with AGENTS.md)

## 1. Mission

Maintain architectural integrity and delivery safety for Nexus-Arqui (React + TypeScript strict).

## 2. Non-negotiables

- Follow `AGENTS.md` as primary contract.
- Keep business logic in `src/frontend/services`/`src/frontend/utils`, not UI.
- Do not add dependencies without explicit approval.
- Do not perform big-bang refactors.
- Structural changes require ADR/decision and isolated scope.

## 3. Execution protocol

1. Read context: `AGENTS.md`, `CONTEXT.md`, `NEXT.md`, `.agent/lessons-learned.md`, `ARCHITECTURE.md`.
   1.1. Before creating any file in `src/frontend`, read `docs/PLACEMENT_RULES.md` and resolve target path first.
2. Define explicit short plan with scope, risks, and binary criteria.
3. Implement small, reversible diffs.
4. Run canonical gates from `AGENTS.md`.
   4.1. After creating/moving files, run `validate:structure` and fix violations before proceeding.
5. Provide evidence: executed commands and objective results.
6. Update `NEXT.md` and decisions/ADR when structural.

## 4. Contract discipline

- Public services must keep short JSDoc (`input -> output` + example).
- Contract shape changes must update `docs/data-contracts/types-contracts.md`.
- Contract shape changes must update test fixtures when reintroduced (currently removed — see NEXT.md).

## 5. Output discipline

- Never claim completion without gate evidence.
- Keep responses objective and implementation-focused.

## 6. Anti-patterns (DO NOT / DO INSTEAD)

### 6.1 Comportamento do Agente (PRIORIDADE MAXIMA)

❌ NAO: Expandir escopo alem do solicitado (scope creep).  
✅ FACA: Implemente APENAS o pedido. Registre extras em NEXT.md.  
📎 Causa #1 de regressoes em vibe coding (Regra F.1).

❌ NAO: Deletar ou reescrever codigo funcional sem justificativa.  
✅ FACA: Preserve codigo existente. Modifique APENAS o necessario.  
📎 "File deletion hallucination" documentado (Regra F.2).

❌ NAO: Assumir contexto que nao foi fornecido.  
✅ FACA: Pergunte quando informacao critica estiver ausente.  
📎 LLMs forcam solucoes em vez de pedir info faltante (Regra F.3).

❌ NAO: Inventar APIs, metodos ou props que nao existem.  
✅ FACA: Verifique no codebase e docs antes de usar. Valide imports.  
📎 "Hallucinated APIs" e erro documentado (Regra F.4).

❌ NAO: Afirmar tarefa completa sem npm run verify verde.  
✅ FACA: Execute gates. Sem verde, NAO esta pronta.  
📎 Ja no AGENTS.md - reforco explicito (Regra F.5).

### 6.2 TypeScript Safety

❌ NAO: Usar React.FC ou React.FunctionComponent.  
✅ FACA: Declaracao de funcao normal com props tipadas.  
📎 Legacy/deprecated. Dificulta generics (Regra A.3).

❌ NAO: Tipar useState de forma generica para objetos complexos.  
✅ FACA: useState<MinhaInterface | null>(null).  
📎 Inferencia falha em union types (Regra A.4).

❌ NAO: Acessar propriedades sem verificar null/undefined.  
✅ FACA: Use ?. ou ?? ou type guards.  
📎 Erro de runtime #1 em React+TS (Regra A.5).

### 6.3 React Hooks

❌ NAO: Mutar state diretamente (.push, alterar propriedade).  
✅ FACA: Novo objeto/array com spread ou metodos imutaveis.  
📎 Mutacao direta nao triggera re-render (Regra D.1).

❌ NAO: Dependencias incorretas/ausentes em useEffect.  
✅ FACA: TODAS as variaveis do efeito nas dependencias.  
📎 Stale closures sao bugs dificeis de diagnosticar (Regra D.2).

❌ NAO: Usar index como key em listas que reordenam.  
✅ FACA: Use ID estavel e unico do dado.  
📎 Index como key causa bugs visuais (Regra D.3).

❌ NAO: useEffect para derivar estado de outro estado.  
✅ FACA: Derive com useMemo ou calculo direto no render.  
📎 Conceito oficial "You Might Not Need an Effect" (Regra D.4).

### 6.4 Higiene de Codigo

❌ NAO: Gerar campos de negocio `YYYY-MM-DD` com `toISOString().split('T')[0]`.  
✅ FACA: Use `getTodayDateOnly()` para "hoje" e `toDateOnlyString(date)` para datas derivadas.  
📎 Campos `date-only` representam data civil, nao instante UTC.

❌ NAO: Parsear `YYYY-MM-DD` com `new Date('2026-03-08')`.  
✅ FACA: Use `parseDateString()` ou construa `new Date(ano, mesIndexado, dia)`.  
📎 O parser nativo trata esse formato como UTC e pode deslocar o dia local.

❌ NAO: Nomear variaveis de forma generica (data, result, value).  
✅ FACA: Nomes que revelam intencao (clientProposals, monthlyRevenue).  
📎 Dificultam grep/busca (Regra E.5).

❌ NAO: Magic numbers/strings no codigo.  
✅ FACA: Constantes nomeadas ou enum.  
📎 Ilegiveis e impossiveis de manter (Regra E.6).

❌ NAO: Funcoes vazias com placeholder (// TODO).  
✅ FACA: Implemente ou throw new Error('Not implemented') + NEXT.md.  
📎 "Laziness" e anti-pattern #1 de LLMs (Regra E.4).

### 6.5 Estilizacao

❌ NAO: Usar cores hardcoded (hex/rgb) fora de tokens.  
✅ FACA: Tokens do design system (variaveis CSS ou Tailwind).  
📎 Impedem theming e consistencia (Regra C.1).

❌ NAO: Espacamento arbitrario (margin: 13px).  
✅ FACA: Escala do design system (4, 8, 12, 16, 24, 32...).  
📎 Inconsistencia visualmente perceptivel (Regra C.2).

### 6.6 Testes

❌ NAO: Gerar testes sem rodar para confirmar que passam.  
✅ FACA: npm run test apos criar/modificar.  
📎 Testes red dao falsa sensacao de cobertura (Regra G.1).

❌ NAO: Snapshot tests para validar logica de negocio.  
✅ FACA: Assertions explicitas (expect(result).toBe(expected)).  
📎 Snapshots frageis sao anti-pattern para logica de negocio (Regra G.3).

### 6.7 Divida-Primeiro + Prova de Higiene

❌ NAO: Iniciar feature nova ignorando divida tecnica pendente marcada em NEXT.  
✅ FACA: Priorize itens de divida classificados como prioritarios antes de expandir escopo funcional.

❌ NAO: Criar arquivo em `src/frontend` sem consultar `docs/PLACEMENT_RULES.md`.  
✅ FACA: Determine path exato pela arvore de decisao antes da primeira linha de codigo.

❌ NAO: Encerrar alteracao estrutural sem validar invariantes de placement.  
✅ FACA: Execute `validate:structure` e trate violacoes como bloqueantes.

❌ NAO: Encerrar sessao sem prova objetiva de higiene do diff.  
✅ FACA: Fechar sessao apenas com verificacao automatica de poluicao (exports mortos, logs de debug e marcadores TODO/FIXME/HACK/XXX) sem regressao.

❌ NAO: Criar hook/service/util/type novo sem verificar inventario ativo do projeto.  
✅ FACA: Consulte `.agent/memory/project-inventory.md` antes de criar novos artefatos reutilizaveis.
