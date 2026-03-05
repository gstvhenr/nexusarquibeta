import { describe, expect, it } from 'vitest';
import {
  formatDateBR,
  formatDateTime,
  getInitialEvent,
  priorityConfig,
  priorityLabels,
} from './agendaFormHelpers';

describe('agendaFormHelpers', () => {
  it('expõe configuração completa de prioridades', () => {
    expect(Object.keys(priorityConfig)).toHaveLength(5);
    expect(priorityConfig[1]).toMatchObject({
      name: 'Opcional',
      swatchClass: 'priority-swatch-1',
    });
    expect(priorityConfig[5]).toMatchObject({
      name: 'Crítica',
      swatchClass: 'priority-swatch-5',
    });
    expect(priorityLabels[3]).toMatchObject({ label: 'Média' });
  });

  it('gera evento inicial com defaults esperados a partir da data informada', () => {
    const initial = getInitialEvent(new Date('2026-03-10T12:00:00.000Z'));

    expect(initial).toMatchObject({
      title: '',
      date: '2026-03-10',
      isAllDay: false,
      time: '09:00',
      timeEnd: '10:00',
      description: '',
      priority: 3,
      recurrence: '',
      completed: false,
      kanbanStatus: 'todo',
      archived: false,
      subtasks: [],
    });
  });

  it('formata data/hora em PT-BR e retorna input original quando inválido', () => {
    expect(formatDateTime('2026-02-20T14:30:00')).toBe('20/02/2026 às 14:30');
    expect(formatDateTime('valor-invalido')).toBe('valor-invalido');
  });

  it('formata data curta em PT-BR e retorna input original quando inválido', () => {
    expect(formatDateBR('2026-02-20T00:00:00')).toBe('20/02/2026');
    expect(formatDateBR('texto-invalido')).toBe('texto-invalido');
  });
});
