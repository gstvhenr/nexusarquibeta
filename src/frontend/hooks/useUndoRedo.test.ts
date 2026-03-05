import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AppData } from '../services/infrastructure/api';
import { useUndoRedo } from './useUndoRedo';

const makeData = (n: number): AppData => ({ __version: n } as unknown as AppData);

describe('useUndoRedo', () => {
  it('starts with canUndo=false and canRedo=false', () => {
    // Given — hook inicializado sem histórico
    const setData = vi.fn();
    const persist = vi.fn();
    const data = makeData(0);

    const { result } = renderHook(() => useUndoRedo(data, setData, persist));

    // Then — sem histórico inicial
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('appendToHistory enables canUndo', () => {
    // Given — hook sem histórico
    const setData = vi.fn();
    const persist = vi.fn();
    let data = makeData(0);
    const { result, rerender } = renderHook(() => useUndoRedo(data, setData, persist));

    // When — snapshot é adicionado ao histórico
    act(() => {
      result.current.appendToHistory(makeData(0));
    });
    data = makeData(1);
    rerender();

    // Then — undo está disponível
    expect(result.current.canUndo).toBe(true);
  });

  it('clearHistory resets past and future', () => {
    // Given — hook com snapshot no histórico
    const setData = vi.fn();
    const persist = vi.fn();
    const { result } = renderHook(() => useUndoRedo(makeData(0), setData, persist));

    act(() => {
      result.current.appendToHistory(makeData(0));
    });

    // When — histórico é limpo
    act(() => {
      result.current.clearHistory();
    });

    // Then — sem histórico
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('undo restores previous snapshot', () => {
    // Given — snapshot anterior guardado
    const setData = vi.fn();
    const persist = vi.fn();
    const snapshot = makeData(42);
    let data = makeData(99);
    const { result, rerender } = renderHook(() => useUndoRedo(data, setData, persist));

    act(() => {
      result.current.appendToHistory(snapshot);
    });
    data = makeData(99);
    rerender();

    // When — undo é executado
    act(() => {
      result.current.undo();
    });

    // Then — setData chamado com o snapshot anterior
    expect(setData).toHaveBeenCalledWith(expect.objectContaining({ __version: 42 }));
  });

  it('undo does nothing when there is no history', () => {
    // Given — histórico vazio
    const setData = vi.fn();
    const persist = vi.fn();
    const { result } = renderHook(() => useUndoRedo(makeData(0), setData, persist));

    // When — undo chamado sem histórico
    act(() => {
      result.current.undo();
    });

    // Then — setData não é chamado
    expect(setData).not.toHaveBeenCalled();
  });

  it('redo restores snapshot from future stack', () => {
    // Given — snapshot anterior + undo executado
    const setData = vi.fn();
    const persist = vi.fn();
    const snapshot = makeData(1);
    let data: AppData = makeData(2);
    const { result, rerender } = renderHook(() => useUndoRedo(data, setData, persist));

    act(() => {
      result.current.appendToHistory(snapshot);
    });
    data = makeData(2);
    rerender();

    act(() => {
      result.current.undo();
    });
    setData.mockClear();

    // Simula avanço: data agora é snapshot restaurado
    data = snapshot;
    rerender();

    // When — redo é executado
    act(() => {
      result.current.redo();
    });

    // Then — setData chamado com o estado mais recente
    expect(setData).toHaveBeenCalled();
  });

  it('redo does nothing when future stack is empty', () => {
    // Given — sem estados futuros
    const setData = vi.fn();
    const persist = vi.fn();
    const { result } = renderHook(() => useUndoRedo(makeData(0), setData, persist));

    // When — redo chamado sem futuros
    act(() => {
      result.current.redo();
    });

    // Then — setData não é chamado
    expect(setData).not.toHaveBeenCalled();
  });

  it('persist is called when undo/redo restores a snapshot', () => {
    // Given — snapshot no histórico e persist mockado
    const setData = vi.fn();
    const persist = vi.fn();
    let data = makeData(0);
    const { result, rerender } = renderHook(() => useUndoRedo(data, setData, persist));

    act(() => {
      result.current.appendToHistory(makeData(5));
    });
    data = makeData(10);
    rerender();

    // When — undo chama a restauração
    act(() => {
      result.current.undo();
    });

    // Then — persist é chamado com o snapshot restaurado
    expect(persist).toHaveBeenCalledWith(expect.objectContaining({ __version: 5 }));
  });

  it('appendToHistory truncates past stack at HISTORY_LIMIT (50)', () => {
    // Given — hook limpo
    const setData = vi.fn();
    const persist = vi.fn();
    let data = makeData(0);
    const { result, rerender } = renderHook(() => useUndoRedo(data, setData, persist));

    // When — 55 snapshots adicionados (acima do limite de 50)
    act(() => {
      for (let i = 0; i < 55; i++) {
        result.current.appendToHistory(makeData(i));
      }
    });

    data = makeData(999);
    rerender();

    // Executa 50 undos para drenar o histórico completamente
    act(() => {
      for (let i = 0; i < 50; i++) {
        result.current.undo();
      }
    });

    // Then — canUndo false após 50 undos (histórico foi truncado em 50)
    expect(result.current.canUndo).toBe(false);
  });
});
