---
description: Safe, incremental dependency updates. Analyzes outdated packages, updates one at a time, verifies with gates, and rolls back on failure with documentation.
---

# /deps - Gestão Segura de Dependências

$ARGUMENTS

---

## Propósito

Atualizar pacotes de forma **cirúrgica e auditável**, evitando o "big-bang" do `npm update` que quebra o repositório de forma invisível. Um Dependabot local guiado por testes.

---

## 🔴 Regras Invioláveis

1. **Atualizar um pacote por vez** (ou grupos lógicos estritos, ex: apenas React).
2. **Rodar gate canônico** (`npm run verify`) imediatamente após cada atualização.
3. **Rollback imediato** se o gate final quebrar.
4. **Registrar pacotes problemáticos** no relatório final.
5. **Nunca usar `--force` ou `--legacy-peer-deps`** a não ser que explicitamente aprovado em ADR.

---

## Comportamento

Quando `/deps` for acionado:

### 1. Capturar Baseline e Auditar

// turbo

Garantir que o projeto está verde _antes_ de começar:

```powershell
npm run verify:quick
npm outdated
```

### 2. Priorização

O agente deve classificar os pacotes listados pelo `npm outdated` em:

- 🟢 **Safe:** Patches e Minors de bibliotecas de utilidade (ex: `lucide-react`, `date-fns`).
- 🟡 **Caution:** Minors de frameworks ou dependências core (ex: Vite plugins, ferramentas de testing).
- 🔴 **Danger:** Majors (breaking changes garantidos) ou upgrades de stack base (React, Vite, TypeScript).

**Critério:** Majors **NÃO** serão atualizados sem comando explícito (`/deps upgrade [pacote]`).

### 3. Ciclo de Atualização (Execute para cada pacote Safe/Caution)

1. Adicionar pacote no log de sessão: `Atualizando [pacote] de [vA] para [vB]...`
2. Atualizar: `npm install [pacote]@latest` (ou versão desejada).
3. Confirmar estabilidade:

   ```powershell
   npm run verify
   ```

4. **Se passar (✅):** Manter e seguir para o próximo.
5. **Se falhar (❌):**
   - Reverter: `git checkout package.json package-lock.json`
   - Reinstalar: `npm ci`
   - Registrar no log: `[pacote] bloqueado por regressão.`

### 4. Relatório Final

Terminada a varredura, apresentar um painel ao usuário.

---

## Output Format

```markdown
## 📦 Gestão de Dependências — Relatório

📅 Data: [YYYY-MM-DD]

### Resumo da Execução

- **Total analisado:** X pacotes
- ✅ **Atualizados com sucesso:** Y pacotes
- ❌ **Isolados/Bloqueados (Falha no Gate):** Z pacotes
- ⚠️ **Pulados (Majors):** W pacotes

### 🟢 Atualizados

| Pacote         | Versão Antiga | Versão Nova | Gate Status |
| :------------- | :------------ | :---------- | :---------- |
| `lucide-react` | 0.440.0       | 0.450.0     | ✅ PASS     |
| `date-fns`     | 3.6.0         | 3.7.0       | ✅ PASS     |

### 🔴 Bloqueados (Fix manual necessário)

| Pacote            | Versão Antiga | Tentativa | Erro do Gate                              |
| :---------------- | :------------ | :-------- | :---------------------------------------- |
| `react-hook-form` | 7.52.0        | 7.53.0    | `TypeScript: Type mismatch in 'resolver'` |

### ⚠️ Pulados (Aguardam decisão)

- `typescript` (5.8.0 -> 6.0.0) — Major upgrade. Rode `/deps upgrade typescript` para forçar.

### 📋 Próximos Passos

- Commitar as mudanças seguras: `git add package* && git commit -m "chore(deps): update safe minor/patch dependencies"`
- Inspecionar manualmente os pacotes bloqueados.
```

---

## Exemplos de Uso

```text
/deps                 (Escaneia e atualiza seguros/minors)
/deps audit           (Apenas roda npm outdated e classifica, sem alterar)
/deps upgrade [lib]   (Força atualização de um major e tenta compilar)
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
