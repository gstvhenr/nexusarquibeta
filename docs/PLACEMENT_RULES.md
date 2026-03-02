# PLACEMENT_RULES.md

## Domains Registry

- `home` -> `src/frontend/pages/home/*`
- `agenda` -> `src/frontend/pages/agenda/*`
- `comercial` -> `src/frontend/pages/comercial/*`
- `projetos` -> `src/frontend/pages/projetos/*`
- `clientes` -> `src/frontend/pages/clientes/*`
- `financeiro` -> `src/frontend/pages/financeiro/*`
- `documentos` -> `src/frontend/pages/documentos/*`
- `suprimentos` -> `src/frontend/pages/suprimentos/*`
- `gestao-marketing` -> `src/frontend/pages/gestao-marketing/*`
- `prestadores-freelancers` -> `src/frontend/pages/prestadores-freelancers/*`
- `relatorios` -> `src/frontend/pages/relatorios/*`
- `configuracoes` -> `src/frontend/pages/configuracoes/*`

## Decision Tree (SIM/NAO)

1. E uma rota de menu/submenu?

- SIM -> criar em `src/frontend/pages/<dominio>/<feature>/<Page>.tsx` (ex.: `src/frontend/pages/financeiro/gestao-caixa/FinanceiroGestaoCaixaPage.tsx`)
- NAO -> 2

2. E provider/contexto global?

- SIM -> criar em `src/frontend/context/<Name>Context.ts[x]` (ex.: `src/frontend/context/FinanceContext.ts`)
- NAO -> 3

3. E contrato de tipo/interface de dominio?

- SIM -> criar em `src/frontend/types/<dominio>.ts` (ex.: `src/frontend/types/project.ts`)
- NAO -> 4

4. E tipo local de uma feature (nao reaproveitavel globalmente)?

- SIM -> co-locar em `types.ts` no diretorio da feature (ex.: `src/frontend/pages/projetos/detalhes/types.ts`)
- NAO -> 5

5. E regra de negocio/orquestracao reutilizavel?

- SIM -> 6
- NAO -> 8

6. Toca persistencia, storage, seed, adaptador, API ou integracao externa?

- SIM -> criar em `src/frontend/services/infrastructure/**` (ex.: `src/frontend/services/infrastructure/loadData.ts`)
- NAO -> 7

7. E service de dominio?

- SIM -> criar em `src/frontend/services/**/<name>Service.ts` (ex.: `src/frontend/services/clientService.ts`)
- NAO -> 8

8. E hook React?

- SIM -> 9
- NAO -> 11

9. E hook global/reutilizavel entre dominios?

- SIM -> criar em `src/frontend/hooks/use<Feature>.ts` (ex.: `src/frontend/hooks/useProjectFinancials.ts`)
- NAO -> 10

10. E hook escopado a pagina/feature?

- SIM -> co-locar em `src/frontend/pages/<dominio>/<feature>/use<Feature>.ts` ou `.../hooks/use<Feature>.ts` (ex.: `src/frontend/pages/projetos/detalhes/useProjectLifecycleActions.ts`)
- NAO -> 11

11. E componente visual?

- SIM -> 12
- NAO -> 14

12. E primitivo/UI shared (button, modal, icons, shell)?

- SIM -> criar em `src/frontend/components/ui/*` (ex.: `src/frontend/components/ui/Button.tsx`)
- NAO -> 13

13. E componente de dominio/feature?

- SIM -> criar em `src/frontend/components/<dominio>/*` ou co-locar na page quando estritamente page-scoped (ex.: `src/frontend/components/projetos/TaskDetailModal.tsx`)
- NAO -> 14

14. E funcao pura/helper sem side effects relevantes?

- SIM -> criar em `src/frontend/utils/<topic>.ts` (ex.: `src/frontend/utils/projectFinancials.ts`)
- NAO -> 15

15. E constante shared?

- SIM -> criar em `src/frontend/constants/<topic>.ts[x]` (ex.: `src/frontend/constants/ui.tsx`)
- NAO -> 16

16. E teste automatizado?

- SIM -> co-locar com source como `<name>.test.ts[x]`; excecao apenas para harness/fixtures em `src/frontend/test/**` (ex.: `src/frontend/services/clientService.test.ts`)
- NAO -> parar e reavaliar contrato antes de criar arquivo

## Naming Conventions

- `*Service.ts` -> obrigatorio em `src/frontend/services/**`
- `use*.ts` -> obrigatorio em `src/frontend/hooks/**` ou `src/frontend/pages/**`
- `*.test.ts` / `*.test.tsx` -> obrigatorio no mesmo diretorio do source (exceto `src/frontend/test/**`)
- `index.ts` -> barrel obrigatorio para diretorios com multiplos arquivos reaproveitaveis
- `*Context.ts` / `*Context.tsx` -> obrigatorio em `src/frontend/context/**`
- `*Page.tsx` -> obrigatorio em `src/frontend/pages/**`

## Co-location Rules

- Testes unitarios ficam no mesmo diretorio do arquivo testado.
- Subcomponentes exclusivos de uma page ficam no mesmo diretorio da page.
- Hook page-scoped fica no diretorio da page (ou subpasta `hooks/` dentro da page).
- `types.ts` local existe apenas quando o tipo nao e reutilizado globalmente.
- Sempre criar/atualizar `index.ts` quando um diretorio expuser 2+ modulos reutilizaveis.

## Anti-patterns

- `src/frontend/pages/ClientesPage.tsx` -> mover para `src/frontend/pages/clientes/ClientesPage.tsx`
- `src/frontend/components/ModalNovo.tsx` -> mover para `src/frontend/components/ui/ModalNovo.tsx` ou dominio correto
- `src/frontend/utils/clientService.ts` -> mover para `src/frontend/services/clientService.ts`
- `src/frontend/services/useFoo.ts` -> mover para `src/frontend/hooks/useFoo.ts` ou page-scoped
- `src/frontend/pages/projetos/ProjetoX.test.tsx` sem `ProjetoX.tsx` no mesmo diretorio -> co-locar corretamente
