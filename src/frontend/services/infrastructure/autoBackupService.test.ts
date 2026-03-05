import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppData } from '../../types';
import type { BackupMetadata, BackupRecord, PersistencePort } from './persistence';

// ---------------------------------------------------------------------------
// Constants mirrored from the module under test (avoids importing private state)
// ---------------------------------------------------------------------------
const AUTO_BACKUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

// ---------------------------------------------------------------------------
// Hoisted mocks — created before vi.mock factories run
// ---------------------------------------------------------------------------
const {
  mockListBackups,
  mockWriteBackup,
  mockReadBackup,
  mockClearBackups,
} = vi.hoisted(() => ({
  mockListBackups: vi.fn<() => Promise<BackupMetadata[]>>(),
  mockWriteBackup: vi.fn<(payload: unknown, options: unknown) => Promise<BackupMetadata>>(),
  mockReadBackup: vi.fn<(id: string) => Promise<BackupRecord<unknown> | null>>(),
  mockClearBackups: vi.fn<() => Promise<void>>(),
}));

// Factory that satisfies the full PersistencePort interface.
// Only backup-related methods need real implementations; the rest are stubs.
const createMockPersistenceAdapter = (): PersistencePort => ({
  isSupported: () => true,
  readSnapshot: vi.fn(async () => null),
  writeSnapshot: vi.fn(async () => { }),
  clearSnapshot: vi.fn(async () => { }),
  readEntityState: vi.fn(async () => null),
  writeEntityState: vi.fn(async () => { }),
  readPreference: vi.fn(async () => null),
  writePreference: vi.fn(async () => { }),
  removePreference: vi.fn(async () => { }),
  listBackups: mockListBackups,
  writeBackup: mockWriteBackup,
  readBackup: mockReadBackup as never,
  clearBackups: mockClearBackups,
  reserveGlobalIdentifier: vi.fn(async () => ({ reservedValue: 2500, nextValue: 2501 })),
});

// createPersistenceAdapter is called at module-level in autoBackupService.ts.
// We replace it here so the singleton is our mock instance.
vi.mock('./persistence', () => ({
  createPersistenceAdapter: () => createMockPersistenceAdapter(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeSnapshot = (partial: Partial<AppData> = {}): AppData =>
  ({
    projects: [],
    proposals: [],
    clients: [],
    documentStorage: {} as AppData['documentStorage'],
    suppliers: [],
    products: [],
    supplierProductPrices: [],
    quotations: [],
    commissions: [],
    marketingProfessionals: [],
    marketingActivities: [],
    marketingIdeas: [],
    socialNetworks: [],
    freelancers: [],
    agendaEvents: [],
    manualExpenses: [],
    manualIncomes: [],
    customBudgetTemplate: null,
    globalIdentifierCounter: 2500,
    dismissedFocusItems: [],
    acceptedPaymentMethods: [],
    hiredServices: [],
    prospects: [],
    contractDeadlines: { defaultPreliminarDeadlineDays: 7, defaultExecutiveDeadlineDays: 30 },
    cashBoxExpenses: [],
    cashBoxCredits: [],
    reminders: [],
    ...partial,
  }) as AppData;

const makeBackupMetadata = (partial: Partial<BackupMetadata> = {}): BackupMetadata => ({
  id: 'backup-01',
  createdAt: Date.now() - AUTO_BACKUP_INTERVAL_MS - 1,
  sizeBytes: 100,
  hash: 'deadbeef',
  reason: 'auto',
  ...partial,
});

// ---------------------------------------------------------------------------
// Module under test (dynamic import so vi.mock is guaranteed to be applied)
// ---------------------------------------------------------------------------
type AutoBackupServiceModule = typeof import('./autoBackupService');
let autoBackupService: AutoBackupServiceModule['autoBackupService'];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('autoBackupService', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();

    const module: AutoBackupServiceModule = await import('./autoBackupService');
    autoBackupService = module.autoBackupService;

    // Default: no existing backups
    mockListBackups.mockResolvedValue([]);
    mockWriteBackup.mockResolvedValue(
      makeBackupMetadata({ id: 'new-backup', hash: 'abcdef01' }),
    );
    mockClearBackups.mockResolvedValue(undefined);
    mockReadBackup.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // maybeCreateAutomaticBackup
  // -------------------------------------------------------------------------
  describe('maybeCreateAutomaticBackup', () => {
    it('creates a backup when no previous backups exist', async () => {
      // Arrange — empty backup list
      mockListBackups.mockResolvedValue([]);
      const snapshot = makeSnapshot();

      // Act
      await autoBackupService.maybeCreateAutomaticBackup(snapshot);

      // Assert — first backup is always created
      expect(mockWriteBackup).toHaveBeenCalledTimes(1);
      expect(mockWriteBackup).toHaveBeenCalledWith(snapshot, {
        reason: 'auto',
        maxEntries: 10,
      });
    });

    it('does NOT create a backup when the payload hash matches the latest backup', async () => {
      // Arrange — build a snapshot and compute its expected hash manually
      const snapshot = makeSnapshot({ dismissedFocusItems: ['seed-item'] });

      // Compute the same hash the service uses internally
      const text = JSON.stringify(snapshot) ?? '';
      let hash = 0;
      for (let i = 0; i < text.length; i += 1) {
        hash = (hash * 31 + text.charCodeAt(i)) | 0;
      }
      const expectedHash = Math.abs(hash).toString(16);

      // Latest backup has the SAME hash
      mockListBackups.mockResolvedValue([
        makeBackupMetadata({
          hash: expectedHash,
          createdAt: Date.now() - AUTO_BACKUP_INTERVAL_MS - 1, // old enough
        }),
      ]);

      // Act
      await autoBackupService.maybeCreateAutomaticBackup(snapshot);

      // Assert — identical data must not produce a duplicate backup
      expect(mockWriteBackup).not.toHaveBeenCalled();
    });

    it('creates a backup when hash differs AND the interval has elapsed', async () => {
      // Arrange — latest backup is old and has a different hash
      mockListBackups.mockResolvedValue([
        makeBackupMetadata({
          hash: 'old-hash',
          createdAt: Date.now() - AUTO_BACKUP_INTERVAL_MS - 1,
        }),
      ]);
      const snapshot = makeSnapshot({ dismissedFocusItems: ['changed'] });

      // Act
      await autoBackupService.maybeCreateAutomaticBackup(snapshot);

      // Assert
      expect(mockWriteBackup).toHaveBeenCalledTimes(1);
      expect(mockWriteBackup).toHaveBeenCalledWith(snapshot, {
        reason: 'auto',
        maxEntries: 10,
      });
    });

    it('does NOT create a backup when hash differs but interval has NOT elapsed', async () => {
      // Arrange — latest backup is too recent (only 1ms old)
      mockListBackups.mockResolvedValue([
        makeBackupMetadata({
          hash: 'old-hash',
          createdAt: Date.now() - 1,
        }),
      ]);
      const snapshot = makeSnapshot({ dismissedFocusItems: ['changed'] });

      // Act
      await autoBackupService.maybeCreateAutomaticBackup(snapshot);

      // Assert — throttled; interval not met
      expect(mockWriteBackup).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // createManualBackup
  // -------------------------------------------------------------------------
  describe('createManualBackup', () => {
    it('delegates to persistence.writeBackup with reason "manual" and returns the metadata', async () => {
      // Arrange
      const snapshot = makeSnapshot();
      const expectedMetadata = makeBackupMetadata({ reason: 'manual' });
      mockWriteBackup.mockResolvedValue(expectedMetadata);

      // Act
      const result = await autoBackupService.createManualBackup(snapshot);

      // Assert
      expect(mockWriteBackup).toHaveBeenCalledWith(snapshot, {
        reason: 'manual',
        maxEntries: 10,
      });
      expect(result).toStrictEqual(expectedMetadata);
    });
  });

  // -------------------------------------------------------------------------
  // listBackups
  // -------------------------------------------------------------------------
  describe('listBackups', () => {
    it('returns the list of backup metadata from persistence', async () => {
      // Arrange
      const backups = [makeBackupMetadata(), makeBackupMetadata({ id: 'backup-02' })];
      mockListBackups.mockResolvedValue(backups);

      // Act
      const result = await autoBackupService.listBackups();

      // Assert
      expect(mockListBackups).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(backups);
    });

    it('returns an empty array when there are no backups', async () => {
      // Arrange
      mockListBackups.mockResolvedValue([]);

      // Act
      const result = await autoBackupService.listBackups();

      // Assert
      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // restoreBackup
  // -------------------------------------------------------------------------
  describe('restoreBackup', () => {
    it('returns the payload of the found backup', async () => {
      // Arrange
      const snapshot = makeSnapshot({ dismissedFocusItems: ['restored-item'] });
      const backupRecord: BackupRecord<AppData> = {
        id: 'backup-01',
        createdAt: Date.now(),
        payload: snapshot,
        sizeBytes: 200,
        hash: 'abc123',
        reason: 'manual',
      };
      mockReadBackup.mockResolvedValue(backupRecord);

      // Act
      const result = await autoBackupService.restoreBackup('backup-01');

      // Assert
      expect(mockReadBackup).toHaveBeenCalledWith('backup-01');
      expect(result).toStrictEqual(snapshot);
    });

    it('returns null when the backup is not found', async () => {
      // Arrange
      mockReadBackup.mockResolvedValue(null);

      // Act
      const result = await autoBackupService.restoreBackup('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // clearBackups
  // -------------------------------------------------------------------------
  describe('clearBackups', () => {
    it('delegates to persistence.clearBackups and resolves', async () => {
      // Act
      await autoBackupService.clearBackups();

      // Assert
      expect(mockClearBackups).toHaveBeenCalledTimes(1);
    });

    it('returns void (does not return a value)', async () => {
      // Arrange
      mockClearBackups.mockResolvedValue(undefined);

      // Act
      const result = await autoBackupService.clearBackups();

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
