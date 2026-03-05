import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import type { CashBoxCredit, CashBoxExpense } from '@/types';
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

  it('renders empty donut states, toggles views and updates month labels', () => {
    render(
      <DataProvider>
        <FinanceiroVisaoGeralPage />
      </DataProvider>,
    );

    expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    expect(screen.getByText('Mês Vigente')).toBeInTheDocument();
    expect(screen.getByText('Saúde Financeira')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma despesa registrada neste mês.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Mês anterior/i }));
    expect(screen.getByText(/Consolidado de/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Próximo mês/i }));
    fireEvent.click(screen.getByRole('button', { name: /Próximo mês/i }));
    expect(screen.getByText(/Previsão estimada para/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Hoje' }));
    expect(screen.getByText('Mês Vigente')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Recebidos' }));
    expect(screen.getByText('Nenhum recebimento registrado neste mês.')).toBeInTheDocument();
  });

  it('renders donut rows for expenses and receivables when financial entries exist', () => {
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

    render(
      <DataProvider>
        <FinanceiroVisaoGeralPage />
      </DataProvider>,
    );

    expect(screen.queryByText('Nenhuma despesa registrada neste mês.')).not.toBeInTheDocument();
    expect(screen.getByText('Escritório')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Recebidos' }));
    expect(screen.queryByText('Nenhum recebimento registrado neste mês.')).not.toBeInTheDocument();
    expect(screen.getAllByText(/100(\.0)?%/).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/distribuição de receitas recebidas/i)).toBeInTheDocument();
  });
});
