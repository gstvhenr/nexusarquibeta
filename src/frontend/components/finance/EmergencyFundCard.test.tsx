import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getEmergencyFund,
  getEmergencyFundInsight,
  updateEmergencyFund,
} from '@/services/financeService';
import type { EmergencyFund } from '@/types';
import { EmergencyFundCard } from './EmergencyFundCard';

vi.mock('@/services/financeService', () => ({
  EMERGENCY_FUND_TARGET_MONTHS: 6,
  getEmergencyFund: vi.fn(),
  getEmergencyFundInsight: vi.fn(),
  updateEmergencyFund: vi.fn(),
}));

describe('EmergencyFundCard', () => {
  let fund: EmergencyFund = { currentValue: 0 };

  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    fund = { currentValue: 0 };
    vi.mocked(getEmergencyFund).mockImplementation(() => fund);
    vi.mocked(updateEmergencyFund).mockImplementation((value) => {
      fund = value.targetValue
        ? { currentValue: value.currentValue, targetValue: value.targetValue }
        : { currentValue: value.currentValue };
      return fund;
    });
    vi.mocked(getEmergencyFundInsight).mockImplementation((value, monthlyExpenseBaseline = 0) => {
      const currentValue = value.currentValue;
      const effectiveTargetValue =
        value.targetValue ?? (monthlyExpenseBaseline > 0 ? monthlyExpenseBaseline * 6 : null);
      const completionRatio =
        effectiveTargetValue && effectiveTargetValue > 0
          ? currentValue / effectiveTargetValue
          : null;
      return {
        completionRatio,
        currentValue,
        effectiveTargetValue,
        hasExplicitTarget: Boolean(value.targetValue),
        monthlyExpenseBaseline,
        monthsCovered: monthlyExpenseBaseline > 0 ? currentValue / monthlyExpenseBaseline : null,
        progressPercent:
          completionRatio === null
            ? 0
            : Math.max(0, Math.min(100, Math.round(completionRatio * 100))),
        tone: completionRatio !== null && completionRatio >= 0.5 ? 'primary' : 'warning',
      };
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    document.getElementById('modal-root')?.remove();
  });

  it('renders the reserve label and formatted balance', () => {
    fund = { currentValue: 12000 };

    render(<EmergencyFundCard monthlyExpenseBaseline={4000} />);

    expect(screen.getByText('Fundo de Reserva')).toBeInTheDocument();
    expect(screen.getByText('R$ 12.000,00')).toBeInTheDocument();
  });

  it('opens the modal and persists the edited reserve amount', async () => {
    render(<EmergencyFundCard monthlyExpenseBaseline={3000} />);

    fireEvent.click(screen.getByRole('button', { name: 'Editar fundo de reserva' }));

    const currentValueInput = screen.getByLabelText('Valor atual do fundo de reserva');
    fireEvent.focus(currentValueInput);
    fireEvent.change(currentValueInput, { target: { value: '9000' } });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar reserva' }));

    await waitFor(() => {
      expect(screen.getByText('R$ 9.000,00')).toBeInTheDocument();
      expect(updateEmergencyFund).toHaveBeenCalledWith({
        currentValue: 9000,
        targetValue: undefined,
      });
    });
  });
});
