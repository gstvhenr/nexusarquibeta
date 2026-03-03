import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, CheckCircleIcon, ClockIcon, TrashIcon, PlusIcon } from '../../ui/icons';
import { Button, IconButton } from '../../ui';
import { ProjectSection, ProjectTask, TaskStatus } from '@/types';
import { ChecklistTaskRow } from './ChecklistTaskRow';

interface ChecklistTabProps {
  sections: ProjectSection[];
  onSectionChange: (sectionId: string, field: 'name', value: string) => void;
  onTaskChange: (
    sectionId: string,
    taskId: string,
    field: 'name' | 'hours' | 'completed' | 'status',
    value: string | number | boolean | TaskStatus,
  ) => void;
  onAddSection: () => void;
  onRemoveSection: (sectionId: string) => void;
  onAddTask: (sectionId: string) => void;
  onRemoveTask: (sectionId: string, taskId: string) => void;
  onEditTaskDetails: (sectionId: string, task: ProjectTask) => void;
}

export const ProjectChecklistTab: (props: ChecklistTabProps) => React.ReactNode = ({
  sections,
  onSectionChange,
  onTaskChange,
  onAddSection,
  onRemoveSection,
  onAddTask,
  onRemoveTask,
  onEditTaskDetails,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  useEffect(() => {
    if (sections.length === 0) return;
    setExpandedSections((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      const initialState: Record<string, boolean> = {};
      sections.forEach((section, index) => {
        initialState[section.id] = index === 0 || sections.length <= 2;
      });
      return initialState;
    });
  }, [sections]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-secondary">Etapas do Projeto</h3>
          <p className="text-sm text-text-secondary">
            Organize seu projeto em fases (ex: Preliminar, Executivo) para manter o controle.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onAddSection}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" /> Nova Etapa
        </Button>
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
          <Button variant="secondary" onClick={onAddSection}>
            Criar Primeira Etapa
          </Button>
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
                <div
                  className="p-4 bg-background/30 flex items-center gap-4 cursor-pointer select-none hover:bg-background/60 transition-colors"
                  onClick={() => toggleSection(section.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSection(section.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
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
                    <progress
                      className="progress-bar progress-track-border-30 progress-fill-orange-emerald h-2 w-full rounded-full mt-1 shadow-inner"
                      value={progress}
                      max={100}
                    />
                  </div>

                  <IconButton
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSection(section.id);
                    }}
                    aria-label="Excluir Etapa"
                    title="Excluir Etapa"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </IconButton>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-surface border-t border-border-color/50 animate-fade-in-up">
                    <div className="space-y-1 mb-4">
                      {section.tasks.length === 0 && (
                        <p className="text-sm text-text-secondary italic pl-2 py-2">
                          Nenhuma tarefa nesta etapa ainda.
                        </p>
                      )}
                      {section.tasks.map((task) => (
                        <ChecklistTaskRow
                          key={task.id}
                          sectionId={section.id}
                          task={task}
                          onTaskChange={onTaskChange}
                          onEditTaskDetails={onEditTaskDetails}
                          onRemoveTask={onRemoveTask}
                        />
                      ))}
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
