import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SRC_DIR = join(process.cwd(), 'src');

/**
 * Files that are legitimately allowed to import storageService.
 * Paths are relative to SRC_DIR (= cwd/src) with forward slashes.
 */
const ALLOWED_FILES = new Set([
  'frontend/services/infrastructure/storageService.ts',
  'frontend/services/infrastructure/storageService.usage.test.ts',
  'frontend/services/infrastructure/storageService.test.ts',
]);

/** Directories to skip entirely during the source scan. */
const IGNORED_DIRS = new Set(['node_modules', 'dist', '.cache', 'coverage']);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const IMPORT_STORAGE_SERVICE_RE = /from\s+['"][^'"]*storageService['"]/;

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
      return IMPORT_STORAGE_SERVICE_RE.test(content) ? relativePath : null;
    })
    .filter((v): v is string => v !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('storageService legacy guard', () => {
  // ─── CANARY: verifies the detector itself works ───────────────────────────

  describe('detector correctness (canary)', () => {
    it('regex detects a direct import of storageService', () => {
      // Given — a file content that contains a violation
      const violatingContent = `import { storageService } from './storageService';`;

      // When
      const detected = IMPORT_STORAGE_SERVICE_RE.test(violatingContent);

      // Then
      expect(detected).toBe(true);
    });

    it('regex detects a relative-path import of storageService', () => {
      // Given
      const violatingContent = `import { storageService } from '../infrastructure/storageService';`;

      // When
      const detected = IMPORT_STORAGE_SERVICE_RE.test(violatingContent);

      // Then
      expect(detected).toBe(true);
    });

    it('regex does not flag a file that does not import storageService', () => {
      // Given — a file that imports a different service
      const safeContent = `import { indexedDbService } from './indexedDbService';`;

      // When
      const detected = IMPORT_STORAGE_SERVICE_RE.test(safeContent);

      // Then
      expect(detected).toBe(false);
    });

    it('regex does not flag a comment that mentions storageService', () => {
      // Given — mention in a comment, not an import statement
      const commentContent = `// Previously used storageService here`;

      // When
      const detected = IMPORT_STORAGE_SERVICE_RE.test(commentContent);

      // Then
      expect(detected).toBe(false);
    });
  });

  // ─── ALLOWLIST: verifies the whitelist logic ──────────────────────────────

  describe('allowlist', () => {
    it('the allowed files set contains exactly the three expected entries', () => {
      // Given / When
      const entries = [...ALLOWED_FILES].sort();

      // Then — contract: these three files and no others are allowed to import storageService
      expect(entries).toEqual([
        'frontend/services/infrastructure/storageService.test.ts',
        'frontend/services/infrastructure/storageService.ts',
        'frontend/services/infrastructure/storageService.usage.test.ts',
      ]);
    });
  });

  // ─── ENFORCEMENT: validates no production code imports storageService ─────

  describe('production import enforcement', () => {
    it('does not allow any non-allowlisted file to import storageService', () => {
      // Given
      const sourceFiles = walkFiles(SRC_DIR);

      // When
      const violations = findViolations(sourceFiles);

      // Then — descriptive message lists the violating files for easy debugging
      expect(
        violations,
        `Files illegally importing storageService:\n${violations.join('\n')}`,
      ).toEqual([]);
    });
  });
});
