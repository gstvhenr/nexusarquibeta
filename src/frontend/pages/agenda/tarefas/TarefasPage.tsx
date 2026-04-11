import { useMemo, useState } from 'react';
import { useAutoReset } from '@/hooks/useAutoReset';
import { useDisclosure } from '@/hooks/useDisclosure';
import {
  ArchivedTasksView,
  EventFormModal,
  KanbanColumn,
  SubtaskDetailModal,
  TaskToast,
} from '@/components/agenda';
import { PageHeader } from '@/components/layout';
import {
  ArchiveIcon,
  Button,
  DeleteConfirmationModal,
  PlusIcon,
  UnarchiveIcon,
} from '@/components/ui';
import { NAV_LINKS } from '@/constants';
import { useSystemData } from '@/context/DataContext';
import type { AgendaEvent, KanbanStatus } from '@/types';
import {
  allSubtasksDone,
  archiveCompletedTask,
  isArchivedTask,
  KANBAN_COLUMNS,
  reactivateArchivedTask,
} from '@/utils/taskUtils';

const KANBAN_COLUMN_ACCENT_CLASS = {
  info: 'border-info',
  success: 'border-success',
  warning: 'border-warning',
  accent: 'border-warning',
  danger: 'border-error',
} as const;

function TarefasPage(): JSX.Element {
  const { agendaEvents, setAgendaEvents } = useSystemData();

  const taskModal = useDisclosure();
  const deleteModal = useDisclosure();
  const detailModal = useDisclosure();
  const [eventToEdit, setEventToEdit] = useState<AgendaEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<AgendaEvent | null>(null);
  const [eventToView, setEventToView] = useState<AgendaEvent | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [initialKanbanStatus, setInitialKanbanStatus] = useState<KanbanStatus>('todo');
  const [toast, setToast] = useAutoReset<string | null>(null, 3500);

  const showToast = (message: string) => {
    setToast(message);
  };

  const filteredTasks = useMemo(
    () =>
      agendaEvents
        .filter((event) => !event.isFinancialEvent)
        .map((event) => {
          const normalizedTask = !event.kanbanStatus
            ? { ...event, kanbanStatus: event.completed ? 'done' : ('todo' as KanbanStatus) }
            : event;

          return archiveCompletedTask(normalizedTask);
        })
        .filter((event) => isArchivedTask(event) === showArchived),
    [agendaEvents, showArchived],
  );

  const handleDragStart = (event: React.DragEvent, id: string) => {
    event.dataTransfer.setData('taskId', id);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent, newStatus: KanbanStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('taskId');
    const task = agendaEvents.find((current) => current.id === taskId);

    if (task && !allSubtasksDone(task)) {
      const currentStatus = task.kanbanStatus || 'todo';
      if (currentStatus !== newStatus) {
        showToast('Complete todas as subtarefas antes de mover esta tarefa para outra coluna.');
        return;
      }
    }

    setAgendaEvents((previous) =>
      previous.map((current) => {
        if (current.id === taskId) {
          const isCompleted = newStatus === 'done';
          return archiveCompletedTask({
            ...current,
            kanbanStatus: newStatus,
            completed: isCompleted,
            archived: isCompleted ? true : current.archived,
          });
        }
        return current;
      }),
    );

    if (newStatus === 'done') {
      showToast('Tarefa concluída e enviada para Arquivadas.');
    }
  };

  const handleSaveEvent = (event: AgendaEvent) => {
    const status = event.kanbanStatus || (event.completed ? 'done' : 'todo');
    const taskEvent: AgendaEvent = {
      ...event,
      type: event.type || 'Desenvolvimento de Projeto',
      kanbanStatus: status,
    };
    const normalizedTaskEvent = archiveCompletedTask(taskEvent);

    setAgendaEvents((previous) =>
      previous.find((current) => current.id === event.id)
        ? previous.map((current) => (current.id === event.id ? normalizedTaskEvent : current))
        : [...previous, normalizedTaskEvent],
    );

    taskModal.close();
  };

  const handleDeleteEvent = (id: string) => {
    setAgendaEvents((previous) => previous.filter((event) => event.id !== id));
    deleteModal.close();
    taskModal.close();
  };

  const handleSubtaskUpdate = (updated: AgendaEvent) => {
    setAgendaEvents((previous) =>
      previous.map((event) => (event.id === updated.id ? updated : event)),
    );
    setEventToView(updated);
  };

  const openAddModal = (targetStatus: KanbanStatus = 'todo') => {
    setEventToEdit(null);
    setInitialKanbanStatus(targetStatus);
    taskModal.open();
  };

  const openEditModal = (event: AgendaEvent) => {
    setEventToEdit(event);
    setInitialKanbanStatus(event.kanbanStatus || 'todo');
    taskModal.open();
  };

  const openDetailModal = (event: AgendaEvent) => {
    setEventToView(event);
    detailModal.open();
  };

  const confirmDelete = (event: AgendaEvent) => {
    setEventToDelete(event);
    deleteModal.open();
  };

  const pageIcon = NAV_LINKS.find((link) => link.label === 'Agenda')?.children?.find(
    (child) => child.label === 'Tarefas',
  )?.icon;

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <PageHeader title="Quadro de Tarefas" icon={pageIcon}>
        <div className="flex items-center gap-3">
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
            {showArchived ? 'Ver Ativas' : 'Ver Arquivadas'}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => openAddModal('todo')}
            className="flex items-center gap-2 hover:translate-y-px hover:shadow-none"
          >
            <PlusIcon className="w-5 h-5" /> Nova Tarefa
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 min-h-0 bg-transparent overflow-y-auto custom-scrollbar">
        {showArchived ? (
          <ArchivedTasksView
            tasks={filteredTasks}
            onOpenDetail={openDetailModal}
            onOpenEdit={openEditModal}
            onUnarchive={(task) =>
              setAgendaEvents((previous) =>
                previous.map((event) =>
                  event.id === task.id ? reactivateArchivedTask(event) : event,
                ),
              )
            }
            onDelete={confirmDelete}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full pb-2">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                status={column.id}
                title={column.title}
                accentColor={KANBAN_COLUMN_ACCENT_CLASS[column.tone]}
                tasks={filteredTasks.filter((task) => task.kanbanStatus === column.id)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onEdit={openEditModal}
                onViewDetails={openDetailModal}
                onDelete={confirmDelete}
                onAddToColumn={column.canAdd ? () => openAddModal(column.id) : undefined}
                onArchive={(task) =>
                  setAgendaEvents((previous) =>
                    previous.map((event) =>
                      event.id === task.id ? { ...event, archived: !event.archived } : event,
                    ),
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      <EventFormModal
        isOpen={taskModal.isOpen}
        onClose={taskModal.close}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={eventToEdit}
        dateForNewEvent={new Date()}
        initialKanbanStatus={initialKanbanStatus}
      />

      <SubtaskDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        task={eventToView}
        onUpdate={handleSubtaskUpdate}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={() => eventToDelete && handleDeleteEvent(eventToDelete.id)}
        itemName={eventToDelete?.title || ''}
        itemType="Tarefa"
      />

      {toast && <TaskToast message={toast} />}
    </div>
  );
}

export default TarefasPage;
