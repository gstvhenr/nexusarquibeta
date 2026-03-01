import { describe, expect, it } from 'vitest';
import type { CashBoxExpense, CashBoxCredit } from '../types';
import {
  generateExpenses,
  getCategoriesForOrigin,
  getItemsForCategory,
  validateExpenseInput,
  buildMonthEntries,
  confirmExpense,
  confirmCredit,
} from './cashBoxService';

describe('cashBoxService', () => {
  it('returns categories and items according to origin', () => {
    // Given
    const profCategories = getCategoriesForOrigin('Profissional');
    const personalCategories = getCategoriesForOrigin('Pessoal');

    // When
    const items = getItemsForCategory('Pessoal', 'Habitação');

    // Then
    expect(profCategories).toContain('Operacional');
    expect(personalCategories).toContain('Habitação');
    expect(items).toContain('Condomínio');
  });

  it('validates required fields and business rules', () => {
    // Given
    const invalid = validateExpenseInput({
      origin: 'Profissional',
      category: 'Operacional',
      item: null,
      recurrence: 'Parcelada',
      dueDate: '',
      paymentDate: null,
      value: 0,
      installments: 1,
    });

    // When
    const result = invalid;

    // Then
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Data de vencimento é obrigatória.');
    expect(result.errors).toContain('O valor deve ser maior que zero.');
    expect(result.errors).toContain('Número de parcelas deve ser pelo menos 2.');
  });

  it('generates monthly installments with end-of-month clamp', () => {
    // Given
    const expenses = generateExpenses({
      origin: 'Profissional',
      category: 'Operacional',
      item: 'Suprimentos',
      recurrence: 'Parcelada',
      dueDate: '2026-01-31',
      paymentDate: null,
      value: 100,
      installments: 3,
    });

    // When
    const result = expenses;

    // Then
    expect(result).toHaveLength(3);
    expect(result[0].dueDate).toBe('2026-01-31');
    expect(result[1].dueDate).toBe('2026-02-28');
    expect(result[2].dueDate).toBe('2026-03-31');
    expect(result.map((entry) => entry.installmentNumber)).toEqual([1, 2, 3]);
    expect(result[0].recurringGroupId).toBeTruthy();
  });

  it('generates 12 entries for indeterminate recurrence', () => {
    // Given
    const expenses = generateExpenses({
      origin: 'Pessoal',
      category: 'Alimentação',
      item: 'Mercado',
      recurrence: 'Indeterminada',
      dueDate: '2026-04-15',
      paymentDate: null,
      value: 50,
    });

    // When
    const result = expenses;

    // Then
    expect(result).toHaveLength(12);
    expect(result[0].dueDate).toBe('2026-04-15');
    expect(result[11].dueDate).toBe('2027-03-15');
  });

  it('buildMonthEntries filters by month and computes correct totals', () => {
    // Given
    const expenses: CashBoxExpense[] = [
      {
        id: 'exp_1',
        origin: 'Profissional',
        category: 'Operacional',
        item: null,
        recurrence: 'Única',
        dueDate: '2026-03-10',
        paymentDate: null,
        value: 200,
        installmentNumber: null,
        installmentTotal: null,
        recurringGroupId: null,
        createdAt: '2026-03-01T00:00:00Z',
      },
      {
        id: 'exp_2',
        origin: 'Pessoal',
        category: 'Alimentação',
        item: null,
        recurrence: 'Única',
        dueDate: '2026-04-05',
        paymentDate: null,
        value: 100,
        installmentNumber: null,
        installmentTotal: null,
        recurringGroupId: null,
        createdAt: '2026-04-01T00:00:00Z',
      },
    ];
    const credits: CashBoxCredit[] = [
      {
        id: 'crd_1',
        origin: 'Profissional',
        category: 'Honorários',
        item: null,
        description: 'Pagamento projeto',
        date: '2026-03-15',
        value: 500,
        confirmed: false,
        createdAt: '2026-03-01T00:00:00Z',
      },
    ];

    // When
    const result = buildMonthEntries(expenses, credits, 2026, 2, false); // March = month index 2

    // Then
    expect(result.entries).toHaveLength(2);
    expect(result.totalExpenses).toBe(200);
    expect(result.totalCredits).toBe(500);
    expect(result.netBalance).toBe(300);
  });

  it('buildMonthEntries sorts ascending and descending correctly', () => {
    // Given
    const expenses: CashBoxExpense[] = [
      {
        id: 'e1',
        origin: 'Profissional',
        category: 'Operacional',
        item: null,
        recurrence: 'Única',
        dueDate: '2026-03-20',
        paymentDate: null,
        value: 50,
        installmentNumber: null,
        installmentTotal: null,
        recurringGroupId: null,
        createdAt: '2026-03-01T00:00:00Z',
      },
      {
        id: 'e2',
        origin: 'Profissional',
        category: 'Operacional',
        item: null,
        recurrence: 'Única',
        dueDate: '2026-03-05',
        paymentDate: null,
        value: 30,
        installmentNumber: null,
        installmentTotal: null,
        recurringGroupId: null,
        createdAt: '2026-03-01T00:00:00Z',
      },
    ];

    // When
    const asc = buildMonthEntries(expenses, [], 2026, 2, true);
    const desc = buildMonthEntries(expenses, [], 2026, 2, false);

    // Then
    expect(asc.entries[0].date).toBe('2026-03-05');
    expect(asc.entries[1].date).toBe('2026-03-20');
    expect(desc.entries[0].date).toBe('2026-03-20');
    expect(desc.entries[1].date).toBe('2026-03-05');
  });

  it('confirmExpense stamps paymentDate on the correct expense', () => {
    // Given
    const expenses: CashBoxExpense[] = [
      {
        id: 'exp_a',
        origin: 'Profissional',
        category: 'Operacional',
        item: null,
        recurrence: 'Única',
        dueDate: '2026-03-10',
        paymentDate: null,
        value: 100,
        installmentNumber: null,
        installmentTotal: null,
        recurringGroupId: null,
        createdAt: '2026-03-01T00:00:00Z',
      },
      {
        id: 'exp_b',
        origin: 'Pessoal',
        category: 'Alimentação',
        item: null,
        recurrence: 'Única',
        dueDate: '2026-03-15',
        paymentDate: null,
        value: 50,
        installmentNumber: null,
        installmentTotal: null,
        recurringGroupId: null,
        createdAt: '2026-03-01T00:00:00Z',
      },
    ];

    // When
    const result = confirmExpense(expenses, 'exp_a', '2026-03-10');

    // Then
    expect(result[0].paymentDate).toBe('2026-03-10');
    expect(result[1].paymentDate).toBeNull();
  });

  it('confirmCredit sets confirmed to true on the correct credit', () => {
    // Given
    const credits: CashBoxCredit[] = [
      {
        id: 'crd_a',
        origin: 'Profissional',
        category: 'Honorários',
        item: null,
        description: 'Projeto X',
        date: '2026-03-15',
        value: 1000,
        confirmed: false,
        createdAt: '2026-03-01T00:00:00Z',
      },
      {
        id: 'crd_b',
        origin: 'Pessoal',
        category: 'Salário e Renda',
        item: null,
        description: 'Salário',
        date: '2026-03-05',
        value: 5000,
        confirmed: false,
        createdAt: '2026-03-01T00:00:00Z',
      },
    ];

    // When
    const result = confirmCredit(credits, 'crd_a');

    // Then
    expect(result[0].confirmed).toBe(true);
    expect(result[1].confirmed).toBe(false);
  });
});
