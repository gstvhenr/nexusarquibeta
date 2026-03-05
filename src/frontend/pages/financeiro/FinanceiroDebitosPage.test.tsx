import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import FinanceiroDebitosPage from './FinanceiroDebitosPage';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('FinanceiroDebitosPage', () => {
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

  it('renders page header, chart contract and filter controls', () => {
    render(
      <DataProvider>
        <FinanceiroDebitosPage />
      </DataProvider>,
    );

    expect(screen.getByText('Despesas')).toBeInTheDocument();
    expect(screen.getByText('Evolução de gastos')).toBeInTheDocument();
    expect(screen.getByText('Sem despesas registradas no período selecionado.')).toBeInTheDocument();
    expect(screen.getByLabelText('Período do gráfico')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtro por origem')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtro por categoria')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtro por item')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument();
  });
});
