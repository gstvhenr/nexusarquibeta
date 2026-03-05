import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommissionsTable } from './CommissionsTable';
import type { Commission } from '@/types';

const pendingCommission: Commission = {
  id: 'comm-pending',
  saleDate: '2026-03-01',
  supplierId: 'sup-1',
  supplierName: 'Fornecedor A',
  clientId: 'cli-1',
  clientName: 'Cliente A',
  saleValue: 10000,
  commissionPercentage: 10,
  commissionValue: 1000,
  status: 'Pendente',
  expectedPaymentDate: '2026-03-20',
  paymentDate: null,
  notes: 'Observação',
  archived: false,
};

const receivedCommission: Commission = {
  ...pendingCommission,
  id: 'comm-received',
  supplierName: 'Fornecedor B',
  status: 'Recebido',
  paymentDate: '2026-03-05',
  archived: false,
};

describe('CommissionsTable', () => {
  it('handles pending and received row actions', () => {
    const onConfirmPayment = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onToggleArchive = vi.fn();

    render(
      <CommissionsTable
        commissions={[pendingCommission, receivedCommission]}
        onConfirmPayment={onConfirmPayment}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleArchive={onToggleArchive}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    fireEvent.click(screen.getByLabelText('Editar comissão'));
    fireEvent.click(screen.getByLabelText('Excluir comissão'));
    fireEvent.click(screen.getByLabelText('Arquivar comissão'));

    expect(onConfirmPayment).toHaveBeenCalledWith(pendingCommission);
    expect(onEdit).toHaveBeenCalledWith(pendingCommission);
    expect(onDelete).toHaveBeenCalledWith(pendingCommission);
    expect(onToggleArchive).toHaveBeenCalledWith('comm-received', true);
  });

  it('shows empty state when list is empty', () => {
    render(
      <CommissionsTable
        commissions={[]}
        onConfirmPayment={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleArchive={vi.fn()}
      />,
    );

    expect(screen.getByText('Nenhuma comissão encontrada.')).toBeInTheDocument();
  });
});
