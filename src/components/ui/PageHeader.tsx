import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  count?: number;
  action?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, count, action, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary font-serif">{title}</h1>
        {count !== undefined && (
          <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
            {count}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {children}
        {action}
      </div>
    </div>
  );
}
