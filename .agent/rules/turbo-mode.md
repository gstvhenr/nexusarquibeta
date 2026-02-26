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
