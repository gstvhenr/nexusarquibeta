import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SRC_DIR = join(process.cwd(), 'src');

/**
 * Files that are legitimately allowed to import indexedDbService.
 * Paths are relative to SRC_DIR (= cwd/src) with forward slashes.
 */
const ALLOWED_FILES = new Set([
  'frontend/services/infrastructure/indexedDbService.ts',
  'frontend/services/infrastructure/indexedDbService.test.ts',
  'frontend/services/infrastructure/indexedDbService.usage.test.ts',
  'frontend/services/infrastructure/persistence/IndexedDbPersistenceAdapter.ts',
  'frontend/services/infrastructure/persistence/IndexedDbPersistenceAdapter.test.ts',
  // Contains 'indexedDbService' in a canary string literal, not a real import.
  'frontend/services/infrastructure/storageService.usage.test.ts',
]);

/** Directories to skip entirely during the source scan. */
const IGNORED_DIRS = new Set(['node_modules', 'dist', '.cache', 'coverage']);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const IMPORT_INDEXED_DB_SERVICE_RE = /from\s+['"][^'"]*indexedDbService['"]/;

function walkFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) return [];
      return walkFiles(join(directory, entry.name));
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) return [];
    return [join(directory, entry.name)];
  });
}

function findViolations(sourceFiles: string[]): string[] {
  return sourceFiles
    .map((fullPath) => {
      const relativePath = relative(SRC_DIR, fullPath).replace(/\\/g, '/');
      if (ALLOWED_FILES.has(relativePath)) return null;

      const content = readFileSync(fullPath, 'utf8');
      return IMPORT_INDEXED_DB_SERVICE_RE.test(content) ? relativePath : null;
    })
    .filter((v): v is string => v !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('indexedDbService boundary guard', () => {
  // ─── CANARY: verifies the detector itself works ───────────────────────────

  describe('detector correctness (canary)', () => {
    it('regex detects a direct import of indexedDbService', () => {
      // Given
      const violatingContent = `import { indexedDbService } from './indexedDbService';`;

      // When
      const detected = IMPORT_INDEXED_DB_SERVICE_RE.test(violatingContent);

      // Then
      expect(detected).toBe(true);
    });

    it('regex detects a relative-path import of indexedDbService', () => {
      // Given
      const violatingContent = `import { indexedDbService } from '../infrastructure/indexedDbService';`;

      // When
      const detected = IMPORT_INDEXED_DB_SERVICE_RE.test(violatingContent);

      // Then
      expect(detected).toBe(true);
    });

    it('regex does not flag a file that does not import indexedDbService', () => {
      // Given
      const safeContent = `import { createPersistenceAdapter } from './persistence';`;

      // When
      const detected = IMPORT_INDEXED_DB_SERVICE_RE.test(safeContent);

      // Then
      expect(detected).toBe(false);
    });

    it('regex does not flag a comment that mentions indexedDbService', () => {
      // Given
      const commentContent = `// Previously used indexedDbService here`;

      // When
      const detected = IMPORT_INDEXED_DB_SERVICE_RE.test(commentContent);

      // Then
      expect(detected).toBe(false);
    });
  });

  // ─── ALLOWLIST: verifies the whitelist logic ──────────────────────────────

  describe('allowlist', () => {
    it('the allowed files set contains exactly the expected entries', () => {
      // Given / When
      const entries = [...ALLOWED_FILES].sort();

      // Then — only these files are allowed to import indexedDbService
      expect(entries).toEqual([
        'frontend/services/infrastructure/indexedDbService.test.ts',
        'frontend/services/infrastructure/indexedDbService.ts',
        'frontend/services/infrastructure/indexedDbService.usage.test.ts',
        'frontend/services/infrastructure/persistence/IndexedDbPersistenceAdapter.test.ts',
        'frontend/services/infrastructure/persistence/IndexedDbPersistenceAdapter.ts',
        'frontend/services/infrastructure/storageService.usage.test.ts',
      ]);
    });
  });

  // ─── ENFORCEMENT: validates no production code imports indexedDbService ───

  describe('production import enforcement', () => {
    it('does not allow any non-allowlisted file to import indexedDbService', () => {
      // Given
      const sourceFiles = walkFiles(SRC_DIR);

      // When
      const violations = findViolations(sourceFiles);

      // Then
      expect(
        violations,
        `Files illegally importing indexedDbService:\n${violations.join('\n')}`,
      ).toEqual([]);
    });
  });
});
