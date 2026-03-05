import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InstagramCredentialModal } from './InstagramCredentialModal';
import * as FinancialSecurityContextModule from '../../context/FinancialSecurityContext';

type SecurityState = ReturnType<typeof FinancialSecurityContextModule.useFinancialSecurity>;

const createSecurityState = (overrides: Partial<SecurityState> = {}): SecurityState => ({
  isLockEnabled: false,
  isUnlocked: false,
  toggleLock: vi.fn(),
  unlock: vi.fn(() => true),
  lockNow: vi.fn(),
  changePassword: vi.fn(() => ({ success: true })),
  ...overrides,
});

const mockUseFinancialSecurity = (state: SecurityState) =>
  vi.spyOn(FinancialSecurityContextModule, 'useFinancialSecurity').mockReturnValue(state);

const renderModal = (
  overrides: Partial<ComponentProps<typeof InstagramCredentialModal>> = {},
) =>
  render(
    <InstagramCredentialModal
      isOpen={true}
      onClose={vi.fn()}
      credentials={undefined}
      onSaveCredentials={vi.fn()}
      {...overrides}
    />,
  );

describe('InstagramCredentialModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.getElementById('modal-root')?.remove();
  });

  it('returns null when closed', () => {
    mockUseFinancialSecurity(createSecurityState());
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('requires security unlock and shows error for invalid password attempt', () => {
    const unlock = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
    mockUseFinancialSecurity(
      createSecurityState({
        isLockEnabled: true,
        isUnlocked: false,
        unlock,
      }),
    );

    renderModal();

    fireEvent.change(screen.getByPlaceholderText('Senha de segurança'), {
      target: { value: 'senha-invalida' },
    });
    fireEvent.keyDown(screen.getByPlaceholderText('Senha de segurança'), { key: 'Enter' });
    expect(unlock).toHaveBeenCalledWith('senha-invalida');
    expect(screen.getByText('Senha incorreta.')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Senha de segurança'), {
      target: { value: 'senha-correta' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Desbloquear' }));
    expect(screen.getByText('Nenhuma credencial cadastrada.')).toBeInTheDocument();
  });

  it('shows and hides stored password and supports credential editing', () => {
    const onSaveCredentials = vi.fn();
    mockUseFinancialSecurity(
      createSecurityState({
        isLockEnabled: true,
        isUnlocked: true,
      }),
    );

    renderModal({
      credentials: { username: 'instagram@nexus.com', password: 'senha-super-segura' },
      onSaveCredentials,
    });

    expect(screen.getByText('instagram@nexus.com')).toBeInTheDocument();
    expect(screen.queryByText('senha-super-segura')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByText('senha-super-segura')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Editar credenciais' }));
    fireEvent.change(screen.getByPlaceholderText('usuario@email.com'), {
      target: { value: 'novo.usuario@nexus.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Senha da plataforma'), {
      target: { value: 'nova-senha' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSaveCredentials).toHaveBeenCalledWith({
      username: 'novo.usuario@nexus.com',
      password: 'nova-senha',
    });
  });

  it('resets local UI state when reopening modal', () => {
    mockUseFinancialSecurity(
      createSecurityState({
        isLockEnabled: false,
        isUnlocked: false,
      }),
    );

    const { rerender } = renderModal({
      credentials: { username: 'instagram@nexus.com', password: 'segredo' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByText('segredo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar credenciais' }));
    expect(screen.getByPlaceholderText('usuario@email.com')).toHaveValue('instagram@nexus.com');

    rerender(
      <InstagramCredentialModal
        isOpen={false}
        onClose={vi.fn()}
        credentials={{ username: 'instagram@nexus.com', password: 'segredo' }}
        onSaveCredentials={vi.fn()}
      />,
    );
    rerender(
      <InstagramCredentialModal
        isOpen={true}
        onClose={vi.fn()}
        credentials={{ username: 'instagram@nexus.com', password: 'segredo' }}
        onSaveCredentials={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeInTheDocument();
    expect(screen.queryByText('segredo')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('usuario@email.com')).not.toBeInTheDocument();
  });
});
