import type { ReactNode } from 'react';

interface SectionProps {
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Section({
  title,
  description,
  actions,
  children,
  className = '',
  contentClassName = '',
}: SectionProps): JSX.Element {
  return (
    <section
      className={`grid grid-cols-1 gap-6 border-b border-border-color py-8 md:grid-cols-3 ${className}`.trim()}
    >
      <div className="space-y-2 md:col-span-1">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary">{description}</p>
        {actions ? <div className="flex flex-wrap items-center gap-2 pt-1">{actions}</div> : null}
      </div>
      <div
        className={`rounded-xl bg-surface p-6 shadow-soft md:col-span-2 ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </section>
  );
}
