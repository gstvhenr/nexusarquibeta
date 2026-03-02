import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { agendaService } from '../../../services/agendaService';
import type { AgendaEvent, ManualIncome, ProfessionalExpense, Project } from '../../../types';
import type { ProjectActionType } from '../../../components/projetos';

interface UseProjectLifecycleActionsParams {
  localProject: Project | null;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setAgendaEvents: React.Dispatch<React.SetStateAction<AgendaEvent[]>>;
  navigate: NavigateFunction;
  manualExpenses: ProfessionalExpense[];
  setManualExpenses: React.Dispatch<React.SetStateAction<ProfessionalExpense[]>>;
  setManualIncomes: React.Dispatch<React.SetStateAction<ManualIncome[]>>;
  setLocalProject: React.Dispatch<React.SetStateAction<Project | null>>;
}

export function useProjectLifecycleActions({
  localProject,
  setProjects,
  setAgendaEvents,
  navigate,
  manualExpenses,
  setManualExpenses,
  setManualIncomes,
  setLocalProject,
}: UseProjectLifecycleActionsParams) {
  const [isActionModalOpen, setActionModalOpen] = useState(false);
  const [currentActionType, setCurrentActionType] = useState<ProjectActionType>('inactivate');

  const handleActionRequest = (type: ProjectActionType) => {
    setCurrentActionType(type);
    setActionModalOpen(true);
  };

  const handleExecuteAction = (refundAmount: number, refundDate: string) => {
    if (!localProject) {
      return;
    }

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
      setManualExpenses((previous) => [refundExpense, ...previous]);
    }

    if (currentActionType === 'delete') {
      setProjects((previous) => previous.filter((project) => project.id !== localProject.id));
      setAgendaEvents((previous) =>
        agendaService.syncProjectEventsWithAgenda(null, previous, localProject.id),
      );
      navigate('/projetos');
    } else if (currentActionType === 'inactivate') {
      const inactivatedProject: Project = {
        ...localProject,
        status: 'Cancelado',
        archived: true,
        inactivatedAt: new Date().toISOString(),
      };
      setProjects((previous) =>
        previous.map((project) =>
          project.id === inactivatedProject.id ? inactivatedProject : project,
        ),
      );
      setAgendaEvents((previous) =>
        agendaService.syncProjectEventsWithAgenda(inactivatedProject, previous),
      );
      navigate('/projetos');
    } else if (currentActionType === 'finalize') {
      const finalizedProject = JSON.parse(JSON.stringify(localProject)) as Project;
      finalizedProject.status = 'Concluído';
      finalizedProject.archived = true;
      finalizedProject.finalizedAt = new Date().toISOString();

      finalizedProject.sections.forEach((section) => {
        section.tasks.forEach((task) => {
          task.completed = true;
        });
      });

      if (finalizedProject.financials) {
        if (finalizedProject.financials.paymentType === 'vista') {
          finalizedProject.financials.lumpSumStatus = 'Pago';
          finalizedProject.financials.lumpSumPaymentDate = new Date().toISOString();
        } else if (finalizedProject.financials.paymentType === 'parcelado') {
          finalizedProject.financials.installments?.forEach((installment) => {
            if (!installment.paid) {
              installment.paid = true;
              installment.paymentDate = new Date().toISOString();
            }
          });
        }
      }

      setProjects((previous) =>
        previous.map((project) =>
          project.id === finalizedProject.id ? finalizedProject : project,
        ),
      );
      setAgendaEvents((previous) =>
        agendaService.syncProjectEventsWithAgenda(finalizedProject, previous),
      );
      navigate('/projetos');
    }

    setActionModalOpen(false);
  };

  const handleReactivate = () => {
    if (!localProject) {
      return;
    }

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

          setManualIncomes((previous) => [...reversalIncomes, ...previous]);
          setManualExpenses((previous) =>
            previous.map((expense) =>
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

      setProjects((previous) =>
        previous.map((project) =>
          project.id === reactivatedProject.id ? reactivatedProject : project,
        ),
      );
      setAgendaEvents((previous) =>
        agendaService.syncProjectEventsWithAgenda(reactivatedProject, previous),
      );
      setLocalProject(reactivatedProject);
    }
  };

  return {
    isActionModalOpen,
    setActionModalOpen,
    currentActionType,
    handleActionRequest,
    handleExecuteAction,
    handleReactivate,
  };
}
