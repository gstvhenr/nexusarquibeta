import type { ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

/**
 * Tab bar primitive — items[] + active key -> styled tab buttons.
 * Known limitation: no arrow-key keyboard navigation or aria-controls yet.
 */
export function Tabs({ items, active, onChange, className = '' }: TabsProps) {
  return (
    <div
      className={`flex gap-1 bg-surface/50 p-1 rounded-lg border border-border-color/30 ${className}`.trim()}
      role="tablist"
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={active === item.key}
          onClick={() => onChange(item.key)}
          className={`px-4 py-2 rounded-md text-sm font-medium
            transition-colors duration-150 flex items-center gap-2
            ${
              active === item.key
                ? 'bg-primary text-primary-content shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`.trim()}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
