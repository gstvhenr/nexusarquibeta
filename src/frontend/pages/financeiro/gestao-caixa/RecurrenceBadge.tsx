import React from 'react';
import { Badge } from '@/components/ui';
import { AlertIcon, CheckCircleIcon, ClockIcon } from '@/components/ui/icons';
import type { CashBoxExpense } from '@/types';

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
      <Badge variant="info">
        <CheckCircleIcon className="w-3.5 h-3.5" />
        Única
      </Badge>
    );
  }

  if (recurrence === 'Parcelada') {
    return (
      <Badge variant="accent">
        <ClockIcon className="w-3.5 h-3.5" />
        {installmentNumber}/{installmentTotal}
      </Badge>
    );
  }

  return (
    <Badge variant="warning">
      <AlertIcon className="w-3.5 h-3.5" />
      Indeterminada
    </Badge>
  );
};
