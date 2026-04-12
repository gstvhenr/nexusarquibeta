---
description: Identificar e tratar módulos órfãos (sem consumidores). Classifica dead code vs entry points legítimos, lazy-loaded e type-only. Remove com safety net.
---

# /orphan-modules — Tratar Módulos Órfãos

$ARGUMENTS

---

## Propósito

Identificar módulos que **ninguém importa**, classificar se são dead code real ou falsos positivos, e remover com segurança quando confirmado.

> **Agente recomendado:** `architecture-health-doctor`

---

## 🔴 Regras Invioláveis

1. **Classificar antes de remover** — nunca deletar sem confirmar que é dead code
2. **1 módulo por remoção** — sem batch delete
3. **`npm run verify` antes e depois** — evidência obrigatória
4. **Preservar módulos lazy-loaded, type-only e test utils** — são legítimos

---

## Comportamento

### 1. Listar candidatos a órfãos

// turbo

Usar dependency-cruiser para identificar módulos sem dependentes:

```powershell
npx depcruise src --output-type json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));d.modules.filter(m=>m.dependents.length===0&&!m.source.includes('.test.')&&!m.source.includes('.spec.')).forEach(m=>console.log(m.source))"
```

**Alternativa simples** (se depcruise não suportar a flag):

Para cada arquivo suspeito, verificar se é importado:

```powershell
grep -r "from.*caminho/do/modulo" src/ --include="*.ts" --include="*.tsx" -l
```

Se o resultado for vazio → candidato a órfão.

### 2. Classificar cada candidato

Para cada módulo sem consumidores, classificar:

| Classificação   | Critério                                           | Ação                              |
| --------------- | -------------------------------------------------- | --------------------------------- |
| **Dead code**   | Ninguém importa, não é entry point, não é lazy     | ✅ Remover                        |
| **Entry point** | É rota de página, bootstrap ou script              | ⚠️ Reclassificar, não é órfão     |
| **Lazy-loaded** | Usado via `React.lazy()` ou dynamic `import()`     | ⚠️ Legítimo                       |
| **Type-only**   | `.d.ts` ou arquivo que só exporta tipos/interfaces | ⚠️ Legítimo (TypeScript consome)  |
| **Test util**   | Helper de teste, fixture, factory                  | ⚠️ Legítimo (test runner consome) |
| **Incerto**     | Não se encaixa claramente em nenhuma categoria     | 📝 Marcar para revisão            |

### 3. Confirmar lista com o usuário

Apresentar tabela com classificação e **aguardar confirmação** antes de remover.

### 4. Capturar baseline

// turbo

```powershell
npm run verify
```

### 5. Remover dead code confirmado (1 por vez)

Para cada módulo confirmado como dead code:

1. Verificar se não há `grep` residual (comentários, strings reference)
2. Remover o arquivo
3. Atualizar barrel files (`index.ts`) se o módulo era re-exportado
4. Rodar `npm run verify`

### 6. Atualizar ratchets

// turbo

```powershell
npm run check:lines:ratchet
npm run check:pollution:ratchet
```

### 7. Registrar

- Atualizar `NEXT.md` com módulos removidos
- Se remoção em lote (>5 arquivos), registrar em `DECISIONS-active.md`

---

## Output Format

```markdown
## 🏚️ Orphan Audit: [data]

### Candidatos Identificados

| Módulo                    | Classificação      | Ação        |
| ------------------------- | ------------------ | ----------- |
| `src/utils/oldHelper.ts`  | Dead code          | ✅ Remover  |
| `src/pages/AboutPage.tsx` | Entry point (rota) | ⚠️ Legítimo |
| `src/types/legacy.d.ts`   | Type-only          | ⚠️ Legítimo |

### Removidos

- `src/utils/oldHelper.ts` — sem consumidores, sem lazy, sem type-only

### Evidência

- Baseline (antes): ✅ `npm run verify` verde
- Após remoção: ✅ `npm run verify` verde
- Ratchets atualizados: ✅
```

---

## Exemplos de Uso

```text
/orphan-modules
/orphan-modules diagnosticar apenas
/orphan-modules src/utils/
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
