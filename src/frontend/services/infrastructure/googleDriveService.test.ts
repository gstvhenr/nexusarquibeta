import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type GoogleDriveServiceModule = typeof import('./googleDriveService');

const AUTH_FLAG_KEY = 'nexus_authenticated';
const USER_EMAIL_KEY = 'nexus_user_email';

const originalFetch = globalThis.fetch;

function setupGapi(
  getToken: () => { access_token: string } | null,
  setToken = vi.fn(),
): {
  setToken: ReturnType<typeof vi.fn>;
} {
  (window as typeof window & { gapi?: unknown }).gapi = {
    load: (_api: string, callback: () => void) => callback(),
    client: {
      init: async () => undefined,
      getToken,
      setToken,
      request: async () => ({ result: {}, body: '' }),
    },
  };

  return { setToken };
}

function setupGoogleOauthTokenClient(): {
  initTokenClient: ReturnType<typeof vi.fn>;
} {
  const initTokenClient = vi.fn(
    (config: {
      callback: (response: {
        access_token: string;
        expires_in: number;
        scope: string;
        token_type: string;
      }) => void;
    }) => ({
      callback: null,
      requestAccessToken: () => {
        config.callback({
          access_token: 'silent-token',
          expires_in: 3600,
          scope: 'drive.file',
          token_type: 'Bearer',
        });
      },
    }),
  );

  (window as typeof window & { google?: unknown }).google = {
    accounts: {
      id: {
        initialize: vi.fn(),
        renderButton: vi.fn(),
        prompt: vi.fn(),
      },
      oauth2: {
        initTokenClient,
        revoke: vi.fn(),
      },
    },
  };

  return { initTokenClient };
}

async function importGoogleDriveService(): Promise<GoogleDriveServiceModule> {
  vi.resetModules();
  return import('./googleDriveService');
}

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllEnvs();
});

afterEach(() => {
  delete (window as typeof window & { gapi?: unknown }).gapi;
  delete (window as typeof window & { google?: unknown }).google;
  localStorage.clear();
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('googleDriveService access recovery', () => {
  it('should return false when gapi client is initialized without a token', async () => {
    setupGapi(() => null);

    const { googleDriveService } = await importGoogleDriveService();

    expect(googleDriveService.isSignedIn()).toBe(false);
  });

  it('should return true when gapi client already has a token', async () => {
    setupGapi(() => ({ access_token: 'token' }));

    const { googleDriveService } = await importGoogleDriveService();

    expect(googleDriveService.isSignedIn()).toBe(true);
    await expect(googleDriveService.ensureDriveAccess()).resolves.toBe(true);
  });

  it('should keep access disabled when there is no stored authenticated user', async () => {
    setupGapi(() => null);

    const { googleDriveService } = await importGoogleDriveService();

    await expect(googleDriveService.ensureDriveAccess()).resolves.toBe(false);
  });

  it('should attempt silent token recovery when app identity is already stored', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
    vi.stubEnv('VITE_GOOGLE_API_KEY', 'test-api-key');

    const setToken = vi.fn();
    setupGapi(() => null, setToken);
    const { initTokenClient } = setupGoogleOauthTokenClient();

    localStorage.setItem(AUTH_FLAG_KEY, '1');
    localStorage.setItem(USER_EMAIL_KEY, 'usuario@teste.com');

    globalThis.fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ email: 'usuario@teste.com' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
    ) as unknown as typeof fetch;

    const { googleDriveService } = await importGoogleDriveService();

    await expect(googleDriveService.ensureDriveAccess()).resolves.toBe(true);

    expect(initTokenClient).toHaveBeenCalledTimes(1);
    expect(setToken).toHaveBeenCalledWith({ access_token: 'silent-token' });
    expect(googleDriveService.getState().status).toBe('connected');
    expect(googleDriveService.getState().userEmail).toBe('usuario@teste.com');
  });
});
