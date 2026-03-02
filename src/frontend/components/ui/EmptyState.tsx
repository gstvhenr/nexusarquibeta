import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Empty state placeholder — icon + title + description + optional action CTA */
export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`bg-surface rounded-xl border border-border-color/50 shadow-sm ${className}`.trim()}
    >
      <div className="text-center py-16 px-6">
        {icon && <div className="mx-auto mb-3 text-text-secondary/30">{icon}</div>}
        <h3 className="text-lg font-medium text-text-primary">{title}</h3>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
