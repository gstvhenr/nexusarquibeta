import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppData, Client } from '../../types';

// ---------------------------------------------------------------------------
// Hoisted mocks — declared before vi.mock factory runs
// ---------------------------------------------------------------------------
const { mockLoadData, mockUpdateData, mockInvalidateCacheAndNotify } = vi.hoisted(() => ({
  mockLoadData: vi.fn<() => AppData>(),
  mockUpdateData: vi.fn<(key: keyof AppData, value: unknown) => void>(),
  mockInvalidateCacheAndNotify: vi.fn<() => void>(),
}));

vi.mock('./loadData', () => ({
  loadData: mockLoadData,
  updateData: mockUpdateData,
  invalidateCacheAndNotify: mockInvalidateCacheAndNotify,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeAppData = (partial: Partial<AppData> = {}): AppData =>
  ({
    projects: [],
    proposals: [],
    clients: [],
    documentStorage: {} as AppData['documentStorage'],
    suppliers: [],
    products: [],
    supplierProductPrices: [],
    quotations: [],
    commissions: [],
    marketingProfessionals: [],
    marketingActivities: [],
    marketingIdeas: [],
    socialNetworks: [],
    freelancers: [],
    agendaEvents: [],
    manualExpenses: [],
    manualIncomes: [],
    customBudgetTemplate: null,
    globalIdentifierCounter: 2500,
    dismissedFocusItems: [],
    acceptedPaymentMethods: [],
    hiredServices: [],
    prospects: [],
    contractDeadlines: { defaultPreliminarDeadlineDays: 7, defaultExecutiveDeadlineDays: 30 },
    cashBoxExpenses: [],
    cashBoxCredits: [],
    reminders: [],
    ...partial,
  }) as AppData;

const makeClient = (partial: Partial<Client> = {}): Client =>
  ({
    id: 'client-01',
    name: 'Acme Corp',
    email: 'acme@example.com',
    ...partial,
  }) as Client;

// ---------------------------------------------------------------------------
// Module under test (dynamic import so vi.mock is guaranteed to be applied)
// ---------------------------------------------------------------------------
type ImportExportModule = typeof import('./importExport');
let importData: ImportExportModule['importData'];
let exportData: ImportExportModule['exportData'];
let importClients: ImportExportModule['importClients'];
let canAcceptImportedValue: ImportExportModule['canAcceptImportedValue'];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('importExport', () => {
  beforeEach(async () => {
    vi.resetModules();

    const module: ImportExportModule = await import('./importExport');
    importData = module.importData;
    exportData = module.exportData;
    importClients = module.importClients;
    canAcceptImportedValue = module.canAcceptImportedValue;

    // Default: loadData returns a clean snapshot
    mockLoadData.mockReturnValue(makeAppData());
    mockUpdateData.mockReturnValue(undefined);
    mockInvalidateCacheAndNotify.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // canAcceptImportedValue — type guard
  // -------------------------------------------------------------------------
  describe('canAcceptImportedValue', () => {
    it('accepts an array when the current value is an array', () => {
      expect(canAcceptImportedValue('projects', [], [])).toBe(true);
    });

    it('rejects a non-array when the current value is an array', () => {
      expect(canAcceptImportedValue('projects', { not: 'an array' }, [])).toBe(false);
    });

    it('accepts a finite number when the current value is a number', () => {
      expect(canAcceptImportedValue('globalIdentifierCounter', 3000, 2500)).toBe(true);
    });

    it('rejects Infinity for a number field', () => {
      expect(canAcceptImportedValue('globalIdentifierCounter', Infinity, 2500)).toBe(false);
    });

    it('rejects a string for a number field', () => {
      expect(canAcceptImportedValue('globalIdentifierCounter', '3000', 2500)).toBe(false);
    });

    it('accepts a plain object when the current value is a plain object', () => {
      const currentStorage = {} as AppData['documentStorage'];
      expect(canAcceptImportedValue('documentStorage', { key: 'value' }, currentStorage)).toBe(
        true,
      );
    });

    it('rejects null for a plain-object field', () => {
      const currentStorage = {} as AppData['documentStorage'];
      expect(canAcceptImportedValue('documentStorage', null, currentStorage)).toBe(false);
    });

    it('accepts null for customBudgetTemplate (nullable field)', () => {
      expect(canAcceptImportedValue('customBudgetTemplate', null, null)).toBe(true);
    });

    it('accepts an array for customBudgetTemplate', () => {
      expect(canAcceptImportedValue('customBudgetTemplate', [], null)).toBe(true);
    });

    it('rejects a non-array non-null value for customBudgetTemplate', () => {
      expect(canAcceptImportedValue('customBudgetTemplate', 'invalid', null)).toBe(false);
    });

    it('accepts a valid ContractDeadlinesSettings object', () => {
      const current = { defaultPreliminarDeadlineDays: 7, defaultExecutiveDeadlineDays: 30 };
      const incoming = { defaultPreliminarDeadlineDays: 14, defaultExecutiveDeadlineDays: 60 };
      expect(canAcceptImportedValue('contractDeadlines', incoming, current)).toBe(true);
    });

    it('rejects ContractDeadlinesSettings with missing numeric fields', () => {
      const current = { defaultPreliminarDeadlineDays: 7, defaultExecutiveDeadlineDays: 30 };
      expect(
        canAcceptImportedValue('contractDeadlines', { defaultPreliminarDeadlineDays: 7 }, current),
      ).toBe(false);
    });

    it('rejects ContractDeadlinesSettings with negative values', () => {
      const current = { defaultPreliminarDeadlineDays: 7, defaultExecutiveDeadlineDays: 30 };
      const incoming = { defaultPreliminarDeadlineDays: -1, defaultExecutiveDeadlineDays: 30 };
      expect(canAcceptImportedValue('contractDeadlines', incoming, current)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // exportData
  // -------------------------------------------------------------------------
  describe('exportData', () => {
    it('returns a valid JSON string of the current AppData', () => {
      // Arrange
      const snapshot = makeAppData({ dismissedFocusItems: ['item-a'] });
      mockLoadData.mockReturnValue(snapshot);

      // Act
      const result = exportData();

      // Assert
      expect(mockLoadData).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(result) as Partial<AppData>;
      expect(parsed.dismissedFocusItems).toEqual(['item-a']);
    });

    it('produces pretty-printed JSON (indent = 2)', () => {
      // Arrange
      mockLoadData.mockReturnValue(makeAppData());

      // Act
      const result = exportData();

      // Assert — pretty-printed JSON has newlines induced by 2-space indent
      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });
  });

  // -------------------------------------------------------------------------
  // importData
  // -------------------------------------------------------------------------
  describe('importData', () => {
    it('throws on malformed JSON', () => {
      expect(() => importData('{ invalid json')).toThrow('JSON inválido para importação de dados.');
    });

    it('throws when the parsed value is not a plain object (e.g., an array)', () => {
      expect(() => importData('[]')).toThrow(
        'Formato inválido. O conteúdo importado deve ser um objeto JSON.',
      );
    });

    it('throws when the parsed value is a primitive (e.g., a string)', () => {
      expect(() => importData('"just a string"')).toThrow(
        'Formato inválido. O conteúdo importado deve ser um objeto JSON.',
      );
    });

    it('updates valid keys and notifies cache invalidation', () => {
      // Arrange
      const currentData = makeAppData();
      mockLoadData.mockReturnValue(currentData);
      const incoming = { dismissedFocusItems: ['item-a', 'item-b'] };

      // Act
      importData(JSON.stringify(incoming));

      // Assert
      expect(mockUpdateData).toHaveBeenCalledWith('dismissedFocusItems', ['item-a', 'item-b']);
      expect(mockInvalidateCacheAndNotify).toHaveBeenCalledTimes(1);
    });

    it('silently ignores keys that are not present in the current AppData schema', () => {
      // Arrange
      const currentData = makeAppData();
      mockLoadData.mockReturnValue(currentData);
      const incoming = { unknownKey: 'should be ignored', dismissedFocusItems: ['valid'] };

      // Act — must not throw
      importData(JSON.stringify(incoming));

      // Assert — only the valid key triggers updateData
      expect(mockUpdateData).toHaveBeenCalledTimes(1);
      expect(mockUpdateData).toHaveBeenCalledWith('dismissedFocusItems', ['valid']);
    });

    it('silently ignores keys whose incoming value has a wrong type', () => {
      // Arrange — projects expects an array; send a string instead
      const currentData = makeAppData();
      mockLoadData.mockReturnValue(currentData);
      const incoming = { projects: 'not-an-array' };

      // Act
      importData(JSON.stringify(incoming));

      // Assert — wrong type key is skipped
      expect(mockUpdateData).not.toHaveBeenCalled();
      // Cache is still invalidated
      expect(mockInvalidateCacheAndNotify).toHaveBeenCalledTimes(1);
    });

    it('skips keys whose incoming value is undefined', () => {
      // Arrange — only serialise keys that exist in the import payload
      const currentData = makeAppData();
      mockLoadData.mockReturnValue(currentData);

      // Sending an object with no matching AppData keys
      importData(JSON.stringify({}));

      // Assert — nothing updated but notify still called
      expect(mockUpdateData).not.toHaveBeenCalled();
      expect(mockInvalidateCacheAndNotify).toHaveBeenCalledTimes(1);
    });

    it('can import multiple valid keys in a single call', () => {
      // Arrange
      const currentData = makeAppData();
      mockLoadData.mockReturnValue(currentData);
      const incoming = {
        dismissedFocusItems: ['item-a'],
        globalIdentifierCounter: 3000,
      };

      // Act
      importData(JSON.stringify(incoming));

      // Assert — both keys are updated
      expect(mockUpdateData).toHaveBeenCalledWith('dismissedFocusItems', ['item-a']);
      expect(mockUpdateData).toHaveBeenCalledWith('globalIdentifierCounter', 3000);
      expect(mockUpdateData).toHaveBeenCalledTimes(2);
    });
  });

  // -------------------------------------------------------------------------
  // importClients
  // -------------------------------------------------------------------------
  describe('importClients', () => {
    it('throws on malformed JSON', () => {
      expect(() => importClients('{ invalid json')).toThrow();
    });

    it('throws when the parsed value is not an array', () => {
      expect(() => importClients(JSON.stringify({ id: 'c1' }))).toThrow(
        'Formato inválido. Esperado um array de clientes.',
      );
    });

    it('appends new clients that are not in the current list', () => {
      // Arrange
      const existingClient = makeClient({ id: 'existing-01' });
      const currentData = makeAppData({ clients: [existingClient] });
      mockLoadData.mockReturnValue(currentData);

      const newClient = makeClient({ id: 'new-02', name: 'Beta Inc.' });

      // Act
      importClients(JSON.stringify([newClient]));

      // Assert — both the existing and the new client are in the update call
      expect(mockUpdateData).toHaveBeenCalledWith(
        'clients',
        expect.arrayContaining([
          expect.objectContaining({ id: 'existing-01' }),
          expect.objectContaining({ id: 'new-02' }),
        ]),
      );
    });

    it('merges fields of an existing client by ID (does not duplicate)', () => {
      // Arrange
      const existing = makeClient({ id: 'c1', name: 'Old Name', email: 'old@example.com' });
      const currentData = makeAppData({ clients: [existing] });
      mockLoadData.mockReturnValue(currentData);

      const updated = makeClient({ id: 'c1', name: 'New Name' });

      // Act
      importClients(JSON.stringify([updated]));

      // Assert
      const [, updatedClients] = mockUpdateData.mock.calls[0] as [keyof AppData, Client[]];
      expect(updatedClients).toHaveLength(1);
      expect(updatedClients[0]).toMatchObject({ id: 'c1', name: 'New Name' });
    });

    it('preserves fields of an existing client not overridden by the import', () => {
      // Arrange
      const existing = makeClient({ id: 'c1', name: 'Keep', email: 'keep@example.com' });
      mockLoadData.mockReturnValue(makeAppData({ clients: [existing] }));

      // Import only updates the name field
      const partial = { id: 'c1', name: 'Updated' } as Client;

      // Act
      importClients(JSON.stringify([partial]));

      // Assert — email (not in import) is preserved via spread
      const [, clients] = mockUpdateData.mock.calls[0] as [keyof AppData, Client[]];
      expect(clients[0].email).toBe('keep@example.com');
    });

    it('calls invalidateCacheAndNotify after updating clients', () => {
      // Arrange
      mockLoadData.mockReturnValue(makeAppData({ clients: [] }));
      const newClient = makeClient({ id: 'c1' });

      // Act
      importClients(JSON.stringify([newClient]));

      // Assert
      expect(mockInvalidateCacheAndNotify).toHaveBeenCalledTimes(1);
    });

    it('accepts an empty array without errors', () => {
      // Arrange
      mockLoadData.mockReturnValue(makeAppData({ clients: [makeClient()] }));

      // Act — importing empty list must not throw
      expect(() => importClients('[]')).not.toThrow();
      // Assert — updateData called with the original list unchanged
      const [, clients] = mockUpdateData.mock.calls[0] as [keyof AppData, Client[]];
      expect(clients).toHaveLength(1);
    });
  });
});
