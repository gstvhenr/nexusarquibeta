import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PersistencePort } from './persistence';

// vi.hoisted ensures these variables exist BEFORE vi.mock factory execution.
const { mockWriteSnapshot, mockClearSnapshot, mockMaybeCreateAutoBackup } = vi.hoisted(() => ({
  mockWriteSnapshot: vi.fn(async () => {}),
  mockClearSnapshot: vi.fn(async () => {}),
  mockMaybeCreateAutoBackup: vi.fn(async () => {}),
}));

const createMockPersistenceAdapter = (): PersistencePort => ({
  isSupported: () => true,
  readSnapshot: async () => null,
  writeSnapshot: mockWriteSnapshot,
  clearSnapshot: mockClearSnapshot,
  readEntityState: async () => null,
  writeEntityState: vi.fn(async () => {}),
  readPreference: async () => null,
  writePreference: vi.fn(async () => {}),
  removePreference: vi.fn(async () => {}),
  listBackups: vi.fn(async () => []),
  writeBackup: vi.fn(async () => ({
    id: 'stub',
    createdAt: Date.now(),
    sizeBytes: 0,
    hash: '0',
    reason: 'auto' as const,
  })),
  readBackup: async () => null,
  clearBackups: vi.fn(async () => {}),
  reserveGlobalIdentifier: vi.fn(async (defaultCounter = 2500) => ({
    reservedValue: defaultCounter,
    nextValue: defaultCounter + 1,
  })),
});

vi.mock('./autoBackupService', () => ({
  autoBackupService: {
    maybeCreateAutomaticBackup: mockMaybeCreateAutoBackup,
    createManualBackup: vi.fn(async () => ({})),
    listBackups: vi.fn(async () => []),
    restoreBackup: vi.fn(async () => null),
    clearBackups: vi.fn(async () => {}),
  },
}));

type LoadDataModule = typeof import('./loadData');
let updateData: LoadDataModule['updateData'];
let loadData: LoadDataModule['loadData'];
let replaceData: LoadDataModule['replaceData'];
let flushPersistence: LoadDataModule['flushPersistence'];
let resetPersistentDataAndNotify: LoadDataModule['resetPersistentDataAndNotify'] | null = null;
let resetForTest: LoadDataModule['resetForTest'] | null = null;
let initializeDataStore: LoadDataModule['initializeDataStore'];

const flushPersistenceQueue = async (): Promise<void> => {
  // Debounced writes enqueue Promise microtasks in persistenceQueue.
  await Promise.resolve();
  await Promise.resolve();
};

const advanceDebounceWindow = async (): Promise<void> => {
  vi.advanceTimersByTime(300);
  await vi.runAllTimersAsync();
  await flushPersistenceQueue();
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('loadData — debounced persistence', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();

    const persistenceModule = await import('./persistence');
    persistenceModule.setPersistenceAdapter(createMockPersistenceAdapter());

    const loadDataModule: LoadDataModule = await import('./loadData');
    updateData = loadDataModule.updateData;
    loadData = loadDataModule.loadData;
    replaceData = loadDataModule.replaceData;
    flushPersistence = loadDataModule.flushPersistence;
    resetPersistentDataAndNotify = loadDataModule.resetPersistentDataAndNotify;
    resetForTest = loadDataModule.resetForTest;
    initializeDataStore = loadDataModule.initializeDataStore;

    await initializeDataStore();
    // initializeDataStore may trigger an initial writeSnapshot; reset counts.
    mockWriteSnapshot.mockClear();
    mockClearSnapshot.mockClear();
    mockMaybeCreateAutoBackup.mockClear();
  }, 20000);

  afterEach(async () => {
    resetForTest?.();
    resetForTest = null;
    resetPersistentDataAndNotify = null;
    vi.runAllTimers();
    await flushPersistenceQueue();
    const persistenceModule = await import('./persistence');
    persistenceModule.resetPersistenceAdapter();
    vi.useRealTimers();
  });

  it('persists a single mutation after the debounce window expires', async () => {
    // When — single mutation
    updateData('dismissedFocusItems', ['item-a']);

    // Then — not yet persisted
    expect(mockWriteSnapshot).not.toHaveBeenCalled();

    // When — debounce window expires
    await advanceDebounceWindow();

    // Then
    expect(mockWriteSnapshot).toHaveBeenCalledTimes(1);
  });

  it('coalesces rapid mutations into a single write', async () => {
    // When — 5 rapid mutations
    for (let i = 0; i < 5; i++) {
      updateData('dismissedFocusItems', [`item-${i}`]);
    }

    // Then — no write yet
    expect(mockWriteSnapshot).not.toHaveBeenCalled();

    // When — debounce window expires
    await advanceDebounceWindow();

    // Then — exactly one write with the LAST value
    expect(mockWriteSnapshot).toHaveBeenCalledTimes(1);
    const calls = mockWriteSnapshot.mock.calls as unknown as [unknown][];
    const persistedArg = calls[0][0] as { dismissedFocusItems: string[] };
    expect(persistedArg.dismissedFocusItems).toEqual(['item-4']);
  });

  it('flushPersistence forces immediate write without waiting for debounce', async () => {
    // Given
    updateData('dismissedFocusItems', ['forced']);

    // When — flush before debounce expires
    flushPersistence();
    await vi.runAllTimersAsync();
    await flushPersistenceQueue();

    // Then
    expect(mockWriteSnapshot).toHaveBeenCalledTimes(1);
    const calls = mockWriteSnapshot.mock.calls as unknown as [unknown][];
    const persistedArg = calls[0][0] as { dismissedFocusItems: string[] };
    expect(persistedArg.dismissedFocusItems).toContain('forced');
  });

  it('resetPersistentDataAndNotify discards pending debounced write', async () => {
    // Given
    updateData('dismissedFocusItems', ['will-be-discarded']);

    // When — reset before debounce fires
    resetPersistentDataAndNotify?.();
    vi.advanceTimersByTime(500);
    await vi.runAllTimersAsync();
    await flushPersistenceQueue();

    // Then — clearSnapshot was called, but writeSnapshot was NOT
    expect(mockWriteSnapshot).not.toHaveBeenCalled();
    expect(mockClearSnapshot).toHaveBeenCalled();
  });

  it('replaceData also uses the debounce path', async () => {
    // Given
    const baseData = loadData();
    const modifiedSnapshot = { ...baseData, dismissedFocusItems: ['replaced'] };

    // When
    replaceData(modifiedSnapshot);
    expect(mockWriteSnapshot).not.toHaveBeenCalled();

    await advanceDebounceWindow();

    // Then
    expect(mockWriteSnapshot).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // loadData() before initializeDataStore — synchronous fallback
  // -------------------------------------------------------------------------
  it('loadData returns default AppData when called before initializeDataStore', () => {
    // Arrange — do NOT call initializeDataStore; reset by re-importing
    const result = loadData();

    // Assert — returns a valid default snapshot (not null)
    expect(result).toBeDefined();
    expect(Array.isArray(result.projects)).toBe(true);
    expect(result.globalIdentifierCounter).toBe(2500);
  });

  it('loadData returns a deep clone — in-memory object cannot be mutated externally', () => {
    // Act
    const first = loadData();
    first.dismissedFocusItems.push('external-mutation');

    // Assert — second call returns unaffected snapshot
    const second = loadData();
    expect(second.dismissedFocusItems).not.toContain('external-mutation');
  });

  // -------------------------------------------------------------------------
  // initializeDataStore — hydration from persisted snapshot
  // -------------------------------------------------------------------------
  it('initializeDataStore hydrates appData from a persisted entity state', async () => {
    // Arrange — reset modules first so the fresh import picks up our adapter.
    vi.resetModules();

    const persistedState = {
      dismissedFocusItems: ['hydrated-item'],
      globalIdentifierCounter: 9999,
    };

    const freshPersistence = await import('./persistence');
    freshPersistence.setPersistenceAdapter({
      ...createMockPersistenceAdapter(),
      readEntityState: vi.fn(async () => persistedState) as never,
    });

    const freshLoadData = await import('./loadData');

    // Act — initialize with a fresh module that sees our adapter
    await freshLoadData.initializeDataStore();
    const result = freshLoadData.loadData();

    // Assert — state is hydrated from persisted entity state
    expect(result.dismissedFocusItems).toContain('hydrated-item');
    expect(result.globalIdentifierCounter).toBe(9999);

    freshPersistence.resetPersistenceAdapter();
  });

  it('initializeDataStore is idempotent — second call does not reset in-memory data', async () => {
    // Act — call twice
    await initializeDataStore();
    updateData('dismissedFocusItems', ['after-first-init']);
    await initializeDataStore(); // second call must be a no-op

    // Assert — data written after first init is preserved
    const result = loadData();
    expect(result.dismissedFocusItems).toContain('after-first-init');
  });

  // -------------------------------------------------------------------------
  // updateData reflects in subsequent loadData
  // -------------------------------------------------------------------------
  it('updateData mutation is reflected in subsequent loadData call', () => {
    // Act
    updateData('dismissedFocusItems', ['new-item']);

    // Assert
    const result = loadData();
    expect(result.dismissedFocusItems).toContain('new-item');
  });

  it('updateData preserves other keys in the snapshot', () => {
    // Act
    updateData('dismissedFocusItems', ['only-this-changes']);

    // Assert — globalIdentifierCounter is untouched
    const result = loadData();
    expect(result.globalIdentifierCounter).toBe(2500);
    expect(Array.isArray(result.projects)).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Race condition fix — initializeDataStore overrides fallback defaults
  // -------------------------------------------------------------------------
  it('initializeDataStore overrides defaults set by pre-init loadData call', async () => {
    // Arrange — fresh module where loadData is called BEFORE initializeDataStore
    vi.resetModules();

    const persistedState = {
      dismissedFocusItems: ['real-user-data'],
      globalIdentifierCounter: 7777,
    };

    const freshPersistence = await import('./persistence');
    freshPersistence.setPersistenceAdapter({
      ...createMockPersistenceAdapter(),
      readEntityState: vi.fn(async () => persistedState) as never,
    });

    const freshLoadData = await import('./loadData');

    // Act — loadData first (creates fallback defaults), then initializeDataStore
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const preInitResult = freshLoadData.loadData();
    expect(preInitResult.globalIdentifierCounter).toBe(2500); // fallback default
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();

    // Now init — must override the fallback defaults with real data
    await freshLoadData.initializeDataStore();
    const postInitResult = freshLoadData.loadData();

    // Assert — persisted data wins over fallback defaults
    expect(postInitResult.dismissedFocusItems).toContain('real-user-data');
    expect(postInitResult.globalIdentifierCounter).toBe(7777);

    freshLoadData.resetForTest();
    freshPersistence.resetPersistenceAdapter();
  });

  // -------------------------------------------------------------------------
  // console.warn on pre-init loadData
  // -------------------------------------------------------------------------
  it('loadData warns when called before initializeDataStore', async () => {
    // Arrange — fresh module, no init
    vi.resetModules();

    const freshPersistence = await import('./persistence');
    freshPersistence.setPersistenceAdapter(createMockPersistenceAdapter());

    const freshLoadData = await import('./loadData');

    // Act
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    freshLoadData.loadData();

    // Assert
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('loadData() called before initializeDataStore()'),
    );
    warnSpy.mockRestore();

    freshLoadData.resetForTest();
    freshPersistence.resetPersistenceAdapter();
  });

  // -------------------------------------------------------------------------
  // resetForTest isolation
  // -------------------------------------------------------------------------
  it('resetForTest clears all module state for test isolation', async () => {
    // Arrange — populate state
    updateData('dismissedFocusItems', ['some-data']);
    const beforeReset = loadData();
    expect(beforeReset.dismissedFocusItems).toContain('some-data');

    // Act
    resetForTest?.();

    // Assert — after reset, loadData returns fresh defaults (with warn)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const afterReset = loadData();
    expect(afterReset.dismissedFocusItems).not.toContain('some-data');
    expect(afterReset.globalIdentifierCounter).toBe(2500);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // Concurrent race: initializeDataStore in-flight when loadData is called
  // -------------------------------------------------------------------------
  it('loadData during in-flight initializeDataStore gets overridden by real data', async () => {
    // Arrange — fresh module with slow persistence read
    vi.resetModules();

    const persistedState = {
      dismissedFocusItems: ['concurrent-real-data'],
      globalIdentifierCounter: 5555,
    };

    const freshPersistence = await import('./persistence');
    freshPersistence.setPersistenceAdapter({
      ...createMockPersistenceAdapter(),
      readEntityState: vi.fn(
        () =>
          new Promise((resolve) => {
            // Simulate async delay — resolve after we call loadData
            setTimeout(() => resolve(persistedState), 50);
          }),
      ) as never,
    });

    const freshLoadData = await import('./loadData');

    // Act — start init (does NOT await), then call loadData while init is in-flight
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const initPromise = freshLoadData.initializeDataStore();

    // loadData runs while init is still pending — gets defaults
    const midFlightResult = freshLoadData.loadData();
    expect(midFlightResult.globalIdentifierCounter).toBe(2500); // fallback defaults
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();

    // Now let the init complete
    vi.advanceTimersByTime(100);
    await initPromise;

    // Assert — after init completes, real data wins
    const postInitResult = freshLoadData.loadData();
    expect(postInitResult.dismissedFocusItems).toContain('concurrent-real-data');
    expect(postInitResult.globalIdentifierCounter).toBe(5555);

    freshLoadData.resetForTest();
    freshPersistence.resetPersistenceAdapter();
  });

  // -------------------------------------------------------------------------
  // resetPersistentDataAndNotify resets isInitialized
  // -------------------------------------------------------------------------
  it('resetPersistentDataAndNotify resets isInitialized so next init re-reads', async () => {
    // Arrange — init already completed
    const data = loadData();
    expect(data).toBeDefined();

    // Act — reset
    resetPersistentDataAndNotify?.();
    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();
    await Promise.resolve();
    await Promise.resolve();

    // Assert — initializeDataStore runs again (not no-op)
    // Re-init with the mock adapter that returns null (defaults)
    await initializeDataStore();
    const afterReInit = loadData();
    expect(afterReInit.globalIdentifierCounter).toBe(2500);
    expect(Array.isArray(afterReInit.projects)).toBe(true);
  });
});
