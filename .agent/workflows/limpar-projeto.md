---
description: Auditoria consolidada de código morto, poluição e integridade estrutural. Limpeza profunda do projeto Nexus-Arqui.
---

# /limpar-projeto — Auditoria Consolidada de Limpeza

> **Trigger automático:** "limpar projeto", "dead code", "clean up", "código morto", "higiene do projeto", "health check + limpeza"
> **Agent:** `orchestrator` (multi-arquivo) ou `frontend-specialist` (escopo menor)

---

## Propósito

Executa uma auditoria completa do projeto para identificar e remover toda forma de poluição, código morto, e inconsistência estrutural. **Complementa** o `/health-check` (que apenas diagnostica) ao **aplicar as correções** de forma segura e incremental.

---

## Fase 0: Baseline — Capturar estado atual

// turbo

```bash
# Capturar métricas antes de limpar (evidence-based)
npm run check:pollution
npm run check:duplication
npm run check:lines
npm run validate:structure
```

> **Registrar** os números iniciais para comparar ao final.

---

## Fase 1: Imports Mortos

Identificar e remover imports não utilizados em **todos** os arquivos:

```bash
# Lint identifica unused imports
npm run lint 2>&1 | findstr "no-unused"
```

**Para cada arquivo com imports mortos:**

1. Abrir o arquivo
2. Remover o import não utilizado
3. Verificar se o módulo importado ainda tem outros consumidores
4. Se não tem → considerar se o arquivo-fonte também é órfão (Fase 3)

---

## Fase 2: Exports Mortos (Barrel Pollution)

Verificar barrels (`index.ts`) que exportam módulos que ninguém importa:

```
Para cada barrel em src/frontend/components/**/index.ts:
├─ Listar todos os exports
├─ Para cada export:
│  ├─ Buscar consumidores: grep -r "import.*{NomeExportado}" src/frontend/ --include="*.ts" --include="*.tsx"
│  ├─ Se ZERO consumidores → Remover do barrel
│  │  └─ O arquivo exportado também é órfão? → Fase 3
│  └─ Se tem consumidores → OK, manter
```

Repetir para:

- `src/frontend/hooks/index.ts`
- `src/frontend/utils/index.ts`
- `src/frontend/components/ui/index.ts`

---

## Fase 3: Arquivos Órfãos (Sem Consumidor)

```bash
# Buscar componentes sem importação
for file in src/frontend/components/**/*.tsx; do
  nome=$(basename $file .tsx)
  resultado=$(grep -rl "$nome" src/frontend/ --include="*.tsx" --include="*.ts" | grep -v "$file" | head -1)
  if [ -z "$resultado" ]; then
    echo "ÓRFÃO: $file"
  fi
done
```

**Classificar cada órfão:**

```
Arquivo sem consumidor?
├─ É rota de App.tsx?     → NÃO é órfão, é entry point
├─ É export de barrel?    → Verificar quem consome o barrel
├─ É lazy-loaded?         → Verificar dynamic import
├─ É tipo (types/)?       → Verificar se services/hooks consomem
│
└─ NENHUM consumidor real → Candidato a DELEÇÃO
   → Confirmar com usuário antes de deletar componentes de domínio
   → Deletar sem perguntar: stubs vazios, componentes placeholder
```

---

## Fase 4: Hooks Sem Consumidor

```bash
# Hooks globais sem import
grep -rl "export function use" src/frontend/hooks/ --include="*.ts" | while read f; do
  nome=$(grep -oP "export function (use\w+)" "$f" | head -1 | cut -d' ' -f3)
  if [ -n "$nome" ]; then
    consumidores=$(grep -rl "$nome" src/frontend/ --include="*.ts" --include="*.tsx" | grep -v "$f" | wc -l)
    if [ "$consumidores" -eq 0 ]; then
      echo "HOOK ÓRFÃO: $f ($nome)"
    fi
  fi
done
```

Hook sem consumidor → **deletar arquivo + remover do barrel**.

---

## Fase 5: Console.log / Debug — Tolerância Zero

```bash
# Buscar console.log restantes (exceto em test/)
grep -rn "console\.\(log\|debug\|trace\|warn\)" src/frontend/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "node_modules"
```

Cada `console.log` encontrado:

- Em services/infrastructure → **Pode ser intencional** (log de erro). Avaliar caso a caso.
- Em components/pages/hooks → **Remover imediatamente**. É debug esquecido.

---

## Fase 6: Código Comentado

```bash
# Buscar blocos de código comentado
grep -rn "^\s*//" src/frontend/ --include="*.tsx" --include="*.ts" | grep -v "eslint" | grep -v "@" | grep -v "TODO" | grep -v "http" | head -50
```

**Regra:** Código comentado é código morto. O Git é o backup. **Deletar**.

Exceções aceitáveis:

- Comentários JSDoc (`/** ... */`)
- Links para issues/docs (`// https://...`)
- Itens em `NEXT.md` referenciados por `// TODO(NEXT.md)`
- Explicação de lógica complexa de negócio

---

## Fase 7: Marcadores TODO/FIXME/HACK/XXX

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" src/frontend/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".test."
```

Para cada marcador:

- **Tem item correspondente no `NEXT.md`?**
  - SIM → OK, manter
  - NÃO → Ou registrar no `NEXT.md`, ou resolver agora, ou deletar se obsoleto

---

## Fase 8: Duplicação de Código

// turbo

```bash
npm run check:duplication
```

Para cada bloco duplicado encontrado:

1. Identificar os 2+ arquivos que compartilham o código
2. Extrair para:
   - `src/frontend/utils/` se é lógica pura
   - `src/frontend/hooks/` se usa React
   - `src/frontend/components/ui/` se é JSX visual
3. Substituir nos consumidores originais
4. Rodar `npm run check:duplication` novamente

---

## Fase 9: Validação Estrutural

// turbo

```bash
# Verificar se todos os arquivos estão onde deveriam
npm run validate:structure

# Verificar métricas de poluição após limpeza
npm run check:pollution
```

Comparar com os números da Fase 0:

- Poluição: deve ter **diminuído**
- Duplicação: deve ter **diminuído**
- Estrutura: deve estar **100% válida**

---

## Fase 10: Quality Gate Final

// turbo

```bash
npm run verify
```

Deve retornar `[VERIFY][LOOP][PASS]`.

---

## Fase 11: Relatório de Limpeza

Ao final, gerar relatório comparativo:

```markdown
## 🧹 Relatório de Limpeza — [data]

### Métricas

| Indicador           | Antes    | Depois   | Δ   |
| ------------------- | -------- | -------- | --- |
| Imports mortos      | X        | Y        | -Z  |
| Exports órfãos      | X        | Y        | -Z  |
| Arquivos órfãos     | X        | Y        | -Z  |
| console.log (debug) | X        | Y        | -Z  |
| Código comentado    | X linhas | Y linhas | -Z  |
| Duplicação (%)      | X%       | Y%       | -Z% |
| Poluição (total)    | X        | Y        | -Z  |

### Ações realizadas

- [ ] Imports mortos removidos
- [ ] Barrels atualizados
- [ ] Arquivos órfãos deletados
- [ ] Console.log de debug removidos
- [ ] Código comentado removido
- [ ] TODOs registrados em NEXT.md
- [ ] Duplicação reduzida
- [ ] validate:structure → PASS
- [ ] npm run verify → [VERIFY][LOOP][PASS]

### NEXT.md atualizado com

- [itens residuais que precisam de ação futura]
```

---

## Regras de segurança

1. **Nunca deletar sem verificar consumidores** — grep é obrigatório
2. **Nunca deletar services de infraestrutura** (`api.ts`, `storageService.ts`) — Don't Touch list
3. **Deletar em batches pequenos** — verificar verify após cada batch de ~5 arquivos
4. **Git diff ao final** — review visual de tudo que foi removido
5. **Sem refactor big-bang** — se a limpeza requer refactor, registrar no NEXT.md como tarefa separada

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
