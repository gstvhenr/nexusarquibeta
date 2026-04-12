---
description: Detectar e resolver dependências circulares no grafo de módulos. Usa dependency-cruiser como fonte canônica, classifica ciclos e aplica fix incremental.
---

# /circular-deps — Resolver Dependências Circulares

$ARGUMENTS

---

## Propósito

Detectar, classificar e resolver **dependências circulares** no grafo de módulos. Cada ciclo é tratado individualmente com fix incremental e verificável.

> **Agente recomendado:** `architecture-health-doctor`

---

## 🔴 Regras Invioláveis

1. **`dependency-cruiser` é a fonte canônica** — ArchPulse pode ter falsos positivos (ver `docs/audits/archpulse-reconciliation-2026-02-28.md`)
2. **1 ciclo por execução** — não resolver múltiplos ciclos no mesmo diff
3. **Não alterar regra de negócio** — apenas reorganizar dependências
4. **`npm run verify` antes e depois** — evidência obrigatória

---

## Comportamento

### 1. Detectar ciclos reais

// turbo

```powershell
npx depcruise src --output-type err-long
```

Se **nenhuma violação** for encontrada, informar o usuário e encerrar.

### 2. Classificar cada ciclo

Para cada ciclo detectado, classificar:

| Tipo             | Exemplo                                  | Severidade                      |
| ---------------- | ---------------------------------------- | ------------------------------- |
| **Self-import**  | `A.tsx → A.tsx`                          | Baixa (provável falso positivo) |
| **Cross-module** | `A.tsx → B.tsx → A.tsx`                  | Média (fix mecânico)            |
| **Cross-layer**  | `services/X → components/Y → services/X` | Alta (violação de boundary)     |
| **Multi-nó**     | `A → B → C → D → A`                      | Alta (complexidade do ciclo)    |

### 3. Investigar o ciclo escolhido

// turbo

Focar no ciclo de maior severidade (ou no escolhido pelo usuário):

```powershell
npx depcruise src --focus src/caminho/modulo-com-ciclo.tsx --output-type err-long
```

Mapear:

- Quais módulos participam do ciclo
- Quais imports específicos criam a circularidade
- Quais consumidores externos dependem desses módulos

### 4. Capturar baseline

// turbo

```powershell
npm run verify
```

Se o baseline já está vermelho, **parar e avisar o usuário**.

### 5. Aplicar estratégia de fix

| Causa raiz                      | Estratégia                                            |
| ------------------------------- | ----------------------------------------------------- |
| Tipos compartilhados circulares | Extrair para `types/shared.ts` ou `types/{domain}.ts` |
| Funções utilitárias circulares  | Extrair para módulo intermediário                     |
| Service ↔ Service               | Dependency Inversion: introduzir interface            |
| Component ↔ Hook bidireccional  | Extrair lógica compartilhada para utils               |

**Regra:** cada fix deve quebrar **exatamente 1 aresta** do ciclo.

### 6. Verificar resolução

// turbo

```powershell
npx depcruise src --output-type err-long
npm run verify
```

### 7. Registrar

- Se mudança estrutural → registrar em `DECISIONS-active.md`
- Atualizar `NEXT.md`

---

## Output Format

```markdown
## 🔄 Circular Dep Fix: [Descrição curta]

### Ciclo Detectado

`A.tsx → B.tsx → A.tsx`

| Item            | Valor                                    |
| --------------- | ---------------------------------------- |
| Tipo            | [self/cross-module/cross-layer/multi-nó] |
| Severidade      | [baixa/média/alta]                       |
| Import causador | `import { X } from './B'` em A.tsx       |

### Estratégia Aplicada

[Extrair tipos / Módulo intermediário / Inversão de dependência]

### Evidência

- Baseline (antes): ✅ `npm run verify` verde
- `depcruise` antes: ⚠️ 1 ciclo
- `depcruise` depois: ✅ 0 ciclos
- Após fix: ✅ `npm run verify` verde
```

---

## Exemplos de Uso

```text
/circular-deps
/circular-deps src/types/index.ts
/circular-deps diagnosticar apenas
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
