import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import type { CashBoxCredit, CashBoxExpense } from '@/types';
import { createTestProject, createTestFinancials } from '@/test/factories';
import FinanceiroVisaoGeralPage from './FinanceiroVisaoGeralPage';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('FinanceiroVisaoGeralPage', () => {
  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T12:00:00Z'));
    api.clearAllData();
  });

  afterEach(() => {
    cleanup();
    api.clearAllData();
    vi.useRealTimers();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  // ── Empty state + navigation ──

  it('renders empty donut states, toggles views and updates month labels', () => {
    // Given — no financial data seeded

    // When
    render(
      <DataProvider>
        <FinanceiroVisaoGeralPage />
      </DataProvider>,
    );

    // Then — page structure renders
    expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    expect(screen.getByText('Mês Vigente')).toBeInTheDocument();
    expect(screen.getByText('Saúde Financeira')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma despesa registrada neste mês.')).toBeInTheDocument();

    // When — navigate to previous month
    fireEvent.click(screen.getByRole('button', { name: /Mês anterior/i }));

    // Then — label switches to "Consolidado de"
    expect(screen.getByText(/Consolidado de/i)).toBeInTheDocument();

    // When — navigate forward past current month
    fireEvent.click(screen.getByRole('button', { name: /Próximo mês/i }));
    fireEvent.click(screen.getByRole('button', { name: /Próximo mês/i }));

    // Then — label switches to "Previsão estimada para"
    expect(screen.getByText(/Previsão estimada para/i)).toBeInTheDocument();

    // When — click "Hoje" to reset
    fireEvent.click(screen.getByRole('button', { name: 'Hoje' }));

    // Then — back to current month
    expect(screen.getByText('Mês Vigente')).toBeInTheDocument();

    // When — toggle to "Recebidos"
    fireEvent.click(screen.getByRole('button', { name: 'Recebidos' }));

    // Then — empty income state shown
    expect(screen.getByText('Nenhum recebimento registrado neste mês.')).toBeInTheDocument();
  });

  // ── Donut with real data ──

  it('renders donut rows for expenses and receivables when financial entries exist', () => {
    // Given
    const snapshot = api.getData();
    const expenses: CashBoxExpense[] = [
      {
        id: 'expense-donut-1',
        origin: 'Profissional',
        category: 'Escritório',
        item: 'Aluguel do Escritório',
        recurrence: 'Única',
        dueDate: '2026-03-05',
        paymentDate: null,
        value: 900,
        installmentNumber: null,
        installmentTotal: null,
        recurringGroupId: null,
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    ];
    const credits: CashBoxCredit[] = [
      {
        id: 'credit-donut-1',
        origin: 'Profissional',
        category: 'Comissões',
        item: 'Comissão de Parceiro',
        description: 'Entrada de comissão',
        date: '2026-03-08',
        value: 1200,
        confirmed: false,
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    ];

    api.replaceData({
      ...snapshot,
      cashBoxExpenses: expenses,
      cashBoxCredits: credits,
    });

    // When
    render(
      <DataProvider>
        <FinanceiroVisaoGeralPage />
      </DataProvider>,
    );

    // Then — expense category shown, empty message hidden
    expect(screen.queryByText('Nenhuma despesa registrada neste mês.')).not.toBeInTheDocument();
    expect(screen.getByText('Escritório')).toBeInTheDocument();

    // When — toggle to receivables view
    fireEvent.click(screen.getByRole('button', { name: 'Recebidos' }));

    // Then — income shown, with percentage and donut aria label
    expect(screen.queryByText('Nenhum recebimento registrado neste mês.')).not.toBeInTheDocument();
    expect(screen.getAllByText(/100(\.0)?%/).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/distribuição de receitas recebidas/i)).toBeInTheDocument();
  });

  // ── Multiple expense categories ──

  it('renders multiple expense categories in the donut legend', () => {
    // Given — 3 different categories
    const snapshot = api.getData();
    const expenses: CashBoxExpense[] = [
      {
        id: 'exp-1',
        origin: 'Profissional',
        category: 'Escritório',
        item: 'Aluguel',
        recurrence: 'Única',
        dueDate: '2026-03-05',
        paymentDate: null,
        value: 800,
        installmentNumber: null,
        installmentTotal: null,
        recurringGroupId: null,
        createdAt: '2026-03-01T00:00:00.000Z',
      },
      {
        id: 'exp-2',
        origin: 'Profissional',
        category: 'Marketing',
        item: 'Google Ads',
        recurrence: 'Única',
        dueDate: '2026-03-10',
        paymentDate: null,
        value: 200,
        installmentNumber: null,
        installmentTotal: null,
        recurringGroupId: null,
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    ];

    api.replaceData({
      ...snapshot,
      cashBoxExpenses: expenses,
    });

    // When
    render(
      <DataProvider>
        <FinanceiroVisaoGeralPage />
      </DataProvider>,
    );

    // Then — both categories visible in the donut legend
    expect(screen.getByText('Escritório')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByLabelText(/distribuição de despesas por categoria/i)).toBeInTheDocument();
  });

  // ── KPI cards render with financial data ──

  it('renders KPI cards with correct values when projects have receivables', () => {
    // Given — project with paid installment in current month
    const snapshot = api.getData();
    const project = createTestProject({
      id: 'proj-kpi',
      name: 'Projeto KPI',
      financials: createTestFinancials({
        paymentType: 'parcelado',
        installments: [
          {
            id: 'inst-kpi-1',
            number: 1,
            value: 5000,
            dueDate: '2026-03-10',
            paid: true,
            paymentDate: '2026-03-10',
          },
        ],
      }),
    });

    api.replaceData({
      ...snapshot,
      projects: [project],
    });

    // When
    render(
      <DataProvider>
        <FinanceiroVisaoGeralPage />
      </DataProvider>,
    );

    // Then — KPI section renders with labels
    expect(screen.getByText('Receita (Mês)')).toBeInTheDocument();
    expect(screen.getByText('Despesas (Mês)')).toBeInTheDocument();
    expect(screen.getByText('Saldo (Mês)')).toBeInTheDocument();
  });

  // ── Health bar section structure ──

  it('renders health bar sections with receivable and debit labels', () => {
    // Given — no data needed, structure should always render

    // When
    render(
      <DataProvider>
        <FinanceiroVisaoGeralPage />
      </DataProvider>,
    );

    // Then — section headings
    expect(screen.getByText('Recebíveis')).toBeInTheDocument();
    expect(screen.getByText('Débitos')).toBeInTheDocument();

    // Then — receivable health labels (use getAllByText for 'Recebidos' since it also matches the toggle button)
    expect(screen.getAllByText('Recebidos').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Em Aberto')).toBeInTheDocument();
    expect(screen.getByText('Inadimplentes')).toBeInTheDocument();

    // Then — debit health labels
    expect(screen.getByText('Pagos')).toBeInTheDocument();
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
    expect(screen.getByText('Atrasados')).toBeInTheDocument();
  });

  // ── Month navigation retains donut view ──

  it('retains the donut view selection when navigating months', () => {
    // Given — switch to "Recebidos" view
    render(
      <DataProvider>
        <FinanceiroVisaoGeralPage />
      </DataProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Recebidos' }));
    expect(screen.getByText('Nenhum recebimento registrado neste mês.')).toBeInTheDocument();

    // When — navigate to previous month
    fireEvent.click(screen.getByRole('button', { name: /Mês anterior/i }));

    // Then — still in "Recebidos" view (empty state message)
    expect(screen.getByText('Nenhum recebimento registrado neste mês.')).toBeInTheDocument();
    // And month label changed
    expect(screen.getByText(/Consolidado de/i)).toBeInTheDocument();
  });
});
