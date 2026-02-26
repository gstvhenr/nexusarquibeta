import React from 'react';
import { formatCurrency } from '../../utils/formatters';

type CashBoxTotalsProps = {
  totalCredits: number;
  totalExpenses: number;
  netBalance: number;
};

export const CashBoxTotals: (props: CashBoxTotalsProps) => React.ReactNode = ({
  totalCredits,
  totalExpenses,
  netBalance,
}) => {
  return (
    <div className="mt-auto pt-4 border-t border-border-color shrink-0">
      <div className="grid grid-cols-3 text-right font-bold gap-2">
        <div>
          <span className="text-text-secondary text-sm">Créditos:</span>
          <p className="text-lg text-success">+{formatCurrency(totalCredits)}</p>
        </div>
        <div>
          <span className="text-text-secondary text-sm">Despesas:</span>
          <p className="text-lg text-error">-{formatCurrency(totalExpenses)}</p>
        </div>
        <div>
          <span className="text-text-secondary text-sm">Saldo:</span>
          <p className={`text-2xl ${netBalance >= 0 ? 'text-success' : 'text-error'}`}>
            {formatCurrency(netBalance)}
          </p>
        </div>
      </div>
    </div>
  );
};
