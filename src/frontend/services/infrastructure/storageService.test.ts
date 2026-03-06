import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { storageService } from './storageService';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mockWindowUndefined(): void {
  vi.stubGlobal('window', undefined);
}

// ─────────────────────────────────────────────────────────────────────────────
// storageService
// ─────────────────────────────────────────────────────────────────────────────

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // getItem
  // ───────────────────────────────────────────────────────────────────────────

  describe('getItem', () => {
    it('returns the parsed value when the key exists in localStorage', () => {
      // Given
      localStorage.setItem('clients', JSON.stringify([{ id: '1', name: 'Acme' }]));

      // When
      const result = storageService.getItem<{ id: string; name: string }[]>('clients', []);

      // Then
      expect(result).toEqual([{ id: '1', name: 'Acme' }]);
    });

    it('returns the initialValue when the key does not exist', () => {
      // Given — key is absent from localStorage

      // When
      const result = storageService.getItem<string[]>('nonexistent', ['default']);

      // Then
      expect(result).toEqual(['default']);
    });

    it('returns the initialValue and logs an error when JSON is malformed', () => {
      // Given
      localStorage.setItem('bad-json', '{not valid json}');
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // When
      const result = storageService.getItem<object>('bad-json', { fallback: true });

      // Then
      expect(result).toEqual({ fallback: true });
      // The source logs: `Error reading from localStorage key "bad-json":`, error
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][0]).toContain('Error reading from localStorage key');
      expect(errorSpy.mock.calls[0][0]).toContain('bad-json');
    });

    it('returns the initialValue when window is undefined (SSR environment)', () => {
      // Given
      mockWindowUndefined();

      // When
      const result = storageService.getItem<number>('key', 42);

      // Then
      expect(result).toBe(42);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // setItem
  // ───────────────────────────────────────────────────────────────────────────

  describe('setItem', () => {
    it('serializes and stores the value in localStorage', () => {
      // Given
      const payload = { id: 'proj-1', title: 'Alpha' };

      // When
      storageService.setItem('projects', payload);

      // Then
      const stored = localStorage.getItem('projects');
      expect(JSON.parse(stored!)).toEqual(payload);
    });

    it('dispatches a StorageEvent on window after storing', () => {
      // Given
      const eventSpy = vi.fn();
      window.addEventListener('storage', eventSpy);

      // When
      storageService.setItem('theme', 'dark');

      // Then
      expect(eventSpy).toHaveBeenCalledTimes(1);
      const event = eventSpy.mock.calls[0][0] as StorageEvent;
      expect(event.key).toBe('theme');

      window.removeEventListener('storage', eventSpy);
    });

    it('logs a warning and does nothing when window is undefined', () => {
      // Given
      mockWindowUndefined();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // When
      storageService.setItem('key', 'value');

      // Then
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain('localStorage');
    });

    it('logs an error when JSON serialization fails (circular reference)', () => {
      // Given
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
        throw new TypeError('Converting circular structure to JSON');
      });

      // When
      storageService.setItem('circular', { ref: 'circular' });

      // Then
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][0]).toContain('Error writing to localStorage key');
      expect(errorSpy.mock.calls[0][0]).toContain('circular');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // removeItem
  // ───────────────────────────────────────────────────────────────────────────

  describe('removeItem', () => {
    it('removes the key from localStorage', () => {
      // Given
      localStorage.setItem('temp-key', '"value"');

      // When
      storageService.removeItem('temp-key');

      // Then
      expect(localStorage.getItem('temp-key')).toBeNull();
    });

    it('dispatches a StorageEvent on window after removing', () => {
      // Given
      localStorage.setItem('to-remove', '"data"');
      const eventSpy = vi.fn();
      window.addEventListener('storage', eventSpy);

      // When
      storageService.removeItem('to-remove');

      // Then
      expect(eventSpy).toHaveBeenCalledTimes(1);
      const event = eventSpy.mock.calls[0][0] as StorageEvent;
      expect(event.key).toBe('to-remove');

      window.removeEventListener('storage', eventSpy);
    });

    it('does nothing when window is undefined (SSR environment)', () => {
      // Given
      mockWindowUndefined();

      // When / Then — must not throw
      expect(() => storageService.removeItem('any-key')).not.toThrow();
    });

    it('logs an error when the underlying removeItem call throws', () => {
      // Given — jsdom protects localStorage from direct method override;
      // stub the entire window.localStorage with a fake that throws on removeItem.
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.stubGlobal('localStorage', {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {
          throw new DOMException('QuotaExceededError');
        },
        clear: () => {},
      });

      // When
      storageService.removeItem('failing-key');

      // Then
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][0]).toContain('Error removing from localStorage key');
      expect(errorSpy.mock.calls[0][0]).toContain('failing-key');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // API surface contract
  // ───────────────────────────────────────────────────────────────────────────

  describe('API surface', () => {
    it('exports exactly the three expected methods', () => {
      // Given / When
      const keys = Object.keys(storageService).sort();

      // Then — contract: getItem | removeItem | setItem (alphabetical)
      expect(keys).toEqual(['getItem', 'removeItem', 'setItem']);
    });
  });
});
