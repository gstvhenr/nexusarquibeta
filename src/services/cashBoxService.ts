import type {
  CashBoxExpense,
  CashBoxOrigin,
  CashBoxCategory,
  CashBoxRecurrence,
  CashBoxCreditCategory,
} from '../types';
import {
  cashBoxProfessionalCategories,
  cashBoxPersonalCategories,
  cashBoxProfessionalItems,
  cashBoxPersonalItems,
  cashBoxCreditProfessionalCategories,
  cashBoxCreditPersonalCategories,
  cashBoxCreditProfessionalItems,
  cashBoxCreditPersonalItems,
} from '../types';
import type {
  CashBoxProfessionalCategory,
  CashBoxPersonalCategory,
  CashBoxCreditProfessionalCategory,
  CashBoxCreditPersonalCategory,
} from '../types';

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Returns the last day of a given month+year.
 * @example getLastDayOfMonth(2026, 1) → 28 (Feb 2026)
 */
const getLastDayOfMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

/**
 * Clamps a desired day to the actual last day of a target month.
 * Handles months that don't have 29/30/31.
 * @example clampDay(31, 2026, 1) → 28
 */
const clampDay = (desiredDay: number, year: number, month: number): number =>
  Math.min(desiredDay, getLastDayOfMonth(year, month));

/**
 * Generates a YYYY-MM-DD string for a target month, clamping the day.
 */
const buildDateString = (desiredDay: number, year: number, month: number): string => {
  const d = clampDay(desiredDay, year, month);
  const date = new Date(year, month, d);
  return date.toISOString().split('T')[0];
};

// ── Public API ───────────────────────────────────────────────────────

/**
 * Returns the list of categories for a given origin.
 * @param origin - 'Profissional' | 'Pessoal'
 * @returns string[] of category names
 * @example getCategoriesForOrigin('Pessoal') → ['Alimentação', 'Desenvolvimento', ...]
 */
export const getCategoriesForOrigin = (origin: CashBoxOrigin): CashBoxCategory[] => {
  if (origin === 'Profissional') return [...cashBoxProfessionalCategories];
  return [...cashBoxPersonalCategories];
};

/**
 * Returns the list of items for a given origin + category.
 * @param origin - 'Profissional' | 'Pessoal'
 * @param category - selected category
 * @returns string[] of item names (may be empty)
 * @example getItemsForCategory('Profissional', 'Escritório') → ['Aluguel do Escritório', ...]
 */
export const getItemsForCategory = (origin: CashBoxOrigin, category: CashBoxCategory): string[] => {
  if (origin === 'Profissional') {
    return cashBoxProfessionalItems[category as CashBoxProfessionalCategory] ?? [];
  }
  return cashBoxPersonalItems[category as CashBoxPersonalCategory] ?? [];
};

/**
 * Returns the list of credit categories for a given origin.
 * @param origin - 'Profissional' | 'Pessoal'
 * @returns CashBoxCreditCategory[] of category names
 * @example getCreditCategoriesForOrigin('Profissional') → ['Honorários', 'Consultoria', ...]
 */
export const getCreditCategoriesForOrigin = (origin: CashBoxOrigin): CashBoxCreditCategory[] => {
  if (origin === 'Profissional') return [...cashBoxCreditProfessionalCategories];
  return [...cashBoxCreditPersonalCategories];
};

/**
 * Returns the list of items for a given origin + credit category.
 * @param origin - 'Profissional' | 'Pessoal'
 * @param category - selected credit category
 * @returns string[] of item names (may be empty)
 * @example getCreditItemsForCategory('Profissional', 'Honorários') → ['Pagamento de Projeto', ...]
 */
export const getCreditItemsForCategory = (
  origin: CashBoxOrigin,
  category: CashBoxCreditCategory,
): string[] => {
  if (origin === 'Profissional') {
    return cashBoxCreditProfessionalItems[category as CashBoxCreditProfessionalCategory] ?? [];
  }
  return cashBoxCreditPersonalItems[category as CashBoxCreditPersonalCategory] ?? [];
};

/** Number of months to generate for indeterminate recurrence (rolling window). */
const INDETERMINATE_MONTHS = 12;

export interface CreateExpenseInput {
  origin: CashBoxOrigin;
  category: CashBoxCategory;
  item: string | null;
  recurrence: CashBoxRecurrence;
  dueDate: string; // initial due date (YYYY-MM-DD)
  /** Date the expense was actually paid. Null if not yet paid. */
  paymentDate: string | null;
  value: number;
  /** Required when recurrence === 'Parcelada'. */
  installments?: number;
}

export interface CreateExpenseValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a CreateExpenseInput before persisting.
 * @param input - form data
 * @returns { valid, errors }
 * @example validateExpenseInput({ origin: '', ... }) → { valid: false, errors: ['Origem é obrigatória.'] }
 */
export const validateExpenseInput = (input: CreateExpenseInput): CreateExpenseValidation => {
  const errors: string[] = [];

  if (!input.origin) errors.push('Origem é obrigatória.');
  if (!input.category) errors.push('Categoria é obrigatória.');
  if (!input.recurrence) errors.push('Recorrência é obrigatória.');
  if (!input.dueDate) errors.push('Data de vencimento é obrigatória.');
  if (input.value <= 0) errors.push('O valor deve ser maior que zero.');

  if (input.recurrence === 'Parcelada') {
    if (!input.installments || input.installments < 2) {
      errors.push('Número de parcelas deve ser pelo menos 2.');
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Generates the list of CashBoxExpense records from validated input.
 * - Única: 1 record
 * - Parcelada: N records, one per month, same day (clamped)
 * - Indeterminada: 12 records rolling, same day (clamped)
 *
 * @param input - validated form data
 * @returns CashBoxExpense[] ready for persistence
 * @example generateExpenses({ ..., recurrence: 'Única', dueDate: '2026-03-15', value: 100 }) → [{ id: '...', dueDate: '2026-03-15', ... }]
 */
export const generateExpenses = (input: CreateExpenseInput): CashBoxExpense[] => {
  const now = new Date().toISOString();
  const baseDateParts = input.dueDate.split('-');
  const baseYear = parseInt(baseDateParts[0], 10);
  const baseMonth = parseInt(baseDateParts[1], 10) - 1; // 0-indexed
  const baseDay = parseInt(baseDateParts[2], 10);
  const groupId = `grp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const makeId = (idx: number) =>
    `cbx_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`;

  if (input.recurrence === 'Única') {
    return [
      {
        id: makeId(0),
        origin: input.origin,
        category: input.category,
        item: input.item,
        recurrence: 'Única',
        dueDate: input.dueDate,
        paymentDate: input.paymentDate,
        value: input.value,
        installmentNumber: null,
        installmentTotal: null,
        recurringGroupId: null,
        createdAt: now,
      },
    ];
  }

  const count = input.recurrence === 'Parcelada' ? (input.installments ?? 2) : INDETERMINATE_MONTHS;

  const entries: CashBoxExpense[] = [];

  for (let i = 0; i < count; i++) {
    const targetMonth = baseMonth + i;
    const targetDate = new Date(baseYear, targetMonth, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    entries.push({
      id: makeId(i),
      origin: input.origin,
      category: input.category,
      item: input.item,
      recurrence: input.recurrence,
      dueDate: buildDateString(baseDay, year, month),
      paymentDate: null,
      value: input.value,
      installmentNumber: input.recurrence === 'Parcelada' ? i + 1 : null,
      installmentTotal: input.recurrence === 'Parcelada' ? count : null,
      recurringGroupId: groupId,
      createdAt: now,
    });
  }

  return entries;
};
