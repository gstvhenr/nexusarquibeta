import type { AgendaEvent } from '../../types';

/**
 * Seed agenda events — disabled (clean database).
 * Array kept empty intentionally; function signature preserved for contract stability.
 */
const SEED_EVENTS: AgendaEvent[] = [];

/**
 * Ensures all canonical seed agenda events exist in the given list.
 *
 * Input -> Output:
 * - input: raw agenda events array from localStorage.
 * - output: { events, changed } — list with seeds upserted.
 */
export function applySeedAgendaEvents(rawEvents: AgendaEvent[]): {
  events: AgendaEvent[];
  changed: boolean;
} {
  const list = [...rawEvents];
  let changed = false;

  for (const seed of SEED_EVENTS) {
    const exists = list.some((e) => e.id === seed.id);
    if (!exists) {
      list.push(seed);
      changed = true;
    }
  }

  return { events: list, changed };
}
