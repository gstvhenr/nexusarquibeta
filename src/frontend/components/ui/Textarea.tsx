import { useId, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Component size — controls padding and font */
  size?: 'sm' | 'md';
  /** Error message — sets red border when present */
  error?: string;
}

const SIZE_STYLES: Record<Required<TextareaProps>['size'], string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
};

/** Reusable textarea primitive — props -> styled textarea element */
export function Textarea({
  size = 'md',
  error,
  rows = 3,
  className = '',
  disabled,
  id,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <textarea
      id={textareaId}
      rows={rows}
      disabled={disabled}
      className={`w-full bg-background border rounded-lg
        text-text-primary placeholder:text-text-tertiary
        focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        resize-y
        ${error ? 'border-error' : 'border-border-color'}
        ${SIZE_STYLES[size]}
        ${className}`.trim()}
      aria-invalid={error ? true : undefined}
      {...rest}
    />
  );
}
