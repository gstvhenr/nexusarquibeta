/**
 * Input -> Output:
 * - input: Google OAuth2 credentials (env vars) + Drive API calls.
 * - output: authenticated file operations on Google Drive (upload/download JSON, binary files).
 * Example:
 *   await googleDriveService.signIn();
 *   await googleDriveService.uploadSnapshot(appData);
 *   const restored = await googleDriveService.downloadSnapshot();
 */

import type { DriveFileMetadata, DriveState, GisTokenClient } from './googleDriveTypes';

const SCOPES =
  'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const APP_FOLDER_NAME = 'NexusArqui';
const SNAPSHOT_FILE_NAME = 'nexus-data.json';

/** In-memory cache of folder path -> folderId to avoid redundant API calls. */
const folderIdCache = new Map<string, string>();

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY ?? '';

let tokenClient: GisTokenClient | null = null;
let gapiInitialized = false;
let gisInitialized = false;
let appFolderId: string | null = null;

const state: DriveState = {
  status: 'disconnected',
  userEmail: null,
  lastSyncTimestamp: null,
  errorMessage: null,
};

type StateListener = (next: DriveState) => void;
const listeners = new Set<StateListener>();

function notifyListeners(): void {
  const snapshot = { ...state };
  listeners.forEach((listener) => listener(snapshot));
}

function updateState(partial: Partial<DriveState>): void {
  Object.assign(state, partial);
  notifyListeners();
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

function loadGapiClient(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.gapi) {
      reject(new Error('gapi not loaded. Check index.html script tags.'));
      return;
    }
    window.gapi.load('client', async () => {
      try {
        await window.gapi!.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInitialized = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

function initGisTokenClient(): void {
  if (!window.google) {
    throw new Error('Google Identity Services not loaded. Check index.html script tags.');
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    ux_mode: 'redirect',
    redirect_uri: window.location.origin + window.location.pathname,
    callback: () => {
      /* not used in redirect mode */
    },
  });
  gisInitialized = true;
}

async function ensureInitialized(): Promise<void> {
  if (!gapiInitialized) {
    await loadGapiClient();
  }
  if (!gisInitialized) {
    initGisTokenClient();
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/**
 * Parseia o access_token do hash da URL após redirect do Google.
 * Retorna true se encontrou token e conectou, false se não havia token no hash.
 */
async function handleRedirectCallback(): Promise<boolean> {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token')) return false;

  await ensureInitialized();

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');
  if (!accessToken) return false;

  // Limpar hash da URL sem recarregar a página
  window.history.replaceState(null, '', window.location.pathname + window.location.search);

  // Setar token no gapi client
  window.gapi!.client.setToken({ access_token: accessToken });

  updateState({ status: 'connecting', errorMessage: null });

  try {
    const email = await fetchUserEmail(accessToken);
    updateState({ status: 'connected', userEmail: email, errorMessage: null });
  } catch {
    updateState({ status: 'connected', userEmail: null, errorMessage: null });
  }

  return true;
}

/**
 * Inicia o fluxo de autenticação.
 * Se já tem token ativo, resolve imediatamente.
 * Caso contrário, redireciona ao Google para autorização.
 */
async function signIn(): Promise<void> {
  await ensureInitialized();

  // Se já tem token válido, apenas atualizar estado
  const existingToken = window.gapi?.client.getToken();
  if (existingToken) {
    try {
      const email = await fetchUserEmail(existingToken.access_token);
      updateState({ status: 'connected', userEmail: email, errorMessage: null });
    } catch {
      updateState({ status: 'connected', userEmail: null, errorMessage: null });
    }
    return;
  }

  if (!tokenClient) {
    throw new Error('Token client not initialized.');
  }

  // Redireciona ao Google — a página vai recarregar com token no hash
  tokenClient.requestAccessToken({ prompt: '' });
}

function signOut(): void {
  const token = window.gapi?.client.getToken();
  if (token) {
    window.google?.accounts.oauth2.revoke(token.access_token, () => {
      /* revoked */
    });
    window.gapi?.client.setToken(null);
  }
  appFolderId = null;
  updateState({
    status: 'disconnected',
    userEmail: null,
    errorMessage: null,
  });
}

function isSignedIn(): boolean {
  return window.gapi?.client.getToken() !== null && window.gapi?.client.getToken() !== undefined;
}

async function fetchUserEmail(accessToken: string): Promise<string> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await response.json()) as { email?: string };
  return data.email ?? 'Desconhecido';
}

// ---------------------------------------------------------------------------
// Drive folder management
// ---------------------------------------------------------------------------

async function getOrCreateAppFolder(): Promise<string> {
  if (appFolderId) return appFolderId;

  const searchResponse = await window.gapi!.client.request({
    path: '/drive/v3/files',
    method: 'GET',
    params: {
      q: `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id,name)',
      spaces: 'drive',
    },
  });

  const files = (searchResponse.result.files as DriveFileMetadata[] | undefined) ?? [];
  if (files.length > 0) {
    appFolderId = files[0].id;
    return appFolderId;
  }

  const createResponse = await window.gapi!.client.request({
    path: '/drive/v3/files',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  appFolderId = (createResponse.result as unknown as DriveFileMetadata).id;
  return appFolderId;
}

// ---------------------------------------------------------------------------
// File operations
// ---------------------------------------------------------------------------

async function findFileInFolder(fileName: string, folderId: string): Promise<string | null> {
  const response = await window.gapi!.client.request({
    path: '/drive/v3/files',
    method: 'GET',
    params: {
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,modifiedTime)',
      spaces: 'drive',
    },
  });

  const files = (response.result.files as DriveFileMetadata[] | undefined) ?? [];
  return files.length > 0 ? files[0].id : null;
}

async function uploadJsonFile<T>(fileName: string, data: T, folderId: string): Promise<string> {
  const fileContent = JSON.stringify(data, null, 2);
  const existingFileId = await findFileInFolder(fileName, folderId);

  const boundary = '-------nexusarqui_boundary';
  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType: 'application/json',
  };

  if (!existingFileId) {
    metadata.parents = [folderId];
  }

  const requestBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${fileContent}\r\n` +
    `--${boundary}--`;

  const uploadMethod = existingFileId ? 'PATCH' : 'POST';

  const token = window.gapi!.client.getToken();
  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files${existingFileId ? `/${existingFileId}` : ''}?uploadType=multipart`,
    {
      method: uploadMethod,
      headers: {
        Authorization: `Bearer ${token!.access_token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: requestBody,
    },
  );

  const result = (await response.json()) as { id: string };
  return result.id;
}

async function downloadJsonFile<T>(fileId: string): Promise<T> {
  const token = window.gapi!.client.getToken();
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token!.access_token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  return (await response.json()) as T;
}

// ---------------------------------------------------------------------------
// High-level operations (legacy — kept for backward compat)
// ---------------------------------------------------------------------------

async function uploadSnapshot<T>(snapshot: T): Promise<void> {
  const folderId = await getOrCreateAppFolder();
  await uploadJsonFile(SNAPSHOT_FILE_NAME, snapshot, folderId);
  updateState({ lastSyncTimestamp: Date.now() });
}

async function downloadSnapshot<T>(): Promise<T | null> {
  const folderId = await getOrCreateAppFolder();
  const fileId = await findFileInFolder(SNAPSHOT_FILE_NAME, folderId);

  if (!fileId) return null;

  const data = await downloadJsonFile<T>(fileId);
  updateState({ lastSyncTimestamp: Date.now() });
  return data;
}

async function getLastSyncInfo(): Promise<{ modifiedTime: string } | null> {
  const folderId = await getOrCreateAppFolder();
  const response = await window.gapi!.client.request({
    path: '/drive/v3/files',
    method: 'GET',
    params: {
      q: `name='${SNAPSHOT_FILE_NAME}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,modifiedTime)',
      spaces: 'drive',
    },
  });

  const files = (response.result.files as DriveFileMetadata[] | undefined) ?? [];
  if (files.length === 0) return null;

  return { modifiedTime: files[0].modifiedTime };
}

// ---------------------------------------------------------------------------
// Granular file operations (for domain-level sync)
// ---------------------------------------------------------------------------

/**
 * Navigates into a subfolder (by path) under the app root, creating folders as needed.
 * Uses in-memory cache to avoid redundant API calls.
 * Example: getOrCreateSubFolder('data') → folderId for NexusArqui/data
 */
async function getOrCreateSubFolder(relativePath: string): Promise<string> {
  if (folderIdCache.has(relativePath)) {
    return folderIdCache.get(relativePath)!;
  }

  const segments = relativePath.split('/').filter((s) => s.length > 0);
  let parentId = await getOrCreateAppFolder();

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const pathSoFar = segments.slice(0, i + 1).join('/');

    if (folderIdCache.has(pathSoFar)) {
      parentId = folderIdCache.get(pathSoFar)!;
      continue;
    }

    const searchResponse = await window.gapi!.client.request({
      path: '/drive/v3/files',
      method: 'GET',
      params: {
        q: `name='${segment}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id,name)',
        spaces: 'drive',
      },
    });

    const existing = (searchResponse.result.files as DriveFileMetadata[] | undefined) ?? [];
    if (existing.length > 0) {
      parentId = existing[0].id;
    } else {
      const createResponse = await window.gapi!.client.request({
        path: '/drive/v3/files',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: segment,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        }),
      });
      parentId = (createResponse.result as unknown as DriveFileMetadata).id;
    }

    folderIdCache.set(pathSoFar, parentId);
  }

  return parentId;
}

/**
 * Uploads a text file at a relative path inside the app folder via Drive API.
 * Creates intermediate folders as needed.
 * Example: uploadFileByPath('data/clients.json', jsonString)
 */
async function uploadFileByPath(relativePath: string, content: string): Promise<void> {
  const parts = relativePath.split('/');
  const fileName = parts.pop();
  if (!fileName) throw new Error('Caminho de arquivo inválido.');

  const folderId =
    parts.length > 0 ? await getOrCreateSubFolder(parts.join('/')) : await getOrCreateAppFolder();

  const existingFileId = await findFileInFolder(fileName, folderId);

  const boundary = '-------nexusarqui_boundary';
  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType: 'application/json',
  };

  if (!existingFileId) {
    metadata.parents = [folderId];
  }

  const requestBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;

  const uploadMethod = existingFileId ? 'PATCH' : 'POST';
  const token = window.gapi!.client.getToken();

  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files${existingFileId ? `/${existingFileId}` : ''}?uploadType=multipart`,
    {
      method: uploadMethod,
      headers: {
        Authorization: `Bearer ${token!.access_token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: requestBody,
    },
  );

  if (!response.ok) {
    throw new Error(`Upload failed for ${relativePath}: ${response.statusText}`);
  }
}

/**
 * Downloads a text file at a relative path inside the app folder via Drive API.
 * Returns null if the file does not exist.
 */
async function downloadFileByPath(relativePath: string): Promise<string | null> {
  const parts = relativePath.split('/');
  const fileName = parts.pop();
  if (!fileName) return null;

  const folderId =
    parts.length > 0 ? await getOrCreateSubFolder(parts.join('/')) : await getOrCreateAppFolder();

  const fileId = await findFileInFolder(fileName, folderId);
  if (!fileId) return null;

  const token = window.gapi!.client.getToken();
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token!.access_token}` },
  });

  if (!response.ok) return null;
  return await response.text();
}

/**
 * Uploads a binary file at a relative path inside the app folder via Drive API.
 */
async function uploadBinaryFileByPath(relativePath: string, file: File): Promise<void> {
  const parts = relativePath.split('/');
  const fileName = parts.pop();
  if (!fileName) throw new Error('Caminho de arquivo inválido.');

  const folderId =
    parts.length > 0 ? await getOrCreateSubFolder(parts.join('/')) : await getOrCreateAppFolder();

  const existingFileId = await findFileInFolder(fileName, folderId);

  const boundary = '-------nexusarqui_boundary';
  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType: file.type || 'application/octet-stream',
  };

  if (!existingFileId) {
    metadata.parents = [folderId];
  }

  const metadataBlob = new Blob([
    `--${boundary}\r\n`,
    `Content-Type: application/json; charset=UTF-8\r\n\r\n`,
    `${JSON.stringify(metadata)}\r\n`,
    `--${boundary}\r\n`,
    `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
  ]);

  const endBlob = new Blob([`\r\n--${boundary}--`]);
  const requestBody = new Blob([metadataBlob, file, endBlob]);

  const uploadMethod = existingFileId ? 'PATCH' : 'POST';
  const token = window.gapi!.client.getToken();

  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files${existingFileId ? `/${existingFileId}` : ''}?uploadType=multipart`,
    {
      method: uploadMethod,
      headers: {
        Authorization: `Bearer ${token!.access_token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: requestBody,
    },
  );

  if (!response.ok) {
    throw new Error(`Upload failed for ${relativePath}: ${response.statusText}`);
  }
}

/**
 * Downloads a binary file at a relative path inside the app folder via Drive API.
 */
async function downloadBinaryFileByPath(relativePath: string): Promise<Blob | null> {
  const parts = relativePath.split('/');
  const fileName = parts.pop();
  if (!fileName) return null;

  const folderId =
    parts.length > 0 ? await getOrCreateSubFolder(parts.join('/')) : await getOrCreateAppFolder();

  const fileId = await findFileInFolder(fileName, folderId);
  if (!fileId) return null;

  const token = window.gapi!.client.getToken();
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token!.access_token}` },
  });

  if (!response.ok) return null;
  return await response.blob();
}

/**
 * Gets the last modified time (epoch ms) of a file by relative path.
 * Returns null if the file does not exist.
 */
async function getFileModifiedTimeByPath(relativePath: string): Promise<number | null> {
  const parts = relativePath.split('/');
  const fileName = parts.pop();
  if (!fileName) return null;

  const folderId =
    parts.length > 0 ? await getOrCreateSubFolder(parts.join('/')) : await getOrCreateAppFolder();

  const response = await window.gapi!.client.request({
    path: '/drive/v3/files',
    method: 'GET',
    params: {
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,modifiedTime)',
      spaces: 'drive',
    },
  });

  const files = (response.result.files as DriveFileMetadata[] | undefined) ?? [];
  if (files.length === 0) return null;

  return new Date(files[0].modifiedTime).getTime();
}

/**
 * Checks if a file exists at a relative path inside the app folder.
 */
async function fileExistsByPath(relativePath: string): Promise<boolean> {
  const parts = relativePath.split('/');
  const fileName = parts.pop();
  if (!fileName) return false;

  try {
    const folderId =
      parts.length > 0 ? await getOrCreateSubFolder(parts.join('/')) : await getOrCreateAppFolder();

    const fileId = await findFileInFolder(fileName, folderId);
    return fileId !== null;
  } catch {
    return false;
  }
}

/**
 * Deletes a file at a relative path inside the app folder via Drive API.
 */
async function deleteFileByPath(relativePath: string): Promise<void> {
  const parts = relativePath.split('/');
  const fileName = parts.pop();
  if (!fileName) return;

  try {
    const folderId =
      parts.length > 0 ? await getOrCreateSubFolder(parts.join('/')) : await getOrCreateAppFolder();

    const fileId = await findFileInFolder(fileName, folderId);
    if (!fileId) return;

    const token = window.gapi!.client.getToken();
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token!.access_token}` },
    });
  } catch {
    // Ignore errors on delete to avoid breaking flows
  }
}

// ---------------------------------------------------------------------------
// State management
// ---------------------------------------------------------------------------

function getState(): DriveState {
  return { ...state };
}

function subscribe(listener: StateListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Obtém a cota de armazenamento e o uso da conta do Google Drive via API.
 * Retorna log de limite e uso em bytes.
 */
async function getStorageQuota(): Promise<{ limitBytes: number; usageBytes: number } | null> {
  if (!isSignedIn()) return null;
  const token = window.gapi!.client.getToken();
  if (!token) return null;

  try {
    const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.storageQuota) {
      return {
        limitBytes: Number(data.storageQuota.limit || 15 * 1024 * 1024 * 1024), // Fallback padrão 15GB
        usageBytes: Number(data.storageQuota.usage || 0),
      };
    }
  } catch {
    // Falha silenciosa
  }
  return null;
}

export const googleDriveService = {
  handleRedirectCallback,
  signIn,
  signOut,
  isSignedIn,
  uploadSnapshot,
  downloadSnapshot,
  getLastSyncInfo,
  getState,
  subscribe,
  uploadFileByPath,
  downloadFileByPath,
  uploadBinaryFileByPath,
  downloadBinaryFileByPath,
  getFileModifiedTimeByPath,
  fileExistsByPath,
  deleteFileByPath,
  getOrCreateSubFolder,
  ensureInitialized,
  getStorageQuota,
};
