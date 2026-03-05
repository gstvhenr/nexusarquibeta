import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import FinanceiroRecebiveisPage from './FinanceiroRecebiveisPage';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('FinanceiroRecebiveisPage', () => {
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
        <FinanceiroRecebiveisPage />
      </DataProvider>,
    );

    expect(screen.getByText('Recebíveis')).toBeInTheDocument();
    expect(screen.getByText('Evolução de valores recebidos')).toBeInTheDocument();
    expect(screen.getByText('Sem valores recebidos no período selecionado.')).toBeInTheDocument();
    expect(screen.getByLabelText('Período do gráfico')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtro por origem')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtro por categoria')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtro por item')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument();
  });
});
