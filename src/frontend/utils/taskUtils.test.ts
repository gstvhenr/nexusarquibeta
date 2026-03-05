import { describe, expect, it } from 'vitest';
import type { AgendaEvent, KanbanStatus } from '../types';
import { allSubtasksDone, priorityConfig, KANBAN_COLUMNS } from './taskUtils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeTask = (overrides: Partial<AgendaEvent>): AgendaEvent => ({
  id: 'task-1',
  title: 'Tarefa Teste',
  date: '2026-03-01',
  time: '09:00',
  type: 'Outro',
  priority: 3,
  recurrence: 'none',
  ...overrides,
});

// ---------------------------------------------------------------------------
// allSubtasksDone
// ---------------------------------------------------------------------------

describe('allSubtasksDone', () => {
  it('returns true when task has no subtasks property', () => {
    // Arrange
    const task = makeTask({ subtasks: undefined });

    // Act / Assert
    expect(allSubtasksDone(task)).toBe(true);
  });

  it('returns true when subtasks array is empty', () => {
    // Arrange
    const task = makeTask({ subtasks: [] });

    // Act / Assert
    expect(allSubtasksDone(task)).toBe(true);
  });

  it('returns true when all subtasks are completed', () => {
    // Arrange
    const task = makeTask({
      subtasks: [
        { id: 's1', title: 'Sub 1', completed: true },
        { id: 's2', title: 'Sub 2', completed: true },
      ],
    });

    // Act / Assert
    expect(allSubtasksDone(task)).toBe(true);
  });

  it('returns false when at least one subtask is not completed', () => {
    // Arrange
    const task = makeTask({
      subtasks: [
        { id: 's1', title: 'Sub 1', completed: true },
        { id: 's2', title: 'Sub 2', completed: false },
      ],
    });

    // Act / Assert
    expect(allSubtasksDone(task)).toBe(false);
  });

  it('returns false when all subtasks are pending', () => {
    // Arrange
    const task = makeTask({
      subtasks: [
        { id: 's1', title: 'Sub 1', completed: false },
        { id: 's2', title: 'Sub 2', completed: false },
      ],
    });

    // Act / Assert
    expect(allSubtasksDone(task)).toBe(false);
  });

  it('returns false when one subtask is pending out of many completed', () => {
    // Arrange
    const task = makeTask({
      subtasks: [
        { id: 's1', title: 'A', completed: true },
        { id: 's2', title: 'B', completed: true },
        { id: 's3', title: 'C', completed: true },
        { id: 's4', title: 'D', completed: false }, // single false
      ],
    });

    // Act / Assert
    expect(allSubtasksDone(task)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// priorityConfig
// ---------------------------------------------------------------------------

describe('priorityConfig', () => {
  it('defines configurations for all 5 priority levels (1–5)', () => {
    // Assert
    expect(Object.keys(priorityConfig)).toHaveLength(5);
    [1, 2, 3, 4, 5].forEach((level) => {
      expect(priorityConfig[level]).toBeDefined();
    });
  });

  it('each priority level has label, bg, text, and border', () => {
    // Arrange / Assert
    [1, 2, 3, 4, 5].forEach((level) => {
      const config = priorityConfig[level];
      expect(config.label).toBeTruthy();
      expect(config.bg).toBeTruthy();
      expect(config.text).toBeTruthy();
      expect(config.border).toBeTruthy();
    });
  });

  it('level 1 is "Opcional"', () => {
    expect(priorityConfig[1].label).toBe('Opcional');
  });

  it('level 3 is "Média" (default mid-priority)', () => {
    expect(priorityConfig[3].label).toBe('Média');
  });

  it('level 5 is "Crítica" (highest priority)', () => {
    expect(priorityConfig[5].label).toBe('Crítica');
  });

  it('critical level (5) uses red color tokens', () => {
    // Red theme should be used for critical tasks
    expect(priorityConfig[5].bg).toContain('red');
    expect(priorityConfig[5].text).toContain('red');
    expect(priorityConfig[5].border).toContain('red');
  });

  it('optional level (1) uses sky (blue) color tokens', () => {
    expect(priorityConfig[1].bg).toContain('sky');
  });
});

// ---------------------------------------------------------------------------
// KANBAN_COLUMNS
// ---------------------------------------------------------------------------

describe('KANBAN_COLUMNS', () => {
  it('defines exactly 4 kanban columns', () => {
    expect(KANBAN_COLUMNS).toHaveLength(4);
  });

  it('contains all expected status IDs', () => {
    const ids = KANBAN_COLUMNS.map((col) => col.id);
    expect(ids).toContain<KanbanStatus>('todo');
    expect(ids).toContain<KanbanStatus>('in_progress');
    expect(ids).toContain<KanbanStatus>('review');
    expect(ids).toContain<KanbanStatus>('done');
  });

  it('each column has id, title, color, and canAdd fields', () => {
    KANBAN_COLUMNS.forEach((col) => {
      expect(col.id).toBeTruthy();
      expect(col.title).toBeTruthy();
      expect(col.color).toBeTruthy();
      expect(typeof col.canAdd).toBe('boolean');
    });
  });

  it('"done" column has canAdd = false (cannot add tasks directly to done)', () => {
    const doneCol = KANBAN_COLUMNS.find((col) => col.id === 'done');
    expect(doneCol?.canAdd).toBe(false);
  });

  it('"todo" and "in_progress" and "review" columns have canAdd = true', () => {
    const addableIds: KanbanStatus[] = ['todo', 'in_progress', 'review'];
    addableIds.forEach((id) => {
      const col = KANBAN_COLUMNS.find((c) => c.id === id);
      expect(col?.canAdd).toBe(true);
    });
  });

  it('column order is todo → in_progress → review → done', () => {
    const ids = KANBAN_COLUMNS.map((col) => col.id);
    expect(ids).toEqual(['todo', 'in_progress', 'review', 'done']);
  });
});
