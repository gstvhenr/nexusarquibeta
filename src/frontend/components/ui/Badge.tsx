import type { HTMLAttributes, ReactNode } from 'react';

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const VARIANT_STYLES: Record<Required<BadgeProps>['variant'], string> = {
  default: 'bg-background text-text-secondary border border-border-color',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
  accent: 'bg-accent/10 text-accent',
};

const SIZE_STYLES: Record<Required<BadgeProps>['size'], string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
};

function Badge({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...rest
}: BadgeProps): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps };
