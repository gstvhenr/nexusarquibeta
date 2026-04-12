import type {
  PersistencePort,
  PersistenceSyncState,
  RealtimePersistencePort,
} from './persistence/PersistencePort';
import { createPersistenceAdapter, isRealtimePersistencePort } from './persistence';
import type {
  SyncEngineListener,
  SyncEngineState,
  SyncOperationAction,
  SyncOperationCause,
  SyncOperationResult,
} from './cloudSyncTypes';

const PAUSE_STORAGE_KEY = 'nexus_cloud_sync_paused';

const INITIAL_STATE: SyncEngineState = {
  status: 'offline',
  accessMode: 'none',
  lastSyncTimestamp: null,
  dirtyDomains: [],
  dirtyPreferences: [],
  errorMessage: null,
  quota: null,
  retryScheduledAt: null,
  pendingChangesCount: 0,
  isPaused: false,
};

const listeners = new Set<SyncEngineListener>();
let state: SyncEngineState = { ...INITIAL_STATE };
let flushPersistenceAsync: (() => Promise<void>) | null = null;
let realtimePersistence: RealtimePersistencePort | null = null;
let syncStateUnsubscribe: (() => void) | null = null;
let cachedPersistenceAdapter: PersistencePort | null = null;

function readPausedFlag(): boolean {
  try {
    return localStorage.getItem(PAUSE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writePausedFlag(paused: boolean): void {
  try {
    if (paused) {
      localStorage.setItem(PAUSE_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(PAUSE_STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable — ignore
  }
}

function emitState(): void {
  listeners.forEach((listener) => listener(state));
}

function setState(nextState: Partial<SyncEngineState>): void {
  state = { ...state, ...nextState };
  emitState();
}

function clearDirtyState(): void {
  setState({
    dirtyDomains: [],
    dirtyPreferences: [],
    pendingChangesCount: 0,
  });
}

function applyRealtimeSyncState(syncState: PersistenceSyncState): void {
  const pendingChangesCount = Math.max(
    syncState.pendingWrites,
    state.dirtyDomains.length + state.dirtyPreferences.length,
  );

  setState({
    status: syncState.status,
    accessMode: syncState.accessMode,
    lastSyncTimestamp: syncState.lastSyncTimestamp,
    errorMessage: syncState.errorMessage,
    retryScheduledAt: syncState.retryScheduledAt,
    quota: syncState.quota,
    pendingChangesCount,
  });

  if (syncState.status === 'idle' && syncState.pendingWrites === 0) {
    clearDirtyState();
  }
}

function ensureRealtimeBinding(adapter: PersistencePort): void {
  if (!isRealtimePersistencePort(adapter)) {
    realtimePersistence = null;
    setState({
      status: 'offline',
      accessMode: 'none',
      errorMessage: null,
      retryScheduledAt: null,
      quota: null,
    });
    return;
  }

  if (realtimePersistence === adapter && syncStateUnsubscribe) {
    return;
  }

  syncStateUnsubscribe?.();
  realtimePersistence = adapter;
  syncStateUnsubscribe = adapter.subscribeSyncState((syncState) => {
    applyRealtimeSyncState(syncState);
  });
}

async function initialize(nextFlushPersistenceAsync: () => Promise<void>): Promise<void> {
  flushPersistenceAsync = nextFlushPersistenceAsync;
  cachedPersistenceAdapter = createPersistenceAdapter();

  const wasPaused = readPausedFlag();
  if (wasPaused) {
    setState({
      isPaused: true,
      status: 'offline',
      accessMode: 'none',
      errorMessage: null,
    });
    return;
  }

  ensureRealtimeBinding(cachedPersistenceAdapter);
}

function notifyDomainChanged(domainKey: string, previousValue: unknown, nextValue: unknown): void {
  if (JSON.stringify(previousValue) === JSON.stringify(nextValue)) {
    return;
  }

  if (!state.dirtyDomains.includes(domainKey)) {
    const nextDirtyDomains = [...state.dirtyDomains, domainKey];
    setState({
      dirtyDomains: nextDirtyDomains,
      pendingChangesCount: nextDirtyDomains.length + state.dirtyPreferences.length,
      status: state.accessMode === 'firebase' ? 'syncing' : state.status,
    });
  }
}

function notifyPreferenceChanged(key: string): void {
  if (state.dirtyPreferences.includes(key)) {
    return;
  }

  const nextDirtyPreferences = [...state.dirtyPreferences, key];
  setState({
    dirtyPreferences: nextDirtyPreferences,
    pendingChangesCount: state.dirtyDomains.length + nextDirtyPreferences.length,
    status: state.accessMode === 'firebase' ? 'syncing' : state.status,
  });
}

function handleLocalReset(): void {
  clearDirtyState();
}

function buildResult(
  action: SyncOperationAction,
  ok: boolean,
  cause: SyncOperationCause,
  message: string | null,
  overrides?: Partial<SyncOperationResult>,
): SyncOperationResult {
  return {
    ok,
    action,
    cause,
    accessMode: state.accessMode,
    message,
    performedPush: ok && action !== 'forcePull',
    performedPull: ok && action === 'forcePull',
    attemptedLocalRepermission: false,
    attemptedApiReauth: false,
    pendingChangesCount: state.pendingChangesCount,
    ...overrides,
  };
}

async function flushPendingWrites(): Promise<SyncOperationResult> {
  if (!flushPersistenceAsync) {
    return buildResult(
      'flushPendingWrites',
      false,
      'push_failed',
      'A fila de persistência ainda não foi inicializada.',
    );
  }

  try {
    await flushPersistenceAsync();
    return buildResult(
      'flushPendingWrites',
      true,
      'success',
      'Alterações locais persistidas com sucesso.',
    );
  } catch (error) {
    return buildResult(
      'flushPendingWrites',
      false,
      'push_failed',
      error instanceof Error ? error.message : 'Falha ao persistir alterações locais.',
    );
  }
}

async function forcePush(): Promise<SyncOperationResult> {
  const flushResult = await flushPendingWrites();
  if (!flushResult.ok) {
    return buildResult(
      'forcePush',
      false,
      'push_failed',
      flushResult.message ?? 'Falha ao enviar alterações.',
      {
        performedPush: false,
        performedPull: false,
      },
    );
  }

  return buildResult('forcePush', true, 'success', 'Sincronização com Firebase iniciada.', {
    performedPush: true,
    performedPull: false,
  });
}

async function forcePull(): Promise<SyncOperationResult> {
  if (!realtimePersistence) {
    return buildResult('forcePull', false, 'no_access', 'Firebase indisponível neste ambiente.', {
      performedPush: false,
      performedPull: false,
    });
  }

  try {
    await realtimePersistence.forceReconnect();
    clearDirtyState();
    return buildResult('forcePull', true, 'success', 'Estado remoto recarregado do Firebase.', {
      performedPush: false,
      performedPull: true,
    });
  } catch (error) {
    return buildResult(
      'forcePull',
      false,
      'pull_failed',
      error instanceof Error ? error.message : 'Falha ao recarregar estado remoto.',
      {
        performedPush: false,
        performedPull: false,
      },
    );
  }
}

async function reconnect(): Promise<void> {
  if (!realtimePersistence) {
    return;
  }

  await realtimePersistence.forceReconnect();
}

async function reconnectWithRepermission(): Promise<SyncOperationResult> {
  if (!realtimePersistence) {
    return buildResult(
      'reconnectWithRepermission',
      false,
      'no_access',
      'Firebase indisponível neste ambiente.',
      {
        attemptedApiReauth: false,
        attemptedLocalRepermission: false,
        performedPush: false,
        performedPull: false,
      },
    );
  }

  try {
    await realtimePersistence.forceReconnect();
    return buildResult(
      'reconnectWithRepermission',
      true,
      'success',
      'Conexão com Firebase restabelecida.',
      {
        attemptedApiReauth: true,
        attemptedLocalRepermission: false,
        performedPush: false,
        performedPull: false,
      },
    );
  } catch (error) {
    return buildResult(
      'reconnectWithRepermission',
      false,
      'reconnect_failed',
      error instanceof Error ? error.message : 'Falha ao reconectar com Firebase.',
      {
        attemptedApiReauth: true,
        attemptedLocalRepermission: false,
        performedPush: false,
        performedPull: false,
      },
    );
  }
}

function subscribe(listener: SyncEngineListener): () => void {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

function getState(): SyncEngineState {
  return state;
}

function pause(): void {
  writePausedFlag(true);
  syncStateUnsubscribe?.();
  syncStateUnsubscribe = null;
  realtimePersistence = null;
  setState({
    isPaused: true,
    status: 'offline',
    accessMode: 'none',
    errorMessage: null,
    retryScheduledAt: null,
    quota: null,
  });
}

function resume(): void {
  writePausedFlag(false);
  setState({ isPaused: false });
  if (cachedPersistenceAdapter) {
    ensureRealtimeBinding(cachedPersistenceAdapter);
  }
}

function destroy(): void {
  syncStateUnsubscribe?.();
  syncStateUnsubscribe = null;
  realtimePersistence = null;
  cachedPersistenceAdapter = null;
  flushPersistenceAsync = null;
  state = { ...INITIAL_STATE };
  listeners.clear();
}

export const firebaseSyncEngine = {
  initialize,
  notifyDomainChanged,
  notifyPreferenceChanged,
  handleLocalReset,
  flushPendingWrites,
  forcePush,
  forcePull,
  reconnect,
  reconnectWithRepermission,
  subscribe,
  getState,
  pause,
  resume,
  destroy,
};
