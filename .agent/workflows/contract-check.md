---
description: Validate data contract consistency between types, services, fixtures, and documentation. Prevents contract drift.
---

# /contract-check - Validação de Contratos de Dados

$ARGUMENTS

---

## Propósito

Auditar a **consistência entre as 4 camadas de contrato** do Nexus-Arqui:

1. **Tipos** (`src/types/`) — definição canônica
2. **Serviços** (`src/services/`) — uso real dos tipos
3. **Fixtures** (`src/test/fixtures/`) — dados de teste
4. **Documentação** (`docs/data-contracts/types-contracts.md`) — rastreio oficial

Previne a classe de bugs mais recorrente: **contratos implícitos incorretos**.

---

## Comportamento

Quando `/contract-check` for acionado:

### 1. Inventariar interfaces de domínio

// turbo

Listar todas as interfaces/types exportados de `src/types/`:

```powershell
Get-ChildItem src/types/*.ts | ForEach-Object { Write-Host "--- $($_.Name) ---"; Select-String -Path $_ -Pattern "export (interface|type) " }
```

### 2. Cross-reference com serviços

Para cada interface principal, verificar se os serviços que a consomem usam **todos os campos obrigatórios**:

- Abrir o service correspondente (`src/services/`)
- Verificar que os shapes criados/retornados correspondem à interface
- Detectar campos acessados que **não existem** na interface (hallucinated APIs)

### 3. Validar fixtures

- Verificar se fixtures em `src/test/fixtures/` cobrem **todos os campos obrigatórios** da interface
- Detectar campos presentes na fixture que **não existem** na interface

### 4. Rodar golden fixtures test

// turbo

```powershell
npx vitest run src/test/golden-fixtures.test.ts
```

### 5. Comparar com documentação

- Abrir `docs/data-contracts/types-contracts.md`
- Verificar se todas as interfaces listadas ainda existem
- Verificar se interfaces novas estão documentadas

### 6. Gerar relatório

---

## Output Format

```markdown
## 📋 Contract Check — Nexus-Arqui

📅 Data: [YYYY-MM-DD]

### Resultado por Domínio

| Domínio    | Interface        | Tipos | Serviços | Fixtures | Docs | Status |
| ---------- | ---------------- | ----- | -------- | -------- | ---- | ------ |
| Projetos   | `Project`        | ✅    | ✅       | ✅       | ✅   | 🟢     |
| Propostas  | `Proposal`       | ✅    | ⚠️       | ✅       | ✅   | 🟡     |
| Clientes   | `Client`         | ✅    | ✅       | ❌       | ✅   | 🟡     |
| Financeiro | `FinancialEntry` | ✅    | ✅       | ✅       | ❌   | 🟡     |

### ⚠️ Divergências Encontradas

#### [Domínio] — [Tipo de divergência]

- **Onde:** [arquivo]
- **Esperado:** [campo/tipo esperado]
- **Encontrado:** [campo/tipo real]
- **Risco:** [baixo/médio/alto]

### 🎯 Ações Recomendadas

1. [Ação mais crítica]
2. [Segunda ação]

### Golden Fixtures Test

- Resultado: ✅/❌
- Detalhes: [se falhou, mostrar qual fixture]
```

---

## Regras

1. **PENSAMENTO SEQUENCIAL OBRIGATÓRIO:** O agente deve usar `mcp_sequential-thinking` para auditar campo por campo de um Tipo contra a sua Fixture/Mock correspondente, para não cometer a alucinação de esquecer campos ou inventar propriedades que não existem.
2. **Tipos são fonte de verdade** — divergências devem ser resolvidas atualizando serviços/fixtures/docs, não os tipos
3. **Não modificar código** — apenas diagnosticar e reportar
4. **Apresentar relatório antes de sugerir correções**
5. **Fixtures parciais são aceitáveis** — marcar como ⚠️, não ❌, se faltam apenas campos opcionais

---

## Exemplos de Uso

```text
/contract-check
/contract-check Proposal
/contract-check src/types/project.ts
```
