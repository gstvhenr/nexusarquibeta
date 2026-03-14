// --- Supply Chain Types (Suppliers, Products, Quotations) ---
export type ProductUnit = 'm²' | 'm³' | 'un' | 'pç';

export interface SupplierContact {
  name: string;
  role?: string;
  email?: string;
  phone: string;
  hasWhatsApp: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  logo: string;
  categories: string[];
  cnpj?: string;
  address?: string;
  site?: string;
  mainContact: SupplierContact;
  paymentTerms?: string;
  shippingPolicy?: string;
  commissionPercentage?: number;
  notes?: string;
  archived: boolean;
}

export interface PriceEntry {
  date: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  unit: ProductUnit;
  category: string;
  archived: boolean;
}

export interface SupplierProductPrice {
  id: string;
  productId: string;
  supplierId: string;
  priceHistory: PriceEntry[];
}

export interface QuotationItem {
  productId: string;
  quantity: number;
}

export interface Quotation {
  id: string;
  name: string;
  date: string;
  projectId?: string;
  items: QuotationItem[];
  selections?: { [productId: string]: string };
  status: 'Em Aberto' | 'Aceita' | 'Rejeitada';
  archived?: boolean;
}
