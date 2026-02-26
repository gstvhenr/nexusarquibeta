import type { AppData } from './loadData';
import { createPersistenceAdapter, type BackupMetadata } from './persistence';

const persistence = createPersistenceAdapter();

const AUTO_BACKUP_INTERVAL_MS = 6 * 60 * 60 * 1000;
const AUTO_BACKUP_MAX_ENTRIES = 10;

const serializePayload = (payload: unknown): string => {
  try {
    return JSON.stringify(payload) ?? '';
  } catch {
    return '';
  }
};

const hashPayload = (payload: unknown): string => {
  const text = serializePayload(payload);
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16);
};

const shouldCreateAutomaticBackup = (
  latestBackup: BackupMetadata | undefined,
  nextHash: string,
): boolean => {
  if (!latestBackup) {
    return true;
  }

  if (latestBackup.hash === nextHash) {
    return false;
  }

  return Date.now() - latestBackup.createdAt >= AUTO_BACKUP_INTERVAL_MS;
};

async function maybeCreateAutomaticBackup(snapshot: AppData): Promise<void> {
  const backups = await persistence.listBackups();
  const latestBackup = backups[0];
  const nextHash = hashPayload(snapshot);

  if (!shouldCreateAutomaticBackup(latestBackup, nextHash)) {
    return;
  }

  await persistence.writeBackup(snapshot, {
    reason: 'auto',
    maxEntries: AUTO_BACKUP_MAX_ENTRIES,
  });
}

async function createManualBackup(snapshot: AppData): Promise<BackupMetadata> {
  return persistence.writeBackup(snapshot, {
    reason: 'manual',
    maxEntries: AUTO_BACKUP_MAX_ENTRIES,
  });
}

async function listBackups(): Promise<BackupMetadata[]> {
  return persistence.listBackups();
}

async function restoreBackup(id: string): Promise<AppData | null> {
  const backup = await persistence.readBackup<AppData>(id);
  return backup?.payload ?? null;
}

async function clearBackups(): Promise<void> {
  await persistence.clearBackups();
}

export const autoBackupService = {
  maybeCreateAutomaticBackup,
  createManualBackup,
  listBackups,
  restoreBackup,
  clearBackups,
};
