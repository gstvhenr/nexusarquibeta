import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { Prospect } from '../types';
import { getDaysRemaining, sortProspectsForRadar } from './prospectUtils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeProspect = (overrides: Partial<Prospect>): Prospect => ({
  id: 'p-default',
  name: 'Prospect Default',
  origin: 'Instagram',
  interest: 'Residencial',
  priority: 'Média',
  status: 'Em Aberto',
  createdAt: '2026-01-01T00:00:00.000Z',
  followUpDays: 30,
  startDate: '2026-01-01',
  ...overrides,
});

// ---------------------------------------------------------------------------
// getDaysRemaining
// ---------------------------------------------------------------------------

/**
 * NOTE: `new Date('YYYY-MM-DD')` parses as UTC midnight. In UTC-3 this becomes
 * local 21:00 the PREVIOUS day. The function's `setHours(0,0,0,0)` resets to
 * LOCAL midnight, so arithmetic is always in local time.
 *
 * Strategy: Use relational assertions (greater-than, less-than, equality of
 * differences) instead of absolute counts that vary by timezone offset.
 * Concrete value tests only use cases where the timezone offset does not affect
 * the calendar-day result (e.g., comparing two prospects with the same startDate
 * but different followUpDays — the diff is always exactly N days regardless of tz).
 */

describe('getDaysRemaining', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a positive number when the follow-up window has not expired', () => {
    // Arrange — "today" is 5 days into a 30-day window
    vi.setSystemTime(new Date('2026-06-10T12:00:00.000Z'));

    // Act — window started Jun 1, 30 days → expires ~ Jul 1
    const result = getDaysRemaining('2026-06-01', 30);

    // Assert
    expect(result).toBeGreaterThan(0);
  });

  it('returns a negative number when the follow-up window has expired', () => {
    // Arrange — "today" is well past the end of a 5-day window
    vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));

    // Act — startDate = June 1, 5 days → end ≈ June 6
    const result = getDaysRemaining('2026-06-01', 5);

    // Assert
    expect(result).toBeLessThan(0);
  });

  it('prospect with shorter follow-up window has fewer remaining days than a longer one (same start)', () => {
    // Arrange
    vi.setSystemTime(new Date('2026-06-10T12:00:00.000Z'));

    // Act — same startDate; shorter window should result in fewer days
    const shorter = getDaysRemaining('2026-06-01', 20);
    const longer = getDaysRemaining('2026-06-01', 30);

    // Assert
    expect(shorter).toBeLessThan(longer);
    expect(shorter).toBeGreaterThan(0);
    expect(longer).toBeGreaterThan(0);
  });

  it('difference in remaining days equals difference in followUpDays (same startDate)', () => {
    // Arrange — this is ALWAYS true regardless of timezone offset
    vi.setSystemTime(new Date('2026-07-01T12:00:00.000Z'));

    // Act
    const days10 = getDaysRemaining('2026-07-01', 10);
    const days20 = getDaysRemaining('2026-07-01', 20);
    const days30 = getDaysRemaining('2026-07-01', 30);

    // Assert — absolute differences between followUpDays windows are preserved exactly
    expect(days20 - days10).toBe(10);
    expect(days30 - days20).toBe(10);
    expect(days30 - days10).toBe(20);
  });

  it('returns the SAME value for repeated calls with the same inputs (deterministic)', () => {
    // Arrange
    vi.setSystemTime(new Date('2026-06-10T12:00:00.000Z'));

    // Act
    const first = getDaysRemaining('2026-06-01', 30);
    const second = getDaysRemaining('2026-06-01', 30);

    // Assert
    expect(first).toBe(second);
  });

  it('two calls at different times within the same local calendar day return equal results', () => {
    // Arrange
    vi.setSystemTime(new Date('2026-06-10T12:00:00.000Z'));
    const morning = getDaysRemaining('2026-06-01', 30);

    vi.setSystemTime(new Date('2026-06-10T20:00:00.000Z'));
    const afternoon = getDaysRemaining('2026-06-01', 30);

    // Assert — same local calendar day → same computed result
    expect(morning).toBe(afternoon);
  });

  it('returns fewer days for a prospect that started earlier (same followUpDays)', () => {
    // Arrange
    vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));

    // Act — started earlier → closer to expiry
    const earlier = getDaysRemaining('2026-06-01', 30); // end ≈ Jul 1
    const later = getDaysRemaining('2026-06-08', 30); // end ≈ Jul 8

    // Assert
    expect(earlier).toBeLessThan(later);
  });

  it('returns 90 more days for a 90-day window compared to a 0-day window (same startDate)', () => {
    // Arrange
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'));

    // Act
    const noFollowUp = getDaysRemaining('2026-01-01', 0);
    const maxFollowUp = getDaysRemaining('2026-01-01', 90);

    // Assert — diff is always exactly 90, regardless of timezone
    expect(maxFollowUp - noFollowUp).toBe(90);
  });
});

// ---------------------------------------------------------------------------
// sortProspectsForRadar
// ---------------------------------------------------------------------------

describe('sortProspectsForRadar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Fix "today" — use a date far from month boundaries to avoid DST edge cases
    vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sorts Alta priority before Média', () => {
    // Arrange
    const alta = makeProspect({
      id: 'alta',
      priority: 'Alta',
      startDate: '2026-06-01',
      followUpDays: 30,
    });
    const media = makeProspect({
      id: 'media',
      priority: 'Média',
      startDate: '2026-06-01',
      followUpDays: 30,
    });

    // Act — simulate Array.sort comparator
    const result = [media, alta].sort(sortProspectsForRadar);

    // Assert
    expect(result[0].id).toBe('alta');
    expect(result[1].id).toBe('media');
  });

  it('sorts Média priority before Baixa', () => {
    // Arrange
    const media = makeProspect({
      id: 'media',
      priority: 'Média',
      startDate: '2026-06-01',
      followUpDays: 30,
    });
    const baixa = makeProspect({
      id: 'baixa',
      priority: 'Baixa',
      startDate: '2026-06-01',
      followUpDays: 30,
    });

    // Act
    const result = [baixa, media].sort(sortProspectsForRadar);

    // Assert
    expect(result[0].id).toBe('media');
    expect(result[1].id).toBe('baixa');
  });

  it('sorts Alta before Média before Baixa in a full 3-element sort', () => {
    // Arrange
    const prospects = [
      makeProspect({ id: 'baixa', priority: 'Baixa', startDate: '2026-06-01', followUpDays: 30 }),
      makeProspect({ id: 'alta', priority: 'Alta', startDate: '2026-06-01', followUpDays: 30 }),
      makeProspect({ id: 'media', priority: 'Média', startDate: '2026-06-01', followUpDays: 30 }),
    ];

    // Act
    const sorted = [...prospects].sort(sortProspectsForRadar);

    // Assert
    expect(sorted.map((p) => p.id)).toEqual(['alta', 'media', 'baixa']);
  });

  it('breaks priority ties by days remaining ascending (most urgent first)', () => {
    // Arrange — both Alta, different windows → different daysRemaining
    // p_urgent: 10-day window → expires sooner
    // p_later:  30-day window → expires later
    const urgent = makeProspect({
      id: 'urgent',
      priority: 'Alta',
      startDate: '2026-06-01',
      followUpDays: 10,
    });
    const later = makeProspect({
      id: 'later',
      priority: 'Alta',
      startDate: '2026-06-01',
      followUpDays: 30,
    });

    // Act
    const result = [later, urgent].sort(sortProspectsForRadar);

    // Assert — fewer days remaining → sorted first
    expect(result[0].id).toBe('urgent');
    expect(result[1].id).toBe('later');
  });

  it('returns 0 (stable) for prospects with equal priority and equal remaining days', () => {
    // Arrange
    const a = makeProspect({
      id: 'a',
      priority: 'Média',
      startDate: '2026-06-01',
      followUpDays: 30,
    });
    const b = makeProspect({
      id: 'b',
      priority: 'Média',
      startDate: '2026-06-01',
      followUpDays: 30,
    });

    // Act
    const result = sortProspectsForRadar(a, b);

    // Assert
    expect(result).toBe(0);
  });

  it('higher priority prospect always precedes lower priority regardless of days remaining', () => {
    // Arrange — Baixa prospect has a much shorter window (more urgent by days),
    // but Alta always wins on priority
    const alta = makeProspect({
      id: 'alta',
      priority: 'Alta',
      startDate: '2026-06-01',
      followUpDays: 60, // many days left
    });
    const baixa = makeProspect({
      id: 'baixa',
      priority: 'Baixa',
      startDate: '2026-06-14', // started yesterday → expires soon
      followUpDays: 2,
    });

    // Act
    const result = [baixa, alta].sort(sortProspectsForRadar);

    // Assert — priority wins over urgency-by-days
    expect(result[0].id).toBe('alta');
    expect(result[1].id).toBe('baixa');
  });

  it('overdue prospect (negative days) sorts before a future-expiry prospect with same priority', () => {
    // Arrange — both Baixa
    // overdue: started June 1, 5-day window → expired June 6 (negative days)
    // fresh: started June 14, 30-day window → expires July 14 (positive days)
    const overdue = makeProspect({
      id: 'overdue',
      priority: 'Baixa',
      startDate: '2026-06-01',
      followUpDays: 5,
    });
    const fresh = makeProspect({
      id: 'fresh',
      priority: 'Baixa',
      startDate: '2026-06-14',
      followUpDays: 30,
    });

    // Act
    const result = [fresh, overdue].sort(sortProspectsForRadar);

    // Assert — ascending sort: negative days < positive days → overdue first
    expect(result[0].id).toBe('overdue');
    expect(result[1].id).toBe('fresh');
  });
});
