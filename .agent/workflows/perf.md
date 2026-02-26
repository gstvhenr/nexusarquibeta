---
description: Performance diagnosis and optimization. Systematic investigation of re-renders, bundle size, and runtime bottlenecks with before/after evidence.
---

# /perf - Diagnóstico e Otimização de Performance

$ARGUMENTS

---

## Propósito

Investigação **sistemática** de problemas de performance no Nexus-Arqui. Transforma "está lento" em diagnóstico com métricas objetivas e correções com evidência antes/depois.

---

## Comportamento

Quando `/perf` for acionado:

### 1. Identificar o sintoma

Perguntar ao usuário (se não informado):

- **Onde** está lento? (página, componente, ação)
- **Quando** fica lento? (ao abrir, ao interagir, ao salvar)
- **Quanto** tempo leva? (estimativa ou "travou")
- **Volume de dados** envolvido? (5 registros? 500?)

### 2. Diagnóstico por categoria

Executar as verificações relevantes:

#### 🔁 Re-renders (React)

- Identificar componentes que re-renderizam desnecessariamente
- Verificar `useEffect` com dependências amplas demais
- Verificar Context splits (Context monolítico causa cascade)
- Detectar state lift desnecessário

**Como verificar:**

```typescript
// Adicionar temporariamente no componente suspeito:
console.count('ComponentName render');
```

#### 📦 Bundle Size (Vite)

// turbo

```powershell
npx vite-bundle-visualizer
```

- Identificar dependências pesadas
- Detectar imports não tree-shaken
- Verificar code splitting por rota

#### 💾 IndexedDB (Storage)

- Transações muito amplas (leitura de toda a store quando só precisa de 1 registro)
- Serialização/deserialização pesada
- Falta de índices para queries frequentes

#### 🎨 Rendering (DOM)

- Listas longas sem virtualização
- CSS animations pesadas (shadow, blur em muitos elementos)
- Layout thrashing (leitura/escrita alternada de DOM)

### 3. Medir baseline

Antes de qualquer correção, capturar métrica objetiva:

- **Tempo de load**: `performance.now()` ou DevTools Performance tab
- **Re-renders**: contagem via `console.count` ou React Profiler
- **Bundle size**: output de `vite-bundle-visualizer`

### 4. Aplicar correção

Aplicar **uma correção por vez** e medir impacto:

| Problema             | Solução Típica                                 |
| -------------------- | ---------------------------------------------- |
| Re-render em cascata | `React.memo`, `useMemo`, Context split         |
| Bundle pesado        | Lazy import, code splitting por rota           |
| Lista lenta          | Virtualização (`react-window` ou similar)      |
| IndexedDB lento      | Índice, query mais específica, paginação       |
| Effect desnecessário | Derivar estado com `useMemo` ou cálculo inline |

### 5. Verificar melhoria

// turbo

```powershell
npm run verify
```

Comparar métricas antes/depois.

---

## Output Format

```markdown
## ⚡ Perf: [Componente/Página]

### Sintoma

[Descrição do que está lento e quando]

### Diagnóstico

| Categoria     | Verificado | Resultado                   |
| ------------- | ---------- | --------------------------- |
| Re-renders    | ✅         | [N renders por ação]        |
| Bundle size   | ✅         | [X KB total, Y KB alvo]     |
| IndexedDB     | ⬜         | [não investigado]           |
| DOM rendering | ✅         | [lista de 500 sem virtual.] |

### Root Cause

🎯 **[Causa principal em 1-2 frases]**

### Correção Aplicada

[Descrição técnica da correção]

### Métricas Antes/Depois

| Métrica       | Antes   | Depois | Melhoria |
| ------------- | ------- | ------ | -------- |
| Tempo de load | 2.3s    | 0.8s   | -65%     |
| Re-renders    | 12/ação | 3/ação | -75%     |
| Bundle (gzip) | 450 KB  | 320 KB | -29%     |

### Verificação

- [x] `npm run verify` → ✅ Verde
- [x] Comportamento funcional preservado
```

---

## Princípios

1. **PENSAMENTO SEQUENCIAL OBRIGATÓRIO:** Use `mcp_sequential-thinking` para analisar o gargalo real (ex: isolar se a falha é cascade render x bundle) antes de sugerir ou aplicar correções.
2. **Medir antes de otimizar** — sem otimização prematura
3. **Uma correção por vez** — isolar o impacto
4. **Evidência objetiva** — números antes/depois obrigatórios
5. **Não quebrar funcionalidade** — performance sem regressão
6. **Registrar em NEXT.md** — otimizações futuras identificadas mas não aplicadas

---

## Exemplos de Uso

```text
/perf Dashboard financeiro demora 3s para carregar
/perf PropostasPage trava ao filtrar com 200+ propostas
/perf build está gerando bundle de 2MB
/perf componente ProjectGantt re-renderiza a cada keystroke
```
