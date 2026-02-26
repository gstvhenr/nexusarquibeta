# Canonical Service Example: clientService

Objetivo: manter um resumo rápido para services públicos com contrato claro, função
pura e tratamento explícito de erro.

> Status: referência simplificada (deprecada para implementação completa).
> Fonte primária atual: `docs/examples/service-with-tests.md`.

## Arquivo de referência

- `src/services/clientService.ts`

## Padrão mínimo obrigatório

- JSDoc com `input -> output` e exemplo.
- Retorno determinístico (sem efeitos colaterais ocultos).
- Erros representados por tipo de domínio (`error` discriminado) quando possível.
- Teste dedicado em `src/services/*.test.ts`.

## Exemplo canônico

```ts
/**
 * Input -> Output:
 * - input: client parcial/completo + cliente original (ou null) + lista atual.
 * - output: nova lista com create/update aplicado, ou erro de domínio.
 * Example:
 * const result = saveClientAndUpdateState(incoming, original, allClients)
 */
export const saveClientAndUpdateState = (
  clientToSave: Client,
  originalClient: Client | null,
  allClients: Client[],
): { updatedClients: Client[]; error?: 'duplicate_cpf_cnpj' | 'invalid_cpf_cnpj' } => {
  // Exemplo resumido: ver implementação completa e testes GWT em
  // docs/examples/service-with-tests.md.
  return { updatedClients: allClients };
};
```

## Regra de manutenção

Mudou contrato de input/output: atualizar JSDoc + testes +
`docs/data-contracts/types-contracts.md` + fixtures canônicas.
Mudou regra de implementação de service: atualizar primeiro
`docs/examples/service-with-tests.md` e depois este resumo.
