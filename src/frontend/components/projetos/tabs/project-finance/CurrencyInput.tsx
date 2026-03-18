import React, { useCallback, useEffect, useId, useState } from 'react';
import { formatCurrency } from '@/utils/formatters';

interface CurrencyInputProps {
  value: number | undefined | null;
  onChange: (value: number | undefined) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  'aria-label'?: string;
}

/**
 * Input that displays values in "R$ XX.XXX,XX" format.
 * On focus, switches to raw number for editing.
 * On blur, formats back to currency display.
 */
export const CurrencyInput = ({
  value,
  onChange,
  className = '',
  placeholder,
  id,
  'aria-label': ariaLabel,
}: CurrencyInputProps) => {
  const autoId = useId();
  const resolvedId = id ?? autoId;
  const [isFocused, setIsFocused] = useState(false);
  const [rawValue, setRawValue] = useState('');

  useEffect(() => {
    if (!isFocused) {
      setRawValue(
        value !== undefined && value !== null && Number.isFinite(value) ? String(value) : '',
      );
    }
  }, [value, isFocused]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setRawValue(
      value !== undefined && value !== null && Number.isFinite(value) ? String(value) : '',
    );
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (rawValue === '') {
      onChange(undefined);
      return;
    }
    const parsed = parseFloat(rawValue);
    onChange(Number.isFinite(parsed) ? parsed : undefined);
  }, [rawValue, onChange]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      setRawValue(inputValue);

      if (inputValue === '') {
        onChange(undefined);
        return;
      }
      const parsed = parseFloat(inputValue);
      if (Number.isFinite(parsed)) {
        onChange(parsed);
      }
    },
    [onChange],
  );

  const displayValue = isFocused ? rawValue : formatCurrency(value ?? 0);

  return (
    <input
      id={resolvedId}
      type={isFocused ? 'number' : 'text'}
      value={displayValue}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
      aria-label={ariaLabel}
      readOnly={!isFocused && false}
    />
  );
};
