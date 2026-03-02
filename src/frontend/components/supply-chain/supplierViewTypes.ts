import type { Commission, Product, Quotation } from '../../types';

export type SupplierActiveTab = 'details' | 'products' | 'commissions' | 'quotations';

export type SupplierProductSnapshot = {
  product: Product;
  latestPrice: number;
  lastUpdated: Date | null;
};

export type SupplierQuotationsSummary = {
  pending: Quotation[];
  finalized: Quotation[];
  totalValue: number;
};

export type SupplierCommissionHistory = Commission[];
