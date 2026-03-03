import { Button, Modal } from '../../components/ui';
import { PasswordInput } from './PasswordInput';

type PasswordResetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pwdSuccess: boolean;
  pwdStep: 'current' | 'new';
  currentPwd: string;
  newPwd: string;
  confirmPwd: string;
  pwdError: string;
  onCurrentPwdChange: (value: string) => void;
  onNewPwdChange: (value: string) => void;
  onConfirmPwdChange: (value: string) => void;
  onValidateCurrentPassword: () => void;
  onNewPwdSubmit: () => void;
  onBackToCurrent: () => void;
};

export function PasswordResetModal({
  isOpen,
  onClose,
  pwdSuccess,
  pwdStep,
  currentPwd,
  newPwd,
  confirmPwd,
  pwdError,
  onCurrentPwdChange,
  onNewPwdChange,
  onConfirmPwdChange,
  onValidateCurrentPassword,
  onNewPwdSubmit,
  onBackToCurrent,
}: PasswordResetModalProps): JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Redefinir Senha Financeira">
      {pwdSuccess ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p className="text-text-primary font-semibold">Senha alterada com sucesso!</p>
        </div>
      ) : pwdStep === 'current' ? (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Para sua segurança, insira a senha atual antes de redefini-la.
          </p>
          <div>
            <span className="block text-sm font-medium text-text-secondary mb-1.5">
              Senha Atual
            </span>
            <PasswordInput
              value={currentPwd}
              onChange={onCurrentPwdChange}
              placeholder="Digite a senha atual"
              ariaLabel="Senha atual"
            />
          </div>
          {pwdError && (
            <p className="text-error text-sm font-medium bg-error/10 px-3 py-2 rounded-lg">
              {pwdError}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} size="sm">
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={onValidateCurrentPassword}
              disabled={!currentPwd}
              size="sm"
            >
              Continuar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">Insira e confirme a nova senha.</p>
          <div>
            <span className="block text-sm font-medium text-text-secondary mb-1.5">Nova Senha</span>
            <PasswordInput
              value={newPwd}
              onChange={onNewPwdChange}
              placeholder="Digite a nova senha"
              ariaLabel="Nova senha"
            />
          </div>
          <div>
            <span className="block text-sm font-medium text-text-secondary mb-1.5">
              Confirmar Nova Senha
            </span>
            <PasswordInput
              value={confirmPwd}
              onChange={onConfirmPwdChange}
              placeholder="Confirme a nova senha"
              ariaLabel="Confirmar nova senha"
            />
          </div>
          {pwdError && (
            <p className="text-error text-sm font-medium bg-error/10 px-3 py-2 rounded-lg">
              {pwdError}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onBackToCurrent} size="sm">
              Voltar
            </Button>
            <Button
              variant="primary"
              onClick={onNewPwdSubmit}
              disabled={!newPwd || !confirmPwd}
              size="sm"
            >
              Alterar Senha
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
