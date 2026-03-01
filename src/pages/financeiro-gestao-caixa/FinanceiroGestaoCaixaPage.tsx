import React, { useCallback, useMemo } from 'react';
import { useState } from 'react';
import { PageHeader } from '../../components/layout';
import { DeleteConfirmationModal } from '../../components/ui';
import { PlusIcon } from '../../components/ui/icons';
import { CashBoxCreditFormModal, CashBoxExpenseFormModal } from '../../components/finance';
import { useFinanceData } from '../../context/DataContext';
import { NAV_LINKS } from '../../constants';
import { useAutoReset } from '../../hooks/useAutoReset';
import type { CashBoxCredit, CashBoxExpense } from '../../types';

import {
  generateExpenses,
  buildMonthEntries,
  confirmExpense as confirmExpensePure,
  confirmCredit as confirmCreditPure,
  type CreateExpenseInput,
} from '../../services/cashBoxService';
import { CashBoxEntriesTable } from './CashBoxEntriesTable';
import { CashBoxToast } from './CashBoxToast';
import { CashBoxTotals } from './CashBoxTotals';
import { MonthNavigator } from './MonthNavigator';

const FinanceiroGestaoCaixaPage: () => React.ReactNode = () => {
  const { cashBoxExpenses, setCashBoxExpenses, cashBoxCredits, setCashBoxCredits } =
    useFinanceData();

  const [viewDate, setViewDate] = useState(new Date());
  const [isExpenseFormOpen, setExpenseFormOpen] = useState(false);
  const [isCreditFormOpen, setCreditFormOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<CashBoxExpense | null>(null);
  const [creditToDelete, setCreditToDelete] = useState<CashBoxCredit | null>(null);
  const [toast, setToast] = useAutoReset<string | null>(null, 3000);
  const [sortAsc, setSortAsc] = useState(false);

  const financeiroIcon = NAV_LINKS.find((link) => link.label === 'Financeiro')?.icon;

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const { entries, totalExpenses, totalCredits, netBalance } = useMemo(
    () =>
      buildMonthEntries(
        cashBoxExpenses,
        cashBoxCredits,
        viewDate.getFullYear(),
        viewDate.getMonth(),
        sortAsc,
      ),
    [cashBoxExpenses, cashBoxCredits, sortAsc, viewDate],
  );

  const handleSaveExpense = useCallback(
    (input: CreateExpenseInput) => {
      const newExpenses = generateExpenses(input);
      setCashBoxExpenses((previous) => [...newExpenses, ...previous]);
      setExpenseFormOpen(false);
      setToast('Despesa registrada com sucesso!');
    },
    [setCashBoxExpenses, setToast],
  );

  const handleSaveCredit = useCallback(
    (credit: CashBoxCredit) => {
      setCashBoxCredits((previous) => [credit, ...previous]);
      setCreditFormOpen(false);
      setToast('Crédito registrado com sucesso!');
    },
    [setCashBoxCredits, setToast],
  );

  const handleDeleteExpenseConfirm = useCallback(() => {
    if (expenseToDelete) {
      setCashBoxExpenses((previous) =>
        previous.filter((expense) => expense.id !== expenseToDelete.id),
      );
      setToast('Despesa excluída.');
    }
    setExpenseToDelete(null);
  }, [expenseToDelete, setCashBoxExpenses, setToast]);

  const handleDeleteCreditConfirm = useCallback(() => {
    if (creditToDelete) {
      setCashBoxCredits((previous) => previous.filter((credit) => credit.id !== creditToDelete.id));
      setToast('Crédito excluído.');
    }
    setCreditToDelete(null);
  }, [creditToDelete, setCashBoxCredits, setToast]);

  const handleConfirmExpense = useCallback(
    (id: string) => {
      const today = new Date();
      const paymentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      setCashBoxExpenses((previous) => confirmExpensePure(previous, id, paymentDate));
      setToast('Pagamento confirmado!');
    },
    [setCashBoxExpenses, setToast],
  );

  const handleConfirmCredit = useCallback(
    (id: string) => {
      setCashBoxCredits((previous) => confirmCreditPure(previous, id));
      setToast('Recebimento confirmado!');
    },
    [setCashBoxCredits, setToast],
  );

  const formatDay = (dateStr: string) => {
    const date = new Date(`${dateStr}T12:00:00`);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6 min-h-0">
        <div className="h-full flex flex-col">
          <PageHeader title="Gestão de Caixa" icon={financeiroIcon}>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCreditFormOpen(true)}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-white bg-success hover:bg-success/80 flex items-center gap-2 transition-colors"
                id="btn-add-credit"
              >
                <PlusIcon className="w-5 h-5" /> Adicionar crédito
              </button>
              <button
                type="button"
                onClick={() => setExpenseFormOpen(true)}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-primary-content bg-primary hover:bg-primary-focus flex items-center gap-2 transition-colors"
                id="btn-add-expense"
              >
                <PlusIcon className="w-5 h-5" /> Adicionar despesa
              </button>
            </div>
          </PageHeader>

          <div className="flex-1 min-h-0">
            <div className="bg-surface rounded-2xl shadow-soft p-6 flex flex-col h-full">
              <div className="shrink-0">
                <MonthNavigator currentDate={viewDate} onDateChange={setViewDate} />
              </div>

              <CashBoxEntriesTable
                entries={entries}
                sortAsc={sortAsc}
                todayStr={todayStr}
                onToggleSort={() => setSortAsc((previous) => !previous)}
                onConfirmEntry={(entry) => {
                  if (entry.type === 'credit') {
                    handleConfirmCredit(entry.id);
                    return;
                  }
                  handleConfirmExpense(entry.id);
                }}
                onDeleteEntry={(entry) => {
                  if (entry.type === 'credit') {
                    setCreditToDelete(entry.raw as CashBoxCredit);
                    return;
                  }
                  setExpenseToDelete(entry.raw as CashBoxExpense);
                }}
                formatDay={formatDay}
              />

              <CashBoxTotals
                totalCredits={totalCredits}
                totalExpenses={totalExpenses}
                netBalance={netBalance}
              />
            </div>
          </div>
        </div>
      </div>

      <CashBoxExpenseFormModal
        isOpen={isExpenseFormOpen}
        onClose={() => setExpenseFormOpen(false)}
        onSave={handleSaveExpense}
      />

      <CashBoxCreditFormModal
        isOpen={isCreditFormOpen}
        onClose={() => setCreditFormOpen(false)}
        onSave={handleSaveCredit}
      />

      <DeleteConfirmationModal
        isOpen={Boolean(expenseToDelete)}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteExpenseConfirm}
        itemName={
          expenseToDelete
            ? `${expenseToDelete.category} - ${formatDay(expenseToDelete.dueDate)}`
            : ''
        }
        itemType="Despesa"
      />

      <DeleteConfirmationModal
        isOpen={Boolean(creditToDelete)}
        onClose={() => setCreditToDelete(null)}
        onConfirm={handleDeleteCreditConfirm}
        itemName={
          creditToDelete ? `${creditToDelete.description} - ${formatDay(creditToDelete.date)}` : ''
        }
        itemType="Crédito"
      />

      <CashBoxToast message={toast} />
    </div>
  );
};

export default FinanceiroGestaoCaixaPage;
