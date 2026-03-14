import React from 'react';
import { ClockIcon, TrashIcon, UserCircleIcon, PencilIcon } from '../../ui/icons';
import { IconButton, Input } from '../../ui';
import type { ProjectTask, TaskStatus } from '@/types';
import { getDeadlineInfo } from '@/utils/formatters';

interface ChecklistTaskRowProps {
  sectionId: string;
  task: ProjectTask;
  onTaskChange: (
    sectionId: string,
    taskId: string,
    field: 'name' | 'hours' | 'completed' | 'status',
    value: string | number | boolean | TaskStatus,
  ) => void;
  onEditTaskDetails: (sectionId: string, task: ProjectTask) => void;
  onRemoveTask: (sectionId: string, taskId: string) => void;
}

export const ChecklistTaskRow: (props: ChecklistTaskRowProps) => React.ReactNode = ({
  sectionId,
  task,
  onTaskChange,
  onEditTaskDetails,
  onRemoveTask,
}) => {
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-background transition-colors group border border-transparent hover:border-border-color/50">
      <div className="pt-1 relative flex items-center">
        <input
          id={`checklist-task-${task.id}`}
          type="checkbox"
          checked={task.completed}
          onChange={(e) => onTaskChange(sectionId, task.id, 'completed', e.target.checked)}
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <Input
          value={task.name}
          onChange={(e) => onTaskChange(sectionId, task.id, 'name', e.target.value)}
          className={`w-full bg-transparent border-none p-0 focus:ring-0 text-sm ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary font-medium'}`}
          placeholder="Descreva a tarefa..."
          aria-label="Nome da tarefa"
        />

        {totalSubtasks > 0 && !task.completed && (
          <progress
            className="progress-bar progress-track-border-40 progress-fill-primary-70 h-1.5 w-full max-w-xs rounded-full mt-1.5"
            value={subtaskProgress}
            max={100}
          />
        )}

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
          <Input
            type="number"
            value={task.hours}
            onChange={(e) => onTaskChange(sectionId, task.id, 'hours', e.target.value)}
            className="w-12 text-right text-xs bg-background border border-border-color rounded p-1 focus:border-accent focus:ring-0"
            placeholder="h"
            aria-label="Horas estimadas"
          />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] text-white bg-black/80 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Horas estimadas
          </span>
        </div>

        <IconButton
          variant="primary"
          size="sm"
          onClick={() => onEditTaskDetails(sectionId, task)}
          aria-label="Detalhes da Tarefa"
          title="Detalhes da Tarefa"
          className="bg-background border border-border-color"
        >
          <PencilIcon className="w-3.5 h-3.5" />
        </IconButton>
        <IconButton
          variant="danger"
          size="sm"
          onClick={() => onRemoveTask(sectionId, task.id)}
          aria-label="Remover Tarefa"
          title="Remover Tarefa"
          className="bg-background border border-border-color"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </IconButton>
      </div>
    </div>
  );
};
