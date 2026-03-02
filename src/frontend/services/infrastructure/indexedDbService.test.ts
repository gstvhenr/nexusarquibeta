import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { indexedDbService } from './indexedDbService';

describe('indexedDbService', () => {
  let originalIndexedDb: IDBFactory | undefined;

  beforeEach(() => {
    originalIndexedDb = window.indexedDB;
    Object.defineProperty(window, 'indexedDB', {
      value: undefined,
      configurable: true,
      writable: true,
    });
  });

  afterEach(async () => {
    await indexedDbService.clearSnapshot();
    await indexedDbService.clearAutomaticBackups();
    Object.defineProperty(window, 'indexedDB', {
      value: originalIndexedDb,
      configurable: true,
      writable: true,
    });
  });

  it('stores and reads snapshots in volatile fallback when IndexedDB is unavailable', async () => {
    // Given
    const snapshot = { clients: [{ id: 'c1' }], globalIdentifierCounter: 2510 };

    // When
    await indexedDbService.writeSnapshot(snapshot);
    const persisted = await indexedDbService.readSnapshot<typeof snapshot>();

    // Then
    expect(persisted).toEqual(snapshot);
  });

  it('reserves identifiers sequentially in volatile fallback when IndexedDB is unavailable', async () => {
    // Given
    await indexedDbService.writeSnapshot({ globalIdentifierCounter: 4000 });

    // When
    const firstReservation = await indexedDbService.reserveGlobalIdentifier();
    const secondReservation = await indexedDbService.reserveGlobalIdentifier();
    const persisted = await indexedDbService.readSnapshot<{ globalIdentifierCounter: number }>();

    // Then
    expect(firstReservation).toEqual({ reservedValue: 4000, nextValue: 4001 });
    expect(secondReservation).toEqual({ reservedValue: 4001, nextValue: 4002 });
    expect(persisted?.globalIdentifierCounter).toBe(4002);
  });

  it('stores and reads entity state in volatile fallback when IndexedDB is unavailable', async () => {
    // Given
    const state = { projects: [{ id: 'p1' }], globalIdentifierCounter: 3000 };

    // When
    await indexedDbService.writeEntityState(state);
    const entityState = await indexedDbService.readEntityState<typeof state>();

    // Then
    expect(entityState).toEqual(state);
  });

  it('stores and reads UI preferences in volatile fallback when IndexedDB is unavailable', async () => {
    // Given
    const key = 'ui_pref:test-theme';

    // When
    await indexedDbService.writePreference(key, 'light');
    const persistedTheme = await indexedDbService.readPreference<string>(key);
    await indexedDbService.removePreference(key);
    const removedTheme = await indexedDbService.readPreference<string>(key);

    // Then
    expect(persistedTheme).toBe('light');
    expect(removedTheme).toBeNull();
  });

  it('keeps automatic backups bounded by retention in volatile fallback', async () => {
    // Given
    await indexedDbService.writeAutomaticBackup({ projects: [{ id: 'one' }] }, { maxEntries: 2 });
    await indexedDbService.writeAutomaticBackup({ projects: [{ id: 'two' }] }, { maxEntries: 2 });

    // When
    await indexedDbService.writeAutomaticBackup({ projects: [{ id: 'three' }] }, { maxEntries: 2 });
    const backups = await indexedDbService.listAutomaticBackups();

    // Then
    expect(backups).toHaveLength(2);
  });
});
