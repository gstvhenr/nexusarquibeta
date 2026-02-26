---
name: webapp-testing
description: Principios de teste de aplicacoes web. E2E, Playwright, estrategias de auditoria profunda.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Web App Testing — Nexus-Arqui

> Stack: **Playwright** para E2E + **Vitest** para unit/integration.
> Gate: `npm run verify` (inclui test). E2E: `npm run test:e2e` (quando configurado).

---

## 1. Testing Pyramid para o ERP

```
      /\          E2E — Playwright (poucos)
     /  \         Fluxos críticos do ERP
    /----\
   /      \       Integration (alguns)
  /--------\      Services, Context
 /          \
/------------\    Unit — Vitest (muitos)
              Funções puras, utils, services
```

---

## 2. Fluxos Críticos do ERP (E2E prioritários)

| Prioridade | Fluxo                   | Por quê          |
| ---------- | ----------------------- | ---------------- |
| 1          | CRUD de Projetos        | Core do ERP      |
| 2          | Criação de Proposta     | Fluxo financeiro |
| 3          | Dashboard carrega dados | Saúde geral      |
| 4          | Login / onboarding      | Primeiro acesso  |

---

## 3. Playwright Patterns

```typescript
// ✅ Use data-testid para seletores estáveis
<button data-testid="save-project">Salvar</button>

// No teste:
await page.getByTestId('save-project').click();

// ✅ Espere elementos, não timeouts arbitrários
await expect(page.getByText('Projeto salvo')).toBeVisible();

// ❌ Não use: await page.waitForTimeout(2000);
```

### Configuração (playwright.config.ts)

| Setting     | Valor recomendado   |
| ----------- | ------------------- |
| Retries     | 2 no CI             |
| Trace       | `on-first-retry`    |
| Screenshots | `on-failure`        |
| Video       | `retain-on-failure` |

---

## 4. Vitest — Unit Tests no Projeto

```typescript
// src/test/fixtures/ — use fixtures canônicas do projeto
import { createTestProject, createTestProposal } from '../test/fixtures';

describe('projectService', () => {
  it('deve calcular receita total corretamente', () => {
    // Arrange
    const proposals = [createTestProposal({ value: 1000, status: 'won' })];

    // Act
    const total = calculateRevenue(proposals);

    // Assert
    expect(total).toBe(1000);
  });
});
```

> **Fixtures canônicas:** `src/test/fixtures/` — nunca crie dados ad-hoc nos testes.

---

## 5. Test Organization

```
src/
├── test/
│   ├── fixtures/          # Dados de teste reutilizáveis
│   ├── golden-fixtures.test.ts  # Contrato de tipos
│   └── setup.ts           # Setup global
├── services/*.test.ts     # Unit tests de services
├── utils/*.test.ts        # Unit tests de utils
└── components/*.test.tsx  # Component tests
```

---

## 6. CI Integration

```bash
# Verificação completa (antes de PR)
npm run verify

# Apenas testes
npm run test

# Com cobertura
npm run test:coverage
```

---

## 7. Anti-Patterns

| ❌ Não                   | ✅ Faça                              |
| ------------------------ | ------------------------------------ |
| Dados de teste ad-hoc    | Use fixtures de `src/test/fixtures/` |
| `waitForTimeout`         | Use auto-wait do Playwright          |
| Snapshots frágeis        | Assertions explícitas                |
| Testar implementação     | Teste comportamento                  |
| Index como key em listas | ID estável único                     |
| Ignorar testes flaky     | Investigar root cause                |

---

## 8. Coverage Targets

| Tipo             | Target atual             |
| ---------------- | ------------------------ |
| Lines            | ≥ 60% (gate configurado) |
| Services         | ≥ 80%                    |
| Utils            | ≥ 80%                    |
| Components (E2E) | Fluxos críticos cobertos |
