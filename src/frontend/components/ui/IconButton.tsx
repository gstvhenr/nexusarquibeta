import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Visual intent — controls hover color */
  variant?: 'default' | 'danger' | 'primary' | 'secondary';
  /** Padding size */
  size?: 'sm' | 'md';
  /** The icon element */
  children: ReactNode;
  /** Accessible label (required for icon-only buttons) */
  'aria-label': string;
}

const VARIANT_STYLES: Record<Required<IconButtonProps>['variant'], string> = {
  default: 'text-text-secondary hover:text-text-primary hover:bg-surface',
  danger: 'text-text-secondary hover:text-error hover:bg-error/10',
  primary: 'text-text-secondary hover:text-primary hover:bg-primary/10',
  secondary: 'text-text-secondary hover:text-secondary hover:bg-secondary/10',
};

const SIZE_STYLES: Record<Required<IconButtonProps>['size'], string> = {
  sm: 'p-1',
  md: 'p-2',
};

/** Icon-only action button — input -> styled circular icon button */
export function IconButton({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-full transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
