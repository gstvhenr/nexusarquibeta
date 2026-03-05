import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetItemRow } from './BudgetItemRow';
import type { BudgetItem } from '../../types';

// Mock do formatCurrency para evitar problemas com espaços em branco invisíveis (&nbsp;)
vi.mock('../../utils/formatters', () => ({
  formatCurrency: (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`,
}));

const mockItem: BudgetItem = {
  id: 1,
  description: 'Item Teste',
  quantity: 2,
  unitPrice: 50,
  estimatedHours: 5,
  included: true,
};

describe('BudgetItemRow', () => {
  const mockOnFieldChange = vi.fn();
  const mockOnRemoveItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation that just returns another vi.fn() as the component expects a curried function
    mockOnFieldChange.mockImplementation(() => vi.fn());
  });

  const renderComponent = (props = {}) => {
    return render(
      <table>
        <tbody>
          <BudgetItemRow
            item={mockItem}
            index={0}
            sectionId={1}
            sectionUnit="un"
            useProfitPercentage={false}
            billingValue={0}
            onFieldChange={mockOnFieldChange}
            onRemoveItem={mockOnRemoveItem}
            {...props}
          />
        </tbody>
      </table>
    );
  };

  it('renders correctly with default props', () => {
    renderComponent();
    expect(screen.getByDisplayValue('Item Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // quantity
    expect(screen.getByDisplayValue('50.00')).toBeInTheDocument(); // unitPrice
    expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // estimatedHours

    // total: quantity (2) * unitPrice (50) = 100
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
  });

  it('calculates total using profit percentage when useProfitPercentage is true', () => {
    // quantity = 2
    // billingValue = 200
    // unitPrice (profit) = 10 (%)
    // total = 2 * (200 * (1 + 10 / 100)) = 2 * (200 * 1.1) = 2 * 220 = 440
    renderComponent({
      useProfitPercentage: true,
      billingValue: 200,
      item: { ...mockItem, unitPrice: 10 },
    });
    expect(screen.getByText('R$ 440,00')).toBeInTheDocument();
  });

  it('calculates total using estimatedHours when sectionUnit is "h"', () => {
    // sectionUnit = 'h' -> quantityForTotal = estimatedHours = 5
    // useProfitPercentage = false -> total = 5 * 50 = 250
    renderComponent({
      sectionUnit: 'h',
    });
    expect(screen.getByText('R$ 250,00')).toBeInTheDocument();
  });

  it('disables inputs when item is not included', () => {
    renderComponent({
      item: { ...mockItem, included: false },
    });

    expect(screen.getByLabelText('Descrição do item')).toBeDisabled();
    expect(screen.getByLabelText('Quantidade para Item Teste')).toBeDisabled();
    expect(screen.getByLabelText('Preço unitário para Item Teste')).toBeDisabled();
    expect(screen.getByLabelText('Horas estimadas para Item Teste')).toBeDisabled();
  });

  it('calls onFieldChange when inputs change', () => {
    const changeHandler = vi.fn();
    mockOnFieldChange.mockReturnValue(changeHandler);

    renderComponent();

    const checkbox = screen.getByRole('checkbox', { name: /Incluir Item Teste/i });
    fireEvent.click(checkbox);
    expect(mockOnFieldChange).toHaveBeenCalledWith(1, 'included');

    const descriptionInput = screen.getByLabelText('Descrição do item');
    fireEvent.change(descriptionInput, { target: { value: 'Novo Teste' } });
    expect(mockOnFieldChange).toHaveBeenCalledWith(1, 'description');
    expect(changeHandler).toHaveBeenCalled();
  });

  it('calls onRemoveItem when delete button is clicked', () => {
    renderComponent();
    const removeButton = screen.getByRole('button', { name: /Remover Item Teste/i });
    fireEvent.click(removeButton);
    expect(mockOnRemoveItem).toHaveBeenCalledWith(1, 1);
  });
});
