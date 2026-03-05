import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProjectFinancials } from '@/types';
import { ProjectFinanceConfigSection } from './ProjectFinanceConfigSection';

function renderSection(
  financials: ProjectFinancials,
  overrides: Partial<React.ComponentProps<typeof ProjectFinanceConfigSection>> = {},
) {
  const props: React.ComponentProps<typeof ProjectFinanceConfigSection> = {
    financials,
    baseContractValue: 1000,
    showSettings: false,
    onToggleSettings: vi.fn(),
    commonInputClass: 'input',
    onFinancialsChange: vi.fn(),
    onGenerateInstallments: vi.fn(),
    ...overrides,
  };

  render(<ProjectFinanceConfigSection {...props} />);
  return props;
}

describe('ProjectFinanceConfigSection', () => {
  it('changes payment type and base contract value', () => {
    const props = renderSection({ paymentType: 'vista' });

    fireEvent.click(screen.getByRole('button', { name: 'À Vista' }));
    fireEvent.click(screen.getByRole('button', { name: 'Parcelado' }));

    fireEvent.change(screen.getByLabelText('Valor base do contrato'), {
      target: { value: '2000' },
    });
    fireEvent.change(screen.getByLabelText('Valor base do contrato'), {
      target: { value: '' },
    });

    expect(props.onFinancialsChange).toHaveBeenCalledWith('paymentType', 'vista');
    expect(props.onFinancialsChange).toHaveBeenCalledWith('paymentType', 'parcelado');
    expect(props.onFinancialsChange).toHaveBeenCalledWith('baseContractValue', 2000);
  });

  it('renders parcel settings and triggers recalculation callbacks', () => {
    const props = renderSection(
      {
        paymentType: 'parcelado',
        numberOfInstallments: 5,
        installmentsPaymentDay: 10,
        installmentsInterestEnabled: true,
        installmentsInterestRate: 2,
      },
      { showSettings: true },
    );

    fireEvent.click(screen.getByRole('button', { name: /Recalcular Parcelas/i }));
    expect(props.onToggleSettings).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText('Número de Parcelas'), {
      target: { value: '8' },
    });
    fireEvent.change(screen.getByLabelText('Dia do Vencimento'), {
      target: { value: '20' },
    });
    fireEvent.click(screen.getByLabelText('Aplicar Juros (%)'));
    fireEvent.change(screen.getByLabelText('Taxa de Juros (%)'), {
      target: { value: '3.5' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Recalcular \(Substitui Existentes\)/i }));

    expect(props.onFinancialsChange).toHaveBeenCalledWith('numberOfInstallments', 8);
    expect(props.onFinancialsChange).toHaveBeenCalledWith('installmentsPaymentDay', 20);
    expect(props.onFinancialsChange).toHaveBeenCalledWith('installmentsInterestEnabled', false);
    expect(props.onFinancialsChange).toHaveBeenCalledWith('installmentsInterestRate', 3.5);
    expect(props.onGenerateInstallments).toHaveBeenCalledTimes(1);
  });
});
