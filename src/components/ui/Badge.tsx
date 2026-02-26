import type { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<Required<BadgeProps>['variant'], string> = {
  primary: 'bg-primary/15 text-primary',
  secondary: 'bg-secondary/15 text-secondary',
  accent: 'bg-accent/15 text-accent',
  neutral: 'bg-text-secondary/10 text-text-secondary',
};

const SIZE_STYLES: Record<Required<BadgeProps>['size'], string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

/** Generic badge primitive (non-status) — variant + children -> styled span */
export function Badge({ variant = 'neutral', size = 'md', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}`.trim()}
    >
      {children}
    </span>
  );
}
