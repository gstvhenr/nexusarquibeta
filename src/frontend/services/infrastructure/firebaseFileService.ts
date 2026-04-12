import { deleteObject, getDownloadURL, ref, uploadBytes, uploadString } from 'firebase/storage';
import { ensureFirebaseReady } from './persistence/firebaseConfig';

async function requireCurrentUserId(): Promise<string> {
  const { auth } = await ensureFirebaseReady();
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error('É necessário estar autenticado para acessar arquivos no Firebase.');
  }

  return uid;
}

function normalizeStoragePath(uid: string, relativePath: string): string {
  return relativePath.startsWith('users/') ? relativePath : `users/${uid}/${relativePath}`;
}

async function uploadFeatureFile(
  feature: string,
  entityId: string,
  file: File,
  filenameOverride?: string,
): Promise<string> {
  const uid = await requireCurrentUserId();
  const { storage } = await ensureFirebaseReady();
  const fileName = filenameOverride || file.name || 'upload.bin';
  const storagePath = normalizeStoragePath(uid, `attachments/${feature}/${entityId}/${fileName}`);

  await uploadBytes(ref(storage, storagePath), file, {
    contentType: file.type || undefined,
  });

  return storagePath;
}

async function uploadAvatarFile(
  clientId: string,
  file: File,
  filenameOverride = 'avatar.jpg',
): Promise<string> {
  const uid = await requireCurrentUserId();
  const { storage } = await ensureFirebaseReady();
  const storagePath = normalizeStoragePath(uid, `avatars/${clientId}/${filenameOverride}`);

  await uploadBytes(ref(storage, storagePath), file, {
    contentType: file.type || 'image/jpeg',
  });

  return storagePath;
}

async function uploadDocumentFile(
  fileId: string,
  sourceId: string,
  file: File,
  filenameOverride?: string,
): Promise<string> {
  const uid = await requireCurrentUserId();
  const { storage } = await ensureFirebaseReady();
  const fileName = filenameOverride || file.name || 'document.bin';
  const storagePath = normalizeStoragePath(uid, `documents/${fileId}/${sourceId}/${fileName}`);

  await uploadBytes(ref(storage, storagePath), file, {
    contentType: file.type || undefined,
  });

  return storagePath;
}

async function uploadDataUrl(
  storagePath: string,
  dataUrl: string,
  metadata?: { contentType?: string },
): Promise<string> {
  const uid = await requireCurrentUserId();
  const { storage } = await ensureFirebaseReady();
  const normalizedPath = normalizeStoragePath(uid, storagePath);

  await uploadString(ref(storage, normalizedPath), dataUrl, 'data_url', metadata);
  return normalizedPath;
}

async function uploadJsonBackup(backupId: string, payload: unknown): Promise<string> {
  const uid = await requireCurrentUserId();
  const { storage } = await ensureFirebaseReady();
  const storagePath = normalizeStoragePath(uid, `backups/${backupId}.json`);

  await uploadString(ref(storage, storagePath), JSON.stringify(payload), 'raw', {
    contentType: 'application/json',
  });

  return storagePath;
}

async function getFileUrl(storagePath: string): Promise<string | null> {
  if (!storagePath) {
    return null;
  }

  const { storage } = await ensureFirebaseReady();
  return getDownloadURL(ref(storage, storagePath));
}

async function downloadFile(storagePath: string): Promise<Blob | null> {
  const url = await getFileUrl(storagePath);
  if (!url) {
    return null;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao baixar arquivo do Firebase Storage: ${response.status}`);
  }

  return response.blob();
}

async function deleteFile(storagePath: string): Promise<void> {
  if (!storagePath) {
    return;
  }

  const { storage } = await ensureFirebaseReady();
  await deleteObject(ref(storage, storagePath));
}

function isManagedFile(storagePath: string | null | undefined): storagePath is string {
  return typeof storagePath === 'string' && storagePath.startsWith('users/');
}

async function deleteManagedFile(storagePath: string | null | undefined): Promise<void> {
  if (!isManagedFile(storagePath)) {
    return;
  }

  await deleteFile(storagePath);
}

async function replaceFeatureFile(
  feature: string,
  entityId: string,
  file: File,
  previousStoragePath?: string | null,
  filenameOverride?: string,
): Promise<string> {
  const nextStoragePath = await uploadFeatureFile(feature, entityId, file, filenameOverride);

  if (previousStoragePath && previousStoragePath !== nextStoragePath) {
    await deleteManagedFile(previousStoragePath);
  }

  return nextStoragePath;
}

export const firebaseFileService = {
  uploadFeatureFile,
  uploadAvatarFile,
  uploadDocumentFile,
  uploadDataUrl,
  uploadJsonBackup,
  replaceFeatureFile,
  downloadFile,
  deleteFile,
  deleteManagedFile,
  isManagedFile,
  getFileUrl,
};
