import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndoRedo } from './useUndoRedo';
import type { AppData } from '../services/infrastructure/api';

// ---------------------------------------------------------------------------
// Minimal AppData stubs — only `globalIdentifierCounter` varies per snapshot
// to make assertions readable. Full AppData shape is irrelevant for undo/redo
// logic; using `as unknown as AppData` per project convention (lessons-learned).
// ---------------------------------------------------------------------------

const makeSnapshot = (counter: number): AppData =>
  ({ globalIdentifierCounter: counter }) as unknown as AppData;

describe('useUndoRedo', () => {
  const persistMock = vi.fn();

  const renderUndoRedo = (initial: AppData) => {
    let currentData = initial;
    const setData = vi.fn((updater: React.SetStateAction<AppData>) => {
      currentData = typeof updater === 'function' ? updater(currentData) : updater;
    });

    const hook = renderHook(({ data }) => useUndoRedo(data, setData, persistMock), {
      initialProps: { data: initial },
    });

    return { hook, setData, getCurrentData: () => currentData };
  };

  it('starts with canUndo and canRedo as false', () => {
    const { hook } = renderUndoRedo(makeSnapshot(1));

    expect(hook.result.current.canUndo).toBe(false);
    expect(hook.result.current.canRedo).toBe(false);
  });

  it('undo restores the previous snapshot', () => {
    const snapshotA = makeSnapshot(1);
    const snapshotB = makeSnapshot(2);

    const { hook } = renderUndoRedo(snapshotB);

    // Simulate: user was at A, then mutated to B
    act(() => hook.result.current.appendToHistory(snapshotA));
    expect(hook.result.current.canUndo).toBe(true);

    // Undo → should restore A
    act(() => hook.result.current.undo());

    expect(persistMock).toHaveBeenCalledWith(
      expect.objectContaining({ globalIdentifierCounter: 1 }),
    );
    expect(hook.result.current.canUndo).toBe(false);
    expect(hook.result.current.canRedo).toBe(true);
  });

  it('redo restores the next snapshot after undo', () => {
    const snapshotA = makeSnapshot(1);
    const snapshotB = makeSnapshot(2);

    const { hook } = renderUndoRedo(snapshotB);

    act(() => hook.result.current.appendToHistory(snapshotA));
    act(() => hook.result.current.undo());

    // Now redo → should restore B
    act(() => {
      // Re-render with snapshot A (as if undo applied it)
      hook.rerender({ data: snapshotA });
    });
    act(() => hook.result.current.redo());

    expect(persistMock).toHaveBeenCalledWith(
      expect.objectContaining({ globalIdentifierCounter: 2 }),
    );
    expect(hook.result.current.canRedo).toBe(false);
  });

  it('sequential undo restores distinct snapshots in correct order', () => {
    const snapshotA = makeSnapshot(1);
    const snapshotB = makeSnapshot(2);
    const snapshotC = makeSnapshot(3);

    const { hook } = renderUndoRedo(snapshotC);

    // Build history: A → B → C (current)
    act(() => {
      hook.result.current.appendToHistory(snapshotA);
      hook.result.current.appendToHistory(snapshotB);
    });

    expect(hook.result.current.canUndo).toBe(true);

    // Undo#1: C → B
    act(() => hook.result.current.undo());
    expect(persistMock).toHaveBeenCalledWith(
      expect.objectContaining({ globalIdentifierCounter: 2 }),
    );

    // Re-render with B to simulate React update
    act(() => hook.rerender({ data: snapshotB }));

    // Undo#2: B → A
    act(() => hook.result.current.undo());
    expect(persistMock).toHaveBeenCalledWith(
      expect.objectContaining({ globalIdentifierCounter: 1 }),
    );

    expect(hook.result.current.canUndo).toBe(false);
    expect(hook.result.current.canRedo).toBe(true);
  });

  it('clearHistory resets both stacks', () => {
    const snapshotA = makeSnapshot(1);
    const snapshotB = makeSnapshot(2);

    const { hook } = renderUndoRedo(snapshotB);

    act(() => hook.result.current.appendToHistory(snapshotA));
    expect(hook.result.current.canUndo).toBe(true);

    act(() => hook.result.current.clearHistory());

    expect(hook.result.current.canUndo).toBe(false);
    expect(hook.result.current.canRedo).toBe(false);
  });

  it('respects HISTORY_LIMIT of 50 entries', () => {
    const { hook } = renderUndoRedo(makeSnapshot(999));

    act(() => {
      for (let i = 0; i < 60; i++) {
        hook.result.current.appendToHistory(makeSnapshot(i));
      }
    });

    // Should only keep last 50
    let undoCount = 0;
    while (hook.result.current.canUndo) {
      act(() => hook.result.current.undo());
      undoCount++;
    }

    expect(undoCount).toBe(50);
  });
});
