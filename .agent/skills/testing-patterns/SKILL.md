---
name: testing-patterns
description: Padroes de teste, fluxo TDD e principios para Nexus-Arqui. Testes unitarios, integracao, mocks, ciclo RED-GREEN-REFACTOR.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Testing Patterns & TDD — Nexus-Arqui

> Stack de testes: **Vitest** (unit/integration) + **@testing-library/react** (componentes) + **Playwright** (E2E).
> Execute: `npm run test` (watch mode: `npx vitest`)
> Fixtures: `src/test/fixtures/`
> Gate: `npm run test:coverage`

---

## Testing Pyramid

```text
      /\
     /  \       E2E — Playwright
    /    \      Smoke tests dos fluxos críticos
   /------\
  /        \    Integration
 /          \   Services + Context juntos
/------------\
              Unit — Vitest
              Services, Utils, Hooks isolados
```

---

## TDD — RED-GREEN-REFACTOR

### 3 Leis do TDD

1. **Não escreva código de produção** sem ter um teste vermelho antes
2. **Escreva apenas o suficiente de teste** para causar falha (compilar NÃO é suficiente)
3. **Escreva apenas o suficiente de código** para fazer o teste passar

### Ciclo

```text
🔴 RED    → Escreva um teste que FALHA
⬇️
🟢 GREEN  → Escreva o MÍNIMO de código para passar
⬇️
🔵 REFACTOR → Limpe sem quebrar o teste
```

---

## AAA Pattern (obrigatório)

```typescript
it('deve calcular total de propostas ganhas', () => {
  // Arrange — setup
  const proposals = [
    createTestProposal({ status: 'won', value: 1000 }),
    createTestProposal({ status: 'lost', value: 500 }),
  ];

  // Act — executa
  const total = calculateWonRevenue(proposals);

  // Assert — verifica
  expect(total).toBe(1000);
});
```

---

## Fixtures do Projeto (SEMPRE use)

```typescript
// ✅ CORRETO — fixtures canônicas em src/test/fixtures/
import { createTestProject, createTestProposal, createTestClient } from '../test/fixtures';

// ❌ ERRADO — dados ad-hoc no teste
const project = { id: '1', name: 'Test', status: 'active' };
```

> Fixtures garantem conformidade com os tipos e evitam testes frágeis.

---

## Padrão por Domínio

| Domínio     | Localização do teste        | Localização do código  |
| ----------- | --------------------------- | ---------------------- |
| Services    | `src/services/*.test.ts`    | `src/services/*.ts`    |
| Utils       | `src/utils/*.test.ts`       | `src/utils/*.ts`       |
| Hooks       | `src/hooks/*.test.ts`       | `src/hooks/*.ts`       |
| Componentes | `src/components/*.test.tsx` | `src/components/*.tsx` |

---

## Unit Tests — Services

```typescript
describe('projectService', () => {
  describe('getActiveProjects', () => {
    it('filtra somente projetos ativos', async () => {
      const allProjects = [
        createTestProject({ status: 'active' }),
        createTestProject({ status: 'archived' }),
      ];
      vi.mocked(getAllProjects).mockResolvedValue(allProjects);

      const result = await getActiveProjects();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('active');
    });
  });
});
```

---

## Component Tests — React Testing Library

```typescript
// Foco: COMPORTAMENTO, não implementação
it('exibe mensagem de erro quando dados inválidos', async () => {
  render(<ProposalForm />);

  await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

  expect(screen.getByText(/valor obrigatório/i)).toBeInTheDocument();
});
```

---

## Mocking Strategies

```typescript
// Mock de service (preferido para unit tests de componentes)
vi.mock('../services/projectService', () => ({
  getProjects: vi.fn().mockResolvedValue([createTestProject()]),
}));

// Mock de módulo externo
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});
```

---

## Coverage Gates

| Tipo     | Meta               |
| -------- | ------------------ |
| Lines    | ≥ 60% (gate de CI) |
| Services | ≥ 80%              |
| Utils    | ≥ 80%              |

```bash
npm run test:coverage
```

---

## Anti-Patterns

| ❌ Não                            | ✅ Faça                                     |
| --------------------------------- | ------------------------------------------- |
| Criar dados de teste ad-hoc       | Use `createTestX()` em fixtures/            |
| Testar implementação interna      | Teste via interface pública do componente   |
| Snapshot tests para lógica        | Assertions explícitas                       |
| Ignorar testes flaky              | Corrija root cause                          |
| Testes sem Arrange/Act/Assert     | Siga o padrão AAA                           |
| Escrever código antes do teste    | Teste primeiro (TDD)                        |
| Escrever muitos testes de uma vez | Um teste por vez                            |
| Pular o refactor                  | Refactor é parte do ciclo                   |
| Fixtures ad-hoc                   | Use `createTestX()` em `src/test/fixtures/` |

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
