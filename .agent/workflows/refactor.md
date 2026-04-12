---
description: Safe, incremental refactoring. Move logic, extract hooks/components, rename modules with dependency tracking and non-regression evidence.
---

# /refactor - Refatoração Segura e Incremental

$ARGUMENTS

---

## Propósito

Refatoração **cirúrgica e rastreável**: mover lógica, extrair hooks/componentes, renomear módulos — com garantia de não-regressão.

Diferente de `/code-cleanup-v1` (auditoria ampla de 29 tópicos), este workflow foca em **1 operação de refatoração por vez**.

---

## 🔴 Regras Invioláveis

1. **PENSAMENTO SEQUENCIAL OBRIGATÓRIO:** O agente deve usar `mcp_sequential-thinking` para mapear dependências circulares ou imports órfãos _antes_ de mover qualquer arquivo de lugar.
2. **1 hot spot por execução** — sem refactor big-bang
3. **Não alterar regra de negócio** — apenas mover/reorganizar
4. **Rastrear consumidores antes de mover** — quem importa o alvo?
5. **Atualizar imports no mesmo diff** — sem quebra intermediária
6. **Evidência de não-regressão** — `npm run verify` antes e depois

---

## Comportamento

### 1. Definir escopo

Identificar com precisão:

- **O quê**: qual código será movido/extraído/renomeado
- **De onde → Para onde**: origem e destino
- **Por quê**: justificativa em 1 frase (legibilidade? SRP? boundary?)

### 2. Mapear dependências

// turbo

Antes de tocar qualquer arquivo, rastrear quem consome o alvo:

```powershell
grep -r "import.*NomeDoAlvo" src/ --include="*.ts" --include="*.tsx" -l
```

Registrar a lista de consumidores — **todos devem ser atualizados no mesmo diff**.

### 3. Capturar baseline

// turbo

```powershell
npm run verify
```

Se o baseline já está vermelho, **parar e avisar o usuário** — não refatorar código quebrado.

### 4. Aplicar refatoração mecânica

- Mover/extrair/renomear o código
- Atualizar **todos** os imports/exports afetados
- Verificar barrel files (`index.ts`) se aplicável
- Não alterar lógica, apenas estrutura

### 5. Verificar não-regressão

// turbo

```powershell
npm run verify
```

### 6. Registrar mudança

- Se mudança estrutural → registrar em `DECISIONS-active.md`
- Se afetou contrato de tipo → atualizar `docs/data-contracts/types-contracts.md`
- Se reduziu linhas em hotspot → rodar `npm run check:lines:ratchet`
- Atualizar `NEXT.md`

---

## Output Format

```markdown
## 🔄 Refactor: [Descrição curta]

### Escopo

| Item     | Valor                             |
| -------- | --------------------------------- |
| Operação | [mover/extrair/renomear/decompor] |
| Alvo     | [função/componente/hook]          |
| Origem   | [arquivo de origem]               |
| Destino  | [arquivo de destino]              |
| Motivo   | [justificativa em 1 frase]        |

### Consumidores Afetados

- `src/pages/XxxPage.tsx`
- `src/components/Yyy.tsx`
- [total: N arquivos]

### Evidência

- Baseline (antes): ✅ `npm run verify` verde
- Após refactor: ✅ `npm run verify` verde
- Imports atualizados: N/N arquivos

### Mudanças Registradas

- [ ] DECISIONS-active.md (se estrutural)
- [ ] types-contracts.md (se contrato)
- [ ] NEXT.md atualizado
```

---

## Operações Comuns

| Operação               | Exemplo                                        | Cuidado Principal                   |
| ---------------------- | ---------------------------------------------- | ----------------------------------- |
| **Extrair hook**       | Lógica de state → `useXxx()` em `src/hooks/`   | Manter mesma interface pública      |
| **Extrair componente** | Seção de JSX → componente em `src/components/` | Verificar `check:lines`             |
| **Mover serviço**      | Função de `utils/` → `services/` por boundary  | Atualizar barrel files              |
| **Renomear**           | `getData()` → `getClientProposals()`           | grep por nome antigo em todo `src/` |
| **Decompor**           | Componente 400 linhas → 3 subcomponentes       | Props drilling vs Context           |

---

## Exemplos de Uso

```text
/refactor extrair hook useFinancialHealth de FinanceiroOverview
/refactor mover calculateRevenue de utils para financialService
/refactor decompor ClientDetailsPage em subcomponentes
/refactor renomear getData para getMonthlyFinancialSummary
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
