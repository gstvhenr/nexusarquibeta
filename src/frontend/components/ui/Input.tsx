import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual variant */
  variant?: 'default' | 'filled';
  /** Component size */
  size?: 'sm' | 'md';
  /** Error message — sets red border when present */
  error?: string;
  /** Icon rendered before the input text */
  leftIcon?: ReactNode;
  /** Icon rendered after the input text */
  rightIcon?: ReactNode;
}

const VARIANT_STYLES: Record<Required<InputProps>['variant'], string> = {
  default: 'bg-background border border-border-color',
  filled: 'bg-surface border border-transparent',
};

const SIZE_STYLES: Record<Required<InputProps>['size'], string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
};

/** Reusable input primitive — props -> styled input element */
export function Input({
  variant = 'default',
  size = 'md',
  error,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  id,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="relative flex items-center">
      {leftIcon && (
        <span className="absolute left-3 text-text-secondary pointer-events-none">{leftIcon}</span>
      )}
      <input
        id={inputId}
        disabled={disabled}
        className={`w-full rounded-lg
          text-text-primary placeholder:text-text-tertiary
          focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent
          transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-error' : VARIANT_STYLES[variant]}
          ${SIZE_STYLES[size]}
          ${leftIcon ? 'pl-9' : ''}
          ${rightIcon ? 'pr-9' : ''}
          ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {rightIcon && (
        <span className="absolute right-3 text-text-secondary pointer-events-none">
          {rightIcon}
        </span>
      )}
    </div>
  );
}
