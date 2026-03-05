import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks — must be declared before vi.mock factory runs
// ---------------------------------------------------------------------------
const { mockReadPreference, mockWritePreference, mockRemovePreference } = vi.hoisted(() => ({
  mockReadPreference: vi.fn<(key: string) => Promise<unknown>>(),
  mockWritePreference: vi.fn<(key: string, value: unknown) => Promise<void>>(),
  mockRemovePreference: vi.fn<(key: string) => Promise<void>>(),
}));

vi.mock('./persistence', () => ({
  createPersistenceAdapter: () => ({
    readPreference: mockReadPreference,
    writePreference: mockWritePreference,
    removePreference: mockRemovePreference,
  }),
}));

// ---------------------------------------------------------------------------
// Module under test (dynamic import ensures vi.mock is applied first)
// ---------------------------------------------------------------------------
type UiPreferenceServiceModule = typeof import('./uiPreferenceService');
let uiPreferenceService: UiPreferenceServiceModule['uiPreferenceService'];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const KEY_PREFIX = 'ui_pref:';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('uiPreferenceService', () => {
  beforeEach(async () => {
    vi.resetModules();

    const module: UiPreferenceServiceModule = await import('./uiPreferenceService');
    uiPreferenceService = module.uiPreferenceService;

    mockReadPreference.mockResolvedValue(null);
    mockWritePreference.mockResolvedValue(undefined);
    mockRemovePreference.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // getItem
  // -------------------------------------------------------------------------
  describe('getItem', () => {
    it('reads from persistence with the "ui_pref:" prefix applied', async () => {
      // Arrange
      mockReadPreference.mockResolvedValue('stored-value');

      // Act
      await uiPreferenceService.getItem('theme', 'light');

      // Assert
      expect(mockReadPreference).toHaveBeenCalledOnce();
      expect(mockReadPreference).toHaveBeenCalledWith(`${KEY_PREFIX}theme`);
    });

    it('returns the persisted value when one exists', async () => {
      // Arrange
      mockReadPreference.mockResolvedValue('dark');

      // Act
      const result = await uiPreferenceService.getItem('theme', 'light');

      // Assert
      expect(result).toBe('dark');
    });

    it('returns the initialValue when persistence returns null', async () => {
      // Arrange
      mockReadPreference.mockResolvedValue(null);

      // Act
      const result = await uiPreferenceService.getItem('theme', 'light');

      // Assert
      expect(result).toBe('light');
    });

    it('returns a complex object initialValue when persistence returns null', async () => {
      // Arrange
      const defaultConfig = { size: 'md', collapsed: false };
      mockReadPreference.mockResolvedValue(null);

      // Act
      const result = await uiPreferenceService.getItem('sidebar', defaultConfig);

      // Assert
      expect(result).toEqual(defaultConfig);
    });

    it('returns the stored object when persistence has a value', async () => {
      // Arrange
      const stored = { size: 'lg', collapsed: true };
      mockReadPreference.mockResolvedValue(stored);

      // Act
      const result = await uiPreferenceService.getItem('sidebar', { size: 'md', collapsed: false });

      // Assert
      expect(result).toEqual(stored);
    });

    it('applies the prefix to keys that include colons or slashes', async () => {
      // Arrange
      mockReadPreference.mockResolvedValue(null);

      // Act
      await uiPreferenceService.getItem('kanban/column:width', 200);

      // Assert
      expect(mockReadPreference).toHaveBeenCalledWith(`${KEY_PREFIX}kanban/column:width`);
    });

    it('returns a numeric initialValue when persistence returns null', async () => {
      // Arrange
      mockReadPreference.mockResolvedValue(null);

      // Act
      const result = await uiPreferenceService.getItem('zoom', 100);

      // Assert
      expect(result).toBe(100);
    });

    it('returns the stored numeric value when persistence has one', async () => {
      // Arrange
      mockReadPreference.mockResolvedValue(150);

      // Act
      const result = await uiPreferenceService.getItem('zoom', 100);

      // Assert
      expect(result).toBe(150);
    });

    it('returns a boolean initialValue when persistence returns null', async () => {
      // Arrange
      mockReadPreference.mockResolvedValue(null);

      // Act
      const result = await uiPreferenceService.getItem('showGrid', true);

      // Assert
      expect(result).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // setItem
  // -------------------------------------------------------------------------
  describe('setItem', () => {
    it('writes to persistence with the "ui_pref:" prefix applied', async () => {
      // Arrange + Act
      await uiPreferenceService.setItem('theme', 'dark');

      // Assert
      expect(mockWritePreference).toHaveBeenCalledOnce();
      expect(mockWritePreference).toHaveBeenCalledWith(`${KEY_PREFIX}theme`, 'dark');
    });

    it('passes the exact value through to writePreference', async () => {
      // Arrange
      const value = { columns: ['id', 'name'], sort: 'asc' };

      // Act
      await uiPreferenceService.setItem('table:config', value);

      // Assert
      expect(mockWritePreference).toHaveBeenCalledWith(`${KEY_PREFIX}table:config`, value);
    });

    it('passes a boolean value through unchanged', async () => {
      // Arrange + Act
      await uiPreferenceService.setItem('sidebar:collapsed', false);

      // Assert
      expect(mockWritePreference).toHaveBeenCalledWith(`${KEY_PREFIX}sidebar:collapsed`, false);
    });

    it('passes a numeric value through unchanged', async () => {
      // Arrange + Act
      await uiPreferenceService.setItem('splitter:size', 320);

      // Assert
      expect(mockWritePreference).toHaveBeenCalledWith(`${KEY_PREFIX}splitter:size`, 320);
    });

    it('resolves without throwing on success', async () => {
      // Arrange + Act + Assert
      await expect(uiPreferenceService.setItem('key', 'value')).resolves.toBeUndefined();
    });

    it('does not call readPreference or removePreference', async () => {
      // Arrange + Act
      await uiPreferenceService.setItem('theme', 'dark');

      // Assert
      expect(mockReadPreference).not.toHaveBeenCalled();
      expect(mockRemovePreference).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // removeItem
  // -------------------------------------------------------------------------
  describe('removeItem', () => {
    it('removes from persistence with the "ui_pref:" prefix applied', async () => {
      // Arrange + Act
      await uiPreferenceService.removeItem('theme');

      // Assert
      expect(mockRemovePreference).toHaveBeenCalledOnce();
      expect(mockRemovePreference).toHaveBeenCalledWith(`${KEY_PREFIX}theme`);
    });

    it('resolves without throwing on success', async () => {
      // Arrange + Act + Assert
      await expect(uiPreferenceService.removeItem('theme')).resolves.toBeUndefined();
    });

    it('does not call readPreference or writePreference', async () => {
      // Arrange + Act
      await uiPreferenceService.removeItem('theme');

      // Assert
      expect(mockReadPreference).not.toHaveBeenCalled();
      expect(mockWritePreference).not.toHaveBeenCalled();
    });

    it('applies the prefix to keys that include colons or slashes', async () => {
      // Arrange + Act
      await uiPreferenceService.removeItem('kanban/column:order');

      // Assert
      expect(mockRemovePreference).toHaveBeenCalledWith(`${KEY_PREFIX}kanban/column:order`);
    });
  });

  // -------------------------------------------------------------------------
  // Key isolation — different keys must resolve to different prefixed keys
  // -------------------------------------------------------------------------
  describe('key isolation', () => {
    it('two different keys produce two different prefixed keys', async () => {
      // Arrange + Act
      await uiPreferenceService.getItem('keyA', null);
      await uiPreferenceService.getItem('keyB', null);

      // Assert
      const calls = mockReadPreference.mock.calls;
      expect(calls[0][0]).toBe(`${KEY_PREFIX}keyA`);
      expect(calls[1][0]).toBe(`${KEY_PREFIX}keyB`);
      expect(calls[0][0]).not.toBe(calls[1][0]);
    });

    it('set and get for the same key use the same prefixed key', async () => {
      // Arrange
      mockReadPreference.mockResolvedValue('red');

      // Act
      await uiPreferenceService.setItem('accentColor', 'red');
      await uiPreferenceService.getItem('accentColor', 'blue');

      // Assert
      expect(mockWritePreference.mock.calls[0][0]).toBe(`${KEY_PREFIX}accentColor`);
      expect(mockReadPreference.mock.calls[0][0]).toBe(`${KEY_PREFIX}accentColor`);
    });
  });
});
