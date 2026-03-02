import { v4 as uuidv4 } from 'uuid';
import type { Project, ProjectSection, ProjectTask } from '../types/project';

type ProjectSetter = React.Dispatch<React.SetStateAction<Project | null>>;

interface EditingTask {
  sectionId: string;
  task: ProjectTask;
}

/**
 * Encapsulates checklist/section/task handlers for project details.
 * input -> setLocalProject setter, editingTask state + setter, taskDetailModal setter
 * output -> { handleAddSection, handleRemoveSection, handleSectionChange, handleAddTask, handleRemoveTask, handleTaskChange, updateTaskDependenciesRecursive, handleGanttTaskUpdate, handleEditTaskDetails, handleSaveTaskDetails }
 */
export function useProjectChecklist(
  setLocalProject: ProjectSetter,
  editingTask: EditingTask | null,
  setEditingTask: React.Dispatch<React.SetStateAction<EditingTask | null>>,
  setTaskDetailModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const handleAddSection = () =>
    setLocalProject((p) =>
      p
        ? { ...p, sections: [...p.sections, { id: uuidv4(), name: 'Nova Etapa', tasks: [] }] }
        : null,
    );

  const handleRemoveSection = (sectionId: string) =>
    setLocalProject((p) =>
      p ? { ...p, sections: p.sections.filter((s) => s.id !== sectionId) } : null,
    );

  const handleSectionChange = (sectionId: string, field: 'name', value: string) =>
    setLocalProject((p) =>
      p
        ? {
            ...p,
            sections: p.sections.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s)),
          }
        : null,
    );

  const handleAddTask = (sectionId: string) =>
    setLocalProject((p) =>
      p
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    tasks: [
                      ...s.tasks,
                      { id: uuidv4(), name: '', completed: false, hours: 0, status: 'todo' },
                    ],
                  }
                : s,
            ),
          }
        : null,
    );

  const handleRemoveTask = (sectionId: string, taskId: string) =>
    setLocalProject((p) =>
      p
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === sectionId ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) } : s,
            ),
          }
        : null,
    );

  const handleTaskChange = (
    sectionId: string,
    taskId: string,
    field: 'name' | 'hours' | 'completed' | 'status',
    value: string | number | boolean,
  ) => {
    setLocalProject((p) => {
      if (!p) return null;
      return {
        ...p,
        sections: p.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                tasks: s.tasks.map((t) => {
                  if (t.id !== taskId) return t;
                  const updatedTask = { ...t, [field]: value };
                  if (field === 'completed') {
                    updatedTask.status = value ? 'done' : 'todo';
                  } else if (field === 'status') {
                    updatedTask.completed = value === 'done';
                  }
                  return updatedTask;
                }),
              }
            : s,
        ),
      };
    });
  };

  const updateTaskDependenciesRecursive = (
    sections: ProjectSection[],
    modifiedTaskId: string,
    offsetMs: number,
  ): ProjectSection[] => {
    if (offsetMs === 0) return sections;

    const updatedSections = sections.map((section) => ({
      ...section,
      tasks: section.tasks.map((task) => ({ ...task })),
    }));

    const taskLocations = new Map<string, { sectionIndex: number; taskIndex: number }>();
    const dependentsByTask = new Map<string, string[]>();

    updatedSections.forEach((section, sectionIndex) => {
      section.tasks.forEach((task, taskIndex) => {
        taskLocations.set(task.id, { sectionIndex, taskIndex });
        (task.dependencies || []).forEach((dependencyId) => {
          const current = dependentsByTask.get(dependencyId) || [];
          current.push(task.id);
          dependentsByTask.set(dependencyId, current);
        });
      });
    });

    const queue: string[] = [modifiedTaskId];
    const visited = new Set<string>([modifiedTaskId]);

    while (queue.length > 0) {
      const currentTaskId = queue.shift()!;
      const dependentIds = dependentsByTask.get(currentTaskId) || [];

      dependentIds.forEach((dependentId) => {
        if (visited.has(dependentId)) return;

        const location = taskLocations.get(dependentId);
        if (!location) return;

        const task = updatedSections[location.sectionIndex].tasks[location.taskIndex];
        const taskStartRaw = task.startDate || task.dueDate;
        const taskEndRaw = task.endDate || task.dueDate;

        if (!taskStartRaw || !taskEndRaw) return;

        const taskStart = new Date(taskStartRaw);
        const taskEnd = new Date(taskEndRaw);
        if (Number.isNaN(taskStart.getTime()) || Number.isNaN(taskEnd.getTime())) return;

        const shiftedStart = new Date(taskStart.getTime() + offsetMs);
        const shiftedEnd = new Date(taskEnd.getTime() + offsetMs);

        updatedSections[location.sectionIndex].tasks[location.taskIndex] = {
          ...task,
          startDate: shiftedStart.toISOString(),
          endDate: shiftedEnd.toISOString(),
          dueDate: shiftedEnd.toISOString(),
        };

        visited.add(dependentId);
        queue.push(dependentId);
      });
    }

    return updatedSections;
  };

  const handleGanttTaskUpdate = (sectionId: string, updatedTask: ProjectTask) => {
    setLocalProject((p) => {
      if (!p) return null;

      const oldSection = p.sections.find((s) => s.id === sectionId);
      const oldTask = oldSection?.tasks.find((t) => t.id === updatedTask.id);

      let updatedSections = p.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              tasks: s.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
            }
          : s,
      );

      if (oldTask && oldTask.startDate && updatedTask.startDate) {
        const oldStart = new Date(oldTask.startDate).getTime();
        const newStart = new Date(updatedTask.startDate).getTime();
        const diff = newStart - oldStart;

        if (diff !== 0) {
          updatedSections = updateTaskDependenciesRecursive(updatedSections, updatedTask.id, diff);
        }
      }

      return { ...p, sections: updatedSections };
    });
  };

  const handleEditTaskDetails = (sectionId: string, task: ProjectTask) => {
    setEditingTask({ sectionId, task });
    setTaskDetailModalOpen(true);
  };

  const handleSaveTaskDetails = (updatedTask: ProjectTask) => {
    if (!editingTask) return;
    setLocalProject((p) =>
      p
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === editingTask.sectionId
                ? { ...s, tasks: s.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)) }
                : s,
            ),
          }
        : null,
    );
  };

  return {
    handleAddSection,
    handleRemoveSection,
    handleSectionChange,
    handleAddTask,
    handleRemoveTask,
    handleTaskChange,
    handleGanttTaskUpdate,
    handleEditTaskDetails,
    handleSaveTaskDetails,
  };
}
