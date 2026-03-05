import { describe, expect, it } from 'vitest';
import { PAGE_HEADER_CONTENT_GAP } from './layout';

describe('constants/layout', () => {
  it('exposes all supported spacing variants for page headers', () => {
    expect(Object.keys(PAGE_HEADER_CONTENT_GAP)).toEqual(['compact', 'default', 'spacious']);
  });

  it('maps spacing variants to valid Tailwind margin-bottom classes', () => {
    Object.values(PAGE_HEADER_CONTENT_GAP).forEach((className) => {
      expect(className).toMatch(/^mb-\d+$/);
    });
  });

  it('keeps compact, default and spacious values strictly incremental', () => {
    const compact = Number(PAGE_HEADER_CONTENT_GAP.compact.replace('mb-', ''));
    const normal = Number(PAGE_HEADER_CONTENT_GAP.default.replace('mb-', ''));
    const spacious = Number(PAGE_HEADER_CONTENT_GAP.spacious.replace('mb-', ''));

    expect(compact).toBeLessThan(normal);
    expect(normal).toBeLessThan(spacious);
  });
});
