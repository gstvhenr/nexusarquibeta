import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PasswordResetModal } from './PasswordResetModal';

describe('PasswordResetModal', () => {
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

  it('renders success state when password change is completed', () => {
    render(
      <PasswordResetModal
        isOpen={true}
        onClose={vi.fn()}
        pwdSuccess={true}
        pwdStep="new"
        currentPwd="1234"
        newPwd="5678"
        confirmPwd="5678"
        pwdError=""
        onCurrentPwdChange={vi.fn()}
        onNewPwdChange={vi.fn()}
        onConfirmPwdChange={vi.fn()}
        onValidateCurrentPassword={vi.fn()}
        onNewPwdSubmit={vi.fn()}
        onBackToCurrent={vi.fn()}
      />,
    );

    expect(screen.getByText('Senha alterada com sucesso!')).toBeInTheDocument();
  });

  it('handles current-password step controls, disabled state and cancel', () => {
    const onClose = vi.fn();
    const onCurrentPwdChange = vi.fn();
    const onValidateCurrentPassword = vi.fn();

    render(
      <PasswordResetModal
        isOpen={true}
        onClose={onClose}
        pwdSuccess={false}
        pwdStep="current"
        currentPwd=""
        newPwd=""
        confirmPwd=""
        pwdError="Senha atual incorreta."
        onCurrentPwdChange={onCurrentPwdChange}
        onNewPwdChange={vi.fn()}
        onConfirmPwdChange={vi.fn()}
        onValidateCurrentPassword={onValidateCurrentPassword}
        onNewPwdSubmit={vi.fn()}
        onBackToCurrent={vi.fn()}
      />,
    );

    const continueButton = screen.getByRole('button', { name: 'Continuar' });
    expect(continueButton).toBeDisabled();
    expect(screen.getByText('Senha atual incorreta.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: '4321' } });
    expect(onCurrentPwdChange).toHaveBeenCalledWith('4321');

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    expect(onValidateCurrentPassword).not.toHaveBeenCalled();
  });

  it('handles new-password step actions, callbacks and button enablement', () => {
    const onNewPwdChange = vi.fn();
    const onConfirmPwdChange = vi.fn();
    const onNewPwdSubmit = vi.fn();
    const onBackToCurrent = vi.fn();

    const { rerender } = render(
      <PasswordResetModal
        isOpen={true}
        onClose={vi.fn()}
        pwdSuccess={false}
        pwdStep="new"
        currentPwd="1234"
        newPwd=""
        confirmPwd=""
        pwdError="As senhas não coincidem."
        onCurrentPwdChange={vi.fn()}
        onNewPwdChange={onNewPwdChange}
        onConfirmPwdChange={onConfirmPwdChange}
        onValidateCurrentPassword={vi.fn()}
        onNewPwdSubmit={onNewPwdSubmit}
        onBackToCurrent={onBackToCurrent}
      />,
    );

    const submitButton = screen.getByRole('button', { name: 'Alterar Senha' });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: '5678' } });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: '5678' },
    });

    expect(onNewPwdChange).toHaveBeenCalledWith('5678');
    expect(onConfirmPwdChange).toHaveBeenCalledWith('5678');

    rerender(
      <PasswordResetModal
        isOpen={true}
        onClose={vi.fn()}
        pwdSuccess={false}
        pwdStep="new"
        currentPwd="1234"
        newPwd="5678"
        confirmPwd="5678"
        pwdError=""
        onCurrentPwdChange={vi.fn()}
        onNewPwdChange={onNewPwdChange}
        onConfirmPwdChange={onConfirmPwdChange}
        onValidateCurrentPassword={vi.fn()}
        onNewPwdSubmit={onNewPwdSubmit}
        onBackToCurrent={onBackToCurrent}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(onBackToCurrent).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));
    expect(onNewPwdSubmit).toHaveBeenCalledTimes(1);
  });

  it('closes through modal close button', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <PasswordResetModal
        isOpen={true}
        onClose={onClose}
        pwdSuccess={false}
        pwdStep="current"
        currentPwd="1234"
        newPwd=""
        confirmPwd=""
        pwdError=""
        onCurrentPwdChange={vi.fn()}
        onNewPwdChange={vi.fn()}
        onConfirmPwdChange={vi.fn()}
        onValidateCurrentPassword={vi.fn()}
        onNewPwdSubmit={vi.fn()}
        onBackToCurrent={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fechar modal' }));
    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
