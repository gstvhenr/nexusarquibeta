import {
  ArchiveIcon,
  ClockIcon,
  EditIcon,
  IconButton,
  TrashIcon,
  UnarchiveIcon,
} from '@/components/ui';
import type { AgendaEvent } from '@/types';
import { formatDateDayMonth } from '@/utils/formatters';
import { priorityConfig } from '@/utils/taskUtils';

type TaskCardProps = {
  task: AgendaEvent;
  isArchivedView?: boolean;
  showArchiveButton?: boolean;
  onViewDetails: (task: AgendaEvent) => void;
  onEdit: (task: AgendaEvent) => void;
  onDelete: (task: AgendaEvent) => void;
  onArchiveToggle?: (task: AgendaEvent) => void;
  onDragStart?: (event: React.DragEvent, id: string) => void;
};

type TaskTone = (typeof priorityConfig)[number]['tone'];

const TASK_TONE_CLASS: Record<TaskTone, { card: string; pill: string }> = {
  info: {
    card: 'bg-info/10 border-info/20 dark:bg-info/10 dark:border-info/20',
    pill: 'bg-surface/50 text-info dark:text-info',
  },
  success: {
    card: 'bg-success/10 border-success/20 dark:bg-success/10 dark:border-success/20',
    pill: 'bg-surface/50 text-success dark:text-success',
  },
  warning: {
    card: 'bg-warning/10 border-warning/20 dark:bg-warning/10 dark:border-warning/20',
    pill: 'bg-surface/50 text-warning dark:text-warning',
  },
  accent: {
    card: 'bg-warning/15 border-warning/25 dark:bg-warning/12 dark:border-warning/20',
    pill: 'bg-surface/50 text-warning dark:text-warning',
  },
  danger: {
    card: 'bg-error/10 border-error/20 dark:bg-error/10 dark:border-error/20',
    pill: 'bg-surface/50 text-error dark:text-error',
  },
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
  const priority = priorityConfig[task.priority] || priorityConfig[3];
  const toneClass = TASK_TONE_CLASS[priority.tone];
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
        ${toneClass.card}
        ${isArchivedView ? 'opacity-75 hover:opacity-100' : task.completed ? 'opacity-60 grayscale-[0.5]' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${toneClass.pill}`}
        >
          {priority.label}
        </span>
        <div className="flex items-center gap-1">
          <IconButton
            variant="primary"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(task);
            }}
            aria-label="Editar Tarefa"
            title="Editar Tarefa"
            className="-mt-1 -mr-1"
          >
            <EditIcon className="w-3.5 h-3.5" />
          </IconButton>

          {showArchiveButton && onArchiveToggle && (
            <IconButton
              variant="secondary"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onArchiveToggle(task);
              }}
              aria-label={task.archived ? 'Desarquivar' : 'Arquivar'}
              title={task.archived ? 'Desarquivar' : 'Arquivar'}
              className="-mt-1 -mr-1"
            >
              {task.archived ? (
                <UnarchiveIcon className="w-4 h-4" />
              ) : (
                <ArchiveIcon className="w-4 h-4" />
              )}
            </IconButton>
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
                  className={`h-full rounded-full transition-all duration-500 ease-out ${completedSubs === subtasks.length ? 'bg-success' : 'bg-primary/70'}`}
                  style={{
                    width: `${(completedSubs / subtasks.length) * 100}%`,
                  }}
                />
              </div>
              <span
                className={`text-[10px] font-bold tabular-nums ${completedSubs === subtasks.length ? 'text-success dark:text-success' : 'text-text-secondary'}`}
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

          <IconButton
            variant="danger"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(task);
            }}
            aria-label="Excluir Tarefa"
            title="Excluir Tarefa"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
