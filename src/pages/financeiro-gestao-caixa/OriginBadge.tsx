import React from 'react';
import type { CashBoxExpense } from '../../types';

type OriginBadgeProps = {
  origin: CashBoxExpense['origin'];
};

export const OriginBadge: (props: OriginBadgeProps) => React.ReactNode = ({ origin }) => {
  const colorClass =
    origin === 'Profissional' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${colorClass}`}
    >
      {origin}
    </span>
  );
};
