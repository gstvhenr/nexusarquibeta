import { ArchiveIcon } from '@/components/ui';
import type { AgendaEvent } from '@/types';
import { TaskCard } from './TaskCard';

type ArchivedTasksViewProps = {
  tasks: AgendaEvent[];
  onOpenDetail: (task: AgendaEvent) => void;
  onOpenEdit: (task: AgendaEvent) => void;
  onUnarchive: (task: AgendaEvent) => void;
  onDelete: (task: AgendaEvent) => void;
};

export function ArchivedTasksView({
  tasks,
  onOpenDetail,
  onOpenEdit,
  onUnarchive,
  onDelete,
}: ArchivedTasksViewProps): JSX.Element {
  return (
    <div className="bg-background/30 rounded-2xl border border-border-color/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <ArchiveIcon className="w-5 h-5 text-text-secondary" />
        <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">
          Tarefas Arquivadas
        </h3>
        <span className="bg-background text-text-secondary text-xs px-2.5 py-0.5 rounded-full font-bold border border-border-color">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-border-color/50 rounded-xl">
          <ArchiveIcon className="w-8 h-8 text-text-secondary/30 mb-2" />
          <p className="text-sm font-medium text-text-secondary/50">Nenhuma tarefa arquivada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isArchivedView={true}
              showArchiveButton={true}
              onViewDetails={onOpenDetail}
              onEdit={onOpenEdit}
              onDelete={onDelete}
              onArchiveToggle={onUnarchive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
