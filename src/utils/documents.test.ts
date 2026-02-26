import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fileToB64, openDocument } from './documents';
import type { DocumentFile } from '../types';

describe('documents', () => {
  describe('fileToB64', () => {
    it('converts a File to base64 data URL', async () => {
      // Given
      const textContent = 'hello world';
      const file = new File([textContent], 'test.txt', { type: 'text/plain' });

      // When
      const dataUrl = await fileToB64(file);

      // Then
      expect(dataUrl).toContain('data:');
      expect(dataUrl).toContain('base64');
    });

    it('rejects when FileReader encounters an error', async () => {
      // Given — create a file and sabotage the FileReader
      const file = new File(['content'], 'test.txt');
      const originalFileReader = globalThis.FileReader;
      const mockError = new Error('Read failed');

      globalThis.FileReader = class MockFileReader {
        result: string | null = null;
        onload: (() => void) | null = null;
        onerror: ((error: unknown) => void) | null = null;
        readAsDataURL() {
          setTimeout(() => this.onerror?.(mockError), 0);
        }
      } as unknown as typeof FileReader;

      // When / Then
      await expect(fileToB64(file)).rejects.toBe(mockError);

      // Cleanup
      globalThis.FileReader = originalFileReader;
    });
  });

  describe('openDocument', () => {
    const mockCreateObjectURL = vi.fn(() => 'blob:http://localhost/mock');
    const mockRevokeObjectURL = vi.fn();

    beforeEach(() => {
      vi.restoreAllMocks();
      // jsdom does not provide URL.createObjectURL/revokeObjectURL
      globalThis.URL.createObjectURL = mockCreateObjectURL;
      globalThis.URL.revokeObjectURL = mockRevokeObjectURL;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('does nothing when primary source is not found', async () => {
      // Given
      const docFile: DocumentFile = {
        id: 'file-1',
        name: 'test.pdf',
        type: 'file',
        sources: [],
        primarySourceId: 'nonexistent',
        dateAdded: '2026-01-01T00:00:00.000Z',
        dateModified: '2026-01-01T00:00:00.000Z',
      };
      const createElementSpy = vi.spyOn(document, 'createElement');

      // When
      await openDocument(docFile);

      // Then — should not attempt to create download link
      expect(createElementSpy).not.toHaveBeenCalled();
    });

    it('logs warning for link-type sources', async () => {
      // Given
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const docFile: DocumentFile = {
        id: 'file-2',
        name: 'external.pdf',
        type: 'file',
        sources: [
          {
            id: 'src-link',
            type: 'link',
            content: 'https://example.com/file.pdf',
            dateAdded: '2026-01-01T00:00:00.000Z',
          },
        ],
        primarySourceId: 'src-link',
        dateAdded: '2026-01-01T00:00:00.000Z',
        dateModified: '2026-01-01T00:00:00.000Z',
      };

      // When
      await openDocument(docFile);

      // Then
      expect(consoleWarnSpy).toHaveBeenCalledWith('Links externos desativados no modo offline.');
    });

    it('opens uploaded PDF in new tab via blob URL', async () => {
      // Given
      const mockAnchor = {
        href: '',
        target: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockAnchor as unknown as Node,
      );
      vi.spyOn(document.body, 'removeChild').mockImplementation(
        () => mockAnchor as unknown as Node,
      );

      const pdfContent = 'data:application/pdf;base64,dGVzdA==';
      const docFile: DocumentFile = {
        id: 'file-3',
        name: 'planta.pdf',
        type: 'file',
        sources: [
          {
            id: 'src-upload',
            type: 'upload',
            content: pdfContent,
            fileName: 'planta.pdf',
            fileType: 'application/pdf',
            fileSize: 1024,
            dateAdded: '2026-01-01T00:00:00.000Z',
          },
        ],
        primarySourceId: 'src-upload',
        dateAdded: '2026-01-01T00:00:00.000Z',
        dateModified: '2026-01-01T00:00:00.000Z',
      };

      // When
      await openDocument(docFile);

      // Then — PDF opened in new tab, not downloaded
      expect(mockAnchor.target).toBe('_blank');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('downloads non-viewable files with filename', async () => {
      // Given
      const mockAnchor = {
        href: '',
        target: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockAnchor as unknown as Node,
      );
      vi.spyOn(document.body, 'removeChild').mockImplementation(
        () => mockAnchor as unknown as Node,
      );

      const zipContent = 'data:application/zip;base64,dGVzdA==';
      const docFile: DocumentFile = {
        id: 'file-4',
        name: 'projeto.zip',
        type: 'file',
        sources: [
          {
            id: 'src-zip',
            type: 'upload',
            content: zipContent,
            fileName: 'projeto.zip',
            fileType: 'application/zip',
            fileSize: 2048,
            dateAdded: '2026-01-01T00:00:00.000Z',
          },
        ],
        primarySourceId: 'src-zip',
        dateAdded: '2026-01-01T00:00:00.000Z',
        dateModified: '2026-01-01T00:00:00.000Z',
      };

      // When
      await openDocument(docFile);

      // Then — file downloaded, not opened in new tab
      expect(mockAnchor.download).toBe('projeto.zip');
      expect(mockAnchor.target).toBe('');
      expect(mockAnchor.click).toHaveBeenCalled();
    });
  });
});
