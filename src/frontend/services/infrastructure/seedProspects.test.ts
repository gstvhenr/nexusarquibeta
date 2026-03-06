import { describe, expect, it } from 'vitest';
import type { Prospect } from '../../types';
import { applySeedProspects } from './seedProspects';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Total number of canonical seeds defined in seedProspects.ts */
const SEED_COUNT = 3;

const SEED_IDS = ['seed_prospect_01', 'seed_prospect_02', 'seed_prospect_03'] as const;

const makeProspect = (partial: Partial<Prospect> = {}): Prospect =>
  ({
    id: 'custom_prospect',
    name: 'Custom Prospect',
    phone: '(11) 91234-5678',
    email: 'custom@example.com',
    social: '',
    origin: 'Outro',
    interest: 'Residencial',
    priority: 'Média',
    status: 'Em Aberto',
    followUpDays: 15,
    startDate: '2026-03-01',
    createdAt: '2026-03-01T00:00:00.000Z',
    notes: '',
    ...partial,
  }) as Prospect;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('applySeedProspects', () => {
  // -------------------------------------------------------------------------
  // Empty input — all seeds must be inserted
  // -------------------------------------------------------------------------
  describe('when rawProspects is empty', () => {
    it('returns all canonical seeds', () => {
      // Arrange
      const raw: Prospect[] = [];

      // Act
      const { prospects } = applySeedProspects(raw);

      // Assert
      expect(prospects).toHaveLength(SEED_COUNT);
    });

    it('marks changed = true because seeds were appended', () => {
      // Arrange
      const raw: Prospect[] = [];

      // Act
      const { changed } = applySeedProspects(raw);

      // Assert
      expect(changed).toBe(true);
    });

    it('includes every canonical seed id in the output', () => {
      // Arrange + Act
      const { prospects } = applySeedProspects([]);

      // Assert
      const outputIds = prospects.map((p) => p.id);
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
      const { prospects: seededOnce } = applySeedProspects([]);

      // Act
      const { prospects } = applySeedProspects(seededOnce);

      // Assert
      expect(prospects).toHaveLength(SEED_COUNT);
    });

    it('returns changed = false', () => {
      // Arrange
      const { prospects: seededOnce } = applySeedProspects([]);

      // Act
      const { changed } = applySeedProspects(seededOnce);

      // Assert
      expect(changed).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Partial seeds present — only missing ones are inserted
  // -------------------------------------------------------------------------
  describe('when some seeds are already present', () => {
    it('appends only the missing seeds', () => {
      // Arrange — first two seeds already exist
      const partial = SEED_IDS.slice(0, 2).map((id) => makeProspect({ id }));

      // Act
      const { prospects } = applySeedProspects(partial);

      // Assert
      expect(prospects).toHaveLength(SEED_COUNT);
    });

    it('reports changed = true when at least one seed was missing', () => {
      // Arrange
      const withOneSeed = [makeProspect({ id: 'seed_prospect_01' })];

      // Act
      const { changed } = applySeedProspects(withOneSeed);

      // Assert
      expect(changed).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Non-seed prospects coexist — must be preserved
  // -------------------------------------------------------------------------
  describe('when rawProspects contains custom prospects', () => {
    it('preserves existing custom prospects in the output', () => {
      // Arrange
      const custom = makeProspect({ id: 'custom_001', name: 'Custom Prospect A' });

      // Act
      const { prospects } = applySeedProspects([custom]);

      // Assert
      expect(prospects.map((p) => p.id)).toContain('custom_001');
    });

    it('returns total = SEED_COUNT + custom prospects count', () => {
      // Arrange
      const customs = [makeProspect({ id: 'custom_a' }), makeProspect({ id: 'custom_b' })];

      // Act
      const { prospects } = applySeedProspects(customs);

      // Assert
      expect(prospects).toHaveLength(SEED_COUNT + 2);
    });

    it('does not mutate the original rawProspects array', () => {
      // Arrange
      const raw: Prospect[] = [];
      const originalRef = raw;

      // Act
      applySeedProspects(raw);

      // Assert
      expect(raw).toBe(originalRef);
      expect(raw).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // Seed data integrity — spot-check known seed shapes
  // -------------------------------------------------------------------------
  describe('seed data integrity', () => {
    it('seed_prospect_01 has the expected name and status', () => {
      // Arrange + Act
      const { prospects } = applySeedProspects([]);
      const p01 = prospects.find((p) => p.id === 'seed_prospect_01');

      // Assert
      expect(p01).toBeDefined();
      expect(p01?.name).toBe('Sóestou Dando Uma Olhadinha da Silva');
      expect(p01?.status).toBe('Em Aberto');
    });

    it('seed_prospect_02 has a non-empty email address', () => {
      // Arrange + Act
      const { prospects } = applySeedProspects([]);
      const p02 = prospects.find((p) => p.id === 'seed_prospect_02');

      // Assert
      expect(p02?.email).toBeTruthy();
    });

    it('seed_prospect_03 has an empty phone (edge-case prospect)', () => {
      // Arrange + Act
      const { prospects } = applySeedProspects([]);
      const p03 = prospects.find((p) => p.id === 'seed_prospect_03');

      // Assert
      expect(p03?.phone).toBe('');
    });

    it('all seeds have status = "Em Aberto"', () => {
      // Arrange + Act
      const { prospects } = applySeedProspects([]);

      // Assert
      const seeds = prospects.filter((p) => SEED_IDS.includes(p.id as (typeof SEED_IDS)[number]));
      for (const seed of seeds) {
        expect(seed.status).toBe('Em Aberto');
      }
    });

    it('all seeds have a ISO-formatted createdAt string', () => {
      // Arrange + Act
      const { prospects } = applySeedProspects([]);

      // Assert
      const seeds = prospects.filter((p) => SEED_IDS.includes(p.id as (typeof SEED_IDS)[number]));
      for (const seed of seeds) {
        expect(seed.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      }
    });

    it('all seeds have a positive followUpDays value', () => {
      // Arrange + Act
      const { prospects } = applySeedProspects([]);

      // Assert
      const seeds = prospects.filter((p) => SEED_IDS.includes(p.id as (typeof SEED_IDS)[number]));
      for (const seed of seeds) {
        expect(seed.followUpDays).toBeGreaterThan(0);
      }
    });
  });
});
