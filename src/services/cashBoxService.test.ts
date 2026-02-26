import { describe, expect, it } from 'vitest';
import {
  generateExpenses,
  getCategoriesForOrigin,
  getItemsForCategory,
  validateExpenseInput,
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
});
