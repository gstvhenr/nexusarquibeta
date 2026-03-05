import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AppData } from '../services/infrastructure/api';
import { useLegacyCleanup } from './useLegacyCleanup';

vi.mock('../services/infrastructure/api', () => ({
  api: {
    updateData: vi.fn(),
  },
}));

const makeExpense = (id: string) => ({ id, value: 100 });

describe('useLegacyCleanup', () => {
  it('does not mutate data when cashBoxExpenses is empty', () => {
    // Given — setData mockado e expenses vazio
    const setData = vi.fn();
    renderHook(() => useLegacyCleanup(setData));

    // When — o effect roda; pegamos o updater passado para setData
    const updater = setData.mock.calls[0][0];
    const prevData = { cashBoxExpenses: [] } as unknown as AppData;
    const result = updater(prevData);

    // Then — retorna a mesma referência (sem necessidade de atualização)
    expect(result).toBe(prevData);
  });

  it('does not mutate data when no legacy expenses exist', () => {
    // Given — expenses sem prefixos legacy
    const setData = vi.fn();
    renderHook(() => useLegacyCleanup(setData));

    const updater = setData.mock.calls[0][0];
    const prevData = {
      cashBoxExpenses: [makeExpense('regular_001'), makeExpense('normal_expense')],
    } as unknown as AppData;
    const result = updater(prevData);

    // Then — retorna a mesma referência
    expect(result).toBe(prevData);
  });

  it('removes expenses with demo_cashbox_ prefix', () => {
    // Given — expense com prefixo legacy demo_cashbox_
    const setData = vi.fn();
    renderHook(() => useLegacyCleanup(setData));

    const updater = setData.mock.calls[0][0];
    const prevData = {
      cashBoxExpenses: [makeExpense('demo_cashbox_001'), makeExpense('real_expense')],
    } as unknown as AppData;
    const result = updater(prevData);

    // Then — expense legacy removida, real mantida
    expect(result.cashBoxExpenses).toHaveLength(1);
    expect(result.cashBoxExpenses[0].id).toBe('real_expense');
  });

  it('removes expenses with demo_cashbox_2025_ prefix', () => {
    // Given — expense com prefixo legacy demo_cashbox_2025_
    const setData = vi.fn();
    renderHook(() => useLegacyCleanup(setData));

    const updater = setData.mock.calls[0][0];
    const prevData = {
      cashBoxExpenses: [makeExpense('demo_cashbox_2025_jan'), makeExpense('legit_001')],
    } as unknown as AppData;
    const result = updater(prevData);

    // Then — apenas a expense real sobrevive
    expect(result.cashBoxExpenses).toHaveLength(1);
    expect(result.cashBoxExpenses[0].id).toBe('legit_001');
  });

  it('removes expenses with demo_2025_ prefix', () => {
    // Given — expense com prefixo legacy demo_2025_
    const setData = vi.fn();
    renderHook(() => useLegacyCleanup(setData));

    const updater = setData.mock.calls[0][0];
    const prevData = {
      cashBoxExpenses: [makeExpense('demo_2025_expense'), makeExpense('real_2025_expense')],
    } as unknown as AppData;
    const result = updater(prevData);

    // Then — apenas a expense sem prefixo demo_ sobrevive
    expect(result.cashBoxExpenses).toHaveLength(1);
    expect(result.cashBoxExpenses[0].id).toBe('real_2025_expense');
  });

  it('returns prevData unchanged if cashBoxExpenses is not an array', () => {
    // Given — prevData sem cashBoxExpenses
    const setData = vi.fn();
    renderHook(() => useLegacyCleanup(setData));

    const updater = setData.mock.calls[0][0];
    const prevData = {} as unknown as AppData;
    const result = updater(prevData);

    // Then — retorna a mesma referência sem erro
    expect(result).toBe(prevData);
  });
});
