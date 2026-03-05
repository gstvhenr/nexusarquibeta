import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import RelatorioAquisicaoPage from './RelatorioAquisicaoPage';

afterEach(() => {
  cleanup();
});

const FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

const renderWithAcquisitionContext = (acquisitionMetrics: {
  conversionRate: number;
  newClientsCount: number;
  marketingSpend: number;
  cac: number;
  leadSourceChartData: { label: string; value: number }[];
}) =>
  render(
    <MemoryRouter initialEntries={['/']} future={FUTURE_FLAGS}>
      <Routes>
        <Route path="/" element={<Outlet context={{ acquisitionMetrics }} />}>
          <Route index element={<RelatorioAquisicaoPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('RelatorioAquisicaoPage', () => {
  it('renders acquisition cards with formatted values and empty-chart fallback', () => {
    renderWithAcquisitionContext({
      conversionRate: 31.6,
      newClientsCount: 12,
      marketingSpend: 4500,
      cac: 375,
      leadSourceChartData: [],
    });

    expect(screen.getByText('Aquisição de Clientes')).toBeInTheDocument();
    expect(screen.getByText('31.6%')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText(/4\.500,00/)).toBeInTheDocument();
    expect(screen.getByText(/375,00/)).toBeInTheDocument();
    expect(screen.getByText('Dados insuficientes para exibir o gráfico.')).toBeInTheDocument();
  });

  it('rounds conversion rate to one decimal place and keeps zero CAC stable', () => {
    renderWithAcquisitionContext({
      conversionRate: 31.64,
      newClientsCount: 0,
      marketingSpend: 0,
      cac: 0,
      leadSourceChartData: [],
    });

    expect(screen.getByText('31.6%')).toBeInTheDocument();
    expect(screen.getAllByText(/0,00/)).toHaveLength(2);
  });
});
