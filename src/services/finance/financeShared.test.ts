import { describe, expect, it } from 'vitest';
import {
  toMonthKey,
  isInMonth,
  getMonthlyTotals,
  calculateChange,
  getReceivableCategory,
  applySeriesFilters,
  buildSeriesFromRecords,
  buildFilterOptions,
  mapReceivablesToSeriesRecords,
  mapDebitsToSeriesRecords,
} from './financeShared';
import type { SeriesRecord } from './financeShared';
import { createTestReceivable, createTestDebit } from '../../test/factories';

describe('financeShared', () => {
  describe('toMonthKey', () => {
    it('formats with zero-padded month', () => {
      // Given
      const date = new Date(2026, 0, 15); // January

      // When
      const result = toMonthKey(date);

      // Then
      expect(result).toBe('2026-01');
    });

    it('formats double-digit month correctly', () => {
      // Given
      const date = new Date(2026, 11, 1); // December

      // When
      const result = toMonthKey(date);

      // Then
      expect(result).toBe('2026-12');
    });
  });

  describe('isInMonth', () => {
    it('returns true for date in the target month', () => {
      // Given
      const target = new Date(2026, 2, 1); // March 2026

      // When
      const result = isInMonth('2026-03-15', target);

      // Then
      expect(result).toBe(true);
    });

    it('returns false for date in a different month', () => {
      // Given
      const target = new Date(2026, 2, 1); // March 2026

      // When
      const result = isInMonth('2026-04-01', target);

      // Then
      expect(result).toBe(false);
    });

    it('returns false for null date', () => {
      // Given
      const target = new Date(2026, 2, 1);

      // When
      const result = isInMonth(null, target);

      // Then
      expect(result).toBe(false);
    });
  });

  describe('getMonthlyTotals', () => {
    it('sums receivables and debits for the target month', () => {
      // Given
      const receivables = [
        { dueDate: '2026-03-10', value: 1000 },
        { dueDate: '2026-03-20', value: 500 },
        { dueDate: '2026-04-01', value: 300 }, // different month
      ];
      const debits = [
        { dueDate: '2026-03-05', value: 200 },
        { dueDate: '2026-02-15', value: 100 }, // different month
      ];
      const target = new Date(2026, 2, 1); // March 2026

      // When
      const result = getMonthlyTotals(receivables, debits, target);

      // Then
      expect(result.receita).toBe(1500);
      expect(result.despesa).toBe(200);
      expect(result.saldo).toBe(1300);
    });

    it('returns zeros for month with no entries', () => {
      // Given
      const target = new Date(2026, 5, 1);

      // When
      const result = getMonthlyTotals([], [], target);

      // Then
      expect(result).toEqual({ receita: 0, despesa: 0, saldo: 0 });
    });
  });

  describe('calculateChange', () => {
    it('calculates positive growth', () => {
      // Given / When
      const result = calculateChange(200, 100);

      // Then
      expect(result).toBe(100);
    });

    it('calculates negative decline', () => {
      // Given / When
      const result = calculateChange(50, 100);

      // Then
      expect(result).toBe(-50);
    });

    it('returns 100 when previous is zero and current is positive', () => {
      // Given / When
      const result = calculateChange(500, 0);

      // Then
      expect(result).toBe(100);
    });

    it('returns 0 when both are zero', () => {
      // Given / When
      const result = calculateChange(0, 0);

      // Then
      expect(result).toBe(0);
    });
  });

  describe('getReceivableCategory', () => {
    it('returns explicit category when present', () => {
      // Given
      const receivable = createTestReceivable({ category: 'Honorários', source: 'Project' });

      // When
      const result = getReceivableCategory(receivable);

      // Then
      expect(result).toBe('Honorários');
    });

    it('returns Comissão for Commission source without explicit category', () => {
      // Given
      const receivable = createTestReceivable({ category: undefined, source: 'Commission' });

      // When
      const result = getReceivableCategory(receivable);

      // Then
      expect(result).toBe('Comissão');
    });

    it('returns Projeto for Project source without explicit category', () => {
      // Given
      const receivable = createTestReceivable({ category: undefined, source: 'Project' });

      // When
      const result = getReceivableCategory(receivable);

      // Then
      expect(result).toBe('Projeto');
    });

    it('returns Outros for Manual source without explicit category', () => {
      // Given
      const receivable = createTestReceivable({ category: undefined, source: 'Manual' });

      // When
      const result = getReceivableCategory(receivable);

      // Then
      expect(result).toBe('Outros');
    });
  });

  describe('applySeriesFilters', () => {
    const records: SeriesRecord[] = [
      { date: '2026-01-01', value: 100, origin: 'Profissional', category: 'Projeto', item: 'A' },
      { date: '2026-02-01', value: 200, origin: 'Pessoal', category: 'Salário', item: 'B' },
      { date: '2026-03-01', value: 300, origin: 'Profissional', category: 'Comissão', item: 'C' },
    ];

    it('filters by origin', () => {
      // Given / When
      const result = applySeriesFilters(records, { origin: 'Profissional' });

      // Then
      expect(result).toHaveLength(2);
    });

    it('filters by category', () => {
      // Given / When
      const result = applySeriesFilters(records, { category: 'Salário' });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(200);
    });

    it('filters by item', () => {
      // Given / When
      const result = applySeriesFilters(records, { item: 'C' });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(300);
    });

    it('returns all records when no filters applied', () => {
      // Given / When
      const result = applySeriesFilters(records);

      // Then
      expect(result).toHaveLength(3);
    });
  });

  describe('buildSeriesFromRecords', () => {
    it('aggregates values by month for a quarter period', () => {
      // Given
      const records: SeriesRecord[] = [
        { date: '2026-01-10', value: 100, origin: 'Profissional', category: 'A', item: 'x' },
        { date: '2026-01-20', value: 50, origin: 'Profissional', category: 'A', item: 'y' },
        { date: '2026-02-15', value: 200, origin: 'Profissional', category: 'B', item: 'z' },
      ];
      const reference = new Date(2026, 2, 1); // March

      // When
      const result = buildSeriesFromRecords(records, { mode: 'QUARTER' }, reference);

      // Then
      expect(result).toHaveLength(3);
      const janPoint = result.find((p) => p.label === '2026-01');
      const febPoint = result.find((p) => p.label === '2026-02');
      expect(janPoint?.value).toBe(150);
      expect(febPoint?.value).toBe(200);
    });
  });

  describe('buildFilterOptions', () => {
    it('returns sorted unique categories and items', () => {
      // Given
      const records: SeriesRecord[] = [
        { date: '2026-01-01', value: 100, origin: 'Profissional', category: 'Projeto', item: 'B' },
        { date: '2026-02-01', value: 200, origin: 'Profissional', category: 'Comissão', item: 'A' },
        { date: '2026-03-01', value: 300, origin: 'Pessoal', category: 'Salário', item: 'C' },
      ];

      // When
      const result = buildFilterOptions(records);

      // Then
      expect(result.origins).toEqual(['Profissional', 'Pessoal']);
      expect(result.categories).toEqual(['Comissão', 'Projeto', 'Salário']);
      expect(result.items).toEqual(['A', 'B', 'C']);
    });

    it('cascades filters: origin narrows categories', () => {
      // Given
      const records: SeriesRecord[] = [
        { date: '2026-01-01', value: 100, origin: 'Profissional', category: 'Projeto', item: 'X' },
        { date: '2026-02-01', value: 200, origin: 'Pessoal', category: 'Salário', item: 'Y' },
      ];

      // When
      const result = buildFilterOptions(records, { origin: 'Profissional' });

      // Then
      expect(result.categories).toEqual(['Projeto']);
      expect(result.items).toEqual(['X']);
    });
  });

  describe('mapReceivablesToSeriesRecords', () => {
    it('includes only Pago/Recebido receivables', () => {
      // Given
      const receivables = [
        createTestReceivable({ id: 'r1', status: 'Pago', value: 1000, dueDate: '2026-01-01' }),
        createTestReceivable({ id: 'r2', status: 'Em Aberto', value: 500, dueDate: '2026-02-01' }),
        createTestReceivable({ id: 'r3', status: 'Recebido', value: 300, dueDate: '2026-03-01' }),
      ];
      const originById: Record<string, 'Profissional' | 'Pessoal'> = {
        r1: 'Profissional',
        r2: 'Profissional',
        r3: 'Pessoal',
      };

      // When
      const result = mapReceivablesToSeriesRecords(receivables, originById);

      // Then
      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(1000);
      expect(result[1].origin).toBe('Pessoal');
    });

    it('uses paymentDate when available, otherwise dueDate', () => {
      // Given
      const receivable = createTestReceivable({
        id: 'r1',
        status: 'Pago',
        dueDate: '2026-01-15',
        paymentDate: '2026-01-20',
      });

      // When
      const result = mapReceivablesToSeriesRecords([receivable], { r1: 'Profissional' });

      // Then
      expect(result[0].date).toBe('2026-01-20');
    });
  });

  describe('mapDebitsToSeriesRecords', () => {
    it('maps debits with correct origin and item for CashBox source', () => {
      // Given
      const debit = createTestDebit({
        id: 'd1',
        source: 'CashBox',
        value: 300,
        dueDate: '2026-02-10',
      });
      const originMap = { d1: 'Pessoal' as const };
      const itemMap = { d1: 'Aluguel' };

      // When
      const result = mapDebitsToSeriesRecords([debit], originMap, itemMap);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].origin).toBe('Pessoal');
      expect(result[0].item).toBe('Aluguel');
    });

    it('defaults to Profissional for non-CashBox debits', () => {
      // Given
      const debit = createTestDebit({ id: 'd2', source: 'Manual', value: 150 });

      // When
      const result = mapDebitsToSeriesRecords([debit], {}, {});

      // Then
      expect(result[0].origin).toBe('Profissional');
      expect(result[0].item).toBe(debit.description);
    });
  });
});
