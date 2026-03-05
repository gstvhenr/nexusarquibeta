import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Modal from './Modal';

function setupModalRoot() {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
}

describe('Modal', () => {
  beforeEach(() => {
    setupModalRoot();
  });

  afterEach(() => {
    document.getElementById('modal-root')?.remove();
    document.body.style.overflow = '';
    vi.useRealTimers();
  });

  it('returns null when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Título">
        <p>Conteúdo</p>
      </Modal>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('returns null when modal root is missing', () => {
    document.getElementById('modal-root')?.remove();

    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Título">
        <p>Conteúdo</p>
      </Modal>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders content and locks body scroll while open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Meu Modal" size="2xl">
        <p>Conteúdo do modal</p>
      </Modal>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Meu Modal' })).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
    expect(screen.getByRole('document')).toHaveClass('max-w-2xl');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when modal closes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()} title="Modal">
        <p>Conteúdo</p>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={vi.fn()} title="Modal">
        <p>Conteúdo</p>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe('');
  });

  it('closes with delayed callback when default close button is clicked', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Modal">
        <p>Conteúdo</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fechar modal' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('document')).toHaveClass('animate-fade-out-down');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on overlay click but not when clicking inside the document', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Modal">
        <p>Conteúdo</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole('document'));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('dialog'));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape, Enter and Space interactions', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Modal">
        <p>Conteúdo</p>
      </Modal>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: ' ' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('clears pending close timer on unmount', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    const { unmount } = render(
      <Modal isOpen={true} onClose={onClose} title="Modal">
        <p>Conteúdo</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole('dialog'));
    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
