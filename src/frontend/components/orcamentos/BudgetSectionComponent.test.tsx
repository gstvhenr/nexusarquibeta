import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetSectionComponent } from './BudgetSectionComponent';
import type { BudgetSection, BudgetItem, BillingMethod } from '../../types';

vi.mock('./BudgetItemRow', () => ({
  BudgetItemRow: ({
    item,
    onFieldChange,
    onRemoveItem,
  }: {
    item: BudgetItem;
    onFieldChange: (i: number, f: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveItem: (s: number, i: number) => void;
  }) => (
    <tr data-testid={`item-row-${item.id}`}>
      <td>
        <button onClick={() => onRemoveItem(1, item.id)}>Remove {item.id}</button>
        <input
          type="checkbox"
          checked={item.included}
          onChange={onFieldChange(item.id, 'included')}
          data-testid={`checkbox-${item.id}`}
        />
        <input
          type="text"
          value={item.description}
          onChange={onFieldChange(item.id, 'description')}
          data-testid={`text-${item.id}`}
        />
      </td>
    </tr>
  ),
}));

vi.mock('../../utils/formatters', () => ({
  formatCurrency: (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`,
}));

const mockSection: BudgetSection = {
  id: 1,
  title: 'Seção de Teste',
  unit: 'un',
  billing: {
    method: 'fixed_fee',
    value: 100,
  },
  items: [
    {
      id: 101,
      description: 'Item 1',
      quantity: 1,
      unitPrice: 50,
      included: true,
    },
    {
      id: 102,
      description: 'Item 2',
      quantity: 2,
      unitPrice: 20,
      included: true,
    },
  ],
};

const mockCalculations = {
  cost: 90,
  profit: 10,
  total: 100,
};

describe('BudgetSectionComponent', () => {
  const mockOnItemChange = vi.fn();
  const mockOnSectionChange = vi.fn();
  const mockOnAddItem = vi.fn();
  const mockOnRemoveItem = vi.fn();
  const mockOnRemoveSection = vi.fn();

  const renderComponent = (props = {}) => {
    return render(
      <BudgetSectionComponent
        section={mockSection}
        sectionCalculations={mockCalculations}
        onItemChange={mockOnItemChange}
        onSectionChange={mockOnSectionChange}
        onAddItem={mockOnAddItem}
        onRemoveItem={mockOnRemoveItem}
        onRemoveSection={mockOnRemoveSection}
        {...props}
      />,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section title, profit, and total correctly', () => {
    renderComponent();
    expect(screen.getByDisplayValue('Seção de Teste')).toBeInTheDocument();
    expect(screen.getByText('R$ 10,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
  });

  it('calls onSectionChange when title changes', () => {
    renderComponent();
    const titleInput = screen.getByDisplayValue('Seção de Teste');
    fireEvent.change(titleInput, { target: { value: 'Novo Título' } });
    expect(mockOnSectionChange).toHaveBeenCalledWith(1, 'title', 'Novo Título');
  });

  it('does not toggle expansion when interacting with title input', () => {
    renderComponent();
    const titleInput = screen.getByDisplayValue('Seção de Teste');

    // Not expanded initially
    expect(screen.queryByText('Configurações da Seção')).not.toBeInTheDocument();

    // Clicking on title should not expand (because of stopPropagation)
    fireEvent.click(titleInput);
    expect(screen.queryByText('Configurações da Seção')).not.toBeInTheDocument();

    // Typing should not expand either
    fireEvent.change(titleInput, { target: { value: 'Test' } });
    expect(screen.queryByText('Configurações da Seção')).not.toBeInTheDocument();
  });

  it('calls onRemoveSection without toggling expansion when remove button is clicked', () => {
    renderComponent();
    const removeButton = screen.getByLabelText('Remover seção');

    expect(screen.queryByText('Configurações da Seção')).not.toBeInTheDocument();

    fireEvent.click(removeButton);

    expect(mockOnRemoveSection).toHaveBeenCalledWith(1);
    // Should not expand due to stopPropagation
    expect(screen.queryByText('Configurações da Seção')).not.toBeInTheDocument();
  });

  it('toggles expansion on header click and Enter/Space keys', () => {
    const { container } = renderComponent();
    const header = container.querySelector('header')!;

    expect(screen.queryByText('Configurações da Seção')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(header);
    expect(screen.getByText('Configurações da Seção')).toBeInTheDocument();

    // Enter to collapse
    fireEvent.keyDown(header, { key: 'Enter', code: 'Enter' });
    expect(screen.queryByText('Configurações da Seção')).not.toBeInTheDocument();

    // Space to expand
    fireEvent.keyDown(header, { key: ' ', code: 'Space' });
    expect(screen.getByText('Configurações da Seção')).toBeInTheDocument();

    // Unrelated key doesn't toggle
    fireEvent.keyDown(header, { key: 'A', code: 'KeyA' });
    expect(screen.getByText('Configurações da Seção')).toBeInTheDocument(); // remains expanded
  });

  it('renders correct label for different billing methods', () => {
    const methodsAndLabels = [
      { method: 'percentage_on_top', text: 'Valor (%)' },
      { method: 'percentage_embedded', text: 'Valor (%)' },
      { method: 'fixed_fee', text: 'Valor (R$)' },
      { method: 'per_sqm', text: 'Valor (R$/m²)' },
      { method: 'per_hour', text: 'Valor (R$/h)' },
      { method: 'unknown' as BillingMethod, text: 'Valor' },
    ];

    methodsAndLabels.forEach(({ method, text }) => {
      const iterSection = { ...mockSection, billing: { method, value: 0 } };
      const { container, unmount } = renderComponent({ section: iterSection });
      const header = container.querySelector('header')!;
      fireEvent.click(header);

      expect(screen.getByLabelText(text)).toBeInTheDocument();
      unmount();
    });
  });

  it('stops propagation when clicking on the configuration section', () => {
    const { container } = renderComponent();
    const header = container.querySelector('header')!;

    // Expand
    fireEvent.click(header);
    expect(screen.getByText('Configurações da Seção')).toBeInTheDocument();

    // Clicking inside config section should not collapse
    const configDiv = screen.getByText('Configurações da Seção').closest('div')!;
    fireEvent.click(configDiv);

    // Still expanded
    expect(screen.getByText('Configurações da Seção')).toBeInTheDocument();
  });

  it('calls onSectionChange for unit, billingMethod, and billingValue', () => {
    const { container } = renderComponent();
    const header = container.querySelector('header')!;
    fireEvent.click(header);

    const unitSelect = screen.getByLabelText('Unidade padrão');
    fireEvent.change(unitSelect, { target: { value: 'm²' } });
    expect(mockOnSectionChange).toHaveBeenCalledWith(1, 'unit', 'm²');

    const methodSelect = screen.getByLabelText('Método de cobrança');
    fireEvent.change(methodSelect, { target: { value: 'percentage_on_top' } });
    expect(mockOnSectionChange).toHaveBeenCalledWith(1, 'billingMethod', 'percentage_on_top');

    const valueInput = screen.getByLabelText('Valor (R$)');
    fireEvent.change(valueInput, { target: { value: '150' } });
    expect(mockOnSectionChange).toHaveBeenCalledWith(1, 'billingValue', '150');
  });

  it('renders items list correctly', () => {
    renderComponent();
    expect(screen.getByText('+ Adicionar Serviço')).toBeInTheDocument();
    expect(screen.getByTestId('item-row-101')).toBeInTheDocument();
    expect(screen.getByTestId('item-row-102')).toBeInTheDocument();
  });

  it('calls onAddItem when add button is clicked', () => {
    renderComponent();
    const addButton = screen.getByText('+ Adicionar Serviço');
    fireEvent.click(addButton);
    expect(mockOnAddItem).toHaveBeenCalledWith(1);
  });

  it('calls onRemoveItem when an item inner remove button is clicked', () => {
    renderComponent();
    const removeItemButton = screen.getByText('Remove 101');
    fireEvent.click(removeItemButton);
    expect(mockOnRemoveItem).toHaveBeenCalledWith(1, 101);
  });

  it('calls onItemChange when items trigger field change', () => {
    renderComponent();

    // Checkbox is initially true (from mockItem)
    const checkbox = screen.getByTestId('checkbox-101');
    fireEvent.click(checkbox); // toggles to false

    expect(mockOnItemChange).toHaveBeenCalledWith(1, 101, 'included', false);

    // Text input
    const textInput = screen.getByTestId('text-102');
    fireEvent.change(textInput, { target: { value: 'New text' } });

    expect(mockOnItemChange).toHaveBeenCalledWith(1, 102, 'description', 'New text');
  });
});
