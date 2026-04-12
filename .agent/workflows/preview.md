---
description: Preview server start, stop, and status check. Local development server management.
---

# /preview - Gerenciamento do Servidor de Preview

$ARGUMENTS

---

## Comandos

```
/preview           - Exibe status atual
/preview start     - Inicia o servidor
/preview stop      - Para o servidor
/preview restart   - Reinicia
/preview check     - Health check
```

---

## Comportamento

### Iniciar Servidor

```
/preview start

Resposta:
🚀 Iniciando preview Nexus-Arqui...
   Porta: 5173 (Vite padrão)
   Tipo: React + Vite

✅ Preview pronto!
   URL: http://localhost:5173
```

### Status

```
/preview

Resposta:
=== Status do Preview ===

🌐 URL: http://localhost:5173
📁 Projeto: Nexus-Arqui (Beta)
🏷️ Stack: React 18 + Vite 6
💚 Saúde: OK
```

### Conflito de Porta

```
/preview start

Resposta:
⚠️ Porta 5173 em uso.

Opções:
1. Iniciar na porta 5174
2. Encerrar processo na 5173 (Windows: taskkill)
3. Especificar outra porta

Qual? (padrão: 1)
```

---

## Técnico

O preview usa o script `auto_preview.py` (já adaptado ao Nexus-Arqui):

```bash
# Windows (PowerShell)
python .agent/scripts/auto_preview.py start 5173
python .agent/scripts/auto_preview.py stop
python .agent/scripts/auto_preview.py status
```

Ou diretamente via npm:

```bash
npm run dev          # Inicia em http://localhost:5173
npm run preview      # Serve build de produção
```

---

## Notas Importantes

- Porta padrão: **5173** (Vite) — não 3000 (Next.js/Express)
- Encerramento no Windows: `taskkill /F /PID {pid}`
- Hot reload ativo por padrão com Vite

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
