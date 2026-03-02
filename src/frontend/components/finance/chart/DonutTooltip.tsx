import React from 'react';
import { formatCurrency } from '../../../utils/formatters';

interface DonutTooltipPayload {
  name: string;
  value: number;
  payload: { color: string };
}

interface DonutTooltipProps {
  active?: boolean;
  payload?: DonutTooltipPayload[];
}

export const DonutTooltip: (props: DonutTooltipProps) => React.ReactNode = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-surface/95 backdrop-blur-md p-3 rounded-xl shadow-lifted border border-border-color/50 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="text-text-secondary">{data.name}</span>
        </div>
        <p className="font-bold text-text-primary tabular-nums">{formatCurrency(data.value)}</p>
      </div>
    );
  }
  return null;
};
