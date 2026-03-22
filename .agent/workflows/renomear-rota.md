---
description: Renomear rota/módulo existente no Nexus-Arqui de forma segura. Análise de impacto completa, renomeação atômica multi-arquivo e verificação zero-resíduos.
---

# /renomear-rota — Renomeação Segura de Rota

> **Trigger automático:** "renomear rota", "mudar path", "alterar rota", "renomear módulo", "renomear página"
> **Agent:** `orchestrator` (multi-arquivo obrigatório)

> ⚠️ **OPERAÇÃO DE ALTO RISCO.** Renomear uma rota toca potencialmente 10+ arquivos.
> Qualquer dessincronização causa links quebrados ou imports mortos **silenciosamente**.
> Nunca executar sem a análise de impacto completa (Fase 1).

---

## Fase 0: Identificar a rota

Antes de qualquer ação, documentar:

| Campo                       | Valor                      | Exemplo                                            |
| --------------------------- | -------------------------- | -------------------------------------------------- |
| **path atual**              | Segmento de URL atual      | `gestao-caixa`                                     |
| **path novo**               | Segmento de URL desejado   | `fluxo-caixa`                                      |
| **domínio**                 | Módulo do ERP              | `financeiro`                                       |
| **é sub-rota?**             | Se sim, qual é o pai?      | Sim, pai: `financeiro`                             |
| **tem sub-rotas filhas?**   | Listar todas               | `gestao-caixa/extrato`, `gestao-caixa/conciliacao` |
| **nome do componente Page** | PascalCase atual           | `FinanceiroGestaoCaixaPage`                        |
| **nome do componente novo** | PascalCase novo (se mudar) | `FinanceiroFluxoCaixaPage`                         |

---

## Fase 1: Análise de Impacto (OBRIGATÓRIA — NUNCA PULAR)

Mapear **todos** os arquivos que referenciam o path antigo:

```bash
# 1. Referências ao path no código
grep -rn "gestao-caixa" src/frontend/ --include="*.tsx" --include="*.ts" -l

# 2. Referências em App.tsx (rotas)
grep -n "gestao-caixa" src/frontend/App.tsx

# 3. Referências em navegação/sidebar (se existir config)
grep -rn "gestao-caixa" src/frontend/ --include="*.ts" --include="*.tsx"

# 4. Referências em testes
grep -rn "gestao-caixa" src/frontend/ --include="*.test.*" -l

# 5. Referências na documentação .agent/
grep -rn "gestao-caixa" .agent/ --include="*.md" -l
grep -rn "gestao-caixa" docs/ --include="*.md" -l
```

### Template de impacto (preencher obrigatoriamente)

```markdown
## Impacto: renomear "gestao-caixa" → "fluxo-caixa"

| Arquivo                                                                    | Tipo de referência           | Ação                          |
| -------------------------------------------------------------------------- | ---------------------------- | ----------------------------- |
| `src/frontend/App.tsx`                                                     | Route path + import          | Alterar path + import path    |
| `src/frontend/pages/financeiro/gestao-caixa/`                              | Pasta de página              | Renomear pasta                |
| `src/frontend/pages/financeiro/gestao-caixa/FinanceiroGestaoCaixaPage.tsx` | Arquivo + nome de componente | Renomear arquivo + componente |
| `src/frontend/pages/financeiro/gestao-caixa/useGestaoCaixa.ts`             | Hook page-scoped             | Renomear hook                 |
| Link `navigate('/financeiro/gestao-caixa')` em ComponenteX                 | Navegação programática       | Atualizar path                |
| `.agent/rules/architecture-decisions.md`                                   | Documentação                 | Atualizar menções             |
| `docs/PLACEMENT_RULES.md`                                                  | Documentação                 | Atualizar se listado          |

**Total de arquivos impactados:** X
```

> 🔴 **Se total > 10 arquivos:** Dividir em 2 batches com `npm run verify` entre eles.

---

## Fase 2: Executar renomeação (ordem exata — NÃO reordenar)

A ordem importa para minimizar o tempo em estado inconsistente:

| Passo    | O que fazer                                      | Detalhe                                                                   |
| -------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| **2.1**  | Renomear pasta da página                         | `src/frontend/pages/{dom}/{antigo}/` → `src/frontend/pages/{dom}/{novo}/` |
| **2.2**  | Renomear arquivo Page (se nome muda)             | `*AntigoPage.tsx` → `*NovoPage.tsx`                                       |
| **2.3**  | Renomear componente dentro do arquivo            | `export default function AntigoPage()` → `NovoPage()`                     |
| **2.4**  | Renomear hooks page-scoped (se existem)          | `useAntigo.ts` → `useNovo.ts` (+ nome da função)                          |
| **2.5**  | Atualizar `App.tsx` — import                     | import path deve refletir nova pasta/arquivo                              |
| **2.6**  | Atualizar `App.tsx` — Route path                 | `<Route path="antigo"` → `<Route path="novo"`                             |
| **2.7**  | Atualizar navegação/sidebar config               | Se existe arquivo de configuração de menu                                 |
| **2.8**  | Atualizar `navigate()` e `<Link>` programáticos  | Todos os componentes que linkam para a rota                               |
| **2.9**  | Atualizar testes que referenciam path/componente | Imports e assertions                                                      |
| **2.10** | Atualizar documentação `.agent/` e `docs/`       | Menções ao nome antigo                                                    |

---

## Fase 3: Se tem sub-rotas filhas

```
As sub-rotas alteram o segmento DELAS?
├─ SIM → Aplicar Fase 2 recursivamente para cada sub-rota
│
└─ NÃO (sub-rotas são relativas ao pai) → Apenas verificar:
         ├─ Imports das sub-rotas no App.tsx apontam para nova pasta?
         ├─ Sub-rotas page-scoped movidas junto com pasta pai?
         └─ Nenhuma sub-rota com path absoluto hardcoded?
```

---

## Fase 4: Verificação zero-resíduos

// turbo

```bash
# OBRIGATÓRIO: grep pelo nome antigo — deve retornar ZERO resultados
grep -rn "gestao-caixa" src/frontend/ --include="*.tsx" --include="*.ts"
grep -rn "gestao-caixa" .agent/ docs/ --include="*.md"
```

Se **qualquer** resultado aparecer → corrigir antes de prosseguir.

---

## Fase 5: Validação estrutural

// turbo

```bash
# Verificar que arquivos estão nos locais corretos
npm run validate:structure

# Quality gate completo
npm run verify
```

Deve retornar `[VERIFY][LOOP][PASS]`.

---

## Fase 6: Atualizar NEXT.md

Registrar a renomeação para contexto futuro:

```markdown
### Renomeação: gestao-caixa → fluxo-caixa

- **Data:** YYYY-MM-DD
- **Motivo:** [justificativa]
- **Arquivos impactados:** X
```

---

## Regras de Segurança

1. **NUNCA** renomear sem análise de impacto completa (Fase 1)
2. **NUNCA** começar por `App.tsx` — começar pela pasta/arquivo fonte
3. **NUNCA** fazer rename parcial (rename pasta mas não o import) — tudo na mesma sessão
4. **NUNCA** renomear services de infraestrutura (`api.ts`, `storageService.ts`) — Don't Touch list
5. **SEMPRE** rodar grep de zero-resíduos antes do quality gate
6. Se renomear envolve contrato de tipos (`src/frontend/types/`) → atualizar `docs/data-contracts/types-contracts.md`
