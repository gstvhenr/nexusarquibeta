import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import FinanceiroHistoricoPage from './FinanceiroHistoricoPage';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const renderPage = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <DataProvider>
        <Routes>
          <Route path="/financeiro/historico" element={<FinanceiroHistoricoPage />} />
        </Routes>
      </DataProvider>
    </MemoryRouter>,
  );

describe('FinanceiroHistoricoPage', () => {
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

  it('renders unified header, movement controls and hides legacy copy by default', () => {
    const { container } = renderPage('/financeiro/historico');

    expect(screen.getByText('Histórico Financeiro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Crédito' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Débito' })).toBeInTheDocument();
    expect(screen.queryByText('Histórico de crédito e débito')).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'Créditos mostram recebimentos confirmados; débitos incluem lançamentos pagos, pendentes e vencidos.',
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Sem movimentações no período selecionado.')).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('overflow-hidden');
  });

  it('respects the initial search param for credit mode', () => {
    renderPage('/financeiro/historico?tipo=credit');

    expect(screen.getByRole('button', { name: 'Crédito' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('Evolução de valores recebidos')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Créditos mostram recebimentos confirmados/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Sem valores recebidos no período selecionado.'),
    ).not.toBeInTheDocument();
  });

  it('switches between movement modes without losing filter controls', () => {
    renderPage('/financeiro/historico');

    fireEvent.click(screen.getByRole('button', { name: 'Débito' }));

    expect(screen.getByRole('button', { name: 'Débito' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Período do gráfico')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtro por origem')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtro por categoria')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtro por item')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Limpar filtros' }).querySelector('svg'),
    ).not.toBeNull();
    expect(screen.queryByText('Evolução de gastos')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Créditos mostram recebimentos confirmados/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Sem despesas registradas no período selecionado.'),
    ).not.toBeInTheDocument();
  });
});
