import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import RelatorioProjetosPage from './RelatorioProjetosPage';

afterEach(() => {
  cleanup();
});

const FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

const renderWithProjectContext = (projectMetrics: {
  inProgress: number;
  conclusionRate: number;
  averageTicket: number;
  totalProjectValue: number;
  projectStatusChartData: { label: string; value: number }[];
}) =>
  render(
    <MemoryRouter initialEntries={['/']} future={FUTURE_FLAGS}>
      <Routes>
        <Route path="/" element={<Outlet context={{ projectMetrics }} />}>
          <Route index element={<RelatorioProjetosPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('RelatorioProjetosPage', () => {
  it('renders project metrics, subtexts and empty-chart fallback', () => {
    renderWithProjectContext({
      inProgress: 8,
      conclusionRate: 42.5,
      averageTicket: 23000,
      totalProjectValue: 184000,
      projectStatusChartData: [],
    });

    expect(screen.getByText('Performance de Projetos')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('42.5%')).toBeInTheDocument();
    expect(screen.getByText(/23\.000,00/)).toBeInTheDocument();
    expect(screen.getByText(/184\.000,00/)).toBeInTheDocument();
    expect(screen.getByText('Projetos atualmente em andamento')).toBeInTheDocument();
    expect(screen.getByText('Proporção de projetos finalizados')).toBeInTheDocument();
    expect(screen.getByText('Dados insuficientes para exibir o gráfico.')).toBeInTheDocument();
  });

  it('rounds conclusion rate to one decimal place', () => {
    renderWithProjectContext({
      inProgress: 1,
      conclusionRate: 42.56,
      averageTicket: 1000,
      totalProjectValue: 1000,
      projectStatusChartData: [],
    });

    expect(screen.getByText('42.6%')).toBeInTheDocument();
  });
});
