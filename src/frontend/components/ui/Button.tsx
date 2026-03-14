import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_STYLES: Record<Required<ButtonProps>['variant'], string> = {
  primary: 'bg-primary text-primary-content hover:bg-primary-focus shadow-soft',
  secondary: 'bg-surface text-text-primary border border-border-color hover:bg-background',
  danger: 'bg-error text-white hover:bg-error/90',
  ghost: 'bg-transparent text-text-primary hover:bg-surface',
  success: 'bg-success text-white hover:bg-success/90 shadow-soft',
};

const SIZE_STYLES: Record<Required<ButtonProps>['size'], string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

/** Reusable button primitive — input -> styled button element */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold
        rounded-lg transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}`.trim()}
      {...rest}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
