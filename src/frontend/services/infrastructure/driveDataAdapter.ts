/**
 * Input -> Output:
 * - input: domain key + data array/object.
 * - output: reads/writes individual JSON files on Google Drive (local folder or API).
 *
 * This adapter abstracts the "how" of Drive access, automatically choosing
 * between the local File System Access API (when a local folder is configured)
 * and the Google Drive REST API (when accessing remotely).
 *
 * Example:
 *   await driveDataAdapter.writeDomain('clients', clientsArray);
 *   const clients = await driveDataAdapter.readDomain<Client[]>('clients');
 */

import { localDriveService } from './localDriveService';
import { googleDriveService } from './googleDriveService';
import {
  DOMAIN_FILE_MAP,
  SCALAR_CONFIG_KEYS,
  CONFIG_FILE_NAME,
  META_FILE_NAME,
  PREFERENCES_FILE_NAME,
  DATA_FOLDER_NAME,
  type DriveAccessMode,
  type SyncedPreferencesFile,
  type SyncMetaFile,
} from './driveSyncTypes';

// ---------------------------------------------------------------------------
// Access mode detection
// ---------------------------------------------------------------------------

/**
 * Determines the best access mode for the current session.
 * Precedence: api > local > none.
 * The REST API is the canonical source of truth; the local folder
 * (Google Drive Desktop) is an optional mirror for lower latency.
 */
async function detectAccessMode(): Promise<DriveAccessMode> {
  try {
    if (googleDriveService.isSignedIn()) return 'api';
  } catch {
    // Drive API not available
  }

  try {
    const hasLocal = await localDriveService.hasSavedFolder();
    if (hasLocal) {
      const hasAccess = await localDriveService.hasActivePermission();
      if (hasAccess) return 'local';
    }
  } catch {
    // File System Access API not available — fallback silencioso
  }

  return 'none';
}

/**
 * Tenta re-adquirir permissão para o modo local.
 * Retorna o novo modo de acesso após a tentativa.
 */
async function tryReacquireLocalAccess(): Promise<DriveAccessMode> {
  const hasLocal = await localDriveService.hasSavedFolder();
  if (!hasLocal) return 'none';

  const granted = await localDriveService.requestRepermission();
  if (granted) return 'local';

  // Se usuário negou permissão, tentar API REST como fallback
  try {
    if (googleDriveService.isSignedIn()) return 'api';
  } catch {
    // Drive API not available
  }

  return 'none';
}

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

function getDomainFilePath(domainKey: string): string {
  const fileName = DOMAIN_FILE_MAP[domainKey];
  if (!fileName) throw new Error(`Domínio desconhecido: ${domainKey}`);
  return `${DATA_FOLDER_NAME}/${fileName}`;
}

function getConfigFilePath(): string {
  return `${DATA_FOLDER_NAME}/${CONFIG_FILE_NAME}`;
}

function getMetaFilePath(): string {
  return `${DATA_FOLDER_NAME}/${META_FILE_NAME}`;
}

function getPreferencesFilePath(): string {
  return `${DATA_FOLDER_NAME}/${PREFERENCES_FILE_NAME}`;
}

// ---------------------------------------------------------------------------
// Generic file read/write (mode-agnostic)
// ---------------------------------------------------------------------------

async function writeFileToMode(
  mode: DriveAccessMode,
  relativePath: string,
  content: string,
): Promise<void> {
  switch (mode) {
    case 'local':
      return localDriveService.writeFile(relativePath, content);
    case 'api':
      return googleDriveService.uploadFileByPath(relativePath, content);
    case 'none':
      throw new Error('Nenhum modo de acesso ao Drive disponível.');
  }
}

async function writeBinaryFileToMode(
  mode: DriveAccessMode,
  relativePath: string,
  file: File,
): Promise<void> {
  switch (mode) {
    case 'local':
      return localDriveService.writeBinaryFile(relativePath, file);
    case 'api':
      return googleDriveService.uploadBinaryFileByPath(relativePath, file);
    case 'none':
      throw new Error('Nenhum modo de acesso ao Drive disponível.');
  }
}

async function readFileFromMode(
  mode: DriveAccessMode,
  relativePath: string,
): Promise<string | null> {
  switch (mode) {
    case 'local':
      return localDriveService.readFile(relativePath);
    case 'api':
      return googleDriveService.downloadFileByPath(relativePath);
    case 'none':
      return null;
  }
}

async function readBinaryFileFromMode(
  mode: DriveAccessMode,
  relativePath: string,
): Promise<Blob | null> {
  switch (mode) {
    case 'local':
      return localDriveService.readBinaryFile(relativePath);
    case 'api':
      return googleDriveService.downloadBinaryFileByPath(relativePath);
    case 'none':
      return null;
  }
}

async function fileExistsInMode(mode: DriveAccessMode, relativePath: string): Promise<boolean> {
  switch (mode) {
    case 'local':
      return localDriveService.fileExists(relativePath);
    case 'api':
      return googleDriveService.fileExistsByPath(relativePath);
    case 'none':
      return false;
  }
}

async function writeRawFile(
  mode: DriveAccessMode,
  relativePath: string,
  content: string,
): Promise<void> {
  return writeFileToMode(mode, relativePath, content);
}

async function writeRawBinaryFile(
  mode: DriveAccessMode,
  relativePath: string,
  file: File,
): Promise<void> {
  return writeBinaryFileToMode(mode, relativePath, file);
}

async function readRawBinaryFile(
  mode: DriveAccessMode,
  relativePath: string,
): Promise<Blob | null> {
  return readBinaryFileFromMode(mode, relativePath);
}

async function deleteFile(mode: DriveAccessMode, relativePath: string): Promise<void> {
  switch (mode) {
    case 'local':
      return localDriveService.deleteFile(relativePath);
    case 'api':
      return googleDriveService.deleteFileByPath(relativePath);
    case 'none':
      throw new Error('Nenhum modo de acesso ao Drive disponível.');
  }
}

async function clearFolder(
  mode: DriveAccessMode,
  relativePath: string,
  preserveNames: string[] = [],
): Promise<void> {
  switch (mode) {
    case 'local':
      return localDriveService.clearFolder(relativePath, preserveNames);
    case 'api':
      return googleDriveService.deleteFolderByPath(relativePath, preserveNames);
    case 'none':
      throw new Error('Nenhum modo de acesso ao Drive disponível.');
  }
}

// ---------------------------------------------------------------------------
// Checksum
// ---------------------------------------------------------------------------

/** Simple fast hash for change detection (not cryptographic). */
function computeChecksum(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Writes an array-type domain to its individual JSON file on Drive.
 * Returns the checksum of the written content.
 */
async function writeDomain(
  mode: DriveAccessMode,
  domainKey: string,
  data: unknown,
): Promise<string> {
  const filePath = getDomainFilePath(domainKey);
  const content = JSON.stringify(data, null, 2);
  await writeFileToMode(mode, filePath, content);
  return computeChecksum(content);
}

/**
 * Reads an array-type domain from its individual JSON file on Drive.
 * Returns null if the file does not exist.
 */
async function readDomain<T>(mode: DriveAccessMode, domainKey: string): Promise<T | null> {
  const filePath = getDomainFilePath(domainKey);
  const content = await readFileFromMode(mode, filePath);
  if (!content) return null;

  try {
    return JSON.parse(content) as T;
  } catch {
    console.error(`[DriveDataAdapter] Failed to parse ${filePath}`);
    return null;
  }
}

/**
 * Writes the scalar config values to the shared config.json file.
 * Merges with existing values to avoid data loss.
 */
async function writeConfig(
  mode: DriveAccessMode,
  configData: Record<string, unknown>,
): Promise<string> {
  const filePath = getConfigFilePath();

  // Read existing config to merge
  let existing: Record<string, unknown> = {};
  const existingContent = await readFileFromMode(mode, filePath);
  if (existingContent) {
    try {
      existing = JSON.parse(existingContent) as Record<string, unknown>;
    } catch {
      // corrupted config — overwrite with new data
    }
  }

  const merged = { ...existing, ...configData };
  const content = JSON.stringify(merged, null, 2);
  await writeFileToMode(mode, filePath, content);
  return computeChecksum(content);
}

/**
 * Reads the scalar config values from config.json.
 */
async function readConfig(mode: DriveAccessMode): Promise<Record<string, unknown> | null> {
  const filePath = getConfigFilePath();
  const content = await readFileFromMode(mode, filePath);
  if (!content) return null;

  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    console.error('[DriveDataAdapter] Failed to parse config.json');
    return null;
  }
}

async function writePreferences(
  mode: DriveAccessMode,
  preferences: SyncedPreferencesFile,
): Promise<string> {
  const filePath = getPreferencesFilePath();
  const content = JSON.stringify(preferences, null, 2);
  await writeFileToMode(mode, filePath, content);
  return computeChecksum(content);
}

async function readPreferences(mode: DriveAccessMode): Promise<SyncedPreferencesFile | null> {
  const filePath = getPreferencesFilePath();
  const content = await readFileFromMode(mode, filePath);
  if (!content) return null;

  try {
    return JSON.parse(content) as SyncedPreferencesFile;
  } catch {
    console.error('[DriveDataAdapter] Failed to parse preferences.json');
    return null;
  }
}

/**
 * Writes the sync metadata file (_meta.json).
 */
async function writeMeta(mode: DriveAccessMode, meta: SyncMetaFile): Promise<void> {
  const filePath = getMetaFilePath();
  const content = JSON.stringify(meta, null, 2);
  await writeFileToMode(mode, filePath, content);
}

/**
 * Reads the sync metadata file (_meta.json).
 * Returns null if it does not exist (first-time sync).
 */
async function readMeta(mode: DriveAccessMode): Promise<SyncMetaFile | null> {
  const filePath = getMetaFilePath();
  const content = await readFileFromMode(mode, filePath);
  if (!content) return null;

  try {
    return JSON.parse(content) as SyncMetaFile;
  } catch {
    console.error('[DriveDataAdapter] Failed to parse _meta.json');
    return null;
  }
}

/**
 * Checks if the Drive data folder has been initialized (has _meta.json).
 */
async function hasBeenInitialized(mode: DriveAccessMode): Promise<boolean> {
  return fileExistsInMode(mode, getMetaFilePath());
}

/**
 * Fetches the storage quota for the given mode.
 */
async function getStorageQuota(
  mode: DriveAccessMode,
): Promise<{ limitBytes: number; usageBytes: number } | null> {
  switch (mode) {
    case 'api':
      return googleDriveService.getStorageQuota();
    case 'local':
      return localDriveService.getStorageQuota();
    case 'none':
      return null;
  }
}

export const driveDataAdapter = {
  detectAccessMode,
  tryReacquireLocalAccess,
  writeDomain,
  readDomain,
  writeConfig,
  readConfig,
  writePreferences,
  readPreferences,
  writeMeta,
  readMeta,
  hasBeenInitialized,
  computeChecksum,
  deleteFile,
  clearFolder,
  writeRawFile,
  writeRawBinaryFile,
  readRawBinaryFile,
  getStorageQuota,
  SCALAR_CONFIG_KEYS,
};
