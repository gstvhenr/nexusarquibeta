/**
 * SQLite migration runner.
 *
 * - input: current schema version from schema_meta table.
 * - output: applies pending .sql migrations in sequence, updates version.
 *
 * Migrations follow the naming convention: NNN_description.sql
 * Each migration runs inside a transaction — all-or-nothing.
 */

// Cada migration registrada aqui com seu SQL carregado via ?raw
// Quando criar 002_xxx.sql, adicione: import m002 from './migrations/002_xxx.sql?raw';
import m001 from './migrations/001_initial_schema.sql?raw';

interface Migration {
  version: number;
  name: string;
  sql: string;
}

/** Lista ordenada de todas as migrations disponíveis. */
const MIGRATIONS: Migration[] = [
  { version: 1, name: '001_initial_schema', sql: m001 },
  // { version: 2, name: '002_add_tags', sql: m002 },
];

/**
 * Splits raw SQL into executable statements.
 */
function parseSql(raw: string): string[] {
  return raw
    .split(';')
    .map((s) => s.replace(/--.*$/gm, '').trim())
    .filter((s) => s.length > 0);
}

/**
 * Applies all pending migrations.
 *
 * - input: execFn (executes SQL), queryFn (reads rows).
 * - output: number of migrations applied.
 *
 * @example
 *   const applied = await runMigrations(execSingle, getAllRows);
 */
export async function runMigrations(
  execFn: (sql: string) => Promise<void>,
  queryFn: <T>(sql: string) => Promise<T[]>,
): Promise<number> {
  // Get current version
  const rows = await queryFn<{ version: number }>('SELECT version FROM schema_meta LIMIT 1');
  const currentVersion = rows.length > 0 ? rows[0].version : 0;

  // Filter pending migrations
  const pending = MIGRATIONS.filter((m) => m.version > currentVersion);
  if (pending.length === 0) return 0;

  for (const migration of pending) {
    const statements = parseSql(migration.sql);

    // Run each migration in a transaction
    await execFn('BEGIN IMMEDIATE');
    try {
      for (const stmt of statements) {
        await execFn(stmt);
      }
      // Update schema version
      await execFn(
        `UPDATE schema_meta SET version = ${migration.version}, migrated_at = ${Date.now()}`,
      );
      await execFn('COMMIT');
    } catch (error) {
      try {
        await execFn('ROLLBACK');
      } catch {
        // ROLLBACK failure = no active transaction
      }
      throw error;
    }
  }

  return pending.length;
}
