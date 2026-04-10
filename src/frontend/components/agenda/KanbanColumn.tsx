import { IconButton, PlusIcon } from '@/components/ui';
import type { AgendaEvent, KanbanStatus } from '@/types';
import { TaskCard } from './TaskCard';

type KanbanColumnProps = {
  status: KanbanStatus;
  title: string;
  tasks: AgendaEvent[];
  onDragStart: (event: React.DragEvent, id: string) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent, status: KanbanStatus) => void;
  onEdit: (event: AgendaEvent) => void;
  onViewDetails: (event: AgendaEvent) => void;
  onDelete: (event: AgendaEvent) => void;
  onArchive: (event: AgendaEvent) => void;
  onAddToColumn?: () => void;
  accentColor: string;
};

export function KanbanColumn({
  status,
  title,
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
  onEdit,
  onViewDetails,
  onDelete,
  onArchive,
  onAddToColumn,
  accentColor,
}: KanbanColumnProps): JSX.Element {
  return (
    <div
      className="flex flex-col h-full bg-background/30 rounded-2xl border border-border-color/60 overflow-hidden backdrop-blur-sm transition-colors"
      onDragOver={onDragOver}
      onDrop={(event) => onDrop(event, status)}
    >
      <div
        className={`p-4 border-t-[4px] ${accentColor} bg-surface flex justify-between items-center shrink-0 shadow-sm z-10`}
      >
        <h3 className="font-bold text-text-primary text-xs lg:text-sm uppercase tracking-wider truncate pr-2">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="bg-background text-text-secondary text-xs px-2.5 py-0.5 rounded-full font-bold border border-border-color">
            {tasks.length}
          </span>
          {onAddToColumn && (
            <IconButton
              variant="primary"
              size="sm"
              onClick={onAddToColumn}
              aria-label={`Adicionar tarefa em "${title}"`}
              title={`Adicionar tarefa em "${title}"`}
            >
              <PlusIcon className="w-4 h-4" />
            </IconButton>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {tasks.map((task) => {
          return (
            <TaskCard
              key={task.id}
              task={task}
              isArchivedView={false}
              showArchiveButton={status === 'done'}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onDelete={onDelete}
              onArchiveToggle={onArchive}
              onDragStart={onDragStart}
            />
          );
        })}
        {tasks.length === 0 && (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-border-color/50 rounded-xl mx-1 mt-2">
            <p className="text-xs font-medium text-text-secondary/50">Vazio</p>
          </div>
        )}
      </div>
    </div>
  );
}
