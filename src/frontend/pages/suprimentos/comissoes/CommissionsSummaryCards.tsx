import React from 'react';
import { formatCurrency } from '@/utils/formatters';

type CommissionsSummaryCardsProps = {
  pendingValue: number;
  receivedLast30Days: number;
};

export const CommissionsSummaryCards: (props: CommissionsSummaryCardsProps) => React.ReactNode = ({
  pendingValue,
  receivedLast30Days,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-surface rounded-xl shadow-soft p-5">
        <p className="text-sm font-semibold text-text-secondary">Total a Receber</p>
        <p className="text-3xl font-bold text-warning">{formatCurrency(pendingValue)}</p>
      </div>
      <div className="bg-surface rounded-xl shadow-soft p-5">
        <p className="text-sm font-semibold text-text-secondary">Recebido (Últimos 30 dias)</p>
        <p className="text-3xl font-bold text-success">{formatCurrency(receivedLast30Days)}</p>
      </div>
    </div>
  );
};
