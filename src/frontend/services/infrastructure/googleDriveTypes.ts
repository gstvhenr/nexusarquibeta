/**
 * Input -> Output:
 * - input: none.
 * - output: type definitions for Google Drive API integration.
 */

/** Metadata of a file stored in Google Drive. */
export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

/** Token response from Google Identity Services. */
export interface GisTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
}

/** Credential response from Google Sign-In (ID token). */
export interface GoogleIdCredentialResponse {
  credential: string;
  select_by?: string;
  clientId?: string;
}

/** Connection status for Google Drive. */
export type DriveConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/** State of the Google Drive sync feature. */
export interface DriveState {
  status: DriveConnectionStatus;
  userEmail: string | null;
  lastSyncTimestamp: number | null;
  errorMessage: string | null;
}

/** Google Identity Services TokenClient (global window type). */
export interface GisTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
  callback: ((response: GisTokenResponse) => void) | null;
}

/**
 * Augment Window to include Google Identity Services and gapi globals.
 * These are loaded via script tags in index.html.
 */
declare global {
  interface FileSystemDirectoryHandle {
    queryPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
    requestPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
    removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  }

  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: 'read' | 'readwrite';
    }) => Promise<FileSystemDirectoryHandle>;
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleIdCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: string | number;
              logo_alignment?: 'left' | 'center';
            },
          ) => void;
          prompt: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GisTokenResponse) => void;
            error_callback?: (error: { type: string; message?: string }) => void;
            ux_mode?: 'popup' | 'redirect';
            redirect_uri?: string;
            hint?: string;
          }) => GisTokenClient;
          revoke: (token: string, callback: () => void) => void;
        };
      };
    };
    gapi?: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: { apiKey: string; discoveryDocs: string[] }) => Promise<void>;
        getToken: () => { access_token: string } | null;
        setToken: (token: { access_token: string } | null) => void;
        request: (args: {
          path: string;
          method: string;
          params?: Record<string, string>;
          headers?: Record<string, string>;
          body?: string;
        }) => Promise<{ result: Record<string, unknown>; body: string }>;
      };
    };
  }
}
