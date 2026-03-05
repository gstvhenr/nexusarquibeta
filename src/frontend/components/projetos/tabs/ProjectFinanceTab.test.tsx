import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Project } from '@/types';
import { ProjectFinanceTab } from './ProjectFinanceTab';

const baseProject: Project = {
  id: 'project-1',
  code: 'PRJ-001',
  name: 'Projeto Financeiro',
  clientName: 'Cliente',
  clientId: 'client-1',
  status: 'Em Andamento',
  deadline: null,
  budget: 1000,
  description: '',
  sections: [],
  financials: {
    paymentType: 'vista',
    baseContractValue: 1000,
    lumpSumStatus: 'Em aberto',
    addendums: [],
  },
};

function renderTab(overrides: Partial<React.ComponentProps<typeof ProjectFinanceTab>> = {}) {
  const props: React.ComponentProps<typeof ProjectFinanceTab> = {
    project: baseProject,
    budgetServices: [
      {
        id: 'svc-1',
        sectionTitle: 'Etapa A',
        description: 'Levantamento',
        suggestedValue: 350,
        unit: 'm²',
      },
    ],
    onFinancialsChange: vi.fn(),
    onInstallmentChange: vi.fn(),
    onGenerateInstallments: vi.fn(),
    onConfirmPayment: vi.fn(),
    onAddInstallment: vi.fn(),
    onRemoveInstallment: vi.fn(),
    onAddAddendum: vi.fn(),
    onUpdateAddendumStatus: vi.fn(),
    onRemoveAddendum: vi.fn(),
    ...overrides,
  };

  render(<ProjectFinanceTab {...props} />);
  return props;
}

describe('ProjectFinanceTab', () => {
  it('ignores invalid manual addendum submission', () => {
    const props = renderTab();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Aditivo' }));
    expect(props.onAddAddendum).not.toHaveBeenCalled();
  });

  it('adds manual and budget-service addendums with correct signs', async () => {
    const props = renderTab();

    const descriptionInput = screen.getByPlaceholderText('Descrição');
    const valueInputs = screen.getAllByPlaceholderText('Valor');

    fireEvent.change(descriptionInput, { target: { value: 'Aditivo Manual' } });
    fireEvent.change(valueInputs[0], { target: { value: '120' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Aditivo' }));

    expect(props.onAddAddendum).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Aditivo Manual',
        value: 120,
      }),
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Desconto' })[0]);
    fireEvent.change(descriptionInput, { target: { value: 'Desconto Manual' } });
    fireEvent.change(valueInputs[0], { target: { value: '45' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Aditivo' }));

    expect(props.onAddAddendum).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Desconto Manual',
        value: -45,
      }),
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'svc-1' } });
    await waitFor(() => {
      expect(screen.getByText(/Unidade: m²/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Desconto' })[1]);
    fireEvent.change(valueInputs[1], { target: { value: '500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar Serviço como Aditivo' }));

    expect(props.onAddAddendum).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining('Desconto em serviço: Levantamento'),
        value: -500,
      }),
    );
  });
});
