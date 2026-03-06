# Git Hooks & Scripts — Test Impact Automation

> Referência para agente executor implementar mudanças fora de `.agent/`.

## 1. Atualizar `.husky/pre-commit`

Adicionar **após** o bloco existente de lint/typecheck:

```sh
# Test Impact: rodar testes afetados pelos arquivos staged
staged_src="$(git diff --cached --name-only --diff-filter=ACMR -- 'src/frontend/**' | grep -v '\.test\.' | tr '\n' ' ')"
if [ -n "$staged_src" ]; then
  npx vitest related --run $staged_src
fi
```

**Justificativa**: `vitest related --run` usa o grafo de imports estáticos do Vite para identificar quais testes cobrem os arquivos alterados. `--run` evita watch mode.

## 2. Criar `scripts/test-impact.mjs`

Script que realiza análise de impacto inteligente:

1. Recebe lista de arquivos (via `git diff --name-only`)
2. Classifica por camada (service/util/hook/component/page/type)
3. Verifica existência de `.test.ts(x)` correspondente
4. Executa `vitest related --run` nos arquivos-fonte
5. Se contrato mudou → verifica fixtures e golden-fixtures
6. Emite relatório JSON em `.agent/tmp/test-impact-report.json`

## 3. Registrar no `package.json`

```json
"test:impact": "node scripts/test-impact.mjs"
```

## 4. Registrar no `AGENTS.md`

Adicionar na seção de comandos oficiais:

```md
- Impacto em testes: `npm run test:impact`
```

## Referências

- Vitest `related`: https://vitest.dev/guide/cli.html#vitest-related
- Vitest `--changed`: https://vitest.dev/guide/cli.html#changed
- Workflow completo: `.agent/workflows/test-impact.md`
