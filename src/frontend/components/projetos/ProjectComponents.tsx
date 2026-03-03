import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project, ProjectStatus, TaskPriority } from '../../types';
import { projectStatuses } from '../../types';
import { PROJECT_STATUS_COLORS } from '../../constants';
import { ArchiveIcon, UnarchiveIcon, CheckCircleIcon } from '../ui/icons';
import { IconButton } from '../ui';
import { getDeadlineInfo } from '../../utils/formatters';
import { calculateProjectProgress } from '../../services/dashboardService';

export const ProjectStatusSummaryPanel: (props: {
  counts: Record<ProjectStatus, number>;
}) => React.ReactNode = React.memo(({ counts }) => (
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

export const ProjectListItem: (props: {
  project: Project;
  onArchive: (project: Project, archive: boolean) => void;
  onFinalize: (project: Project) => void;
}) => React.ReactNode = React.memo(({ project, onArchive, onFinalize }) => {
  const navigate = useNavigate();
  const { progress, completedCount, totalCount } = useMemo(
    () => calculateProjectProgress(project),
    [project],
  );
  const deadlineInfo = getDeadlineInfo(project.deadline, project.status === 'Concluído');
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
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNavigate();
        }
      }}
      role="button"
      tabIndex={0}
      className={`bg-surface rounded-xl shadow-soft flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 gap-3 sm:gap-4 transition-all duration-300 ease-in-out group relative cursor-pointer ${project.archived ? 'opacity-60 bg-background' : 'hover:shadow-lifted hover:ring-1 hover:ring-primary/50'}`}
    >
      {/* Main Info Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-bold text-base text-text-primary group-hover:underline truncate">
              {project.name}
            </h3>
            {priorityColor && (
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColor} ring-2 ring-surface`}
                title={`Prioridade: ${project.priority}`}
              ></span>
            )}
          </div>
          {/* Status badge for mobile */}
          <span
            className={`sm:hidden px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap ${color.bg} ${color.text}`}
          >
            {project.status}
          </span>
        </div>

        <p className="text-xs text-text-secondary font-medium truncate mb-2">
          {project.clientName}
        </p>

        {/* Progress Bar (Compact Inline) */}
        <div className="max-w-md flex items-center gap-3">
          <div className="flex-1">
            <progress
              className="progress-bar progress-track-background progress-fill-primary progress-shadow-primary h-1 w-full rounded-full border border-border-color/50"
              value={progress}
              max={100}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] font-bold text-primary">{Math.round(progress)}%</span>
            {totalCount > 0 && (
              <span className="text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:inline-block">
                ({completedCount}/{totalCount})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status & Actions Section */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:ml-auto border-t sm:border-t-0 border-border-color pt-3 sm:pt-0 shrink-0">
        <div className="text-left sm:text-right">
          <p className={`font-bold text-xs ${deadlineInfo.className}`}>{deadlineInfo.text}</p>
          <p className="text-[9px] uppercase tracking-wider text-text-secondary mt-0.5">
            Prazo Final
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status badge for desktop */}
          <span
            className={`hidden sm:block px-2.5 py-1 text-[11px] font-bold rounded-full min-w-[90px] text-center ${color.bg} ${color.text}`}
          >
            {project.status}
          </span>

          <div className="flex items-center gap-1">
            {project.archived ? (
              !project.inactivatedAt &&
              !project.finalizedAt && (
                <IconButton
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(project, false);
                  }}
                  aria-label="Desarquivar projeto"
                  className="bg-background shadow-sm"
                >
                  <UnarchiveIcon className="w-4 h-4" />
                </IconButton>
              )
            ) : (
              <>
                <IconButton
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFinalize(project);
                  }}
                  aria-label="Finalizar Projeto"
                  title="Finalizar Projeto"
                  className="bg-background shadow-sm hover:text-success hover:bg-success/10"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                </IconButton>
                <IconButton
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(project, true);
                  }}
                  aria-label="Inativar Projeto"
                  title="Inativar Projeto"
                  className="bg-background shadow-sm"
                >
                  <ArchiveIcon className="w-4 h-4" />
                </IconButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
