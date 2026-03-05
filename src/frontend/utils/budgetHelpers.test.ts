import { describe, expect, it } from 'vitest';
import type { BudgetSection } from '../types';
import { calculateBudgetTotals, initializeSections } from './budgetHelpers';

// ---------------------------------------------------------------------------
// Helpers — typed test data builders
// ---------------------------------------------------------------------------

type SectionOverride = Partial<BudgetSection>;

const makeSection = (overrides: SectionOverride): BudgetSection => ({
  id: 1,
  title: 'Test Section',
  unit: 'un',
  billing: { method: 'percentage_on_top', value: 20 },
  items: [],
  ...overrides,
});

// ---------------------------------------------------------------------------
// initializeSections
// ---------------------------------------------------------------------------

describe('initializeSections', () => {
  it('uses default template when customTemplate is null', () => {
    // Act
    const sections = initializeSections(null);

    // Assert — default template has 5 sections
    expect(sections.length).toBeGreaterThan(0);
  });

  it('sets every item.included to false', () => {
    // Act
    const sections = initializeSections(null);

    // Assert
    sections.forEach((section) => {
      section.items.forEach((item) => {
        expect(item.included).toBe(false);
      });
    });
  });

  it('uses custom template when provided', () => {
    // Arrange
    const customTemplate = [
      {
        id: 99,
        title: 'Custom Section',
        unit: 'un' as const,
        billing: { method: 'percentage_on_top' as const, value: 10 },
        items: [
          { id: 1, description: 'Item A', quantity: 2, unitPrice: 100, estimatedHours: 0 },
        ],
      },
    ];

    // Act
    const sections = initializeSections(customTemplate);

    // Assert
    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe(99);
    expect(sections[0].title).toBe('Custom Section');
    expect(sections[0].items[0].included).toBe(false);
  });

  it('does not mutate the original template items', () => {
    // Arrange
    const customTemplate = [
      {
        id: 10,
        title: 'Imutável',
        unit: 'vb' as const,
        billing: { method: 'fixed_fee' as const, value: 500 },
        items: [{ id: 1, description: 'Item', quantity: 1, unitPrice: 200, estimatedHours: 0 }],
      },
    ];
    const originalIncluded = (customTemplate[0].items[0] as unknown as { included?: boolean }).included;

    // Act
    initializeSections(customTemplate);

    // Assert — original template item should NOT have had 'included'
    expect((customTemplate[0].items[0] as unknown as { included?: boolean }).included).toBe(
      originalIncluded,
    );
  });

  it('preserves all section metadata from template', () => {
    // Arrange
    const customTemplate = [
      {
        id: 7,
        title: 'Gerenciamento',
        unit: 'h' as const,
        billing: { method: 'per_hour' as const, value: 120 },
        items: [],
      },
    ];

    // Act
    const [section] = initializeSections(customTemplate);

    // Assert
    expect(section.id).toBe(7);
    expect(section.title).toBe('Gerenciamento');
    expect(section.unit).toBe('h');
    expect(section.billing.method).toBe('per_hour');
    expect(section.billing.value).toBe(120);
  });
});

// ---------------------------------------------------------------------------
// calculateBudgetTotals — percentage_on_top
// ---------------------------------------------------------------------------

describe('calculateBudgetTotals — billing: percentage_on_top', () => {
  it('adds percentage on top of items subtotal', () => {
    // Arrange — 2 items: 1×100 + 1×200 = 300 cost; 20% profit = 60
    const sections: BudgetSection[] = [
      makeSection({
        id: 1,
        unit: 'un',
        billing: { method: 'percentage_on_top', value: 20 },
        items: [
          { id: 1, description: 'A', quantity: 1, unitPrice: 100, included: true },
          { id: 2, description: 'B', quantity: 1, unitPrice: 200, included: true },
        ],
      }),
    ];

    // Act
    const result = calculateBudgetTotals(sections, 0);

    // Assert
    expect(result.grandCost).toBe(300);
    expect(result.grandProfit).toBe(60);
    expect(result.grandTotalBeforeDiscount).toBe(360);
    expect(result.grandTotal).toBe(360);
  });

  it('excludes items not included from calculation', () => {
    // Arrange — only first item is included
    const sections: BudgetSection[] = [
      makeSection({
        id: 1,
        unit: 'un',
        billing: { method: 'percentage_on_top', value: 10 },
        items: [
          { id: 1, description: 'Included', quantity: 1, unitPrice: 500, included: true },
          { id: 2, description: 'Excluded', quantity: 1, unitPrice: 1000, included: false },
        ],
      }),
    ];

    // Act
    const result = calculateBudgetTotals(sections, 0);

    // Assert — only 500 counted
    expect(result.grandCost).toBe(500);
    expect(result.grandProfit).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// calculateBudgetTotals — percentage_embedded
// ---------------------------------------------------------------------------

describe('calculateBudgetTotals — billing: percentage_embedded', () => {
  it('extracts profit from the item price (margin already embedded)', () => {
    // Arrange — subtotal = 1000; 20% embedded → profit = 200; cost = 800
    const sections: BudgetSection[] = [
      makeSection({
        id: 1,
        unit: 'un',
        billing: { method: 'percentage_embedded', value: 20 },
        items: [{ id: 1, description: 'Item', quantity: 1, unitPrice: 1000, included: true }],
      }),
    ];

    // Act
    const result = calculateBudgetTotals(sections, 0);

    // Assert
    expect(result.grandProfit).toBe(200);
    expect(result.grandCost).toBe(800);
    expect(result.grandTotalBeforeDiscount).toBe(1000);
  });
});

// ---------------------------------------------------------------------------
// calculateBudgetTotals — fixed_fee
// ---------------------------------------------------------------------------

describe('calculateBudgetTotals — billing: fixed_fee', () => {
  it('sets profit to the fixed fee value regardless of item total', () => {
    // Arrange — items sum = 800; fixed fee = 300
    const sections: BudgetSection[] = [
      makeSection({
        id: 1,
        unit: 'un',
        billing: { method: 'fixed_fee', value: 300 },
        items: [{ id: 1, description: 'Item', quantity: 2, unitPrice: 400, included: true }],
      }),
    ];

    // Act
    const result = calculateBudgetTotals(sections, 0);

    // Assert
    expect(result.grandCost).toBe(800);
    expect(result.grandProfit).toBe(300);
    expect(result.grandTotalBeforeDiscount).toBe(1100);
  });
});

// ---------------------------------------------------------------------------
// calculateBudgetTotals — per_hour (h unit + per_hour method)
// ---------------------------------------------------------------------------

describe('calculateBudgetTotals — billing: per_hour', () => {
  it('calculates cost from hours × base rate; profit from item unitPrice as percentage', () => {
    // Arrange — 4 hours × 100/h = 400 cost; item.unitPrice = 30 → 30% profit = 120
    const sections: BudgetSection[] = [
      makeSection({
        id: 1,
        unit: 'h',
        billing: { method: 'per_hour', value: 100 }, // base rate per hour
        items: [
          {
            id: 1,
            description: 'Estudo',
            quantity: 1,
            unitPrice: 30, // 30% profit
            estimatedHours: 4,
            included: true,
          },
        ],
      }),
    ];

    // Act
    const result = calculateBudgetTotals(sections, 0);

    // Assert
    expect(result.grandCost).toBe(400); // 4h × 100
    expect(result.grandProfit).toBe(120); // 400 × 30%
    expect(result.grandTotalBeforeDiscount).toBe(520);
  });

  it('ignores not-included items in per_hour sections', () => {
    // Arrange
    const sections: BudgetSection[] = [
      makeSection({
        id: 1,
        unit: 'h',
        billing: { method: 'per_hour', value: 100 },
        items: [
          { id: 1, description: 'A', quantity: 1, unitPrice: 20, estimatedHours: 5, included: true },
          { id: 2, description: 'B', quantity: 1, unitPrice: 20, estimatedHours: 10, included: false },
        ],
      }),
    ];

    // Act
    const result = calculateBudgetTotals(sections, 0);

    // Assert — only item 1 contributes
    expect(result.grandCost).toBe(500); // 5h × 100
    expect(result.grandProfit).toBe(100); // 500 × 20%
  });
});

// ---------------------------------------------------------------------------
// calculateBudgetTotals — discount
// ---------------------------------------------------------------------------

describe('calculateBudgetTotals — discount', () => {
  it('returns zero discount when discount = 0', () => {
    // Arrange
    const sections: BudgetSection[] = [
      makeSection({
        id: 1,
        unit: 'un',
        billing: { method: 'percentage_on_top', value: 10 },
        items: [{ id: 1, description: 'Item', quantity: 1, unitPrice: 1000, included: true }],
      }),
    ];

    // Act
    const result = calculateBudgetTotals(sections, 0);

    // Assert
    expect(result.discountAmount).toBe(0);
    expect(result.grandTotal).toBe(result.grandTotalBeforeDiscount);
  });

  it('applies discount correctly to the total before discount', () => {
    // Arrange — total = 1100; 10% discount = 110 → final = 990
    const sections: BudgetSection[] = [
      makeSection({
        id: 1,
        unit: 'un',
        billing: { method: 'percentage_on_top', value: 10 },
        items: [{ id: 1, description: 'Item', quantity: 1, unitPrice: 1000, included: true }],
      }),
    ];

    // Act
    const result = calculateBudgetTotals(sections, 10);

    // Assert
    expect(result.grandTotalBeforeDiscount).toBe(1100);
    expect(result.discountAmount).toBe(110);
    expect(result.grandTotal).toBe(990);
  });

  it('reduces totalProfit proportionally when discount is applied', () => {
    // Arrange — profit = 100; 50% discount → effective profit = 50
    const sections: BudgetSection[] = [
      makeSection({
        id: 1,
        unit: 'un',
        billing: { method: 'percentage_on_top', value: 10 },
        items: [{ id: 1, description: 'Item', quantity: 1, unitPrice: 1000, included: true }],
      }),
    ];

    // Act
    const result = calculateBudgetTotals(sections, 50);

    // Assert — profit is 100 * (1 - 0.50) = 50
    expect(result.totalProfit).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// calculateBudgetTotals — empty / edge cases
// ---------------------------------------------------------------------------

describe('calculateBudgetTotals — edge cases', () => {
  it('returns all zeros for an empty sections array', () => {
    // Act
    const result = calculateBudgetTotals([], 0);

    // Assert
    expect(result.grandCost).toBe(0);
    expect(result.grandProfit).toBe(0);
    expect(result.grandTotal).toBe(0);
    expect(result.discountAmount).toBe(0);
    expect(result.sectionDetails).toEqual([]);
  });

  it('returns all zeros for a section with no included items', () => {
    // Arrange
    const sections: BudgetSection[] = [
      makeSection({
        id: 1,
        unit: 'un',
        billing: { method: 'percentage_on_top', value: 20 },
        items: [
          { id: 1, description: 'X', quantity: 5, unitPrice: 300, included: false },
        ],
      }),
    ];

    // Act
    const result = calculateBudgetTotals(sections, 0);

    // Assert
    expect(result.grandCost).toBe(0);
    expect(result.grandProfit).toBe(0);
  });

  it('aggregates totals across multiple sections', () => {
    // Arrange — 2 sections each yield 1000 cost + 100 profit
    const sections: BudgetSection[] = [
      makeSection({
        id: 1,
        unit: 'un',
        billing: { method: 'percentage_on_top', value: 10 },
        items: [{ id: 1, description: 'A', quantity: 1, unitPrice: 1000, included: true }],
      }),
      makeSection({
        id: 2,
        unit: 'un',
        billing: { method: 'percentage_on_top', value: 10 },
        items: [{ id: 2, description: 'B', quantity: 1, unitPrice: 1000, included: true }],
      }),
    ];

    // Act
    const result = calculateBudgetTotals(sections, 0);

    // Assert
    expect(result.grandCost).toBe(2000);
    expect(result.grandProfit).toBe(200);
    expect(result.grandTotalBeforeDiscount).toBe(2200);
    expect(result.sectionDetails).toHaveLength(2);
  });

  it('sectionDetails maps section ids to correct cost/profit/total', () => {
    // Arrange
    const sections: BudgetSection[] = [
      makeSection({
        id: 42,
        unit: 'un',
        billing: { method: 'percentage_on_top', value: 25 },
        items: [{ id: 1, description: 'Item', quantity: 1, unitPrice: 400, included: true }],
      }),
    ];

    // Act
    const result = calculateBudgetTotals(sections, 0);

    // Assert
    expect(result.sectionDetails[0].id).toBe(42);
    expect(result.sectionDetails[0].cost).toBe(400);
    expect(result.sectionDetails[0].profit).toBe(100);
    expect(result.sectionDetails[0].total).toBe(500);
  });
});
