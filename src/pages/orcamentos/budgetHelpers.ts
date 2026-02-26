import type { BudgetSection, BudgetTemplateSection } from '../../types';
import { DEFAULT_BUDGET_TEMPLATE_SECTIONS } from '../../constants.budget';

export type BudgetSectionCalculation = {
  id: number;
  cost: number;
  profit: number;
  total: number;
};

export type BudgetCalculations = {
  sectionDetails: BudgetSectionCalculation[];
  grandCost: number;
  grandProfit: number;
  grandTotalBeforeDiscount: number;
  discountAmount: number;
  grandTotal: number;
  totalProfit: number;
};

export const initializeSections = (
  customTemplate: BudgetTemplateSection[] | null,
): BudgetSection[] => {
  const templateData = customTemplate || DEFAULT_BUDGET_TEMPLATE_SECTIONS;

  return templateData.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      included: false,
    })),
  }));
};

export const calculateBudgetTotals = (
  sections: BudgetSection[],
  discount: number,
): BudgetCalculations => {
  let grandCost = 0;
  let grandProfit = 0;

  const sectionDetails = sections.map((section) => {
    let sectionCost = 0;
    let sectionProfit = 0;

    const useProfitPercentage =
      (section.unit === 'h' && section.billing.method === 'per_hour') ||
      (section.unit === 'm²' && section.billing.method === 'per_sqm');

    if (useProfitPercentage) {
      const baseUnitPrice = section.billing.value || 0;
      section.items.forEach((item) => {
        if (item.included) {
          const quantity = section.unit === 'h' ? item.estimatedHours || 0 : item.quantity;
          const itemCost = quantity * baseUnitPrice;
          const itemProfit = itemCost * (item.unitPrice / 100);
          sectionCost += itemCost;
          sectionProfit += itemProfit;
        }
      });
    } else {
      const itemsSubtotal = section.items.reduce((sum, item) => {
        if (!item.included) return sum;
        const quantity = section.unit === 'h' ? item.estimatedHours || 0 : item.quantity;
        return sum + quantity * item.unitPrice;
      }, 0);

      const { method, value } = section.billing;

      switch (method) {
        case 'percentage_on_top':
          sectionCost = itemsSubtotal;
          sectionProfit = sectionCost * (value / 100);
          break;
        case 'percentage_embedded':
          sectionProfit = itemsSubtotal * (value / 100);
          sectionCost = itemsSubtotal - sectionProfit;
          break;
        case 'fixed_fee':
          sectionCost = itemsSubtotal;
          sectionProfit = value;
          break;
        case 'per_sqm':
        case 'per_hour':
          sectionCost = itemsSubtotal;
          sectionProfit = 0;
          break;
        default:
          sectionCost = itemsSubtotal;
      }
    }

    const sectionTotal = sectionCost + sectionProfit;
    grandCost += sectionCost;
    grandProfit += sectionProfit;

    return { id: section.id, cost: sectionCost, profit: sectionProfit, total: sectionTotal };
  });

  const grandTotalBeforeDiscount = grandCost + grandProfit;
  const discountAmount = grandTotalBeforeDiscount * (discount / 100);
  const grandTotalAfterDiscount = grandTotalBeforeDiscount - discountAmount;
  const finalRemuneration = grandProfit * (1 - discount / 100);

  return {
    sectionDetails,
    grandCost,
    grandProfit,
    grandTotalBeforeDiscount,
    discountAmount,
    grandTotal: grandTotalAfterDiscount,
    totalProfit: finalRemuneration,
  };
};
