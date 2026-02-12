import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project, ProjectStatus, TaskPriority } from '../../types';
import { projectStatuses } from '../../types';
import { PROJECT_STATUS_COLORS } from '../../constants';
import { ArchiveIcon, UnarchiveIcon, CheckCircleIcon } from '../ui/icons';
import { getDeadlineInfo } from '../../utils/formatters';
import { calculateProjectProgress } from '../../services/dashboardService';

export const ProjectStatusSummaryPanel: React.FC<{ counts: Record<ProjectStatus, number> }> =
  React.memo(({ counts }) => (
    <div className="bg-surface rounded-xl shadow-soft p-5 mb-8 border border-border-color/20">
      <div className="flex flex-wrap justify-between items-center gap-y-6">
        {projectStatuses.map((status, index) => {
          const isLast = index === projectStatuses.length - 1;
          return (
            <React.Fragment key={status}>
              <div className="flex items-center gap-3 flex-1 min-w-[120px] justify-center sm:justify-start lg:justify-center px-2">
                <div
                  className={`p-2 rounded-lg shadow-sm ${PROJECT_STATUS_COLORS[status].bg} ${PROJECT_STATUS_COLORS[status].text}`}
                >
                  {React.cloneElement(
                    PROJECT_STATUS_COLORS[status].icon as React.ReactElement<{
                      className?: string;
                    }>,
                    { className: 'w-5 h-5' },
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold font-sans text-text-primary leading-none">
                    {counts[status] || 0}
                  </span>
                  <span className="text-xs font-semibold text-text-secondary mt-1 whitespace-nowrap">
                    {status}
                  </span>
                </div>
              </div>
              {!isLast && <div className="hidden lg:block w-px h-10 bg-border-color"></div>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  ));

export const ProjectListItem: React.FC<{
  project: Project;
  onArchive: (project: Project, archive: boolean) => void;
  onFinalize: (project: Project) => void;
}> = React.memo(({ project, onArchive, onFinalize }) => {
  const navigate = useNavigate();
  const { progress, completedCount, totalCount } = useMemo(
    () => calculateProjectProgress(project),
    [project],
  );
  const deadlineInfo = getDeadlineInfo(project.deadline);
  const color = PROJECT_STATUS_COLORS[project.status];

  const handleNavigate = () => navigate(`/projetos/${project.id}`);

  const getPriorityColor = (priority?: TaskPriority) => {
    switch (priority) {
      case 'Alta':
        return 'bg-error';
      case 'Média':
        return 'bg-warning';
      case 'Baixa':
        return 'bg-info';
      default:
        return null;
    }
  };

  const priorityColor = getPriorityColor(project.priority);

  return (
    <div
      onClick={handleNavigate}
      className={`bg-surface rounded-xl shadow-soft flex flex-col sm:flex-row sm:items-center p-5 transition-all duration-300 ease-in-out group relative cursor-pointer ${project.archived ? 'opacity-60 bg-background' : 'hover:shadow-lifted hover:ring-1 hover:ring-primary/50'}`}
    >
      {/* Main Info Section */}
      <div className="flex-1 min-w-0 pr-4 mb-4 sm:mb-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-lg text-text-primary group-hover:underline truncate">
            {project.name}
          </h3>
          {priorityColor && (
            <span
              className={`w-2.5 h-2.5 rounded-full ${priorityColor} ring-2 ring-surface`}
              title={`Prioridade: ${project.priority}`}
            ></span>
          )}
        </div>
        <p className="text-sm text-text-secondary font-medium truncate mb-3">
          {project.clientName}
        </p>

        {/* Progress Bar */}
        <div className="max-w-xs">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wide">
              Execução
            </span>
            <span className="text-[10px] font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <progress
            className="progress-bar progress-track-background progress-fill-primary progress-shadow-primary h-1.5 w-full rounded-full border border-border-color/50"
            value={progress}
            max={100}
          />
          {totalCount > 0 && (
            <p className="text-[10px] text-text-secondary mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {completedCount} de {totalCount} tarefas concluídas
            </p>
          )}
        </div>
      </div>

      {/* Status & Actions Section */}
      <div className="flex items-center justify-between sm:justify-end gap-6 sm:ml-auto border-t sm:border-t-0 border-border-color pt-3 sm:pt-0">
        <div className="text-left sm:text-right">
          <p className={`font-bold text-sm ${deadlineInfo.className}`}>{deadlineInfo.text}</p>
          <p className="text-[10px] text-text-secondary">Prazo Final</p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full min-w-[100px] text-center ${color.bg} ${color.text}`}
          >
            {project.status}
          </span>

          <div className="flex items-center gap-1">
            {project.archived ? (
              !project.inactivatedAt &&
              !project.finalizedAt && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(project, false);
                  }}
                  className="p-2 bg-background rounded-full text-text-secondary hover:text-secondary hover:bg-secondary/10 shadow-sm transition-colors"
                  aria-label="Desarquivar projeto"
                >
                  <UnarchiveIcon />
                </button>
              )
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFinalize(project);
                  }}
                  className="p-2 bg-background rounded-full text-text-secondary hover:text-success hover:bg-success/10 shadow-sm transition-colors"
                  title="Finalizar Projeto"
                >
                  <CheckCircleIcon />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(project, true);
                  }}
                  className="p-2 bg-background rounded-full text-text-secondary hover:text-secondary hover:bg-secondary/10 shadow-sm transition-colors"
                  title="Inativar Projeto"
                >
                  <ArchiveIcon />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
