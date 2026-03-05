import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

function createModalRoot() {
  const modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', 'modal-root');
  document.body.appendChild(modalRoot);
  return modalRoot;
}

describe('DeleteConfirmationModal', () => {
  beforeEach(() => {
    createModalRoot();
  });

  afterEach(() => {
    document.getElementById('modal-root')?.remove();
    document.body.style.overflow = '';
    vi.useRealTimers();
  });

  it('does not render when closed', () => {
    render(
      <DeleteConfirmationModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        itemName="Item Teste"
        itemType="Registro"
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders confirmation copy with contextual title', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        itemName="Item Teste"
        itemType="Registro"
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Confirmar Exclusão de Registro' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/deseja excluir registro/i)).toBeInTheDocument();
    expect(screen.getByText('Item Teste')).toBeInTheDocument();
  });

  it('calls onConfirm when user confirms deletion', () => {
    const onConfirm = vi.fn();

    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        itemName="Item Teste"
        itemType="Registro"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when user clicks cancel action', () => {
    const onClose = vi.fn();

    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        itemName="Item Teste"
        itemType="Registro"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when user uses default modal close button', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        itemName="Item Teste"
        itemType="Registro"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fechar modal' }));
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
