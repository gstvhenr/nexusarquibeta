import type { Reminder } from '../../types';

/**
 * Seed reminders — disabled (clean database).
 * Array kept empty intentionally; function signature preserved for contract stability.
 */
const SEED_REMINDERS: Reminder[] = [];

/**
 * Ensures all canonical seed reminders exist in the given list.
 *
 * Input -> Output:
 * - input: raw reminder array from localStorage.
 * - output: { reminders, changed } — list with seeds upserted.
 */
export function applySeedReminders(rawReminders: Reminder[]): {
  reminders: Reminder[];
  changed: boolean;
} {
  const list = [...rawReminders];
  let changed = false;

  for (const seed of SEED_REMINDERS) {
    const exists = list.some((r) => r.id === seed.id);
    if (!exists) {
      list.push(seed);
      changed = true;
    }
  }

  return { reminders: list, changed };
}
