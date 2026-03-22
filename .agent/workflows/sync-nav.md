---
description: Auditar sincronia entre configuração de rotas e App.tsx. Detecta links mortos, rotas órfãs e divergências de navegação.
---

# /sync-nav — Auditoria de Navegação

> **Trigger automático:** "sincronizar navegação", "verificar rotas", "nav desatualizado", "links quebrados", "rotas inconsistentes"
> **Agent:** `orchestrator`

> 🎯 **Propósito:** Detectar divergências silenciosas entre a definição de rotas e a implementação real.
> Links quebrados no menu lateral são invisíveis até o usuário clicar.

---

## Fase 1: Extrair rotas de App.tsx

Ler `src/frontend/App.tsx` e listar **todos** os `<Route>` com seus paths completos:

```
Para cada <Route path="X">:
├─ Reconstruir fullPath considerando aninhamento de <Route> pais
├─ Registrar: fullPath, elemento/componente, é lazy?
└─ Anotar: rota dentro ou fora do layout principal
```

### Formato da extração

| #   | Full Path                  | Componente                  | Lazy? | Dentro do Layout? |
| --- | -------------------------- | --------------------------- | ----- | ----------------- |
| 1   | `/`                        | `HomePage`                  | Não   | Sim               |
| 2   | `/clientes`                | `ClientesPage`              | Sim   | Sim               |
| 3   | `/financeiro/gestao-caixa` | `FinanceiroGestaoCaixaPage` | Sim   | Sim               |

---

## Fase 2: Extrair rotas da navegação/sidebar

Localizar a configuração de menu/sidebar no projeto e extrair todos os paths definidos:

```
Possíveis locais:
├─ src/frontend/App.tsx (configuração inline de menu)
├─ src/frontend/config/navigation.ts
├─ src/frontend/constants/routes.ts
├─ Definição hardcoded no componente Sidebar
└─ Outro local (grep por "path:" ou "href:" em componentes de layout)
```

Se o menu é montado diretamente no Sidebar sem arquivo de config:

```bash
# Buscar definições de navegação
grep -rn "path:\|href:\|to=" src/frontend/components/ --include="*.tsx" | grep -v node_modules | head -30
```

### Formato da extração

| #   | Path do Menu               | Label           | Ícone          | Nível     |
| --- | -------------------------- | --------------- | -------------- | --------- |
| 1   | `/`                        | Home            | House          | Top-level |
| 2   | `/clientes`                | Clientes        | Users          | Top-level |
| 3   | `/financeiro/gestao-caixa` | Gestão de Caixa | CurrencyDollar | Sub-rota  |

---

## Fase 3: Comparar e detectar divergências

Cruzar as duas listas e gerar relatório:

| Path               | App.tsx (Route) | Menu/Sidebar | Status            | Ação                              |
| ------------------ | --------------- | ------------ | ----------------- | --------------------------------- |
| `/`                | ✅              | ✅           | ✅ OK             | —                                 |
| `/clientes`        | ✅              | ✅           | ✅ OK             | —                                 |
| `/nova-feature`    | ✅              | ❌           | ⚠️ **FALTA MENU** | Adicionar item no menu            |
| `/pagina-removida` | ❌              | ✅           | 🔴 **LINK MORTO** | Menu aponta para rota inexistente |
| `/rota-orfã`       | ✅              | ❌           | 🟡 **ROTA ÓRFÃ**  | Route existe mas não é navegável  |

### Tipos de divergência

| Tipo              | Significado                                     | Severidade                      |
| ----------------- | ----------------------------------------------- | ------------------------------- |
| **LINK MORTO**    | Menu aponta para rota que não existe no App.tsx | 🔴 Crítico — usuário vê erro    |
| **FALTA MENU**    | Route existe mas não aparece no menu            | ⚠️ Médio — pode ser intencional |
| **ROTA ÓRFÃ**     | Route sem import ou componente                  | 🔴 Crítico — página em branco   |
| **PATH MISMATCH** | Menu e Route usam paths diferentes              | 🔴 Crítico — 404 silencioso     |
| **IMPORT MORTO**  | Import de página que não tem Route              | 🟡 Baixo — poluição             |

---

## Fase 4: Verificar existência dos arquivos de página

Para cada `<Route>` em App.tsx, verificar se o arquivo da página existe:

```
<Route path="X" element={<NomePage />} />
├─ O import no topo do App.tsx é válido?
├─ O arquivo src/frontend/pages/.../NomePage.tsx existe?
├─ O arquivo exporta default function?
└─ Se lazy loading: o import() resolve?
```

```bash
# Verificar que todos os imports de páginas resolvem
npm run typecheck 2>&1 | grep "Cannot find module\|Module not found"
```

---

## Fase 5: Verificar rotas especiais

Algumas rotas podem intencionalmente ficar fora do layout principal (como a rota `/documentos` do Portal Morada). Documentar essas exceções:

```
Rota fora do layout principal?
├─ SIM → É intencional e documentado?
│        ├─ SIM → OK, anotar como exceção conhecida
│        └─ NÃO → Registrar como decisão arquitetural (DECISIONS-active.md)
│
└─ NÃO → Deve estar dentro do layout wrapper
```

---

## Fase 6: Relatório final

```markdown
## 🗺️ Auditoria de Navegação — [data]

### Status geral: ✅ SINCRONIZADO / ⚠️ DIVERGÊNCIAS ENCONTRADAS

### Rotas válidas: X/Y (100% / XX%)

| Path | Route | Menu | Arquivo | Status |
| ---- | ----- | ---- | ------- | ------ |
| `/`  | ✅    | ✅   | ✅      | OK     |
| ...  | ...   | ...  | ...     | ...    |

### Divergências encontradas: Z

| #   | Tipo       | Path             | Ação necessária   |
| --- | ---------- | ---------------- | ----------------- |
| 1   | LINK MORTO | `/rota-removida` | Remover do menu   |
| 2   | FALTA MENU | `/nova-feature`  | Adicionar ao menu |

### Exceções documentadas:

- `/documentos` — fora do layout (intencional, ver DECISIONS-active.md)
```

---

## Fase 7: Corrigir divergências (se houver)

Para cada divergência encontrada:

| Tipo              | Correção                                       |
| ----------------- | ---------------------------------------------- |
| **LINK MORTO**    | Remover item do menu/sidebar                   |
| **FALTA MENU**    | Adicionar NavItem no config de navegação       |
| **ROTA ÓRFÃ**     | Criar página (`/nova-pagina`) ou remover Route |
| **PATH MISMATCH** | Alinhar menu e Route para mesmo path           |
| **IMPORT MORTO**  | Remover import não utilizado do App.tsx        |

// turbo

```bash
npm run verify
```

Deve retornar `[VERIFY][LOOP][PASS]`.

---

## Quando executar esta auditoria

| Momento               | Obrigatório?                                          |
| --------------------- | ----------------------------------------------------- |
| Após `/nova-pagina`   | ✅ Sim — verificar que Route + Menu estão alinhados   |
| Após `/renomear-rota` | ✅ Sim — confirmar zero-resíduos de navegação         |
| Após deletar página   | ✅ Sim — garantir que menu não aponta para rota morta |
| No `/health-check`    | ✅ Sim — incluído como sub-diagnóstico                |
| Periodicamente        | 🟡 Recomendado a cada 5 sessões                       |
