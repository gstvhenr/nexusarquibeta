import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import { uiPreferenceService } from '../services/infrastructure/uiPreferenceService';
import { driveSyncEngine } from '../services/infrastructure/driveSyncEngine';

const useLocalStorage = <T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setHydrated] = useState(false);
  const initialValueRef = useRef(initialValue);
  const lastHydrationKeyRef = useRef(key);
  const hasPendingUpdateBeforeHydrationRef = useRef(false);
  const skipNextPersistRef = useRef(false);

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
    return uiPreferenceService.subscribe((event) => {
      if (event.key !== key) return;
      skipNextPersistRef.current = true;
      setStoredValue((event.value ?? initialValueRef.current) as T);
    });
  }, [key]);

  useEffect(() => {
    if (!isHydrated) return;
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    void uiPreferenceService
      .setItem(key, storedValue, { source: 'local' })
      .then(() => {
        driveSyncEngine.notifyPreferenceChanged(key);
      })
      .catch((error) => {
        console.warn(`Error setting persisted UI preference key "${key}":`, error);
      });
  }, [isHydrated, key, storedValue]);

  return [storedValue, setValue];
};

export default useLocalStorage;
