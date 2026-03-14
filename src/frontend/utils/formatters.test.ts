import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDeadlineInfo } from './formatters';

describe('getDeadlineInfo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a semantic empty state when no deadline is provided', () => {
    const result = getDeadlineInfo(null);

    expect(result).toEqual({
      text: 'Sem prazo',
      diffDays: Infinity,
      status: 'none',
    });
    expect('className' in result).toBe(false);
  });

  it('returns ok for completed items without exposing styling metadata', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 13, 10, 0, 0));

    const result = getDeadlineInfo('2026-03-15', true);

    expect(result.status).toBe('ok');
    expect(result.diffDays).toBe(2);
    expect(result.text).toBe('15 de mar.');
    expect('className' in result).toBe(false);
  });

  it('returns overdue for past deadlines', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 13, 10, 0, 0));

    const result = getDeadlineInfo('2026-03-10');

    expect(result).toEqual({
      text: 'Atrasado há 3 dias',
      diffDays: -3,
      status: 'overdue',
    });
  });

  it('returns soon for deadlines within the next 7 days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 13, 10, 0, 0));

    const result = getDeadlineInfo('2026-03-18');

    expect(result).toEqual({
      text: 'Em 5 dias',
      diffDays: 5,
      status: 'soon',
    });
  });
});
