/**
 * indexedDbService.test.ts
 *
 * Two environments exercised:
 *   1. VOLATILE FALLBACK — window.indexedDB = undefined, uses in-memory state.
 *   2. REAL INDEXEDDB   — powered by fake-indexeddb; exercises the full IDB transaction path.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
type Snapshot = { projects: { id: string }[]; globalIdentifierCounter: number };

const makeSnapshot = (counter = 2500): Snapshot => ({
  projects: [{ id: 'p1' }],
  globalIdentifierCounter: counter,
});

// Swap window.indexedDB for a fresh IDBFactory instance before each real-IDB test.
const installFakeIndexedDb = (): IDBFactory => {
  const fakeIdb = new IDBFactory();
  Object.defineProperty(window, 'indexedDB', {
    value: fakeIdb,
    configurable: true,
    writable: true,
  });
  return fakeIdb;
};

const removeIndexedDb = (): void => {
  Object.defineProperty(window, 'indexedDB', {
    value: undefined,
    configurable: true,
    writable: true,
  });
};

// ---------------------------------------------------------------------------
// Suite A — Volatile fallback (IndexedDB unavailable)
// ---------------------------------------------------------------------------
describe('indexedDbService — volatile fallback (no IndexedDB)', () => {
  let indexedDbService: typeof import('./indexedDbService')['indexedDbService'];

  beforeEach(async () => {
    removeIndexedDb();
    // Re-import after disabling IDB so module-level state is reset.
    vi.resetModules();
    const module = await import('./indexedDbService');
    indexedDbService = module.indexedDbService;
  });

  afterEach(async () => {
    await indexedDbService.clearSnapshot();
    await indexedDbService.clearAutomaticBackups();
  });

  // ---- isSupported ----
  it('isSupported() returns false when indexedDB is undefined', () => {
    expect(indexedDbService.isSupported()).toBe(false);
  });

  // ---- Snapshot round-trip ----
  it('writes and reads a snapshot in the volatile store', async () => {
    // Arrange
    const snapshot = makeSnapshot();

    // Act
    await indexedDbService.writeSnapshot(snapshot);
    const result = await indexedDbService.readSnapshot<Snapshot>();

    // Assert
    expect(result).toEqual(snapshot);
  });

  it('readSnapshot returns null before any snapshot is written', async () => {
    const result = await indexedDbService.readSnapshot();
    expect(result).toBeNull();
  });

  it('clearSnapshot removes the snapshot from the volatile store', async () => {
    // Arrange
    await indexedDbService.writeSnapshot(makeSnapshot());

    // Act
    await indexedDbService.clearSnapshot();

    // Assert
    expect(await indexedDbService.readSnapshot()).toBeNull();
  });

  it('returns a deep clone — mutations to the read result do not affect the stored value', async () => {
    // Arrange
    const original = makeSnapshot();
    await indexedDbService.writeSnapshot(original);

    // Act — mutate the result
    const result = await indexedDbService.readSnapshot<Snapshot>();
    result!.projects.push({ id: 'mutated' });

    // Assert — stored value is unaffected
    const fresh = await indexedDbService.readSnapshot<Snapshot>();
    expect(fresh?.projects).toHaveLength(1);
  });

  // ---- Entity state ----
  it('writes and reads entity state', async () => {
    // Arrange
    const state = { projects: [{ id: 'p1' }], globalIdentifierCounter: 3000 };

    // Act
    await indexedDbService.writeEntityState(state);
    const result = await indexedDbService.readEntityState<typeof state>();

    // Assert
    expect(result).toEqual(state);
  });

  it('readEntityState returns null when no state has been written', async () => {
    const result = await indexedDbService.readEntityState();
    expect(result).toBeNull();
  });

  it('readEntityState with entity filter returns only requested keys', async () => {
    // Arrange
    await indexedDbService.writeEntityState({ projects: ['p1'], clients: ['c1'], proposals: [] });

    // Act — only request 'projects'
    const result = await indexedDbService.readEntityState<{ projects: string[] }>(['projects']);

    // Assert
    expect(result).toHaveProperty('projects');
    expect(result).not.toHaveProperty('clients');
  });

  it('readEntityState with filter for a missing key returns null', async () => {
    await indexedDbService.writeEntityState({ globalIdentifierCounter: 3000 });
    const result = await indexedDbService.readEntityState(['nonExistentKey']);
    expect(result).toBeNull();
  });

  it('writeEntityState merges into existing state (partial update)', async () => {
    // Arrange
    await indexedDbService.writeEntityState({ projects: ['p1'] });

    // Act — add a second entity
    await indexedDbService.writeEntityState({ clients: ['c1'] });
    const result = await indexedDbService.readEntityState<{ projects: string[]; clients: string[] }>();

    // Assert — both keys present
    expect(result?.projects).toEqual(['p1']);
    expect(result?.clients).toEqual(['c1']);
  });

  // ---- Preferences ----
  it('writes, reads, and removes a preference', async () => {
    // Arrange
    const key = 'ui:theme';

    // Act & Assert — write
    await indexedDbService.writePreference(key, 'dark');
    expect(await indexedDbService.readPreference<string>(key)).toBe('dark');

    // Act & Assert — remove
    await indexedDbService.removePreference(key);
    expect(await indexedDbService.readPreference<string>(key)).toBeNull();
  });

  it('readPreference returns null for an unknown key', async () => {
    expect(await indexedDbService.readPreference('unknown:key')).toBeNull();
  });

  // ---- Automatic backups ----
  it('writes and lists automatic backups (metadata only, no payload)', async () => {
    // Arrange
    await indexedDbService.writeAutomaticBackup({ projects: [{ id: 'one' }] });

    // Act
    const backups = await indexedDbService.listAutomaticBackups();

    // Assert
    expect(backups).toHaveLength(1);
    expect(backups[0]).not.toHaveProperty('payload');
    expect(backups[0]).toHaveProperty('id');
    expect(backups[0]).toHaveProperty('hash');
  });

  it('enforces maxEntries retention policy in the volatile store', async () => {
    // Arrange — write 3 backups with maxEntries = 2
    await indexedDbService.writeAutomaticBackup({ v: 1 }, { maxEntries: 2 });
    await indexedDbService.writeAutomaticBackup({ v: 2 }, { maxEntries: 2 });
    await indexedDbService.writeAutomaticBackup({ v: 3 }, { maxEntries: 2 });

    // Act
    const backups = await indexedDbService.listAutomaticBackups();

    // Assert — oldest entry evicted
    expect(backups).toHaveLength(2);
  });

  it('reads a specific backup by ID including its payload', async () => {
    // Arrange
    const payload = { data: 'important' };
    const meta = await indexedDbService.writeAutomaticBackup(payload, { id: 'fixed-id' });

    // Act
    const record = await indexedDbService.readAutomaticBackup<typeof payload>('fixed-id');

    // Assert
    expect(record?.id).toBe(meta.id);
    expect(record?.payload).toEqual(payload);
  });

  it('readAutomaticBackup returns null for a non-existent ID', async () => {
    const result = await indexedDbService.readAutomaticBackup('does-not-exist');
    expect(result).toBeNull();
  });

  it('clearAutomaticBackups removes all backup entries', async () => {
    // Arrange
    await indexedDbService.writeAutomaticBackup({ data: 1 });
    await indexedDbService.writeAutomaticBackup({ data: 2 });

    // Act
    await indexedDbService.clearAutomaticBackups();

    // Assert
    expect(await indexedDbService.listAutomaticBackups()).toHaveLength(0);
  });

  it('listAutomaticBackups returns entries sorted by createdAt descending', async () => {
    // Arrange — use fake timers so we control createdAt ordering
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    await indexedDbService.writeAutomaticBackup({ seq: 1 });
    vi.setSystemTime(2000);
    await indexedDbService.writeAutomaticBackup({ seq: 2 });
    vi.useRealTimers();

    // Act
    const backups = await indexedDbService.listAutomaticBackups();

    // Assert — newest first
    expect(backups[0].createdAt).toBeGreaterThan(backups[1].createdAt);
  });

  // ---- Global identifier reservation ----
  it('reserves global identifiers sequentially from the fallback counter', async () => {
    // Arrange
    await indexedDbService.writeSnapshot(makeSnapshot(4000));

    // Act
    const first = await indexedDbService.reserveGlobalIdentifier();
    const second = await indexedDbService.reserveGlobalIdentifier();
    const persisted = await indexedDbService.readSnapshot<Snapshot>();

    // Assert
    expect(first).toEqual({ reservedValue: 4000, nextValue: 4001 });
    expect(second).toEqual({ reservedValue: 4001, nextValue: 4002 });
    expect(persisted?.globalIdentifierCounter).toBe(4002);
  });

  it('uses defaultCounter when no snapshot has been written', async () => {
    // Act
    const result = await indexedDbService.reserveGlobalIdentifier(9999);

    // Assert
    expect(result).toEqual({ reservedValue: 9999, nextValue: 10000 });
  });
});

// ---------------------------------------------------------------------------
// Suite B — Real IndexedDB path (fake-indexeddb)
// ---------------------------------------------------------------------------
describe('indexedDbService — real IndexedDB (fake-indexeddb)', () => {
  let indexedDbService: typeof import('./indexedDbService')['indexedDbService'];

  beforeEach(async () => {
    // Install a fresh IDBFactory per test to guarantee a clean, isolated DB.
    installFakeIndexedDb();
    vi.resetModules();
    const module = await import('./indexedDbService');
    indexedDbService = module.indexedDbService;
  });

  afterEach(async () => {
    await indexedDbService.clearSnapshot();
    await indexedDbService.clearAutomaticBackups();
  });

  // ---- isSupported ----
  it('isSupported() returns true when indexedDB is available', () => {
    expect(indexedDbService.isSupported()).toBe(true);
  });

  // ---- Snapshot round-trip ----
  it('persists and retrieves a snapshot via IndexedDB', async () => {
    // Arrange
    const snapshot = makeSnapshot(3000);

    // Act
    await indexedDbService.writeSnapshot(snapshot);
    const result = await indexedDbService.readSnapshot<Snapshot>();

    // Assert
    expect(result).toEqual(snapshot);
  });

  it('readSnapshot returns null on a freshly opened database', async () => {
    expect(await indexedDbService.readSnapshot()).toBeNull();
  });

  it('clearSnapshot removes the persisted snapshot', async () => {
    // Arrange
    await indexedDbService.writeSnapshot(makeSnapshot());

    // Act
    await indexedDbService.clearSnapshot();

    // Assert
    expect(await indexedDbService.readSnapshot()).toBeNull();
  });

  // ---- Entity state ----
  it('persists and retrieves entity state via IndexedDB', async () => {
    // Arrange
    const state = { clients: [{ id: 'c1' }], globalIdentifierCounter: 5000 };

    // Act
    await indexedDbService.writeEntityState(state);
    const result = await indexedDbService.readEntityState<typeof state>();

    // Assert
    expect(result).toEqual(state);
  });

  it('readEntityState with entity filter returns only the requested slice', async () => {
    // Arrange
    await indexedDbService.writeEntityState({ projects: ['p1'], clients: ['c1'] });

    // Act
    const result = await indexedDbService.readEntityState<{ projects: string[] }>(['projects']);

    // Assert
    expect(result).toEqual({ projects: ['p1'] });
    expect(result).not.toHaveProperty('clients');
  });

  // ---- Preferences ----
  it('persists, reads, and removes a preference via IndexedDB', async () => {
    // Arrange
    const key = 'pref:sidebar-collapsed';

    // Act & Assert — write
    await indexedDbService.writePreference(key, true);
    expect(await indexedDbService.readPreference<boolean>(key)).toBe(true);

    // Act & Assert — remove
    await indexedDbService.removePreference(key);
    expect(await indexedDbService.readPreference<boolean>(key)).toBeNull();
  });

  // ---- Automatic backups ----
  it('persists and lists backups via IndexedDB (metadata only)', async () => {
    // Arrange
    await indexedDbService.writeAutomaticBackup({ data: 'snap' });

    // Act
    const backups = await indexedDbService.listAutomaticBackups();

    // Assert
    expect(backups).toHaveLength(1);
    expect(backups[0]).not.toHaveProperty('payload');
  });

  it('enforces maxEntries retention via IndexedDB', async () => {
    // Arrange
    for (let i = 0; i < 3; i++) {
      await indexedDbService.writeAutomaticBackup({ seq: i }, { maxEntries: 2 });
    }

    // Act
    const backups = await indexedDbService.listAutomaticBackups();

    // Assert
    expect(backups).toHaveLength(2);
  });

  it('reads a specific backup by ID via IndexedDB', async () => {
    // Arrange
    const payload = { critical: 'data' };
    const meta = await indexedDbService.writeAutomaticBackup(payload, { id: 'idb-fixed' });

    // Act
    const record = await indexedDbService.readAutomaticBackup<typeof payload>('idb-fixed');

    // Assert
    expect(record?.id).toBe(meta.id);
    expect(record?.payload).toEqual(payload);
  });

  it('clearAutomaticBackups removes all entries from IndexedDB', async () => {
    // Arrange
    await indexedDbService.writeAutomaticBackup({ seq: 1 });
    await indexedDbService.writeAutomaticBackup({ seq: 2 });

    // Act
    await indexedDbService.clearAutomaticBackups();

    // Assert
    expect(await indexedDbService.listAutomaticBackups()).toHaveLength(0);
  });

  // ---- Global identifier reservation ----
  it('reserves global identifiers sequentially via IndexedDB transactions', async () => {
    // Arrange
    await indexedDbService.writeSnapshot(makeSnapshot(4000));

    // Act
    const first = await indexedDbService.reserveGlobalIdentifier();
    const second = await indexedDbService.reserveGlobalIdentifier();
    const persisted = await indexedDbService.readSnapshot<Snapshot>();

    // Assert
    expect(first).toEqual({ reservedValue: 4000, nextValue: 4001 });
    expect(second).toEqual({ reservedValue: 4001, nextValue: 4002 });
    expect(persisted?.globalIdentifierCounter).toBe(4002);
  });
});
