import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommissionsSummaryCards } from './CommissionsSummaryCards';

describe('CommissionsSummaryCards', () => {
  it('renders pending and received totals', () => {
    render(<CommissionsSummaryCards pendingValue={2500} receivedLast30Days={1300} />);

    expect(screen.getByText('Total a Receber')).toBeInTheDocument();
    expect(screen.getByText('Recebido (Últimos 30 dias)')).toBeInTheDocument();
    expect(screen.getByText(/2\.500,00/)).toBeInTheDocument();
    expect(screen.getByText(/1\.300,00/)).toBeInTheDocument();
  });
});
