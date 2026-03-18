import React, { useMemo, useState, useEffect } from 'react';
import { useAutoReset } from '@/hooks/useAutoReset';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Button, Modal } from '@/components/ui';
import {
  useCoreData,
  useFinanceData,
  useSupplyChainData,
  useSystemData,
} from '@/context/DataContext';
import type {
  Project,
  ProjectTask,
  AgendaEvent,
  ContractAddendum,
  ProjectAddress,
  ContractAddendumStatus,
  ProjectFinancials,
} from '@/types';

import { formatCurrency } from '@/utils/formatters';
import { canTransitionAddendumStatus } from '@/utils/addendumWorkflow';
import { getApprovedAddendumTotal } from '@/utils/projectFinancials';
import { calculateProjectProgress } from '@/services/dashboardService';
import { DEFAULT_BUDGET_TEMPLATE_SECTIONS } from '@/constants/budget';
import { CheckCircleIcon } from '@/components/ui';
import { EventFormModal } from '@/components/agenda';
import { agendaService } from '@/services/agendaService';
import { v4 as uuidv4 } from 'uuid';
import { useProjectChecklist } from '@/hooks/useProjectChecklist';
import { useProjectFinancials, type PaymentTarget } from '@/hooks/useProjectFinancials';
import {
  TaskDetailModal,
  LinkQuotationModal,
  ConfirmPaymentModal,
  ProjectActionModal,
} from '@/components/projetos';
import { appendAddendumAuditEntry, recalculateProjectTotals } from '@/utils/addendumUtils';
import { getLatestPriceFromHistory } from '@/utils/supplierHelpers';
import { ProjetoDetalhesTabs } from './ProjetoDetalhesTabs';
import type { BudgetServiceOption, ProjectDetailTabId } from './types';
import { useProjectLifecycleActions } from './useProjectLifecycleActions';

const ProjetoDetalhesPage: () => React.ReactNode = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, setProjects } = useCoreData();
  const { manualExpenses, setManualExpenses, setManualIncomes, commissions } = useFinanceData();
  const { quotations, suppliers, supplierProductPrices, freelancers } = useSupplyChainData();
  const { setAgendaEvents, customBudgetTemplate, hiredServices } = useSystemData();

  const project = useMemo(() => projects.find((p) => p.id === id), [id, projects]);
  const [localProject, setLocalProject] = useState<Project | null>(
    project ? JSON.parse(JSON.stringify(project)) : null,
  );

  const [activeTab, setActiveTab] = useState<ProjectDetailTabId>('overview');
  const linkDisclosure = useDisclosure();
  const confirmValueDisclosure = useDisclosure();
  const meetingDisclosure = useDisclosure();
  const paymentConfirmDisclosure = useDisclosure();
  const taskDetailDisclosure = useDisclosure();

  const [paymentToConfirm, setPaymentToConfirm] = useState<PaymentTarget | null>(null);
  const [tempFinancialValue, setTempFinancialValue] = useState<number | undefined>(undefined);

  const [editingTask, setEditingTask] = useState<{ sectionId: string; task: ProjectTask } | null>(
    null,
  );
  const [showSaveSuccess, setShowSaveSuccess] = useAutoReset(false, 3000);

  // Address Edit State
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const budgetServices = useMemo<BudgetServiceOption[]>(() => {
    const sourceTemplate =
      customBudgetTemplate && customBudgetTemplate.length > 0
        ? customBudgetTemplate
        : DEFAULT_BUDGET_TEMPLATE_SECTIONS;

    return sourceTemplate.flatMap((section) =>
      section.items.map((item) => ({
        id: `${section.id}_${item.id}`,
        sectionTitle: section.title,
        description: item.description,
        suggestedValue: Math.max(0, (item.quantity || 1) * (item.unitPrice || 0)),
        unit: section.unit,
      })),
    );
  }, [customBudgetTemplate]);

  useEffect(() => {
    if (project) {
      setLocalProject(JSON.parse(JSON.stringify(project)));
    }
  }, [project]);

  const isDirty = useMemo(() => {
    if (!project || !localProject) return false;
    return JSON.stringify(project) !== JSON.stringify(localProject);
  }, [localProject, project]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleLocalChange = (field: keyof Project, value: Project[keyof Project]) =>
    setLocalProject((p) => (p ? { ...p, [field]: value } : null));

  const handleAddressChange = (field: keyof ProjectAddress, value: string) => {
    setLocalProject((p) =>
      p
        ? {
            ...p,
            serviceAddress: {
              ...(p.serviceAddress || {
                street: '',
                number: '',
                neighborhood: '',
                city: '',
                state: '',
                zip: '',
              }),
              [field]: value,
            },
          }
        : null,
    );
  };

  const handleFinancialsChange = (
    field: keyof Project['financials'],
    value: ProjectFinancials[keyof ProjectFinancials],
  ) => {
    if (field === 'baseContractValue') {
      if (value === undefined) return;
      setTempFinancialValue(value as number);
      confirmValueDisclosure.open();
      return;
    }
    setLocalProject((p) => (p ? { ...p, financials: { ...p.financials, [field]: value } } : null));
  };

  const confirmFinancialValueChange = () => {
    if (tempFinancialValue === undefined) {
      confirmValueDisclosure.close();
      return;
    }
    setLocalProject((p) => {
      if (!p) return null;
      const approvedAddendums = getApprovedAddendumTotal(p.financials.addendums || []);
      const baseContractValue = Math.max(0, tempFinancialValue);
      return {
        ...p,
        budget: baseContractValue,
        financials: {
          ...p.financials,
          baseContractValue,
          totalValue: baseContractValue + approvedAddendums,
          lumpSumValue:
            p.financials.paymentType === 'vista'
              ? baseContractValue + approvedAddendums
              : p.financials.lumpSumValue,
        },
      };
    });
    confirmValueDisclosure.close();
    setTempFinancialValue(undefined);
  };

  const handleSave = () => {
    if (localProject) {
      setProjects((prev) => prev.map((p) => (p.id === localProject.id ? localProject : p)));
      setAgendaEvents((prev) => agendaService.syncProjectEventsWithAgenda(localProject, prev));

      setShowSaveSuccess(true);
      setIsEditingAddress(false);
    }
  };

  // ... [Previous handler functions] ...
  const handleAddAddendum = (addendum: Omit<ContractAddendum, 'id' | 'status'>) => {
    setLocalProject((p) => {
      if (!p) return null;
      const newAddendum: ContractAddendum = { ...addendum, id: uuidv4(), status: 'Rascunho' };
      const currentAddendums = p.financials.addendums || [];
      const projectWithAudit = appendAddendumAuditEntry(p, {
        addendumId: newAddendum.id,
        action: 'created',
        description: `Aditivo criado: ${newAddendum.description}`,
        toStatus: newAddendum.status,
      });
      return recalculateProjectTotals(projectWithAudit, [...currentAddendums, newAddendum]);
    });
  };

  const handleUpdateAddendumStatus = (id: string, status: ContractAddendumStatus) => {
    setLocalProject((p) => {
      if (!p) return null;
      const currentAddendum = p.financials.addendums?.find((a) => a.id === id);
      if (!currentAddendum || currentAddendum.status === status) return p;
      if (!canTransitionAddendumStatus(currentAddendum.status, status)) {
        alert(`Transição inválida de status: ${currentAddendum.status} -> ${status}.`);
        return p;
      }

      const updatedAddendums =
        p.financials.addendums?.map((a) => (a.id === id ? { ...a, status } : a)) || [];
      const projectWithAudit = appendAddendumAuditEntry(p, {
        addendumId: id,
        action: 'status_changed',
        description: `Status alterado em: ${currentAddendum.description}`,
        fromStatus: currentAddendum.status,
        toStatus: status,
      });
      return recalculateProjectTotals(projectWithAudit, updatedAddendums);
    });
  };

  const handleRemoveAddendum = (id: string) => {
    setLocalProject((p) => {
      if (!p) return null;
      const removedAddendum = p.financials.addendums?.find((a) => a.id === id);
      const updatedAddendums = p.financials.addendums?.filter((a) => a.id !== id) || [];
      if (!removedAddendum) return recalculateProjectTotals(p, updatedAddendums);

      const projectWithAudit = appendAddendumAuditEntry(p, {
        addendumId: id,
        action: 'deleted',
        description: `Aditivo removido: ${removedAddendum.description}`,
        fromStatus: removedAddendum.status,
      });

      return recalculateProjectTotals(projectWithAudit, updatedAddendums);
    });
  };

  const {
    isActionModalOpen,
    setActionModalOpen,
    currentActionType,
    handleActionRequest,
    handleExecuteAction,
    handleReactivate,
  } = useProjectLifecycleActions({
    localProject,
    setProjects,
    setAgendaEvents,
    navigate,
    manualExpenses,
    setManualExpenses,
    setManualIncomes,
    setLocalProject,
  });

  const handleSaveLinkedQuotations = (quotationIds: string[]) => {
    handleLocalChange('linkedQuotationIds', quotationIds);
    linkDisclosure.close();
  };
  const handleUnlinkQuotation = (quotationId: string) => {
    if (localProject?.linkedQuotationIds) {
      handleLocalChange(
        'linkedQuotationIds',
        localProject.linkedQuotationIds.filter((id) => id !== quotationId),
      );
    }
  };
  const handleSaveMeeting = (event: AgendaEvent) => {
    setAgendaEvents((prev) =>
      prev.find((e) => e.id === event.id)
        ? prev.map((e) => (e.id === event.id ? event : e))
        : [...prev, event],
    );
    meetingDisclosure.close();
  };

  // --- Checklist Handlers (extracted to useProjectChecklist) ---
  const {
    handleAddSection,
    handleRemoveSection,
    handleSectionChange,
    handleAddTask,
    handleRemoveTask,
    handleTaskChange,
    handleGanttTaskUpdate,
    handleEditTaskDetails,
    handleSaveTaskDetails,
  } = useProjectChecklist(setLocalProject, editingTask, setEditingTask, taskDetailDisclosure.open);

  // --- Financials Handlers (extracted to useProjectFinancials) ---
  const {
    handleGenerateInstallments,
    handleInstallmentChange,
    handleAddInstallment,
    handleRemoveInstallment,
    handleOpenConfirmPayment,
    handleConfirmPayment,
    handleAddDeadline,
    handleDeadlineChange,
    handleRemoveDeadline,
    incrementRevision,
    decrementRevision,
  } = useProjectFinancials(
    setLocalProject,
    localProject,
    paymentToConfirm,
    setPaymentToConfirm,
    paymentConfirmDisclosure.open,
    paymentConfirmDisclosure.close,
  );

  const commissionTotal = useMemo(() => {
    if (!localProject) return 0;
    const projectQuotationIds = new Set<string>();
    quotations
      .filter(
        (q) => q.projectId === localProject.id || localProject.linkedQuotationIds?.includes(q.id),
      )
      .forEach((q) => projectQuotationIds.add(q.id));
    if (projectQuotationIds.size === 0) return 0;
    return commissions
      .filter((c) => c.quotationId && projectQuotationIds.has(c.quotationId))
      .reduce((sum, c) => sum + (c.commissionValue || 0), 0);
  }, [commissions, quotations, localProject]);

  const potentialCommissionTotal = useMemo(() => {
    if (!localProject) return 0;
    const projectQuotations = quotations.filter(
      (q) =>
        (q.projectId === localProject.id || localProject.linkedQuotationIds?.includes(q.id)) &&
        q.status !== 'Aceita',
    );
    let total = 0;
    for (const q of projectQuotations) {
      for (const item of q.items) {
        const supplierId = q.selections?.[item.productId];
        if (!supplierId) continue;
        const supplier = suppliers.find((s) => s.id === supplierId);
        const priceInfo = supplierProductPrices.find(
          (p) => p.productId === item.productId && p.supplierId === supplierId,
        );
        const price = priceInfo ? getLatestPriceFromHistory(priceInfo.priceHistory) : 0;
        if (price !== null && supplier) {
          total += price * item.quantity * ((supplier.commissionPercentage || 0) / 100);
        }
      }
    }
    return total;
  }, [quotations, localProject, suppliers, supplierProductPrices]);

  const freelancerDeadlines = useMemo(() => {
    if (!localProject) return [];
    return hiredServices
      .filter((hs) => hs.projectId === localProject.id && hs.status !== 'Cancelado')
      .map((hs) => {
        const freelancer = freelancers.find((f) => f.id === hs.freelancerId);
        return {
          id: hs.id,
          freelancerName: freelancer?.name || 'Freelancer',
          deadline: hs.deadline,
          status: hs.status,
        };
      });
  }, [hiredServices, localProject, freelancers]);

  if (!project || !localProject) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold">Projeto não encontrado</h2>
        <Button
          type="button"
          variant="primary"
          onClick={() => navigate('/projetos')}
          className="mt-6"
        >
          Voltar
        </Button>
      </div>
    );
  }

  const { progress } = calculateProjectProgress(localProject);

  return (
    <div className="pb-24 animate-fade-in-up">
      <PageHeader title={`${localProject.name} - ${localProject.code}`} />

      <ProjetoDetalhesTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        localProject={localProject}
        progress={progress}
        isEditingAddress={isEditingAddress}
        setIsEditingAddress={setIsEditingAddress}
        handleLocalChange={handleLocalChange}
        handleAddressChange={handleAddressChange}
        incrementRevision={incrementRevision}
        decrementRevision={decrementRevision}
        handleActionRequest={handleActionRequest}
        handleReactivate={handleReactivate}
        handleSectionChange={handleSectionChange}
        handleTaskChange={handleTaskChange}
        handleAddSection={handleAddSection}
        handleRemoveSection={handleRemoveSection}
        handleAddTask={handleAddTask}
        handleRemoveTask={handleRemoveTask}
        handleEditTaskDetails={handleEditTaskDetails}
        handleAddDeadline={handleAddDeadline}
        handleDeadlineChange={handleDeadlineChange}
        handleRemoveDeadline={handleRemoveDeadline}
        handleGanttTaskUpdate={handleGanttTaskUpdate}
        budgetServices={budgetServices}
        handleFinancialsChange={handleFinancialsChange}
        handleInstallmentChange={handleInstallmentChange}
        handleGenerateInstallments={handleGenerateInstallments}
        handleOpenConfirmPayment={handleOpenConfirmPayment}
        handleAddInstallment={handleAddInstallment}
        handleRemoveInstallment={handleRemoveInstallment}
        handleAddAddendum={handleAddAddendum}
        handleUpdateAddendumStatus={handleUpdateAddendumStatus}
        handleRemoveAddendum={handleRemoveAddendum}
        quotations={quotations}
        openLinkModal={linkDisclosure.open}
        handleUnlinkQuotation={handleUnlinkQuotation}
        commissionTotal={commissionTotal}
        potentialCommissionTotal={potentialCommissionTotal}
        freelancerDeadlines={freelancerDeadlines}
      />

      {isDirty && (
        <div className="fixed bottom-0 left-0 md:left-64 lg:left-80 right-0 bg-background/80 backdrop-blur-sm p-4 border-t border-border-color z-20">
          <div className="max-w-7xl mx-auto flex justify-end items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setLocalProject(JSON.parse(JSON.stringify(project)))}
            >
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={handleSave}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      )}

      {showSaveSuccess && (
        <div className="fixed bottom-6 right-6 bg-success text-white px-6 py-3 rounded-xl shadow-lifted z-50 flex items-center gap-3 animate-fade-in-up">
          <CheckCircleIcon className="w-6 h-6" />
          <span className="font-semibold">Alterações salvas com sucesso!</span>
        </div>
      )}

      <LinkQuotationModal
        isOpen={linkDisclosure.isOpen}
        onClose={linkDisclosure.close}
        onSave={handleSaveLinkedQuotations}
        project={project}
      />
      <ProjectActionModal
        isOpen={isActionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onConfirm={handleExecuteAction}
        projectName={project.name}
        actionType={currentActionType}
      />
      <EventFormModal
        isOpen={meetingDisclosure.isOpen}
        onClose={meetingDisclosure.close}
        onSave={handleSaveMeeting}
        onDelete={() => {}}
        event={null}
        dateForNewEvent={new Date()}
      />
      <Modal
        isOpen={confirmValueDisclosure.isOpen}
        onClose={confirmValueDisclosure.close}
        title="Confirmar Alteração de Valor"
      >
        <p className="text-text-primary mb-6">
          Você tem certeza que deseja alterar o valor base do contrato para{' '}
          <strong className="text-secondary">{formatCurrency(tempFinancialValue)}</strong>? O total
          do projeto será recalculado com os aditivos aprovados.
        </p>
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={confirmValueDisclosure.close}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={confirmFinancialValueChange}>
            Confirmar
          </Button>
        </div>
      </Modal>
      <ConfirmPaymentModal
        isOpen={paymentConfirmDisclosure.isOpen}
        onClose={paymentConfirmDisclosure.close}
        onConfirm={handleConfirmPayment}
      />
      <TaskDetailModal
        isOpen={taskDetailDisclosure.isOpen}
        onClose={taskDetailDisclosure.close}
        task={editingTask?.task || null}
        onSave={handleSaveTaskDetails}
      />
    </div>
  );
};

export default ProjetoDetalhesPage;
