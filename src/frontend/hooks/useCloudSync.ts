import { useEffect, useState } from 'react';
import { firebaseSyncEngine } from '../services/infrastructure/firebaseSyncEngine';
import type {
  SyncEngineState,
  SyncOperationResult,
} from '../services/infrastructure/cloudSyncTypes';

export function useCloudSync(): SyncEngineState & {
  forcePush: () => Promise<SyncOperationResult>;
  forcePull: () => Promise<SyncOperationResult>;
  flushPendingWrites: () => Promise<SyncOperationResult>;
  reconnect: () => Promise<void>;
  reconnectWithRepermission: () => Promise<SyncOperationResult>;
  pause: () => void;
  resume: () => void;
} {
  const [state, setState] = useState<SyncEngineState>(firebaseSyncEngine.getState());

  useEffect(() => {
    const unsubscribe = firebaseSyncEngine.subscribe((nextState) => {
      setState(nextState);
    });

    setState(firebaseSyncEngine.getState());
    return unsubscribe;
  }, []);

  return {
    ...state,
    forcePush: firebaseSyncEngine.forcePush,
    forcePull: firebaseSyncEngine.forcePull,
    flushPendingWrites: firebaseSyncEngine.flushPendingWrites,
    reconnect: firebaseSyncEngine.reconnect,
    reconnectWithRepermission: firebaseSyncEngine.reconnectWithRepermission,
    pause: firebaseSyncEngine.pause,
    resume: firebaseSyncEngine.resume,
  };
}
