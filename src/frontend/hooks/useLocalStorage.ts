import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import { uiPreferenceService } from '../services/infrastructure/uiPreferenceService';

const useLocalStorage = <T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setHydrated] = useState(false);
  const initialValueRef = useRef(initialValue);
  const lastHydrationKeyRef = useRef(key);
  const hasPendingUpdateBeforeHydrationRef = useRef(false);

  initialValueRef.current = initialValue;

  const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
    hasPendingUpdateBeforeHydrationRef.current = true;
    setStoredValue(value);
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (lastHydrationKeyRef.current !== key) {
      hasPendingUpdateBeforeHydrationRef.current = false;
      lastHydrationKeyRef.current = key;
    }
    setHydrated(false);
    void uiPreferenceService
      .getItem<T>(key, initialValueRef.current)
      .then((value) => {
        if (!isMounted) return;
        if (!hasPendingUpdateBeforeHydrationRef.current) {
          setStoredValue(value);
        }
        setHydrated(true);
      })
      .catch((error) => {
        console.warn(`Error reading persisted UI preference key "${key}":`, error);
        if (!isMounted) return;
        setStoredValue(initialValueRef.current);
        setHydrated(true);
      });

    return () => {
      isMounted = false;
    };
  }, [key]);

  useEffect(() => {
    if (!isHydrated) return;
    void uiPreferenceService.setItem(key, storedValue).catch((error) => {
      console.warn(`Error setting persisted UI preference key "${key}":`, error);
    });
  }, [isHydrated, key, storedValue]);

  return [storedValue, setValue];
};

export default useLocalStorage;
