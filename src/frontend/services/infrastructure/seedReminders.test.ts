import { describe, expect, it } from 'vitest';
import type { Reminder } from '../../types';
import { applySeedReminders } from './seedReminders';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Total number of canonical seeds defined in seedReminders.ts */
const SEED_COUNT = 14;

const SEED_IDS = [
  'seed_reminder_01',
  'seed_reminder_02',
  'seed_reminder_03',
  'seed_reminder_04',
  'seed_reminder_05',
  'seed_reminder_06',
  'seed_reminder_07',
  'seed_reminder_08',
  'seed_reminder_09',
  'seed_reminder_10',
  'seed_reminder_11',
  'seed_reminder_12',
  'seed_reminder_13',
  'seed_reminder_14',
] as const;

/** Color values allowed in the seed dataset */
const VALID_COLORS = ['yellow', 'green', 'blue', 'pink', 'orange', 'purple'] as const;

const makeReminder = (partial: Partial<Reminder> = {}): Reminder =>
  ({
    id: 'custom_reminder',
    title: 'Custom Reminder',
    comment: 'Some comment',
    remindAt: '2026-03-01T10:00',
    color: 'blue',
    createdAt: '2026-03-01T10:00:00.000Z',
    pinned: false,
    completedAt: null,
    ...partial,
  }) as Reminder;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('applySeedReminders', () => {
  // -------------------------------------------------------------------------
  // Empty input — all seeds must be inserted
  // -------------------------------------------------------------------------
  describe('when rawReminders is empty', () => {
    it('returns all canonical seeds', () => {
      // Arrange
      const raw: Reminder[] = [];

      // Act
      const { reminders } = applySeedReminders(raw);

      // Assert
      expect(reminders).toHaveLength(SEED_COUNT);
    });

    it('marks changed = true because seeds were appended', () => {
      // Arrange
      const raw: Reminder[] = [];

      // Act
      const { changed } = applySeedReminders(raw);

      // Assert
      expect(changed).toBe(true);
    });

    it('includes every canonical seed id in the output', () => {
      // Arrange + Act
      const { reminders } = applySeedReminders([]);

      // Assert
      const outputIds = reminders.map((r) => r.id);
      for (const seedId of SEED_IDS) {
        expect(outputIds).toContain(seedId);
      }
    });
  });

  // -------------------------------------------------------------------------
  // All seeds already present — idempotent
  // -------------------------------------------------------------------------
  describe('when all seeds are already present', () => {
    it('does not duplicate any seed', () => {
      // Arrange — pre-populate by running once
      const { reminders: seededOnce } = applySeedReminders([]);

      // Act
      const { reminders } = applySeedReminders(seededOnce);

      // Assert
      expect(reminders).toHaveLength(SEED_COUNT);
    });

    it('returns changed = false', () => {
      // Arrange
      const { reminders: seededOnce } = applySeedReminders([]);

      // Act
      const { changed } = applySeedReminders(seededOnce);

      // Assert
      expect(changed).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Partial seeds present — only missing ones are inserted
  // -------------------------------------------------------------------------
  describe('when some seeds are already present', () => {
    it('appends only the missing seeds', () => {
      // Arrange — first 7 seeds already present
      const partial = SEED_IDS.slice(0, 7).map((id) => makeReminder({ id }));

      // Act
      const { reminders } = applySeedReminders(partial);

      // Assert
      expect(reminders).toHaveLength(SEED_COUNT);
    });

    it('reports changed = true when at least one seed was missing', () => {
      // Arrange — only seed_reminder_01 is present
      const withOneSeed = [makeReminder({ id: 'seed_reminder_01' })];

      // Act
      const { changed } = applySeedReminders(withOneSeed);

      // Assert
      expect(changed).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Non-seed reminders coexist — must be preserved
  // -------------------------------------------------------------------------
  describe('when rawReminders contains custom reminders', () => {
    it('preserves existing custom reminders in the output', () => {
      // Arrange
      const custom = makeReminder({ id: 'user_reminder_001', title: 'My Note' });

      // Act
      const { reminders } = applySeedReminders([custom]);

      // Assert
      expect(reminders.map((r) => r.id)).toContain('user_reminder_001');
    });

    it('returns total = SEED_COUNT + custom reminders count', () => {
      // Arrange
      const customs = [
        makeReminder({ id: 'custom_a' }),
        makeReminder({ id: 'custom_b' }),
        makeReminder({ id: 'custom_c' }),
      ];

      // Act
      const { reminders } = applySeedReminders(customs);

      // Assert
      expect(reminders).toHaveLength(SEED_COUNT + 3);
    });

    it('does not mutate the original rawReminders array', () => {
      // Arrange
      const raw: Reminder[] = [];
      const originalRef = raw;

      // Act
      applySeedReminders(raw);

      // Assert
      expect(raw).toBe(originalRef);
      expect(raw).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // Seed data integrity — spot-check known seed shapes
  // -------------------------------------------------------------------------
  describe('seed data integrity', () => {
    it('seed_reminder_01 has the expected title and color', () => {
      // Arrange + Act
      const { reminders } = applySeedReminders([]);
      const r01 = reminders.find((r) => r.id === 'seed_reminder_01');

      // Assert
      expect(r01).toBeDefined();
      expect(r01?.title).toBe('Quarto Anestesia');
      expect(r01?.color).toBe('yellow');
    });

    it('all seeds have pinned = false', () => {
      // Arrange + Act
      const { reminders } = applySeedReminders([]);

      // Assert
      const seeds = reminders.filter((r) =>
        SEED_IDS.includes(r.id as (typeof SEED_IDS)[number]),
      );
      for (const seed of seeds) {
        expect(seed.pinned).toBe(false);
      }
    });

    it('all seeds have completedAt = null', () => {
      // Arrange + Act
      const { reminders } = applySeedReminders([]);

      // Assert
      const seeds = reminders.filter((r) =>
        SEED_IDS.includes(r.id as (typeof SEED_IDS)[number]),
      );
      for (const seed of seeds) {
        expect(seed.completedAt).toBeNull();
      }
    });

    it('all seeds use one of the 6 valid color tokens', () => {
      // Arrange + Act
      const { reminders } = applySeedReminders([]);

      // Assert
      const seeds = reminders.filter((r) =>
        SEED_IDS.includes(r.id as (typeof SEED_IDS)[number]),
      );
      for (const seed of seeds) {
        expect(VALID_COLORS).toContain(seed.color);
      }
    });

    it('all seeds have a non-empty title', () => {
      // Arrange + Act
      const { reminders } = applySeedReminders([]);

      // Assert
      const seeds = reminders.filter((r) =>
        SEED_IDS.includes(r.id as (typeof SEED_IDS)[number]),
      );
      for (const seed of seeds) {
        expect(seed.title.trim().length).toBeGreaterThan(0);
      }
    });

    it('all seeds have an ISO-formatted createdAt string', () => {
      // Arrange + Act
      const { reminders } = applySeedReminders([]);

      // Assert
      const seeds = reminders.filter((r) =>
        SEED_IDS.includes(r.id as (typeof SEED_IDS)[number]),
      );
      for (const seed of seeds) {
        expect(seed.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      }
    });

    it('colors cycle across all 6 valid tokens (color diversity check)', () => {
      // Arrange + Act
      const { reminders } = applySeedReminders([]);

      // Assert — every valid color appears at least once
      const usedColors = new Set(
        reminders
          .filter((r) => SEED_IDS.includes(r.id as (typeof SEED_IDS)[number]))
          .map((r) => r.color),
      );
      for (const color of VALID_COLORS) {
        expect(usedColors).toContain(color);
      }
    });
  });
});
