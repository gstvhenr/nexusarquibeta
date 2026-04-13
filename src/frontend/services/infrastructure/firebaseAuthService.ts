import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  ensureFirebaseReady,
  getFirebaseConfigurationError,
  isFirebaseConfigured,
} from './persistence/firebaseConfig';

/**
 * E-mails autorizados a acessar o NexusArqui.
 * Qualquer outro e-mail será rejeitado após autenticação Google.
 * Segurança real: Firestore/Storage rules replicam esta lista server-side.
 */
const ALLOWED_EMAILS: ReadonlySet<string> = new Set([
  'rafaelmunaroarquitetura@gmail.com',
  'gustavohenrique.dlr@gmail.com',
  'gustavohenrique.adb@gmail.com',
]);

function isEmailAllowed(email: string | null): boolean {
  return email !== null && ALLOWED_EMAILS.has(email.toLowerCase());
}

type FirebaseAuthStatus =
  | 'initializing'
  | 'authenticating'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

interface FirebaseAuthState {
  status: FirebaseAuthStatus;
  userEmail: string | null;
  userName: string | null;
  errorMessage: string | null;
  isConfigured: boolean;
}

type AuthListener = (state: FirebaseAuthState) => void;

const listeners = new Set<AuthListener>();
let initialized = false;
let authBootstrapPromise: Promise<boolean> | null = null;
let authStateUnsubscribe: (() => void) | null = null;
let currentUser: User | null = null;

let state: FirebaseAuthState = {
  status: isFirebaseConfigured() ? 'initializing' : 'error',
  userEmail: null,
  userName: null,
  errorMessage: isFirebaseConfigured() ? null : getFirebaseConfigurationError(),
  isConfigured: isFirebaseConfigured(),
};

function emitState(): void {
  listeners.forEach((listener) => listener(state));
}

function setState(nextState: Partial<FirebaseAuthState>): void {
  state = { ...state, ...nextState };
  emitState();
}

function applyUserState(user: User | null): void {
  if (user && !isEmailAllowed(user.email)) {
    currentUser = null;
    void rejectUnauthorizedUser(user);
    return;
  }

  currentUser = user;
  setState({
    status: user ? 'authenticated' : 'unauthenticated',
    userEmail: user?.email ?? null,
    userName: user?.displayName ?? null,
    errorMessage: null,
  });
}

async function rejectUnauthorizedUser(user: User): Promise<void> {
  const rejectedEmail = user.email ?? 'desconhecido';

  try {
    const { auth } = await ensureFirebaseReady();
    await firebaseSignOut(auth);
  } catch {
    // Sign-out failure is non-critical here; the user is already rejected client-side.
  }

  setState({
    status: 'error',
    userEmail: null,
    userName: null,
    errorMessage: `Acesso negado: o e-mail ${rejectedEmail} não está autorizado a usar o NexusArqui.`,
  });
}

async function ensureInitialized(): Promise<boolean> {
  if (initialized) {
    return state.status === 'authenticated';
  }

  if (!authBootstrapPromise) {
    authBootstrapPromise = (async () => {
      if (!isFirebaseConfigured()) {
        setState({
          status: 'error',
          errorMessage: getFirebaseConfigurationError(),
          isConfigured: false,
        });
        initialized = true;
        return false;
      }

      try {
        const { auth } = await ensureFirebaseReady();

        await new Promise<void>((resolve) => {
          let isFirstEmission = true;

          authStateUnsubscribe = onAuthStateChanged(
            auth,
            (user) => {
              applyUserState(user);
              if (isFirstEmission) {
                isFirstEmission = false;
                initialized = true;
                resolve();
              }
            },
            (error) => {
              setState({
                status: 'error',
                errorMessage: error instanceof Error ? error.message : String(error),
              });
              if (isFirstEmission) {
                isFirstEmission = false;
                initialized = true;
                resolve();
              }
            },
          );
        });
      } catch (error) {
        setState({
          status: 'error',
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        initialized = true;
      }

      return state.status === 'authenticated';
    })();
  }

  return authBootstrapPromise;
}

async function tryRestoreSession(): Promise<boolean> {
  return ensureInitialized();
}

async function signIn(): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new Error(getFirebaseConfigurationError() ?? 'Firebase não configurado.');
  }

  await ensureInitialized();

  const { auth } = await ensureFirebaseReady();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  setState({
    status: 'authenticating',
    errorMessage: null,
  });

  try {
    const result = await signInWithPopup(auth, provider);

    if (!isEmailAllowed(result.user.email)) {
      await rejectUnauthorizedUser(result.user);
      throw new Error(
        `Acesso negado: o e-mail ${result.user.email ?? 'desconhecido'} não está autorizado a usar o NexusArqui.`,
      );
    }
  } catch (error) {
    setState({
      status: currentUser ? 'authenticated' : 'error',
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function signOut(): Promise<void> {
  if (!isFirebaseConfigured()) {
    return;
  }

  const { auth } = await ensureFirebaseReady();
  await firebaseSignOut(auth);
}

function subscribe(listener: AuthListener): () => void {
  listeners.add(listener);
  void ensureInitialized();
  listener(state);

  return () => {
    listeners.delete(listener);
  };
}

function getState(): FirebaseAuthState {
  return state;
}

function getCurrentUser(): User | null {
  return currentUser;
}

function isAuthenticated(): boolean {
  return currentUser !== null;
}

function resetForTest(): void {
  authStateUnsubscribe?.();
  authStateUnsubscribe = null;
  authBootstrapPromise = null;
  initialized = false;
  currentUser = null;
  state = {
    status: isFirebaseConfigured() ? 'initializing' : 'error',
    userEmail: null,
    userName: null,
    errorMessage: isFirebaseConfigured() ? null : getFirebaseConfigurationError(),
    isConfigured: isFirebaseConfigured(),
  };
  listeners.clear();
}

export const firebaseAuthService = {
  tryRestoreSession,
  signIn,
  signOut,
  subscribe,
  getState,
  getCurrentUser,
  isAuthenticated,
  resetForTest,
};
