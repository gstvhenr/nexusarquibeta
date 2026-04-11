/**
 * Input -> Output:
 * - input: user-selected folder via File System Access API.
 * - output: read/write JSON snapshots to local Google Drive folder.
 * Example:
 *   await localDriveService.selectFolder();
 *   await localDriveService.writeSnapshot(jsonString);
 *   const data = await localDriveService.readSnapshot();
 */

const APP_FOLDER_NAME = '01. NexusArqui';
const SNAPSHOT_FILE_NAME = 'nexus-data.json';
const IDB_NAME = 'nexus-drive-handle';
const IDB_STORE = 'handles';
const IDB_KEY = 'driveFolder';

// ---------------------------------------------------------------------------
// IndexedDB helpers (isolated store for directory handle persistence)
// ---------------------------------------------------------------------------

function openHandleDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(IDB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(handle, IDB_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function loadHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const request = tx.objectStore(IDB_STORE).get(IDB_KEY);
    request.onsuccess = () => {
      db.close();
      resolve((request.result as FileSystemDirectoryHandle | undefined) ?? null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function deleteHandle(): Promise<void> {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(IDB_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// ---------------------------------------------------------------------------
// Directory handle state
// ---------------------------------------------------------------------------

let cachedHandle: FileSystemDirectoryHandle | null = null;
let cachedFolderName: string | null = null;

// ---------------------------------------------------------------------------
// Permission helpers
// ---------------------------------------------------------------------------

async function verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const options = { mode: 'readwrite' as const };

  if ((await handle.queryPermission(options)) === 'granted') return true;
  if ((await handle.requestPermission(options)) === 'granted') return true;

  return false;
}

// ---------------------------------------------------------------------------
// App subfolder
// ---------------------------------------------------------------------------

async function getAppFolder(
  rootHandle: FileSystemDirectoryHandle,
): Promise<FileSystemDirectoryHandle> {
  return rootHandle.getDirectoryHandle(APP_FOLDER_NAME, { create: true });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

async function selectFolder(): Promise<string> {
  if (typeof window.showDirectoryPicker !== 'function') {
    throw new Error('File System Access API não suportada neste navegador. Use Chrome ou Edge.');
  }

  const rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
  await getAppFolder(rootHandle);
  await saveHandle(rootHandle);

  cachedHandle = rootHandle;
  cachedFolderName = rootHandle.name;

  return rootHandle.name;
}

async function hasSavedFolder(): Promise<boolean> {
  const handle = await loadHandle();
  return handle !== null;
}

async function verifyAccess(): Promise<boolean> {
  try {
    const handle = cachedHandle ?? (await loadHandle());
    if (!handle) return false;

    const granted = await verifyPermission(handle);
    if (granted) {
      cachedHandle = handle;
      cachedFolderName = handle.name;
    }
    return granted;
  } catch {
    return false;
  }
}

async function writeSnapshot(jsonString: string): Promise<void> {
  const rootHandle = cachedHandle ?? (await loadHandle());
  if (!rootHandle) throw new Error('Nenhuma pasta do Drive selecionada.');

  if (!(await verifyPermission(rootHandle))) {
    throw new Error('Permissão de escrita não concedida para a pasta.');
  }

  const appFolder = await getAppFolder(rootHandle);
  const fileHandle = await appFolder.getFileHandle(SNAPSHOT_FILE_NAME, {
    create: true,
  });

  const writable = await fileHandle.createWritable();
  try {
    await writable.write(jsonString);
  } finally {
    await writable.close();
  }

  cachedHandle = rootHandle;
}

async function readSnapshot(): Promise<string | null> {
  const rootHandle = cachedHandle ?? (await loadHandle());
  if (!rootHandle) return null;

  if (!(await verifyPermission(rootHandle))) return null;

  try {
    const appFolder = await getAppFolder(rootHandle);
    const fileHandle = await appFolder.getFileHandle(SNAPSHOT_FILE_NAME);
    const file = await fileHandle.getFile();
    cachedHandle = rootHandle;
    return await file.text();
  } catch {
    return null;
  }
}

async function clearSavedFolder(): Promise<void> {
  await deleteHandle();
  cachedHandle = null;
  cachedFolderName = null;
}

function getFolderDisplayName(): string | null {
  return cachedFolderName;
}

async function initDisplayName(): Promise<string | null> {
  if (cachedFolderName) return cachedFolderName;

  const handle = await loadHandle();
  if (handle) {
    cachedFolderName = handle.name;
    cachedHandle = handle;
  }
  return cachedFolderName;
}

// ---------------------------------------------------------------------------
// Granular file operations (for domain-level sync)
// ---------------------------------------------------------------------------

/**
 * Navigates into a subfolder of the app folder, creating it if needed.
 * Supports nested paths separated by '/'.
 */
async function getSubFolder(relativePath: string): Promise<FileSystemDirectoryHandle> {
  const rootHandle = cachedHandle ?? (await loadHandle());
  if (!rootHandle) throw new Error('Nenhuma pasta do Drive selecionada.');
  if (!(await verifyPermission(rootHandle))) {
    throw new Error('Permissão de escrita não concedida para a pasta.');
  }

  let current = await getAppFolder(rootHandle);
  const segments = relativePath.split('/').filter((s) => s.length > 0);

  for (const segment of segments) {
    current = await current.getDirectoryHandle(segment, { create: true });
  }

  cachedHandle = rootHandle;
  return current;
}

/**
 * Writes text content to a file at a relative path inside the app folder.
 * Creates intermediate directories as needed.
 * Example: writeFile('data/clients.json', jsonString)
 */
async function writeFile(relativePath: string, content: string): Promise<void> {
  const parts = relativePath.split('/');
  const fileName = parts.pop();
  if (!fileName) throw new Error('Caminho de arquivo inválido.');

  const folder =
    parts.length > 0 ? await getSubFolder(parts.join('/')) : await getAppFolder(cachedHandle!);
  const fileHandle = await folder.getFileHandle(fileName, { create: true });

  const writable = await fileHandle.createWritable();
  try {
    await writable.write(content);
  } finally {
    await writable.close();
  }
}

/**
 * Reads text content from a file at a relative path inside the app folder.
 * Returns null if the file does not exist.
 */
async function readFile(relativePath: string): Promise<string | null> {
  try {
    const rootHandle = cachedHandle ?? (await loadHandle());
    if (!rootHandle) return null;
    if (!(await verifyPermission(rootHandle))) return null;

    let current: FileSystemDirectoryHandle = await getAppFolder(rootHandle);
    const parts = relativePath.split('/').filter((s) => s.length > 0);
    const fileName = parts.pop();
    if (!fileName) return null;

    for (const segment of parts) {
      current = await current.getDirectoryHandle(segment);
    }

    const fileHandle = await current.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    cachedHandle = rootHandle;
    return await file.text();
  } catch {
    return null;
  }
}

/**
 * Writes binary content (File/Blob) to a file at a relative path inside the app folder.
 */
async function writeBinaryFile(relativePath: string, fileOrBlob: File | Blob): Promise<void> {
  const parts = relativePath.split('/');
  const fileName = parts.pop();
  if (!fileName) throw new Error('Caminho de arquivo inválido.');

  const folder =
    parts.length > 0 ? await getSubFolder(parts.join('/')) : await getAppFolder(cachedHandle!);
  const fileHandle = await folder.getFileHandle(fileName, { create: true });

  const writable = await fileHandle.createWritable();
  try {
    await writable.write(fileOrBlob);
  } finally {
    await writable.close();
  }
}

/**
 * Reads binary content (File) from a file at a relative path inside the app folder.
 */
async function readBinaryFile(relativePath: string): Promise<File | null> {
  try {
    const rootHandle = cachedHandle ?? (await loadHandle());
    if (!rootHandle) return null;
    if (!(await verifyPermission(rootHandle))) return null;

    let current: FileSystemDirectoryHandle = await getAppFolder(rootHandle);
    const parts = relativePath.split('/').filter((s) => s.length > 0);
    const fileName = parts.pop();
    if (!fileName) return null;

    for (const segment of parts) {
      current = await current.getDirectoryHandle(segment);
    }

    const fileHandle = await current.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    cachedHandle = rootHandle;
    return file;
  } catch {
    return null;
  }
}

/**
 * Checks if a file exists at a relative path inside the app folder.
 */
async function fileExists(relativePath: string): Promise<boolean> {
  try {
    const rootHandle = cachedHandle ?? (await loadHandle());
    if (!rootHandle) return false;
    if (!(await verifyPermission(rootHandle))) return false;

    let current: FileSystemDirectoryHandle = await getAppFolder(rootHandle);
    const parts = relativePath.split('/').filter((s) => s.length > 0);
    const fileName = parts.pop();
    if (!fileName) return false;

    for (const segment of parts) {
      current = await current.getDirectoryHandle(segment);
    }

    await current.getFileHandle(fileName);
    cachedHandle = rootHandle;
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the last modified time of a file at a relative path.
 * Returns null if the file does not exist.
 */
async function getFileModifiedTime(relativePath: string): Promise<number | null> {
  try {
    const rootHandle = cachedHandle ?? (await loadHandle());
    if (!rootHandle) return null;
    if (!(await verifyPermission(rootHandle))) return null;

    let current: FileSystemDirectoryHandle = await getAppFolder(rootHandle);
    const parts = relativePath.split('/').filter((s) => s.length > 0);
    const fileName = parts.pop();
    if (!fileName) return null;

    for (const segment of parts) {
      current = await current.getDirectoryHandle(segment);
    }

    const fileHandle = await current.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    cachedHandle = rootHandle;
    return file.lastModified;
  } catch {
    return null;
  }
}

/**
 * Deletes a file at a relative path inside the app folder.
 */
async function deleteFile(relativePath: string): Promise<void> {
  try {
    const rootHandle = cachedHandle ?? (await loadHandle());
    if (!rootHandle) return;
    if (!(await verifyPermission(rootHandle))) return;

    let current: FileSystemDirectoryHandle = await getAppFolder(rootHandle);
    const parts = relativePath.split('/').filter((s) => s.length > 0);
    const fileName = parts.pop();
    if (!fileName) return;

    for (const segment of parts) {
      current = await current.getDirectoryHandle(segment);
    }

    await current.removeEntry(fileName);
    cachedHandle = rootHandle;
  } catch {
    // Ignore if file doesn't exist or can't be deleted
  }
}

/**
 * Placeholder para compatibilidade da API de cota.
 * A API do sistema de arquivos relacional (Origin Private File System ou local)
 * não fornece um método confiável padronizado para cota de disco do usuário,
 * portanto ignoramos na sincronia local.
 */
async function getStorageQuota(): Promise<{ limitBytes: number; usageBytes: number } | null> {
  return null;
}

export const localDriveService = {
  selectFolder,
  hasSavedFolder,
  verifyAccess,
  writeSnapshot,
  readSnapshot,
  clearSavedFolder,
  getFolderDisplayName,
  initDisplayName,
  writeFile,
  readFile,
  writeBinaryFile,
  readBinaryFile,
  fileExists,
  getFileModifiedTime,
  deleteFile,
  getStorageQuota,
};
