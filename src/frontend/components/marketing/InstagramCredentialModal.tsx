import React, { useEffect, useState } from 'react';
import { Button, FormField, IconButton, Input, Modal } from '../ui';
import { EyeIcon, EyeOffIcon } from '../ui/icons';
import { useFinancialSecurity } from '../../context/FinancialSecurityContext';

type InstagramCredentialModalProps = {
  isOpen: boolean;
  onClose: () => void;
  credentials?: { username: string; password: string };
  onSaveCredentials: (creds: { username: string; password: string }) => void;
  networkName: string;
};

export const InstagramCredentialModal: (
  props: InstagramCredentialModalProps,
) => React.ReactNode = ({ isOpen, onClose, credentials, onSaveCredentials, networkName }) => {
  const { isLockEnabled, isUnlocked, unlock } = useFinancialSecurity();
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPasswordAttempt('');
      setShowPassword(false);
      setError('');
      setIsEditing(false);
      if (!isLockEnabled || isUnlocked) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    }
  }, [isOpen, isLockEnabled, isUnlocked]);

  const handleUnlock = () => {
    const success = unlock(passwordAttempt);
    if (success) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Senha incorreta.');
    }
  };

  const handleEditStart = () => {
    setEditUsername(credentials?.username || '');
    setEditPassword(credentials?.password || '');
    setIsEditing(true);
  };

  const handleEditSave = () => {
    onSaveCredentials({ username: editUsername, password: editPassword });
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Acessos — ${networkName}`}>
      {!authenticated ? (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Insira a senha de segurança para visualizar as credenciais de acesso.
          </p>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={passwordAttempt}
              onChange={(e) => setPasswordAttempt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUnlock();
              }}
              placeholder="Senha de segurança"
            />
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </IconButton>
          </div>
          {error && <p className="text-sm text-error font-semibold">{error}</p>}
          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={handleUnlock}>
              Desbloquear
            </Button>
          </div>
        </div>
      ) : isEditing ? (
        <div className="space-y-4">
          <FormField label="Usuário / E-mail">
            <Input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              placeholder="usuario@email.com"
            />
          </FormField>
          <div>
            <label
              htmlFor="field-senha"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Senha
            </label>
            <div className="relative">
              <Input
                id="field-senha"
                type={showPassword ? 'text' : 'password'}
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Senha da plataforma"
              />
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </IconButton>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2 border-t border-border-color mt-4">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleEditSave}>
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {credentials?.username ? (
            <>
              <div>
                <p className="text-xs font-semibold text-text-secondary mb-1">Usuário / E-mail</p>
                <p className="text-sm font-mono bg-background p-2.5 rounded-md border border-border-color select-all">
                  {credentials.username}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-text-secondary mb-1">Senha</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-sm font-mono bg-background p-2.5 rounded-md border border-border-color select-all">
                    {showPassword
                      ? credentials.password
                      : '•'.repeat(credentials.password.length || 8)}
                  </p>
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </IconButton>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-text-secondary text-center py-4">
              Nenhuma credencial cadastrada.
            </p>
          )}
          <div className="flex justify-end pt-2 border-t border-border-color mt-4">
            <Button
              variant="secondary"
              onClick={handleEditStart}
              className="text-primary hover:bg-primary/10"
            >
              {credentials?.username ? 'Editar credenciais' : 'Cadastrar credenciais'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
