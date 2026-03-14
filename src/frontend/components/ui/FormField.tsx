import { Children, cloneElement, isValidElement, useId, type ReactNode } from 'react';

interface FormFieldProps {
  /** Label displayed above the field */
  label?: ReactNode;
  /** Optional target id for the generated label */
  htmlFor?: string;
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

/**
 * Inject `id` into the first React element child that doesn't already have one.
 * This guarantees the label's `htmlFor` always points to a real DOM element.
 */
function injectId(children: ReactNode, targetId: string): ReactNode {
  let injected = false;

  return Children.map(children, (child) => {
    if (injected || !isValidElement(child)) return child;

    const childProps = child.props as Record<string, unknown>;

    // Skip non-form wrappers (divs, spans) — recurse into them
    if (typeof child.type === 'string' && !['input', 'select', 'textarea'].includes(child.type)) {
      return child;
    }

    // If child already has an id, no injection needed
    if (childProps['id']) {
      injected = true;
      return child;
    }

    injected = true;
    return cloneElement(child, { id: targetId } as Record<string, unknown>);
  });
}

/** Wrapper for label + input + error/hint — children slot -> structured form field */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className = '',
  required = false,
}: FormFieldProps) {
  const generatedId = useId();
  const labelTargetId = htmlFor ?? generatedId;

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      {label && (
        <label htmlFor={labelTargetId} className="text-xs font-medium text-text-secondary">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      {injectId(children, labelTargetId)}
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
