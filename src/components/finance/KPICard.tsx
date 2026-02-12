import React from 'react';
import { CardShell } from './CardShell';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: number;
  variant: 'success' | 'danger' | 'warning' | 'default';
}

const variantStyles = {
  success: {
    text: 'text-success',
    bg: 'bg-success/10',
    accent: 'from-success/5 to-transparent',
    glow: 'success' as const,
  },
  danger: {
    text: 'text-error',
    bg: 'bg-error/10',
    accent: 'from-error/5 to-transparent',
    glow: 'error' as const,
  },
  warning: {
    text: 'text-warning',
    bg: 'bg-warning/10',
    accent: 'from-warning/5 to-transparent',
    glow: 'warning' as const,
  },
  default: {
    text: 'text-secondary',
    bg: 'bg-secondary/10',
    accent: 'from-secondary/5 to-transparent',
    glow: 'primary' as const,
  },
};

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon, change, variant }) => {
  const s = variantStyles[variant];
  const changeIsPositive = change !== undefined && change >= 0;

  return (
    <CardShell glow={s.glow} className="relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} pointer-events-none`} />
      <div className="relative p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {title}
          </span>
          <div className={`p-2 rounded-xl ${s.bg} ${s.text}`}>
            {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
          </div>
        </div>
        <div className="flex items-end justify-between gap-2">
          <span className={`text-2xl font-bold font-sans tracking-tight ${s.text}`}>{value}</span>
          {change !== undefined && (
            <div
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                            ${changeIsPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}
            >
              {changeIsPositive ? '↑' : '↓'} {Math.abs(change).toFixed(0)}%
            </div>
          )}
        </div>
      </div>
    </CardShell>
  );
};
