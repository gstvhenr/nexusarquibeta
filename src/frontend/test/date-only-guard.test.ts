import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const FRONTEND_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROHIBITED_PATTERN = "toISOString().split('T')[0]";
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

const collectSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectSourceFiles(fullPath);
    }

    return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [fullPath] : [];
  });

describe('date-only guard', () => {
  it('forbids using ISO UTC splitting to build production YYYY-MM-DD values', () => {
    const offenders = collectSourceFiles(FRONTEND_ROOT)
      .filter((filePath) => !filePath.includes('.test.'))
      .filter((filePath) => !filePath.includes(`${join('src', 'frontend', 'test')}`))
      .filter((filePath) => !filePath.includes(`${join('src', 'frontend', 'fixtures')}`))
      .filter((filePath) => readFileSync(filePath, 'utf8').includes(PROHIBITED_PATTERN))
      .map((filePath) => relative(FRONTEND_ROOT, filePath))
      .sort();

    expect(offenders).toEqual([]);
  }, 15000);
});
