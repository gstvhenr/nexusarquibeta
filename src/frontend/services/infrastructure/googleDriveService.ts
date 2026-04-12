/**
 * Input -> Output:
 * - input: Google OAuth2 credentials (env vars) + Drive API calls.
 * - output: authenticated file operations on Google Drive (upload/download JSON, binary files).
 * Example:
 *   await googleDriveService.signIn();
 *   await googleDriveService.uploadSnapshot(appData);
 *   const restored = await googleDriveService.downloadSnapshot();
 */

import type {
  DriveFileMetadata,
  DriveState,
  GisTokenClient,
  GisTokenResponse,
  GoogleIdCredentialResponse,
} from './googleDriveTypes';
import {
  APP_FOLDER_CANDIDATES,
  CANONICAL_APP_FOLDER_NAME,
  selectPreferredAppFolder,
  type DriveAppFolderCandidate,
  type DriveAppFolderName,
} from './driveAppFolder';
import { extractGoogleCredentialEmail } from '@/utils/googleIdentity';

const SCOPES =
  'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SNAPSHOT_FILE_NAME = 'nexus-data.json';

/** In-memory cache of folder path -> folderId to avoid redundant API calls. */
const folderIdCache = new Map<string, string>();

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY ?? '';

let popupTokenClient: GisTokenClient | null = null;
let gapiInitialized = false;
let gisInitialized = false;
let googleIdentityInitialized = false;
let appFolderId: string | null = null;
let appFolderName: DriveAppFolderName | null = null;

const TOKEN_STORAGE_KEY = 'nexus_google_token';
const AUTH_FLAG_KEY = 'nexus_authenticated';
const USER_EMAIL_KEY = 'nexus_user_email';

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

function getCurrentGapiToken(): { access_token: string } | null {
  const client = window.gapi?.client;
  if (!client || typeof client.getToken !== 'function') return null;

  try {
    return client.getToken();
  } catch {
    return null;
  }
}

function hasStoredAuthenticatedUser(): boolean {
  return Boolean(localStorage.getItem(USER_EMAIL_KEY) && localStorage.getItem(AUTH_FLAG_KEY));
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

  // Apenas marcamos como inicializado. O cliente real será criado no escopo do signIn()
  // no momento do clique para contornar problemas de popup blocker e callbacks fantasmas.
  gisInitialized = true;
}

function initGoogleIdentityClient(): void {
  if (!window.google) {
    throw new Error('Google Identity Services not loaded. Check index.html script tags.');
  }

  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleGoogleIdentityResponse,
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: true,
  });

  googleIdentityInitialized = true;
}

// ---------------------------------------------------------------------------
// Token persistence
// ---------------------------------------------------------------------------

function persistToken(accessToken: string, expiresIn: number): void {
  const data = {
    access_token: accessToken,
    expires_at: Date.now() + expiresIn * 1000,
  };
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem(AUTH_FLAG_KEY, '1');
}

function restoreToken(): { access_token: string } | null {
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { access_token: string; expires_at: number };
    // Token expirado — não restaurar
    if (parsed.expires_at <= Date.now()) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return { access_token: parsed.access_token };
  } catch {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
}

function clearPersistedToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_FLAG_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
}

function persistAuthenticatedUser(email: string): void {
  localStorage.setItem(AUTH_FLAG_KEY, '1');
  localStorage.setItem(USER_EMAIL_KEY, email);
}

async function handleGoogleIdentityResponse(response: GoogleIdCredentialResponse): Promise<void> {
  if (!response.credential) {
    updateState({
      status: 'disconnected',
      errorMessage: 'Falha ao validar sua conta Google. Tente novamente.',
    });
    return;
  }

  const email = extractGoogleCredentialEmail(response.credential);
  if (!email) {
    updateState({
      status: 'disconnected',
      errorMessage: 'Nao foi possivel obter o e-mail da conta Google selecionada.',
    });
    return;
  }

  persistAuthenticatedUser(email);
  updateState({ status: 'connected', userEmail: email, errorMessage: null });

  try {
    await trySilentReauth();
  } catch {
    // App auth permanece valida mesmo sem token Drive imediato.
  }
}

/**
 * Tenta restaurar a sessão a partir de token persistido no localStorage.
 * Se o token ainda for válido, seta no gapi e atualiza o estado.
 */
async function tryRestoreSession(): Promise<boolean> {
  // 1. Verificar se temos identidade salva (auth gate)
  const savedEmail = localStorage.getItem(USER_EMAIL_KEY);
  const authFlag = localStorage.getItem(AUTH_FLAG_KEY);

  if (!savedEmail || !authFlag) return false;

  // 2. Inicializar SDKs — se falhar, limpar dados corrompidos e mostrar login
  try {
    await ensureInitialized();
  } catch {
    clearPersistedToken();
    return false;
  }

  // 3. Tentar restaurar access_token do Drive
  const token = restoreToken();
  if (token) {
    window.gapi!.client.setToken(token);
    try {
      await fetchUserEmail(token.access_token);
      updateState({ status: 'connected', userEmail: savedEmail, errorMessage: null });
      return true;
    } catch {
      // Token expirado ou revogado — mas identidade OK
      window.gapi!.client.setToken(null);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  // 4. Identidade salva mas sem token Drive válido
  // Marcar como autenticado mesmo assim — Drive sync tentará token depois
  updateState({ status: 'connected', userEmail: savedEmail, errorMessage: null });
  return true;
}

/**
 * Tenta re-autenticar silenciosamente via popup GIS (prompt: '').
 * Se o usuário já deu consentimento, o popup abre e fecha automaticamente.
 * Inclui timeout para evitar travamento caso popup seja bloqueado.
 */
async function trySilentReauth(): Promise<boolean> {
  await ensureInitialized();

  if (!window.google || !CLIENT_ID) return false;

  return new Promise<boolean>((resolve) => {
    let resolved = false;
    const safeResolve = (value: boolean) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeoutId);
      resolve(value);
    };

    // Timeout de segurança: se nada acontecer em 4s, desiste silenciosamente
    const timeoutId = setTimeout(() => safeResolve(false), 4000);

    popupTokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (response: GisTokenResponse) => {
        if (response.error || !response.access_token) {
          safeResolve(false);
          return;
        }

        window.gapi!.client.setToken({ access_token: response.access_token });
        persistToken(response.access_token, response.expires_in);

        try {
          const email = await fetchUserEmail(response.access_token);
          updateState({ status: 'connected', userEmail: email, errorMessage: null });
        } catch {
          updateState({
            status: 'connected',
            userEmail: localStorage.getItem(USER_EMAIL_KEY) ?? state.userEmail,
            errorMessage: null,
          });
        }
        safeResolve(true);
      },
      error_callback: () => {
        safeResolve(false);
      },
    });

    try {
      popupTokenClient!.requestAccessToken({ prompt: '' });
    } catch {
      safeResolve(false);
    }
  });
}

/** Polls for a global to appear (async script tags may not be ready immediately). */
function waitForGlobal(name: 'gapi' | 'google', timeoutMs = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    if (window[name]) {
      resolve(true);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (window[name]) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, 100);
  });
}

async function ensureGoogleIdentityReady(): Promise<void> {
  const googleReady = await waitForGlobal('google');
  if (!googleReady) {
    throw new Error('Google Identity Services nao carregou dentro do tempo esperado.');
  }

  if (!googleIdentityInitialized) {
    initGoogleIdentityClient();
  }
}

async function ensureInitialized(): Promise<void> {
  if (!gapiInitialized) {
    const gapiReady = await waitForGlobal('gapi');
    if (!gapiReady) throw new Error('gapi failed to load within timeout');
    await loadGapiClient();
  }
  if (!gisInitialized) {
    const gisReady = await waitForGlobal('google');
    if (!gisReady) throw new Error('GIS failed to load within timeout');
    initGisTokenClient();
  }
}

async function renderLoginButton(container: HTMLElement): Promise<void> {
  if (!CLIENT_ID) {
    throw new Error('CLIENT_ID não configurado. Verifique .env.');
  }

  await ensureGoogleIdentityReady();

  container.innerHTML = '';
  window.google!.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    width: Math.max(container.clientWidth, 280),
    logo_alignment: 'left',
  });
}

/**
 * Inicia o fluxo de autenticação via popup OAuth2 (initTokenClient).
 * Chama ensureInitialized() para garantir que gapi e GIS estejam prontos.
 * Usa ux_mode 'popup' explicitamente e timeout de segurança.
 */
async function signIn(): Promise<void> {
  if (!CLIENT_ID) {
    updateState({
      status: 'disconnected',
      errorMessage: 'CLIENT_ID não configurado. Verifique .env.',
    });
    return;
  }

  updateState({ status: 'connecting', errorMessage: null });

  // Garantir que gapi e GIS estejam carregados antes de prosseguir
  try {
    await ensureInitialized();
  } catch {
    updateState({
      status: 'disconnected',
      errorMessage: 'Falha ao carregar Google SDK. Verifique sua conexão e recarregue.',
    });
    return;
  }

  if (!window.google) {
    updateState({
      status: 'disconnected',
      errorMessage: 'Google Identity Services não carregou. Recarregue a página.',
    });
    return;
  }

  // Timeout de segurança: se nenhum callback disparar em 20s, resetar
  let callbackFired = false;
  const safetyTimeout = setTimeout(() => {
    if (!callbackFired) {
      updateState({
        status: 'disconnected',
        errorMessage:
          'Tempo esgotado. O popup pode ter sido bloqueado ou mostrou um erro. Tente novamente.',
      });
    }
  }, 20000);

  const markCallbackFired = () => {
    callbackFired = true;
    clearTimeout(safetyTimeout);
  };

  popupTokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    ux_mode: 'popup',
    callback: async (tokenResponse: GisTokenResponse) => {
      markCallbackFired();

      if (tokenResponse.error || !tokenResponse.access_token) {
        updateState({
          status: 'disconnected',
          errorMessage: tokenResponse.error ?? 'Falha na autenticação. Tente novamente.',
        });
        return;
      }

      window.gapi!.client.setToken({ access_token: tokenResponse.access_token });
      persistToken(tokenResponse.access_token, tokenResponse.expires_in);

      localStorage.setItem(AUTH_FLAG_KEY, '1');

      try {
        const email = await fetchUserEmail(tokenResponse.access_token);
        localStorage.setItem(USER_EMAIL_KEY, email);
        updateState({ status: 'connected', userEmail: email, errorMessage: null });
      } catch {
        updateState({
          status: 'connected',
          userEmail: localStorage.getItem(USER_EMAIL_KEY) ?? state.userEmail,
          errorMessage: null,
        });
      }
    },
    error_callback: (err: { type: string; message?: string }) => {
      markCallbackFired();

      if (err.type === 'popup_closed') {
        updateState({ status: 'disconnected', errorMessage: null });
      } else {
        updateState({
          status: 'disconnected',
          errorMessage: 'Popup bloqueado pelo navegador. Permita popups para este site.',
        });
      }
    },
  });

  try {
    popupTokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch {
    markCallbackFired();
    updateState({
      status: 'disconnected',
      errorMessage: 'Erro ao iniciar autenticação. Recarregue a página.',
    });
  }
}

function signOut(): void {
  // Revogar token no servidor do Google
  const token = getCurrentGapiToken();
  if (token) {
    window.google?.accounts.oauth2.revoke(token.access_token, () => {
      /* revoked */
    });
    if (window.gapi?.client && typeof window.gapi.client.setToken === 'function') {
      window.gapi.client.setToken(null);
    }
  }
  popupTokenClient = null;
  appFolderId = null;
  appFolderName = null;
  folderIdCache.clear();
  clearPersistedToken();
  updateState({
    status: 'disconnected',
    userEmail: null,
    errorMessage: null,
  });
}

function isSignedIn(): boolean {
  return getCurrentGapiToken() !== null;
}

async function ensureDriveAccess(): Promise<boolean> {
  if (isSignedIn()) {
    return true;
  }

  if (!hasStoredAuthenticatedUser()) {
    return false;
  }

  return trySilentReauth();
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

function clearFolderCacheIfRootChanged(
  nextFolderId: string,
  nextFolderName: DriveAppFolderName,
): void {
  if (appFolderId !== nextFolderId || appFolderName !== nextFolderName) {
    folderIdCache.clear();
  }

  appFolderId = nextFolderId;
  appFolderName = nextFolderName;
}

async function findFolderInParent(
  folderName: string,
  parentId: string,
): Promise<DriveFileMetadata | null> {
  const response = await window.gapi!.client.request({
    path: '/drive/v3/files',
    method: 'GET',
    params: {
      q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id,name,modifiedTime)',
      spaces: 'drive',
    },
  });

  const files = (response.result.files as DriveFileMetadata[] | undefined) ?? [];
  return files[0] ?? null;
}

async function findFolderByPathUnder(
  parentId: string,
  relativePath: string,
): Promise<string | null> {
  const segments = relativePath.split('/').filter((segment) => segment.length > 0);
  let currentParentId = parentId;

  for (const segment of segments) {
    const childFolder = await findFolderInParent(segment, currentParentId);
    if (!childFolder) {
      return null;
    }

    currentParentId = childFolder.id;
  }

  return currentParentId;
}

async function getAppFolderCandidateState(
  folder: DriveFileMetadata,
): Promise<DriveAppFolderCandidate<DriveFileMetadata>> {
  const dataFolderId = await findFolderByPathUnder(folder.id, 'data');
  const metaFile = dataFolderId ? await findFileMetadataInFolder('_meta.json', dataFolderId) : null;
  const legacyFile = await findFileMetadataInFolder(SNAPSHOT_FILE_NAME, folder.id);

  return {
    name: folder.name as DriveAppFolderName,
    ref: folder,
    hasSyncArtifacts: metaFile !== null,
    hasLegacySnapshot: legacyFile !== null,
    lastModified:
      (metaFile?.modifiedTime ? new Date(metaFile.modifiedTime).getTime() : null) ??
      (legacyFile?.modifiedTime ? new Date(legacyFile.modifiedTime).getTime() : null) ??
      (folder.modifiedTime ? new Date(folder.modifiedTime).getTime() : null),
  };
}

async function getOrCreateAppFolder(): Promise<string> {
  if (appFolderId) return appFolderId;

  const searchResponse = await window.gapi!.client.request({
    path: '/drive/v3/files',
    method: 'GET',
    params: {
      q: `(name='${APP_FOLDER_CANDIDATES[0]}' or name='${APP_FOLDER_CANDIDATES[1]}') and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id,name,modifiedTime)',
      spaces: 'drive',
    },
  });

  const files = (searchResponse.result.files as DriveFileMetadata[] | undefined) ?? [];
  if (files.length > 0) {
    const folderStates = await Promise.all(
      files
        .filter((file) => APP_FOLDER_CANDIDATES.includes(file.name as DriveAppFolderName))
        .map((file) => getAppFolderCandidateState(file)),
    );
    const selectedFolder = selectPreferredAppFolder(folderStates);
    if (selectedFolder) {
      clearFolderCacheIfRootChanged(selectedFolder.ref.id, selectedFolder.name);
      return selectedFolder.ref.id;
    }
  }

  const createResponse = await window.gapi!.client.request({
    path: '/drive/v3/files',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: CANONICAL_APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  clearFolderCacheIfRootChanged(
    (createResponse.result as unknown as DriveFileMetadata).id,
    CANONICAL_APP_FOLDER_NAME,
  );
  return (createResponse.result as unknown as DriveFileMetadata).id;
}

// ---------------------------------------------------------------------------
// File operations
// ---------------------------------------------------------------------------

async function findFileInFolder(fileName: string, folderId: string): Promise<string | null> {
  const metadata = await findFileMetadataInFolder(fileName, folderId);
  return metadata?.id ?? null;
}

async function findFileMetadataInFolder(
  fileName: string,
  folderId: string,
): Promise<DriveFileMetadata | null> {
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
  return files[0] ?? null;
}

async function listChildrenInFolder(folderId: string): Promise<DriveFileMetadata[]> {
  const response = await window.gapi!.client.request({
    path: '/drive/v3/files',
    method: 'GET',
    params: {
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,modifiedTime,size)',
      spaces: 'drive',
      pageSize: '1000',
    },
  });

  return (response.result.files as DriveFileMetadata[] | undefined) ?? [];
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

async function findFolderByPath(relativePath: string): Promise<string | null> {
  const segments = relativePath.split('/').filter((segment) => segment.length > 0);
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
    if (existing.length === 0) {
      return null;
    }

    parentId = existing[0].id;
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

  const rootFolderId = await getOrCreateAppFolder();
  const folderId =
    parts.length > 0 ? await findFolderByPathUnder(rootFolderId, parts.join('/')) : rootFolderId;
  if (!folderId) return null;

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

  const rootFolderId = await getOrCreateAppFolder();
  const folderId =
    parts.length > 0 ? await findFolderByPathUnder(rootFolderId, parts.join('/')) : rootFolderId;
  if (!folderId) return null;

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

  const rootFolderId = await getOrCreateAppFolder();
  const folderId =
    parts.length > 0 ? await findFolderByPathUnder(rootFolderId, parts.join('/')) : rootFolderId;
  if (!folderId) return null;

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
    const rootFolderId = await getOrCreateAppFolder();
    const folderId =
      parts.length > 0 ? await findFolderByPathUnder(rootFolderId, parts.join('/')) : rootFolderId;
    if (!folderId) return false;

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
    const rootFolderId = await getOrCreateAppFolder();
    const folderId =
      parts.length > 0 ? await findFolderByPathUnder(rootFolderId, parts.join('/')) : rootFolderId;
    if (!folderId) return;

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

async function deleteFolderByPath(
  relativePath: string,
  preserveNames: string[] = [],
): Promise<void> {
  const folderId = await findFolderByPath(relativePath);
  if (!folderId) return;

  const token = window.gapi!.client.getToken();
  if (!token) return;

  try {
    const children = await listChildrenInFolder(folderId);
    for (const child of children) {
      if (preserveNames.includes(child.name)) {
        continue;
      }

      await fetch(`https://www.googleapis.com/drive/v3/files/${child.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
    }
  } catch {
    // Ignore folder cleanup failures to avoid blocking user flows
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
  renderLoginButton,
  signIn,
  signOut,
  isSignedIn,
  tryRestoreSession,
  trySilentReauth,
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
  deleteFolderByPath,
  getOrCreateSubFolder,
  ensureInitialized,
  ensureDriveAccess,
  getStorageQuota,
};
