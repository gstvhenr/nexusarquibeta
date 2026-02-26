import type React from 'react';

export const FinancialKPICard = ({
  title,
  value,
  icon,
  colorClass,
  bgClass,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}) => (
  <div className="bg-surface p-5 rounded-2xl shadow-sm border border-border-color flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-full ${bgClass} ${colorClass}`}>{icon}</div>
    <div>
      <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">{title}</p>
      <p className={`text-2xl font-bold font-sans ${colorClass}`}>{value}</p>
    </div>
  </div>
);
