---
description: Test generation and test running command. Creates and executes tests for code.
---

# /test - Geração e Execução de Testes

$ARGUMENTS

---

## Sub-comandos

```
/test                          - Roda todos os testes (npm run test)
/test [arquivo/feature]        - Gera testes para o alvo especificado
/test coverage                 - Exibe relatório de cobertura
/test watch                    - Modo watch (npx vitest)
```

---

## Comportamento

### Gerar Testes

Quando pedido para testar um arquivo ou feature:

1. **Analisar o código**
   - Identificar funções/hooks/componentes
   - Detectar edge cases
   - Identificar dependências para mockar

2. **Gerar casos de teste**
   - Happy path
   - Casos de erro
   - Edge cases
   - Usar fixtures canônicas de `src/test/fixtures/`

3. **Escrever testes com Vitest**
   - Padrão AAA (Arrange-Act-Assert)
   - Mockar IndexedDB via vi.mock quando necessário
   - Seguir padrões existentes em `src/services/*.test.ts`

---

## Output Format

```markdown
## 🧪 Testes: [Alvo]

### Plano de Testes

| Caso                                 | Tipo | Cobertura  |
| ------------------------------------ | ---- | ---------- |
| deve calcular total corretamente     | Unit | Happy path |
| deve retornar [] quando vazio        | Unit | Edge case  |
| deve lançar erro com dados inválidos | Unit | Erro       |

### Testes Gerados

`src/services/[arquivo].test.ts`

[Bloco de código com testes]

---

Rodar com: `npm run test`
```

---

## Padrão de Testes — Nexus-Arqui

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createTestProject, createTestProposal } from '../test/fixtures';

describe('proposalService', () => {
  describe('getByStatus', () => {
    it('deve retornar apenas propostas com status won', async () => {
      // Arrange
      const proposals = [
        createTestProposal({ status: 'won' }),
        createTestProposal({ status: 'pending' }),
      ];
      vi.mocked(getAllProposals).mockResolvedValue(proposals);

      // Act
      const result = await getByStatus('won');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('won');
    });
  });
});
```

---

## Gates de Cobertura

| Comando                 | Cobertura                          |
| ----------------------- | ---------------------------------- |
| `npm run test`          | Roda todos sem relatório           |
| `npm run test:coverage` | Gera relatório (meta: ≥ 60% lines) |
| `npx vitest`            | Modo watch interativo              |

---

## Princípios

- **Behavior, não implementação** — teste via interface pública
- **Uma assertion por it** (quando prático)
- **Nomes descritivos** — `deve fazer X quando Y`
- **Fixtures obrigatórias** — nunca dados ad-hoc

---

## Exemplos de Uso

```
/test src/services/proposalService.ts
/test fluxo de criação de projeto
/test coverage
/test utils/formatters.ts
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
