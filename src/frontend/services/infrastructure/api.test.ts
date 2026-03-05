import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks (must be declared before vi.mock factory runs)
// ---------------------------------------------------------------------------
const {
  mockLoadData,
  mockUpdateData,
  mockReplaceData,
  mockReserveGlobalIdentifierCounter,
  mockResetPersistentDataAndNotify,
  mockImportData,
  mockExportData,
  mockImportClients,
} = vi.hoisted(() => ({
  mockLoadData: vi.fn(),
  mockUpdateData: vi.fn(),
  mockReplaceData: vi.fn(),
  mockReserveGlobalIdentifierCounter: vi.fn(),
  mockResetPersistentDataAndNotify: vi.fn(),
  mockImportData: vi.fn(),
  mockExportData: vi.fn(),
  mockImportClients: vi.fn(),
}));

vi.mock('./loadData', () => ({
  loadData: mockLoadData,
  updateData: mockUpdateData,
  replaceData: mockReplaceData,
  reserveGlobalIdentifierCounter: mockReserveGlobalIdentifierCounter,
  resetPersistentDataAndNotify: mockResetPersistentDataAndNotify,
}));

vi.mock('./importExport', () => ({
  importData: mockImportData,
  exportData: mockExportData,
  importClients: mockImportClients,
}));

// ---------------------------------------------------------------------------
// Module under test (imported dynamically so mocks are already in place)
// ---------------------------------------------------------------------------
type ApiModule = typeof import('./api');
let api: ApiModule['api'];

describe('api — infrastructure facade', () => {
  beforeEach(async () => {
    vi.resetModules();
    const module: ApiModule = await import('./api');
    api = module.api;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // getData
  // -------------------------------------------------------------------------
  describe('getData', () => {
    it('delegates to loadData and returns its result', () => {
      // Arrange
      const snapshot = { projects: [], proposals: [], clients: [] } as never;
      mockLoadData.mockReturnValue(snapshot);

      // Act
      const result = api.getData();

      // Assert
      expect(mockLoadData).toHaveBeenCalledTimes(1);
      expect(result).toBe(snapshot);
    });
  });

  // -------------------------------------------------------------------------
  // updateData
  // -------------------------------------------------------------------------
  describe('updateData', () => {
    it('is the updateData function exported from loadData (same reference)', () => {
      expect(api.updateData).toBe(mockUpdateData);
    });

    it('can be called and delegates correctly', () => {
      // Arrange
      const items = ['item-a'];

      // Act
      api.updateData('dismissedFocusItems', items);

      // Assert
      expect(mockUpdateData).toHaveBeenCalledWith('dismissedFocusItems', items);
    });
  });

  // -------------------------------------------------------------------------
  // replaceData
  // -------------------------------------------------------------------------
  describe('replaceData', () => {
    it('is the replaceData function exported from loadData (same reference)', () => {
      expect(api.replaceData).toBe(mockReplaceData);
    });

    it('can be called and delegates correctly', () => {
      // Arrange
      const fullSnapshot = { projects: [], clients: [] } as never;

      // Act
      api.replaceData(fullSnapshot);

      // Assert
      expect(mockReplaceData).toHaveBeenCalledWith(fullSnapshot);
    });
  });

  // -------------------------------------------------------------------------
  // exportData
  // -------------------------------------------------------------------------
  describe('exportData', () => {
    it('is the exportData function exported from importExport (same reference)', () => {
      expect(api.exportData).toBe(mockExportData);
    });

    it('can be called and returns the delegated JSON string', () => {
      // Arrange
      const json = '{"projects":[]}';
      mockExportData.mockReturnValue(json);

      // Act
      const result = api.exportData();

      // Assert
      expect(mockExportData).toHaveBeenCalledTimes(1);
      expect(result).toBe(json);
    });
  });

  // -------------------------------------------------------------------------
  // importData
  // -------------------------------------------------------------------------
  describe('importData', () => {
    it('is the importData function exported from importExport (same reference)', () => {
      expect(api.importData).toBe(mockImportData);
    });

    it('delegates with the provided JSON string', () => {
      // Arrange
      const json = '{"projects":[]}';

      // Act
      api.importData(json);

      // Assert
      expect(mockImportData).toHaveBeenCalledWith(json);
    });
  });

  // -------------------------------------------------------------------------
  // reserveGlobalIdentifier
  // -------------------------------------------------------------------------
  describe('reserveGlobalIdentifier', () => {
    it('delegates to reserveGlobalIdentifierCounter and resolves the returned value', async () => {
      // Arrange
      mockReserveGlobalIdentifierCounter.mockResolvedValue(2501);

      // Act
      const result = await api.reserveGlobalIdentifier();

      // Assert
      expect(mockReserveGlobalIdentifierCounter).toHaveBeenCalledTimes(1);
      expect(result).toBe(2501);
    });

    it('propagates rejection when delegate rejects', async () => {
      // Arrange
      mockReserveGlobalIdentifierCounter.mockRejectedValue(new Error('storage failure'));

      // Act & Assert
      await expect(api.reserveGlobalIdentifier()).rejects.toThrow('storage failure');
    });
  });

  // -------------------------------------------------------------------------
  // importClients
  // -------------------------------------------------------------------------
  describe('importClients', () => {
    it('is the importClients function exported from importExport (same reference)', () => {
      expect(api.importClients).toBe(mockImportClients);
    });

    it('delegates with the provided JSON string', () => {
      // Arrange
      const json = '[{"id":"c1","name":"Acme"}]';

      // Act
      api.importClients(json);

      // Assert
      expect(mockImportClients).toHaveBeenCalledWith(json);
    });
  });

  // -------------------------------------------------------------------------
  // clearAllData
  // -------------------------------------------------------------------------
  describe('clearAllData', () => {
    it('delegates to resetPersistentDataAndNotify', () => {
      // Act
      api.clearAllData();

      // Assert
      expect(mockResetPersistentDataAndNotify).toHaveBeenCalledTimes(1);
    });

    it('returns void (does not return a value)', () => {
      // Arrange
      mockResetPersistentDataAndNotify.mockReturnValue(undefined);

      // Act
      const result = api.clearAllData();

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
