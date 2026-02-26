import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { useProjectChecklist } from './useProjectChecklist';
import { createTestProject } from '../test/factories';
import type { Project, ProjectTask } from '../types';

function useChecklistWrapper(initialProject: Project) {
  const [project, setProject] = useState<Project | null>(initialProject);
  const [editingTask, setEditingTask] = useState<{ sectionId: string; task: ProjectTask } | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const checklist = useProjectChecklist(setProject, editingTask, setEditingTask, setModalOpen);
  return { project, checklist, editingTask, modalOpen };
}

describe('useProjectChecklist', () => {
  const projectWithSections = createTestProject({
    sections: [
      {
        id: 'sec-1',
        name: 'Etapa 1',
        tasks: [
          { id: 'task-1', name: 'Tarefa A', completed: false, hours: 2, status: 'todo' },
          { id: 'task-2', name: 'Tarefa B', completed: false, hours: 4, status: 'todo' },
        ],
      },
    ],
  });

  it('handleAddSection adds a new section', () => {
    // Given
    const { result } = renderHook(() => useChecklistWrapper(projectWithSections));

    // When
    act(() => result.current.checklist.handleAddSection());

    // Then
    expect(result.current.project?.sections).toHaveLength(2);
    expect(result.current.project?.sections[1].name).toBe('Nova Etapa');
    expect(result.current.project?.sections[1].tasks).toEqual([]);
  });

  it('handleRemoveSection removes section by id', () => {
    // Given
    const { result } = renderHook(() => useChecklistWrapper(projectWithSections));

    // When
    act(() => result.current.checklist.handleRemoveSection('sec-1'));

    // Then
    expect(result.current.project?.sections).toHaveLength(0);
  });

  it('handleSectionChange renames a section', () => {
    // Given
    const { result } = renderHook(() => useChecklistWrapper(projectWithSections));

    // When
    act(() => result.current.checklist.handleSectionChange('sec-1', 'name', 'Planejamento'));

    // Then
    expect(result.current.project?.sections[0].name).toBe('Planejamento');
  });

  it('handleAddTask adds a task to the correct section', () => {
    // Given
    const { result } = renderHook(() => useChecklistWrapper(projectWithSections));

    // When
    act(() => result.current.checklist.handleAddTask('sec-1'));

    // Then
    expect(result.current.project?.sections[0].tasks).toHaveLength(3);
    expect(result.current.project?.sections[0].tasks[2].status).toBe('todo');
  });

  it('handleRemoveTask removes a task by id', () => {
    // Given
    const { result } = renderHook(() => useChecklistWrapper(projectWithSections));

    // When
    act(() => result.current.checklist.handleRemoveTask('sec-1', 'task-1'));

    // Then
    expect(result.current.project?.sections[0].tasks).toHaveLength(1);
    expect(result.current.project?.sections[0].tasks[0].id).toBe('task-2');
  });

  it('handleTaskChange completed=true syncs status to done', () => {
    // Given
    const { result } = renderHook(() => useChecklistWrapper(projectWithSections));

    // When
    act(() => result.current.checklist.handleTaskChange('sec-1', 'task-1', 'completed', true));

    // Then
    const task = result.current.project?.sections[0].tasks[0];
    expect(task?.completed).toBe(true);
    expect(task?.status).toBe('done');
  });

  it('handleTaskChange status=done syncs completed to true', () => {
    // Given
    const { result } = renderHook(() => useChecklistWrapper(projectWithSections));

    // When
    act(() => result.current.checklist.handleTaskChange('sec-1', 'task-1', 'status', 'done'));

    // Then
    const task = result.current.project?.sections[0].tasks[0];
    expect(task?.status).toBe('done');
    expect(task?.completed).toBe(true);
  });

  it('handleEditTaskDetails opens modal and sets editing task', () => {
    // Given
    const { result } = renderHook(() => useChecklistWrapper(projectWithSections));
    const task = projectWithSections.sections[0].tasks[0];

    // When
    act(() => result.current.checklist.handleEditTaskDetails('sec-1', task));

    // Then
    expect(result.current.editingTask?.sectionId).toBe('sec-1');
    expect(result.current.editingTask?.task.id).toBe('task-1');
    expect(result.current.modalOpen).toBe(true);
  });
});
