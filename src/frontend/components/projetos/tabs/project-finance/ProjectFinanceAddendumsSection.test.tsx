import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProjectFinancials } from '@/types';
import { ProjectFinanceAddendumsSection } from './ProjectFinanceAddendumsSection';

const financialsWithData: ProjectFinancials = {
  paymentType: 'vista',
  addendums: [
    {
      id: 'ad-1',
      description: 'Aditivo estrutural',
      value: 300,
      date: '2026-03-10',
      status: 'Pendente',
    },
  ],
  addendumAuditTrail: [
    {
      id: 'entry-1',
      addendumId: 'ad-1',
      action: 'created',
      description: 'Aditivo estrutural',
      timestamp: '2026-03-11T10:00:00.000Z',
    },
  ],
};

function renderSection(
  overrides: Partial<React.ComponentProps<typeof ProjectFinanceAddendumsSection>> = {},
) {
  const onNewAddendumChange = vi.fn();

  const props: React.ComponentProps<typeof ProjectFinanceAddendumsSection> = {
    financials: financialsWithData,
    commonInputClass: 'input',
    newAddendum: {
      description: '',
      value: 0,
      date: '2026-03-10',
      isDiscount: false,
    },
    onNewAddendumChange,
    onAddNewAddendum: vi.fn(),
    budgetServices: [
      {
        id: 'service-1',
        sectionTitle: 'Etapa A',
        description: 'Levantamento',
        suggestedValue: 500,
        unit: 'm²',
      },
    ],
    selectedBudgetServiceId: '',
    onBudgetServiceIdChange: vi.fn(),
    budgetServiceValue: 0,
    onBudgetServiceValueChange: vi.fn(),
    budgetServiceDate: '2026-03-20',
    onBudgetServiceDateChange: vi.fn(),
    budgetServiceMode: 'increase',
    onBudgetServiceModeChange: vi.fn(),
    selectedBudgetService: undefined,
    onAddBudgetService: vi.fn(),
    onUpdateAddendumStatus: vi.fn(),
    onRemoveAddendum: vi.fn(),
    ...overrides,
  };

  render(<ProjectFinanceAddendumsSection {...props} />);
  return { props, onNewAddendumChange };
}

describe('ProjectFinanceAddendumsSection', () => {
  it('renders addendums and dispatches status/remove actions', () => {
    const { props } = renderSection();

    expect(screen.getAllByText('Aditivo estrutural').length).toBeGreaterThan(0);
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'Aprovado' } });
    fireEvent.click(screen.getByRole('button', { name: /Remover aditivo/i }));

    expect(props.onUpdateAddendumStatus).toHaveBeenCalledWith('ad-1', 'Aprovado');
    expect(props.onRemoveAddendum).toHaveBeenCalledWith('ad-1');
    expect(screen.getByText(/Criado/i)).toBeInTheDocument();
  });

  it('handles manual and budget-service form callbacks', () => {
    const { props, onNewAddendumChange } = renderSection();

    fireEvent.click(screen.getAllByRole('button', { name: 'Acréscimo' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Desconto' })[0]);
    fireEvent.change(screen.getByPlaceholderText('Descrição'), {
      target: { value: 'Novo aditivo' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('Valor')[0], {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Aditivo' }));

    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'service-1' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('Valor')[1], {
      target: { value: '250' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar Serviço como Aditivo' }));

    expect(onNewAddendumChange).toHaveBeenCalled();
    expect(props.onAddNewAddendum).toHaveBeenCalledTimes(1);
    expect(props.onBudgetServiceIdChange).toHaveBeenCalledWith('service-1');
    expect(props.onBudgetServiceValueChange).toHaveBeenCalledWith(250);
    expect(props.onAddBudgetService).toHaveBeenCalledTimes(1);
  });

  it('shows empty state when addendums list is empty', () => {
    renderSection({ financials: { paymentType: 'vista', addendums: [] } });
    expect(screen.getByText('Nenhum aditivo registrado.')).toBeInTheDocument();
  });
});
