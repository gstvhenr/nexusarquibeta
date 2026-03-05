import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Project, ProjectFinancials } from '@/types';
import { ProjectFinanceTransactionsSection } from './ProjectFinanceTransactionsSection';

const baseProject: Project = {
  id: 'project-1',
  code: 'PRJ-001',
  name: 'Projeto',
  clientName: 'Cliente',
  clientId: 'client-1',
  status: 'Em Andamento',
  deadline: null,
  budget: 1000,
  description: '',
  sections: [],
  financials: { paymentType: 'vista', lumpSumValue: 1000 },
};

function renderSection(
  financials: ProjectFinancials,
  overrides: Partial<React.ComponentProps<typeof ProjectFinanceTransactionsSection>> = {},
) {
  const props: React.ComponentProps<typeof ProjectFinanceTransactionsSection> = {
    project: { ...baseProject, financials },
    financials,
    onFinancialsChange: vi.fn(),
    onInstallmentChange: vi.fn(),
    onGenerateInstallments: vi.fn(),
    onConfirmPayment: vi.fn(),
    onAddInstallment: vi.fn(),
    onRemoveInstallment: vi.fn(),
    ...overrides,
  };

  render(<ProjectFinanceTransactionsSection {...props} />);
  return props;
}

describe('ProjectFinanceTransactionsSection', () => {
  it('handles vista payment flow', () => {
    const props = renderSection({
      paymentType: 'vista',
      lumpSumValue: 2000,
      lumpSumStatus: 'Em aberto',
      lumpSumDueDate: '2026-04-05',
    });

    fireEvent.change(screen.getByLabelText('Data de Vencimento'), {
      target: { value: '2026-04-10' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar Recebimento' }));

    expect(props.onFinancialsChange).toHaveBeenCalledWith('lumpSumDueDate', '2026-04-10');
    expect(props.onConfirmPayment).toHaveBeenCalledWith({ type: 'lump' });
  });

  it('renders paid vista state', () => {
    renderSection({
      paymentType: 'vista',
      lumpSumValue: 900,
      lumpSumStatus: 'Pago',
      lumpSumDueDate: '2026-04-01',
      lumpSumPaymentDate: '2026-04-01',
    });

    expect(screen.getByText('Pago')).toBeInTheDocument();
  });

  it('handles parcelado table interactions and empty state', () => {
    const props = renderSection({
      paymentType: 'parcelado',
      installments: [
        {
          id: 'inst-1',
          number: 1,
          value: 300,
          dueDate: '2026-04-20',
          paid: false,
          paymentDate: null,
          description: 'Parcela 1',
        },
        {
          id: 'inst-2',
          number: 2,
          value: 300,
          dueDate: '2026-04-25',
          paid: true,
          paymentDate: '2026-04-24',
          description: 'Parcela 2',
        },
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: /Nova Parcela/i }));
    fireEvent.change(screen.getByDisplayValue('Parcela 1'), { target: { value: 'Parcela 1A' } });

    const dueDateInputs = screen.getAllByLabelText('Data de Vencimento');
    fireEvent.change(dueDateInputs[0], { target: { value: '2026-04-30' } });

    fireEvent.change(screen.getAllByLabelText('Valor da Parcela')[0], {
      target: { value: '450' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Receber' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover parcela' }));

    expect(props.onAddInstallment).toHaveBeenCalledTimes(1);
    expect(props.onInstallmentChange).toHaveBeenCalledWith('inst-1', 'description', 'Parcela 1A');
    expect(props.onInstallmentChange).toHaveBeenCalledWith('inst-1', 'dueDate', '2026-04-30');
    expect(props.onInstallmentChange).toHaveBeenCalledWith('inst-1', 'value', 450);
    expect(props.onConfirmPayment).toHaveBeenCalledWith({ type: 'installment', id: 'inst-1' });
    expect(props.onRemoveInstallment).toHaveBeenCalledWith('inst-1');

    cleanup();
    const emptyProps = renderSection({
      paymentType: 'parcelado',
      installments: [],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Gerar Agora' }));
    expect(emptyProps.onGenerateInstallments).toHaveBeenCalledTimes(1);
  });
});
