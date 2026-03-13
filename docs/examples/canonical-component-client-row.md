# Canonical Component Example: Client Row (Tailwind + hooks)

Objetivo: oferecer um modelo de componente de apresentação com Tailwind e padrão de hooks previsível.

## Arquivo de referência

- `src/frontend/components/clientes/ClientTableRow.tsx`

## Padrão mínimo obrigatório

- Componente de UI não implementa regra de negócio complexa.
- Derivações locais via `useMemo` e handlers via `useCallback` quando necessário.
- Classes Tailwind explícitas e sem lógica financeira/contratual.

## Exemplo canônico

```tsx
import { useMemo, useCallback, memo } from 'react';
import type { Client } from '../../types';

type Props = {
  client: Client;
  onView: (id: string) => void;
};

export const ClientRowModel = memo(function ClientRowModel({ client, onView }: Props) {
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

Se o padrão mudar, atualizar este exemplo e registrar em `DECISIONS-active.md`/ADR quando for mudança estrutural.

## Exemplo avançado

Referências reais: `src/frontend/components/finance/FinanceLineChart.tsx` e
`src/frontend/pages/financeiro/FinanceiroVisaoGeralPage.tsx`.

```tsx
import { forwardRef, useMemo, type ReactNode } from 'react';
import { useCoreData } from '../../context/CoreContext';
import { useFinanceData } from '../../context/FinanceContext';
import { CardShell } from '../finance/CardShell';
import { SectionTitle } from '../finance/SectionTitle';

type FinanceSnapshotCardProps = {
  title?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children?: ReactNode;
};

const FinanceSnapshotCard = forwardRef<HTMLDivElement, FinanceSnapshotCardProps>(
  function FinanceSnapshotCard(
    { title = 'Resumo Financeiro', isLoading = false, error = null, onRetry, children },
    ref,
  ) {
    const { projects } = useCoreData();
    const { commissions } = useFinanceData();

    const kpi = useMemo(() => {
      const activeProjects = projects.filter((p) => !p.archived).length;
      const pendingCommissions = commissions.filter((c) => c.status === 'Pendente').length;
      return { activeProjects, pendingCommissions };
    }, [projects, commissions]);

    return (
      <CardShell ref={ref} className="p-4">
        <SectionTitle>{title}</SectionTitle>

        {isLoading && (
          <p className="text-sm text-text-secondary animate-pulse">
            Carregando visão consolidada...
          </p>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-error/30 bg-error/10 p-3">
            <p className="text-sm text-error">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 text-xs font-semibold text-error underline"
              >
                Tentar novamente
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-2">
            <p className="text-sm text-text-primary">Projetos ativos: {kpi.activeProjects}</p>
            <p className="text-sm text-text-primary">
              Comissões pendentes: {kpi.pendingCommissions}
            </p>
            {children}
          </div>
        )}
      </CardShell>
    );
  },
);
```

## Anti-pattern

```tsx
// ERRADO: componente de UI com regra de negócio pesada acoplada
export const BadFinanceCard = () => {
  const [receivables, setReceivables] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const total = complexFinanceProjection(receivables, expenses, 24); // regra de domínio
  return <div>{total}</div>;
};

// ERRADO: prop opcional tratada sem fallback explícito
export const BadHeader = ({ title }: { title?: string }) => <h2>{title.toUpperCase()}</h2>;
```

## Forwarding refs, children compostos e props opcionais

- `forwardRef` deve existir quando o componente precisa expor foco, medição ou scroll para o pai.
- `children` deve ser usado como slot opcional para compor conteúdo sem acoplamento.
- Props opcionais devem ter fallback explícito (`title = '...'`, `error = null`) para evitar estados inválidos.
