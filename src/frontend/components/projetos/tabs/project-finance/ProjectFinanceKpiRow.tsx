import React from 'react';
import { formatCurrency } from '@/utils/formatters';
import { CashIcon, SettingsIcon } from '@/components/ui/icons';

interface ProjectFinanceKpiRowProps {
  totalPaid: number;
  totalToPay: number;
  totalAddendums: number;
  totalValue: number;
}

export const ProjectFinanceKpiRow: React.FC<ProjectFinanceKpiRowProps> = ({
  totalPaid,
  totalToPay,
  totalAddendums,
  totalValue,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-surface rounded-xl border border-border-color p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
          <CashIcon className="w-5 h-5 text-success" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
            Recebido
          </p>
          <p className="text-lg font-bold text-success tabular-nums">
            {formatCurrency(totalPaid)}
          </p>
        </div>
      </div>
      <div className="bg-surface rounded-xl border border-border-color p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
          <CashIcon className="w-5 h-5 text-warning" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
            A Receber
          </p>
          <p className="text-lg font-bold text-warning tabular-nums">
            {formatCurrency(totalToPay)}
          </p>
        </div>
      </div>
      <div className="bg-surface rounded-xl border border-border-color p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
          <SettingsIcon className="w-5 h-5 text-info" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
            Aditivos
          </p>
          <p
            className={`text-lg font-bold tabular-nums ${totalAddendums >= 0 ? 'text-success' : 'text-error'}`}
          >
            {totalAddendums >= 0 ? '+' : ''}
            {formatCurrency(totalAddendums)}
          </p>
        </div>
      </div>
      <div className="bg-surface rounded-xl border border-border-color p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
          <CashIcon className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
            Total Contrato
          </p>
          <p className="text-lg font-bold text-secondary tabular-nums">
            {formatCurrency(totalValue)}
          </p>
        </div>
      </div>
    </div>
  );
};
