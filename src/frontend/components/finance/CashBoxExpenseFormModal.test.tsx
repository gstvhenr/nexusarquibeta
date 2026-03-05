import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as cashBoxService from '../../services/cashBoxService';
import CashBoxExpenseFormModal from './CashBoxExpenseFormModal';

function setupModalRoot() {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
}

describe('CashBoxExpenseFormModal', () => {
  beforeEach(() => {
    setupModalRoot();
    vi.spyOn(cashBoxService, 'getCategoriesForOrigin').mockImplementation((origin) =>
      origin === 'Profissional' ? ['Escritório'] : ['Alimentação'],
    );
    vi.spyOn(cashBoxService, 'getItemsForCategory').mockImplementation((_origin, category) =>
      category === 'Escritório' ? ['Aluguel do Escritório'] : [],
    );
    vi.spyOn(cashBoxService, 'validateExpenseInput').mockReturnValue({ valid: true, errors: [] });
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.getElementById('modal-root')?.remove();
  });

  it('returns null when closed', () => {
    render(<CashBoxExpenseFormModal isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows validation errors and blocks save when input is invalid', async () => {
    vi.mocked(cashBoxService.validateExpenseInput).mockReturnValue({
      valid: false,
      errors: ['Origem é obrigatória.', 'Data de vencimento é obrigatória.'],
    });

    const onSave = vi.fn();
    render(<CashBoxExpenseFormModal isOpen={true} onClose={vi.fn()} onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(await screen.findByText(/Origem é obrigatória/i)).toBeInTheDocument();
    expect(screen.getByText(/Data de vencimento é obrigatória/i)).toBeInTheDocument();
  });

  it('saves valid expense and forwards parsed payload', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<CashBoxExpenseFormModal isOpen={true} onClose={onClose} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText('Origem'), { target: { value: 'Profissional' } });
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'Escritório' } });

    const itemSelect = await screen.findByLabelText('Item');
    fireEvent.change(itemSelect, { target: { value: 'Aluguel do Escritório' } });
    fireEvent.change(screen.getByLabelText('Recorrência'), { target: { value: 'Parcelada' } });

    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '980.5' } });

    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-05-10' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-05-11' } });

    const spinButtons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinButtons[1], { target: { value: '6' } });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(cashBoxService.validateExpenseInput).toHaveBeenCalled();
      expect(onSave).toHaveBeenCalledWith({
        origin: 'Profissional',
        category: 'Escritório',
        item: 'Aluguel do Escritório',
        recurrence: 'Parcelada',
        dueDate: '2026-05-10',
        paymentDate: '2026-05-11',
        value: 980.5,
        installments: 6,
      });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
