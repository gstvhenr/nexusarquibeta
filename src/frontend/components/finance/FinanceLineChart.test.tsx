import { fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FinanceLineChartFilters, PeriodSelection, SeriesPoint } from '../../types';
import { FinanceLineChart } from './FinanceLineChart';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const BASE_SERIES: SeriesPoint[] = [
  { label: '2026-01', value: 0 },
  { label: '2026-02', value: 0 },
];

const BASE_FILTERS: FinanceLineChartFilters = {
  values: {
    origin: 'Profissional',
    category: 'Escritório',
    item: 'Aluguel do Escritório',
  },
  options: {
    origins: ['Profissional', 'Pessoal'],
    categories: ['Escritório', 'Alimentação'],
    items: ['Aluguel do Escritório', 'Mercado'],
  },
};

const BASE_PERIOD: PeriodSelection = { mode: 'LAST_12_MONTHS' };

describe('FinanceLineChart', () => {
  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-15T10:00:00.000Z'));
    document.documentElement.style.setProperty('--line-accent', '#123456');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('renders loading state and basic controls', () => {
    render(
      <FinanceLineChart
        title="Evolução de Débitos"
        dataSeries={BASE_SERIES}
        period={BASE_PERIOD}
        filters={BASE_FILTERS}
        onPeriodChange={vi.fn()}
        onFilterChange={vi.fn()}
        isLoading={true}
      />,
    );

    expect(screen.getByText('Evolução de Débitos')).toBeInTheDocument();
    expect(screen.getByText('Atualizando...')).toBeInTheDocument();
    expect(screen.getByLabelText('Período do gráfico')).toBeInTheDocument();
    expect(screen.queryByLabelText('Ano')).not.toBeInTheDocument();
  });

  it('handles period changes, including YEAR mode and explicit year input', () => {
    const onPeriodChange = vi.fn();
    const { rerender } = render(
      <FinanceLineChart
        title="Evolução"
        dataSeries={BASE_SERIES}
        period={BASE_PERIOD}
        filters={BASE_FILTERS}
        onPeriodChange={onPeriodChange}
        onFilterChange={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Período do gráfico'), { target: { value: 'YEAR' } });
    expect(onPeriodChange).toHaveBeenCalledWith({ mode: 'YEAR', year: 2026 });

    const periodYear = { mode: 'YEAR', year: 2028 } as const;
    rerender(
      <FinanceLineChart
        title="Evolução"
        dataSeries={BASE_SERIES}
        period={periodYear}
        filters={BASE_FILTERS}
        onPeriodChange={onPeriodChange}
        onFilterChange={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Ano'), { target: { value: '2030' } });
    expect(onPeriodChange).toHaveBeenCalledWith({ mode: 'YEAR', year: 2030 });

    fireEvent.change(screen.getByLabelText('Período do gráfico'), { target: { value: 'QUARTER' } });
    expect(onPeriodChange).toHaveBeenCalledWith({ mode: 'QUARTER' });
  });

  it('handles filter changes and clear action', () => {
    const onFilterChange = vi.fn();
    render(
      <FinanceLineChart
        title="Evolução"
        dataSeries={BASE_SERIES}
        period={BASE_PERIOD}
        filters={BASE_FILTERS}
        onPeriodChange={vi.fn()}
        onFilterChange={onFilterChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('Filtro por origem'), { target: { value: 'Pessoal' } });
    expect(onFilterChange).toHaveBeenLastCalledWith({
      origin: 'Pessoal',
      category: 'Escritório',
      item: 'Aluguel do Escritório',
    });

    fireEvent.change(screen.getByLabelText('Filtro por origem'), { target: { value: '' } });
    expect(onFilterChange).toHaveBeenLastCalledWith({
      origin: undefined,
      category: 'Escritório',
      item: 'Aluguel do Escritório',
    });

    fireEvent.change(screen.getByLabelText('Filtro por categoria'), {
      target: { value: 'Alimentação' },
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({
      origin: 'Profissional',
      category: 'Alimentação',
      item: undefined,
    });

    fireEvent.change(screen.getByLabelText('Filtro por item'), {
      target: { value: '' },
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({
      origin: 'Profissional',
      category: 'Escritório',
      item: undefined,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(onFilterChange).toHaveBeenLastCalledWith({});
  });

  it('shows empty message only when all points are zero', () => {
    const { rerender } = render(
      <FinanceLineChart
        title="Evolução"
        dataSeries={BASE_SERIES}
        period={BASE_PERIOD}
        filters={BASE_FILTERS}
        onPeriodChange={vi.fn()}
        onFilterChange={vi.fn()}
        emptyMessage="Sem dados no período."
      />,
    );

    expect(screen.getByText('Sem dados no período.')).toBeInTheDocument();

    rerender(
      <FinanceLineChart
        title="Evolução"
        dataSeries={[
          { label: '2026-01', value: 0 },
          { label: '2026-02', value: 10 },
        ]}
        period={BASE_PERIOD}
        filters={BASE_FILTERS}
        onPeriodChange={vi.fn()}
        onFilterChange={vi.fn()}
        emptyMessage="Sem dados no período."
      />,
    );

    expect(screen.queryByText('Sem dados no período.')).not.toBeInTheDocument();
  });

  it('resolves CSS variable line color and keeps chart formatters active', () => {
    render(
      <FinanceLineChart
        title="Evolução"
        dataSeries={[
          { label: '2026-03', value: 1200 },
          { label: '2026-04', value: 1800 },
        ]}
        period={BASE_PERIOD}
        filters={BASE_FILTERS}
        onPeriodChange={vi.fn()}
        onFilterChange={vi.fn()}
        lineColorClassName="var(--line-accent)"
      />,
    );

    expect(
      screen.queryByText('Nenhum dado encontrado para o período e filtros selecionados.'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument();
  });
});
