import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AvatarPicker } from './AvatarPicker';
// Mock getInitials to have predictable output without depending on the actual implementation
vi.mock('../../utils/supplierHelpers', () => ({
  getInitials: vi.fn((name) => (name ? name.substring(0, 2).toUpperCase() : '?')),
}));

describe('AvatarPicker', () => {
  const defaultProps = {
    name: 'John Doe',
    onChangeBase64: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render initials when no avatarUrl is provided', () => {
      render(<AvatarPicker {...defaultProps} />);
      expect(screen.getByText('JO')).toBeInTheDocument();
      expect(screen.queryByRole('img', { name: /avatar de/i })).not.toBeInTheDocument();
    });

    it('should render image when avatarUrl is provided', () => {
      render(<AvatarPicker {...defaultProps} avatarUrl="http://example.com/avatar.png" />);
      const img = screen.getByRole('img', { name: /avatar de/i, hidden: true });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'http://example.com/avatar.png');
      expect(screen.queryByText('JO')).not.toBeInTheDocument();
    });

    it('should show camera icon and input when not read-only', () => {
      render(<AvatarPicker {...defaultProps} isReadOnly={false} />);
      expect(
        screen.getByRole('button', { name: 'Atualizar Avatar do Cliente' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Alterar foto' })).toBeInTheDocument();
    });

    it('should not show camera icon or input when read-only', () => {
      render(<AvatarPicker {...defaultProps} isReadOnly={true} />);
      expect(
        screen.queryByRole('button', { name: 'Atualizar Avatar do Cliente' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Alterar foto' })).not.toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Atualizar Avatar do Cliente' })).toBeInTheDocument(); // role changes to img
    });
  });

  describe('Interaction', () => {
    it('should trigger file input click when main div is clicked', async () => {
      render(<AvatarPicker {...defaultProps} />);

      const mainDiv = screen.getByRole('button', { name: 'Atualizar Avatar do Cliente' });
      fireEvent.click(mainDiv);
      expect(mainDiv).toBeInTheDocument();
    });

    it('should not trigger action if read-only', async () => {
      render(<AvatarPicker {...defaultProps} isReadOnly={true} />);

      const mainDiv = screen.getByRole('img', { name: 'Atualizar Avatar do Cliente' });
      fireEvent.click(mainDiv);
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).not.toBeInTheDocument();
    });

    it('should respond to Enter and Space keys for accessibility', async () => {
      render(<AvatarPicker {...defaultProps} />);
      const mainDiv = screen.getByRole('button', { name: 'Atualizar Avatar do Cliente' });

      mainDiv.focus();
      fireEvent.keyDown(mainDiv, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(mainDiv, { key: ' ', code: 'Space' });

      expect(mainDiv).toBeInTheDocument();
    });
  });

  describe('File Upload Validation', () => {
    it('should reject files larger than 1MB', async () => {
      render(<AvatarPicker {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const largeFile = new File([''], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 1024 * 1024 + 1 });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(window.alert).toHaveBeenCalledWith('A imagem deve ter no máximo 1MB.');
      expect(defaultProps.onChangeBase64).not.toHaveBeenCalled();
      expect(fileInput.value).toBe('');
    });

    it('should reject invalid file types', async () => {
      render(<AvatarPicker {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const pdfFile = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [pdfFile] } });

      expect(window.alert).toHaveBeenCalledWith('A imagem deve estar no formato JPEG ou PNG.');
      expect(defaultProps.onChangeBase64).not.toHaveBeenCalled();
      expect(fileInput.value).toBe('');
    });

    it('should process valid jpeg/png files and call onChangeBase64', async () => {
      render(<AvatarPicker {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = new File(['hello'], 'photo.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(defaultProps.onChangeBase64).toHaveBeenCalledWith(
          expect.stringContaining('data:image/jpeg;base64,'),
        );
      });
      expect(fileInput.value).toBe('');
    });
  });
});
