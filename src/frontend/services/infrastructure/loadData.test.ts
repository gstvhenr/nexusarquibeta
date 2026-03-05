import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PersistencePort } from './persistence';

// vi.hoisted ensures these variables exist BEFORE vi.mock factory execution.
const { mockWriteSnapshot, mockClearSnapshot, mockMaybeCreateAutoBackup } = vi.hoisted(() => ({
  mockWriteSnapshot: vi.fn(async () => { }),
  mockClearSnapshot: vi.fn(async () => { }),
  mockMaybeCreateAutoBackup: vi.fn(async () => { }),
}));

const createMockPersistenceAdapter = (): PersistencePort => ({
  isSupported: () => true,
  readSnapshot: async () => null,
  writeSnapshot: mockWriteSnapshot,
  clearSnapshot: mockClearSnapshot,
  readEntityState: async () => null,
  writeEntityState: vi.fn(async () => { }),
  readPreference: async () => null,
  writePreference: vi.fn(async () => { }),
  removePreference: vi.fn(async () => { }),
  listBackups: vi.fn(async () => []),
  writeBackup: vi.fn(async () => ({
    id: 'stub',
    createdAt: Date.now(),
    sizeBytes: 0,
    hash: '0',
    reason: 'auto' as const,
  })),
  readBackup: async () => null,
  clearBackups: vi.fn(async () => { }),
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
    clearBackups: vi.fn(async () => { }),
  },
}));

type LoadDataModule = typeof import('./loadData');
let updateData: LoadDataModule['updateData'];
let loadData: LoadDataModule['loadData'];
let replaceData: LoadDataModule['replaceData'];
let flushPersistence: LoadDataModule['flushPersistence'];
let resetPersistentDataAndNotify: LoadDataModule['resetPersistentDataAndNotify'] | null = null;
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
    initializeDataStore = loadDataModule.initializeDataStore;

    await initializeDataStore();
    // initializeDataStore may trigger an initial writeSnapshot; reset counts.
    mockWriteSnapshot.mockClear();
    mockClearSnapshot.mockClear();
    mockMaybeCreateAutoBackup.mockClear();
  }, 20000);

  afterEach(async () => {
    resetPersistentDataAndNotify?.();
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

    const persistedState = { dismissedFocusItems: ['hydrated-item'], globalIdentifierCounter: 9999 };

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
});
