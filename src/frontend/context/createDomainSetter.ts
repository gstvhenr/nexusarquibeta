import type { AppData } from '../services/infrastructure/api';
import type { Setter } from './types';

/** Callback signature used by the DataProvider's `setField` function. */
export type SetFieldFn = <K extends keyof AppData>(
  key: K,
  value: AppData[K] | ((prev: AppData[K]) => AppData[K]),
) => void;

/**
 * Factory that produces a type-safe domain setter for a given AppData key.
 *
 * Replaces ~20 identical inline arrow functions with a single generic helper,
 * reducing boilerplate without changing public contract.
 *
 * @example
 * ```ts
 * const coreValue = useMemo(() => ({
 *   projects: data.projects,
 *   setProjects: createDomainSetter(setField, 'projects'),
 * }), [data.projects, setField]);
 * ```
 */
export function createDomainSetter<K extends keyof AppData>(
  setField: SetFieldFn,
  key: K,
): Setter<AppData[K]> {
  return (value: AppData[K] | ((prev: AppData[K]) => AppData[K])) => setField(key, value);
}
