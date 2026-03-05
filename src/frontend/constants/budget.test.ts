import { describe, expect, it } from 'vitest';
import { DEFAULT_BUDGET_TEMPLATE_SECTIONS } from './budget';

const ALLOWED_BILLING_METHODS = new Set([
  'percentage_on_top',
  'percentage_embedded',
  'fixed_fee',
  'per_sqm',
  'per_hour',
]);

describe('constants/budget', () => {
  it('exposes the canonical budget template sections in expected order', () => {
    expect(DEFAULT_BUDGET_TEMPLATE_SECTIONS.map((section) => section.title)).toEqual([
      'Projeto Arquitetônico',
      'Design de Interiores',
      'Projetos Complementares',
      'Gerenciamento de Obra',
      'Consultoria e Serviços Adicionais',
    ]);
  });

  it('keeps section and item ids globally unique', () => {
    const sectionIds = new Set<number>();
    const itemIds = new Set<number>();

    DEFAULT_BUDGET_TEMPLATE_SECTIONS.forEach((section) => {
      expect(sectionIds.has(section.id)).toBe(false);
      sectionIds.add(section.id);

      section.items.forEach((item) => {
        expect(itemIds.has(item.id)).toBe(false);
        itemIds.add(item.id);
      });
    });

    expect(sectionIds.size).toBe(DEFAULT_BUDGET_TEMPLATE_SECTIONS.length);
    expect(itemIds.size).toBeGreaterThan(0);
  });

  it('keeps billing and item values valid for all sections', () => {
    DEFAULT_BUDGET_TEMPLATE_SECTIONS.forEach((section) => {
      expect(section.title).toBeTruthy();
      expect(section.items.length).toBeGreaterThan(0);
      expect(ALLOWED_BILLING_METHODS.has(section.billing.method)).toBe(true);
      expect(Number.isFinite(section.billing.value)).toBe(true);
      expect(section.billing.value).toBeGreaterThan(0);

      section.items.forEach((item) => {
        expect(item.description).toBeTruthy();
        expect(Number.isFinite(item.quantity)).toBe(true);
        expect(Number.isFinite(item.unitPrice)).toBe(true);
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.unitPrice).toBeGreaterThan(0);
        expect(item.estimatedHours ?? 0).toBeGreaterThanOrEqual(0);
      });
    });
  });

  it('contains at least one entry with estimated hours for planning scenarios', () => {
    const allItems = DEFAULT_BUDGET_TEMPLATE_SECTIONS.flatMap((section) => section.items);
    const withEstimatedHours = allItems.filter(
      (item) => typeof item.estimatedHours === 'number' && item.estimatedHours > 0,
    );

    expect(withEstimatedHours.length).toBeGreaterThan(0);
  });
});
