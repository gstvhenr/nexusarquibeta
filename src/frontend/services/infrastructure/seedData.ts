import type { LegacyClientRecord } from './migrations';

/**
 * Seed clients — disabled (clean database).
 * Array kept empty intentionally; function signature preserved for contract stability.
 */
const ALL_SEEDS: LegacyClientRecord[] = [];

/**
 * Seed sanitization and upsert for client records.
 * Removes obsolete mock/demo clients and ensures canonical seeds exist.
 *
 * Input -> Output:
 * - input: raw client array from localStorage.
 * - output: { clients, changed } — sanitized clients with seeds applied.
 */
export function applySeedClients(rawClients: LegacyClientRecord[]): {
  clients: LegacyClientRecord[];
  changed: boolean;
} {
  const obsoleteIds = new Set([
    'mock_client_gustavo',
    'mock_client_alexandre',
    'mock_client_bruno',
  ]);
  const obsoleteNames = new Set([
    'Gustavo Henrique Geraldo',
    'Alexandre Belfante',
    'Bruno Lacerda',
  ]);

  // 1. Remove obsolete entries
  let clients = rawClients.filter(
    (c) => !obsoleteIds.has(c.id ?? '') && !obsoleteNames.has(c.name ?? ''),
  );
  let changed = clients.length !== rawClients.length;

  // 2. Upsert all canonical seeds (empty — no seeds injected)
  for (const seed of ALL_SEEDS) {
    const exists = clients.some((c) => c.id === seed.id);
    if (!exists) {
      clients = [seed as unknown as LegacyClientRecord, ...clients];
      changed = true;
    }
  }

  return { clients, changed };
}
