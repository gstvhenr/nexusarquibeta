---
description: Auditar e consolidar entry points excessivos. Identifica módulos-raiz sem consumidores, classifica como rota, bootstrap, barrel ou redundante, e propõe consolidação.
---

# /entry-points — Auditar Entry Points

$ARGUMENTS

---

## Propósito

Auditar módulos que **importam outros mas não são importados por ninguém** — os pontos de entrada do sistema. Identificar redundâncias e propor consolidação quando benéfica.

> **Agente recomendado:** `architecture-health-doctor`

---

## 🔴 Regras Invioláveis

1. **Entry points SÃO esperados** — o objetivo não é eliminar todos, é garantir que cada um é intencional
2. **Não consolidar rotas de página** — cada rota é um entry point legítimo
3. **Não modificar bootstrap (`index.tsx`, `main.tsx`)** sem justificativa forte
4. **`npm run verify` antes e depois** — evidência obrigatória

---

## Comportamento

### 1. Listar todos os entry points

// turbo

Identificar módulos que importam outros mas não são importados:

```powershell
npx depcruise src --output-type json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));d.modules.filter(m=>m.dependents.length===0&&m.dependencies.length>0).sort((a,b)=>b.dependencies.length-a.dependencies.length).forEach(m=>console.log(m.dependencies.length+' deps: '+m.source))"
```

### 2. Classificar cada entry point

| Classificação           | Exemplo                                       | É legítimo?                                    |
| ----------------------- | --------------------------------------------- | ---------------------------------------------- |
| **Bootstrap**           | `src/index.tsx`, `src/main.tsx`               | ✅ Sim — ponto de entrada da app               |
| **Rota de página**      | `src/pages/*Page.tsx` (se lazy-loaded)        | ✅ Sim — `React.lazy` não gera import estático |
| **Script utilitário**   | `scripts/*.mjs`                               | ✅ Sim — executado diretamente                 |
| **Arquivo de teste**    | `*.test.ts`, `*.spec.ts`                      | ✅ Sim — executado pelo test runner            |
| **Barrel re-export**    | `index.ts` que re-exporta mas ninguém consome | ⚠️ Possível redundância                        |
| **Config**              | `vite.config.ts`, `tailwind.config.ts`        | ✅ Sim — consumido por tooling                 |
| **Sem propósito claro** | Módulo que importa coisas mas não é usado     | 🔴 Candidato a remoção                         |

### 3. Gerar relatório de classificação

Apresentar tabela ao usuário com cada entry point classificado.

### 4. Propor consolidações (se aplicável)

Consolidações comuns:

| Situação                                         | Proposta                                                    |
| ------------------------------------------------ | ----------------------------------------------------------- |
| Múltiplos `index.ts` barrel files não consumidos | Remover barrels órfãos                                      |
| Módulo importa deps mas ninguém o usa            | Candidato a dead code (redirecionar para `/orphan-modules`) |
| Barrel file re-exporta 1-2 itens apenas          | Imports diretos podem ser mais claros                       |

### 5. Executar consolidação (se aprovado)

// turbo

```powershell
npm run verify
```

Para cada barrel redundante aprovado para remoção:

1. Verificar que nenhum consumidor depende do barrel
2. Remover o arquivo
3. Rodar `npm run verify`

### 6. Registrar

- Atualizar `NEXT.md`
- Se removeu barrels estruturais → registrar em `DECISIONS-active.md`

---

## O Que é Um Número Saudável de Entry Points?

| Categoria          | Contagem Esperada (Nexus-Arqui)                |
| ------------------ | ---------------------------------------------- |
| Bootstrap          | 1 (`src/index.tsx`)                            |
| Rotas/Páginas      | ~10-20 (1 por rota lazy-loaded)                |
| Scripts            | ~10 (`scripts/`)                               |
| Configs            | ~5 (vite, tailwind, postcss, tsconfig, vitest) |
| **Total esperado** | **~25-40**                                     |

Se o ArchPulse reporta **47 entry points**, a diferença de ~7-22 pode ser barrels órfãos ou módulos sem consumidor.

---

## Output Format

```markdown
## 🚪 Entry Points Audit: [data]

### Entry Points Encontrados: N

| Módulo                   | Deps | Classificação | Ação        |
| ------------------------ | ---- | ------------- | ----------- |
| `src/index.tsx`          | 8    | Bootstrap     | ✅ Legítimo |
| `src/pages/HomePage.tsx` | 5    | Rota          | ✅ Legítimo |
| `src/utils/index.ts`     | 3    | Barrel órfão  | ⚠️ Remover  |
| `scripts/validate.mjs`   | 2    | Script        | ✅ Legítimo |

### Resumo

- ✅ Legítimos: X
- ⚠️ Redundantes: Y (candidatos a remoção)
- 🔴 Sem propósito: Z (redirecionar para `/orphan-modules`)

### Ações Tomadas

- Removido `src/utils/index.ts` (barrel sem consumidores)

### Evidência

- `npm run verify` antes: ✅ verde
- `npm run verify` depois: ✅ verde
```

---

## Exemplos de Uso

```text
/entry-points
/entry-points diagnosticar apenas
/entry-points src/utils/
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
