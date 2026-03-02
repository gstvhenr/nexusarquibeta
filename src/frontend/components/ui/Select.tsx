import { useId, type SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Field label displayed above the select */
  label?: string;
  options: SelectOption[];
  /** Error message displayed below — also sets red border */
  error?: string;
  /** Disabled placeholder option shown when no value is selected */
  placeholder?: string;
  /** Component size (overrides native `size` attribute) */
  size?: 'sm' | 'md';
  /** Extra class for the wrapper div (spacing, layout) */
  wrapperClassName?: string;
}

const SIZE_STYLES: Record<Required<SelectProps>['size'], string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
};

/** Reusable select primitive with label and error — options[] -> styled select */
export function Select({
  label,
  options,
  error,
  placeholder,
  size = 'md',
  className = '',
  wrapperClassName = '',
  id,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className={`flex flex-col gap-1 ${wrapperClassName}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`bg-surface border rounded-lg
          text-text-primary
          focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent
          transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-error' : 'border-border-color'}
          ${SIZE_STYLES[size]}
          ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
