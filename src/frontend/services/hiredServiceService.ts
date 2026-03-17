import type { HiredService, Project } from '@/types';

/**
 * Service to manage domain operations related to Hired Services (Subcontratação).
 * Contains pure functions to manipulate domain entities without side effects.
 */

/**
 * Binds specific project tasks to a hired service, updating their `assignee` field.
 *
 * @param projects The current list of projects.
 * @param projectId The ID of the project containing the tasks.
 * @param taskIds The IDs of the tasks to bind to the service.
 * @param freelancerName The name of the freelancer to set as assignee.
 * @returns A new array of projects with the updated tasks.
 */
export const bindTasksToHiredService = (
  projects: Project[],
  projectId: string,
  taskIds: string[],
  freelancerName: string,
): Project[] => {
  if (taskIds.length === 0) return projects;

  return projects.map((p) => {
    if (p.id !== projectId) return p;
    return {
      ...p,
      sections: p.sections.map((sec) => ({
        ...sec,
        tasks: sec.tasks.map((task) => {
          if (taskIds.includes(task.id)) {
            return { ...task, assignee: `Freelancer: ${freelancerName}` };
          }
          return task;
        }),
      })),
    };
  });
};

/**
 * Clears the `assignee` field from all project tasks associated with a given hired service.
 * Used when a service is cancelled or deleted.
 *
 * @param projects The current list of projects.
 * @param service The hired service whose tasks should be cleared.
 * @returns A new array of projects with the cleared tasks, or the original array if no tasks were bound.
 */
export const clearTasksFromHiredService = (
  projects: Project[],
  service: HiredService,
): Project[] => {
  if (service.taskIds.length === 0) return projects;

  return projects.map((p) => {
    if (p.id !== service.projectId) return p;
    return {
      ...p,
      sections: p.sections.map((sec) => ({
        ...sec,
        tasks: sec.tasks.map((task) =>
          service.taskIds.includes(task.id) ? { ...task, assignee: '' } : task,
        ),
      })),
    };
  });
};

/**
 * Marks a hired service as completed.
 * @param service - The service to complete.
 * @param isPaid - Whether the freelancer has already been paid.
 * @returns A new HiredService with status 'Concluído' and paidAt set if isPaid is true.
 */
export const completeHiredService = (service: HiredService, isPaid: boolean): HiredService => ({
  ...service,
  status: 'Concluído',
  paidAt: isPaid ? new Date().toISOString() : null,
});

/**
 * Marks a hired service as cancelled.
 * @param service - The service to cancel.
 * @returns A new HiredService with status 'Cancelado'.
 */
export const cancelHiredService = (service: HiredService): HiredService => ({
  ...service,
  status: 'Cancelado',
});

/**
 * Marks all project tasks linked to a hired service as completed.
 * Used when the freelancer service is concluded — auto-completes delegated tasks.
 *
 * @param projects - Current list of projects.
 * @param service - The completed hired service.
 * @returns A new array of projects with linked tasks marked as completed.
 */
export const completeTasksFromHiredService = (
  projects: Project[],
  service: HiredService,
): Project[] => {
  if (service.taskIds.length === 0) return projects;

  return projects.map((p) => {
    if (p.id !== service.projectId) return p;
    return {
      ...p,
      sections: p.sections.map((sec) => ({
        ...sec,
        tasks: sec.tasks.map((task) =>
          service.taskIds.includes(task.id)
            ? { ...task, completed: true, status: 'done' as const }
            : task,
        ),
      })),
    };
  });
};
