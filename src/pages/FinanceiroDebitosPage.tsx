import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { DeleteConfirmationModal } from '../components/ui';
import { useData } from '../context/DataContext';
import type {
  ProfessionalExpense,
  ProfessionalExpenseCategory,
  ProfessionalExpenseStatus,
} from '../types';
import { professionalExpenseCategories, professionalExpenseStatuses } from '../types';
import {
  formatCurrency,
  formatDate,
  parseDateString,
  formatDateDayMonth,
} from '../utils/formatters';
import { getFinancialPageData } from '../services/financeService';
import { NAV_LINKS } from '../constants';
import {
  ClockIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertIcon,
} from '../components/ui';

// --- SUB-COMPONENTS ---

const ExpenseFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: ProfessionalExpense) => void;
  initialExpense: ProfessionalExpense | null;
}> = ({ isOpen, onClose, onSave, initialExpense }) => {
  const getInitial = useCallback(
    () =>
      initialExpense || {
        id: '',
        description: '',
        category: 'Outros',
        value: 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        isRecurring: false,
        source: 'Manual',
      },
    [initialExpense],
  );
  const [expense, setExpense] = useState<ProfessionalExpense>(getInitial());
  useEffect(() => {
    if (isOpen) setExpense(getInitial());
  }, [isOpen, getInitial]);
  const handleChange = (field: keyof ProfessionalExpense, value: any) =>
    setExpense((prev) => ({ ...prev, [field]: value }));
  const handleSave = () => {
    if (!expense.description.trim() || expense.value <= 0) {
      alert('Descrição e um valor maior que zero são obrigatórios.');
      return;
    }
    onSave({ ...expense, id: expense.id || `exp_${Date.now()}` });
  };
  if (!isOpen) return null;
  const inputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary transition';
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialExpense ? 'Editar Despesa' : 'Adicionar Despesa'}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
          <input
            type="text"
            value={expense.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={inputClass}
            aria-label="Descrição"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Categoria</label>
            <select
              value={expense.category}
              onChange={(e) =>
                handleChange('category', e.target.value as ProfessionalExpenseCategory)
              }
              className={inputClass}
              aria-label="Categoria"
            >
              {professionalExpenseCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Valor (R$)</label>
            <input
              type="number"
              value={expense.value || ''}
              onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
              className={inputClass}
              aria-label="Valor"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Data de Vencimento
            </label>
            <input
              type="date"
              value={expense.dueDate.split('T')[0]}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className={inputClass}
              aria-label="Data de vencimento"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <select
              value={expense.status}
              onChange={(e) => handleChange('status', e.target.value as ProfessionalExpenseStatus)}
              className={inputClass}
              aria-label="Status"
            >
              {professionalExpenseStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        {expense.status === 'Pago' && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Data de Pagamento
            </label>
            <input
              type="date"
              value={expense.paymentDate?.split('T')[0] || ''}
              onChange={(e) => handleChange('paymentDate', e.target.value)}
              className={inputClass}
              aria-label="Data de pagamento"
            />
          </div>
        )}
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={expense.isRecurring}
              onChange={(e) => handleChange('isRecurring', e.target.checked)}
              className="rounded accent-primary"
            />
            Despesa Recorrente
          </label>
        </div>
        {expense.isRecurring && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Data de Fim da Recorrência (Opcional)
            </label>
            <input
              type="date"
              value={expense.recurringEndDate?.split('T')[0] || ''}
              onChange={(e) => handleChange('recurringEndDate', e.target.value || null)}
              className={inputClass}
              aria-label="Data final da recorrência"
            />
            <p className="text-xs text-text-secondary mt-1">
              Deixe em branco para recorrência indefinida.
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
        >
          Salvar
        </button>
      </div>
    </Modal>
  );
};

const MonthNavigator: React.FC<{ currentDate: Date; onDateChange: (newDate: Date) => void }> = ({
  currentDate,
  onDateChange,
}) => {
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(1);
    newDate.setMonth(newDate.getMonth() + offset);
    onDateChange(newDate);
  };
  return (
    <div className="flex justify-center items-center gap-4">
      <button
        onClick={() => changeMonth(-1)}
        className="p-2 rounded-full hover:bg-surface transition-colors"
        aria-label="Mês anterior"
      >
        &lt;
      </button>
      <h3 className="font-serif text-2xl font-bold text-secondary min-w-[12rem] text-center">
        {currentDate
          .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
          .replace(/^\w/, (c) => c.toUpperCase())}
      </h3>
      <button
        onClick={() => changeMonth(1)}
        className="p-2 rounded-full hover:bg-surface transition-colors"
        aria-label="Próximo mês"
      >
        &gt;
      </button>
    </div>
  );
};

const StatusPill: React.FC<{ status: 'Pago' | 'Vencido' | 'Em Aberto' | 'Pendente' }> = ({
  status,
}) => {
  const statusInfo = {
    Pago: { text: 'Pago', icon: <CheckCircleIcon />, color: 'bg-success/10 text-success' },
    Vencido: { text: 'Vencido', icon: <XCircleIcon />, color: 'bg-error/10 text-error' },
    'Em Aberto': { text: 'Em Aberto', icon: <ClockIcon />, color: 'bg-warning/10 text-warning' },
    Pendente: { text: 'Pendente', icon: <ClockIcon />, color: 'bg-warning/10 text-warning' },
  };
  const info = statusInfo[status] || statusInfo['Em Aberto'];
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full ${info.color}`}
    >
      {React.cloneElement(info.icon, { className: 'w-4 h-4' })}
      {info.text}
    </span>
  );
};

const FinancialListView: React.FC<{
  items: any[];
  type: 'debit';
  month: Date;
  onMonthChange: (d: Date) => void;
  onEditItem?: (item: any) => void;
  onDeleteItem?: (item: any) => void;
}> = ({ items, type, month, onMonthChange, onEditItem, onDeleteItem }) => {
  const groupedItems = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const date = formatDateDayMonth(item.dueDate);
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      },
      {} as Record<string, any[]>,
    );
  }, [items]);

  const sortedGroupKeys = Object.keys(groupedItems).sort(
    (a, b) => (parseDateString(a)?.getDate() ?? 0) - (parseDateString(b)?.getDate() ?? 0),
  );
  const totals = useMemo(
    () =>
      items.reduce(
        (acc, item) => ({
          value: acc.value + item.value,
          remuneration: acc.remuneration + (item.remuneration || 0),
        }),
        { value: 0, remuneration: 0 },
      ),
    [items],
  );

  return (
    <div className="bg-surface rounded-2xl shadow-soft p-6 flex flex-col h-full">
      <div className="flex justify-between items-center shrink-0">
        <MonthNavigator currentDate={month} onDateChange={onMonthChange} />
      </div>
      <div className="flex-1 overflow-y-auto -mx-6 mt-4 no-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 bg-surface z-10">
            <tr className="border-b border-border-color">
              <th className="px-6 py-3 font-semibold text-text-secondary">Descrição</th>
              <th className="px-6 py-3 font-semibold text-text-secondary">Categoria</th>
              <th className="px-6 py-3 font-semibold text-text-secondary text-right">Valor</th>
              <th className="px-6 py-3 font-semibold text-text-secondary text-center">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              sortedGroupKeys.map((dateKey) => (
                <React.Fragment key={dateKey}>
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-2 font-bold text-text-primary bg-background/50"
                    >
                      {dateKey}
                    </td>
                  </tr>
                  {groupedItems[dateKey].map((item: any) => (
                    <tr
                      key={item.id}
                      className="group border-b border-border-color/50 last:border-b-0 hover:bg-background"
                    >
                      <td className="px-6 py-4 font-semibold text-text-primary">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{item.category}</td>
                      <td className={`px-6 py-4 font-bold text-right text-error`}>
                        {formatCurrency(item.value)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusPill status={item.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditItem?.(item)}
                            className="p-2 text-text-secondary hover:text-primary"
                            aria-label="Editar despesa"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          {item.source === 'Manual' && (
                            <button
                              onClick={() => onDeleteItem?.(item)}
                              className="p-2 text-text-secondary hover:text-error"
                              aria-label="Excluir despesa"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <p className="text-center text-text-secondary py-16">
                    Nenhum lançamento para este mês.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-auto pt-4 border-t border-border-color grid grid-cols-2 text-right font-bold shrink-0">
        <span className="text-text-secondary">Total do Mês:</span>
        <div>
          <p className={`text-2xl text-error`}>{formatCurrency(totals.value)}</p>
        </div>
      </div>
    </div>
  );
};

const FinanceiroDebitosPage: React.FC = () => {
  const {
    projects,
    commissions,
    manualExpenses,
    setManualExpenses,
    manualIncomes,
    marketingActivities,
    freelancers,
  } = useData();
  const [viewDate, setViewDate] = useState(new Date());
  const [expenseToDelete, setExpenseToDelete] = useState<ProfessionalExpense | null>(null);

  const financialData = useMemo(
    () =>
      getFinancialPageData(
        projects,
        commissions,
        manualExpenses,
        manualIncomes,
        marketingActivities,
        freelancers,
        viewDate,
      ),
    [
      projects,
      commissions,
      manualExpenses,
      manualIncomes,
      marketingActivities,
      freelancers,
      viewDate,
    ],
  );

  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<ProfessionalExpense | null>(null);

  const handleSaveExpense = useCallback(
    (expense: ProfessionalExpense) => {
      setManualExpenses((prev) => {
        const isExisting = prev.some((e) => e.id === expense.id);
        if (isExisting) {
          return prev.map((e) => (e.id === expense.id ? expense : e));
        }
        return [expense, ...prev];
      });
      setExpenseModalOpen(false);
    },
    [setManualExpenses],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (expenseToDelete) {
      setManualExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete.id));
    }
    setExpenseToDelete(null);
  }, [expenseToDelete, setManualExpenses]);

  const financeiroIcon = NAV_LINKS.find((link) => link.label === 'Financeiro')?.icon;

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
        <div className="h-full flex flex-col">
          <PageHeader title="Débitos" icon={financeiroIcon}>
            <button
              onClick={() => {
                setExpenseToEdit(null);
                setExpenseModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-primary-content bg-primary hover:bg-primary-focus flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" /> Adicionar Despesa
            </button>
          </PageHeader>
          <div className="flex-1 min-h-0">
            <FinancialListView
              items={financialData.monthlyDebits}
              type="debit"
              month={viewDate}
              onMonthChange={setViewDate}
              onEditItem={(exp) => {
                setExpenseToEdit(exp);
                setExpenseModalOpen(true);
              }}
              onDeleteItem={(exp) => setExpenseToDelete(exp)}
            />
          </div>
        </div>
      </div>

      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        initialExpense={expenseToEdit}
      />
      <DeleteConfirmationModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteConfirm}
        itemName={expenseToDelete?.description || ''}
        itemType="Despesa"
      />
    </div>
  );
};

export default FinanceiroDebitosPage;
