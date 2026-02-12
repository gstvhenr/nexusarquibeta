import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout';
import { useData } from '../context/DataContext';
import { NAV_LINKS } from '../constants';
import { AgendaEvent, KanbanStatus } from '../types';
import { EventFormModal } from '../components/agenda';
import { DeleteConfirmationModal } from '../components/ui';
import {
  PlusIcon,
  ClockIcon,
  TrashIcon,
  EditIcon,
  ArchiveIcon,
  UnarchiveIcon,
} from '../components/ui';
import { formatDateDayMonth } from '../utils/formatters';

// --- STYLING CONFIG ---
// Enhanced Priority Colors with Subtle Backgrounds
const priorityConfig: Record<number, { label: string; bg: string; text: string; border: string }> =
  {
    1: {
      label: 'Opcional',
      bg: 'bg-sky-50 dark:bg-sky-900/10',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200 dark:border-sky-800',
    },
    2: {
      label: 'Baixa',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    3: {
      label: 'Média',
      bg: 'bg-yellow-50 dark:bg-yellow-900/10',
      text: 'text-yellow-700 dark:text-yellow-300',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
    4: {
      label: 'Alta',
      bg: 'bg-orange-50 dark:bg-orange-900/10',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
    },
    5: {
      label: 'Crítica',
      bg: 'bg-red-50 dark:bg-red-900/10',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
    },
  };

const KanbanColumn: React.FC<{
  status: KanbanStatus;
  title: string;
  tasks: AgendaEvent[];
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: KanbanStatus) => void;
  onEdit: (event: AgendaEvent) => void;
  onDelete: (event: AgendaEvent) => void;
  onArchive: (event: AgendaEvent) => void;
  accentColor: string;
}> = ({
  status,
  title,
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
  onEdit,
  onDelete,
  onArchive,
  accentColor,
}) => {
  return (
    <div
      className="flex flex-col h-full bg-background/30 rounded-2xl border border-border-color/60 overflow-hidden backdrop-blur-sm transition-colors"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Header */}
      <div
        className={`p-4 border-t-[4px] ${accentColor} bg-surface flex justify-between items-center shrink-0 shadow-sm z-10`}
      >
        <h3 className="font-bold text-text-primary text-xs lg:text-sm uppercase tracking-wider truncate pr-2">
          {title}
        </h3>
        <span className="bg-background text-text-secondary text-xs px-2.5 py-0.5 rounded-full font-bold border border-border-color">
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {tasks.map((task) => {
          const style = priorityConfig[task.priority] || priorityConfig[3];
          const isOverdue = new Date(task.date) < new Date() && !task.completed;

          return (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => onDragStart(e, task.id)}
              onClick={() => onEdit(task)}
              className={`
                                relative group p-4 rounded-xl shadow-sm border cursor-grab active:cursor-grabbing 
                                transition-all duration-300 hover:shadow-md hover:scale-[1.02]
                                ${style.bg} ${style.border}
                                ${task.completed ? 'opacity-60 grayscale-[0.5]' : ''}
                            `}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-surface/50 ${style.text}`}
                >
                  {style.label}
                </span>
                {status === 'done' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(task);
                    }}
                    className="text-text-secondary hover:text-secondary p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors -mt-1 -mr-1"
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

              <div>
                <h4
                  className={`font-semibold text-sm text-text-primary mb-1.5 line-clamp-3 leading-snug ${task.completed ? 'line-through text-text-secondary' : ''}`}
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

                <div className="flex items-center justify-between text-xs text-text-secondary mt-3 pt-3 border-t border-black/5 dark:border-white/5 border-dashed">
                  <span
                    className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-error' : ''}`}
                  >
                    <ClockIcon className="w-3.5 h-3.5" />
                    {formatDateDayMonth(task.date)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-text-secondary hover:text-error hover:bg-error/10 rounded-full transition-all"
                    title="Excluir Tarefa"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
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
};

const TarefasPage: React.FC = () => {
  const { agendaEvents, setAgendaEvents } = useData();

  // Modal & Selection State
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<AgendaEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<AgendaEvent | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // --- LOGIC ---

  const filteredTasks = useMemo(() => {
    return agendaEvents
      .filter((e) => !e.isFinancialEvent)
      .map((e) => {
        if (!e.kanbanStatus) {
          return { ...e, kanbanStatus: e.completed ? 'done' : ('todo' as KanbanStatus) };
        }
        return e;
      })
      .filter((e) => (e.archived || false) === showArchived);
  }, [agendaEvents, showArchived]);

  // --- KANBAN LOGIC ---
  const columns: { id: KanbanStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'A Fazer', color: 'border-sky-400' },
    { id: 'in_progress', title: 'Em Andamento', color: 'border-yellow-400' },
    { id: 'review', title: 'Aguardando Retorno', color: 'border-purple-400' },
    { id: 'done', title: 'Concluído', color: 'border-emerald-400' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: KanbanStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setAgendaEvents((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const isCompleted = newStatus === 'done';
          return { ...task, kanbanStatus: newStatus, completed: isCompleted };
        }
        return task;
      }),
    );
  };

  // --- COMMON ACTIONS ---
  const handleSaveEvent = (event: AgendaEvent) => {
    const status = event.kanbanStatus || (event.completed ? 'done' : 'todo');
    const taskEvent: AgendaEvent = {
      ...event,
      type: event.type || 'Desenvolvimento de Projeto',
      kanbanStatus: status,
    };
    setAgendaEvents((prev) =>
      prev.find((e) => e.id === event.id)
        ? prev.map((e) => (e.id === event.id ? taskEvent : e))
        : [...prev, taskEvent],
    );
    setModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setAgendaEvents((prev) => prev.filter((e) => e.id !== id));
    setDeleteModalOpen(false);
    setModalOpen(false);
  };

  const openAddModal = () => {
    setEventToEdit(null);
    setModalOpen(true);
  };
  const openEditModal = (event: AgendaEvent) => {
    setEventToEdit(event);
    setModalOpen(true);
  };
  const confirmDelete = (event: AgendaEvent) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const pageIcon = NAV_LINKS.find((link) => link.label === 'Agenda')?.children?.find(
    (c) => c.label === 'Tarefas',
  )?.icon;

  return (
    <div className="animate-fade-in-up h-full flex flex-col p-6">
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
            onClick={openAddModal}
            className="px-5 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center gap-2 transition-colors text-sm hover:translate-y-px hover:shadow-none"
          >
            <PlusIcon className="w-5 h-5" /> Nova Tarefa
          </button>
        </div>
      </PageHeader>

      <div className="flex-1 min-h-0 bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full pb-2">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              status={col.id}
              title={col.title}
              accentColor={col.color}
              tasks={filteredTasks.filter((t) => t.kanbanStatus === col.id)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onEdit={openEditModal}
              onDelete={confirmDelete}
              onArchive={(t) =>
                setAgendaEvents((prev) =>
                  prev.map((e) => (e.id === t.id ? { ...e, archived: !e.archived } : e)),
                )
              }
            />
          ))}
        </div>
      </div>

      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={(id) => handleDeleteEvent(id)}
        event={eventToEdit}
        dateForNewEvent={new Date()}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => eventToDelete && handleDeleteEvent(eventToDelete.id)}
        itemName={eventToDelete?.title || ''}
        itemType="Tarefa"
      />
    </div>
  );
};

export default TarefasPage;
