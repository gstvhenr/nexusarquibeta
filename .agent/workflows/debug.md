---
description: Debugging command. Activates DEBUG mode for systematic problem investigation.
---

# /debug - Investigação Sistemática de Problemas

$ARGUMENTS

---

## Propósito

Ativa o modo DEBUG para investigação sistemática de bugs, erros ou comportamentos inesperados no Nexus-Arqui.

---

## Comportamento

Quando `/debug` for acionado:

1. **Coletar informações**
   - Mensagem de erro completa
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Mudanças recentes (`git log --oneline -10`)

2. **Formular hipóteses**
   - **OBRIGATÓRIO:** Use a tool `mcp_sequential-thinking` para explorar a raiz do erro e eliminar hipóteses falsas _antes_ de tentar editar código ou cuspir o resultado na tela.
   - Listar causas possíveis ordenadas por probabilidade

3. **Investigar sistematicamente**
   - Testar cada hipótese
   - Verificar dados, contexto React, storage IndexedDB
   - Usar método de eliminação

4. **Corrigir e prevenir**
   - Aplicar fix mínimo necessário
   - Explicar root cause
   - Adicionar teste de regressão
   - Rodar `npm run verify`

---

## Output Format

````markdown
## 🔍 Debug: [Problema]

### 1. Sintoma

[O que está acontecendo]

### 2. Informações

- Erro: `[mensagem de erro]`
- Arquivo: `[caminho]`
- Linha: [número]

### 3. Hipóteses

1. ❓ [Causa mais provável]
2. ❓ [Segunda possibilidade]
3. ❓ [Menos provável]

### 4. Investigação

**Testando hipótese 1:**
[O que verifiquei] → [Resultado]

### 5. Root Cause

🎯 **[Explicação de por que aconteceu]**

### 6. Fix

```typescript
// Antes
[código quebrado]

// Depois
[código corrigido]
```
````

### 7. Prevenção

🛡️ [Como evitar no futuro — test adicionado? Type guard? Validação?]

---

## Categorias Comuns no Nexus-Arqui

| Categoria                | O que verificar                                  |
| ------------------------ | ------------------------------------------------ |
| TypeScript error         | `npm run typecheck` — tipo esperado vs. recebido |
| React re-render infinito | useEffect deps, mutation direta de state         |
| IndexedDB                | Transaction commitada? Store name correto?       |
| Vite build               | `npm run build` — imports circulares, tipos      |
| Test failing             | Fixture desatualizada? Mock incorreto?           |

---

## Exemplos de Uso

```text
/debug Proposta não está sendo salva no IndexedDB
/debug TypeScript error: Type 'X' not assignable to 'Y'
/debug Dashboard não atualiza quando dados mudam
/debug npm run verify falha no build
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
