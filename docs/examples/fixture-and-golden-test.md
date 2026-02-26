# Canonical Example: Fixture e Golden Test

## Objetivo

Documentar como criar e manter fixtures canônicas com teste de contrato (golden test) para evitar regressão silenciosa de shape.

## Arquivos de referência

- Teste de contrato: `src/test/golden-fixtures.test.ts`
- Fixtures canônicas: `src/test/fixtures/client.fixture.json`, `src/test/fixtures/project.fixture.json`, `src/test/fixtures/proposal.fixture.json`
- Contratos de tipos: `docs/data-contracts/types-contracts.md`

## Fluxo recomendado (create/update)

1. Atualizar a fixture alvo em `src/test/fixtures/*` com shape final esperado.
2. Atualizar o teste em `src/test/golden-fixtures.test.ts` com `expectExactKeys(...)` para refletir o contrato oficial.
3. Rodar `npm run test` para validar a suíte rápida.
4. Rodar `npm run verify` para garantir loop completo de qualidade.
5. Se o shape mudou por regra de domínio, atualizar `docs/data-contracts/types-contracts.md`.

## Exemplo canônico

```ts
// src/test/golden-fixtures.test.ts
const expectExactKeys = (value: unknown, expectedKeys: string[]): Record<string, unknown> => {
  expect(value).not.toBeNull();
  expect(typeof value).toBe('object');

  const record = value as Record<string, unknown>;
  expect(Object.keys(record).sort()).toEqual([...expectedKeys].sort());
  return record;
};

describe('golden fixtures contracts', () => {
  it('keeps canonical Client shape stable', () => {
    // Given — fixture canônica carregada do disco
    const client = expectExactKeys(readFixture('client.fixture.json'), [
      'id',
      'name',
      'contacts',
      'status',
      'serviceInterests',
      'address',
      'isFavorite',
      'registrationDate',
      'lastContactDate',
      'pipelineStatus',
      'meetings',
      'behavioralProfile',
      'archived',
    ]);

    // When — validamos subestruturas críticas
    const contacts = client.contacts as unknown[];

    // Then — shape permanece estável para contrato do domínio
    expect(Array.isArray(contacts)).toBe(true);
    expect(contacts.length).toBeGreaterThan(0);
    expectExactKeys(contacts[0], ['id', 'phone', 'hasWhatsApp', 'isPrimary']);
    expectExactKeys(client.address, ['street', 'number', 'neighborhood', 'city', 'state', 'zip']);
  });
});
```

## Anti-pattern (NÃO fazer)

```ts
// ERRADO: fixture sem teste correspondente de shape
writeFixture('client.fixture.json', data);

// ERRADO: testar só existência sem contrato de chaves
expect(client).toBeTruthy();

// ERRADO: aceitar chave extra sem revisão de contrato
expect(Object.keys(client)).toContain('newExperimentalField');
```

## Regra de manutenção

- Mudou interface/shape de domínio: atualizar fixture + golden test + `docs/data-contracts/types-contracts.md` no mesmo ciclo.
- Não criar fixture sem teste de contrato associado.
