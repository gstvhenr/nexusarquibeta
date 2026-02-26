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
