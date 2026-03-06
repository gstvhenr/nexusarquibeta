import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { storageQuotaService } from './storageQuotaService';
import { api } from './api';
import { indexedDbService } from './indexedDbService';

const waitForAsyncQueue = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('storageQuotaService', () => {
  beforeEach(async () => {
    api.clearAllData();
    vi.clearAllMocks();
    await indexedDbService.clearAutomaticBackups();
    await waitForAsyncQueue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getStorageUsage
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getStorageUsage', () => {
    it('returns a valid usage report for persisted app snapshot', () => {
      // Given
      // app data is initialized by the test setup

      // When
      const result = storageQuotaService.getStorageUsage();

      // Then
      expect(result.usedBytes).toBeGreaterThan(0);
      expect(result.totalBytes).toBeGreaterThan(0);
      expect(result.usagePercent).toBeGreaterThanOrEqual(0);
      expect(result.usagePercent).toBeLessThanOrEqual(100);
    });

    it('reports higher usage after importing a larger payload', () => {
      // Given
      const before = storageQuotaService.getStorageUsage().usedBytes;
      const largeClientName = 'X'.repeat(20_000);

      // When
      api.importData(
        JSON.stringify({
          clients: [{ id: 'load-test-client', name: largeClientName }],
        }),
      );
      const after = storageQuotaService.getStorageUsage().usedBytes;

      // Then
      expect(after).toBeGreaterThan(before);
    });

    it('documents the capacity used (fallback path — jsdom does not support IndexedDB)', () => {
      // Given — in the jsdom test environment the persistence adapter reports
      // isSupported() = false at module-load time, so the 5 MB conservative
      // default is used. This test pins the boundary value so any change to
      // the capacity constants triggers an explicit failure.
      const DEFAULT_STORAGE_CAPACITY_BYTES = 5 * 1024 * 1024; // 5 MB

      // When
      const { totalBytes } = storageQuotaService.getStorageUsage();

      // Then
      expect(totalBytes).toBe(DEFAULT_STORAGE_CAPACITY_BYTES);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // isNearQuota
  // ─────────────────────────────────────────────────────────────────────────────

  describe('isNearQuota', () => {
    it('returns false with a high threshold', () => {
      // Given
      const threshold = 100;

      // When
      const result = storageQuotaService.isNearQuota(threshold);

      // Then
      expect(result).toBe(false);
    });

    it('returns true when threshold is zero', () => {
      // Given
      const threshold = 0;

      // When
      const result = storageQuotaService.isNearQuota(threshold);

      // Then
      expect(result).toBe(true);
    });

    it('uses default threshold of 80 when no argument is provided (empty state is below quota)', () => {
      // Given — fresh clear state produces very low usage, well below 80 %
      api.clearAllData();

      // When — called with no argument, default is 80
      const result = storageQuotaService.isNearQuota();

      // Then — an empty AppData JSON is far below 80 % of 50 MB
      expect(result).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // exportBackupBlob
  // ─────────────────────────────────────────────────────────────────────────────

  describe('exportBackupBlob', () => {
    it('returns a Blob with application/json type', () => {
      // Given
      // app state is serializable as JSON backup

      // When
      const blob = storageQuotaService.exportBackupBlob();

      // Then
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });

    it('blob size is positive for non-empty export', () => {
      // Given
      // app state export should produce non-empty JSON

      // When
      const blob = storageQuotaService.exportBackupBlob();

      // Then
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // importBackupBlob
  // ─────────────────────────────────────────────────────────────────────────────

  describe('importBackupBlob', () => {
    it('imports blob content into AppData snapshot via Blob.text()', async () => {
      // Given
      const jsonContent = JSON.stringify({ projects: [{ id: '1' }] });
      const encoder = new TextEncoder();
      const blob = new Blob([encoder.encode(jsonContent)], { type: 'application/json' });

      // When
      await storageQuotaService.importBackupBlob(blob);
      const projects = api.getData().projects;

      // Then
      expect(projects).toEqual([{ id: '1' }]);
    });

    it('falls back to FileReader when Blob.text is not available', async () => {
      // Given — simulate an environment where blob.text() does not exist
      const jsonContent = JSON.stringify({ clients: [{ id: 'reader-fallback' }] });
      const blob = new Blob([jsonContent], { type: 'application/json' });
      // Remove the native .text method to force the FileReader branch
      Object.defineProperty(blob, 'text', { value: undefined, configurable: true });

      // When
      await storageQuotaService.importBackupBlob(blob);
      const clients = api.getData().clients;

      // Then
      expect(clients).toEqual([{ id: 'reader-fallback' }]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // downloadBackup
  // ─────────────────────────────────────────────────────────────────────────────

  describe('downloadBackup', () => {
    beforeEach(() => {
      if (!URL.createObjectURL) {
        URL.createObjectURL = vi.fn();
      }
      if (!URL.revokeObjectURL) {
        URL.revokeObjectURL = vi.fn();
      }
    });

    it('triggers a download via anchor click', () => {
      // Given
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      // When
      storageQuotaService.downloadBackup('my-backup.json');

      // Then
      expect(clickSpy).toHaveBeenCalled();
    });

    it('sets correct href and download attributes on the anchor element', () => {
      // Given
      const capturedAnchors: HTMLAnchorElement[] = [];
      const originalCreate = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = originalCreate(tag);
        if (tag === 'a') capturedAnchors.push(el as HTMLAnchorElement);
        return el;
      });
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      // When
      storageQuotaService.downloadBackup('custom-name.json');
      const anchor = capturedAnchors[0];

      // Then
      expect(anchor?.href).toContain('blob:mock-url');
      expect(anchor?.download).toBe('custom-name.json');
    });

    it('does not throw when called without filename', () => {
      // Given
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      // When / Then
      expect(() => storageQuotaService.downloadBackup()).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // indexed backups
  // ─────────────────────────────────────────────────────────────────────────────

  describe('indexed backups', () => {
    it('creates and lists manual indexed backups', async () => {
      // Given
      api.importData(JSON.stringify({ projects: [{ id: 'project-manual-backup' }] }));

      // When
      const backupMetadata = await storageQuotaService.createManualIndexedBackup();
      const backups = await storageQuotaService.listIndexedBackups();

      // Then
      expect(backupMetadata.id).toContain('backup-');
      expect(backups[0]?.id).toBe(backupMetadata.id);
    });

    it('restores AppData from indexed backup by id', async () => {
      // Given
      api.importData(JSON.stringify({ projects: [{ id: 'project-before-reset' }] }));
      const backupMetadata = await storageQuotaService.createManualIndexedBackup();
      api.clearAllData();
      await waitForAsyncQueue();

      // When
      await storageQuotaService.restoreIndexedBackup(backupMetadata.id);
      const projects = api.getData().projects;

      // Then
      expect(projects).toEqual([{ id: 'project-before-reset' }]);
    });

    it('throws when restoring an indexed backup with a non-existent id', async () => {
      // Given — no backup with this id has been created
      const nonExistentId = 'backup-does-not-exist-999';

      // When / Then
      await expect(storageQuotaService.restoreIndexedBackup(nonExistentId)).rejects.toThrow(
        'Backup não encontrado para restauração.',
      );
    });
  });
});
