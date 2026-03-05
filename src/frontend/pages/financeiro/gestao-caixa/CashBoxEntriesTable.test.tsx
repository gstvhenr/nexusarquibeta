import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CashBoxEntriesTable } from './CashBoxEntriesTable';
import type { UnifiedEntry } from './types';

const debitEntry: UnifiedEntry = {
  id: 'debit-1',
  type: 'debit',
  date: '2026-03-01',
  origin: 'Profissional',
  description: 'Assinatura de software',
  value: 300,
  confirmed: false,
  recurrence: 'Parcelada',
  installmentNumber: 1,
  installmentTotal: 3,
  paymentDate: null,
  raw: {
    id: 'debit-1',
    origin: 'Profissional',
    category: 'Softwares',
    item: 'Adobe Creative Cloud',
    recurrence: 'Parcelada',
    dueDate: '2026-03-01',
    paymentDate: null,
    value: 300,
    installmentNumber: 1,
    installmentTotal: 3,
    recurringGroupId: 'grp-1',
    createdAt: '2026-03-01T00:00:00Z',
  },
};

const creditEntry: UnifiedEntry = {
  id: 'credit-1',
  type: 'credit',
  date: '2026-03-10',
  origin: 'Pessoal',
  description: 'Reembolso',
  value: 450,
  confirmed: true,
  raw: {
    id: 'credit-1',
    origin: 'Pessoal',
    category: 'Outros Pessoal',
    item: 'Outros',
    description: 'Reembolso',
    date: '2026-03-10',
    value: 450,
    confirmed: true,
    createdAt: '2026-03-10T00:00:00Z',
  },
};

const overdueCreditEntry: UnifiedEntry = {
  id: 'credit-2',
  type: 'credit',
  date: '2026-03-01',
  origin: 'Profissional',
  description: 'Comissão atrasada',
  value: 200,
  confirmed: false,
  raw: {
    id: 'credit-2',
    origin: 'Profissional',
    category: 'Comissões',
    item: 'Pagamento de Projeto',
    description: 'Comissão atrasada',
    date: '2026-03-01',
    value: 200,
    confirmed: false,
    createdAt: '2026-03-01T00:00:00Z',
  },
};

const confirmedDebitEntry: UnifiedEntry = {
  id: 'debit-2',
  type: 'debit',
  date: '2026-03-03',
  origin: 'Pessoal',
  description: 'Conta de internet',
  value: 180,
  confirmed: true,
  recurrence: undefined,
  raw: {
    id: 'debit-2',
    origin: 'Pessoal',
    category: 'Habitação',
    item: 'Internet',
    recurrence: 'Única',
    dueDate: '2026-03-03',
    paymentDate: '2026-03-03',
    value: 180,
    installmentNumber: null,
    installmentTotal: null,
    recurringGroupId: null,
    createdAt: '2026-03-03T00:00:00Z',
  },
};

afterEach(() => {
  cleanup();
});

describe('CashBoxEntriesTable', () => {
  it('handles sorting and row actions for debit entries', () => {
    const onToggleSort = vi.fn();
    const onConfirmEntry = vi.fn();
    const onDeleteEntry = vi.fn();

    render(
      <CashBoxEntriesTable
        entries={[debitEntry, creditEntry]}
        sortAsc={false}
        todayStr="2026-03-05"
        onToggleSort={onToggleSort}
        onConfirmEntry={onConfirmEntry}
        onDeleteEntry={onDeleteEntry}
        formatDay={(date) => date.slice(8, 10) + '/03'}
      />,
    );

    fireEvent.click(screen.getByText('Data'));
    fireEvent.click(screen.getByLabelText('Confirmar pagamento'));
    fireEvent.click(screen.getByLabelText('Excluir despesa'));

    expect(screen.getByText('Débito Previsto')).toBeInTheDocument();
    expect(screen.getByText('Crédito')).toBeInTheDocument();
    expect(onToggleSort).toHaveBeenCalledTimes(1);
    expect(onConfirmEntry).toHaveBeenCalledWith(debitEntry);
    expect(onDeleteEntry).toHaveBeenCalledWith(debitEntry);
  });

  it('renders all badge/recurrence states and credit actions', () => {
    const onConfirmEntry = vi.fn();
    const onDeleteEntry = vi.fn();

    render(
      <CashBoxEntriesTable
        entries={[confirmedDebitEntry, overdueCreditEntry, creditEntry]}
        sortAsc={true}
        todayStr="2026-03-05"
        onToggleSort={vi.fn()}
        onConfirmEntry={onConfirmEntry}
        onDeleteEntry={onDeleteEntry}
        formatDay={(date) => date.slice(8, 10) + '/03'}
      />,
    );

    expect(screen.getByText('▲')).toBeInTheDocument();
    expect(screen.getByText('Débito')).toHaveClass('text-error');
    expect(screen.getByText('Crédito Previsto')).toHaveClass('bg-black');
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);

    expect(screen.queryByLabelText('Confirmar pagamento')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Confirmar recebimento'));
    fireEvent.click(screen.getAllByLabelText('Excluir crédito')[0]);

    expect(onConfirmEntry).toHaveBeenCalledWith(overdueCreditEntry);
    expect(onDeleteEntry).toHaveBeenCalledWith(overdueCreditEntry);
  });

  it('renders empty-state message', () => {
    render(
      <CashBoxEntriesTable
        entries={[]}
        sortAsc={false}
        todayStr="2026-03-05"
        onToggleSort={vi.fn()}
        onConfirmEntry={vi.fn()}
        onDeleteEntry={vi.fn()}
        formatDay={(date) => date}
      />,
    );

    expect(screen.getByText('Nenhum lançamento neste mês.')).toBeInTheDocument();
  });
});
