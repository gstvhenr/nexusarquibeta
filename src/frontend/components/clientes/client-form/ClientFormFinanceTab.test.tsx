import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientFormFinanceTab } from './ClientFormFinanceTab';

vi.mock('@/utils/formatters', () => ({
  formatCurrency: vi.fn((value) => `R$ ${value}`),
}));

describe('ClientFormFinanceTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render empty state when financialSummaries is empty', () => {
    render(<ClientFormFinanceTab financialSummaries={[]} />);
    expect(
      screen.getByText('Nenhum projeto ativo para exibir dados financeiros.'),
    ).toBeInTheDocument();
  });

  it('should render summaries correctly', () => {
    const mockSummaries = [
      {
        projectId: 'p1',
        projectName: 'Projeto A',
        pending: 100,
        overdue: 200,
        paid: 300,
        totalValue: 600,
      },
      {
        projectId: 'p2',
        projectName: 'Projeto B',
        pending: 0,
        overdue: 0,
        paid: 1000,
        totalValue: 1000,
      },
    ];

    render(<ClientFormFinanceTab financialSummaries={mockSummaries as never[]} />);

    // Check Project A
    expect(screen.getByText('Projeto A')).toBeInTheDocument();
    expect(screen.getByText('R$ 100')).toBeInTheDocument(); // pending
    expect(screen.getByText('R$ 200')).toBeInTheDocument(); // overdue
    expect(screen.getByText('R$ 300')).toBeInTheDocument(); // paid
    expect(screen.getByText('R$ 600')).toBeInTheDocument(); // total

    // Check Project B
    expect(screen.getByText('Projeto B')).toBeInTheDocument();
  });
});
