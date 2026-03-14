import { describe, expect, it } from 'vitest';
import { KANBAN_COLUMNS, priorityConfig } from './taskUtils';

describe('taskUtils semantic contracts', () => {
  it('exposes semantic tones for task priorities', () => {
    expect(priorityConfig[5]).toEqual({ label: 'Crítica', tone: 'danger' });
    expect(priorityConfig[4]).toEqual({ label: 'Alta', tone: 'accent' });

    Object.values(priorityConfig).forEach((config) => {
      expect(config).not.toHaveProperty('bg');
      expect(config).not.toHaveProperty('text');
      expect(config).not.toHaveProperty('border');
    });
  });

  it('exposes semantic tones for kanban columns without visual classes', () => {
    expect(KANBAN_COLUMNS).toEqual([
      { id: 'todo', title: 'A Fazer', tone: 'info', canAdd: true },
      { id: 'in_progress', title: 'Em Andamento', tone: 'warning', canAdd: true },
      { id: 'review', title: 'Aguardando Retorno', tone: 'accent', canAdd: true },
      { id: 'done', title: 'Concluído', tone: 'success', canAdd: false },
    ]);

    KANBAN_COLUMNS.forEach((column) => {
      expect(column).not.toHaveProperty('color');
    });
  });
});
