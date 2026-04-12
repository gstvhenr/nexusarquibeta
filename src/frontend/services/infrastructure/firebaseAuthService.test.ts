import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const onAuthStateChangedMock = vi.fn();
const signInWithPopupMock = vi.fn();
const signOutMock = vi.fn();

class GoogleAuthProviderMock {
  public readonly setCustomParameters = vi.fn();
}

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: GoogleAuthProviderMock,
  onAuthStateChanged: onAuthStateChangedMock,
  signInWithPopup: signInWithPopupMock,
  signOut: signOutMock,
}));

vi.mock('./persistence/firebaseConfig', () => ({
  ensureFirebaseReady: vi.fn(async () => ({
    auth: { currentUser: null },
  })),
  isFirebaseConfigured: vi.fn(() => true),
  getFirebaseConfigurationError: vi.fn(() => null),
}));

describe('firebaseAuthService', () => {
  beforeEach(() => {
    vi.resetModules();
    onAuthStateChangedMock.mockReset();
    signInWithPopupMock.mockReset();
    signOutMock.mockReset();
  });

  afterEach(async () => {
    const { firebaseAuthService } = await import('./firebaseAuthService');
    firebaseAuthService.resetForTest();
  });

  it('should restore an authenticated session from the Firebase auth observer', async () => {
    onAuthStateChangedMock.mockImplementation((_auth, next) => {
      next({
        email: 'rafael@nexus-arqui.test',
        displayName: 'Rafael',
      });
      return vi.fn();
    });

    const { firebaseAuthService } = await import('./firebaseAuthService');

    await expect(firebaseAuthService.tryRestoreSession()).resolves.toBe(true);
    expect(firebaseAuthService.getState()).toMatchObject({
      status: 'authenticated',
      userEmail: 'rafael@nexus-arqui.test',
      userName: 'Rafael',
    });
  });

  it('should trigger Google popup sign-in through Firebase Auth', async () => {
    onAuthStateChangedMock.mockImplementation((_auth, next) => {
      next(null);
      return vi.fn();
    });
    signInWithPopupMock.mockResolvedValue(undefined);

    const { firebaseAuthService } = await import('./firebaseAuthService');

    await firebaseAuthService.signIn();

    expect(signInWithPopupMock).toHaveBeenCalledTimes(1);
    expect(firebaseAuthService.getState().status).toBe('authenticating');
  });
});
