import React, { useMemo, useState } from 'react';
import { PageHeader } from '../../components/layout';
import { DeleteConfirmationModal } from '../../components/ui';
import { ArchiveIcon, PlusIcon, UnarchiveIcon } from '../../components/ui';
import { NAV_LINKS } from '../../constants';
import { useFinanceData, useSupplyChainData } from '../../context/DataContext';
import { CommissionFormModal } from './CommissionFormModal';
import { CommissionsFilterBar } from './CommissionsFilterBar';
import { CommissionsSummaryCards } from './CommissionsSummaryCards';
import { CommissionsTable } from './CommissionsTable';
import { ConfirmPaymentModal } from './ConfirmPaymentModal';
import type { CommissionFilters } from './types';
import type { Commission } from '../../types';
import { formatCurrency, parseDateString } from '../../utils/formatters';

const ComissoesPage: () => React.ReactNode = () => {
  const { commissions, setCommissions } = useFinanceData();
  const { suppliers } = useSupplyChainData();

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [commissionToUpdate, setCommissionToUpdate] = useState<Commission | null>(null);
  const [filters, setFilters] = useState<CommissionFilters>({
    status: 'Todos',
    supplierId: 'Todos',
  });

  const filteredCommissions = useMemo(() => {
    return commissions
      .filter((commission) => {
        if ((commission.archived || false) !== showArchived) {
          return false;
        }
        if (filters.status !== 'Todos' && commission.status !== filters.status) {
          return false;
        }
        if (filters.supplierId !== 'Todos' && commission.supplierId !== filters.supplierId) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          (parseDateString(b.saleDate)?.getTime() || 0) -
          (parseDateString(a.saleDate)?.getTime() || 0),
      );
  }, [commissions, filters, showArchived]);

  const summary = useMemo(() => {
    const activeCommissions = commissions.filter((commission) => !commission.archived);
    const pendingValue = activeCommissions
      .filter((commission) => commission.status === 'Pendente')
      .reduce((sum, commission) => sum + commission.commissionValue, 0);

    const receivedLast30Days = activeCommissions
      .filter((commission) => {
        if (commission.status !== 'Recebido' || !commission.paymentDate) {
          return false;
        }
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return (parseDateString(commission.paymentDate) || new Date(0)) >= thirtyDaysAgo;
      })
      .reduce((sum, commission) => sum + commission.commissionValue, 0);

    return { pendingValue, receivedLast30Days };
  }, [commissions]);

  const handleSave = (commission: Commission) => {
    setCommissions((previous) => {
      const exists = previous.some((item) => item.id === commission.id);
      if (exists) {
        return previous.map((item) => (item.id === commission.id ? commission : item));
      }
      return [commission, ...previous];
    });
    setFormModalOpen(false);
  };

  const handleDeleteRequest = (commission: Commission) => {
    setCommissionToUpdate(commission);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (commissionToUpdate) {
      setCommissions((previous) => previous.filter((item) => item.id !== commissionToUpdate.id));
    }
    setDeleteModalOpen(false);
    setCommissionToUpdate(null);
  };

  const handleArchive = (id: string, archiveStatus: boolean) => {
    setCommissions((previous) =>
      previous.map((item) => (item.id === id ? { ...item, archived: archiveStatus } : item)),
    );
  };

  const handleConfirmPayment = (paymentDate: string) => {
    if (!commissionToUpdate) {
      return;
    }
    setCommissions((previous) =>
      previous.map((item) =>
        item.id === commissionToUpdate.id ? { ...item, status: 'Recebido', paymentDate } : item,
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

      <CommissionsSummaryCards
        pendingValue={summary.pendingValue}
        receivedLast30Days={summary.receivedLast30Days}
      />

      <CommissionsFilterBar filters={filters} suppliers={suppliers} onFilterChange={setFilters} />

      <CommissionsTable
        commissions={filteredCommissions}
        onConfirmPayment={openConfirmModal}
        onEdit={(commission) => openFormModal(commission)}
        onDelete={handleDeleteRequest}
        onToggleArchive={handleArchive}
      />

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
