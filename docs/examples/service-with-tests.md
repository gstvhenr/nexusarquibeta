# Canonical Example: Service com Testes (Given/When/Then)

## Objetivo

Modelo completo de service puro + testes em formato Given/When/Then.
Este exemplo é a REFERÊNCIA OFICIAL para novos services e testes.

## Arquivos de referência

- Serviço: `src/services/clientService.ts`
- Teste: `src/services/clientService.test.ts`
- Fixture: `src/test/fixtures/client.fixture.json`

## Padrão mínimo obrigatório

1. JSDoc com `input -> output` e `Example`
2. Função pura (sem efeitos colaterais ocultos)
3. Tipo de erro discriminado (union type, não `throw`)
4. Teste em formato Given/When/Then explícito
5. Cobertura de caminho feliz e caminho de erro

## Exemplo canônico — Serviço

```ts
import type { Client } from '../types';
import { v4 as uuidv4 } from 'uuid';

type SaveClientError = 'duplicate_cpf_cnpj' | 'invalid_cpf_cnpj';

const getDigits = (value: string): string => value.replace(/\D/g, '');
const allDigitsEqual = (value: string): boolean => /^(\d)\1+$/.test(value);

const validateCPF = (cpf: string): boolean => {
  if (cpf.length !== 11 || allDigitsEqual(cpf)) return false;
  const calc = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(cpf[i]) * (length + 1 - i);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
};

const validateCNPJ = (cnpj: string): boolean => {
  if (cnpj.length !== 14 || allDigitsEqual(cnpj)) return false;
  const calc = (base: string, factors: number[]) => {
    const sum = base
      .split('')
      .reduce((acc, digit, index) => acc + Number(digit) * factors[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const base = cnpj.slice(0, 12);
  const digit1 = calc(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = calc(`${base}${digit1}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return digit1 === Number(cnpj[12]) && digit2 === Number(cnpj[13]);
};

const isValidCpfCnpj = (value: string): boolean => {
  const digits = getDigits(value);
  if (!digits) return true;
  if (digits.length === 11) return validateCPF(digits);
  if (digits.length === 14) return validateCNPJ(digits);
  return false;
};

/**
 * Input -> Output:
 * - input: cliente a salvar, cliente original (ou null) e lista atual.
 * - output: nova lista de clientes; em erro retorna `error` de domínio.
 * Example:
 * const result = saveClientAndUpdateState(incoming, original, allClients);
 */
export const saveClientAndUpdateState = (
  clientToSave: Client,
  originalClient: Client | null,
  allClients: Client[],
): { updatedClients: Client[]; error?: SaveClientError } => {
  const normalizedCpfCnpj = getDigits(clientToSave.cpfCnpj || '');
  if (normalizedCpfCnpj && !isValidCpfCnpj(normalizedCpfCnpj)) {
    return { updatedClients: allClients, error: 'invalid_cpf_cnpj' };
  }

  if (
    normalizedCpfCnpj &&
    allClients.some(
      (c) => getDigits(c.cpfCnpj || '') === normalizedCpfCnpj && c.id !== clientToSave.id,
    )
  ) {
    return { updatedClients: allClients, error: 'duplicate_cpf_cnpj' };
  }

  let finalClient = { ...clientToSave };

  if (finalClient.id && originalClient) {
    const newLogs = generateAuditLog(originalClient, finalClient);
    if (newLogs.length > 0) {
      finalClient.auditLog = [...(originalClient.auditLog || []), ...newLogs];
      finalClient.lastContactDate = new Date().toISOString();
    }
    return {
      updatedClients: allClients.map((c) => (c.id === finalClient.id ? finalClient : c)),
    };
  }

  finalClient.id = uuidv4();
  finalClient.registrationDate = new Date().toISOString();
  finalClient.auditLog = [
    {
      timestamp: new Date().toISOString(),
      field: 'Cliente',
      oldValue: 'N/A',
      newValue: 'Cliente criado.',
    },
  ];
  return { updatedClients: [finalClient, ...allClients] };
};
```

## Exemplo canônico — Teste (Given/When/Then)

```ts
describe('clientService.saveClientAndUpdateState', () => {
  it('deve rejeitar CPF/CNPJ duplicado', () => {
    // Given — cliente existente com CPF válido
    const existing = [{ id: '1', cpfCnpj: '11144477735' }] as Client[];
    const incoming = { id: '2', cpfCnpj: '111.444.777-35' } as Client;

    // When — tentativa de salvar com CPF idêntico
    const result = saveClientAndUpdateState(incoming, null, existing);

    // Then — retorna erro de domínio específico e mantém lista inalterada
    expect(result.error).toBe('duplicate_cpf_cnpj');
    expect(result.updatedClients).toBe(existing);
  });

  it('deve criar cliente novo com audit log inicial', () => {
    // Given — entrada válida sem clientes existentes
    const incoming = {
      id: '',
      name: 'Novo Cliente',
      cpfCnpj: '',
      contacts: [],
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zip: '',
      },
      serviceInterests: [],
    } as Client;

    // When — primeiro save
    const result = saveClientAndUpdateState(incoming, null, []);

    // Then — cliente criado com ID e audit log
    expect(result.error).toBeUndefined();
    expect(result.updatedClients).toHaveLength(1);
    expect(result.updatedClients[0].id).toBeTruthy();
    expect(result.updatedClients[0].auditLog).toHaveLength(1);
  });
});
```

## Anti-pattern (NÃO fazer)

```ts
// ERRADO: teste sem estrutura, difícil de entender
it('works', () => {
  expect(saveClientAndUpdateState({} as Client, null, [])).toBeTruthy();
});

// ERRADO: testar implementação interna em vez de comportamento público
it('calls getDigits', () => {
  // Não acoplar teste a funções internas privadas
});
```

## Regra de manutenção

- Mudou contrato de input/output: atualizar JSDoc + este exemplo + testes
- Mudou padrão de teste: atualizar este exemplo primeiro e depois propagar
