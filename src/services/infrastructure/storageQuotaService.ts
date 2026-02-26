/**
 * Input -> Output:
 * - input: none (reads persisted snapshot metrics and AppData).
 * - output: quota diagnostics and backup blobs for data safety.
 * Example:
 *   const usage = storageQuotaService.getStorageUsage();
 *   if (storageQuotaService.isNearQuota()) { alert('Storage almost full!'); }
 */

import { exportData, importData } from './importExport';
import { createPersistenceAdapter, type BackupMetadata } from './persistence';
import { autoBackupService } from './autoBackupService';
import type { AppData } from './loadData';

const persistence = createPersistenceAdapter();

/** Shape returned by getStorageUsage(). */
export interface StorageUsageInfo {
  /** Bytes currently used by the serialized AppData snapshot. */
  usedBytes: number;
  /** Estimated total capacity in bytes. Falls back to 5MB default. */
  totalBytes: number;
  /** Usage as a percentage (0–100). */
  usagePercent: number;
}

const DEFAULT_STORAGE_CAPACITY_BYTES = 5 * 1024 * 1024; // 5 MB conservative default
const INDEXED_DB_CONSERVATIVE_CAPACITY_BYTES = 50 * 1024 * 1024; // 50 MB conservative baseline

const countUtf8Bytes = (text: string): number => new Blob([text]).size;

/**
 * Input -> Output:
 * - input: none (estimates persisted snapshot usage by exported payload size).
 * - output: StorageUsageInfo with used, total, and percent.
 * Example:
 *   const { usedBytes, usagePercent } = storageQuotaService.getStorageUsage();
 */
function getStorageUsage(): StorageUsageInfo {
  const snapshotJson = exportData();
  const usedBytes = countUtf8Bytes(snapshotJson);
  const totalBytes = persistence.isSupported()
    ? INDEXED_DB_CONSERVATIVE_CAPACITY_BYTES
    : DEFAULT_STORAGE_CAPACITY_BYTES;
  const usagePercent = totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0;

  return { usedBytes, totalBytes, usagePercent };
}

/**
 * Input -> Output:
 * - input: thresholdPercent (default 80).
 * - output: true if storage usage exceeds the threshold.
 * Example:
 *   if (storageQuotaService.isNearQuota(90)) { ... }
 */
function isNearQuota(thresholdPercent = 80): boolean {
  const { usagePercent } = getStorageUsage();
  return usagePercent >= thresholdPercent;
}

/**
 * Input -> Output:
 * - input: none (reads all AppData via exportData).
 * - output: Blob containing full JSON backup, ready for download.
 * Example:
 *   const blob = storageQuotaService.exportBackupBlob();
 *   const url = URL.createObjectURL(blob);
 */
function exportBackupBlob(): Blob {
  const jsonString = exportData();
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Input -> Output:
 * - input: Blob containing a JSON backup (as produced by exportBackupBlob).
 * - output: Promise<void> — imports the data into the application state.
 * Example:
 *   await storageQuotaService.importBackupBlob(file);
 */
async function importBackupBlob(blob: Blob): Promise<void> {
  const text = await readBlobAsText(blob);
  importData(text);
}

/** Read blob content as text, with fallback for environments lacking Blob.text(). */
function readBlobAsText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') {
    return blob.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

/**
 * Input -> Output:
 * - input: filename (default: auto-generated with timestamp).
 * - output: void — triggers a browser download of the backup file.
 * Example:
 *   storageQuotaService.downloadBackup(); // downloads nexus-backup-2026-02-16.json
 */
function downloadBackup(filename?: string): void {
  const blob = exportBackupBlob();
  const defaultFilename = `nexus-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const finalFilename = filename ?? defaultFilename;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = finalFilename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Input -> Output:
 * - input: none.
 * - output: list of automatic/manual indexed backups metadata (newest first).
 */
async function listIndexedBackups(): Promise<BackupMetadata[]> {
  return autoBackupService.listBackups();
}

/**
 * Input -> Output:
 * - input: backup id.
 * - output: Promise<void> after restoring AppData from indexed backup.
 */
async function restoreIndexedBackup(id: string): Promise<void> {
  const backupPayload = await autoBackupService.restoreBackup(id);
  if (!backupPayload) {
    throw new Error('Backup não encontrado para restauração.');
  }
  importData(JSON.stringify(backupPayload));
}

/**
 * Input -> Output:
 * - input: none.
 * - output: metadata of a manually created indexed backup.
 */
async function createManualIndexedBackup(): Promise<BackupMetadata> {
  const snapshot = JSON.parse(exportData()) as AppData;
  return autoBackupService.createManualBackup(snapshot);
}

export const storageQuotaService = {
  getStorageUsage,
  isNearQuota,
  exportBackupBlob,
  importBackupBlob,
  downloadBackup,
  listIndexedBackups,
  restoreIndexedBackup,
  createManualIndexedBackup,
};
