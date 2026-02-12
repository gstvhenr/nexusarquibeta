import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { DeleteConfirmationModal } from '../components/ui';
import { useData } from '../context/DataContext';
import {
  formatCurrency,
  formatDate,
  parseDateString,
  formatDateDayMonth,
} from '../utils/formatters';
import { getFinancialPageData } from '../services/financeService';
import { NAV_LINKS, PAYMENT_METHODS } from '../constants';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
} from '../components/ui';
import { ManualIncome, PaymentMethod } from '../types';

const IncomeFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (income: ManualIncome) => void;
  initialIncome: ManualIncome | null;
}> = ({ isOpen, onClose, onSave, initialIncome }) => {
  const [income, setIncome] = useState<ManualIncome>(
    initialIncome || {
      id: '',
      description: '',
      category: 'Outros',
      value: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'Pendente',
      notes: '',
    },
  );

  useEffect(() => {
    if (isOpen)
      setIncome(
        initialIncome || {
          id: '',
          description: '',
          category: 'Outros',
          value: 0,
          date: new Date().toISOString().split('T')[0],
          status: 'Pendente',
          notes: '',
        },
      );
  }, [isOpen, initialIncome]);

  const handleChange = (field: keyof ManualIncome, value: any) =>
    setIncome((prev) => ({ ...prev, [field]: value }));
  const handleSave = () => {
    if (!income.description.trim() || income.value <= 0) {
      alert('Descrição e valor são obrigatórios.');
      return;
    }
    onSave({ ...income, id: income.id || `inc_${Date.now()}` });
  };

  if (!isOpen) return null;
  const inputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary transition';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialIncome ? 'Editar Receita' : 'Adicionar Receita Avulsa'}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
          <input
            type="text"
            value={income.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={inputClass}
            placeholder="Ex: Consultoria rápida, Reembolso..."
            aria-label="Descrição"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Categoria</label>
            <select
              value={income.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={inputClass}
              aria-label="Categoria"
            >
              <option value="Consultoria">Consultoria</option>
              <option value="Reembolso">Reembolso</option>
              <option value="Rendimento">Rendimento</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Valor (R$)</label>
            <input
              type="number"
              value={income.value || ''}
              onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
              className={inputClass}
              aria-label="Valor"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Data</label>
            <input
              type="date"
              value={income.date.split('T')[0]}
              onChange={(e) => handleChange('date', e.target.value)}
              className={inputClass}
              aria-label="Data"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <select
              value={income.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className={inputClass}
              aria-label="Status"
            >
              <option value="Pendente">Pendente</option>
              <option value="Recebido">Recebido</option>
            </select>
          </div>
        </div>
        {income.status === 'Recebido' && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Método de Pagamento
            </label>
            <select
              value={income.paymentMethod || ''}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              className={inputClass}
              aria-label="Método de pagamento"
            >
              <option value="">Selecione...</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Notas</label>
          <textarea
            value={income.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            className={inputClass}
            rows={2}
            aria-label="Notas"
          />
        </div>
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
    Pago: { text: 'Recebido', icon: <CheckCircleIcon />, color: 'bg-success/10 text-success' },
    Vencido: { text: 'Vencido', icon: <XCircleIcon />, color: 'bg-error/10 text-error' },
    'Em Aberto': { text: 'A Receber', icon: <ClockIcon />, color: 'bg-warning/10 text-warning' },
    Pendente: { text: 'A Receber', icon: <ClockIcon />, color: 'bg-warning/10 text-warning' },
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
  type: 'receivable';
  month: Date;
  onMonthChange: (d: Date) => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (item: any) => void;
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
              <th className="px-6 py-3 font-semibold text-text-secondary">Origem/Cliente</th>
              <th className="px-6 py-3 font-semibold text-text-secondary text-right">Valor</th>
              <th className="px-6 py-3 font-semibold text-text-secondary text-right">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              sortedGroupKeys.map((dateKey) => (
                <React.Fragment key={dateKey}>
                  <tr>
                    <td
                      colSpan={5}
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
                        {item.source === 'Manual' && (
                          <span className="ml-2 text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded">
                            Manual
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{item.clientName}</td>
                      <td className={`px-6 py-4 font-bold text-right text-success`}>
                        {formatCurrency(item.value)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <StatusPill status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.source === 'Manual' && (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditItem(item)}
                              className="p-2 text-text-secondary hover:text-primary"
                              aria-label="Editar receita"
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteItem(item)}
                              className="p-2 text-text-secondary hover:text-error"
                              aria-label="Excluir receita"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
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
          <p className={`text-2xl text-success`}>{formatCurrency(totals.value)}</p>
          <p className="text-sm text-success/80">
            Lucro Estimado: {formatCurrency(totals.remuneration)}
          </p>
        </div>
      </div>
    </div>
  );
};

const FinanceiroRecebiveisPage: React.FC = () => {
  const {
    projects,
    commissions,
    manualExpenses,
    marketingActivities,
    freelancers,
    manualIncomes,
    setManualIncomes,
  } = useData();
  const [viewDate, setViewDate] = useState(new Date());
  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<ManualIncome | null>(null);
  const [incomeToDelete, setIncomeToDelete] = useState<ManualIncome | null>(null);

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

  const financeiroIcon = NAV_LINKS.find((link) => link.label === 'Financeiro')?.icon;

  const handleSaveIncome = (income: ManualIncome) => {
    setManualIncomes((prev) => {
      const exists = prev.some((i) => i.id === income.id);
      if (exists) return prev.map((i) => (i.id === income.id ? income : i));
      return [income, ...prev];
    });
    setIncomeModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (incomeToDelete) {
      setManualIncomes((prev) => prev.filter((i) => i.id !== incomeToDelete.id));
    }
    setIncomeToDelete(null);
  };

  const handleEditItem = (item: any) => {
    // We need to reconstruct the ManualIncome object from the mixed item format
    const income: ManualIncome = {
      id: item.id,
      description: item.description,
      category: item.category || 'Outros', // Use item category if available
      value: item.value,
      date: item.dueDate,
      status: item.status === 'Pago' ? 'Recebido' : 'Pendente',
      notes: item.notes,
    };
    // Find the actual source object if possible for better data fidelity
    const original = manualIncomes.find((i) => i.id === item.id);
    setIncomeToEdit(original || income);
    setIncomeModalOpen(true);
  };

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
        <div className="h-full flex flex-col">
          <PageHeader title="Recebíveis" icon={financeiroIcon}>
            <button
              onClick={() => {
                setIncomeToEdit(null);
                setIncomeModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-primary-content bg-primary hover:bg-primary-focus flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" /> Adicionar Receita
            </button>
          </PageHeader>
          <div className="flex-1 min-h-0">
            <FinancialListView
              items={financialData.monthlyReceivables}
              type="receivable"
              month={viewDate}
              onMonthChange={setViewDate}
              onEditItem={handleEditItem}
              onDeleteItem={(item) => setIncomeToDelete(item)}
            />
          </div>
        </div>
      </div>

      <IncomeFormModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        onSave={handleSaveIncome}
        initialIncome={incomeToEdit}
      />
      <DeleteConfirmationModal
        isOpen={!!incomeToDelete}
        onClose={() => setIncomeToDelete(null)}
        onConfirm={handleDeleteConfirm}
        itemName={incomeToDelete?.description || ''}
        itemType="Receita"
      />
    </div>
  );
};

export default FinanceiroRecebiveisPage;
