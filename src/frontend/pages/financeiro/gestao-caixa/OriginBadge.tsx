import React from 'react';
import { Badge } from '@/components/ui';
import type { CashBoxExpense } from '@/types';

type OriginBadgeProps = {
  origin: CashBoxExpense['origin'];
};

export const OriginBadge: (props: OriginBadgeProps) => React.ReactNode = ({ origin }) => {
  const variant = origin === 'Profissional' ? 'primary' : 'accent';

  return <Badge variant={variant}>{origin}</Badge>;
};
