# NEXT.md

## Regra de archival

- Quando este arquivo ultrapassar ~100 linhas, mover sessões antigas para `docs/changelog/session-log-YYYY-MM.md`.

## Último estado conhecido (2026-03-13)

Correcao pontual de acessibilidade em tabs com `role="tab"` para eliminar o erro do Microsoft Edge Tools/axe sobre valor invalido em `aria-selected`. O fechamento desta rodada ficou restrito ao ajuste ARIA e ao foco do campo de renomeacao, sem rodar o gate completo por direcionamento explicito do usuario.

### Checklist desta sessão

- [x] Corrigido `aria-selected` em `src/frontend/pages/agenda/bloco-de-notas/BlocoDeNotasPage.tsx` para usar booleano JSX (`aria-selected={active}`)
- [x] Alinhado o mesmo contrato em `src/frontend/components/ui/Tabs.tsx` para evitar recorrencia do mesmo erro em tabs compartilhadas
- [x] Removido `ref={(el) => el?.focus()}` do input de renomeacao em `BlocoDeNotasPage.tsx`, substituindo por `autoFocus`
- [ ] `npm run verify` (nao executado ate o fim por direcionamento do usuario)

### Concluído nesta sessão

- `src/frontend/pages/agenda/bloco-de-notas/BlocoDeNotasPage.tsx` — `aria-selected` de tabs ajustado para valor booleano valido para validação ARIA.
- `src/frontend/pages/agenda/bloco-de-notas/BlocoDeNotasPage.tsx` — foco do input de renomeacao migrado de callback ref com side effect para `autoFocus`.
- `src/frontend/components/ui/Tabs.tsx` — contrato de `aria-selected` alinhado com o mesmo padrao booleano dos tabs locais.

## Evidências da sessão

- `rg -n "aria-selected=\\{.*\\? 'true' : 'false'\\}" src/frontend` → sem ocorrencias apos a correcao
- `rg -n "ref=\\{\\(el\\) => el\\?\\.focus\\(\\)\\}" src/frontend/pages/agenda/bloco-de-notas/BlocoDeNotasPage.tsx` → sem ocorrencias apos a correcao
- `npm run verify` → interrompido por direcionamento do usuario para manter foco apenas no erro reportado

## Próximo passo exato

1. Revalidar no navegador o tab de `BlocoDeNotasPage` no Microsoft Edge Tools para confirmar o desaparecimento do alerta `axe/aria`.
2. Se necessario depois, executar apenas o gate que o usuario considerar pertinente.

## Bloqueios e dúvidas

- Nenhum bloqueio funcional identificado para a correcao pontual; validacao global ficou deliberadamente fora do escopo desta sessao.

---

## Último estado conhecido (2026-03-13)

Implementação da trilha prioritária de padronização estática da `UI Surface`. Consolidação de `useDisclosure`, adoção de `Button` / `IconButton` / `Select` / `Input` / `Textarea` / `FormField` / `Tabs` nos hotspots auditados, limpeza do boundary visual em `formatters.ts` e `taskUtils.ts`, e cobertura inicial de contrato para os utils alterados.

### Checklist desta sessão

- [x] `Wave 1`: normalização de modal/disclosure state em `ClientesPage`, `ProjetoDetalhesPageContent` e `PropostaDetalhesPage`
- [x] `Wave 2`: barrel de `Tabs` exposto em `components/ui/index.ts`; adoção em `ProjetoDetalhesTabs`; consolidação de actions com `Button` / `IconButton`
- [x] `Wave 3`: consolidação de form controls em `ProjetoDetalhesOverviewTab`, `PropostaDetalhesPage`, `ClientesDataManagementModal` e `ServicosContratadosPage`
- [x] `Wave 4`: `getDeadlineInfo()` sem `className`; `priorityConfig` / `KANBAN_COLUMNS` migrados para `tone` semântico
- [x] Testes adicionados em `src/frontend/utils/formatters.test.ts` e `src/frontend/utils/taskUtils.test.ts`
- [x] `npm run verify` → PASS
- [x] `npm run validate:structure` → PASS com warning baselineado em `src/frontend/context/useDomain.ts`
- [x] `depcruise` → `0 errors`, `1 warning` de órfão em `src/frontend/services/infrastructure/storageService.ts`
- [ ] `npm run check:pollution` verde
      Motivo: baseline histórico amplo de pollution fora do escopo desta trilha
      Evidência adicional: `npm run check:pollution:ratchet:check` indicou apenas baseline apertável em exports antigos de `components/layout/index.ts` e `services/infrastructure/persistence/index.ts`

### Concluído nesta sessão

- `src/frontend/pages/projetos/detalhes/ProjetoDetalhesPageContent.tsx` — disclosure states padronizados; ações e modais alinhados com `useDisclosure`.
- `src/frontend/pages/projetos/detalhes/ProjetoDetalhesOverviewTab.tsx` — reconstruído com primitives de formulário e actions padronizadas.
- `src/frontend/pages/projetos/detalhes/ProjetoDetalhesTabs.tsx` — adoção do barrel público de `Tabs` e remoção do `commonInputClass` da `overview`.
- `src/frontend/pages/clientes/ClientesPage.tsx` e `src/frontend/pages/clientes/ClientesDataManagementModal.tsx` — disclosure/modal state e UI de exportação/importação consolidados.
- `src/frontend/pages/comercial/propostas/PropostaDetalhesPage.tsx` — modais padronizados com disclosure; selects e actions migrados para UI shared.
- `src/frontend/pages/financeiro/FinanceiroVisaoGeralPage.tsx` — navegação mensal e toggles migrados para `Button` / `IconButton`.
- `src/frontend/pages/prestadores-freelancers/servicos-contratados/ServicosContratadosPage.tsx` — deadline styling local, selects padronizados e icon actions consolidadas.
- `src/frontend/pages/agenda/tarefas/TarefasPage.tsx` e `src/frontend/pages/agenda/tarefas/TaskCard.tsx` — semântica de `tone` aplicada às colunas e cards do kanban.
- `src/frontend/components/projetos/ProjectComponents.tsx` e `src/frontend/pages/home/HomePage.tsx` — consumers ajustados para `deadlineInfo.status` em vez de classe visual vinda do util.
- `src/frontend/utils/formatters.ts` e `src/frontend/utils/taskUtils.ts` — boundary visual removido dos utils; contrato agora é semântico.

## Evidências da sessão

- `npm run baseline` → PASS (`typecheck` ok)
- `npm run test` → PASS (`2` arquivos / `6` testes)
- `npm run format:check` → PASS
- `npm run validate:structure` → PASS
- `npm run verify` → PASS com `[VERIFY][LOOP][PASS]`
- `npm run check:pollution` → FAIL por baseline histórico do repositório
- `npm run check:pollution:ratchet:check` → FAIL apenas porque o baseline pode ser apertado; sem evidência de regressão estrutural nova nesta trilha

## Próximo passo exato

1. Executar smoke manual das telas alteradas: `ClientesPage`, `ProjetoDetalhesPageContent`, `ProjetoDetalhesOverviewTab`, `PropostaDetalhesPage`, `FinanceiroVisaoGeralPage` e `ServicosContratadosPage`.
2. Abrir trilha separada para apertar o baseline de `pollution` e revisar exports antigos em `components/layout/index.ts` e `services/infrastructure/persistence/index.ts`.
3. Manter deferida a normalização de cores HSL de gráficos e mapas visuais fora do escopo desta onda.

## Bloqueios e dúvidas

- `npm run check:pollution` continua vermelho por dívida histórica ampla do repositório, não por regressão específica desta sessão.
- O warning de órfão em `src/frontend/services/infrastructure/storageService.ts` permanece como baseline conhecido.
