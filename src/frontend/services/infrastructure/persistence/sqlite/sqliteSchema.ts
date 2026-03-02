/**
 * Reads and parses the .sql schema files for the SQLite database.
 *
 * - input: schema.sql and pragmas.sql files (loaded via Vite ?raw import).
 * - output: parsed SQL statements ready for execution.
 */

// Vite raw imports — loads .sql file contents as strings at build time
import schemaSql from './schema.sql?raw';
import pragmasSql from './pragmas.sql?raw';

/**
 * Mapping from AppData key → SQL table name.
 * Every key of the AppData interface MUST appear here.
 */
export const ENTITY_TABLE_MAP: Record<string, string> = {
  projects: 'projects',
  proposals: 'proposals',
  clients: 'clients',
  documentStorage: 'document_storage',
  suppliers: 'suppliers',
  products: 'products',
  supplierProductPrices: 'supplier_product_prices',
  quotations: 'quotations',
  commissions: 'commissions',
  marketingProfessionals: 'marketing_professionals',
  marketingActivities: 'marketing_activities',
  marketingIdeas: 'marketing_ideas',
  socialNetworks: 'social_networks',
  freelancers: 'freelancers',
  agendaEvents: 'agenda_events',
  manualExpenses: 'manual_expenses',
  manualIncomes: 'manual_incomes',
  prospects: 'prospects',
  hiredServices: 'hired_services',
  cashBoxExpenses: 'cash_box_expenses',
  cashBoxCredits: 'cash_box_credits',
  reminders: 'reminders',
  acceptedPaymentMethods: 'accepted_payment_methods',
};

/** AppData keys stored as arrays in entity tables. */
export const ARRAY_ENTITY_KEYS = Object.keys(ENTITY_TABLE_MAP);

/** AppData keys stored as scalars in system_config. */
export const SCALAR_KEYS = [
  'globalIdentifierCounter',
  'contractDeadlines',
  'customBudgetTemplate',
  'dismissedFocusItems',
  'documentStorage',
] as const;

/**
 * Splits a raw .sql file into individual executable statements.
 * Strips comments and empty lines.
 */
function parseSqlStatements(rawSql: string): string[] {
  return rawSql
    .split(';')
    .map((s) => s.replace(/--.*$/gm, '').trim())
    .filter((s) => s.length > 0);
}

/** Returns the CREATE TABLE statements from schema.sql. */
export function getSchemaStatements(): string[] {
  return parseSqlStatements(schemaSql);
}

/** Returns the PRAGMA statements from pragmas.sql. */
export function getDurabilityPragmas(): string[] {
  return parseSqlStatements(pragmasSql);
}
