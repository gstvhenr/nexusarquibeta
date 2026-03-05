import { useMemo } from 'react';
import type { AppData } from '../services/infrastructure/api';
import type { DomainContext } from './types';
import type { SetFieldFn } from './createDomainSetter';

/**
 * Factory hook that builds a memoized domain slice from AppData.
 *
 * Accepts a list of AppData keys and returns an object with
 * the data values AND auto-generated setters (`setFoo`, `setBar`…),
 * replacing the verbose per-domain useMemo blocks.
 *
 * @example
 * ```ts
 * const coreValue = useDomain(data, setField, ['projects', 'proposals', 'clients']);
 * // → { projects, proposals, clients, setProjects, setProposals, setClients }
 * ```
 *
 * @param data - The full AppData state snapshot
 * @param setField - Unified field setter from DataProvider (stable via useCallback)
 * @param keys - Domain keys to extract from AppData
 * @returns Memoized domain object with data + setters
 */
export function useDomain<K extends keyof AppData>(
  data: AppData,
  setField: SetFieldFn,
  keys: K[],
): DomainContext<K> {
  // Spread individual data[key] values as deps — more granular than depending on the full data object.
  const dataDeps = keys.map((k) => data[k]);

  return useMemo(() => {
    const result = {} as DomainContext<K>;

    for (const key of keys) {
      // Data value
      (result as Record<string, unknown>)[key as string] = data[key];

      // Setter: set + Capitalized(key)
      const setterKey = `set${(key as string).charAt(0).toUpperCase()}${(key as string).slice(1)}`;
      (result as Record<string, unknown>)[setterKey] = (
        value: AppData[K] | ((prev: AppData[K]) => AppData[K]),
      ) => setField(key, value);
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dataDeps, setField]);
}
