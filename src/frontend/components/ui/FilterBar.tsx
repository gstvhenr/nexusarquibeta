import type { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function FilterBar({ children, actions, className = '' }: FilterBarProps): JSX.Element {
  return (
    <div
      className={[
        'rounded-2xl border border-border-color bg-surface px-4 py-4 shadow-soft',
        'flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between',
        className,
      ].join(' ')}
    >
      <div className="flex flex-1 flex-wrap items-end gap-3">{children}</div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
