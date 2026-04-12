/**
 * Input -> Output:
 * - input: binary File/Blob objects + feature/entity context.
 * - output: correctly structured binary file storage on Google Drive (`files/{feature}/{id}/{fileName}`).
 *
 * This layer abstracts path calculation and binary file streaming using the data adapter.
 */

import { driveDataAdapter } from './driveDataAdapter';
import { FILES_FOLDER_NAME } from './driveSyncTypes';

/**
 * Uploads a binary file associated with a specific feature and entity.
 * Path format: `files/{feature}/{entityId}/{name}`
 * @returns The relative path of the uploaded file on the Drive.
 */
async function uploadFeatureFile(
  feature: string,
  entityId: string,
  file: File,
  filenameOverride?: string,
): Promise<string> {
  const mode = await driveDataAdapter.detectAccessMode();
  if (mode === 'none') {
    throw new Error('Nenhum modo de acesso ao Google Drive configurado.');
  }

  const name = filenameOverride || file.name;
  const relativePath = `${FILES_FOLDER_NAME}/${feature}/${entityId}/${name}`;

  await driveDataAdapter.writeRawBinaryFile(mode, relativePath, file);
  return relativePath;
}

/**
 * Downloads a binary file given its relative path.
 * Returns a Blob ready for URL.createObjectURL.
 */
async function downloadFile(relativePath: string): Promise<Blob | null> {
  const mode = await driveDataAdapter.detectAccessMode();
  if (mode === 'none') return null;

  return driveDataAdapter.readRawBinaryFile(mode, relativePath);
}

/**
 * Deletes a binary file given its relative path.
 */
async function deleteFile(relativePath: string): Promise<void> {
  const mode = await driveDataAdapter.detectAccessMode();
  if (mode === 'none') return;
  await driveDataAdapter.deleteFile(mode, relativePath);
}

function isManagedDriveFile(relativePath: string | null | undefined): relativePath is string {
  return typeof relativePath === 'string' && relativePath.startsWith(`${FILES_FOLDER_NAME}/`);
}

async function deleteManagedFile(relativePath: string | null | undefined): Promise<void> {
  if (!isManagedDriveFile(relativePath)) {
    return;
  }

  await deleteFile(relativePath);
}

async function replaceFeatureFile(
  feature: string,
  entityId: string,
  file: File,
  previousRelativePath?: string | null,
  filenameOverride?: string,
): Promise<string> {
  const nextRelativePath = await uploadFeatureFile(feature, entityId, file, filenameOverride);

  if (previousRelativePath && previousRelativePath !== nextRelativePath) {
    await deleteManagedFile(previousRelativePath);
  }

  return nextRelativePath;
}

/**
 * Utility to generate an object URL from a relative Drive path.
 * Remember to call URL.revokeObjectURL when the URL is no longer needed to prevent memory leaks.
 */
async function getFileUrl(relativePath: string): Promise<string | null> {
  const blob = await downloadFile(relativePath);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export const driveFileService = {
  uploadFeatureFile,
  replaceFeatureFile,
  downloadFile,
  deleteFile,
  deleteManagedFile,
  isManagedDriveFile,
  getFileUrl,
};
