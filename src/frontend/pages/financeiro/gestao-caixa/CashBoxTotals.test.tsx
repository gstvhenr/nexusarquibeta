import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CashBoxTotals } from './CashBoxTotals';
import { cleanup } from '@testing-library/react';

describe('CashBoxTotals', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows formatted credits, expenses and positive balance', () => {
    render(<CashBoxTotals totalCredits={1500} totalExpenses={1000} netBalance={500} />);

    expect(screen.getByText(/Créditos:/)).toBeInTheDocument();
    expect(screen.getByText(/Despesas:/)).toBeInTheDocument();
    expect(screen.getByText(/Saldo:/)).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes('+R$') && text.includes('1.500,00'))).toBeVisible();
    expect(screen.getByText((text) => text.includes('-R$') && text.includes('1.000,00'))).toBeVisible();
    const saldoBlock = screen.getByText('Saldo:').closest('div');
    expect(saldoBlock).not.toBeNull();
    expect(within(saldoBlock as HTMLElement).getByText(/500,00/)).toHaveClass('text-success');
  });

  it('uses error style for negative balance', () => {
    render(<CashBoxTotals totalCredits={200} totalExpenses={900} netBalance={-700} />);

    const saldoBlock = screen.getByText('Saldo:').closest('div');
    expect(saldoBlock).not.toBeNull();
    expect(within(saldoBlock as HTMLElement).getByText(/700,00/)).toHaveClass('text-error');
  });
});
