import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface HealthBarProps {
  label: string;
  value: number;
  total: number;
  variant: 'success' | 'warning' | 'error';
}

const barColors = {
  success: 'bg-gradient-to-r from-success to-success/70',
  warning: 'bg-gradient-to-r from-warning to-warning/70',
  error: 'bg-gradient-to-r from-error to-error/70',
};
const textColors = { success: 'text-success', warning: 'text-warning', error: 'text-error' };
const dotColors = { success: 'bg-success', warning: 'bg-warning', error: 'bg-error' };

export const HealthBar: (props: HealthBarProps) => React.ReactNode = ({
  label,
  value,
  total,
  variant,
}) => {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
          <span className="text-xs text-text-secondary font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-secondary tabular-nums">{pct.toFixed(0)}%</span>
          <span className={`text-xs font-bold tabular-nums ${textColors[variant]}`}>
            {formatCurrency(value)}
          </span>
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full bg-border-color/20 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColors[variant]}`}
          style={{ width: `${pct}%` }} // NOSONAR
        />
      </div>
    </div>
  );
};
