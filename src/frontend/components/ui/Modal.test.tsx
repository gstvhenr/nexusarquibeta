import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Modal from './Modal';

describe('Modal keyboard interactions', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  const renderModal = (onClose = vi.fn()) => {
    vi.useFakeTimers();

    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    render(
      <Modal isOpen onClose={onClose} title="Teste de modal">
        <label htmlFor="modal-input">Titulo</label>
        <input id="modal-input" type="text" />
      </Modal>,
    );

    return {
      onClose,
      input: screen.getByLabelText('Titulo'),
      dialog: screen.getByRole('dialog'),
    };
  };

  it('does not close when space is pressed inside an input', () => {
    const { onClose, input } = renderModal();

    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: ' ', code: 'Space', charCode: 32 });
    vi.advanceTimersByTime(350);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('moves focus into the modal when it opens', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Abrir';
    document.body.appendChild(trigger);
    trigger.focus();

    const { input } = renderModal();

    expect(document.activeElement).toBe(input);
  });

  it('closes when escape is pressed', () => {
    const { onClose } = renderModal();

    fireEvent.keyDown(window, { key: 'Escape' });
    vi.advanceTimersByTime(350);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
