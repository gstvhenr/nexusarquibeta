import React, { useState, useMemo, useCallback } from 'react';
import { PageHeader } from '../../components/layout';
import { Modal } from '../../components/ui';
import type { Project, ProjectStatus, ProjectSection, ProjectTask, Installment } from '../../types';
import { projectStatuses } from '../../types';
import { NAV_LINKS } from '../../constants';
import { useCoreData, useSystemData } from '../../context/DataContext';
import { agendaService } from '../../services/agendaService';
import { ProjectStatusSummaryPanel, ProjectListItem } from '../../components/projetos';
import { ArchiveIcon, UnarchiveIcon } from '../../components/ui';

const ProjetosPage: () => React.ReactNode = () => {
  const { projects, setProjects } = useCoreData();
  const { setAgendaEvents } = useSystemData();
  const [showArchived, setShowArchived] = useState(false);
  const [isFinalizeConfirmOpen, setFinalizeConfirmOpen] = useState(false);
  const [projectToFinalize, setProjectToFinalize] = useState<Project | null>(null);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const deadlineA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const deadlineB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return deadlineA - deadlineB;
    });
  }, [projects]);

  const projectsToDisplay = useMemo(
    () => sortedProjects.filter((p) => (p.archived || false) === showArchived),
    [sortedProjects, showArchived],
  );

  const projectCounts = useMemo(() => {
    const initialCounts = projectStatuses.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<ProjectStatus, number>,
    );
    return projects
      .filter((p) => !p.archived)
      .reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, initialCounts);
  }, [projects]);

  const handleArchive = useCallback(
    (project: Project, archive: boolean) => {
      const updatedProject = {
        ...project,
        archived: archive,
        status: archive ? 'Cancelado' : project.status,
        inactivatedAt: archive ? new Date().toISOString() : null,
      } as Project;
      setProjects((prev) => prev.map((p) => (p.id === project.id ? updatedProject : p)));
      setAgendaEvents((prevEvents) =>
        agendaService.syncProjectEventsWithAgenda(updatedProject, prevEvents),
      );
    },
    [setProjects, setAgendaEvents],
  );

  const handleFinalizeRequest = useCallback((project: Project) => {
    setProjectToFinalize(project);
    setFinalizeConfirmOpen(true);
  }, []);

  const handleFinalizeConfirm = useCallback(() => {
    if (!projectToFinalize) return;

    const finalizedProject = JSON.parse(JSON.stringify(projectToFinalize));

    finalizedProject.status = 'Concluído';
    finalizedProject.archived = true;
    finalizedProject.finalizedAt = new Date().toISOString();
    finalizedProject.inactivatedAt = null;

    finalizedProject.sections.forEach((section: ProjectSection) => {
      section.tasks.forEach((task: ProjectTask) => {
        task.completed = true;
      });
    });

    const now = new Date().toISOString();
    if (finalizedProject.financials) {
      if (finalizedProject.financials.paymentType === 'vista') {
        finalizedProject.financials.lumpSumStatus = 'Pago';
        finalizedProject.financials.lumpSumPaymentDate = now;
      } else if (
        finalizedProject.financials.paymentType === 'parcelado' &&
        finalizedProject.financials.installments
      ) {
        finalizedProject.financials.installments.forEach((inst: Installment) => {
          if (!inst.paid) {
            inst.paid = true;
            inst.paymentDate = now;
          }
        });
      }
    }

    setProjects((prev) => prev.map((p) => (p.id === finalizedProject.id ? finalizedProject : p)));
    setAgendaEvents((prevEvents) =>
      agendaService.syncProjectEventsWithAgenda(finalizedProject, prevEvents),
    );

    setFinalizeConfirmOpen(false);
    setProjectToFinalize(null);
  }, [projectToFinalize, setProjects, setAgendaEvents]);

  const projetosIcon = NAV_LINKS.find((link) => link.path === '/projetos')?.icon;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Projetos" icon={projetosIcon}>
        <button
          type="button"
          onClick={() => setShowArchived(!showArchived)}
          className="px-4 py-2 rounded-lg font-semibold text-text-primary bg-surface border border-border-color hover:bg-background transition-colors text-sm flex items-center gap-2"
        >
          {showArchived ? (
            <UnarchiveIcon className="w-4 h-4" />
          ) : (
            <ArchiveIcon className="w-4 h-4" />
          )}
          {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
        </button>
      </PageHeader>

      {!showArchived && <ProjectStatusSummaryPanel counts={projectCounts} />}

      <div className="space-y-2">
        {projectsToDisplay.map((p) => (
          <ProjectListItem
            key={p.id}
            project={p}
            onArchive={handleArchive}
            onFinalize={handleFinalizeRequest}
          />
        ))}
      </div>

      {projectsToDisplay.length === 0 && (
        <div className="p-10 bg-surface rounded-xl shadow-soft text-center mt-6">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 8.25V6ZM3.75 14.625A2.25 2.25 0 0 1 6 12.375h2.25A2.25 2.25 0 0 1 10.5 14.625v2.25A2.25 2.25 0 0 1 8.25 19.125H6A2.25 2.25 0 0 1 3.75 16.875v-2.25ZM13.5 6A2.25 2.25 0 0 1 15.75 3.75h2.25A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6Z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-text-primary">
            {showArchived ? 'Nenhum projeto arquivado' : 'Nenhum projeto encontrado'}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            {showArchived
              ? 'Você ainda não arquivou nenhum projeto.'
              : 'Converta uma proposta em projeto para começar.'}
          </p>
        </div>
      )}
      <Modal
        isOpen={isFinalizeConfirmOpen}
        onClose={() => setFinalizeConfirmOpen(false)}
        title="Finalizar o Projeto?"
      >
        <p className="text-text-primary mb-6">
          Tem certeza que deseja finalizar o projeto{' '}
          <strong className="font-semibold text-secondary">{projectToFinalize?.name}</strong>?
          <br />
          <br />
          Esta ação é permanente e irá:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Marcar todas as tarefas como concluídas.</li>
            <li>Quitar todos os pagamentos pendentes.</li>
            <li>Arquivar o projeto permanentemente.</li>
          </ul>
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setFinalizeConfirmOpen(false)}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleFinalizeConfirm}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-success hover:opacity-90 transition-colors"
          >
            Sim, Finalizar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjetosPage;
