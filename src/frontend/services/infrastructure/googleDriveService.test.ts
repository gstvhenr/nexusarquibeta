import { afterEach, describe, expect, it } from 'vitest';
import { googleDriveService } from './googleDriveService';

describe('googleDriveService.isSignedIn', () => {
  afterEach(() => {
    delete (window as typeof window & { gapi?: unknown }).gapi;
  });

  it('should return false when gapi client is not initialized yet', () => {
    (window as typeof window & { gapi?: unknown }).gapi = {
      load: () => undefined,
      client: {
        init: async () => undefined,
        getToken: () => null,
        setToken: () => undefined,
        request: async () => ({ result: {}, body: '' }),
      },
    };

    expect(googleDriveService.isSignedIn()).toBe(false);
  });

  it('should return true when gapi client has a token', () => {
    (window as typeof window & { gapi?: unknown }).gapi = {
      load: () => undefined,
      client: {
        init: async () => undefined,
        getToken: () => ({ access_token: 'token' }),
        setToken: () => undefined,
        request: async () => ({ result: {}, body: '' }),
      },
    };

    expect(googleDriveService.isSignedIn()).toBe(true);
  });
});
