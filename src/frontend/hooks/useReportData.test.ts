import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useReportData } from './useReportData';

vi.mock('../context/DataContext', () => ({
  useCoreData: vi.fn(() => ({
    projects: [{ id: 'p1' }],
    clients: [{ id: 'c1' }],
    proposals: [{ id: 'pr1' }],
  })),
  useFinanceData: vi.fn(() => ({
    commissions: [{ id: 'co1' }],
    manualExpenses: [{ id: 'me1' }],
  })),
  useMarketingData: vi.fn(() => ({
    marketingActivities: [{ id: 'ma1' }],
  })),
  useSupplyChainData: vi.fn(() => ({
    freelancers: [{ id: 'f1' }],
  })),
}));

describe('useReportData', () => {
  it('returns assembled report data from domain contexts', () => {
    // Given — todos os contextos mockados com um item cada
    const { result } = renderHook(() => useReportData());

    // Then — payload completo retornado
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.clients).toHaveLength(1);
    expect(result.current.proposals).toHaveLength(1);
    expect(result.current.commissions).toHaveLength(1);
    expect(result.current.manualExpenses).toHaveLength(1);
    expect(result.current.marketingActivities).toHaveLength(1);
    expect(result.current.freelancers).toHaveLength(1);
  });

  it('returns same reference on subsequent renders (memoized)', () => {
    // Given — hook renderizado
    const { result, rerender } = renderHook(() => useReportData());
    const first = result.current;

    // When — re-render sem mudança de dados
    rerender();

    // Then — valor profundamente idêntico (memoização via useMemo + mocks estáveis)
    expect(result.current).toStrictEqual(first);
  });
});
