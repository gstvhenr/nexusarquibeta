import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ToggleProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onChange'
> {
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
}

export function Toggle({
  enabled,
  onChange,
  checked,
  onCheckedChange,
  label,
  description,
  className = '',
  disabled = false,
  ...rest
}: ToggleProps): JSX.Element {
  const isChecked = checked ?? enabled ?? false;
  const handleToggle = onCheckedChange ?? onChange ?? (() => undefined);
  const trackClass = isChecked
    ? 'bg-primary border-primary'
    : 'bg-border-color border-border-color';
  const thumbClass = isChecked ? 'translate-x-5 bg-surface' : 'translate-x-0 bg-surface';

  return (
    <div className={`flex items-start justify-between gap-4 ${className}`.trim()}>
      {(label || description) && (
        <div className="space-y-1">
          {label ? <div className="text-sm font-semibold text-text-primary">{label}</div> : null}
          {description ? <div className="text-sm text-text-secondary">{description}</div> : null}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-label={typeof label === 'string' ? label : 'Alternar'}
        disabled={disabled}
        onClick={() => handleToggle(!isChecked)}
        className={[
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface',
          'disabled:cursor-not-allowed disabled:opacity-50',
          trackClass,
        ].join(' ')}
        {...rest}
      >
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out',
            thumbClass,
          ].join(' ')}
        />
      </button>
    </div>
  );
}
