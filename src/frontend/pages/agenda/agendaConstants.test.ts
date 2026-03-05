import { describe, expect, it } from 'vitest';
import {
  CELL_HEIGHT_STORAGE_KEY,
  DAYS,
  DEFAULT_CELL_HEIGHT_REM,
  HOUR_HEIGHT_PX,
  HOURS,
  MONTHS,
  priorityColors,
} from './agendaConstants';

describe('agendaConstants', () => {
  describe('DAYS', () => {
    it('has exactly 7 entries starting on Sunday and ending on Saturday', () => {
      // Arrange / Act — static import
      // Assert
      expect(DAYS).toHaveLength(7);
      expect(DAYS[0]).toBe('Dom');
      expect(DAYS[6]).toBe('Sáb');
    });

    it('contains all expected weekday abbreviations in order', () => {
      expect(DAYS).toEqual(['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']);
    });
  });

  describe('HOURS', () => {
    it('contains exactly 24 entries spanning 0 to 23', () => {
      expect(HOURS).toHaveLength(24);
      expect(HOURS[0]).toBe(0);
      expect(HOURS[23]).toBe(23);
    });

    it('is a continuous, zero-gapped sequence', () => {
      HOURS.forEach((hour, index) => {
        expect(hour).toBe(index);
      });
    });
  });

  describe('MONTHS', () => {
    it('has exactly 12 entries covering January to December', () => {
      expect(MONTHS).toHaveLength(12);
      expect(MONTHS[0]).toBe('Janeiro');
      expect(MONTHS[11]).toBe('Dezembro');
    });

    it('contains all Portuguese month names in calendar order', () => {
      expect(MONTHS).toEqual([
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ]);
    });
  });

  describe('layout constants', () => {
    it('exposes correct pixel height for one hour row', () => {
      expect(HOUR_HEIGHT_PX).toBe(56);
    });

    it('exposes correct default cell height in rems', () => {
      expect(DEFAULT_CELL_HEIGHT_REM).toBe(5);
    });

    it('exposes the correct localStorage key for cell height persistence', () => {
      expect(CELL_HEIGHT_STORAGE_KEY).toBe('nexus-agenda-cell-height-scale');
    });
  });

  describe('priorityColors', () => {
    it('has entries for all 5 priority levels (1 to 5)', () => {
      expect(Object.keys(priorityColors).map(Number)).toEqual([1, 2, 3, 4, 5]);
    });

    it('maps priority 1 to "Opcional"', () => {
      expect(priorityColors[1].name).toBe('Opcional');
      expect(priorityColors[1].dotClass).toBe('priority-swatch-1');
    });

    it('maps priority 2 to "Baixa"', () => {
      expect(priorityColors[2].name).toBe('Baixa');
      expect(priorityColors[2].dotClass).toBe('priority-swatch-2');
    });

    it('maps priority 3 to "Moderada"', () => {
      expect(priorityColors[3].name).toBe('Moderada');
      expect(priorityColors[3].dotClass).toBe('priority-swatch-3');
    });

    it('maps priority 4 to "Alta"', () => {
      expect(priorityColors[4].name).toBe('Alta');
      expect(priorityColors[4].dotClass).toBe('priority-swatch-4');
    });

    it('maps priority 5 to "Crítica"', () => {
      expect(priorityColors[5].name).toBe('Crítica');
      expect(priorityColors[5].dotClass).toBe('priority-swatch-5');
    });

    it('each priority entry contains bg, text, name and dotClass fields', () => {
      Object.values(priorityColors).forEach((entry) => {
        expect(entry).toHaveProperty('bg');
        expect(entry).toHaveProperty('text');
        expect(entry).toHaveProperty('name');
        expect(entry).toHaveProperty('dotClass');
      });
    });

    it('all dotClass values are unique across priorities', () => {
      const dotClasses = Object.values(priorityColors).map((e) => e.dotClass);
      const unique = new Set(dotClasses);
      expect(unique.size).toBe(5);
    });
  });
});
