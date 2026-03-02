import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  });

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
  });

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

  describe('importBackupBlob', () => {
    it('imports blob content into AppData snapshot', async () => {
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
  });

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

      clickSpy.mockRestore();
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
  });
});
