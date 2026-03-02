import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

describe('DeleteConfirmationModal', () => {
  it('calls onConfirm when user confirms deletion', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);

    try {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          itemName="Item Teste"
          itemType="Registro"
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    } finally {
      cleanup();
      modalRoot.remove();
    }
  }, 15000);
});
