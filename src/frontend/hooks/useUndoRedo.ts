import { useState, useCallback, useRef } from 'react';
import type { AppData } from '../services/infrastructure/api';

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const HISTORY_LIMIT = 50;

const cloneDataSnapshot = (snapshot: AppData): AppData => {
  if (typeof structuredClone === 'function') {
    return structuredClone(snapshot);
  }
  return JSON.parse(JSON.stringify(snapshot)) as AppData;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UndoRedoApi {
  /** Push current data snapshot to history before a mutation. */
  appendToHistory: (snapshot: AppData) => void;
  /** Clear entire undo/redo history. */
  clearHistory: () => void;
  /** Undo: restore previous snapshot, push current to future. */
  undo: () => void;
  /** Redo: restore next snapshot, push current to past. */
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Self-contained undo/redo engine for the unified AppData state.
 *
 * Uses `useRef` for `data` to avoid stale closures in `undo`/`redo`,
 * and functional updaters for history arrays to guarantee access to the
 * latest state even under batched React updates.
 *
 * @param data     Current live snapshot (read-only reference for undo/redo).
 * @param setData  React state setter for the unified AppData.
 * @param persist  Side-effect to persist a restored snapshot to storage.
 */
export function useUndoRedo(
  data: AppData,
  setData: React.Dispatch<React.SetStateAction<AppData>>,
  persist: (snapshot: AppData) => void,
): UndoRedoApi {
  // Keep a ref to the latest data so undo/redo always read the fresh value,
  // even when React batches state updates and the closure would be stale.
  const dataRef = useRef(data);
  dataRef.current = data;

  const [historyPast, setHistoryPast] = useState<AppData[]>([]);
  const [historyFuture, setHistoryFuture] = useState<AppData[]>([]);

  const clearHistory = useCallback(() => {
    setHistoryPast([]);
    setHistoryFuture([]);
  }, []);

  const appendToHistory = useCallback((snapshot: AppData) => {
    setHistoryPast((previous) => {
      const next = [...previous, cloneDataSnapshot(snapshot)];
      return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
    });
  }, []);

  const applySnapshot = useCallback(
    (snapshot: AppData) => {
      const snapshotClone = cloneDataSnapshot(snapshot);
      setData(snapshotClone);
      persist(snapshotClone);
    },
    [setData, persist],
  );

  const undo = useCallback(() => {
    setHistoryPast((previous) => {
      if (previous.length === 0) return previous;

      const previousSnapshot = previous[previous.length - 1];

      setHistoryFuture((prevFuture) => {
        const next = [cloneDataSnapshot(dataRef.current), ...prevFuture];
        return next.length > HISTORY_LIMIT ? next.slice(0, HISTORY_LIMIT) : next;
      });

      applySnapshot(previousSnapshot);
      return previous.slice(0, -1);
    });
  }, [applySnapshot]);

  const redo = useCallback(() => {
    setHistoryFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;

      const [nextSnapshot, ...remaining] = prevFuture;
      appendToHistory(dataRef.current);
      applySnapshot(nextSnapshot);
      return remaining;
    });
  }, [appendToHistory, applySnapshot]);

  return {
    appendToHistory,
    clearHistory,
    undo,
    redo,
    canUndo: historyPast.length > 0,
    canRedo: historyFuture.length > 0,
  };
}
