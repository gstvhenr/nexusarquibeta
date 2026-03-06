import { describe, expect, it } from 'vitest';
import type { AgendaEvent } from '../../types';
import { applySeedAgendaEvents } from './seedAgendaEvents';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Total number of canonical seeds defined in seedAgendaEvents.ts */
const SEED_COUNT = 10;

/** IDs of all canonical seeds — derived from source to remain in sync */
const SEED_IDS = [
  'seed_event_01',
  'seed_event_02',
  'seed_event_03',
  'seed_event_04',
  'seed_event_05',
  'seed_event_06',
  'seed_event_07',
  'seed_event_08',
  'seed_event_09',
  'seed_event_10',
] as const;

const makeEvent = (partial: Partial<AgendaEvent> = {}): AgendaEvent =>
  ({
    id: 'custom_event',
    title: 'Custom Event',
    date: '2026-03-01',
    time: '10:00',
    timeEnd: '11:00',
    type: 'Pessoal',
    recurrence: 'none',
    priority: 1,
    kanbanStatus: 'todo',
    subtasks: [],
    ...partial,
  }) as AgendaEvent;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('applySeedAgendaEvents', () => {
  // -------------------------------------------------------------------------
  // Empty input — all seeds must be inserted
  // -------------------------------------------------------------------------
  describe('when rawEvents is empty', () => {
    it('returns all canonical seeds', () => {
      // Arrange
      const raw: AgendaEvent[] = [];

      // Act
      const { events } = applySeedAgendaEvents(raw);

      // Assert
      expect(events).toHaveLength(SEED_COUNT);
    });

    it('marks changed = true because seeds were appended', () => {
      // Arrange
      const raw: AgendaEvent[] = [];

      // Act
      const { changed } = applySeedAgendaEvents(raw);

      // Assert
      expect(changed).toBe(true);
    });

    it('preserves every seed id in the output', () => {
      // Arrange
      const raw: AgendaEvent[] = [];

      // Act
      const { events } = applySeedAgendaEvents(raw);

      // Assert
      const outputIds = events.map((e) => e.id);
      for (const seedId of SEED_IDS) {
        expect(outputIds).toContain(seedId);
      }
    });
  });

  // -------------------------------------------------------------------------
  // All seeds already present — idempotent; no changes
  // -------------------------------------------------------------------------
  describe('when all seeds already exist', () => {
    it('does not duplicate any seed', () => {
      // Arrange — pre-populate with all seeds by calling once
      const { events: seededOnce } = applySeedAgendaEvents([]);

      // Act — apply again
      const { events } = applySeedAgendaEvents(seededOnce);

      // Assert — still exactly SEED_COUNT items (no duplicates)
      expect(events).toHaveLength(SEED_COUNT);
    });

    it('returns changed = false', () => {
      // Arrange
      const { events: seededOnce } = applySeedAgendaEvents([]);

      // Act
      const { changed } = applySeedAgendaEvents(seededOnce);

      // Assert
      expect(changed).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Partial seeds present — only missing ones are inserts
  // -------------------------------------------------------------------------
  describe('when some seeds are already present', () => {
    it('appends only the missing seeds without touching existing ones', () => {
      // Arrange — inject half the seeds manually
      const halfSeeds = SEED_IDS.slice(0, 5).map((id) => makeEvent({ id }));

      // Act
      const { events } = applySeedAgendaEvents(halfSeeds);

      // Assert
      expect(events).toHaveLength(SEED_COUNT);
    });

    it('reports changed = true when at least one seed was missing', () => {
      // Arrange — only seed_event_01 is present
      const partial = [makeEvent({ id: 'seed_event_01' })];

      // Act
      const { changed } = applySeedAgendaEvents(partial);

      // Assert
      expect(changed).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Non-seed events coexist — must be preserved
  // -------------------------------------------------------------------------
  describe('when rawEvents contains non-seed events', () => {
    it('preserves existing non-seed events in the output', () => {
      // Arrange
      const userEvent = makeEvent({ id: 'user_custom_event' });

      // Act
      const { events } = applySeedAgendaEvents([userEvent]);

      // Assert
      const outputIds = events.map((e) => e.id);
      expect(outputIds).toContain('user_custom_event');
    });

    it('returns total = SEED_COUNT + custom events count', () => {
      // Arrange
      const userEvents = [makeEvent({ id: 'custom_a' }), makeEvent({ id: 'custom_b' })];

      // Act
      const { events } = applySeedAgendaEvents(userEvents);

      // Assert
      expect(events).toHaveLength(SEED_COUNT + 2);
    });

    it('does not mutate the original rawEvents array', () => {
      // Arrange
      const raw: AgendaEvent[] = [];
      const originalRef = raw;

      // Act
      applySeedAgendaEvents(raw);

      // Assert — same reference; length unchanged
      expect(raw).toBe(originalRef);
      expect(raw).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // Seed integrity — spot-check a known seed's shape
  // -------------------------------------------------------------------------
  describe('seed data integrity', () => {
    it('seed_event_01 has the expected title and kanbanStatus', () => {
      // Arrange
      const raw: AgendaEvent[] = [];

      // Act
      const { events } = applySeedAgendaEvents(raw);
      const event01 = events.find((e) => e.id === 'seed_event_01');

      // Assert
      expect(event01).toBeDefined();
      expect(event01?.title).toBe('Auditoria de Ecos no Corredor');
      expect(event01?.kanbanStatus).toBe('todo');
    });

    it('seed_event_04 is marked as completed', () => {
      // Arrange + Act
      const { events } = applySeedAgendaEvents([]);
      const event04 = events.find((e) => e.id === 'seed_event_04');

      // Assert
      expect(event04?.completed).toBe(true);
      expect(event04?.kanbanStatus).toBe('done');
    });

    it('all seeds have subtasks that are arrays', () => {
      // Arrange + Act
      const { events } = applySeedAgendaEvents([]);

      // Assert
      for (const event of events.filter((e) => e.id.startsWith('seed_'))) {
        expect(Array.isArray(event.subtasks)).toBe(true);
      }
    });

    it('all seeds have type = "Pessoal"', () => {
      // Arrange + Act
      const { events } = applySeedAgendaEvents([]);

      // Assert
      const seeds = events.filter((e) => SEED_IDS.includes(e.id as (typeof SEED_IDS)[number]));
      for (const seed of seeds) {
        expect(seed.type).toBe('Pessoal');
      }
    });

    it('all seeds have recurrence = "none"', () => {
      // Arrange + Act
      const { events } = applySeedAgendaEvents([]);

      // Assert
      const seeds = events.filter((e) => SEED_IDS.includes(e.id as (typeof SEED_IDS)[number]));
      for (const seed of seeds) {
        expect(seed.recurrence).toBe('none');
      }
    });
  });
});
