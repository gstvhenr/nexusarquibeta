---
name: navigation-routing
description: Protocolo de sincronia entre rotas, menus e App.tsx no Nexus-Arqui. Use ao adicionar, remover ou modificar rotas, itens de menu ou estrutura de páginas. Crítico para prevenir links quebrados e rotas órfãs.
skills:
  - clean-code
---

# Navigation & Routing — Nexus-Arqui

> Este é um dos protocolos mais críticos do projeto. Dessincronização entre
> fontes de verdade de navegação e `App.tsx` causa links quebrados silenciosamente.

---

## Quando Ativar

- Adicionando nova página ou rota
- Removendo ou renomeando rota existente
- Modificando estrutura de menu ou sidebar
- Corrigindo links quebrados
- Qualquer alteração em `App.tsx` ou arquivos de navegação
- Executando `/sync-nav`, `/nova-pagina`, `/renomear-rota`

---

## 1. Fontes de Verdade

| Arquivo                                   | Papel                                                | Sincronização                |
| ----------------------------------------- | ---------------------------------------------------- | ---------------------------- |
| `src/frontend/App.tsx`                    | **Router central** — define `<Route>` e lazy imports | Manual — sempre em sincronia |
| `src/frontend/pages/{dominio}/{feature}/` | **Implementação** — componente da página             | Criado junto com a rota      |
| Sidebar/Menu config (se existir)          | **Navegação UI** — define menus e links              | Sincronizar com App.tsx      |

---

## 2. Padrão de Rota no Nexus-Arqui

### Estrutura de diretórios (por página)

```
src/frontend/pages/
├── {dominio}/
│   ├── {feature}/
│   │   ├── {FeaturePage}.tsx       ← Componente da página
│   │   ├── components/             ← Componentes privados da rota
│   │   │   └── FeatureTable.tsx
│   │   └── useFeatureData.ts       ← Hook scoped da feature
│   └── index.ts                    ← Barrel export (se necessário)
```

### Nomenclatura de páginas

| Elemento             | Padrão                           | Exemplo                                  |
| -------------------- | -------------------------------- | ---------------------------------------- |
| Pasta de domínio     | `camelCase`                      | `comercial/`, `financeiro/`, `projetos/` |
| Pasta de feature     | `camelCase`                      | `propostas/`, `gestaoCaixa/`             |
| Arquivo de página    | `PascalCase` + sufixo `Page.tsx` | `PropostasPage.tsx`                      |
| Componente de página | `PascalCase` + sufixo `Page`     | `function PropostasPage()`               |

---

## 3. Checklist: Adicionar Nova Rota

| Passo | Arquivo                            | Ação                                                               |
| ----- | ---------------------------------- | ------------------------------------------------------------------ |
| 1     | `src/frontend/pages/{dom}/{feat}/` | Criar pasta da feature                                             |
| 2     | `{feat}/{FeaturePage}.tsx`         | Criar componente com `export function`                             |
| 3     | `src/frontend/App.tsx` (imports)   | Adicionar `lazy(() => import(...))`                                |
| 4     | `src/frontend/App.tsx` (JSX)       | Adicionar `<Route path="..." element={<Suspense>...</Suspense>}/>` |
| 5     | Sidebar/Menu (se aplicável)        | Adicionar item de navegação                                        |
| 6     | Quality gate                       | `npm run verify`                                                   |

### Regras ao adicionar

- **Sempre** usar lazy loading via `React.lazy()` + `<Suspense>`
- **Sempre** seguir `docs/PLACEMENT_RULES.md` para determinar o path
- **Sempre** rodar `npm run validate:structure` após criar a pasta
- **Nunca** criar página sem rota correspondente em `App.tsx`

---

## 4. Checklist: Remover Rota

| Passo | Arquivo                            | Ação                           |
| ----- | ---------------------------------- | ------------------------------ |
| 1     | `src/frontend/App.tsx`             | Remover `import` e `<Route>`   |
| 2     | `src/frontend/pages/{dom}/{feat}/` | Deletar a pasta completa       |
| 3     | Sidebar/Menu (se aplicável)        | Remover item de navegação      |
| 4     | Componentes privados               | Garantir que não sobram órfãos |
| 5     | Quality gate                       | `npm run verify`               |

### Regras ao remover

- **Nunca** remover apenas o `<Route>` sem deletar a pasta da página
- **Sempre** verificar se componentes privados da página têm outros consumidores
- **Sempre** remover imports órfãos em `App.tsx`
- Rodar `npm run check:pollution` para detectar exports mortos

---

## 5. Checklist: Renomear Rota

| Passo | Arquivo           | Ação                                           |
| ----- | ----------------- | ---------------------------------------------- |
| 1     | Pasta de feature  | Renomear (ou mover) a pasta                    |
| 2     | Arquivo de página | Renomear se necessário (PascalCase + Page)     |
| 3     | `App.tsx`         | Atualizar `import` path e `<Route path="...">` |
| 4     | Sidebar/Menu      | Atualizar label e/ou path                      |
| 5     | Consumidores      | Grep por referências ao path antigo            |
| 6     | Quality gate      | `npm run verify`                               |

### Regras ao renomear

- **Sempre** usar o workflow `/renomear-rota` para garantir zero resíduos
- **Sempre** verificar hardcoded paths em componentes (`navigate('...')`, `<Link to="...">`)
- **Nunca** renomear parcialmente (atualizar tudo atomicamente)

---

## 6. Auditoria de Sincronização (Protocolo /sync-nav)

Para verificar que navegação e rotas estão sincronizadas:

```
1. Extrair todos os `path` de <Route> em App.tsx
2. Extrair todos os links/items de navegação da sidebar/menu
3. Comparar:
   a. Todo item de menu tem <Route> correspondente? → Se NÃO = link morto
   b. Todo <Route> tem item de menu? → Se NÃO = rota órfã (pode ser intencional)
4. Extrair navigate() e <Link to="..."> do codebase
5. Verificar se todos os paths existem como <Route>
```

### Saída esperada da auditoria

| Problema                                 | Severidade | Ação                                        |
| ---------------------------------------- | ---------- | ------------------------------------------- |
| Link no menu sem `<Route>`               | 🔴 Crítico | Criar rota ou remover link                  |
| `<Route>` sem item no menu               | 🟡 Aviso   | Intencional? Se não, adicionar ao menu      |
| `navigate('path')` para rota inexistente | 🔴 Crítico | Corrigir o path ou criar a rota             |
| Página sem consumidores (import morto)   | 🟠 Alto    | Verificar se é lazy-loaded; se não, deletar |

---

## 7. Regras de Ouro

1. **Atualizar TUDO atomicamente** — Nunca criar página sem rota, nunca criar rota sem página
2. **Lazy loading por padrão** — Todas as páginas devem usar `React.lazy()`
3. **Menu e routes em sincronia** — Todo item de menu clicável deve ter `<Route>` correspondente
4. **Zero hardcoded paths** — Se um path muda, `grep` por todas as referências
5. **Quality gate obrigatório** — `npm run verify` após qualquer mudança de rota
6. **Consultar PLACEMENT_RULES** — Antes de criar pasta de página, verificar `docs/PLACEMENT_RULES.md`

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
