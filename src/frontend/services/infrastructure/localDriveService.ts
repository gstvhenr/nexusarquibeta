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

export const localDriveService = {
  selectFolder,
  hasSavedFolder,
  verifyAccess,
  writeSnapshot,
  readSnapshot,
  clearSavedFolder,
  getFolderDisplayName,
  initDisplayName,
};
