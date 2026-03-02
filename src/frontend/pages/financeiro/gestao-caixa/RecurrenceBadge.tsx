import React from 'react';
import { AlertIcon, CheckCircleIcon, ClockIcon } from '../../../components/ui/icons';
import type { CashBoxExpense } from '../../../types';

type RecurrenceBadgeProps = {
  recurrence: CashBoxExpense['recurrence'];
  installmentNumber?: number | null;
  installmentTotal?: number | null;
};

export const RecurrenceBadge: (props: RecurrenceBadgeProps) => React.ReactNode = ({
  recurrence,
  installmentNumber,
  installmentTotal,
}) => {
  if (recurrence === 'Única') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-info/10 text-info">
        <CheckCircleIcon className="w-3.5 h-3.5" />
        Única
      </span>
    );
  }

  if (recurrence === 'Parcelada') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-accent/10 text-accent">
        <ClockIcon className="w-3.5 h-3.5" />
        {installmentNumber}/{installmentTotal}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-warning/10 text-warning">
      <AlertIcon className="w-3.5 h-3.5" />
      Indeterminada
    </span>
  );
};
