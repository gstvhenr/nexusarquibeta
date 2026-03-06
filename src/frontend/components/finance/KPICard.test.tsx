import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KPICard } from './KPICard';

describe('KPICard', () => {
  it('renders content and applies success styles', () => {
    render(
      <KPICard
        title="Receita"
        value="R$ 10.000,00"
        icon={<svg data-testid="kpi-icon" className="old-class" />}
        variant="success"
      />,
    );

    expect(screen.getByText('Receita')).toBeInTheDocument();
    expect(screen.getByText('R$ 10.000,00')).toHaveClass('text-success');
    expect(screen.getByTestId('kpi-icon')).toHaveClass('w-4', 'h-4');
    expect(screen.getByTestId('kpi-icon')).not.toHaveClass('old-class');
  });

  it('renders positive change badge', () => {
    render(
      <KPICard title="Saldo" value="R$ 1.500,00" icon={<svg />} change={10.6} variant="warning" />,
    );

    const badge = screen.getByText(/↑\s*11%/);
    expect(badge).toHaveClass('text-success');
    expect(screen.getByText('R$ 1.500,00')).toHaveClass('text-warning');
  });

  it('renders negative change badge', () => {
    render(
      <KPICard title="Despesa" value="R$ 800,00" icon={<svg />} change={-7.4} variant="danger" />,
    );

    const badge = screen.getByText(/↓\s*7%/);
    expect(badge).toHaveClass('text-error');
    expect(screen.getByText('R$ 800,00')).toHaveClass('text-error');
  });

  it('does not render change badge when change is undefined', () => {
    render(<KPICard title="Sem variacao" value="R$ 0,00" icon={<svg />} variant="default" />);

    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.getByText('R$ 0,00')).toHaveClass('text-secondary');
  });
});
