---
description: Quick repository health diagnostic. Runs all quality gates and presents a health dashboard. Does NOT fix — only diagnoses and prioritizes.
---

# /health-check - Diagnóstico Rápido de Saúde do Repositório

$ARGUMENTS

---

## Propósito

Radiografia rápida do estado real do repositório. Responde: **"O que precisa de atenção agora?"**

Ideal para início de sessão ou após dias sem tocar no projeto. Não corrige nada — apenas diagnostica e prioriza.

---

## Comportamento

Quando `/health-check` for acionado:

### 1. Rodar Gates (sequencial, fail-safe)

// turbo-all

Executar cada gate individualmente, **sem parar no primeiro erro** (diferente do `npm run verify` que é fail-fast). Capturar resultado de cada um:

```powershell
npm run typecheck
npm run lint
npm run format:check
npm run check:docs:governance
npm run check:lines
npm run check:duplication
npm run test:coverage
npm run build
```

### 2. Coletar métricas extras

// turbo

```powershell
npm run check:lines:ratchet:check
```

### 3. Gerar Painel de Saúde

Compilar resultados no formato abaixo.

---

## Output Format

```markdown
## 🏥 Health Check — Nexus-Arqui

📅 Data: [YYYY-MM-DD HH:MM]

### Painel de Saúde

| Gate             | Status | Detalhes            |
| ---------------- | ------ | ------------------- |
| TypeCheck        | ✅/❌  | [erros se houver]   |
| Lint             | ✅/❌  | [warnings/errors]   |
| Format           | ✅/⚠️  | [arquivos afetados] |
| Docs Governance  | ✅/❌  | [resultado]         |
| Line Limits      | ✅/⚠️  | [hotspots]          |
| Code Duplication | ✅/⚠️  | [clones detectados] |
| Test Coverage    | ✅/❌  | [% atual vs meta]   |
| Build            | ✅/❌  | [erros se houver]   |
| Line Ratchet     | ✅/⚠️  | [stale ou ok]       |

### Resumo

- 🟢 **Saudável:** X/9 gates
- 🟡 **Atenção:** Y itens
- 🔴 **Crítico:** Z itens

### 🎯 Prioridade de Ação

1. [Gate mais crítico] — [ação sugerida]
2. [Segundo mais crítico] — [ação sugerida]
3. ...

### 📋 Próximo Passo Recomendado

[Sugestão concreta: `/debug`, `/refactor`, `npm run lint --fix`, etc.]
```

---

## Regras

1. **Não corrigir** — o workflow é somente diagnóstico
2. **Não parar no primeiro erro** — rodar todos os gates
3. **Priorizar por severidade** — TypeCheck/Build > Lint > Coverage > Format
4. **Ser objetivo** — sem comentários editoriais, apenas fatos e números

---

## Categorias de Severidade

| Severidade | Gates                            | Impacto              |
| ---------- | -------------------------------- | -------------------- |
| 🔴 Crítico | TypeCheck, Build, Test           | Código não funciona  |
| 🟡 Atenção | Lint, Coverage, Duplication      | Qualidade degradando |
| ⚪ Info    | Format, Docs Governance, Ratchet | Higiene e governança |

---

## Exemplos de Uso

```text
/health-check
/health-check resumido
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
