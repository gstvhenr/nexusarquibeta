import type {
  Commission,
  Quotation,
  Product,
  Supplier,
  SupplierProductPrice,
  Project,
  Client,
} from '../types';
import { getLatestPriceFromHistory } from '../utils/supplierHelpers';
import { getTodayDateOnly } from '../utils/formatters';

interface QuotationCommissionInput {
  quotations: Quotation[];
  suppliers: Supplier[];
  products: Product[];
  supplierProductPrices: SupplierProductPrice[];
  projects: Project[];
  clients: Client[];
}

/**
 * Derives forecast commissions from active quotations ('Em Aberto').
 * Input -> Output:
 * - input: all quotations + supply chain data + core data
 * - output: derived Commission[] with status 'Previsão' for display only (not persisted)
 * Example:
 * const forecasts = deriveQuotationForecasts({ quotations, suppliers, products, supplierProductPrices, projects, clients });
 */
export const deriveQuotationForecasts = (input: QuotationCommissionInput): Commission[] => {
  const { quotations, suppliers, products, supplierProductPrices, projects, clients } = input;

  const activeQuotations = quotations.filter((q) => q.status === 'Em Aberto' && !q.archived);

  const allForecasts: Commission[] = [];

  activeQuotations.forEach((quotation) => {
    const safeItems = quotation.items || [];
    const selections = quotation.selections || {};
    const supplierTotals = new Map<string, { saleValue: number; percentage: number }>();

    safeItems.forEach((item) => {
      const selectedSupplierId = selections[item.productId];
      if (!selectedSupplierId) return;

      const product = products.find((p) => p.id === item.productId);
      const supplier = suppliers.find((s) => s.id === selectedSupplierId);
      if (!product || !supplier) return;

      const priceInfo = supplierProductPrices.find(
        (p) => p.productId === item.productId && p.supplierId === selectedSupplierId,
      );
      const price = priceInfo ? getLatestPriceFromHistory(priceInfo.priceHistory) || 0 : 0;
      const itemTotal = price * item.quantity;

      const existing = supplierTotals.get(selectedSupplierId);
      if (existing) {
        existing.saleValue += itemTotal;
      } else {
        supplierTotals.set(selectedSupplierId, {
          saleValue: itemTotal,
          percentage: supplier.commissionPercentage || 0,
        });
      }
    });

    const linkedProject = projects.find((p) => p.id === quotation.projectId);
    const linkedClient = linkedProject
      ? clients.find((c) => c.id === linkedProject.clientId)
      : undefined;

    supplierTotals.forEach((data, supplierId) => {
      if (data.percentage <= 0) return;

      const supplier = suppliers.find((s) => s.id === supplierId);
      if (!supplier) return;

      const commissionValue = (data.saleValue * data.percentage) / 100;
      if (commissionValue <= 0) return;

      allForecasts.push({
        id: `forecast_qt_${quotation.id}_${supplierId}`,
        saleDate: quotation.date || getTodayDateOnly(),
        supplierId,
        supplierName: supplier.name,
        clientId: linkedClient?.id || '',
        clientName: linkedClient?.name || 'Cliente não vinculado',
        saleValue: data.saleValue,
        commissionPercentage: data.percentage,
        commissionValue,
        status: 'Previsão',
        quotationId: quotation.id,
        notes: `Previsão da cotação "${quotation.name}"`,
      });
    });
  });

  return allForecasts;
};
