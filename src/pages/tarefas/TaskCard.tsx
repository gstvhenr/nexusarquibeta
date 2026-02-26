import { ArchiveIcon, ClockIcon, EditIcon, TrashIcon, UnarchiveIcon } from '../../components/ui';
import type { AgendaEvent } from '../../types';
import { formatDateDayMonth } from '../../utils/formatters';
import { priorityConfig } from './taskUtils';

export type TaskCardProps = {
  task: AgendaEvent;
  isArchivedView?: boolean;
  showArchiveButton?: boolean;
  onViewDetails: (task: AgendaEvent) => void;
  onEdit: (task: AgendaEvent) => void;
  onDelete: (task: AgendaEvent) => void;
  onArchiveToggle?: (task: AgendaEvent) => void;
  onDragStart?: (event: React.DragEvent, id: string) => void;
};

export function TaskCard({
  task,
  isArchivedView = false,
  showArchiveButton = true,
  onViewDetails,
  onEdit,
  onDelete,
  onArchiveToggle,
  onDragStart,
}: TaskCardProps): JSX.Element {
  const style = priorityConfig[task.priority] || priorityConfig[3];
  const isOverdue = new Date(task.date) < new Date() && !task.completed;
  const subtasks = task.subtasks || [];
  const completedSubs = subtasks.filter((subtask) => subtask.completed).length;
  const hasSubtasks = subtasks.length > 0;

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart ? (event) => onDragStart(event, task.id) : undefined}
      onClick={() => onViewDetails(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewDetails(task);
        }
      }}
      role="button"
      tabIndex={0}
      className={`
        relative group p-4 rounded-xl shadow-sm border cursor-pointer
        transition-all duration-300 hover:shadow-md hover:scale-[1.02]
        ${style.bg} ${style.border}
        ${isArchivedView ? 'opacity-75 hover:opacity-100' : task.completed ? 'opacity-60 grayscale-[0.5]' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-surface/50 ${style.text}`}
        >
          {style.label}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onEdit(task);
            }}
            className="p-1 text-text-secondary/60 hover:text-primary hover:bg-primary/10 rounded-full transition-all -mt-1 -mr-1"
            title="Editar Tarefa"
          >
            <EditIcon className="w-3.5 h-3.5" />
          </button>

          {showArchiveButton && onArchiveToggle && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onArchiveToggle(task);
              }}
              className="p-1 text-text-secondary/60 hover:text-secondary hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors -mt-1 -mr-1"
              title={task.archived ? 'Desarquivar' : 'Arquivar'}
            >
              {task.archived ? (
                <UnarchiveIcon className="w-4 h-4" />
              ) : (
                <ArchiveIcon className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      <div>
        <h4
          className={`font-semibold text-sm text-text-primary mb-1.5 line-clamp-3 leading-snug ${!isArchivedView && task.completed ? 'line-through text-text-secondary' : ''}`}
        >
          {task.title}
        </h4>

        {task.projectName && (
          <div className="mb-3">
            <span className="text-[10px] font-semibold text-text-secondary bg-surface/60 px-2 py-1 rounded border border-border-color inline-block max-w-full truncate">
              {task.projectName}
            </span>
          </div>
        )}

        {hasSubtasks && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${completedSubs === subtasks.length ? 'bg-emerald-500' : 'bg-primary/70'}`}
                  style={{
                    width: `${(completedSubs / subtasks.length) * 100}%`,
                  }}
                />
              </div>
              <span
                className={`text-[10px] font-bold tabular-nums ${completedSubs === subtasks.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-secondary'}`}
              >
                {completedSubs}/{subtasks.length}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-text-secondary mt-3 pt-3 border-t border-black/5 dark:border-white/5 border-dashed">
          <span
            className={`flex items-center gap-1.5 font-medium ${!isArchivedView && isOverdue ? 'text-error' : ''}`}
          >
            <ClockIcon className="w-3.5 h-3.5" />
            {formatDateDayMonth(task.date)}
            {task.time && <span className="ml-1 text-text-secondary/70">• {task.time}</span>}
          </span>

          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete(task);
            }}
            className="p-1.5 text-text-secondary/60 hover:text-error hover:bg-error/10 rounded-full transition-all"
            title="Excluir Tarefa"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
