import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFinanceSeriesPage } from './useFinanceSeriesPage';

vi.mock('../context/DataContext', () => ({
  useCoreData: vi.fn(() => ({ projects: [] })),
  useFinanceData: vi.fn(() => ({
    commissions: [],
    manualExpenses: [],
    manualIncomes: [],
    cashBoxExpenses: [],
    cashBoxCredits: [],
  })),
  useMarketingData: vi.fn(() => ({ marketingActivities: [] })),
  useSupplyChainData: vi.fn(() => ({ freelancers: [] })),
  useSystemData: vi.fn(() => ({ hiredServices: [] })),
}));

vi.mock('../constants', () => ({
  NAV_LINKS: [{ label: 'Financeiro', icon: '💰', children: [] }],
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyConfig = any;

const makeConfig = (): AnyConfig => ({
  getFilterOptions: vi.fn(() => ({
    origins: ['Profissional', 'Pessoal'],
    categories: ['Operacional'],
    items: ['Aluguel'],
  })),
  getSeries: vi.fn(() => [{ date: '2026-01', value: 1000 }]),
});

describe('useFinanceSeriesPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial state values', () => {
    // Given — config mockada
    const config = makeConfig();
    const { result } = renderHook(() => useFinanceSeriesPage(config));

    // Then — estado inicial correto
    expect(result.current.period.mode).toBe('LAST_12_MONTHS');
    expect(result.current.filters.values).toEqual({});
    expect(result.current.dataSeries).toHaveLength(1);
  });

  it('dataSeries comes from config.getSeries', () => {
    // Given — config com getSeries mockado
    const config = makeConfig();
    const { result } = renderHook(() => useFinanceSeriesPage(config));

    // Then — dados retornados pelo serviço
    expect(result.current.dataSeries[0].value).toBe(1000);
    expect(config.getSeries).toHaveBeenCalled();
  });

  it('onPeriodChange updates period state', () => {
    // Given — period inicial LAST_12_MONTHS
    const config = makeConfig();
    const { result } = renderHook(() => useFinanceSeriesPage(config));

    // When — muda para ano específico
    act(() => {
      result.current.onPeriodChange({ mode: 'YEAR', year: 2025 });
    });

    // Then — period atualizado
    expect(result.current.period.mode).toBe('YEAR');
    expect(result.current.period.year).toBe(2025);
  });

  it('onFilterChange keeps valid origin value', () => {
    // Given — config com Profissional nas opções
    const config = makeConfig();
    const { result } = renderHook(() => useFinanceSeriesPage(config));

    // When — aplica filtro de origem válida
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.current.onFilterChange({ origin: 'Profissional' as any });
    });

    // Then — filtro aceito (dentro das opções)
    expect(result.current.filters.values.origin).toBe('Profissional');
  });

  it('onFilterChange clears origin when not in available options', () => {
    // Given — origem fora das opções retornadas pelo config
    const restrictedConfig: AnyConfig = {
      getFilterOptions: vi.fn(() => ({ origins: [], categories: [], items: [] })),
      getSeries: vi.fn(() => []),
    };
    const { result } = renderHook(() => useFinanceSeriesPage(restrictedConfig));

    // When — aplica filtro com origem inexistente nas opções
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.current.onFilterChange({ origin: 'Profissional' as any });
    });

    // Then — origem sanitizada para undefined
    expect(result.current.filters.values.origin).toBeUndefined();
  });

  it('isLoading becomes true on period change and resets after delay', () => {
    // Given — hook inicializado
    const config = makeConfig();
    const { result } = renderHook(() => useFinanceSeriesPage(config));

    // When — muda período
    act(() => {
      result.current.onPeriodChange({ mode: 'YEAR', year: 2024 });
    });

    // Then — loading ativo imediatamente
    expect(result.current.isLoading).toBe(true);

    // When — tempo expira
    act(() => {
      vi.advanceTimersByTime(140);
    });

    // Then — loading desativado
    expect(result.current.isLoading).toBe(false);
  });

  it('financeiroIcon resolves from NAV_LINKS', () => {
    // Given — NAV_LINKS com ícone de Financeiro
    const config = makeConfig();
    const { result } = renderHook(() => useFinanceSeriesPage(config));

    // Then — ícone encontrado
    expect(result.current.financeiroIcon).toBe('💰');
  });

  it('filterOptions come from config.getFilterOptions', () => {
    // Given — config com opções mockadas
    const config = makeConfig();
    const { result } = renderHook(() => useFinanceSeriesPage(config));

    // Then — opções retornadas pelo config
    expect(result.current.filters.options.origins).toContain('Profissional');
    expect(config.getFilterOptions).toHaveBeenCalled();
  });

  it('onFilterChange clears category AND item when category is not in available options', () => {
    // Given — config sem categorias nem itens disponíveis
    const restrictedConfig: AnyConfig = {
      getFilterOptions: vi.fn(() => ({ origins: [], categories: [], items: [] })),
      getSeries: vi.fn(() => []),
    };
    const { result } = renderHook(() => useFinanceSeriesPage(restrictedConfig));

    // When — filtro com category e item inválidos
    act(() => {
      result.current.onFilterChange({
        category: 'Operacional' as AnyConfig,
        item: 'Aluguel' as AnyConfig,
      });
    });

    // Then — category e item sanitizados para undefined (cascade)
    expect(result.current.filters.values.category).toBeUndefined();
    expect(result.current.filters.values.item).toBeUndefined();
  });
});
