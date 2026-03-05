import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useUnifiedEvents } from './useUnifiedEvents';

vi.mock('../context/DataContext', () => ({
  useSystemData: vi.fn(() => ({ agendaEvents: [] })),
  useCoreData: vi.fn(() => ({ projects: [] })),
  useMarketingData: vi.fn(() => ({ marketingActivities: [], prospects: [] })),
  useFinanceData: vi.fn(() => ({ manualExpenses: [], commissions: [], manualIncomes: [] })),
}));

vi.mock('../services/agendaService', () => ({
  agendaService: {
    getUnifiedEvents: vi.fn(() => [{ id: 'evt-1', title: 'Evento Unificado' }]),
  },
}));

import { agendaService } from '../services/agendaService';

describe('useUnifiedEvents', () => {
  it('returns unified events from agendaService', () => {
    // Given — agendaService.getUnifiedEvents mockado com um evento
    const { result } = renderHook(() => useUnifiedEvents());

    // Then — evento retornado pelo serviço
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('evt-1');
  });

  it('calls agendaService.getUnifiedEvents with aggregated context data', () => {
    // Given — contextos mockados com dados vazios
    renderHook(() => useUnifiedEvents());

    // Then — serviço chamado com todos os campos esperados
    expect(agendaService.getUnifiedEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        agendaEvents: expect.any(Array),
        projects: expect.any(Array),
        marketingActivities: expect.any(Array),
        prospects: expect.any(Array),
        manualExpenses: expect.any(Array),
        commissions: expect.any(Array),
        manualIncomes: expect.any(Array),
      }),
    );
  });

  it('returns same reference on re-render when inputs are unchanged (memoized)', () => {
    // Given — hook renderizado
    const { result, rerender } = renderHook(() => useUnifiedEvents());
    const first = result.current;

    // When — re-render sem mudança
    rerender();

    // Then — valor profundamente idêntico
    expect(result.current).toStrictEqual(first);
  });
});
