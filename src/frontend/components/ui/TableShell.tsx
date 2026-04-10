import type { ReactNode } from 'react';

interface TableShellProps {
  children: ReactNode;
  className?: string;
}

export function TableShell({ children, className = '' }: TableShellProps): JSX.Element {
  return (
    <div
      className={`overflow-x-auto rounded-2xl border border-border-color bg-surface shadow-soft ${className}`.trim()}
    >
      {children}
    </div>
  );
}
