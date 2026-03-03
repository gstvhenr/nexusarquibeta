import React from 'react';
import { formatCurrency } from '@/utils/formatters';

interface TooltipPayload {
  dataKey: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

export const CustomTooltip: (props: CustomTooltipProps) => React.ReactNode = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/95 backdrop-blur-md p-3 rounded-xl shadow-lifted border border-border-color/50 text-xs">
        <p className="font-bold text-text-primary mb-2">{label}</p>
        {payload.map((pld) => (
          <div key={pld.dataKey} className="flex items-center justify-between gap-6 mb-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${pld.dataKey === 'income' ? 'bg-success' : 'bg-error'}`}
              />
              <span className="text-text-secondary">
                {pld.name === 'income' ? 'Receitas' : 'Despesas'}
              </span>
            </div>
            <span className="font-semibold text-text-primary tabular-nums">
              {formatCurrency(pld.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
