import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_DIR = join(process.cwd(), 'src');
const ALLOWED_FILES = new Set([
  'services/infrastructure/storageService.ts',
  'services/infrastructure/storageService.usage.test.ts',
]);

const walkFiles = (directory: string): string[] => {
  const entries = readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) {
      return [];
    }
    return [fullPath];
  });
};

describe('storageService legacy guard', () => {
  it('does not allow production imports of storageService.ts', () => {
    // Given
    const sourceFiles = walkFiles(SRC_DIR);

    // When
    const violations = sourceFiles
      .map((fullPath) => {
        const relativePath = relative(SRC_DIR, fullPath).replace(/\\/g, '/');
        if (ALLOWED_FILES.has(relativePath)) {
          return null;
        }

        const content = readFileSync(fullPath, 'utf8');
        const importsStorageService = /from\s+['"][^'"]*storageService['"]/.test(content);
        return importsStorageService ? relativePath : null;
      })
      .filter((value): value is string => value !== null);

    // Then
    expect(violations).toEqual([]);
  });
});
