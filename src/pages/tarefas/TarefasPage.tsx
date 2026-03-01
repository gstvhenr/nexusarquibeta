import { useMemo, useState } from 'react';
import { useAutoReset } from '../../hooks/useAutoReset';
import { EventFormModal, SubtaskDetailModal } from '../../components/agenda';
import { PageHeader } from '../../components/layout';
import { ArchiveIcon, DeleteConfirmationModal, PlusIcon, UnarchiveIcon } from '../../components/ui';
import { NAV_LINKS } from '../../constants';
import { useSystemData } from '../../context/DataContext';
import type { AgendaEvent, KanbanStatus } from '../../types';
import { ArchivedTasksView } from './ArchivedTasksView';
import { KanbanColumn } from './KanbanColumn';
import { TaskToast } from './TaskToast';
import { allSubtasksDone, KANBAN_COLUMNS } from './taskUtils';

function TarefasPage(): JSX.Element {
  const { agendaEvents, setAgendaEvents } = useSystemData();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
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
          if (!event.kanbanStatus) {
            return { ...event, kanbanStatus: event.completed ? 'done' : ('todo' as KanbanStatus) };
          }
          return event;
        })
        .filter((event) => (event.archived || false) === showArchived),
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
          return { ...current, kanbanStatus: newStatus, completed: isCompleted };
        }
        return current;
      }),
    );
  };

  const handleSaveEvent = (event: AgendaEvent) => {
    const status = event.kanbanStatus || (event.completed ? 'done' : 'todo');
    const taskEvent: AgendaEvent = {
      ...event,
      type: event.type || 'Desenvolvimento de Projeto',
      kanbanStatus: status,
    };

    setAgendaEvents((previous) =>
      previous.find((current) => current.id === event.id)
        ? previous.map((current) => (current.id === event.id ? taskEvent : current))
        : [...previous, taskEvent],
    );

    setModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setAgendaEvents((previous) => previous.filter((event) => event.id !== id));
    setDeleteModalOpen(false);
    setModalOpen(false);
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
    setModalOpen(true);
  };

  const openEditModal = (event: AgendaEvent) => {
    setEventToEdit(event);
    setInitialKanbanStatus(event.kanbanStatus || 'todo');
    setModalOpen(true);
  };

  const openDetailModal = (event: AgendaEvent) => {
    setEventToView(event);
    setDetailModalOpen(true);
  };

  const confirmDelete = (event: AgendaEvent) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const pageIcon = NAV_LINKS.find((link) => link.label === 'Agenda')?.children?.find(
    (child) => child.label === 'Tarefas',
  )?.icon;

  return (
    <div className="animate-fade-in-up h-full flex flex-col px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6">
      <PageHeader title="Quadro de Tarefas" icon={pageIcon}>
        <div className="flex items-center gap-3">
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
            {showArchived ? 'Ver Ativas' : 'Ver Arquivadas'}
          </button>
          <button
            onClick={() => openAddModal('todo')}
            className="px-5 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center gap-2 transition-colors text-sm hover:translate-y-px hover:shadow-none"
          >
            <PlusIcon className="w-5 h-5" /> Nova Tarefa
          </button>
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
                  event.id === task.id ? { ...event, archived: false } : event,
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
                accentColor={column.color}
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
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={eventToEdit}
        dateForNewEvent={new Date()}
        initialKanbanStatus={initialKanbanStatus}
      />

      <SubtaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        task={eventToView}
        onUpdate={handleSubtaskUpdate}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => eventToDelete && handleDeleteEvent(eventToDelete.id)}
        itemName={eventToDelete?.title || ''}
        itemType="Tarefa"
      />

      {toast && <TaskToast message={toast} />}
    </div>
  );
}

export default TarefasPage;
