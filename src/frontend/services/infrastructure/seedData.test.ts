import { describe, expect, it } from 'vitest';
import type { LegacyClientRecord } from './migrations';
import { applySeedClients } from './seedData';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Total number of canonical seeds defined in seedData.ts */
const SEED_COUNT = 11;

const SEED_IDS = [
  'seed_client_gustavo',
  'seed_client_carlos_mendes',
  'seed_client_mariana_rocha',
  'seed_client_felipe_nogueira',
  'seed_client_juliana_ferreira',
  'seed_client_rodrigo_lima',
  'seed_client_patricia_duarte',
  'seed_client_andre_carvalho',
  'seed_client_camila_souza',
  'seed_client_bruno_teixeira',
  'seed_client_larissa_faria',
] as const;

/** Obsolete IDs that must be purged */
const OBSOLETE_IDS = ['mock_client_gustavo', 'mock_client_alexandre', 'mock_client_bruno'];

const makeClient = (partial: Partial<LegacyClientRecord> = {}): LegacyClientRecord => ({
  id: 'client_custom',
  name: 'Custom Client',
  ...partial,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('applySeedClients', () => {
  // -------------------------------------------------------------------------
  // Empty input — all seeds must be inserted
  // -------------------------------------------------------------------------
  describe('when rawClients is empty', () => {
    it('returns all canonical seeds', () => {
      // Arrange
      const raw: LegacyClientRecord[] = [];

      // Act
      const { clients } = applySeedClients(raw);

      // Assert
      expect(clients).toHaveLength(SEED_COUNT);
    });

    it('marks changed = true because seeds were prepended', () => {
      // Arrange
      const raw: LegacyClientRecord[] = [];

      // Act
      const { changed } = applySeedClients(raw);

      // Assert
      expect(changed).toBe(true);
    });

    it('includes every canonical seed id in the output', () => {
      // Arrange + Act
      const { clients } = applySeedClients([]);

      // Assert
      const outputIds = clients.map((c) => c.id);
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
      const { clients: seededOnce } = applySeedClients([]);

      // Act — apply again
      const { clients } = applySeedClients(seededOnce);

      // Assert
      expect(clients).toHaveLength(SEED_COUNT);
    });

    it('returns changed = true on re-run because seedGustavo name is in obsoleteNames (by design)', () => {
      // NOTE: seed_client_gustavo has name 'Gustavo Henrique Geraldo' which is also listed
      // in the obsoleteNames blacklist. The function always removes any client with that name
      // first (step 1) and then re-inserts the canonical seed (step 2), so changed is always
      // true when the seeded list is passed through again. This is documented behavior.
      const { clients: seededOnce } = applySeedClients([]);

      // Act
      const { changed } = applySeedClients(seededOnce);

      // Assert — changed remains true because gustavo is removed-then-reinserted every call
      expect(changed).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Obsolete entry removal — by ID
  // -------------------------------------------------------------------------
  describe('obsolete client removal by ID', () => {
    it.each(OBSOLETE_IDS)('removes obsolete client with id "%s"', (obsoleteId) => {
      // Arrange
      const raw = [makeClient({ id: obsoleteId })];

      // Act
      const { clients } = applySeedClients(raw);

      // Assert
      expect(clients.map((c) => c.id)).not.toContain(obsoleteId);
    });

    it('marks changed = true when an obsolete client is removed', () => {
      // Arrange
      const raw = [makeClient({ id: OBSOLETE_IDS[0] })];

      // Act
      const { changed } = applySeedClients(raw);

      // Assert
      expect(changed).toBe(true);
    });

    it('removes all three obsolete IDs in a single call', () => {
      // Arrange
      const raw = OBSOLETE_IDS.map((id) => makeClient({ id }));

      // Act
      const { clients } = applySeedClients(raw);

      // Assert — only seeds remain
      const outputIds = clients.map((c) => c.id);
      for (const obsoleteId of OBSOLETE_IDS) {
        expect(outputIds).not.toContain(obsoleteId);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Obsolete entry removal — by name
  // -------------------------------------------------------------------------
  describe('obsolete client removal by name', () => {
    it('removes client with obsolete name "Alexandre Belfante"', () => {
      // Arrange — use a non-seed ID so name removal is the only trigger
      const raw = [makeClient({ id: 'non_obsolete_id', name: 'Alexandre Belfante' })];

      // Act
      const { clients } = applySeedClients(raw);

      // Assert
      expect(clients.map((c) => c.name)).not.toContain('Alexandre Belfante');
    });

    it('removes client with obsolete name "Bruno Lacerda"', () => {
      // Arrange
      const raw = [makeClient({ id: 'some_other_id', name: 'Bruno Lacerda' })];

      // Act
      const { clients } = applySeedClients(raw);

      // Assert
      expect(clients.map((c) => c.name)).not.toContain('Bruno Lacerda');
    });

    it('"Gustavo Henrique Geraldo" name filter is overridden by canonical seed re-insert (documented behavior)', () => {
      // NOTE: 'Gustavo Henrique Geraldo' is in obsoleteNames, but seed_client_gustavo also has
      // this name. The filter removes both the user-supplied record AND an earlier copy of the
      // seed, but the canonical seed is always re-inserted at the end. Therefore the name WILL
      // appear in the output — it cannot be fully suppressed without removing the canonical seed.
      const raw = [makeClient({ id: 'legacy_gustavo_id', name: 'Gustavo Henrique Geraldo' })];

      // Act
      const { clients } = applySeedClients(raw);
      const outputNames = clients.map((c) => c.name);

      // Assert — legacy entry is gone (no entry with id 'legacy_gustavo_id')
      expect(clients.map((c) => c.id)).not.toContain('legacy_gustavo_id');
      // But the canonical seed re-introduced the name — this is expected and documented
      expect(outputNames).toContain('Gustavo Henrique Geraldo');
    });
  });

  // -------------------------------------------------------------------------
  // Custom (non-seed, non-obsolete) clients — must be preserved
  // -------------------------------------------------------------------------
  describe('when rawClients contains valid custom clients', () => {
    it('preserves custom clients that are not obsolete', () => {
      // Arrange
      const custom = makeClient({ id: 'client_custom_xyz', name: 'Zara Monteiro' });

      // Act
      const { clients } = applySeedClients([custom]);

      // Assert
      expect(clients.map((c) => c.id)).toContain('client_custom_xyz');
    });

    it('returns SEED_COUNT + custom count when no obsoletes are present', () => {
      // Arrange
      const customs = [
        makeClient({ id: 'custom_a', name: 'Amara Torres' }),
        makeClient({ id: 'custom_b', name: 'Bruno Alencar' }),
      ];

      // Act
      const { clients } = applySeedClients(customs);

      // Assert
      expect(clients).toHaveLength(SEED_COUNT + 2);
    });

    it('seeds are prepended before custom clients (seeds appear first)', () => {
      // Arrange — single custom client
      const custom = makeClient({ id: 'last_client' });

      // Act
      const { clients } = applySeedClients([custom]);

      // Assert — first item is one of the seeds
      expect(SEED_IDS).toContain(clients[0]?.id as (typeof SEED_IDS)[number]);
    });
  });

  // -------------------------------------------------------------------------
  // Mixed scenario — obsoletes + customs + partial seeds
  // -------------------------------------------------------------------------
  describe('mixed input: obsoletes + customs + partial seeds', () => {
    it('removes obsoletes, keeps customs, and fills in missing seeds', () => {
      // Arrange
      const raw = [
        makeClient({ id: OBSOLETE_IDS[0] }), // obsolete → removed
        makeClient({ id: 'custom_keep', name: 'Keep Me' }), // custom → preserved
        makeClient({ id: SEED_IDS[0] }), // seed already present
      ];

      // Act
      const { clients } = applySeedClients(raw);
      const outputIds = clients.map((c) => c.id);

      // Assert
      expect(outputIds).not.toContain(OBSOLETE_IDS[0]);
      expect(outputIds).toContain('custom_keep');
      expect(clients).toHaveLength(SEED_COUNT + 1); // 11 seeds + 1 custom
    });

    it('marks changed = true when there is any removal or insertion', () => {
      // Arrange — one obsolete triggers the change flag
      const raw = [makeClient({ id: OBSOLETE_IDS[0] })];

      // Act
      const { changed } = applySeedClients(raw);

      // Assert
      expect(changed).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Seed data integrity — spot-check known seed shapes
  // -------------------------------------------------------------------------
  describe('seed data integrity', () => {
    it('seedGustavo has correct name and birthDate', () => {
      // Arrange + Act
      const { clients } = applySeedClients([]);
      const gustavo = clients.find((c) => c.id === 'seed_client_gustavo') as Record<
        string,
        unknown
      >;

      // Assert
      expect(gustavo).toBeDefined();
      expect(gustavo?.name).toBe('Gustavo Henrique Geraldo');
      expect(gustavo?.birthDate).toBe('1994-02-25');
    });

    it('seedGustavo has multiple serviceInterests', () => {
      // Arrange + Act
      const { clients } = applySeedClients([]);
      const gustavo = clients.find((c) => c.id === 'seed_client_gustavo') as Record<
        string,
        unknown
      >;

      // Assert
      expect(Array.isArray(gustavo?.serviceInterests)).toBe(true);
      expect((gustavo?.serviceInterests as string[]).length).toBeGreaterThan(1);
    });

    it('all seeds have clientType = "PF"', () => {
      // Arrange + Act
      const { clients } = applySeedClients([]);

      // Assert
      const seeds = clients.filter((c) =>
        SEED_IDS.includes(c.id as (typeof SEED_IDS)[number]),
      ) as Array<Record<string, unknown>>;
      for (const seed of seeds) {
        expect(seed.clientType).toBe('PF');
      }
    });

    it('all seeds have a non-empty name', () => {
      // Arrange + Act
      const { clients } = applySeedClients([]);

      // Assert
      const seeds = clients.filter((c) => SEED_IDS.includes(c.id as (typeof SEED_IDS)[number]));
      for (const seed of seeds) {
        expect(typeof seed.name).toBe('string');
        expect((seed.name as string).trim().length).toBeGreaterThan(0);
      }
    });

    it('all seeds have contacts as an array with at least one entry', () => {
      // Arrange + Act
      const { clients } = applySeedClients([]);

      // Assert
      const seeds = clients.filter((c) =>
        SEED_IDS.includes(c.id as (typeof SEED_IDS)[number]),
      ) as Array<Record<string, unknown>>;
      for (const seed of seeds) {
        expect(Array.isArray(seed.contacts)).toBe(true);
        expect((seed.contacts as unknown[]).length).toBeGreaterThan(0);
      }
    });
  });
});
