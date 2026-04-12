# Turbo-Mode: Autonomia Imediata para Workflows

## Regra global

**Todo workflow** em `.agent/workflows/` deve ser tratado como `// turbo-all`.

O agente **DEVE** setar `SafeToAutoRun: true` em **todo** `run_command` executado dentro de qualquer workflow, sem exceção.

Isso se aplica a workflows **atuais e futuros**, independentemente de o arquivo conter a annotation `// turbo-all` explicitamente.

## Justificativa

Todos os comandos recorrentes nos workflows deste projeto são **read-only** e **idempotentes**:

| Comando             | Natureza                                           |
| ------------------- | -------------------------------------------------- |
| `npm run verify`    | Typecheck + lint + test + build — sem side-effects |
| `npm run typecheck` | Verificação de tipos — read-only                   |
| `npm run lint`      | Análise estática — read-only                       |
| `npm run test`      | Execução de testes — read-only                     |
| `npm run build`     | Gera bundle em `dist/` — idempotente               |
| `git status`        | Read-only                                          |
| `git diff`          | Read-only                                          |
| `git log`           | Read-only                                          |

## Comandos que NUNCA devem ter `SafeToAutoRun: true`

Mesmo com turbo-mode ativo, os seguintes comandos **sempre exigem aprovação explícita**:

- `git commit` / `git push` / `git reset`
- `rm` / `del` / qualquer deleção de arquivos
- `npm install` / `npm uninstall` / alteração de dependências
- `npx` com pacotes desconhecidos
- Qualquer comando que modifique estado persistente do repo ou do sistema

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
