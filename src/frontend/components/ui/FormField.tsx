import { useId, type ReactNode } from 'react';

interface FormFieldProps {
  /** Label displayed above the field */
  label?: ReactNode;
  /** Error message displayed below — also passed semantically to the input */
  error?: string;
  /** Hint text displayed below the field (hidden if error is present) */
  hint?: string;
  /** The form control(s) to render inside */
  children: ReactNode;
  /** Extra class for the wrapper div (spacing, layout) */
  className?: string;
  /** Whether the field is required — appends * to label */
  required?: boolean;
}

/** Wrapper for label + input + error/hint — children slot -> structured form field */
export function FormField({
  label,
  error,
  hint,
  children,
  className = '',
  required = false,
}: FormFieldProps) {
  const generatedId = useId();

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      {label && (
        <label htmlFor={generatedId} className="text-xs font-medium text-text-secondary">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="text-xs text-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-text-tertiary">{hint}</span>
      ) : null}
    </div>
  );
}
