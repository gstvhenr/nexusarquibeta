# Canonical Component Example: Client Row (Tailwind + hooks)

Objetivo: oferecer um modelo de componente de apresentação com Tailwind e padrão de hooks previsível.

## Arquivo de referência

- `src/components/clientes/ClientTableRow.tsx`

## Padrão mínimo obrigatório

- Componente de UI não implementa regra de negócio complexa.
- Derivações locais via `useMemo` e handlers via `useCallback` quando necessário.
- Classes Tailwind explícitas e sem lógica financeira/contratual.

## Exemplo canônico

```tsx
import React, { useMemo, useCallback } from 'react';
import type { Client } from '../../types';

type Props = {
  client: Client;
  onView: (id: string) => void;
};

export const ClientRowModel: React.FC<Props> = React.memo(({ client, onView }) => {
  const initials = useMemo(
    () =>
      client.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [client.name],
  );

  const handleView = useCallback(() => onView(client.id), [onView, client.id]);

  return (
    <button
      type="button"
      onClick={handleView}
      className="flex w-full items-center justify-between rounded-lg border border-border-color bg-surface px-3 py-2 text-left hover:bg-background/80"
    >
      <span className="font-semibold text-text-primary">{client.name}</span>
      <span className="text-xs text-text-secondary">{initials}</span>
    </button>
  );
});
```

## Regra de manutenção

Se o padrão mudar, atualizar este exemplo e registrar em `DECISIONS.md`/ADR quando for mudança estrutural.
