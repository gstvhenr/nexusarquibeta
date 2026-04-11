import { useState, useEffect } from 'react';
import { driveSyncEngine } from '../services/infrastructure/driveSyncEngine';
import type { SyncEngineState } from '../services/infrastructure/driveSyncTypes';

export function useDriveSync(): SyncEngineState & {
  forcePush: () => Promise<void>;
  forcePull: () => Promise<void>;
} {
  const [state, setState] = useState<SyncEngineState>(driveSyncEngine.getState());

  useEffect(() => {
    const unsubscribe = driveSyncEngine.subscribe((newState) => {
      setState(newState);
    });

    // Check initial state in case it changed between mounting and subscribing
    setState(driveSyncEngine.getState());

    return unsubscribe;
  }, []);

  return {
    ...state,
    forcePush: driveSyncEngine.forcePush,
    forcePull: driveSyncEngine.forcePull,
  };
}
