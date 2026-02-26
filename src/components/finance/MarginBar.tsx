import React from 'react';
import { CardShell } from './CardShell';

interface MarginBarProps {
  receita: number;
  despesa: number;
  margin: number;
}

/**
 * Displays a revenue vs. expense proportion bar and the profit margin percentage.
 *
 * Terminology clarification (#8):
 * - `incomeShare`: The proportion of income relative to the total of (income + expenses).
 *    This is a RATIO, not a margin. It drives the bar width.
 * - `margin` (prop): The profit margin = (saldo / receita) * 100.
 *    This is the percentage displayed in the top-right corner.
 */
export const MarginBar: (props: MarginBarProps) => React.ReactNode = ({
  receita,
  despesa,
  margin,
}) => {
  const total = receita + despesa || 1;
  const incomeShare = (receita / total) * 100; // (#8) Renamed from receitaPct for clarity
  const isPositive = margin >= 0;

  return (
    <CardShell glow={isPositive ? 'success' : 'error'} className="relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${isPositive ? 'from-success/5' : 'from-error/5'} to-transparent pointer-events-none`}
      />
      <div className="relative p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Margem
          </span>
          <span
            className={`text-xl font-bold tabular-nums ${isPositive ? 'text-success' : 'text-error'}`}
          >
            {margin.toFixed(1)}%
          </span>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-text-secondary mb-1.5 font-medium">
            <span>Receita</span>
            <span>Despesa</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-error/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-success via-emerald-400 to-success transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(incomeShare, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </CardShell>
  );
};
