import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { useData } from '../context/DataContext';
import type {
  Project,
  ProjectSection,
  ProjectTask,
  Installment,
  AdditionalDeadline,
  ProjectStatus,
  AgendaEvent,
  PaymentMethod,
  ProfessionalExpense,
  ContractAddendum,
  ProjectAddress,
  ManualIncome,
  AddendumAuditEntry,
  ContractAddendumStatus,
} from '../types';
import { projectStatuses } from '../types';
import { formatCurrency } from '../utils/formatters';
import { canTransitionAddendumStatus } from '../utils/addendumWorkflow';
import {
  getApprovedAddendumTotal,
  getProjectBaseContractValue,
  getProjectTotalContractValue,
} from '../utils/projectFinancials';
import { calculateProjectProgress } from '../services/dashboardService';
import { NAV_LINKS } from '../constants';
import { DEFAULT_BUDGET_TEMPLATE_SECTIONS } from '../constants.budget';
import {
  CashIcon,
  ClipboardDocumentListIcon,
  TrashIcon,
  CheckCircleIcon,
  PencilIcon,
  CalendarPlusIcon,
  ArchiveIcon,
  UnarchiveIcon,
  ClockIcon,
  PlusIcon,
  LinkIcon,
  EditIcon,
} from '../components/ui';
import { EventFormModal } from '../components/agenda';
import { agendaService } from '../services/agendaService';
import { v4 as uuidv4 } from 'uuid';
import {
  TaskDetailModal,
  ProjectChecklistTab,
  ProjectFinanceTab,
  ProjectQuotationsTab,
  ProjectGanttTab,
  InfoCard,
  RevisionCounter,
  LinkQuotationModal,
  ConfirmPaymentModal,
  ProjectActionModal,
} from '../components/projetos';
import type { ProjectActionType } from '../components/projetos';

type BudgetServiceOption = {
  id: string;
  sectionTitle: string;
  description: string;
  suggestedValue: number;
  unit: string;
};

const ProjetoDetalhesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projects,
    setProjects,
    quotations,
    setAgendaEvents,
    manualExpenses,
    setManualExpenses,
    setManualIncomes,
    customBudgetTemplate,
  } = useData();

  const project = useMemo(() => projects.find((p) => p.id === id), [id, projects]);
  const [localProject, setLocalProject] = useState<Project | null>(
    project ? JSON.parse(JSON.stringify(project)) : null,
  );
  const [isDirty, setIsDirty] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'stages' | 'deadlines' | 'gantt' | 'finance' | 'quotations' | 'notes'
  >('overview');
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const [isConfirmValueChangeOpen, setConfirmValueChangeOpen] = useState(false);
  const [isMeetingModalOpen, setMeetingModalOpen] = useState(false);
  const [isPaymentConfirmModalOpen, setPaymentConfirmModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setTaskDetailModalOpen] = useState(false);

  const [isActionModalOpen, setActionModalOpen] = useState(false);
  const [currentActionType, setCurrentActionType] = useState<ProjectActionType>('inactivate');

  const [paymentToConfirm, setPaymentToConfirm] = useState<
    { type: 'lump' } | { type: 'installment'; id: string } | null
  >(null);
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
      setIsDirty(false);
    }
  }, [project]);

  useEffect(() => {
    if (project && localProject) {
      const hasChanged = JSON.stringify(project) !== JSON.stringify(localProject);
      setIsDirty(hasChanged);
    }
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

  const appendAddendumAuditEntry = (
    projectState: Project,
    entry: Omit<AddendumAuditEntry, 'id' | 'timestamp'>,
  ): Project => {
    const nextEntry: AddendumAuditEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      actor: entry.actor || 'Sistema',
    };

    return {
      ...projectState,
      financials: {
        ...projectState.financials,
        addendumAuditTrail: [nextEntry, ...(projectState.financials.addendumAuditTrail || [])],
      },
    };
  };

  const recalculateProjectTotals = (
    projectState: Project,
    nextAddendums: ContractAddendum[],
  ): Project => {
    const approvedNextTotal = getApprovedAddendumTotal(nextAddendums);
    const baseContractValue = getProjectBaseContractValue(projectState);
    const recalculatedTotal = baseContractValue + approvedNextTotal;

    return {
      ...projectState,
      budget: baseContractValue,
      financials: {
        ...projectState.financials,
        baseContractValue,
        totalValue: recalculatedTotal,
        lumpSumValue:
          projectState.financials.paymentType === 'vista'
            ? recalculatedTotal
            : projectState.financials.lumpSumValue,
        addendums: nextAddendums,
      },
    };
  };

  const handleLocalChange = (field: keyof Project, value: any) =>
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

  const handleFinancialsChange = (field: keyof Project['financials'], value: any) => {
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
      setIsDirty(false);
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

  const handleActionRequest = (type: ProjectActionType) => {
    setCurrentActionType(type);
    setActionModalOpen(true);
  };

  const handleExecuteAction = (refundAmount: number, refundDate: string) => {
    if (!localProject) return;

    if (refundAmount > 0) {
      const refundExpense: ProfessionalExpense = {
        id: `exp_refund_${localProject.id}_${Date.now()}`,
        description: `Reembolso - ${localProject.name} (${currentActionType === 'delete' ? 'Projeto Excluído' : 'Projeto Encerrado'})`,
        category: 'Reembolso a Cliente',
        value: refundAmount,
        dueDate: refundDate,
        status: 'Pago',
        paymentDate: refundDate,
        isRecurring: false,
        source: 'Manual',
      };
      setManualExpenses((prev) => [refundExpense, ...prev]);
    }

    if (currentActionType === 'delete') {
      setProjects((prev) => prev.filter((p) => p.id !== localProject.id));
      setAgendaEvents((prev) =>
        agendaService.syncProjectEventsWithAgenda(null, prev, localProject.id),
      );
      navigate('/projetos');
    } else if (currentActionType === 'inactivate') {
      const inactivatedProject: Project = {
        ...localProject,
        status: 'Cancelado',
        archived: true,
        inactivatedAt: new Date().toISOString(),
      };
      setProjects((prev) =>
        prev.map((p) => (p.id === inactivatedProject.id ? inactivatedProject : p)),
      );
      setAgendaEvents((prev) =>
        agendaService.syncProjectEventsWithAgenda(inactivatedProject, prev),
      );
      navigate('/projetos');
    } else if (currentActionType === 'finalize') {
      const finalizedProject = JSON.parse(JSON.stringify(localProject));
      finalizedProject.status = 'Concluído';
      finalizedProject.archived = true;
      finalizedProject.finalizedAt = new Date().toISOString();

      finalizedProject.sections.forEach((section: any) => {
        section.tasks.forEach((task: any) => {
          task.completed = true;
        });
      });

      if (finalizedProject.financials) {
        if (finalizedProject.financials.paymentType === 'vista') {
          finalizedProject.financials.lumpSumStatus = 'Pago';
          finalizedProject.financials.lumpSumPaymentDate = new Date().toISOString();
        } else if (finalizedProject.financials.paymentType === 'parcelado') {
          finalizedProject.financials.installments?.forEach((inst: any) => {
            if (!inst.paid) {
              inst.paid = true;
              inst.paymentDate = new Date().toISOString();
            }
          });
        }
      }

      setProjects((prev) => prev.map((p) => (p.id === finalizedProject.id ? finalizedProject : p)));
      setAgendaEvents((prev) => agendaService.syncProjectEventsWithAgenda(finalizedProject, prev));
      navigate('/projetos');
    }

    setActionModalOpen(false);
  };

  const handleReactivate = () => {
    if (!localProject) return;
    if (
      window.confirm(
        `Deseja reativar o projeto "${localProject.name}"? Ele voltará para o status "Em Andamento".`,
      )
    ) {
      const refundableExpenses = manualExpenses.filter(
        (expense) =>
          expense.id.startsWith(`exp_refund_${localProject.id}_`) &&
          !expense.description.includes('[ESTORNADO]'),
      );

      if (refundableExpenses.length > 0) {
        const shouldReverseRefund = window.confirm(
          `Foram encontrados ${refundableExpenses.length} reembolso(s) financeiro(s) deste projeto. Deseja gerar estorno automático desses valores?`,
        );

        if (shouldReverseRefund) {
          const reversalDate = new Date().toISOString().split('T')[0];
          const reversalIncomes: ManualIncome[] = refundableExpenses.map((expense) => ({
            id: `inc_reversal_${expense.id}`,
            description: `Estorno de reembolso - ${localProject.name}`,
            category: 'Reembolso',
            value: expense.value,
            date: reversalDate,
            status: 'Recebido',
          }));

          setManualIncomes((prev) => [...reversalIncomes, ...prev]);
          setManualExpenses((prev) =>
            prev.map((expense) =>
              refundableExpenses.some((item) => item.id === expense.id)
                ? { ...expense, description: `${expense.description} [ESTORNADO]` }
                : expense,
            ),
          );
        }
      }

      const reactivatedProject: Project = {
        ...localProject,
        archived: false,
        status: 'Em Andamento',
        inactivatedAt: null,
        finalizedAt: null,
      };
      setProjects((prev) =>
        prev.map((p) => (p.id === reactivatedProject.id ? reactivatedProject : p)),
      );
      setAgendaEvents((prev) =>
        agendaService.syncProjectEventsWithAgenda(reactivatedProject, prev),
      );
      setLocalProject(reactivatedProject);
    }
  };

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

  // --- Checklist Handlers ---
  const handleAddSection = () =>
    setLocalProject((p) =>
      p
        ? { ...p, sections: [...p.sections, { id: uuidv4(), name: 'Nova Etapa', tasks: [] }] }
        : null,
    );
  const handleRemoveSection = (sectionId: string) =>
    setLocalProject((p) =>
      p ? { ...p, sections: p.sections.filter((s) => s.id !== sectionId) } : null,
    );
  const handleSectionChange = (sectionId: string, field: 'name', value: string) =>
    setLocalProject((p) =>
      p
        ? {
            ...p,
            sections: p.sections.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s)),
          }
        : null,
    );
  const handleAddTask = (sectionId: string) =>
    setLocalProject((p) =>
      p
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    tasks: [
                      ...s.tasks,
                      { id: uuidv4(), name: '', completed: false, hours: 0, status: 'todo' },
                    ],
                  }
                : s,
            ),
          }
        : null,
    );
  const handleRemoveTask = (sectionId: string, taskId: string) =>
    setLocalProject((p) =>
      p
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === sectionId ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) } : s,
            ),
          }
        : null,
    );
  const handleTaskChange = (
    sectionId: string,
    taskId: string,
    field: 'name' | 'hours' | 'completed' | 'status',
    value: any,
  ) => {
    setLocalProject((p) => {
      if (!p) return null;
      return {
        ...p,
        sections: p.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                tasks: s.tasks.map((t) => {
                  if (t.id !== taskId) return t;
                  let updatedTask = { ...t, [field]: value };
                  if (field === 'completed') {
                    updatedTask.status = value ? 'done' : 'todo';
                  } else if (field === 'status') {
                    updatedTask.completed = value === 'done';
                  }
                  return updatedTask;
                }),
              }
            : s,
        ),
      };
    });
  };

  const updateTaskDependenciesRecursive = (
    sections: ProjectSection[],
    modifiedTaskId: string,
    offsetMs: number,
  ): ProjectSection[] => {
    if (offsetMs === 0) return sections;

    const updatedSections = sections.map((section) => ({
      ...section,
      tasks: section.tasks.map((task) => ({ ...task })),
    }));

    const taskLocations = new Map<string, { sectionIndex: number; taskIndex: number }>();
    const dependentsByTask = new Map<string, string[]>();

    updatedSections.forEach((section, sectionIndex) => {
      section.tasks.forEach((task, taskIndex) => {
        taskLocations.set(task.id, { sectionIndex, taskIndex });
        (task.dependencies || []).forEach((dependencyId) => {
          const current = dependentsByTask.get(dependencyId) || [];
          current.push(task.id);
          dependentsByTask.set(dependencyId, current);
        });
      });
    });

    const queue: string[] = [modifiedTaskId];
    const visited = new Set<string>([modifiedTaskId]);

    while (queue.length > 0) {
      const currentTaskId = queue.shift()!;
      const dependentIds = dependentsByTask.get(currentTaskId) || [];

      dependentIds.forEach((dependentId) => {
        if (visited.has(dependentId)) return;

        const location = taskLocations.get(dependentId);
        if (!location) return;

        const task = updatedSections[location.sectionIndex].tasks[location.taskIndex];
        const taskStartRaw = task.startDate || task.dueDate;
        const taskEndRaw = task.endDate || task.dueDate;

        if (!taskStartRaw || !taskEndRaw) return;

        const taskStart = new Date(taskStartRaw);
        const taskEnd = new Date(taskEndRaw);
        if (Number.isNaN(taskStart.getTime()) || Number.isNaN(taskEnd.getTime())) return;

        const shiftedStart = new Date(taskStart.getTime() + offsetMs);
        const shiftedEnd = new Date(taskEnd.getTime() + offsetMs);

        updatedSections[location.sectionIndex].tasks[location.taskIndex] = {
          ...task,
          startDate: shiftedStart.toISOString(),
          endDate: shiftedEnd.toISOString(),
          dueDate: shiftedEnd.toISOString(),
        };

        visited.add(dependentId);
        queue.push(dependentId);
      });
    }

    return updatedSections;
  };

  const handleGanttTaskUpdate = (sectionId: string, updatedTask: ProjectTask) => {
    setLocalProject((p) => {
      if (!p) return null;

      // 1. Find old task to calculate offset
      const oldSection = p.sections.find((s) => s.id === sectionId);
      const oldTask = oldSection?.tasks.find((t) => t.id === updatedTask.id);

      let updatedSections = p.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              tasks: s.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
            }
          : s,
      );

      // 2. Cascade changes if dates changed
      if (oldTask && oldTask.startDate && updatedTask.startDate) {
        const oldStart = new Date(oldTask.startDate).getTime();
        const newStart = new Date(updatedTask.startDate).getTime();
        const diff = newStart - oldStart;

        if (diff !== 0) {
          updatedSections = updateTaskDependenciesRecursive(updatedSections, updatedTask.id, diff);
        }
      }

      return { ...p, sections: updatedSections };
    });
  };

  const handleEditTaskDetails = (sectionId: string, task: ProjectTask) => {
    setEditingTask({ sectionId, task });
    setTaskDetailModalOpen(true);
  };
  const handleSaveTaskDetails = (updatedTask: ProjectTask) => {
    if (!editingTask) return;
    setLocalProject((p) =>
      p
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === editingTask.sectionId
                ? { ...s, tasks: s.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)) }
                : s,
            ),
          }
        : null,
    );
  };

  // --- Financials Handlers ---
  const handleGenerateInstallments = () => {
    setLocalProject((p) => {
      if (!p) return null;
      const total = getProjectTotalContractValue(p);
      const count = p.financials.numberOfInstallments || 1;
      const day = p.financials.installmentsPaymentDay || new Date().getDate();
      const interest = p.financials.installmentsInterestEnabled
        ? (p.financials.installmentsInterestRate || 0) / 100
        : 0;
      const totalWithInterest = total * (1 + interest);
      const valuePerInstallment = totalWithInterest / count;
      const today = new Date();
      const newInstallments = Array.from({ length: count }, (_, i): Installment => {
        const monthOffset = p.financials.startInstallmentsInCurrentMonth ? i : i + 1;
        const targetMonth = today.getMonth() + monthOffset;
        let targetDate = new Date(today.getFullYear(), targetMonth, day);
        if (targetDate.getMonth() !== targetMonth % 12) {
          targetDate = new Date(today.getFullYear(), targetMonth + 1, 0);
        }
        return {
          id: uuidv4(),
          number: i + 1,
          value: valuePerInstallment,
          dueDate: targetDate.toISOString().split('T')[0],
          paid: false,
          paymentDate: null,
        };
      });
      return { ...p, financials: { ...p.financials, installments: newInstallments } };
    });
  };
  const handleInstallmentChange = (id: string, field: keyof Installment, value: any) => {
    setLocalProject((p) => {
      if (!p) return null;
      const installments =
        p.financials.installments?.map((inst) =>
          inst.id === id ? { ...inst, [field]: value } : inst,
        ) || [];
      return { ...p, financials: { ...p.financials, installments } };
    });
  };
  const handleAddInstallment = () => {
    setLocalProject((p) => {
      if (!p) return null;
      const currentInstallments = p.financials.installments || [];
      const newInstallment: Installment = {
        id: uuidv4(),
        number: currentInstallments.length + 1,
        value: 0,
        dueDate: new Date().toISOString().split('T')[0],
        paid: false,
        paymentDate: null,
        description: 'Parcela Extra',
      };
      return {
        ...p,
        financials: { ...p.financials, installments: [...currentInstallments, newInstallment] },
      };
    });
  };
  const handleRemoveInstallment = (id: string) => {
    setLocalProject((p) => {
      if (!p) return null;
      return {
        ...p,
        financials: {
          ...p.financials,
          installments: p.financials.installments?.filter((i) => i.id !== id),
        },
      };
    });
  };

  const handleOpenConfirmPayment = (
    payment: { type: 'lump' } | { type: 'installment'; id: string },
  ) => {
    setPaymentToConfirm(payment);
    setPaymentConfirmModalOpen(true);
  };
  const handleConfirmPayment = (paymentDate: string, paymentMethod: PaymentMethod) => {
    if (!paymentToConfirm || !localProject) return;
    let newFinancials = { ...localProject.financials };
    if (paymentToConfirm.type === 'lump') {
      newFinancials.lumpSumStatus = 'Pago';
      newFinancials.lumpSumPaymentDate = paymentDate;
      newFinancials.lumpSumPaymentMethod = paymentMethod;
    } else {
      newFinancials.installments = (newFinancials.installments || []).map((inst) =>
        inst.id === paymentToConfirm.id
          ? { ...inst, paid: true, paymentDate: paymentDate, paymentMethod: paymentMethod }
          : inst,
      );
    }
    setLocalProject({ ...localProject, financials: newFinancials });
    setPaymentConfirmModalOpen(false);
    setPaymentToConfirm(null);
  };

  const handleAddDeadline = () => {
    setLocalProject((p) =>
      p
        ? {
            ...p,
            additionalDeadlines: [
              ...(p.additionalDeadlines || []),
              { id: uuidv4(), title: 'Novo Prazo', date: new Date().toISOString().split('T')[0] },
            ],
          }
        : null,
    );
  };
  const handleDeadlineChange = (id: string, field: keyof AdditionalDeadline, value: string) => {
    setLocalProject((p) =>
      p
        ? {
            ...p,
            additionalDeadlines: (p.additionalDeadlines || []).map((d) =>
              d.id === id ? { ...d, [field]: value } : d,
            ),
          }
        : null,
    );
  };
  const handleRemoveDeadline = (id: string) => {
    setLocalProject((p) =>
      p
        ? { ...p, additionalDeadlines: (p.additionalDeadlines || []).filter((d) => d.id !== id) }
        : null,
    );
  };

  const incrementRevision = () => {
    setLocalProject((p) => (p ? { ...p, revisionCount: (p.revisionCount || 0) + 1 } : null));
  };

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
  const tabButtonClass = (tabId: string) =>
    `flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px ${activeTab === tabId ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`;
  const commonInputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary transition';

  return (
    <div className="pb-24 animate-fade-in-up">
      <PageHeader title={`${localProject.name} - ${localProject.code}`} />
      <div className="bg-surface rounded-xl shadow-soft">
        <nav className="flex border-b border-border-color px-6 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={tabButtonClass('overview')}
          >
            Visão Geral
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stages')}
            className={tabButtonClass('stages')}
          >
            Etapas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deadlines')}
            className={tabButtonClass('deadlines')}
          >
            <ClockIcon className="w-4 h-4" /> Prazos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gantt')}
            className={tabButtonClass('gantt')}
          >
            <CalendarPlusIcon className="w-4 h-4" /> Cronograma
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={tabButtonClass('finance')}
          >
            <CashIcon className="w-4 h-4" />
            Financeiro
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quotations')}
            className={tabButtonClass('quotations')}
          >
            <ClipboardDocumentListIcon className="w-4 h-4" />
            Cotações
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={tabButtonClass('notes')}
          >
            <PencilIcon className="w-4 h-4" />
            Anotações
          </button>
        </nav>
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-9">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Nome do Projeto
                  </label>
                  <input
                    value={localProject.name}
                    onChange={(e) => handleLocalChange('name', e.target.value)}
                    className={commonInputClass}
                    aria-label="Nome do projeto"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Status
                  </label>
                  <select
                    value={localProject.status}
                    onChange={(e) => handleLocalChange('status', e.target.value as ProjectStatus)}
                    className={commonInputClass}
                    aria-label="Status"
                  >
                    {projectStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Descrição
                </label>
                <textarea
                  value={localProject.description}
                  onChange={(e) => handleLocalChange('description', e.target.value)}
                  rows={3}
                  className={commonInputClass}
                  aria-label="Descrição do projeto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-background/30 p-4 rounded-xl border border-border-color/50">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      Endereço da Obra
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                      className="text-primary hover:underline text-xs flex items-center gap-1"
                    >
                      <EditIcon className="w-3 h-3" /> Editar
                    </button>
                  </div>
                  {isEditingAddress ? (
                    <div className="space-y-2 text-sm">
                      <input
                        placeholder="Rua"
                        value={localProject.serviceAddress?.street || ''}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        className={commonInputClass}
                        aria-label="Rua"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Número"
                          value={localProject.serviceAddress?.number || ''}
                          onChange={(e) => handleAddressChange('number', e.target.value)}
                          className={commonInputClass}
                          aria-label="Número"
                        />
                        <input
                          placeholder="CEP"
                          value={localProject.serviceAddress?.zip || ''}
                          onChange={(e) => handleAddressChange('zip', e.target.value)}
                          className={commonInputClass}
                          aria-label="CEP"
                        />
                      </div>
                      <input
                        placeholder="Cidade"
                        value={localProject.serviceAddress?.city || ''}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className={commonInputClass}
                        aria-label="Cidade"
                      />
                    </div>
                  ) : (
                    <p className="text-text-primary text-sm">
                      {localProject.serviceAddress?.street
                        ? `${localProject.serviceAddress.street}, ${localProject.serviceAddress.number} - ${localProject.serviceAddress.city}/${localProject.serviceAddress.state}`
                        : 'Endereço não informado.'}
                    </p>
                  )}
                </div>

                <div className="bg-background/30 p-4 rounded-xl border border-border-color/50 space-y-3">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Dados de RRT
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label htmlFor="project-rrt-number" className="text-xs text-text-secondary">
                        Número
                      </label>
                      <input
                        id="project-rrt-number"
                        type="text"
                        value={localProject.rrtNumber || ''}
                        onChange={(e) => handleLocalChange('rrtNumber', e.target.value)}
                        className={commonInputClass}
                        placeholder="Ex: 1234567"
                        aria-label="Número do RRT"
                        title="Número do RRT"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="project-rrt-url" className="text-xs text-text-secondary">
                        Link do Arquivo
                      </label>
                      <div className="flex gap-1">
                        <input
                          id="project-rrt-url"
                          type="text"
                          value={localProject.rrtUrl || ''}
                          onChange={(e) => handleLocalChange('rrtUrl', e.target.value)}
                          className={commonInputClass}
                          placeholder="https://..."
                          aria-label="Link do RRT"
                          title="Link do RRT"
                        />
                        {localProject.rrtUrl && (
                          <a
                            href={localProject.rrtUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-primary/10 text-primary rounded-md flex items-center justify-center hover:bg-primary/20"
                            aria-label="Abrir link do RRT"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <InfoCard
                  label="Progresso Geral"
                  className="bg-background border border-border-color h-full flex flex-col justify-center"
                >
                  <div className="flex items-center gap-2">
                    <progress
                      className="progress-bar progress-track-surface progress-fill-primary-success h-3 w-full rounded-full border border-border-color/50"
                      value={progress}
                      max={100}
                    />
                    <span className="font-bold text-primary min-w-[3rem] text-right">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </InfoCard>

                <RevisionCounter
                  count={localProject.revisionCount || 0}
                  limit={localProject.revisionLimit || 3}
                  onIncrement={incrementRevision}
                />
              </div>

              <div className="pt-6 border-t border-error/20 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleActionRequest('delete')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-error bg-error/10 hover:bg-error/20 border border-error/20 flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" /> Excluir Projeto
                </button>

                {localProject.archived ? (
                  <>
                    <div className="flex-1"></div>
                    <button
                      type="button"
                      onClick={handleReactivate}
                      className="px-4 py-2 rounded-lg font-semibold text-sm text-secondary bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 flex items-center gap-2"
                    >
                      <UnarchiveIcon className="w-4 h-4" /> Reativar Projeto
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleActionRequest('inactivate')}
                      className="px-4 py-2 rounded-lg font-semibold text-sm text-warning bg-warning/10 hover:bg-warning/20 border border-warning/20 flex items-center gap-2"
                    >
                      <ArchiveIcon className="w-4 h-4" /> Inativar e Arquivar
                    </button>
                    <div className="flex-1"></div>
                    <button
                      type="button"
                      onClick={() => handleActionRequest('finalize')}
                      className="px-4 py-2 rounded-lg font-semibold text-sm text-white bg-success hover:bg-emerald-700 flex items-center gap-2"
                    >
                      <CheckCircleIcon className="w-4 h-4" /> Finalizar Projeto
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stages' && (
            <ProjectChecklistTab
              sections={localProject.sections}
              onSectionChange={handleSectionChange}
              onTaskChange={handleTaskChange}
              onAddSection={handleAddSection}
              onRemoveSection={handleRemoveSection}
              onAddTask={handleAddTask}
              onRemoveTask={handleRemoveTask}
              onEditTaskDetails={handleEditTaskDetails}
            />
          )}

          {activeTab === 'deadlines' && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="bg-background/30 p-6 rounded-xl border border-border-color/50">
                <h3 className="font-serif text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-success" /> Prazo de Conclusão
                </h3>
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Data Final de Entrega do Projeto
                  </label>
                  <input
                    type="date"
                    value={localProject.deadline?.split('T')[0] || ''}
                    onChange={(e) => handleLocalChange('deadline', e.target.value || null)}
                    className={commonInputClass}
                    aria-label="Prazo final do projeto"
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    Esta data define o marco final no cronograma e serve como base para alertas de
                    atraso.
                  </p>
                </div>
              </div>

              <div className="bg-background/30 p-6 rounded-xl border border-border-color/50">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-xl font-bold text-secondary flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-warning" /> Adição de Prazos (Marcos)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddDeadline}
                    className="px-4 py-2 rounded-lg font-semibold text-sm text-primary-content bg-primary hover:bg-primary-focus flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" /> Adicionar Prazo
                  </button>
                </div>

                <div className="space-y-3">
                  {(localProject.additionalDeadlines || []).length === 0 && (
                    <div className="text-center py-8 text-text-secondary border-2 border-dashed border-border-color rounded-lg">
                      <p>Nenhum prazo intermediário definido.</p>
                    </div>
                  )}
                  {(localProject.additionalDeadlines || []).map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-4 bg-surface p-4 rounded-lg shadow-sm border border-border-color group hover:border-primary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                          Título do Marco
                        </label>
                        <input
                          value={d.title}
                          onChange={(e) => handleDeadlineChange(d.id, 'title', e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-base font-semibold text-text-primary p-0"
                          placeholder="Ex: Aprovação de Layout"
                          aria-label="Título do marco"
                        />
                      </div>
                      <div className="h-8 w-px bg-border-color"></div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                          Data
                        </label>
                        <input
                          type="date"
                          value={d.date.split('T')[0]}
                          onChange={(e) => handleDeadlineChange(d.id, 'date', e.target.value)}
                          className="bg-transparent border-none focus:ring-0 text-sm text-text-primary p-0"
                          aria-label="Data do marco"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeadline(d.id)}
                        className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 ml-2"
                        aria-label={`Remover prazo ${d.title}`}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gantt' && (
            <ProjectGanttTab
              sections={localProject.sections}
              onTaskUpdate={handleGanttTaskUpdate}
            />
          )}

          {activeTab === 'finance' && (
            <ProjectFinanceTab
              project={localProject}
              budgetServices={budgetServices}
              onFinancialsChange={handleFinancialsChange}
              onInstallmentChange={handleInstallmentChange}
              onGenerateInstallments={handleGenerateInstallments}
              onConfirmPayment={handleOpenConfirmPayment}
              onAddInstallment={handleAddInstallment}
              onRemoveInstallment={handleRemoveInstallment}
              onAddAddendum={handleAddAddendum}
              onUpdateAddendumStatus={handleUpdateAddendumStatus}
              onRemoveAddendum={handleRemoveAddendum}
            />
          )}

          {activeTab === 'quotations' && (
            <ProjectQuotationsTab
              project={localProject}
              allQuotations={quotations}
              onLink={() => setLinkModalOpen(true)}
              onUnlink={handleUnlinkQuotation}
            />
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-serif text-xl font-bold text-secondary">
                    Caderno de Anotações
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Registre reuniões, ideias e detalhes importantes.
                  </p>
                </div>
              </div>
              <textarea
                value={localProject.notes || ''}
                onChange={(e) => handleLocalChange('notes', e.target.value)}
                rows={20}
                placeholder="Escreva aqui..."
                className="w-full bg-surface p-6 rounded-xl border border-border-color focus:border-primary focus:ring-1 focus:ring-primary text-text-primary text-base leading-relaxed transition-all shadow-inner-soft resize-y"
                aria-label="Anotações do projeto"
              />
            </div>
          )}
        </div>
      </div>

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
