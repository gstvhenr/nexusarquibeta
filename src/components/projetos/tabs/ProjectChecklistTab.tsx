import React, { useState, useEffect } from 'react';
import {
  ChevronDownIcon,
  CheckCircleIcon,
  ClockIcon,
  TrashIcon,
  PlusIcon,
  UserCircleIcon,
  PencilIcon,
} from '../../ui/icons';
import { ProjectSection, ProjectTask } from '../../../types';
import { getDeadlineInfo } from '../../../utils/formatters';

interface ChecklistTabProps {
  sections: ProjectSection[];
  onSectionChange: (sectionId: string, field: 'name', value: string) => void;
  onTaskChange: (
    sectionId: string,
    taskId: string,
    field: 'name' | 'hours' | 'completed' | 'status',
    value: any,
  ) => void;
  onAddSection: () => void;
  onRemoveSection: (sectionId: string) => void;
  onAddTask: (sectionId: string) => void;
  onRemoveTask: (sectionId: string, taskId: string) => void;
  onEditTaskDetails: (sectionId: string, task: ProjectTask) => void;
}

export const ProjectChecklistTab: React.FC<ChecklistTabProps> = ({
  sections,
  onSectionChange,
  onTaskChange,
  onAddSection,
  onRemoveSection,
  onAddTask,
  onRemoveTask,
  onEditTaskDetails,
}) => {
  // State to track which sections (phases) are open/expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Toggle function for sections
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Open all sections by default on first load if they are few
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    sections.forEach((s, index) => {
      initialState[s.id] = index === 0 || sections.length <= 2;
    });
    if (Object.keys(expandedSections).length === 0 && sections.length > 0) {
      setExpandedSections(initialState);
    }
  }, [sections.length]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-secondary">Etapas do Projeto</h3>
          <p className="text-sm text-text-secondary">
            Organize seu projeto em fases (ex: Preliminar, Executivo) para manter o controle.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddSection}
          className="px-4 py-2 text-sm font-semibold bg-primary text-primary-content rounded-lg hover:bg-primary-focus shadow-soft transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" /> Nova Etapa
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border-2 border-dashed border-border-color">
          <div className="w-16 h-16 mx-auto text-text-secondary/30 mb-4 flex items-center justify-center border-2 border-current rounded-lg border-dashed">
            <PlusIcon className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-semibold text-text-primary">Nenhuma etapa definida</h4>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Comece adicionando a primeira fase do seu projeto (ex: "Levantamento" ou "Estudo
            Preliminar").
          </p>
          <button
            type="button"
            onClick={onAddSection}
            className="px-6 py-2 bg-secondary text-secondary-content rounded-lg font-semibold hover:bg-secondary-focus transition-colors"
          >
            Criar Primeira Etapa
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => {
            const totalHours = section.tasks.reduce(
              (sum, task) => sum + (Number(task.hours) || 0),
              0,
            );
            const completedTasks = section.tasks.filter((t) => t.completed).length;
            const totalTasks = section.tasks.length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            const isExpanded = expandedSections[section.id];

            return (
              <div
                key={section.id}
                className="bg-surface rounded-xl shadow-soft border border-border-color/50 overflow-hidden transition-all duration-300"
              >
                {/* Section Header */}
                <div
                  className="p-4 bg-background/30 flex items-center gap-4 cursor-pointer select-none hover:bg-background/60 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div
                    className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-primary/10 text-primary' : 'bg-surface text-text-secondary'}`}
                  >
                    <ChevronDownIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-1">
                      <input
                        value={section.name}
                        onChange={(e) => onSectionChange(section.id, 'name', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="font-serif text-lg font-bold text-secondary bg-transparent border-none p-0 focus:ring-0 hover:text-primary transition-colors w-full md:w-auto"
                        placeholder="Nome da Etapa"
                        aria-label="Nome da etapa"
                      />
                      <div className="flex items-center gap-3 text-xs font-medium text-text-secondary">
                        <span className="flex items-center gap-1 bg-surface px-2 py-1 rounded border border-border-color">
                          <CheckCircleIcon className="w-3 h-3 text-success" /> {completedTasks}/
                          {totalTasks} tarefas
                        </span>
                        {totalHours > 0 && (
                          <span className="flex items-center gap-1 bg-surface px-2 py-1 rounded border border-border-color">
                            <ClockIcon className="w-3 h-3 text-warning" /> {totalHours}h estimadas
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Gradient Progress Bar for Section */}
                    <progress
                      className="progress-bar progress-track-border-30 progress-fill-orange-emerald h-2 w-full rounded-full mt-1 shadow-inner"
                      value={progress}
                      max={100}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSection(section.id);
                    }}
                    className="p-2 text-text-secondary/40 hover:text-error hover:bg-error/10 rounded-full transition-colors"
                    title="Excluir Etapa"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-4 bg-surface border-t border-border-color/50 animate-fade-in-up">
                    <div className="space-y-1 mb-4">
                      {section.tasks.length === 0 && (
                        <p className="text-sm text-text-secondary italic pl-2 py-2">
                          Nenhuma tarefa nesta etapa ainda.
                        </p>
                      )}
                      {section.tasks.map((task) => {
                        // Calculate subtask progress
                        const totalSubtasks = task.subtasks?.length || 0;
                        const completedSubtasks =
                          task.subtasks?.filter((s) => s.completed).length || 0;
                        const subtaskProgress =
                          totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

                        return (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-background transition-colors group border border-transparent hover:border-border-color/50"
                          >
                            <div className="pt-1 relative flex items-center">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={(e) =>
                                  onTaskChange(section.id, task.id, 'completed', e.target.checked)
                                }
                                className={`
                                                                    appearance-none w-5 h-5 border-2 rounded-md cursor-pointer transition-all duration-200
                                                                    ${task.completed ? 'bg-success border-success' : 'border-text-secondary/40 hover:border-primary'}
                                                                `}
                                title={`Marcar tarefa ${task.name} como ${task.completed ? 'pendente' : 'concluída'}`}
                                aria-label={`Marcar tarefa ${task.name} como ${task.completed ? 'pendente' : 'concluída'}`}
                              />
                              {task.completed && (
                                <svg
                                  className="w-3.5 h-3.5 text-white absolute left-0.5 top-1.5 pointer-events-none"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pt-0.5">
                              <input
                                value={task.name}
                                onChange={(e) =>
                                  onTaskChange(section.id, task.id, 'name', e.target.value)
                                }
                                className={`w-full bg-transparent border-none p-0 focus:ring-0 text-sm ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary font-medium'}`}
                                placeholder="Descreva a tarefa..."
                                aria-label="Nome da tarefa"
                              />

                              {/* Subtask Progress Bar - Only visible if there are subtasks and task is not completed */}
                              {totalSubtasks > 0 && !task.completed && (
                                <progress
                                  className="progress-bar progress-track-border-40 progress-fill-primary-70 h-1.5 w-full max-w-xs rounded-full mt-1.5"
                                  value={subtaskProgress}
                                  max={100}
                                />
                              )}

                              {/* Task Metadata Chips */}
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                {task.priority && task.priority !== 'Média' && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${task.priority === 'Alta' ? 'bg-error/10 text-error' : 'bg-info/10 text-info'}`}
                                  >
                                    {task.priority}
                                  </span>
                                )}
                                {task.dueDate && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium ${getDeadlineInfo(task.dueDate).status === 'overdue' && !task.completed ? 'bg-error/10 text-error' : 'bg-background text-text-secondary'}`}
                                  >
                                    <ClockIcon className="w-3 h-3" />
                                    {new Date(task.dueDate).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                    })}
                                  </span>
                                )}
                                {task.assignee && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-background text-text-secondary flex items-center gap-1 border border-border-color"
                                    title="Responsável"
                                  >
                                    <UserCircleIcon className="w-3 h-3" /> {task.assignee}
                                  </span>
                                )}
                                {totalSubtasks > 0 && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded border border-border-color ${completedSubtasks === totalSubtasks ? 'bg-success/10 text-success border-success/20' : 'bg-background text-text-secondary'}`}
                                  >
                                    {completedSubtasks}/{totalSubtasks} subs
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="relative group/tooltip">
                                <input
                                  type="number"
                                  value={task.hours}
                                  onChange={(e) =>
                                    onTaskChange(section.id, task.id, 'hours', e.target.value)
                                  }
                                  className="w-12 text-right text-xs bg-background border border-border-color rounded p-1 focus:border-accent focus:ring-0"
                                  placeholder="h"
                                  aria-label="Horas estimadas"
                                />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] text-white bg-black/80 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  Horas estimadas
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => onEditTaskDetails(section.id, task)}
                                className="p-1.5 bg-background border border-border-color rounded-md text-text-secondary hover:text-primary hover:border-primary transition-colors"
                                title="Detalhes da Tarefa"
                                aria-label="Detalhes da Tarefa"
                              >
                                <PencilIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onRemoveTask(section.id, task.id)}
                                className="p-1.5 bg-background border border-border-color rounded-md text-text-secondary hover:text-error hover:border-error transition-colors"
                                title="Remover Tarefa"
                                aria-label="Remover Tarefa"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddTask(section.id)}
                      className="text-sm font-semibold text-primary hover:text-primary-focus hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 w-full"
                    >
                      <PlusIcon className="w-4 h-4" /> Adicionar Tarefa
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
