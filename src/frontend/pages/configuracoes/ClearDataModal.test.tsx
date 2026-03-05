import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClearDataModal } from './ClearDataModal';

describe('ClearDataModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.getElementById('modal-root')?.remove();
  });

  it('does not render modal when closed', () => {
    render(
      <ClearDataModal
        isOpen={false}
        onClose={vi.fn()}
        clearConfirmationText=""
        onChangeConfirmationText={vi.fn()}
        onConfirmClear={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('heading', { name: 'Confirmar Exclusão de Dados' }),
    ).not.toBeInTheDocument();
  });

  it('requires exact confirmation text before enabling destructive action', () => {
    const onChangeConfirmationText = vi.fn();
    const onConfirmClear = vi.fn();
    const { rerender } = render(
      <ClearDataModal
        isOpen={true}
        onClose={vi.fn()}
        clearConfirmationText=""
        onChangeConfirmationText={onChangeConfirmationText}
        onConfirmClear={onConfirmClear}
      />,
    );

    const confirmInput = screen.getByLabelText('Digite EXCLUIR para confirmar');
    const confirmButton = screen.getByRole('button', {
      name: 'Eu entendo as consequências, excluir tudo',
    });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(confirmInput, { target: { value: 'EXCLUIR' } });
    expect(onChangeConfirmationText).toHaveBeenCalledWith('EXCLUIR');

    rerender(
      <ClearDataModal
        isOpen={true}
        onClose={vi.fn()}
        clearConfirmationText="EXCLUIR"
        onChangeConfirmationText={onChangeConfirmationText}
        onConfirmClear={onConfirmClear}
      />,
    );

    expect(confirmButton).toBeEnabled();
    fireEvent.click(confirmButton);
    expect(onConfirmClear).toHaveBeenCalledTimes(1);
  });

  it('closes through modal close button', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <ClearDataModal
        isOpen={true}
        onClose={onClose}
        clearConfirmationText=""
        onChangeConfirmationText={vi.fn()}
        onConfirmClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fechar modal' }));
    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
