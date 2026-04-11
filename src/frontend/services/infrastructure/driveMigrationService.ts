/**
 * Input -> Output:
 * - input: DriveAccessMode ('local' | 'api').
 * - output: detects if legacy monolithic snapshot (nexus-data.json) exists, and migrates it to the new granular JSON format.
 */

import { driveDataAdapter } from './driveDataAdapter';
import { googleDriveService } from './googleDriveService';
import { localDriveService } from './localDriveService';
import type { AppData } from './loadData';
import {
  ARRAY_DOMAIN_KEYS,
  SCALAR_CONFIG_KEYS,
  BACKUPS_FOLDER_NAME,
  type DriveAccessMode,
  type SyncMetaFile,
} from './driveSyncTypes';

const LEGACY_SNAPSHOT_FILE = 'nexus-data.json';

/**
 * Checks if the legacy monolithic file exists.
 */
async function legacySnapshotExists(mode: DriveAccessMode): Promise<boolean> {
  switch (mode) {
    case 'local':
      return localDriveService.fileExists(LEGACY_SNAPSHOT_FILE);
    case 'api':
      // The old googleDriveService implementation placed it in the root folder
      try {
        const info = await googleDriveService.getLastSyncInfo();
        return info !== null;
      } catch {
        return false;
      }
    case 'none':
      return false;
  }
}

/**
 * Downloads the legacy monolithic snapshot.
 */
async function downloadLegacySnapshot(mode: DriveAccessMode): Promise<AppData | null> {
  switch (mode) {
    case 'local': {
      const content = await localDriveService.readFile(LEGACY_SNAPSHOT_FILE);
      if (!content) return null;
      try {
        return JSON.parse(content) as AppData;
      } catch {
        return null;
      }
    }
    case 'api':
      return googleDriveService.downloadSnapshot<AppData>();
    case 'none':
      return null;
  }
}

/**
 * Executes the migration process:
 * 1. Checks if granular DB is already initialized (has _meta.json).
 * 2. If not, checks if legacy snapshot exists.
 * 3. If yes, downloads it and splits it into the new domain JSON files.
 * 4. Pushes the initial _meta.json to mark migration as completed.
 *
 * Returns true if a migration was performed, false otherwise.
 */
async function migrateIfNecessary(mode: DriveAccessMode): Promise<boolean> {
  if (mode === 'none') return false;

  // 1. Check if already migrated
  const isInitialized = await driveDataAdapter.hasBeenInitialized(mode);
  if (isInitialized) return false;

  // 2. Check if legacy data exists
  const hasLegacy = await legacySnapshotExists(mode);
  if (!hasLegacy) return false;

  // 3. Download legacy data
  const legacyData = await downloadLegacySnapshot(mode);
  if (!legacyData) {
    console.warn('[DriveMigration] Failed to parse legacy snapshot, aborting migration.');
    return false;
  }

  // 4. Split and write directly into the new granular format
  const domainsObj = legacyData as unknown as Record<string, unknown>;

  const initialMeta: SyncMetaFile = {
    version: 1,
    lastFullSync: new Date().toISOString(),
    domains: {},
  };

  // Write array domains
  for (const key of ARRAY_DOMAIN_KEYS) {
    if (domainsObj[key] !== undefined) {
      const checksum = await driveDataAdapter.writeDomain(mode, key, domainsObj[key]);
      const content = JSON.stringify(domainsObj[key], null, 2);
      initialMeta.domains[key] = {
        checksum,
        lastModified: Date.now(),
        sizeBytes: new Blob([content]).size,
        recordCount: Array.isArray(domainsObj[key]) ? (domainsObj[key] as unknown[]).length : 1,
      };
    }
  }

  // Write scalar configs
  const scalarMap: Record<string, unknown> = {};
  for (const key of SCALAR_CONFIG_KEYS) {
    if (domainsObj[key] !== undefined) {
      scalarMap[key] = domainsObj[key];
    }
  }
  if (Object.keys(scalarMap).length > 0) {
    await driveDataAdapter.writeConfig(mode, scalarMap);
  }

  // 5. Commit migration by writing the _meta.json
  await driveDataAdapter.writeMeta(mode, initialMeta);

  // 6. Security Hygiene: Rename the legacy snapshot to a backup file
  try {
    const backupFileName = `nexus-data.backup-${new Date().toISOString().split('T')[0]}.json`;
    const backupContent = JSON.stringify(domainsObj, null, 2);
    // Write backup
    await driveDataAdapter.writeRawFile(
      mode,
      `${BACKUPS_FOLDER_NAME}/${backupFileName}`,
      backupContent,
    );
    // Delete original
    await driveDataAdapter.deleteFile(mode, LEGACY_SNAPSHOT_FILE);
  } catch (err) {
    console.warn('[DriveMigration] Failed to rename legacy snapshot to backup folder.', err);
  }

  return true;
}

export const driveMigrationService = {
  migrateIfNecessary,
};
