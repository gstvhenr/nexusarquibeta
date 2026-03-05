import { beforeEach, describe, expect, it, vi } from 'vitest';
import { migrateClients, createSeedClient, runStorageSchemaMigrations } from './migrations';
import type { LegacyClientRecord, SeedClientData } from './migrations';
import type { ClientStatus } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a minimal LegacyClientRecord with sane defaults for each test. */
const makeLegacyClient = (partial: Partial<LegacyClientRecord> = {}): LegacyClientRecord => ({
  id: 'client-01',
  name: 'Test Client',
  ...partial,
});

/** Builds a SeedClientData record (required fields only by default). */
const makeSeedData = (partial: Partial<SeedClientData> = {}): SeedClientData => ({
  id: 'seed-01',
  Nome: 'Seed Client',
  StatusCliente: 'Ativo' as ClientStatus,
  ...partial,
});

/** Creates a minimal StorageLike mock for schema migration tests. */
const makeStorage = (initial: Record<string, unknown> = {}) => {
  const store: Record<string, unknown> = { ...initial };
  return {
    getItem: vi.fn(<T>(key: string, defaultValue: T): T =>
      key in store ? (store[key] as T) : defaultValue,
    ),
    setItem: vi.fn(<T>(key: string, value: T): void => {
      store[key] = value;
    }),
    _store: store,
  };
};

const KEYS = {
  GLOBALIDENTIFIERCOUNTER: 'globalIdentifierCounter',
  ACCEPTEDPAYMENTMETHODS: 'accepted_payment_methods',
};

// ---------------------------------------------------------------------------
// migrateClients
// ---------------------------------------------------------------------------
describe('migrateClients', () => {
  describe('input guards', () => {
    it('returns [] when called with an empty array', () => {
      expect(migrateClients([])).toEqual([]);
    });

    it('returns [] when called with a non-array falsy value (null cast)', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(migrateClients(null as any)).toEqual([]);
    });

    it('returns [] when called with undefined cast to array type', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(migrateClients(undefined as any)).toEqual([]);
    });
  });

  // ---- Migration 1: phone → contacts ----
  describe('Migration 1 — phone / phoneHasWhatsApp → contacts[]', () => {
    it('converts a phone field into a primary contact entry', () => {
      // Arrange
      const client = makeLegacyClient({ phone: '+55 11 99999-0000', phoneHasWhatsApp: false });

      // Act
      const [result] = migrateClients([client]);

      // Assert
      expect(result.contacts).toHaveLength(1);
      expect(result.contacts[0]).toMatchObject({
        phone: '+55 11 99999-0000',
        hasWhatsApp: false,
        isPrimary: true,
      });
    });

    it('sets hasWhatsApp: true when phoneHasWhatsApp is true', () => {
      // Arrange
      const client = makeLegacyClient({ phone: '+55 11 99999-0000', phoneHasWhatsApp: true });

      // Act
      const [result] = migrateClients([client]);

      // Assert
      expect(result.contacts[0].hasWhatsApp).toBe(true);
    });

    it('generates a unique UUID for the migrated contact', () => {
      // Arrange — two clients with phone fields
      const c1 = makeLegacyClient({ id: 'c1', phone: '111' });
      const c2 = makeLegacyClient({ id: 'c2', phone: '222' });

      // Act
      const [r1, r2] = migrateClients([c1, c2]);

      // Assert — UUIDs are distinct
      expect(r1.contacts[0].id).not.toBe(r2.contacts[0].id);
    });

    it('removes phone and phoneHasWhatsApp from the migrated record', () => {
      // Arrange
      const client = makeLegacyClient({ phone: '555', phoneHasWhatsApp: false });

      // Act
      const [result] = migrateClients([client]);

      // Assert
      expect(result).not.toHaveProperty('phone');
      expect(result).not.toHaveProperty('phoneHasWhatsApp');
    });

    it('preserves existing contacts and does NOT re-migrate when contacts are already present', () => {
      // Arrange — already-migrated client
      const existing = [{ id: 'c-existing', phone: '111', hasWhatsApp: true, isPrimary: true }];
      const client = makeLegacyClient({ contacts: existing, phone: '999' });

      // Act
      const [result] = migrateClients([client]);

      // Assert — contacts unchanged, no duplicate created
      expect(result.contacts).toHaveLength(1);
      expect(result.contacts[0].phone).toBe('111');
    });

    it('sets contacts to [] when contacts is not an array and phone is absent', () => {
      // Arrange — legacy record with no contacts and no phone
      const client = makeLegacyClient({ contacts: undefined });

      // Act
      const [result] = migrateClients([client]);

      // Assert
      expect(result.contacts).toEqual([]);
    });
  });

  // ---- Migration 2: registrationDate ----
  describe('Migration 2 — registrationDate', () => {
    it('uses lastContactDate as fallback when registrationDate is missing', () => {
      // Arrange
      const client = makeLegacyClient({ lastContactDate: '2024-06-01T00:00:00.000Z' });

      // Act
      const [result] = migrateClients([client]);

      // Assert
      expect(result.registrationDate).toBe('2024-06-01T00:00:00.000Z');
    });

    it('falls back to the current ISO date when both registrationDate and lastContactDate are absent', () => {
      // Arrange
      const before = Date.now();
      const client = makeLegacyClient({ registrationDate: undefined, lastContactDate: undefined });

      // Act
      const [result] = migrateClients([client]);
      const after = Date.now();

      // Assert — generated date is within the test window
      const generated = new Date(result.registrationDate!).getTime();
      expect(generated).toBeGreaterThanOrEqual(before);
      expect(generated).toBeLessThanOrEqual(after);
    });

    it('preserves an existing registrationDate without modification', () => {
      // Arrange
      const client = makeLegacyClient({ registrationDate: '2020-01-01T00:00:00.000Z' });

      // Act
      const [result] = migrateClients([client]);

      // Assert
      expect(result.registrationDate).toBe('2020-01-01T00:00:00.000Z');
    });
  });

  // ---- Migration 3: address.number ----
  describe('Migration 3 — address.number', () => {
    it('injects an empty number field when address exists but number is undefined', () => {
      // Arrange
      const client = makeLegacyClient({ address: { street: 'Rua A' } });

      // Act
      const [result] = migrateClients([client]);

      // Assert
      expect((result as unknown as LegacyClientRecord).address).toHaveProperty('number', '');
      expect((result as unknown as LegacyClientRecord).address?.street).toBe('Rua A');
    });

    it('preserves an existing address.number without modification', () => {
      // Arrange
      const client = makeLegacyClient({ address: { street: 'Rua B', number: '42' } });

      // Act
      const [result] = migrateClients([client]);

      // Assert
      expect((result as unknown as LegacyClientRecord).address?.number).toBe('42');
    });

    it('does not add address.number when address is absent', () => {
      // Arrange
      const client = makeLegacyClient({ address: undefined });

      // Act
      const [result] = migrateClients([client]);

      // Assert
      expect((result as unknown as LegacyClientRecord).address).toBeUndefined();
    });
  });

  // ---- Migration 4: clientType default ----
  describe('Migration 4 — clientType default', () => {
    it('sets clientType to "PF" when missing', () => {
      // Arrange
      const client = makeLegacyClient({ clientType: undefined });

      // Act
      const [result] = migrateClients([client]);

      // Assert
      expect((result as unknown as LegacyClientRecord).clientType).toBe('PF');
    });

    it('preserves an existing clientType without modification', () => {
      // Arrange
      const client = makeLegacyClient({ clientType: 'PJ' });

      // Act
      const [result] = migrateClients([client]);

      // Assert
      expect((result as unknown as LegacyClientRecord).clientType).toBe('PJ');
    });
  });

  // ---- Batch correctness ----
  describe('batch migration', () => {
    it('migrates multiple clients independently without cross-contamination', () => {
      // Arrange
      const a = makeLegacyClient({ id: 'a', phone: 'aaa', clientType: undefined });
      const b = makeLegacyClient({ id: 'b', clientType: 'PJ' });

      // Act
      const [rA, rB] = migrateClients([a, b]);

      // Assert
      expect(rA.contacts).toHaveLength(1);
      expect((rA as unknown as LegacyClientRecord).clientType).toBe('PF');
      expect(rB.contacts).toEqual([]);
      expect((rB as unknown as LegacyClientRecord).clientType).toBe('PJ');
    });
  });
});

// ---------------------------------------------------------------------------
// createSeedClient
// ---------------------------------------------------------------------------
describe('createSeedClient', () => {
  it('creates a Client with all required fields populated from SeedClientData', () => {
    // Arrange
    const data = makeSeedData({
      Nome: 'João Silva',
      CPF: '123.456.789-00',
      Email: 'joao@example.com',
    });

    // Act
    const client = createSeedClient(data);

    // Assert
    expect(client.id).toBe('seed-01');
    expect(client.name).toBe('João Silva');
    expect(client.cpfCnpj).toBe('123.456.789-00');
    expect(client.email).toBe('joao@example.com');
  });

  it('creates a contact entry when Telefone is provided', () => {
    // Arrange
    const data = makeSeedData({ Telefone: '+55 11 98888-0000' });

    // Act
    const client = createSeedClient(data);

    // Assert
    expect(client.contacts).toHaveLength(1);
    expect(client.contacts[0]).toMatchObject({
      id: 'contact_seed-01_1',
      phone: '+55 11 98888-0000',
      isPrimary: true,
    });
  });

  it('sets hasWhatsApp: true when WhatsApp is "Sim"', () => {
    // Arrange
    const data = makeSeedData({ Telefone: '+55 11 98888-0000', WhatsApp: 'Sim' });

    // Act
    const client = createSeedClient(data);

    // Assert
    expect(client.contacts[0].hasWhatsApp).toBe(true);
  });

  it('sets hasWhatsApp: false when WhatsApp is not "Sim"', () => {
    // Arrange
    const data = makeSeedData({ Telefone: '+55 11 98888-0000', WhatsApp: 'Não' });

    // Act
    const client = createSeedClient(data);

    // Assert
    expect(client.contacts[0].hasWhatsApp).toBe(false);
  });

  it('returns an empty contacts array when Telefone is absent', () => {
    // Arrange
    const data = makeSeedData({ Telefone: undefined });

    // Act
    const client = createSeedClient(data);

    // Assert
    expect(client.contacts).toEqual([]);
  });

  it('maps address fields correctly', () => {
    // Arrange
    const data = makeSeedData({
      Logradouro: 'Av. Paulista',
      Numero: '1000',
      Complemento: 'Apto 1',
      Bairro: 'Bela Vista',
      Cidade: 'São Paulo',
      Estado: 'SP',
      CEP: '01310-100',
    });

    // Act
    const client = createSeedClient(data);

    // Assert
    expect(client.address).toEqual({
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Apto 1',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310-100',
    });
  });

  it('defaults empty strings for absent address fields', () => {
    // Act
    const client = createSeedClient(makeSeedData());

    // Assert — all address sub-fields default to ''
    expect(Object.values(client.address)).toEqual(['', '', '', '', '', '', '']);
  });

  it('sets archived: true when StatusCliente is "Cliente Desabilitado"', () => {
    // Arrange
    const data = makeSeedData({ StatusCliente: 'Cliente Desabilitado' as ClientStatus });

    // Act
    const client = createSeedClient(data);

    // Assert
    expect(client.archived).toBe(true);
  });

  it('sets archived: false for active statuses', () => {
    // Arrange
    const data = makeSeedData({ StatusCliente: 'Ativo' as ClientStatus });

    // Act
    const client = createSeedClient(data);

    // Assert
    expect(client.archived).toBe(false);
  });

  it('applies correct defaults for non-provided optional fields', () => {
    // Act
    const client = createSeedClient(makeSeedData());

    // Assert
    expect(client.pipelineStatus).toBe('Contato Inicial');
    expect(client.leadSource).toBe('Não informado');
    expect(client.clientType).toBe('PF');
    expect(client.serviceInterests).toEqual([]);
    expect(client.isFavorite).toBe(false);
    expect(client.isUrgent).toBe(false);
    expect(client.meetings).toEqual([]);
    expect(client.auditLog).toEqual([]);
    expect(client.projectLinks).toEqual([]);
    expect(client.generalNotes).toBe('');
  });

  it('wraps ServicosInteresse into a single-element array', () => {
    // Arrange
    const data = makeSeedData({ ServicosInteresse: 'Reforma Residencial' });

    // Act
    const client = createSeedClient(data);

    // Assert
    expect(client.serviceInterests).toEqual(['Reforma Residencial']);
  });
});

// ---------------------------------------------------------------------------
// runStorageSchemaMigrations
// ---------------------------------------------------------------------------
describe('runStorageSchemaMigrations', () => {
  let storage: ReturnType<typeof makeStorage>;

  beforeEach(() => {
    storage = makeStorage({
      [KEYS.GLOBALIDENTIFIERCOUNTER]: 2500,
      [KEYS.ACCEPTEDPAYMENTMETHODS]: [],
    });
  });

  // ---- Guard clauses ----
  describe('version guard clauses', () => {
    it('returns 0 for a negative fromVersion', () => {
      const result = runStorageSchemaMigrations({
        storage,
        keys: KEYS,
        fromVersion: -1,
        toVersion: 1,
      });
      expect(result).toBe(0);
      expect(storage.setItem).not.toHaveBeenCalled();
    });

    it('returns 0 for NaN fromVersion', () => {
      const result = runStorageSchemaMigrations({
        storage,
        keys: KEYS,
        fromVersion: NaN,
        toVersion: 1,
      });
      expect(result).toBe(0);
    });

    it('returns fromVersion unchanged when already at target version', () => {
      const result = runStorageSchemaMigrations({
        storage,
        keys: KEYS,
        fromVersion: 1,
        toVersion: 1,
      });
      expect(result).toBe(1);
      expect(storage.setItem).not.toHaveBeenCalled();
    });

    it('returns fromVersion unchanged when fromVersion exceeds toVersion', () => {
      const result = runStorageSchemaMigrations({
        storage,
        keys: KEYS,
        fromVersion: 5,
        toVersion: 1,
      });
      expect(result).toBe(5);
    });
  });

  // ---- migrateToV1 ----
  describe('migrateToV1 (v0 → v1)', () => {
    it('returns 1 after a successful v0 → v1 migration', () => {
      const result = runStorageSchemaMigrations({
        storage,
        keys: KEYS,
        fromVersion: 0,
        toVersion: 1,
      });
      expect(result).toBe(1);
    });

    it('preserves a valid globalIdentifierCounter (>= 0, finite)', () => {
      // Arrange — counter already valid
      storage = makeStorage({ [KEYS.GLOBALIDENTIFIERCOUNTER]: 3750 });

      // Act
      runStorageSchemaMigrations({ storage, keys: KEYS, fromVersion: 0, toVersion: 1 });

      // Assert — setItem called with the same value
      expect(storage.setItem).toHaveBeenCalledWith(KEYS.GLOBALIDENTIFIERCOUNTER, 3750);
    });

    it('resets an invalid counter (NaN) to the default 2500', () => {
      // Arrange
      storage = makeStorage({ [KEYS.GLOBALIDENTIFIERCOUNTER]: NaN });

      // Act
      runStorageSchemaMigrations({ storage, keys: KEYS, fromVersion: 0, toVersion: 1 });

      // Assert
      expect(storage.setItem).toHaveBeenCalledWith(KEYS.GLOBALIDENTIFIERCOUNTER, 2500);
    });

    it('resets an invalid counter (negative) to the default 2500', () => {
      // Arrange
      storage = makeStorage({ [KEYS.GLOBALIDENTIFIERCOUNTER]: -1 });

      // Act
      runStorageSchemaMigrations({ storage, keys: KEYS, fromVersion: 0, toVersion: 1 });

      // Assert
      expect(storage.setItem).toHaveBeenCalledWith(KEYS.GLOBALIDENTIFIERCOUNTER, 2500);
    });

    it('resets an invalid counter (string) to the default 2500', () => {
      // Arrange
      storage = makeStorage({ [KEYS.GLOBALIDENTIFIERCOUNTER]: 'not a number' });

      // Act
      runStorageSchemaMigrations({ storage, keys: KEYS, fromVersion: 0, toVersion: 1 });

      // Assert
      expect(storage.setItem).toHaveBeenCalledWith(KEYS.GLOBALIDENTIFIERCOUNTER, 2500);
    });

    it('preserves acceptedPaymentMethods when already an array', () => {
      // Arrange
      const methods = ['pix', 'card'];
      storage = makeStorage({ [KEYS.ACCEPTEDPAYMENTMETHODS]: methods });

      // Act
      runStorageSchemaMigrations({ storage, keys: KEYS, fromVersion: 0, toVersion: 1 });

      // Assert — setItem NOT called for payment methods (no reset needed)
      const paymentMethodCalls = storage.setItem.mock.calls.filter(
        ([key]) => key === KEYS.ACCEPTEDPAYMENTMETHODS,
      );
      expect(paymentMethodCalls).toHaveLength(0);
    });

    it('resets acceptedPaymentMethods to [] when it is not an array', () => {
      // Arrange
      storage = makeStorage({ [KEYS.ACCEPTEDPAYMENTMETHODS]: 'invalid' });

      // Act
      runStorageSchemaMigrations({ storage, keys: KEYS, fromVersion: 0, toVersion: 1 });

      // Assert
      expect(storage.setItem).toHaveBeenCalledWith(KEYS.ACCEPTEDPAYMENTMETHODS, []);
    });
  });

  // ---- Unregistered version ----
  describe('unregistered migration version', () => {
    it('throws an Error when no migration is registered for the target version', () => {
      expect(() =>
        runStorageSchemaMigrations({
          storage,
          keys: KEYS,
          fromVersion: 1,
          toVersion: 2,
        }),
      ).toThrow('No migration registered for storage schema v2.');
    });
  });
});
