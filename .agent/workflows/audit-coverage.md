---
description: Audit test coverage across all architectural layers. Read-only analysis by default. Supports fast scan, full engine, and per-layer modes.
---

# /audit-coverage - Auditoria de Cobertura de Testes

$ARGUMENTS

---

## Sub-comandos

```
/audit-coverage                - Executa Nível 02 (Audit Protocol) — padrão
/audit-coverage fast           - Executa Nível 01 (Fast Scan) — rápido
/audit-coverage full           - Executa Nível 03 (Full Engine) — máximo
/audit-coverage [camada]       - Audita apenas a camada especificada
```

### Camadas válidas

`hooks` | `services` | `services/finance` | `services/infrastructure` | `utils` | `components` | `pages` | `context` | `types`

---

## Comportamento

### 1. Leitura Obrigatória (ANTES de iniciar)

O agente DEVE ler efetivamente estes arquivos antes de qualquer análise:

1. `.agent/skills/testing-patterns/SKILL.md` → critérios de qualidade
2. `.agent/skills/clean-code/SKILL.md` → régua de boas práticas
3. `AGENTS.md` → comando canônico de verificação
4. `.agent/tasks/` → verificar work-in-progress de testes

### 2. Executar Fase 1 (Read-Only)

Seguir o protocolo do nível selecionado conforme definido em:
**`.agent/prompts/Prompt_Auditoria_Cobertura_Testes.md`**

Regras invioláveis:

- **Sem mutação**: nenhum arquivo pode ser criado, modificado ou excluído na Fase 1
- **Verificação filesystem**: toda classificação ✅ deve ser verificada via filesystem real
- **Evidência obrigatória**: toda classificação deve citar o path verificado
- **Anti-alucinação**: se não verificou → classificar como ❓ UNKNOWN, nunca ✅

### 3. Apresentar Relatório

Output estruturado em tabelas markdown por camada com:

- Arquivo | Status (✅/❌/⚠️/❓) | Evidência | Criticidade
- Resumo executivo com percentuais por camada e total
- Top-5 arquivos sem teste de maior risco

### 4. Gate de Fase

Após o relatório, exibir:

> ⏸️ **FASE 1 CONCLUÍDA.** Nenhum arquivo foi alterado.
> Para prosseguir com criação/correção de testes, diga **"Prosseguir"** ou especifique camadas.

---

## Fase 2 (Ativada pelo Usuário)

Quando o usuário disser "Prosseguir":

1. Seguir o pipeline do workflow `/test` para cada arquivo
2. Criar testes por ordem de criticidade (CRÍTICA → ALTA → MÉDIA → BAIXA)
3. Validar cada teste com `npm run test -- --run <arquivo>`
4. Gate final: `npm run verify` — sem verde, não declarar conclusão

---

## Relação com Outros Assets

| Asset                                                 | Relação                                      |
| ----------------------------------------------------- | -------------------------------------------- |
| `.agent/prompts/Prompt_Auditoria_Cobertura_Testes.md` | Fonte dos 3 níveis de auditoria              |
| `/test`                                               | Pipeline de execução na Fase 2               |
| `/health-check`                                       | Complementar — diagnóstico geral             |
| `@[skills/testing-patterns]`                          | Critério de qualidade (leitura obrigatória)  |
| `@[skills/clean-code]`                                | Régua de boas práticas (leitura obrigatória) |
| `@[skills/webapp-testing]`                            | Cobertura E2E (opcional, Nível 03)           |

---

## Exemplos de Uso

```
/audit-coverage
/audit-coverage fast
/audit-coverage full
/audit-coverage hooks
/audit-coverage services/finance
/audit-coverage pages
```
