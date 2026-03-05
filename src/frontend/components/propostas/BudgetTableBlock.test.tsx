import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetTableBlock } from './BudgetTableBlock';
import type { Proposal } from '../../types';

// Mock formatters module
vi.mock('../../utils/formatters', () => ({
  formatCurrency: (val: number) => `R$ ${val.toFixed(2)}`,
}));

const mockProposal: Proposal = {
  id: 'prop-123',
  code: 'PRP-2026-001',
  name: 'Projeto Residencial Alpha',
  clientId: 'client-1',
  date: '2026-01-15',
  status: 'Pendente',
  total: 4500, // (2000 + 3000) - 10% = 5000 - 500 = 4500
  subtotal: 5000,
  discount: 10,
  sections: [
    {
      id: 1,
      title: 'Projeto Arquitetônico',
      items: [
        { id: 1, description: 'Levantamento', quantity: 1, unit: 'un', unitPrice: 2000 },
        { id: 2, description: 'Modelagem 3D', quantity: 2, unit: 'un', unitPrice: 1500 },
      ],
    },
  ],
};

describe('BudgetTableBlock', () => {
  it('renders all sections and items correctly when all flags are enabled', () => {
    render(
      <BudgetTableBlock
        proposal={mockProposal}
        showItemPrices={true}
        showSectionTotals={true}
        showDiscount={true}
        showGrandTotal={true}
        totalsAlignment="right"
      />
    );

    // Section title
    expect(screen.getByText('Projeto Arquitetônico')).toBeInTheDocument();

    // Items
    expect(screen.getByText('Levantamento')).toBeInTheDocument();
    expect(screen.getByText(/Modelagem 3D/)).toBeInTheDocument();
    expect(screen.getByText('(2 un)')).toBeInTheDocument();

    // Item Prices (1 * 2000 and 2 * 1500)
    expect(screen.getByText('R$ 2000.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 3000.00')).toBeInTheDocument();

    // Section total
    expect(screen.getAllByText('R$ 5000.00').length).toBeGreaterThanOrEqual(1);

    // Grand total section
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    // Subtotal
    expect(screen.getAllByText('R$ 5000.00').length).toBeGreaterThanOrEqual(1);

    // Discount
    expect(screen.getByText('Desconto (10%)')).toBeInTheDocument();
    expect(screen.getByText('- R$ 500.00')).toBeInTheDocument();

    // Final total
    expect(screen.getByText('R$ 4500.00')).toBeInTheDocument();
  });

  it('hides item prices, section totals, and grand total when flags are disabled', () => {
    render(
      <BudgetTableBlock
        proposal={mockProposal}
        showItemPrices={false}
        showSectionTotals={false}
        showDiscount={false}
        showGrandTotal={false}
        totalsAlignment="left"
      />
    );

    // Items should still be rendered
    expect(screen.getByText('Levantamento')).toBeInTheDocument();
    expect(screen.getByText(/Modelagem 3D/)).toBeInTheDocument();

    // Item prices should NOT be rendered
    expect(screen.queryByText('R$ 2000.00')).not.toBeInTheDocument();
    expect(screen.queryByText('R$ 3000.00')).not.toBeInTheDocument();

    // Section total should NOT be rendered
    expect(screen.queryByText('Subtotal da Seção:')).not.toBeInTheDocument();

    // Grand total should NOT be rendered
    expect(screen.queryByText('Subtotal')).not.toBeInTheDocument();
    expect(screen.queryByText('Total')).not.toBeInTheDocument();
  });

  it('hides discount if showDiscount is false even if grand total is shown', () => {
    render(
      <BudgetTableBlock
        proposal={mockProposal}
        showItemPrices={false}
        showSectionTotals={false}
        showDiscount={false}
        showGrandTotal={true}
        totalsAlignment="right"
      />
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.queryByText('Desconto (10%)')).not.toBeInTheDocument();
    expect(screen.queryByText('Subtotal')).not.toBeInTheDocument();
  });

  it('hides discount if proposal discount is 0 even if showDiscount is true', () => {
    render(
      <BudgetTableBlock
        proposal={{ ...mockProposal, discount: 0 }}
        showItemPrices={false}
        showSectionTotals={false}
        showDiscount={true}
        showGrandTotal={true}
        totalsAlignment="right"
      />
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.queryByText(/Desconto/)).not.toBeInTheDocument();
  });

  it('applies totals alignment classes correctly', () => {
    const { rerender, container } = render(
      <BudgetTableBlock
        proposal={mockProposal}
        showItemPrices={false}
        showSectionTotals={false}
        showDiscount={false}
        showGrandTotal={true}
        totalsAlignment="right"
      />
    );

    // Check for right alignment class
    expect(container.querySelector('.justify-end')).toBeInTheDocument();

    rerender(
      <BudgetTableBlock
        proposal={mockProposal}
        showItemPrices={false}
        showSectionTotals={false}
        showDiscount={false}
        showGrandTotal={true}
        totalsAlignment="left"
      />
    );

    // Check for left alignment class
    expect(container.querySelector('.justify-start')).toBeInTheDocument();
  });
});
