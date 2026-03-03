import { useState, useCallback } from 'react';
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
 * @param data     Current live snapshot (read-only reference for undo/redo).
 * @param setData  React state setter for the unified AppData.
 * @param persist  Side-effect to persist a restored snapshot to storage.
 */
export function useUndoRedo(
  data: AppData,
  setData: React.Dispatch<React.SetStateAction<AppData>>,
  persist: (snapshot: AppData) => void,
): UndoRedoApi {
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
    if (historyPast.length === 0) return;

    const previousSnapshot = historyPast[historyPast.length - 1];
    setHistoryPast((previous) => previous.slice(0, -1));
    setHistoryFuture((previous) => {
      const next = [cloneDataSnapshot(data), ...previous];
      return next.length > HISTORY_LIMIT ? next.slice(0, HISTORY_LIMIT) : next;
    });
    applySnapshot(previousSnapshot);
  }, [applySnapshot, data, historyPast]);

  const redo = useCallback(() => {
    if (historyFuture.length === 0) return;

    const [nextSnapshot, ...remaining] = historyFuture;
    setHistoryFuture(remaining);
    appendToHistory(data);
    applySnapshot(nextSnapshot);
  }, [appendToHistory, applySnapshot, data, historyFuture]);

  return {
    appendToHistory,
    clearHistory,
    undo,
    redo,
    canUndo: historyPast.length > 0,
    canRedo: historyFuture.length > 0,
  };
}
