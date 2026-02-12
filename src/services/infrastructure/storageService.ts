/**
 * Input -> Output:
 * - input: chave e payload serializável.
 * - output: leitura/escrita segura no localStorage com fallback previsível.
 * Example:
 * const clients = storageService.getItem<Client[]>('clients', []);
 */
export const storageService = {
  /**
   * Retrieves an item from localStorage.
   * @param key The key of the item to retrieve.
   * @param initialValue The default value to return if the item doesn't exist or an error occurs.
   * @returns The parsed item from localStorage or the initialValue.
   */
  getItem<T>(key: string, initialValue: T): T {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage key “${key}”:`, error);
      return initialValue;
    }
  },

  /**
   * Stores an item in localStorage.
   * @param key The key under which to store the value.
   * @param value The value to store. It will be JSON.stringified.
   */
  setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
      console.warn('`localStorage` is not available. Skipping `setItem`.');
      return;
    }
    try {
      const serializedValue = JSON.stringify(value);
      window.localStorage.setItem(key, serializedValue);
      // Dispatch a storage event so that other tabs can sync state.
      window.dispatchEvent(new StorageEvent('storage', { key }));
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
    }
  },

  /**
   * Removes an item from localStorage.
   * @param key The key of the item to remove.
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new StorageEvent('storage', { key }));
    } catch (error) {
      console.error(`Error removing from localStorage key “${key}”:`, error);
    }
  },
};
