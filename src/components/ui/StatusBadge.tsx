import type { ReactNode } from 'react';

interface StatusBadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'accent';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<StatusBadgeProps['variant'], string> = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  error: 'bg-error/15 text-error',
  info: 'bg-info/15 text-info',
  neutral: 'bg-text-secondary/10 text-text-secondary',
  accent: 'bg-accent/15 text-accent',
};

const SIZE_STYLES: Record<Required<StatusBadgeProps>['size'], string> = {
  sm: 'px-2.5 py-0.5 text-[11px] min-w-[70px]',
  md: 'px-3 py-1 text-xs min-w-[90px]',
};

export function StatusBadge({ variant, size = 'md', children, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block font-bold rounded-full text-center
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}`}
    >
      {children}
    </span>
  );
}
