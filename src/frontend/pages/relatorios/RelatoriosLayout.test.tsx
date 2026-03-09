import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Outlet, Route, Routes, useOutletContext } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import type { Commission, ProfessionalExpense, Project, Proposal } from '@/types';
import { getTodayDateOnly, toDateOnlyString } from '@/utils/formatters';
import type { RelatoriosOutletContext } from './RelatoriosLayout';

import RelatoriosLayout from './RelatoriosLayout';

const toIsoDate = (date: Date): string => toDateOnlyString(date);

const dateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return toIsoDate(date);
};

const FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

function OutletProbe(): JSX.Element {
  const context = useOutletContext<RelatoriosOutletContext>();

  return (
    <div>
      <span data-testid="financial-profitability">{context.financialMetrics.profitability}</span>
      <span data-testid="project-in-progress">{context.projectMetrics.inProgress}</span>
      <span data-testid="acquisition-conversion">{context.acquisitionMetrics.conversionRate}</span>
      <Outlet />
    </div>
  );
}

function seedReportData(): void {
  const snapshot = api.getData();
  const fiveDaysAgo = dateDaysAgo(5);
  const fourDaysAgo = dateDaysAgo(4);
  const sixDaysAgo = dateDaysAgo(6);
  const sevenDaysAgo = dateDaysAgo(7);
  const oneHundredTwentyDaysAgo = dateDaysAgo(120);
  const oneHundredTwentyOneDaysAgo = dateDaysAgo(121);
  const oneHundredTwentyTwoDaysAgo = dateDaysAgo(122);

  const recentConcludedProject = {
    id: 'proj-concluded-recent',
    code: '#3101',
    name: 'Projeto Concluído Recente',
    clientName: 'Cliente Recente',
    clientId: 'cli_a',
    status: 'Concluído',
    deadline: fiveDaysAgo,
    budget: 0,
    description: '',
    sections: [],
    archived: false,
    finalizedAt: fiveDaysAgo,
    proposalId: 'prop-converted-recent',
    financials: {
      paymentType: 'vista',
      totalValue: 2000,
      baseContractValue: 2000,
      lumpSumStatus: 'Pago',
    },
  } as Project;

  const oldConcludedProject = {
    id: 'proj-concluded-old',
    code: '#3102',
    name: 'Projeto Concluído Antigo',
    clientName: 'Cliente Antigo',
    clientId: 'cli_b',
    status: 'Concluído',
    deadline: oneHundredTwentyDaysAgo,
    budget: 0,
    description: '',
    sections: [],
    archived: false,
    finalizedAt: oneHundredTwentyDaysAgo,
    financials: {
      paymentType: 'vista',
      totalValue: 5000,
      baseContractValue: 5000,
      lumpSumStatus: 'Pago',
    },
  } as Project;

  const inProgressProject = {
    id: 'proj-progress',
    code: '#3103',
    name: 'Projeto Em Andamento',
    clientName: 'Cliente C',
    clientId: 'cli_c',
    status: 'Em Andamento',
    deadline: dateDaysAgo(-30),
    budget: 0,
    description: '',
    sections: [],
    archived: false,
    financials: {
      paymentType: 'vista',
      totalValue: 1000,
      baseContractValue: 1000,
      lumpSumStatus: 'Em aberto',
    },
  } as Project;

  const convertedProposalRecent = {
    id: 'prop-converted-recent',
    code: '#P100',
    name: 'Proposta Convertida',
    date: fourDaysAgo,
    status: 'Concluído',
    archived: false,
    sections: [],
    discount: 0,
    subtotal: 2000,
    total: 2000,
  } as Proposal;

  const legacyProposal = {
    id: 'prop-legacy',
    code: '#P101',
    name: 'Proposta Antiga',
    date: oneHundredTwentyOneDaysAgo,
    status: 'Pendente',
    archived: false,
    sections: [],
    discount: 0,
    subtotal: 1200,
    total: 1200,
  } as Proposal;

  const receivedCommission = {
    id: 'comm-1',
    saleDate: sevenDaysAgo,
    supplierId: 'sup-1',
    supplierName: 'Fornecedor A',
    clientId: 'cli_a',
    clientName: 'Cliente A',
    saleValue: 1000,
    commissionPercentage: 30,
    commissionValue: 300,
    status: 'Recebido',
    paymentDate: sixDaysAgo,
  } as Commission;

  const oldReceivedCommission = {
    id: 'comm-2',
    saleDate: oneHundredTwentyTwoDaysAgo,
    supplierId: 'sup-2',
    supplierName: 'Fornecedor B',
    clientId: 'cli_b',
    clientName: 'Cliente B',
    saleValue: 1000,
    commissionPercentage: 70,
    commissionValue: 700,
    status: 'Recebido',
    paymentDate: oneHundredTwentyDaysAgo,
  } as Commission;

  const manualExpense = {
    id: 'exp-1',
    description: 'Software',
    category: 'Software e Assinaturas',
    value: 100,
    dueDate: sixDaysAgo,
    status: 'Pago',
    paymentDate: sixDaysAgo,
    isRecurring: false,
    source: 'Manual',
  } as ProfessionalExpense;

  const oldManualExpense = {
    id: 'exp-2',
    description: 'Ferramenta antiga',
    category: 'Software e Assinaturas',
    value: 50,
    dueDate: oneHundredTwentyDaysAgo,
    status: 'Pago',
    paymentDate: oneHundredTwentyDaysAgo,
    isRecurring: false,
    source: 'Manual',
  } as ProfessionalExpense;

  api.replaceData({
    ...snapshot,
    projects: [recentConcludedProject, oldConcludedProject, inProgressProject],
    proposals: [convertedProposalRecent, legacyProposal],
    commissions: [receivedCommission, oldReceivedCommission],
    manualExpenses: [manualExpense, oldManualExpense],
  });
}

describe('RelatoriosLayout', () => {
  beforeEach(() => {
    api.clearAllData();
    seedReportData();
  });

  afterEach(() => {
    cleanup();
    api.clearAllData();
  });

  it('uses the current local day as the default end date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 8, 23, 30, 0));

    try {
      render(
        <MemoryRouter initialEntries={['/relatorios/financeiro']} future={FUTURE_FLAGS}>
          <DataProvider>
            <Routes>
              <Route path="/relatorios" element={<RelatoriosLayout />}>
                <Route
                  path="financeiro"
                  element={<h2 data-testid="finance-route">Financeiro route</h2>}
                />
              </Route>
            </Routes>
          </DataProvider>
        </MemoryRouter>,
      );

      expect(screen.getByLabelText('Data de fim')).toHaveValue(getTodayDateOnly());
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders tab navigation and switches active route across all report tabs', async () => {
    render(
      <MemoryRouter initialEntries={['/relatorios/financeiro']} future={FUTURE_FLAGS}>
        <DataProvider>
          <Routes>
            <Route path="/relatorios" element={<RelatoriosLayout />}>
              <Route
                path="financeiro"
                element={<h2 data-testid="finance-route">Financeiro route</h2>}
              />
              <Route
                path="projetos"
                element={<h2 data-testid="projects-route">Projetos route</h2>}
              />
              <Route
                path="aquisicao"
                element={<h2 data-testid="acquisition-route">Aquisição route</h2>}
              />
            </Route>
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Relatórios')).toBeInTheDocument();
    expect(screen.getByTestId('finance-route')).toBeInTheDocument();

    const financeiroTab = screen.getByRole('link', { name: 'Financeiro' });
    const projetosTab = screen.getByRole('link', { name: 'Projetos' });
    const aquisicaoTab = screen.getByRole('link', { name: 'Aquisição de Clientes' });

    expect(financeiroTab).toHaveAttribute('aria-current', 'page');
    expect(projetosTab).not.toHaveAttribute('aria-current', 'page');

    fireEvent.click(projetosTab);

    await waitFor(() => {
      expect(screen.getByTestId('projects-route')).toBeInTheDocument();
      expect(projetosTab).toHaveAttribute('aria-current', 'page');
    });

    fireEvent.click(aquisicaoTab);

    await waitFor(() => {
      expect(screen.getByTestId('acquisition-route')).toBeInTheDocument();
      expect(aquisicaoTab).toHaveAttribute('aria-current', 'page');
    });
  });

  it('recomputes outlet metrics for preset and custom date filters', async () => {
    const customStartDate = dateDaysAgo(60);
    const customEndDate = dateDaysAgo(40);

    render(
      <MemoryRouter initialEntries={['/relatorios/financeiro']} future={FUTURE_FLAGS}>
        <DataProvider>
          <Routes>
            <Route path="/relatorios" element={<RelatoriosLayout />}>
              <Route path="financeiro" element={<OutletProbe />} />
            </Route>
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    const lastThirtyDaysButton = screen.getByRole('button', { name: 'Últimos 30 dias' });
    const thisYearButton = screen.getByRole('button', { name: 'Este ano' });
    const sinceBeginningButton = screen.getByRole('button', { name: 'Desde o início' });
    const startDateInput = screen.getByLabelText('Data de início');
    const endDateInput = screen.getByLabelText('Data de fim');

    fireEvent.click(sinceBeginningButton);

    await waitFor(() => {
      expect(screen.getByTestId('financial-profitability')).toHaveTextContent('7850');
      expect(screen.getByTestId('project-in-progress')).toHaveTextContent('1');
      expect(screen.getByTestId('acquisition-conversion')).toHaveTextContent('50');
    });

    fireEvent.click(lastThirtyDaysButton);

    await waitFor(() => {
      expect(screen.getByTestId('financial-profitability')).toHaveTextContent('2200');
      expect(screen.getByTestId('acquisition-conversion')).toHaveTextContent('100');
    });

    fireEvent.change(startDateInput, { target: { value: customStartDate } });
    fireEvent.change(endDateInput, { target: { value: customEndDate } });

    await waitFor(() => {
      expect(screen.getByTestId('financial-profitability')).toHaveTextContent('0');
      expect(screen.getByTestId('acquisition-conversion')).toHaveTextContent('0');
      expect(lastThirtyDaysButton.className).toContain('bg-transparent');
      expect(startDateInput).toHaveValue(customStartDate);
      expect(endDateInput).toHaveValue(customEndDate);
    });

    fireEvent.click(thisYearButton);

    await waitFor(() => {
      expect(screen.getByTestId('financial-profitability')).toHaveTextContent('7850');
      expect(screen.getByTestId('acquisition-conversion')).toHaveTextContent('50');
      expect(thisYearButton.className).toContain('bg-primary');
      expect(startDateInput).toHaveValue('');
    });
  });
});
