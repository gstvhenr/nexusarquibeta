import type { PriceEntry, Supplier } from '../types';

/**
 * Returns the most recent price from a price history array.
 * @param priceHistory - Array of `{ date, price }` entries.
 * @returns Latest price or `null` if empty.
 *
 * @example
 * getLatestPriceFromHistory([{ date: '2026-01-01', price: 100 }]) // 100
 */
export const getLatestPriceFromHistory = (priceHistory: PriceEntry[]): number | null => {
  if (!priceHistory || priceHistory.length === 0) return null;
  return [...priceHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0].price;
};

/**
 * Extracts initials from a name string (first + last letter).
 * @example getInitials('Rafael Munaro') // 'RM'
 */
export const getInitials = (name: string) => {
  if (!name) return '?';
  const names = name.trim().split(' ');
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
};

/**
 * Returns a blank `Supplier` object suitable for form initialisation.
 */
export const getInitialSupplier = (): Supplier => ({
  id: '',
  name: '',
  logo: '',
  categories: [],
  cnpj: '',
  address: '',
  site: '',
  mainContact: { name: '', role: '', email: '', phone: '', hasWhatsApp: false },
  paymentTerms: '',
  shippingPolicy: '',
  commissionPercentage: 0,
  notes: '',
  archived: false,
});
