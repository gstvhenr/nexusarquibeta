import { describe, expect, it, vi } from 'vitest';
import type { Project, ProjectTask, TaskStatus } from '../types/project';
import { useProjectChecklist } from './useProjectChecklist';

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'p1',
  code: 'PRJ-001',
  name: 'Projeto',
  clientName: 'Cliente',
  clientId: 'c1',
  status: 'Em Andamento',
  deadline: null,
  budget: 0,
  description: '',
  sections: [],
  financials: { paymentType: 'vista' },
  ...overrides,
});

const makeSection = (id: string, tasks: ProjectTask[] = []) => ({ id, name: 'Seção', tasks });
const makeTask = (id: string): ProjectTask => ({
  id,
  name: 'Tarefa',
  completed: false,
  hours: 0,
  status: 'todo' as TaskStatus,
});

describe('useProjectChecklist', () => {
  it('handleAddSection adds a new section', () => {
    // Given — projeto sem seções
    const setLocalProject = vi.fn();
    const setEditingTask = vi.fn();
    const setTaskDetailModalOpen = vi.fn();
    const { handleAddSection } = useProjectChecklist(
      setLocalProject,
      null,
      setEditingTask,
      setTaskDetailModalOpen,
    );

    // When — adiciona seção
    handleAddSection();

    const updater = setLocalProject.mock.calls[0][0];
    const result = updater(makeProject());

    // Then — seção adicionada com nome padrão
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].name).toBe('Nova Etapa');
  });

  it('handleAddSection returns null when project is null', () => {
    // Given — projeto nulo
    const setLocalProject = vi.fn();
    const { handleAddSection } = useProjectChecklist(setLocalProject, null, vi.fn(), vi.fn());

    handleAddSection();
    const updater = setLocalProject.mock.calls[0][0];
    const result = updater(null);

    // Then — retorna null
    expect(result).toBeNull();
  });

  it('handleRemoveSection removes section by id', () => {
    // Given — projeto com duas seções
    const setLocalProject = vi.fn();
    const { handleRemoveSection } = useProjectChecklist(setLocalProject, null, vi.fn(), vi.fn());

    handleRemoveSection('s1');
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({ sections: [makeSection('s1'), makeSection('s2')] });
    const result = updater(project);

    // Then — apenas s2 permanece
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].id).toBe('s2');
  });

  it('handleSectionChange updates section name', () => {
    // Given — seção com nome inicial
    const setLocalProject = vi.fn();
    const { handleSectionChange } = useProjectChecklist(setLocalProject, null, vi.fn(), vi.fn());

    handleSectionChange('s1', 'name', 'Novo Nome');
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({ sections: [makeSection('s1')] });
    const result = updater(project);

    // Then — nome da seção atualizado
    expect(result.sections[0].name).toBe('Novo Nome');
  });

  it('handleAddTask adds a task to the correct section', () => {
    // Given — projeto com uma seção vazia
    const setLocalProject = vi.fn();
    const { handleAddTask } = useProjectChecklist(setLocalProject, null, vi.fn(), vi.fn());

    handleAddTask('s1');
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({ sections: [makeSection('s1')] });
    const result = updater(project);

    // Then — tarefa adicionada à seção correta
    expect(result.sections[0].tasks).toHaveLength(1);
    expect(result.sections[0].tasks[0].status).toBe('todo');
  });

  it('handleRemoveTask removes task by id', () => {
    // Given — seção com duas tarefas
    const setLocalProject = vi.fn();
    const { handleRemoveTask } = useProjectChecklist(setLocalProject, null, vi.fn(), vi.fn());

    handleRemoveTask('s1', 'task1');
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({
      sections: [{ id: 's1', name: 'Seção', tasks: [makeTask('task1'), makeTask('task2')] }],
    });
    const result = updater(project);

    // Then — task1 removida
    expect(result.sections[0].tasks).toHaveLength(1);
    expect(result.sections[0].tasks[0].id).toBe('task2');
  });

  it('handleTaskChange syncs completed and status fields', () => {
    // Given — tarefa com status todo
    const setLocalProject = vi.fn();
    const { handleTaskChange } = useProjectChecklist(setLocalProject, null, vi.fn(), vi.fn());

    handleTaskChange('s1', 'task1', 'completed', true);
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({
      sections: [{ id: 's1', name: 'S', tasks: [makeTask('task1')] }],
    });
    const result = updater(project);

    // Then — status atualizado para done
    expect(result.sections[0].tasks[0].completed).toBe(true);
    expect(result.sections[0].tasks[0].status).toBe('done');
  });

  it('handleTaskChange: setting status=done sets completed=true', () => {
    // Given — tarefa com completed=false
    const setLocalProject = vi.fn();
    const { handleTaskChange } = useProjectChecklist(setLocalProject, null, vi.fn(), vi.fn());

    handleTaskChange('s1', 'task1', 'status', 'done');
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({
      sections: [{ id: 's1', name: 'S', tasks: [makeTask('task1')] }],
    });
    const result = updater(project);

    // Then — completed sincronizado
    expect(result.sections[0].tasks[0].completed).toBe(true);
  });

  it('handleEditTaskDetails sets editingTask and opens modal', () => {
    // Given — setters mockados
    const setLocalProject = vi.fn();
    const setEditingTask = vi.fn();
    const setTaskDetailModalOpen = vi.fn();
    const { handleEditTaskDetails } = useProjectChecklist(
      setLocalProject,
      null,
      setEditingTask,
      setTaskDetailModalOpen,
    );
    const task = makeTask('t1');

    // When — edição de detalhes iniciada
    handleEditTaskDetails('s1', task);

    // Then — setters chamados corretamente
    expect(setEditingTask).toHaveBeenCalledWith({ sectionId: 's1', task });
    expect(setTaskDetailModalOpen).toHaveBeenCalledWith(true);
  });

  it('handleSaveTaskDetails does nothing when editingTask is null', () => {
    // Given — editingTask nulo
    const setLocalProject = vi.fn();
    const { handleSaveTaskDetails } = useProjectChecklist(
      setLocalProject,
      null,
      vi.fn(),
      vi.fn(),
    );

    // When — salva sem editing
    handleSaveTaskDetails(makeTask('t1'));

    // Then — setLocalProject não é chamado
    expect(setLocalProject).not.toHaveBeenCalled();
  });

  it('handleGanttTaskUpdate updates task in correct section', () => {
    // Given — projeto com seção e tarefa
    const setLocalProject = vi.fn();
    const { handleGanttTaskUpdate } = useProjectChecklist(setLocalProject, null, vi.fn(), vi.fn());
    const task = { ...makeTask('task1'), name: 'Atualizada' };

    handleGanttTaskUpdate('s1', task);
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({
      sections: [{ id: 's1', name: 'S', tasks: [makeTask('task1')] }],
    });
    const result = updater(project);

    // Then — tarefa atualizada na seção correta
    expect(result.sections[0].tasks[0].name).toBe('Atualizada');
  });
});
