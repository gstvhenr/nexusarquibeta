import React from 'react';
import { Button } from '@/components/ui';
import { KeyIcon } from '@/components/ui/icons';
import { formatCurrency } from '@/utils/formatters';

type InstagramTopBarProps = {
  totalInvested: number;
  onOpenCredentials: () => void;
};

export const InstagramTopBar: (props: InstagramTopBarProps) => React.ReactNode = ({
  totalInvested,
  onOpenCredentials,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="bg-surface rounded-xl shadow-soft p-4 flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
          <span className="text-success font-bold text-sm">R$</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-text-secondary">
            Total investido em marketing (Instagram acumulado)
          </p>
          <p className="text-lg font-bold text-success">{formatCurrency(totalInvested)}</p>
          <p className="text-[11px] text-text-secondary">
            Valor acumulado automaticamente a partir das páginas de marketing.
          </p>
        </div>
      </div>

      <Button variant="secondary" onClick={onOpenCredentials} className="shadow-soft">
        <KeyIcon className="w-4 h-4 text-primary" />
        Acessos
      </Button>
    </div>
  );
};
