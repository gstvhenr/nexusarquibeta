import { useId, type InputHTMLAttributes } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field label displayed above the input */
  label?: string;
  /** Error message displayed below — also sets red border */
  error?: string;
  /** Helper text shown below when no error is present */
  helper?: string;
  /** Component size (overrides native `size` attribute — use `width` for char width) */
  size?: 'sm' | 'md';
  /** Extra class for the wrapper div (spacing, layout) */
  wrapperClassName?: string;
}

const SIZE_STYLES: Record<Required<InputProps>['size'], string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
};

/** Reusable input primitive with optional label and error — props -> styled input */
export function Input({
  label,
  error,
  helper,
  size = 'md',
  className = '',
  wrapperClassName = '',
  id,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={`flex flex-col gap-1 ${wrapperClassName}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`bg-surface border rounded-lg
          text-text-primary placeholder:text-text-secondary/50
          focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent
          transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-error' : 'border-border-color'}
          ${SIZE_STYLES[size]}
          ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-xs text-error" role="alert">
          {error}
        </span>
      )}
      {helper && !error && <span className="text-xs text-text-secondary">{helper}</span>}
    </div>
  );
}
