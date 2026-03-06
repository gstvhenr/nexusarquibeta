import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmPaymentModal, InfoCard, RevisionCounter } from './ProjetoDetalhesWidgets';

function setupModalRoot() {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
}

describe('ProjetoDetalhesWidgets', () => {
  beforeEach(() => {
    setupModalRoot();
  });

  afterEach(() => {
    document.getElementById('modal-root')?.remove();
  });

  it('renders InfoCard and RevisionCounter states', () => {
    const onIncrement = vi.fn();
    render(
      <>
        <InfoCard label="Contrato" className="custom-card">
          R$ 10.000,00
        </InfoCard>
        <RevisionCounter count={4} limit={3} onIncrement={onIncrement} />
      </>,
    );

    expect(screen.getByText('Contrato')).toBeInTheDocument();
    expect(screen.getByText('R$ 10.000,00')).toBeInTheDocument();
    expect(screen.getByText(/Limite excedido/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar revisão' }));
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  it('handles ConfirmPaymentModal interactions', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<ConfirmPaymentModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    fireEvent.change(screen.getByLabelText('Data de recebimento'), {
      target: { value: '2026-07-01' },
    });
    fireEvent.change(screen.getByLabelText('Forma de pagamento'), {
      target: { value: 'PIX' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(onConfirm).toHaveBeenCalledWith('2026-07-01', 'PIX');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render ConfirmPaymentModal when closed', () => {
    render(<ConfirmPaymentModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByText('Confirmar Recebimento')).not.toBeInTheDocument();
  });
});
