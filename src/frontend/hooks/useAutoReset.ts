import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * State that auto-resets to `defaultValue` after `delayMs`.
 *
 * Every call to `setValue` restarts the timer.
 * Timer is cleared on unmount — no stale setState calls.
 *
 * @example
 *   const [toast, setToast] = useAutoReset<string | null>(null, 3000);
 *   setToast('Saved!'); // resets to null after 3 s
 */
export function useAutoReset<T>(defaultValue: T, delayMs: number): [T, (value: T) => void] {
  const [value, setValueRaw] = useState<T>(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setValue = useCallback(
    (next: T) => {
      clearTimer();
      setValueRaw(next);

      if (next !== defaultValue) {
        timerRef.current = setTimeout(() => {
          setValueRaw(defaultValue);
          timerRef.current = null;
        }, delayMs);
      }
    },
    [clearTimer, defaultValue, delayMs],
  );

  useEffect(() => clearTimer, [clearTimer]);

  return [value, setValue];
}
