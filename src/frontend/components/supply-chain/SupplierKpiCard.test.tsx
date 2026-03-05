import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SupplierKpiCard from './SupplierKpiCard';

describe('SupplierKpiCard', () => {
  it('renders label, value and icon with color classes', () => {
    render(
      <SupplierKpiCard
        label="Produtos no Catálogo"
        value={12}
        icon={<span data-testid="kpi-icon">*</span>}
        color="text-info bg-info"
      />,
    );

    expect(screen.getByText('Produtos no Catálogo')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    const icon = screen.getByTestId('kpi-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.closest('div')).toHaveClass('text-info');
    expect(icon.closest('div')).toHaveClass('bg-info');
  });

  it('renders subtext only when provided', () => {
    const { rerender } = render(
      <SupplierKpiCard
        label="Total Negociado"
        value="R$ 3.000,00"
        subtext="Vendas confirmadas"
        icon={<span data-testid="kpi-icon">*</span>}
        color="text-success bg-success"
      />,
    );

    expect(screen.getByText('Vendas confirmadas')).toBeInTheDocument();

    rerender(
      <SupplierKpiCard
        label="Total Negociado"
        value="R$ 3.000,00"
        icon={<span data-testid="kpi-icon">*</span>}
        color="text-success bg-success"
      />,
    );

    expect(screen.queryByText('Vendas confirmadas')).not.toBeInTheDocument();
  });
});
