import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FinancialKPICard } from './FinancialKPICard';

describe('FinancialKPICard', () => {
  it('renders title, value and icon', () => {
    render(
      <FinancialKPICard
        title="Recebido"
        value="R$ 1.500,00"
        icon={<span data-testid="kpi-icon">*</span>}
        colorClass="text-success"
        bgClass="bg-success/10"
      />,
    );

    expect(screen.getByText('Recebido')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-icon')).toBeInTheDocument();
  });
});
