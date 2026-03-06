---
description: Analisar e reduzir acoplamento excessivo. Identifica God modules por fan-in/fan-out, classifica tipo de acoplamento e propõe decomposição incremental.
---

# /coupling-check — Analisar e Reduzir Acoplamento

$ARGUMENTS

---

## Propósito

Identificar módulos com **acoplamento excessivo** (fan-in ou fan-out alto), classificar o tipo de acoplamento e propor decomposição incremental quando justificável.

> **Agente recomendado:** `architecture-health-doctor`

---

## 🔴 Regras Invioláveis

1. **Fan-in alto NÃO é automaticamente ruim** — módulos estáveis e centrais podem ter muitos consumidores
2. **1 módulo por decomposição** — Strangler Fig, sem big-bang
3. **Não decompor sem justificativa** — "muitos imports" sozinho não é motivo suficiente
4. **`npm run verify` antes e depois** — evidência obrigatória

---

## Comportamento

### 1. Identificar módulos de alto acoplamento

// turbo

Contar fan-out (quantos módulos cada arquivo importa):

```powershell
npx depcruise src --output-type json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));d.modules.filter(m=>m.dependencies.length>10).sort((a,b)=>b.dependencies.length-a.dependencies.length).forEach(m=>console.log(m.dependencies.length+' deps: '+m.source))"
```

Contar fan-in (quantos módulos importam cada arquivo):

```powershell
npx depcruise src --output-type json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));d.modules.filter(m=>m.dependents.length>15).sort((a,b)=>b.dependents.length-a.dependents.length).forEach(m=>console.log(m.dependents.length+' dependents: '+m.source))"
```

### 2. Classificar cada módulo suspeito

| Perfil                | Fan-in | Fan-out | Diagnóstico                                         |
| --------------------- | ------ | ------- | --------------------------------------------------- |
| **God module**        | Alto   | Alto    | 🔴 Prioridade máxima. Faz tudo, sabe tudo.          |
| **Hub estável**       | Alto   | Baixo   | 🟢 Módulo central estável. Não decompor sem motivo. |
| **Consumidor guloso** | Baixo  | Alto    | 🟡 Viola SRP. Precisa decompor responsabilidades.   |
| **Normal**            | Baixo  | Baixo   | ✅ Saudável.                                        |

### 3. Analisar responsabilidades do módulo-alvo

Para o módulo com maior acoplamento (ou o escolhido pelo usuário):

1. Ler o conteúdo do módulo
2. Listar **todas as responsabilidades** que ele assume
3. Identificar quais responsabilidades poderiam ser extraídas
4. Verificar se há ADR ou decisão documentada para a estrutura atual

**Usar `mcp_sequential-thinking` para mapear a análise** quando o módulo tem >200 linhas ou >15 imports.

### 4. Propor decomposição (se justificável)

Apresentar ao usuário:

```markdown
### Proposta de Decomposição

| Responsabilidade     | Destino proposto            | Consumidores afetados |
| -------------------- | --------------------------- | --------------------- |
| Cálculos financeiros | `services/financialCalc.ts` | 5                     |
| Formatação de dados  | `utils/formatters.ts`       | 3                     |
| Estado de UI         | Manter no módulo original   | 0                     |
```

**Aguardar aprovação** antes de iniciar.

### 5. Capturar baseline

// turbo

```powershell
npm run verify
```

### 6. Executar decomposição incremental

Seguir o processo do workflow `/refactor`:

1. Extrair 1 responsabilidade por vez
2. Atualizar todos os imports no mesmo diff
3. Verificar com `npm run verify` a cada extração

### 7. Registrar

- Registrar em `DECISIONS-active.md` (sempre estrutural)
- Atualizar `NEXT.md`
- Atualizar ratchets de linhas

---

## Thresholds de Referência

| Métrica                  | Saudável | Atenção | Crítico |
| ------------------------ | -------- | ------- | ------- |
| **Fan-out** (imports)    | ≤ 8      | 9–15    | > 15    |
| **Fan-in** (dependentes) | ≤ 12     | 13–20   | > 20    |
| **Linhas**               | ≤ 200    | 201–350 | > 350   |

> [!NOTE]
> Estes thresholds são heurísticas de referência, não regras absolutas. Módulos de infraestrutura (Context providers, barrel exports) podem ter fan-in alto de forma legítima.

---

## Output Format

```markdown
## 🔗 Coupling Analysis: [data]

### Módulos de Alto Acoplamento

| Módulo                       | Fan-in | Fan-out | Perfil         |
| ---------------------------- | ------ | ------- | -------------- |
| `src/services/bigService.ts` | 22     | 18      | 🔴 God module  |
| `src/utils/formatters.ts`    | 15     | 3       | 🟢 Hub estável |

### Ação Tomada

- Decomposto `bigService.ts`:
  - Extraído `financialCalc.ts` (5 consumidores migrados)
  - Extraído `dataFormatters.ts` (3 consumidores migrados)
  - `bigService.ts` reduzido de 420 → 180 linhas

### Evidência

- Baseline (antes): ✅ `npm run verify` verde
- Fan-out antes: 18 → depois: 7
- Após decomposição: ✅ `npm run verify` verde
```

---

## Exemplos de Uso

```text
/coupling-check
/coupling-check src/services/bigService.ts
/coupling-check diagnosticar apenas
```
