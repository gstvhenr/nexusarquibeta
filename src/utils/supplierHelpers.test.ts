import { describe, expect, it } from 'vitest';
import { getLatestPriceFromHistory, getInitials, getInitialSupplier } from './supplierHelpers';
import type { PriceEntry } from '../types';

describe('supplierHelpers', () => {
  describe('getLatestPriceFromHistory', () => {
    it('returns null for empty array', () => {
      // Given
      const history: PriceEntry[] = [];

      // When
      const result = getLatestPriceFromHistory(history);

      // Then
      expect(result).toBeNull();
    });

    it('returns the single price when only one entry exists', () => {
      // Given
      const history: PriceEntry[] = [{ date: '2026-01-15', price: 250 }];

      // When
      const result = getLatestPriceFromHistory(history);

      // Then
      expect(result).toBe(250);
    });

    it('returns the most recent price from multiple entries', () => {
      // Given
      const history: PriceEntry[] = [
        { date: '2025-06-01', price: 100 },
        { date: '2026-01-15', price: 250 },
        { date: '2025-12-01', price: 200 },
      ];

      // When
      const result = getLatestPriceFromHistory(history);

      // Then
      expect(result).toBe(250);
    });
  });

  describe('getInitials', () => {
    it('returns two-letter initials for full name', () => {
      // Given / When
      const result = getInitials('Rafael Munaro');

      // Then
      expect(result).toBe('RM');
    });

    it('returns first two characters for a single name', () => {
      // Given / When
      const result = getInitials('Rafael');

      // Then
      expect(result).toBe('RA');
    });

    it('returns ? for empty string', () => {
      // Given / When
      const result = getInitials('');

      // Then
      expect(result).toBe('?');
    });

    it('uses first and last name initials for three-word name', () => {
      // Given / When
      const result = getInitials('Ana Maria Silva');

      // Then
      expect(result).toBe('AS');
    });
  });

  describe('getInitialSupplier', () => {
    it('returns a complete Supplier object with default values', () => {
      // Given / When
      const supplier = getInitialSupplier();

      // Then
      expect(supplier.id).toBe('');
      expect(supplier.name).toBe('');
      expect(supplier.categories).toEqual([]);
      expect(supplier.archived).toBe(false);
      expect(supplier.commissionPercentage).toBe(0);
      expect(supplier.mainContact).toEqual({
        name: '',
        role: '',
        email: '',
        phone: '',
        hasWhatsApp: false,
      });
    });
  });
});
