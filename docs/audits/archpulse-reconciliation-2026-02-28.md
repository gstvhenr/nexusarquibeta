# ArchPulse Reconciliation — 2026-02-28

## Contexto

O ArchPulse reportou dois ciclos:

1. `src/types/index.ts -> src/types/appData.ts -> src/types/index.ts`
2. `src/index.tsx -> src/index.tsx`

Esta auditoria reconcilia o resultado com `dependency-cruiser` (fonte local canônica do projeto).

## Evidências Locais

### 1) Verificação global de dependências

Comando:

```bash
npx depcruise src --output-type err-long
```

Resultado:

```text
✔ no dependency violations found (395 modules, 1454 dependencies cruised)
```

### 2) Verificação focada no bootstrap (`src/index.tsx`)

Comando:

```bash
npx depcruise src --focus src/index.tsx --output-type err-long
```

Resultado:

```text
✔ no dependency violations found (11 modules, 16 dependencies cruised)
```

### 3) Relação explícita `index.tsx -> index.css` (sem auto-ciclo)

Arquivo de evidência gerado localmente:

`/.agent/tmp/depcruise-index-focus.json`

Trecho relevante:

```json
{
  "source": "src/index.tsx",
  "dependencies": [
    {
      "module": "./index.css",
      "resolved": "src/index.css",
      "circular": false
    }
  ]
}
```

## Conclusão

- O ciclo de tipos era real e foi removido nesta sessão.
- O ciclo `src/index.tsx -> src/index.tsx` não foi reproduzido com `depcruise`.
- A evidência indica ausência de self-edge no grafo local.

## Hipótese Técnica para o Falso Positivo do ArchPulse

O parser do ArchPulse provavelmente está colapsando nós por basename (`index`) sem considerar caminho completo + extensão, gerando self-edge sintético ao processar `index.tsx` e `index.css`.

## Recomendação para o Pipeline Externo (ArchPulse)

1. Canonicalizar nós por caminho relativo completo + extensão.
2. Não colapsar `index.tsx` e `index.css` no mesmo identificador.
3. Ignorar explicitamente arestas onde `from === to` após normalização, salvo quando o import original também aponta para o mesmo arquivo.
