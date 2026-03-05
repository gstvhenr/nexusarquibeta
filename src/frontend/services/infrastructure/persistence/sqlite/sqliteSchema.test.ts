import { describe, expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// Mock Vite ?raw imports BEFORE the module is loaded.
// The factory must return the actual string value directly (not a fn mock),
// because the sqliteSchema module reads the imports at module-init time.
// Individual getSchemaStatements / getDurabilityPragmas tests exercise the
// parseSqlStatements function by mocking the MODULES, NOT the ?raw imports.
// ---------------------------------------------------------------------------
import { vi } from 'vitest';

vi.mock('./schema.sql?raw', () => ({
  default: 'CREATE TABLE schema_meta (version INTEGER);CREATE TABLE projects (id TEXT)',
}));

vi.mock('./pragmas.sql?raw', () => ({
  default: 'PRAGMA journal_mode=WAL;PRAGMA synchronous=NORMAL',
}));

// ---------------------------------------------------------------------------
// Module under test
// ---------------------------------------------------------------------------
import {
  ENTITY_TABLE_MAP,
  ARRAY_ENTITY_KEYS,
  SCALAR_KEYS,
  getSchemaStatements,
  getDurabilityPragmas,
} from './sqliteSchema';

// ---------------------------------------------------------------------------
// ENTITY_TABLE_MAP
// ---------------------------------------------------------------------------

describe('ENTITY_TABLE_MAP', () => {
  it('maps every known AppData entity key to a SQL table name', () => {
    const expectedKeys = [
      'projects',
      'proposals',
      'clients',
      'documentStorage',
      'suppliers',
      'products',
      'supplierProductPrices',
      'quotations',
      'commissions',
      'marketingProfessionals',
      'marketingActivities',
      'marketingIdeas',
      'socialNetworks',
      'freelancers',
      'agendaEvents',
      'manualExpenses',
      'manualIncomes',
      'prospects',
      'hiredServices',
      'cashBoxExpenses',
      'cashBoxCredits',
      'reminders',
      'acceptedPaymentMethods',
    ];

    for (const key of expectedKeys) {
      expect(ENTITY_TABLE_MAP).toHaveProperty(key);
      expect(typeof ENTITY_TABLE_MAP[key]).toBe('string');
      expect(ENTITY_TABLE_MAP[key].length).toBeGreaterThan(0);
    }
  });

  it('uses snake_case for table names that span multiple words', () => {
    const multiWordEntries = Object.values(ENTITY_TABLE_MAP).filter((v) => v.includes('_'));
    // At least some entries must be snake_cased (e.g. supplier_product_prices)
    expect(multiWordEntries.length).toBeGreaterThan(0);
  });

  it('has no duplicate table names', () => {
    const tables = Object.values(ENTITY_TABLE_MAP);
    const unique = new Set(tables);
    expect(unique.size).toBe(tables.length);
  });

  it('maps documentStorage to document_storage table', () => {
    expect(ENTITY_TABLE_MAP['documentStorage']).toBe('document_storage');
  });

  it('maps supplierProductPrices to supplier_product_prices table', () => {
    expect(ENTITY_TABLE_MAP['supplierProductPrices']).toBe('supplier_product_prices');
  });
});

// ---------------------------------------------------------------------------
// ARRAY_ENTITY_KEYS
// ---------------------------------------------------------------------------

describe('ARRAY_ENTITY_KEYS', () => {
  it('equals the keys of ENTITY_TABLE_MAP', () => {
    expect(ARRAY_ENTITY_KEYS).toEqual(Object.keys(ENTITY_TABLE_MAP));
  });

  it('contains only strings', () => {
    for (const key of ARRAY_ENTITY_KEYS) {
      expect(typeof key).toBe('string');
    }
  });

  it('includes the primary domain entities', () => {
    expect(ARRAY_ENTITY_KEYS).toContain('projects');
    expect(ARRAY_ENTITY_KEYS).toContain('clients');
    expect(ARRAY_ENTITY_KEYS).toContain('proposals');
  });

  it('contains 23 entity keys', () => {
    expect(ARRAY_ENTITY_KEYS).toHaveLength(23);
  });
});

// ---------------------------------------------------------------------------
// SCALAR_KEYS
// ---------------------------------------------------------------------------

describe('SCALAR_KEYS', () => {
  it('contains system-level scalar keys stored in system_config', () => {
    expect(SCALAR_KEYS).toContain('globalIdentifierCounter');
    expect(SCALAR_KEYS).toContain('contractDeadlines');
    expect(SCALAR_KEYS).toContain('customBudgetTemplate');
    expect(SCALAR_KEYS).toContain('dismissedFocusItems');
    expect(SCALAR_KEYS).toContain('documentStorage');
  });

  it('contains exactly 5 entries', () => {
    expect(SCALAR_KEYS).toHaveLength(5);
  });

  it('has no duplicates', () => {
    const unique = new Set(SCALAR_KEYS);
    expect(unique.size).toBe(SCALAR_KEYS.length);
  });
});

// ---------------------------------------------------------------------------
// parseSqlStatements (via getSchemaStatements / getDurabilityPragmas)
// The ?raw mocks above inject known SQL strings.
// ---------------------------------------------------------------------------

describe('getSchemaStatements', () => {
  it('returns parsed SQL statements from the schema fixture', () => {
    // The mock returns: 'CREATE TABLE schema_meta (...);CREATE TABLE projects (...)'
    const stmts = getSchemaStatements();
    expect(stmts).toHaveLength(2);
    expect(stmts[0]).toContain('CREATE TABLE schema_meta');
    expect(stmts[1]).toContain('CREATE TABLE projects');
  });

  it('returns an array of strings', () => {
    const stmts = getSchemaStatements();
    for (const s of stmts) {
      expect(typeof s).toBe('string');
    }
  });

  it('trims whitespace from each statement', () => {
    const stmts = getSchemaStatements();
    stmts.forEach((s) => {
      expect(s).toBe(s.trim());
    });
  });

  it('does not include empty entries', () => {
    const stmts = getSchemaStatements();
    for (const s of stmts) {
      expect(s.length).toBeGreaterThan(0);
    }
  });
});

describe('getDurabilityPragmas', () => {
  it('returns PRAGMA statements from the pragmas fixture', () => {
    // The mock returns: 'PRAGMA journal_mode=WAL;PRAGMA synchronous=NORMAL'
    const pragmas = getDurabilityPragmas();
    expect(pragmas).toHaveLength(2);
    expect(pragmas[0]).toBe('PRAGMA journal_mode=WAL');
    expect(pragmas[1]).toBe('PRAGMA synchronous=NORMAL');
  });

  it('returns an array of strings', () => {
    const pragmas = getDurabilityPragmas();
    for (const p of pragmas) {
      expect(typeof p).toBe('string');
    }
  });

  it('does not include empty entries', () => {
    const pragmas = getDurabilityPragmas();
    for (const p of pragmas) {
      expect(p.length).toBeGreaterThan(0);
    }
  });
});
