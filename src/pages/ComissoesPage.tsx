import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { DeleteConfirmationModal } from '../components/ui';
import type { Commission, CommissionStatus, Supplier, Client } from '../types';
import { commissionStatuses } from '../types';
import { NAV_LINKS } from '../constants';
import { PlusIcon, TrashIcon, EditIcon, ArchiveIcon, UnarchiveIcon } from '../components/ui';
import { formatCurrency, formatDate, parseDateString } from '../utils/formatters';
import { useData } from '../context/DataContext';

const CommissionFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (commission: Commission) => void;
  initialCommission: Commission | null;
}> = ({ isOpen, onClose, onSave, initialCommission }) => {
  const { suppliers, clients } = useData();

  const getInitial = useCallback(
    () =>
      initialCommission || {
        id: '',
        saleDate: new Date().toISOString().split('T')[0],
        supplierId: '',
        supplierName: '',
        clientId: '',
        clientName: '',
        saleValue: 0,
        commissionPercentage: 0,
        commissionValue: 0,
        status: 'Pendente',
        notes: '',
        expectedPaymentDate: null,
      },
    [initialCommission],
  );

  const [commission, setCommission] = useState(getInitial());

  useEffect(() => {
    if (isOpen) setCommission(getInitial());
  }, [isOpen, getInitial]);

  useEffect(() => {
    const commissionValue = (commission.saleValue * commission.commissionPercentage) / 100;
    setCommission((c) => ({ ...c, commissionValue }));
  }, [commission.saleValue, commission.commissionPercentage]);

  const handleChange = (field: keyof Commission, value: any) => {
    let updatedCommission = { ...commission, [field]: value };
    if (field === 'supplierId') {
      const supplier = suppliers.find((s) => s.id === value);
      updatedCommission.supplierName = supplier?.name || '';
      updatedCommission.commissionPercentage = supplier?.commissionPercentage || 0;
    }
    if (field === 'clientId') {
      updatedCommission.clientName = clients.find((c) => c.id === value)?.name || '';
    }
    setCommission(updatedCommission);
  };

  const handleSave = () => {
    if (!commission.supplierId || !commission.clientId || commission.saleValue <= 0) {
      alert('Fornecedor, cliente e valor da venda são obrigatórios.');
      return;
    }
    onSave({ ...commission, id: commission.id || `comm_${Date.now()}` });
  };

  if (!isOpen) return null;
  const inputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialCommission ? 'Editar Comissão' : 'Adicionar Comissão'}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Fornecedor</label>
            <select
              value={commission.supplierId}
              onChange={(e) => handleChange('supplierId', e.target.value)}
              className={inputClass}
              aria-label="Fornecedor"
            >
              <option value="">Selecione o Fornecedor</option>
              {suppliers
                .filter((s) => !s.archived)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Cliente</label>
            <select
              value={commission.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
              className={inputClass}
              aria-label="Cliente"
            >
              <option value="">Selecione o Cliente</option>
              {clients
                .filter((c) => !c.archived)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Data da Venda
            </label>
            <input
              type="date"
              value={commission.saleDate.split('T')[0]}
              onChange={(e) => handleChange('saleDate', e.target.value)}
              className={inputClass}
              aria-label="Data da Venda"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Data Prevista de Pagamento
            </label>
            <input
              type="date"
              value={commission.expectedPaymentDate?.split('T')[0] || ''}
              onChange={(e) => handleChange('expectedPaymentDate', e.target.value || null)}
              className={inputClass}
              aria-label="Data Prevista de Pagamento"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Valor da Venda
            </label>
            <input
              type="number"
              placeholder="R$ 0,00"
              value={commission.saleValue || ''}
              onChange={(e) => handleChange('saleValue', parseFloat(e.target.value) || 0)}
              className={inputClass}
              aria-label="Valor da Venda"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">% Comissão</label>
            <input
              type="number"
              placeholder="%"
              value={commission.commissionPercentage || ''}
              onChange={(e) =>
                handleChange('commissionPercentage', parseFloat(e.target.value) || 0)
              }
              className={inputClass}
              aria-label="Percentual de Comissão"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Valor Comissão
            </label>
            <input
              type="number"
              placeholder="R$ 0,00"
              value={commission.commissionValue.toFixed(2)}
              readOnly
              className={`${inputClass} bg-surface cursor-not-allowed`}
              aria-label="Valor da Comissão"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Notas (Opcional)
          </label>
          <textarea
            value={commission.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={2}
            className={inputClass}
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

const ConfirmPaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  commission: Commission | null;
}> = ({ isOpen, onClose, onConfirm, commission }) => {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  useEffect(() => {
    if (isOpen) setPaymentDate(new Date().toISOString().split('T')[0]);
  }, [isOpen]);
  if (!isOpen || !commission) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Recebimento">
      <div className="space-y-4">
        <p>
          Confirmar o recebimento de{' '}
          <strong className="text-secondary">{formatCurrency(commission.commissionValue)}</strong>{' '}
          do fornecedor <strong className="text-secondary">{commission.supplierName}</strong>?
        </p>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Data de Recebimento
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full bg-background p-2 rounded-md border border-border-color focus:border-accent"
            aria-label="Data de Recebimento"
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
          onClick={() => onConfirm(paymentDate)}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
};

const ComissoesPage: React.FC = () => {
  const { commissions, setCommissions, suppliers, clients } = useData();

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const [commissionToUpdate, setCommissionToUpdate] = useState<Commission | null>(null);
  const [filter, setFilter] = useState({
    status: 'Todos' as 'Todos' | CommissionStatus,
    supplierId: 'Todos',
  });

  const filteredCommissions = useMemo(() => {
    return commissions
      .filter((c) => {
        if ((c.archived || false) !== showArchived) return false;
        if (filter.status !== 'Todos' && c.status !== filter.status) return false;
        if (filter.supplierId !== 'Todos' && c.supplierId !== filter.supplierId) return false;
        return true;
      })
      .sort(
        (a, b) =>
          (parseDateString(b.saleDate)?.getTime() || 0) -
          (parseDateString(a.saleDate)?.getTime() || 0),
      );
  }, [commissions, filter, showArchived]);

  const summary = useMemo(() => {
    const activeCommissions = commissions.filter((c) => !c.archived);
    const pendingValue = activeCommissions
      .filter((c) => c.status === 'Pendente')
      .reduce((sum, c) => sum + c.commissionValue, 0);
    const receivedLast30Days = activeCommissions
      .filter((c) => {
        if (c.status !== 'Recebido' || !c.paymentDate) return false;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return (parseDateString(c.paymentDate) || new Date(0)) >= thirtyDaysAgo;
      })
      .reduce((sum, c) => sum + c.commissionValue, 0);
    return { pendingValue, receivedLast30Days };
  }, [commissions]);

  const handleSave = (commission: Commission) => {
    setCommissions((prev) => {
      const exists = prev.some((c) => c.id === commission.id);
      if (exists) return prev.map((c) => (c.id === commission.id ? commission : c));
      return [commission, ...prev];
    });
    setFormModalOpen(false);
  };

  const handleDeleteRequest = (commission: Commission) => {
    setCommissionToUpdate(commission);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (commissionToUpdate) {
      setCommissions((prev) => prev.filter((c) => c.id !== commissionToUpdate.id));
    }
    setDeleteModalOpen(false);
    setCommissionToUpdate(null);
  };

  const handleArchive = (id: string, archiveStatus: boolean) => {
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: archiveStatus } : c)),
    );
  };

  const handleConfirmPayment = (paymentDate: string) => {
    if (!commissionToUpdate) return;
    setCommissions((prev) =>
      prev.map((c) =>
        c.id === commissionToUpdate.id ? { ...c, status: 'Recebido', paymentDate } : c,
      ),
    );
    setConfirmModalOpen(false);
  };

  const openFormModal = (commission: Commission | null) => {
    setCommissionToUpdate(commission);
    setFormModalOpen(true);
  };

  const openConfirmModal = (commission: Commission) => {
    setCommissionToUpdate(commission);
    setConfirmModalOpen(true);
  };

  const suprimentosLink = NAV_LINKS.find((link) => link.label === 'Suprimentos');
  const pageIcon = suprimentosLink?.children?.find((child) => child.path === '/comissoes')?.icon;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Comissões" icon={pageIcon}>
        <button
          type="button"
          onClick={() => setShowArchived(!showArchived)}
          className="px-4 py-2 rounded-lg font-semibold text-text-primary bg-background border border-border-color hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
        >
          {showArchived ? (
            <UnarchiveIcon className="w-4 h-4" />
          ) : (
            <ArchiveIcon className="w-4 h-4" />
          )}
          {showArchived ? 'Ver Ativas' : 'Ver Arquivadas'}
        </button>
        <button
          type="button"
          onClick={() => openFormModal(null)}
          className="px-5 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center gap-2 transition-colors text-sm"
        >
          <PlusIcon className="w-5 h-5" /> Adicionar Comissão
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface rounded-xl shadow-soft p-5">
          <p className="text-sm font-semibold text-text-secondary">Total a Receber</p>
          <p className="text-3xl font-bold text-amber-600">
            {formatCurrency(summary.pendingValue)}
          </p>
        </div>
        <div className="bg-surface rounded-xl shadow-soft p-5">
          <p className="text-sm font-semibold text-text-secondary">Recebido (Últimos 30 dias)</p>
          <p className="text-3xl font-bold text-emerald-600">
            {formatCurrency(summary.receivedLast30Days)}
          </p>
        </div>
      </div>

      <div className="my-6 p-4 bg-surface rounded-xl shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-grow">
          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as any }))}
            className="bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm"
            aria-label="Filtrar por status"
          >
            <option value="Todos">Todos os Status</option>
            {commissionStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filter.supplierId}
            onChange={(e) => setFilter((f) => ({ ...f, supplierId: e.target.value }))}
            className="bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm"
            aria-label="Filtrar por fornecedor"
          >
            <option value="Todos">Todos os Fornecedores</option>
            {suppliers
              .filter((s) => !s.archived)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-soft overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-background/50 text-xs text-text-secondary uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3">
                Fornecedor
              </th>
              <th scope="col" className="px-6 py-3">
                Cliente
              </th>
              <th scope="col" className="px-6 py-3">
                Data Venda
              </th>
              <th scope="col" className="px-6 py-3">
                Data Prevista
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Valor Comissão
              </th>
              <th scope="col" className="px-6 py-3">
                Notas
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {filteredCommissions.map((c) => (
              <tr key={c.id} className="hover:bg-background/80">
                <td className="px-6 py-4 font-semibold text-text-primary">{c.supplierName}</td>
                <td className="px-6 py-4 text-text-secondary">{c.clientName}</td>
                <td className="px-6 py-4 text-text-primary">{formatDate(c.saleDate)}</td>
                <td className="px-6 py-4 text-text-primary">{formatDate(c.expectedPaymentDate)}</td>
                <td className="px-6 py-4 font-bold text-secondary text-right">
                  {formatCurrency(c.commissionValue)}
                </td>
                <td
                  className="px-6 py-4 text-text-secondary max-w-xs truncate"
                  title={c.notes || ''}
                >
                  {c.notes || '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full ${c.status === 'Recebido' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {c.status === 'Pendente' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openConfirmModal(c)}
                          className="font-semibold text-primary hover:underline text-xs"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => openFormModal(c)}
                          className="p-1 text-gray-400 hover:text-primary"
                          aria-label="Editar comissão"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(c)}
                          className="p-1 text-gray-400 hover:text-error"
                          aria-label="Excluir comissão"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      // Status is 'Recebido'
                      <button
                        type="button"
                        onClick={() => handleArchive(c.id, !c.archived)}
                        className="p-1 text-gray-400 hover:text-secondary"
                        title={c.archived ? 'Desarquivar' : 'Arquivar'}
                        aria-label={c.archived ? 'Desarquivar comissão' : 'Arquivar comissão'}
                      >
                        {c.archived ? (
                          <UnarchiveIcon className="w-4 h-4" />
                        ) : (
                          <ArchiveIcon className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCommissions.length === 0 && (
          <p className="text-center text-text-secondary py-10">Nenhuma comissão encontrada.</p>
        )}
      </div>

      <CommissionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSave}
        initialCommission={commissionToUpdate}
      />
      <ConfirmPaymentModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmPayment}
        commission={commissionToUpdate}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={`${commissionToUpdate?.supplierName} - ${formatCurrency(commissionToUpdate?.commissionValue)}`}
        itemType="Comissão"
      />
    </div>
  );
};

export default ComissoesPage;
