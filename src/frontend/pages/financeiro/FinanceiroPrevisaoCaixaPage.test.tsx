import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import type { CashBoxCredit } from '@/types';
import FinanceiroPrevisaoCaixaPage from './FinanceiroPrevisaoCaixaPage';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('FinanceiroPrevisaoCaixaPage', () => {
  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  beforeEach(() => {
    api.clearAllData();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    cleanup();
    api.clearAllData();
  });

  it('renders forecast title and empty-message state when no forecast exists', () => {
    render(
      <DataProvider>
        <FinanceiroPrevisaoCaixaPage />
      </DataProvider>,
    );

    expect(screen.getByText('Previsão de Caixa')).toBeInTheDocument();
    expect(screen.getByText('Previsão de Caixa — Próximos 12 meses')).toBeInTheDocument();
    expect(
      screen.getByText('Nenhum lançamento previsto para os próximos 12 meses.'),
    ).toBeInTheDocument();
  });

  it('hides empty-message state when there are forecasted entries', () => {
    const snapshot = api.getData();
    const credit: CashBoxCredit = {
      id: 'credit-forecast-1',
      origin: 'Profissional',
      category: 'Comissões',
      item: 'Comissão de Parceiro',
      description: 'Entrada prevista',
      date: '2026-04-10',
      value: 1500,
      confirmed: false,
      createdAt: '2026-03-01T00:00:00.000Z',
    };

    api.replaceData({
      ...snapshot,
      cashBoxCredits: [credit],
    });

    render(
      <DataProvider>
        <FinanceiroPrevisaoCaixaPage />
      </DataProvider>,
    );

    expect(screen.getByLabelText(/Gráfico de previsão de caixa/i)).toBeInTheDocument();
    expect(
      screen.queryByText('Nenhum lançamento previsto para os próximos 12 meses.'),
    ).not.toBeInTheDocument();
  });
});
