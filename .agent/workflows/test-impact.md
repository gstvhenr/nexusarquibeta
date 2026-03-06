---
description: Verifica impacto de alterações nos testes. Roda testes afetados, detecta gaps de cobertura e valida contratos. Trigger automático ou via /test:impact.
---

# /test:impact - Verificação de Impacto em Testes

$ARGUMENTS

---

## Objetivo

Garantir que TODA alteração de código-fonte tenha seus testes validados, atualizados ou criados. Este workflow é chamado automaticamente pelo `default-task-flow` (step 5.5) e pode ser invocado manualmente.

## Quando usar

- **Automático**: Após cada diff no `default-task-flow` (step 5.5).
- **Manual**: `/test:impact` para verificar estado atual dos testes vs. código alterado.
- **Pre-commit**: Integrado via `vitest related --run` no hook do husky.

---

## Procedimento

### 1. Identificar Arquivos Alterados

```bash
# Alterações staged (pre-commit)
git diff --cached --name-only --diff-filter=ACMR -- 'src/frontend/**'

# Alterações na sessão (agente)
git diff --name-only HEAD -- 'src/frontend/**'
```

### 2. Classificar por Camada

| Camada         | Padrão de Path                     | Requer Teste?           |
| -------------- | ---------------------------------- | ----------------------- |
| **Services**   | `src/frontend/services/**/*.ts`    | ✅ Obrigatório          |
| **Utils**      | `src/frontend/utils/**/*.ts`       | ✅ Obrigatório          |
| **Hooks**      | `src/frontend/hooks/**/*.ts`       | ✅ Obrigatório          |
| **Components** | `src/frontend/components/**/*.tsx` | ✅ Fluxos críticos      |
| **Pages**      | `src/frontend/pages/**/*.tsx`      | ⚠️ Smoke test           |
| **Types**      | `src/frontend/types/**/*.ts`       | ❌ Isento (type-only)   |
| **Testes**     | `**/*.test.ts(x)`                  | N/A (é o próprio teste) |

> 🔴 Arquivos de **types-only** (sem lógica runtime) são ISENTOS de teste obrigatório.

### 3. Rodar Testes Afetados

```bash
# Comando canônico — roda apenas testes que cobrem os arquivos listados
npx vitest related --run <arquivo1> <arquivo2> ...

# Alternativa — roda testes de arquivos alterados pelo git
npx vitest --changed --run
```

> **Regra**: Usar `--run` SEMPRE em contextos não-interativos (hooks, CI, agente).
> Referência: [Vitest CLI — vitest related](https://vitest.dev/guide/cli.html#vitest-related)

### 4. Verificar Gaps de Cobertura

Para cada arquivo alterado que contém lógica runtime:

1. **Arquivo `.test.ts(x)` existe?**

   - ✅ Sim → Verificar se os testes cobrem a lógica alterada.
   - ❌ Não → **ALERTA**: criar teste obrigatório antes de prosseguir.

2. **Contrato/tipo mudou?**
   - ✅ Sim → Verificar:
     - Fixtures em `src/test/fixtures/` estão atualizadas?
     - `src/test/golden-fixtures.test.ts` está atualizado?
     - `docs/data-contracts/types-contracts.md` está atualizado?

### 5. Emitir Relatório

```markdown
## 🧪 Test Impact Report

| Arquivo Alterado             | Camada  | Teste Existe? | Resultado |
| ---------------------------- | ------- | ------------- | --------- |
| `services/projectService.ts` | Service | ✅            | ✅ PASS   |
| `utils/formatters.ts`        | Util    | ✅            | ✅ PASS   |
| `hooks/useNewHook.ts`        | Hook    | ❌            | ⚠️ GAP    |
| `types/project.ts`           | Type    | N/A           | ➖ ISENTO |

### Ações Necessárias

- [ ] Criar teste para `hooks/useNewHook.ts`
- [ ] Atualizar fixtures (contrato mudou)
```

---

## Critérios de Aprovação

- ✅ Todos os testes afetados passaram (`vitest related --run` exit code 0).
- ✅ Nenhum arquivo de lógica runtime sem teste correspondente (ou gap documentado em NEXT.md).
- ✅ Se contrato mudou: fixtures e golden-fixtures atualizados.
- ✅ Nenhum teste existente foi deletado sem justificativa.

---

## Integração com Git Hooks

### Pre-commit (recomendado)

Adicionar ao `.husky/pre-commit`:

```sh
# Test Impact: rodar testes afetados pelos arquivos staged
staged_src="$(git diff --cached --name-only --diff-filter=ACMR -- 'src/frontend/**' | grep -v '\.test\.' | tr '\n' ' ')"
if [ -n "$staged_src" ]; then
  npx vitest related --run $staged_src
fi
```

> **Nota**: Filtra arquivos `.test.` para evitar rodar testes contra si mesmos.
> Tempo estimado: ~5-15s (apenas testes afetados, não a suite inteira).

---

## Integração com Script de Análise

Para análise mais sofisticada, criar `scripts/test-impact.mjs` com:

1. Lista de arquivos alterados via `git diff`
2. Classificação por camada (tabela acima)
3. Verificação de existência de `.test.ts(x)`
4. Execução de `vitest related --run`
5. Verificação de fixtures se contrato mudou
6. Relatório JSON em `.agent/tmp/test-impact-report.json`

Registrar no `package.json`:

```json
"test:impact": "node scripts/test-impact.mjs"
```

---

## Referências

- Vitest CLI `related`: https://vitest.dev/guide/cli.html#vitest-related
- Vitest CLI `--changed`: https://vitest.dev/guide/cli.html#changed
- Agente: `.agent/agents/test-engineer.md`
- Skill: `.agent/skills/testing-patterns/SKILL.md`
- Fixtures: `src/test/fixtures/`
- Golden fixtures: `src/test/golden-fixtures.test.ts`
