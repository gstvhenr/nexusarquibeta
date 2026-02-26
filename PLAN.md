# PLAN.md - Migração Incremental para Primitivos UI (Gestão de Marketing)

## Escopo

- Substituir tags nativas (`<button>`, `<input>`, `<select>`) por primitivos UI do nosso Design System (`Button`, `Input`, `Select`, `Badge`, etc.) nos arquivos da feature de **Gestão de Marketing**.
- Melhorar a consistência visual mantendo a exata mesma regra de negócio e de propriedades.

## Fora de escopo

- Refatorar a lógica de negócios ou os hooks utilizados nas páginas.
- Migrar outras áreas do sistema (ex: Financeiro, Projetos, Clientes) nesta mesma sessão.

## Arquivos Alvo (Lote 1: Gestão de Marketing)

- [MODIFY] `src/pages/GestaoMarketingPage.tsx`
- [MODIFY] `src/pages/gestao-marketing/MarketingContentListView.tsx`
- [MODIFY] `src/pages/gestao-marketing/MarketingIdeasView.tsx`

## Comandos que serão executados

- Edição dos arquivos para importar e utilizar os primitivos da pasta `src/components/ui/`.
- `npm run verify` como gate final obrigatório.

## Riscos

- Quebra de layout caso alguma classe do Tailwind nativo conflite com as props predefinidas dos primitivos (ex: `className` sendo sobrescrito). **Mitigação:** revisar cuidadosamente a conversão de `className` para as props de variantes dos primitivos (`variant`, `size`, etc.), passando margens e espaçamentos no `className` residual quando necessário.

## Critérios Binários (Definition of Done)

- 100% das tags alvo nativas nos arquivos selecionados substituídas pelos primitivos adequados.
- Nenhuma quebra de layout relatada (mitigado pelas tipagens estruturadas).
- `npm run verify` verde.
- `NEXT.md` atualizado.
