import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import type { CashBoxCredit, CashBoxExpense } from '@/types';
import FinanceiroGestaoCaixaPage from './FinanceiroGestaoCaixaPage';

describe('FinanceiroGestaoCaixaPage', () => {
  const initialExpense: CashBoxExpense = {
    id: 'expense-1',
    origin: 'Profissional',
    category: 'Softwares',
    item: 'Adobe Creative Cloud',
    recurrence: 'Única',
    dueDate: '2026-03-04',
    paymentDate: null,
    value: 300,
    installmentNumber: null,
    installmentTotal: null,
    recurringGroupId: null,
    createdAt: '2026-03-01T00:00:00.000Z',
  };

  const initialCredit: CashBoxCredit = {
    id: 'credit-1',
    origin: 'Profissional',
    category: 'Comissões',
    item: 'Comissão de Parceiro',
    description: 'Receita inicial',
    date: '2026-03-06',
    value: 900,
    confirmed: false,
    createdAt: '2026-03-01T00:00:00.000Z',
  };

  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    api.clearAllData();
    const snapshot = api.getData();
    api.replaceData({
      ...snapshot,
      cashBoxExpenses: [initialExpense],
      cashBoxCredits: [initialCredit],
    });
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    api.clearAllData();
  });

  it('supports create, confirm, delete, sorting and month navigation flows', async () => {
    render(
      <DataProvider>
        <FinanceiroGestaoCaixaPage />
      </DataProvider>,
    );

    expect(screen.getByText('Gestão de Caixa')).toBeInTheDocument();
    expect(screen.getByText('Softwares')).toBeInTheDocument();
    expect(screen.getByText('Receita inicial')).toBeInTheDocument();
    expect(screen.getByText('▼')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Data'));
    expect(screen.getByText('▲')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));

    fireEvent.click(screen.getByRole('button', { name: /Adicionar crédito/i }));
    fireEvent.change(screen.getByLabelText('Origem'), { target: { value: 'Profissional' } });
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'Comissões' } });
    fireEvent.change(screen.getByLabelText('Item'), { target: { value: 'Comissão de Parceiro' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Comissão extra' } });
    fireEvent.change(screen.getByLabelText('Data do crédito'), { target: { value: '2026-03-22' } });
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '600' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Crédito' }));

    await waitFor(() =>
      expect(screen.getByText('Crédito registrado com sucesso!')).toBeInTheDocument(),
    );
    expect(screen.getByText('Comissão extra')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Adicionar despesa/i }));
    const expenseModal = screen.getByRole('dialog', { name: 'Adicionar Despesa' });
    fireEvent.change(screen.getByLabelText('Origem'), { target: { value: 'Profissional' } });
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'Softwares' } });
    fireEvent.change(screen.getByLabelText('Item'), { target: { value: 'Adobe Creative Cloud' } });
    fireEvent.change(within(expenseModal).getByPlaceholderText('0,00'), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText('Recorrência'), { target: { value: 'Única' } });
    const expenseDateInputs = expenseModal.querySelectorAll('input[type="date"]');
    expect(expenseDateInputs.length).toBeGreaterThan(0);
    fireEvent.change(expenseDateInputs[0] as HTMLInputElement, { target: { value: '2026-03-20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(screen.getByText('Despesa registrada com sucesso!')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getAllByLabelText('Confirmar pagamento')[0]);
    await waitFor(() => expect(screen.getByText('Pagamento confirmado!')).toBeInTheDocument());

    fireEvent.click(screen.getAllByLabelText('Confirmar recebimento')[0]);
    await waitFor(() => expect(screen.getByText('Recebimento confirmado!')).toBeInTheDocument());

    fireEvent.click(screen.getAllByLabelText('Excluir despesa')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(screen.getByText('Despesa excluída.')).toBeInTheDocument());

    fireEvent.click(screen.getAllByLabelText('Excluir crédito')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(screen.getByText('Crédito excluído.')).toBeInTheDocument());
  }, 20000);
});
