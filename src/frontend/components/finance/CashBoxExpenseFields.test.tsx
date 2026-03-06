import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CashBoxCategory, CashBoxExpense, CashBoxOrigin } from '../../types';
import CashBoxExpenseFields from './CashBoxExpenseFields';

type Recurrence = CashBoxExpense['recurrence'];

const BASE_PROPS = {
  origin: '' as CashBoxOrigin | '',
  category: '' as CashBoxCategory | '',
  item: null as string | null,
  recurrence: '' as Recurrence | '',
  dueDate: '',
  paymentDate: '',
  value: 0,
  installments: 2,
  errors: [] as string[],
  categories: [] as CashBoxCategory[],
  items: [] as string[],
  ORIGINS: ['Profissional', 'Pessoal'] as CashBoxOrigin[],
  onOriginChange: vi.fn(),
  onCategoryChange: vi.fn(),
  onItemChange: vi.fn(),
  onRecurrenceChange: vi.fn(),
  onDueDateChange: vi.fn(),
  onPaymentDateChange: vi.fn(),
  onValueChange: vi.fn(),
  onInstallmentsChange: vi.fn(),
};

function renderComponent(overrides: Partial<typeof BASE_PROPS> = {}) {
  const props = { ...BASE_PROPS, ...overrides };
  return render(<CashBoxExpenseFields {...props} />);
}

describe('CashBoxExpenseFields', () => {
  it('renders validation errors and fallback for categories without items', () => {
    renderComponent({
      errors: ['Origem obrigatoria', 'Valor invalido'],
      origin: 'Profissional',
      category: 'Escritório',
      items: [],
    });

    expect(screen.getByText(/Origem obrigatoria/i)).toBeInTheDocument();
    expect(screen.getByText(/Valor invalido/i)).toBeInTheDocument();
    expect(screen.getByText(/Sem itens para esta categoria/i)).toBeInTheDocument();
    expect(screen.getByText(/não possui itens cadastrados/i)).toBeInTheDocument();
  });

  it('disables category select while origin is empty', () => {
    renderComponent();
    expect(screen.getByLabelText('Categoria')).toBeDisabled();
  });

  it('calls change handlers with normalized values', () => {
    const onOriginChange = vi.fn();
    const onCategoryChange = vi.fn();
    const onItemChange = vi.fn();
    const onRecurrenceChange = vi.fn();
    const onValueChange = vi.fn();
    const onDueDateChange = vi.fn();
    const onPaymentDateChange = vi.fn();
    const onInstallmentsChange = vi.fn();

    const { container } = renderComponent({
      origin: 'Profissional',
      category: 'Escritório',
      categories: ['Escritório', 'Alimentação'],
      items: ['Aluguel do Escritório'],
      recurrence: 'Parcelada',
      dueDate: '2026-04-01',
      paymentDate: '2026-04-05',
      value: 1000,
      installments: 3,
      onOriginChange,
      onCategoryChange,
      onItemChange,
      onRecurrenceChange,
      onValueChange,
      onDueDateChange,
      onPaymentDateChange,
      onInstallmentsChange,
    });

    fireEvent.change(screen.getByLabelText('Origem'), { target: { value: 'Pessoal' } });
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'Alimentação' } });
    fireEvent.change(screen.getByLabelText('Item'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Recorrência'), { target: { value: 'Indeterminada' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '321.99' } });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-06-10' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-06-11' } });

    const spinButtons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinButtons[1], { target: { value: '5' } });

    expect(onOriginChange).toHaveBeenCalledWith('Pessoal');
    expect(onCategoryChange).toHaveBeenCalledWith('Alimentação');
    expect(onItemChange).toHaveBeenCalledWith(null);
    expect(onRecurrenceChange).toHaveBeenCalledWith('Indeterminada');
    expect(onValueChange).toHaveBeenCalledWith(321.99);
    expect(onDueDateChange).toHaveBeenCalledWith('2026-06-10');
    expect(onPaymentDateChange).toHaveBeenCalledWith('2026-06-11');
    expect(onInstallmentsChange).toHaveBeenCalledWith(5);
  });

  it('renders recurrence-specific hints and installments field', () => {
    const { rerender } = render(
      <CashBoxExpenseFields {...BASE_PROPS} recurrence="Indeterminada" />,
    );

    expect(screen.getByText(/sem data final/i)).toBeInTheDocument();
    expect(screen.queryByText(/As parcelas serão lançadas/i)).not.toBeInTheDocument();

    rerender(<CashBoxExpenseFields {...BASE_PROPS} recurrence="Parcelada" />);
    expect(screen.getByText(/As parcelas serão lançadas/i)).toBeInTheDocument();
    expect(screen.getByText(/Nº de Parcelas/i)).toBeInTheDocument();
  });
});
