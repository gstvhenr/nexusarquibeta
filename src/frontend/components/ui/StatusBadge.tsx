import type { ReactNode } from 'react';
import { Badge } from './Badge';
import { AlertIcon, CheckCircleIcon, ClockIcon } from './icons';

type StatusBadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

type StatusBadgeProps = {
  tone?: StatusBadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function StatusBadge({
  tone = 'default',
  icon,
  children,
  className = '',
}: StatusBadgeProps): JSX.Element {
  return (
    <Badge variant={tone} className={className}>
      {icon}
      {children}
    </Badge>
  );
}

export function renderRecurrenceBadge(
  recurrence: 'Única' | 'Parcelada' | 'Recorrente' | 'Indeterminada',
  installmentNumber?: number | null,
  installmentTotal?: number | null,
): JSX.Element {
  if (recurrence === 'Única') {
    return (
      <StatusBadge tone="info" icon={<CheckCircleIcon className="h-3.5 w-3.5" />}>
        Única
      </StatusBadge>
    );
  }

  if (recurrence === 'Parcelada') {
    return (
      <StatusBadge tone="accent" icon={<ClockIcon className="h-3.5 w-3.5" />}>
        {installmentNumber}/{installmentTotal}
      </StatusBadge>
    );
  }

  if (recurrence === 'Recorrente') {
    return (
      <StatusBadge tone="warning" icon={<AlertIcon className="h-3.5 w-3.5" />}>
        Recorrente
      </StatusBadge>
    );
  }

  return (
    <StatusBadge tone="warning" icon={<AlertIcon className="h-3.5 w-3.5" />}>
      Indeterminada
    </StatusBadge>
  );
}
