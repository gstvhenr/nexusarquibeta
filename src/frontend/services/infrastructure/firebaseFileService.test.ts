import { beforeEach, describe, expect, it, vi } from 'vitest';

const uploadBytesMock = vi.fn();
const uploadStringMock = vi.fn();
const deleteObjectMock = vi.fn();
const getDownloadURLMock = vi.fn();
const refMock = vi.fn((_storage, path: string) => ({ fullPath: path }));

vi.mock('firebase/storage', () => ({
  deleteObject: deleteObjectMock,
  getDownloadURL: getDownloadURLMock,
  ref: refMock,
  uploadBytes: uploadBytesMock,
  uploadString: uploadStringMock,
}));

vi.mock('./persistence/firebaseConfig', () => ({
  ensureFirebaseReady: vi.fn(async () => ({
    auth: {
      currentUser: {
        uid: 'user-123',
      },
    },
    storage: {},
  })),
  isFirebaseConfigured: vi.fn(() => true),
}));

describe('firebaseFileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upload an avatar file under the managed Firebase Storage path', async () => {
    const { firebaseFileService } = await import('./firebaseFileService');
    const file = new File(['avatar'], 'foto.jpg', { type: 'image/jpeg' });

    const storagePath = await firebaseFileService.uploadAvatarFile('client-1', file);

    expect(storagePath).toBe('users/user-123/avatars/client-1/avatar.jpg');
    expect(uploadBytesMock).toHaveBeenCalledWith(
      { fullPath: 'users/user-123/avatars/client-1/avatar.jpg' },
      file,
      expect.objectContaining({
        contentType: 'image/jpeg',
      }),
    );
  });

  it('should ignore deletes for non-managed paths', async () => {
    const { firebaseFileService } = await import('./firebaseFileService');

    await firebaseFileService.deleteManagedFile('legacy/path/avatar.jpg');

    expect(deleteObjectMock).not.toHaveBeenCalled();
  });
});
