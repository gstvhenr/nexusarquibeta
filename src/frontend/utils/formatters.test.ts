import { describe, expect, it } from 'vitest';
import { getDeadlineInfo, parseDateString } from './formatters';

describe('parseDateString', () => {
  it('parses DD/MM/YYYY format', () => {
    const date = parseDateString('15/01/2026');
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(0);
    expect(date?.getDate()).toBe(15);
  });

  it('parses YYYY-MM-DD format', () => {
    const date = parseDateString('2026-02-12');
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(1);
    expect(date?.getDate()).toBe(12);
  });

  it('returns null for invalid or empty input', () => {
    expect(parseDateString(undefined)).toBeNull();
    expect(parseDateString(null)).toBeNull();
    expect(parseDateString('')).toBeNull();
    expect(parseDateString('not-a-date')).toBeNull();
  });
});

describe('getDeadlineInfo', () => {
  it('returns none status for missing deadline', () => {
    expect(getDeadlineInfo(undefined).status).toBe('none');
    expect(getDeadlineInfo(null).text).toBe('Sem prazo');
  });

  it('classifies near-future deadlines as soon', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const iso = tomorrow.toISOString().split('T')[0];

    expect(getDeadlineInfo(iso).status).toBe('soon');
  });
});
