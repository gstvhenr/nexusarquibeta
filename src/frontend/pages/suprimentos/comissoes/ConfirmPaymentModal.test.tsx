import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmPaymentModal } from './ConfirmPaymentModal';
import type { Commission } from '@/types';

const commission: Commission = {
  id: 'comm-1',
  saleDate: '2026-02-10',
  supplierId: 'sup-1',
  supplierName: 'Fornecedor Atlas',
  clientId: 'cli-1',
  clientName: 'Cliente A',
  saleValue: 10000,
  commissionPercentage: 10,
  commissionValue: 1000,
  status: 'Pendente',
  expectedPaymentDate: '2026-03-10',
  paymentDate: null,
  notes: '',
  archived: false,
};

describe('ConfirmPaymentModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
  });

  it('does not render when closed or without commission', () => {
    const { rerender } = render(
      <ConfirmPaymentModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        commission={commission}
      />,
    );

    expect(screen.queryByText('Confirmar Recebimento')).not.toBeInTheDocument();

    rerender(
      <ConfirmPaymentModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} commission={null} />,
    );

    expect(screen.queryByText('Confirmar Recebimento')).not.toBeInTheDocument();
  });

  it('confirms payment with selected date', () => {
    const onConfirm = vi.fn();

    render(
      <ConfirmPaymentModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        commission={commission}
      />,
    );

    fireEvent.change(screen.getByLabelText('Data de Recebimento'), {
      target: { value: '2026-03-15' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(screen.getByText('Fornecedor Atlas')).toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledWith('2026-03-15');
  });
});
