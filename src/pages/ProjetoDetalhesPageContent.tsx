import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import {
  useCoreData,
  useFinanceData,
  useSupplyChainData,
  useSystemData,
} from '../context/DataContext';
import type {
  Project,
  ProjectTask,
  AgendaEvent,
  ContractAddendum,
  ProjectAddress,
  ContractAddendumStatus,
  ProjectFinancials,
} from '../types';

import { formatCurrency } from '../utils/formatters';
import { canTransitionAddendumStatus } from '../utils/addendumWorkflow';
import { getApprovedAddendumTotal } from '../utils/projectFinancials';
import { calculateProjectProgress } from '../services/dashboardService';
import { DEFAULT_BUDGET_TEMPLATE_SECTIONS } from '../constants.budget';
import { CheckCircleIcon } from '../components/ui';
import { EventFormModal } from '../components/agenda';
import { agendaService } from '../services/agendaService';
import { v4 as uuidv4 } from 'uuid';
import { useProjectChecklist } from '../hooks/useProjectChecklist';
import { useProjectFinancials, type PaymentTarget } from '../hooks/useProjectFinancials';
import {
  TaskDetailModal,
  LinkQuotationModal,
  ConfirmPaymentModal,
  ProjectActionModal,
} from '../components/projetos';
import { ProjetoDetalhesTabs } from './projeto-detalhes/ProjetoDetalhesTabs';
import type { BudgetServiceOption, ProjectDetailTabId } from './projeto-detalhes/types';
import {
  appendAddendumAuditEntry,
  recalculateProjectTotals,
} from './projeto-detalhes/addendumUtils';
import { useProjectLifecycleActions } from './projeto-detalhes/useProjectLifecycleActions';

const ProjetoDetalhesPage: () => React.ReactNode = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, setProjects } = useCoreData();
  const { manualExpenses, setManualExpenses, setManualIncomes } = useFinanceData();
  const { quotations } = useSupplyChainData();
  const { setAgendaEvents, customBudgetTemplate } = useSystemData();

  const project = useMemo(() => projects.find((p) => p.id === id), [id, projects]);
  const [localProject, setLocalProject] = useState<Project | null>(
    project ? JSON.parse(JSON.stringify(project)) : null,
  );

  const [activeTab, setActiveTab] = useState<ProjectDetailTabId>('overview');
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const [isConfirmValueChangeOpen, setConfirmValueChangeOpen] = useState(false);
  const [isMeetingModalOpen, setMeetingModalOpen] = useState(false);
  const [isPaymentConfirmModalOpen, setPaymentConfirmModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setTaskDetailModalOpen] = useState(false);

  const [paymentToConfirm, setPaymentToConfirm] = useState<PaymentTarget | null>(null);
  const [tempFinancialValue, setTempFinancialValue] = useState<number | undefined>(undefined);

  const [editingTask, setEditingTask] = useState<{ sectionId: string; task: ProjectTask } | null>(
    null,
  );
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

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
      setConfirmValueChangeOpen(true);
      return;
    }
    setLocalProject((p) => (p ? { ...p, financials: { ...p.financials, [field]: value } } : null));
  };

  const confirmFinancialValueChange = () => {
    if (tempFinancialValue === undefined) {
      setConfirmValueChangeOpen(false);
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
    setConfirmValueChangeOpen(false);
    setTempFinancialValue(undefined);
  };

  const handleSave = () => {
    if (localProject) {
      setProjects((prev) => prev.map((p) => (p.id === localProject.id ? localProject : p)));
      setAgendaEvents((prev) => agendaService.syncProjectEventsWithAgenda(localProject, prev));

      setShowSaveSuccess(true);
      setIsEditingAddress(false);
      setTimeout(() => setShowSaveSuccess(false), 3000);
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
    setLinkModalOpen(false);
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
    setMeetingModalOpen(false);
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
  } = useProjectChecklist(setLocalProject, editingTask, setEditingTask, setTaskDetailModalOpen);

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
  } = useProjectFinancials(
    setLocalProject,
    localProject,
    paymentToConfirm,
    setPaymentToConfirm,
    setPaymentConfirmModalOpen,
  );

  if (!project || !localProject) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold">Projeto não encontrado</h2>
        <button
          type="button"
          onClick={() => navigate('/projetos')}
          className="mt-6 px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary"
        >
          Voltar
        </button>
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
        setLinkModalOpen={setLinkModalOpen}
        handleUnlinkQuotation={handleUnlinkQuotation}
      />

      {isDirty && (
        <div className="fixed bottom-0 left-0 md:left-64 lg:left-80 right-0 bg-background/80 backdrop-blur-sm p-4 border-t border-border-color z-20">
          <div className="max-w-7xl mx-auto flex justify-end items-center gap-4">
            <button
              type="button"
              onClick={() => setLocalProject(JSON.parse(JSON.stringify(project)))}
              className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-surface border border-border-color"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
            >
              Salvar Alterações
            </button>
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
        isOpen={isLinkModalOpen}
        onClose={() => setLinkModalOpen(false)}
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
        isOpen={isMeetingModalOpen}
        onClose={() => setMeetingModalOpen(false)}
        onSave={handleSaveMeeting}
        onDelete={() => {}}
        event={null}
        dateForNewEvent={new Date()}
      />
      <Modal
        isOpen={isConfirmValueChangeOpen}
        onClose={() => setConfirmValueChangeOpen(false)}
        title="Confirmar Alteração de Valor"
      >
        <p className="text-text-primary mb-6">
          Você tem certeza que deseja alterar o valor base do contrato para{' '}
          <strong className="text-secondary">{formatCurrency(tempFinancialValue)}</strong>? O total
          do projeto será recalculado com os aditivos aprovados.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setConfirmValueChangeOpen(false)}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmFinancialValueChange}
            className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
          >
            Confirmar
          </button>
        </div>
      </Modal>
      <ConfirmPaymentModal
        isOpen={isPaymentConfirmModalOpen}
        onClose={() => setPaymentConfirmModalOpen(false)}
        onConfirm={handleConfirmPayment}
      />
      <TaskDetailModal
        isOpen={isTaskDetailModalOpen}
        onClose={() => setTaskDetailModalOpen(false)}
        task={editingTask?.task || null}
        onSave={handleSaveTaskDetails}
      />
    </div>
  );
};

export default ProjetoDetalhesPage;
