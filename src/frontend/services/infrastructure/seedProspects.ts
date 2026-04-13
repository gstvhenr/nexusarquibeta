import type { Prospect } from '../../types';

/**
 * Seed prospects — disabled (clean database).
 * Array kept empty intentionally; function signature preserved for contract stability.
 */
const SEED_PROSPECTS: Prospect[] = [];

/**
 * Ensures all canonical seed prospects exist in the given list.
 *
 * Input -> Output:
 * - input: raw prospect array from localStorage.
 * - output: { prospects, changed } — list with seeds upserted.
 */
export function applySeedProspects(rawProspects: Prospect[]): {
  prospects: Prospect[];
  changed: boolean;
} {
  const list = [...rawProspects];
  let changed = false;

  for (const seed of SEED_PROSPECTS) {
    const exists = list.some((p) => p.id === seed.id);
    if (!exists) {
      list.push(seed);
      changed = true;
    }
  }

  return { prospects: list, changed };
}
