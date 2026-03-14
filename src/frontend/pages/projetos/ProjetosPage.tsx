import React, { useState, useMemo, useCallback } from 'react';
import { PageHeader } from '../../components/layout';
import { Button, Modal, EmptyState } from '../../components/ui';
import type { Project, ProjectStatus, ProjectSection, ProjectTask, Installment } from '../../types';
import { projectStatuses } from '../../types';
import { NAV_LINKS } from '../../constants';
import { useCoreData, useSystemData } from '../../context/DataContext';
import { useDisclosure } from '../../hooks/useDisclosure';
import { agendaService } from '../../services/agendaService';
import { ProjectStatusSummaryPanel, ProjectListItem } from '../../components/projetos';
import { ArchiveIcon, UnarchiveIcon } from '../../components/ui';

const ProjetosPage: () => React.ReactNode = () => {
  const { projects, setProjects } = useCoreData();
  const { setAgendaEvents } = useSystemData();
  const [showArchived, setShowArchived] = useState(false);
  const finalizeConfirm = useDisclosure();
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

  const handleFinalizeRequest = useCallback(
    (project: Project) => {
      setProjectToFinalize(project);
      finalizeConfirm.open();
    },
    [finalizeConfirm],
  );

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

    finalizeConfirm.close();
    setProjectToFinalize(null);
  }, [projectToFinalize, setProjects, setAgendaEvents, finalizeConfirm]);

  const projetosIcon = NAV_LINKS.find((link) => link.path === '/projetos')?.icon;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Projetos" icon={projetosIcon}>
        <Button
          variant="secondary"
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center gap-2"
        >
          {showArchived ? (
            <UnarchiveIcon className="w-4 h-4" />
          ) : (
            <ArchiveIcon className="w-4 h-4" />
          )}
          {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
        </Button>
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
        <EmptyState
          title={showArchived ? 'Nenhum projeto arquivado' : 'Nenhum projeto encontrado'}
          description={
            showArchived
              ? 'Você ainda não arquivou nenhum projeto.'
              : 'Converta uma proposta em projeto para começar.'
          }
          className="mt-6"
        />
      )}
      <Modal
        isOpen={finalizeConfirm.isOpen}
        onClose={finalizeConfirm.close}
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
          <Button variant="secondary" onClick={finalizeConfirm.close}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleFinalizeConfirm}>
            Sim, Finalizar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjetosPage;
