import React, { useMemo, useState } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import type { ProjectSection, ProjectTask } from '../../../types';
import { CalendarPlusIcon, ClockIcon } from '../../ui/icons';
import { useTheme } from '../../../context/ThemeContext';

interface ProjectGanttTabProps {
  sections: ProjectSection[];
  onTaskUpdate: (sectionId: string, task: ProjectTask) => void;
}

const CustomTooltip: React.FC<{ task: Task }> = ({ task }) => {
  const isSection = task.type === 'project';
  const startText = new Date(task.start).toLocaleDateString('pt-BR');
  const endText = new Date(task.end).toLocaleDateString('pt-BR');

  return (
    <div className="bg-surface border border-border-color shadow-lifted rounded-xl p-4 min-w-[220px] z-50 text-text-primary backdrop-blur-sm bg-opacity-95">
      <p className="font-bold text-sm mb-2 text-primary">{task.name}</p>
      {!isSection ? (
        <div className="space-y-2 text-xs text-text-secondary">
          <div className="flex justify-between">
            <span>Inicio:</span>
            <span className="font-medium text-text-primary">{startText}</span>
          </div>
          <div className="flex justify-between">
            <span>Fim:</span>
            <span className="font-medium text-text-primary">{endText}</span>
          </div>
          <div className="pt-2 border-t border-border-color flex justify-between items-center">
            <span>Progresso:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full ${task.progress === 100 ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}
            >
              {task.progress}%
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
          Etapa do Projeto
        </p>
      )}
    </div>
  );
};

export const ProjectGanttTab: React.FC<ProjectGanttTabProps> = ({ sections, onTaskUpdate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = useMemo(
    () => ({
      text: isDark ? '#e5e7eb' : '#374151',
      background: isDark ? '#27272a' : '#ffffff',
      grid: isDark ? '#3f3f46' : '#f3f4f6',
      section: {
        bar: isDark ? '#52525b' : '#cbd5e1',
        progress: isDark ? '#71717a' : '#94a3b8',
      },
      task: {
        default: { bar: 'hsl(var(--color-primary))', progress: 'hsl(var(--color-primary-focus))' },
        done: { bar: 'hsl(var(--color-success))', progress: '#065f46' },
        late: { bar: 'hsl(var(--color-error))', progress: '#991b1b' },
      },
    }),
    [isDark],
  );

  const ganttTasks = useMemo(() => {
    const tasks: Task[] = [];
    let order = 1;
    const now = new Date();

    sections.forEach((section) => {
      const sectionStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sectionEnd = new Date(sectionStart);
      sectionEnd.setDate(sectionEnd.getDate() + 1);

      tasks.push({
        start: sectionStart,
        end: sectionEnd,
        name: section.name || 'Nova Etapa',
        id: section.id,
        type: 'project',
        progress: 0,
        isDisabled: true,
        styles: {
          progressColor: colors.section.progress,
          progressSelectedColor: colors.section.progress,
          backgroundColor: colors.section.bar,
          backgroundSelectedColor: colors.section.bar,
        },
        hideChildren: false,
        displayOrder: order++,
      });

      section.tasks.forEach((task) => {
        let startDate = task.startDate ? new Date(task.startDate) : new Date();
        if (isNaN(startDate.getTime())) startDate = new Date();

        let endDate = task.endDate
          ? new Date(task.endDate)
          : task.dueDate
            ? new Date(task.dueDate)
            : null;
        if (!endDate || isNaN(endDate.getTime())) {
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
        }

        if (endDate <= startDate) {
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
        }

        const isCompleted = task.completed;
        const isLate = !isCompleted && endDate < now;

        let taskStyle = colors.task.default;
        if (isCompleted) taskStyle = colors.task.done;
        else if (isLate) taskStyle = colors.task.late;

        tasks.push({
          start: startDate,
          end: endDate,
          name: task.name || 'Nova Tarefa',
          id: task.id,
          type: 'task',
          progress: isCompleted ? 100 : 0,
          isDisabled: false,
          styles: {
            progressColor: taskStyle.progress,
            progressSelectedColor: taskStyle.progress,
            backgroundColor: taskStyle.bar,
            backgroundSelectedColor: taskStyle.bar,
          },
          project: section.id,
          displayOrder: order++,
          dependencies: task.dependencies,
        });
      });
    });

    if (tasks.length === 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tasks.push({
        start: today,
        end: tomorrow,
        name: 'Adicione etapas e tarefas para ver o cronograma',
        id: 'dummy',
        type: 'task',
        progress: 0,
        isDisabled: true,
        displayOrder: 1,
        styles: { backgroundColor: colors.grid, progressColor: colors.grid },
      });
    }

    return tasks;
  }, [sections, colors]);

  const handleTaskChange = (task: Task) => {
    for (const section of sections) {
      const originalTask = section.tasks.find((t) => t.id === task.id);
      if (!originalTask) continue;

      const updatedTask: ProjectTask = {
        ...originalTask,
        startDate: task.start.toISOString(),
        endDate: task.end.toISOString(),
        dueDate: task.end.toISOString(),
      };
      onTaskUpdate(section.id, updatedTask);
      break;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-surface p-4 rounded-xl shadow-sm border border-border-color gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-secondary flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-primary" /> Cronograma Interativo
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Arraste as barras para ajustar o planejamento.
          </p>
        </div>

        <div className="flex p-1 bg-background rounded-lg border border-border-color/50">
          <button
            type="button"
            onClick={() => setViewMode(ViewMode.Day)}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${viewMode === ViewMode.Day ? 'bg-surface text-primary shadow-sm ring-1 ring-border-color' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Dia
          </button>
          <button
            type="button"
            onClick={() => setViewMode(ViewMode.Week)}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${viewMode === ViewMode.Week ? 'bg-surface text-primary shadow-sm ring-1 ring-border-color' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setViewMode(ViewMode.Month)}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${viewMode === ViewMode.Month ? 'bg-surface text-primary shadow-sm ring-1 ring-border-color' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Mes
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-lifted overflow-hidden border border-border-color h-[650px] text-text-primary">
        {sections.length > 0 && sections.some((s) => s.tasks.length > 0) ? (
          <div className="h-full w-full overflow-x-auto custom-scrollbar">
            <Gantt
              tasks={ganttTasks}
              viewMode={viewMode}
              onDateChange={handleTaskChange}
              listCellWidth={viewMode === ViewMode.Month ? '200px' : '250px'}
              columnWidth={
                viewMode === ViewMode.Month ? 100 : viewMode === ViewMode.Week ? 120 : 60
              }
              barFill={70}
              ganttHeight={600}
              locale="pt-BR"
              barCornerRadius={4}
              headerHeight={50}
              rowHeight={45}
              fontFamily="var(--font-sans)"
              fontSize="12px"
              TooltipContent={CustomTooltip}
              todayColor="rgba(122, 58, 35, 0.12)"
              arrowColor={isDark ? '#a1a1aa' : '#52525b'}
              arrowIndent={20}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-text-secondary">
            <div className="bg-background/50 p-8 rounded-full mb-4 ring-1 ring-border-color">
              <CalendarPlusIcon className="w-16 h-16 opacity-30" />
            </div>
            <p className="font-semibold text-lg">O cronograma esta vazio.</p>
            <p className="text-sm opacity-70 mt-2 max-w-xs text-center">
              Adicione tarefas com datas na aba "Etapas" para visualizar o grafico.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-6 justify-center text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Em Andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success" />
          <span>Concluido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-error" />
          <span>Atrasado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.section.bar }} />
          <span>Etapa (Grupo)</span>
        </div>
      </div>
    </div>
  );
};
