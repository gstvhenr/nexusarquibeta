import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import RelatorioFinanceiroPage from './RelatorioFinanceiroPage';

afterEach(() => {
  cleanup();
});

const FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

const renderWithFinancialContext = (financialMetrics: {
  revenueFromProjects: number;
  revenueFromCommissions: number;
  totalCosts: number;
  profitability: number;
  revenueChartData: { label: string; value: number }[];
}) =>
  render(
    <MemoryRouter initialEntries={['/']} future={FUTURE_FLAGS}>
      <Routes>
        <Route path="/" element={<Outlet context={{ financialMetrics }} />}>
          <Route index element={<RelatorioFinanceiroPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('RelatorioFinanceiroPage', () => {
  it('renders all financial cards with formatted values and empty-chart fallback', () => {
    renderWithFinancialContext({
      revenueFromProjects: 25000,
      revenueFromCommissions: 5000,
      totalCosts: 12000,
      profitability: 18000,
      revenueChartData: [],
    });

    expect(screen.getByText('Painel Financeiro')).toBeInTheDocument();
    const projectsCard = screen.getByText('Receita de Projetos').closest('div');
    const commissionsCard = screen.getByText('Receita de Comissões').closest('div');
    const costsCard = screen.getByText('Custos Totais').closest('div');
    const profitabilityCard = screen.getByText('Lucratividade Total').closest('div');

    expect(projectsCard).not.toBeNull();
    expect(commissionsCard).not.toBeNull();
    expect(costsCard).not.toBeNull();
    expect(profitabilityCard).not.toBeNull();

    expect(within(projectsCard as HTMLElement).getByText(/25\.000,00/)).toBeInTheDocument();
    expect(within(commissionsCard as HTMLElement).getByText(/5\.000,00/)).toBeInTheDocument();
    expect(within(costsCard as HTMLElement).getByText(/12\.000,00/)).toBeInTheDocument();
    expect(within(profitabilityCard as HTMLElement).getByText(/18\.000,00/)).toBeInTheDocument();
    expect(screen.getByText('Dados insuficientes para exibir o gráfico.')).toBeInTheDocument();
  });

  it('formats zero and negative amounts without breaking value cards', () => {
    renderWithFinancialContext({
      revenueFromProjects: 0,
      revenueFromCommissions: -250,
      totalCosts: 0,
      profitability: -250,
      revenueChartData: [],
    });

    const projectsCard = screen.getByText('Receita de Projetos').closest('div');
    const commissionsCard = screen.getByText('Receita de Comissões').closest('div');
    const costsCard = screen.getByText('Custos Totais').closest('div');
    const profitabilityCard = screen.getByText('Lucratividade Total').closest('div');

    expect(within(projectsCard as HTMLElement).getByText(/0,00/)).toBeInTheDocument();
    expect(within(costsCard as HTMLElement).getByText(/0,00/)).toBeInTheDocument();
    expect(within(commissionsCard as HTMLElement).getByText(/-R\$\s*250,00/)).toBeInTheDocument();
    expect(within(profitabilityCard as HTMLElement).getByText(/-R\$\s*250,00/)).toBeInTheDocument();
  });
});
