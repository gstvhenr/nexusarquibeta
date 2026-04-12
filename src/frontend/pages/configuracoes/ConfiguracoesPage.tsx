import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { Button, FormField, Input, Section, Toggle } from '@/components/ui';
import {
  ClearDataModal,
  GoogleDriveSection,
  ImportDataModal,
  PasswordResetModal,
} from '@/components/configuracoes';
import { useSystemData } from '@/context/DataContext';
import { googleDriveService } from '@/services/infrastructure/googleDriveService';
import type { DriveState } from '@/services/infrastructure/googleDriveTypes';
import { useFinancialSecurity } from '@/context/FinancialSecurityContext';
import { useTheme } from '@/context/ThemeContext';
import { useAutoReset } from '@/hooks/useAutoReset';
import { useDisclosure } from '@/hooks/useDisclosure';
import useLocalStorage from '@/hooks/useLocalStorage';
import { api } from '@/services/infrastructure/api';
import { getTodayDateOnly } from '@/utils/formatters';

function ConfiguracoesPage(): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const { contractDeadlines, setContractDeadlines } = useSystemData();
  const { isLockEnabled, toggleLock, changePassword, hasRegisteredPassword, registerPassword } =
    useFinancialSecurity();

  const [googleAccount, setGoogleAccount] = useState<DriveState>(googleDriveService.getState());

  useEffect(() => {
    return googleDriveService.subscribe((next) => setGoogleAccount(next));
  }, []);

  const handleLogout = useCallback(() => {
    if (window.confirm('Deseja realmente sair da conta Google?')) {
      googleDriveService.signOut();
      window.location.reload();
    }
  }, []);

  const importModal = useDisclosure();
  const clearModal = useDisclosure();
  const [clearConfirmationText, setClearConfirmationText] = useState('');

  const passwordModal = useDisclosure();
  const [pwdStep, setPwdStep] = useState<'current' | 'new'>('current');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useAutoReset(false, 1500);

  const resetPasswordModal = useCallback(() => {
    setPwdStep(hasRegisteredPassword ? 'current' : 'new');
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setPwdError('');
  }, [hasRegisteredPassword]);

  const openPasswordModal = useCallback(() => {
    resetPasswordModal();
    passwordModal.open();
  }, [resetPasswordModal, passwordModal]);

  const closePasswordModal = useCallback(() => {
    passwordModal.close();
    resetPasswordModal();
  }, [resetPasswordModal, passwordModal]);

  const handleValidateCurrentPassword = useCallback(() => {
    const result = changePassword(currentPwd, currentPwd);
    if (result.success) {
      setPwdError('');
      setPwdStep('new');
    } else {
      setPwdError(result.error || 'Senha incorreta.');
    }
  }, [currentPwd, changePassword]);

  const handleNewPwdSubmit = useCallback(() => {
    if (!newPwd || newPwd.length < 4) {
      setPwdError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('As senhas não coincidem.');
      return;
    }

    const result = hasRegisteredPassword
      ? changePassword(currentPwd, newPwd)
      : registerPassword(newPwd);

    if (result.success) {
      setPwdSuccess(true);
      setPwdError('');
    } else {
      setPwdError(result.error || 'Erro ao alterar a senha.');
    }
  }, [
    newPwd,
    confirmPwd,
    currentPwd,
    changePassword,
    registerPassword,
    hasRegisteredPassword,
    setPwdSuccess,
  ]);

  const handleExportData = () => {
    try {
      const jsonString = api.exportData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `nexusarqui_backup_${getTodayDateOnly()}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erro ao exportar dados. Verifique o console para mais detalhes.');
      console.error('Export error:', error);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const text = loadEvent.target?.result;
        if (typeof text !== 'string') throw new Error('File could not be read');

        api.importData(text);

        alert('Dados importados com sucesso! A página será recarregada.');
        window.location.reload();
      } catch (error) {
        alert(
          `Erro ao importar dados: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        console.error('Import error:', error);
      } finally {
        importModal.close();
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (clearConfirmationText !== 'EXCLUIR') {
      alert('Texto de confirmação incorreto.');
      return;
    }
    try {
      api.clearAllData();
      alert('Todos os dados foram removidos com sucesso! A página será recarregada.');
      window.location.reload();
    } catch (error) {
      alert('Erro ao limpar os dados.');
      console.error('Clear data error:', error);
    }
  };

  const [localDeadlines, setLocalDeadlines] = useState(contractDeadlines);
  const isPrazosChanged =
    localDeadlines.defaultPreliminarDeadlineDays !==
      contractDeadlines.defaultPreliminarDeadlineDays ||
    localDeadlines.defaultExecutiveDeadlineDays !== contractDeadlines.defaultExecutiveDeadlineDays;
  const isRevisoesChanged =
    localDeadlines.defaultRevisionLimit !== contractDeadlines.defaultRevisionLimit;

  useEffect(() => {
    setLocalDeadlines(contractDeadlines);
  }, [contractDeadlines]);

  const handleDeadlineChange = (field: keyof typeof contractDeadlines, value: number) => {
    setLocalDeadlines((previous) => ({ ...previous, [field]: value }));
  };

  const saveDeadlines = () => {
    setContractDeadlines(localDeadlines);
    alert('Prazos e revisões atualizados com sucesso!');
  };

  // --- User Profile Form ---
  const [storedProfile, setStoredProfile] = useLocalStorage<{
    name: string;
    cau: string;
    phone: string;
    address: string;
  }>('user_profile_info', {
    name: 'Rafael Soares Munaro',
    cau: 'A231798-2',
    phone: '(19) 99690-8104',
    address: 'Rua Padre Fabiano, 1072 - Centro, Capivari-SP',
  });

  const [profileForm, setProfileForm] = useState(storedProfile);
  const isProfileChanged = JSON.stringify(profileForm) !== JSON.stringify(storedProfile);

  const handleProfileChange = (field: keyof typeof profileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = () => {
    setStoredProfile(profileForm);
    alert('Informações do usuário atualizadas com sucesso!');
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Configurações" />

      <div className="divide-y divide-border-color">
        <Section
          title="Conta Google"
          description="Conta utilizada para autenticação e sincronização."
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">
                  {googleAccount.userEmail ?? 'Conta conectada'}
                </h4>
                <p className="text-xs text-text-secondary">
                  {googleAccount.status === 'connected' ? 'Autenticado via Google' : 'Sessão ativa'}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="border-error/30 text-error hover:bg-error/10 hover:border-error flex-shrink-0"
              onClick={handleLogout}
            >
              Sair da Conta
            </Button>
          </div>
        </Section>

        <Section title="Aparência" description="Customize a aparência da interface.">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-text-primary">Modo Escuro</h4>
              <p className="text-sm text-text-secondary">Reduza o cansaço visual.</p>
            </div>
            <Toggle
              checked={theme === 'dark'}
              onCheckedChange={() => toggleTheme()}
              label="Alternar modo escuro"
            />
          </div>
        </Section>

        <Section
          title="Segurança Financeira"
          description="Controle a visibilidade de valores financeiros sensíveis."
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-text-primary">Exigir Senha</h4>
                <p className="text-sm text-text-secondary">Valores financeiros ocultados.</p>
              </div>
              <Toggle
                checked={isLockEnabled}
                onCheckedChange={toggleLock}
                label="Exigir senha para visualizar valores"
              />
            </div>

            <div className="flex items-center justify-between border-t border-border-color/50 pt-5">
              <div>
                <h4 className="font-semibold text-text-primary">
                  {!hasRegisteredPassword ? 'Cadastrar Senha' : 'Redefinir Senha'}
                </h4>
                <p className="text-sm text-text-secondary">
                  {!hasRegisteredPassword
                    ? 'Configurar senha de acesso para ocultar valores financeiros exibidos na página.'
                    : 'Alterar senha de acesso para desbloquear os valores financeiros.'}
                </p>
              </div>
              <Button variant="secondary" onClick={openPasswordModal}>
                {!hasRegisteredPassword ? 'Cadastrar' : 'Redefinir'}
              </Button>
            </div>
          </div>
        </Section>

        <Section
          title="Prazos Padrão de Contrato"
          description="Defina os prazos automáticos aplicados ao converter propostas em projetos."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormField label="Prazo Projeto Preliminar (dias)">
                <Input
                  type="number"
                  min="1"
                  className="text-right"
                  value={localDeadlines.defaultPreliminarDeadlineDays}
                  onChange={(event) =>
                    handleDeadlineChange(
                      'defaultPreliminarDeadlineDays',
                      parseInt(event.target.value, 10) || 7,
                    )
                  }
                />
              </FormField>
            </div>
            <div>
              <FormField label="Prazo Projeto Executivo (dias)">
                <Input
                  type="number"
                  min="1"
                  className="text-right"
                  value={localDeadlines.defaultExecutiveDeadlineDays}
                  onChange={(event) =>
                    handleDeadlineChange(
                      'defaultExecutiveDeadlineDays',
                      parseInt(event.target.value, 10) || 30,
                    )
                  }
                />
              </FormField>
            </div>
          </div>

          {isPrazosChanged && (
            <div className="flex justify-end pt-2 border-t border-border-color/50 mt-4">
              <Button variant="primary" onClick={saveDeadlines}>
                Salvar
              </Button>
            </div>
          )}
        </Section>

        <Section
          title="Revisões de Projeto"
          description="Defina o limite padrão de revisões aplicado ao criar novos projetos."
          contentClassName="!py-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-start-2">
              <FormField label="Limite de Revisões Padrão">
                <Input
                  type="number"
                  min="0"
                  className="text-right"
                  value={localDeadlines.defaultRevisionLimit ?? 3}
                  onChange={(event) =>
                    handleDeadlineChange(
                      'defaultRevisionLimit',
                      parseInt(event.target.value, 10) || 3,
                    )
                  }
                />
              </FormField>
            </div>
          </div>

          {isRevisoesChanged && (
            <div className="flex justify-end pt-2 border-t border-border-color/50 mt-4">
              <Button variant="primary" onClick={saveDeadlines}>
                Salvar
              </Button>
            </div>
          )}
        </Section>

        <Section title="Informações do Usuário" description="Informações sobre o usuário.">
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Nome">
                <Input
                  value={profileForm.name}
                  className="text-right"
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                />
              </FormField>
              <FormField label="CAU">
                <Input
                  value={profileForm.cau}
                  className="text-right"
                  onChange={(e) => handleProfileChange('cau', e.target.value)}
                />
              </FormField>
              <FormField label="Telefone">
                <Input
                  value={profileForm.phone}
                  className="text-right"
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                />
              </FormField>
              <FormField label="Endereço">
                <Input
                  value={profileForm.address}
                  className="text-right"
                  onChange={(e) => handleProfileChange('address', e.target.value)}
                />
              </FormField>
            </div>

            {isProfileChanged && (
              <div className="flex justify-end pt-2 border-t border-border-color/50">
                <Button variant="primary" onClick={saveProfile}>
                  Salvar Informações
                </Button>
              </div>
            )}
          </div>
        </Section>

        <Section title="Dados do Aplicativo" description="Gerencie os dados salvos no NexusArqui.">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-text-primary">Exportar Dados</h4>
                <p className="text-sm text-text-secondary">
                  Salva todos os seus dados em um arquivo de backup.
                </p>
              </div>
              <Button variant="secondary" onClick={handleExportData}>
                Exportar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-text-primary">Importar Dados</h4>
                <p className="text-sm text-text-secondary">
                  Carrega os dados de um arquivo de backup e substitui todos os dados atuais.
                </p>
              </div>
              <Button variant="secondary" onClick={importModal.open}>
                Importar
              </Button>
            </div>
            <div className="flex items-center justify-between border-t border-border-color pt-4 mt-4">
              <div>
                <h4 className="font-semibold text-error">Limpar Todos os Dados</h4>
                <p className="text-sm text-text-secondary">
                  Remove permanentemente todos os dados do aplicativo.
                </p>
              </div>
              <Button variant="danger" onClick={clearModal.open}>
                Limpar Dados
              </Button>
            </div>
          </div>
        </Section>

        <GoogleDriveSection />
      </div>

      <ImportDataModal
        isOpen={importModal.isOpen}
        onClose={importModal.close}
        onImportData={handleImportData}
      />

      <ClearDataModal
        isOpen={clearModal.isOpen}
        onClose={clearModal.close}
        clearConfirmationText={clearConfirmationText}
        onChangeConfirmationText={setClearConfirmationText}
        onConfirmClear={handleClearData}
      />

      <PasswordResetModal
        isOpen={passwordModal.isOpen}
        onClose={closePasswordModal}
        isFirstTimeSetup={!hasRegisteredPassword}
        pwdSuccess={pwdSuccess}
        pwdStep={pwdStep}
        currentPwd={currentPwd}
        newPwd={newPwd}
        confirmPwd={confirmPwd}
        pwdError={pwdError}
        onCurrentPwdChange={(value) => {
          setCurrentPwd(value);
          setPwdError('');
        }}
        onNewPwdChange={(value) => {
          setNewPwd(value);
          setPwdError('');
        }}
        onConfirmPwdChange={(value) => {
          setConfirmPwd(value);
          setPwdError('');
        }}
        onValidateCurrentPassword={handleValidateCurrentPassword}
        onNewPwdSubmit={handleNewPwdSubmit}
        onBackToCurrent={() => {
          setPwdStep('current');
          setNewPwd('');
          setConfirmPwd('');
          setPwdError('');
        }}
      />
    </div>
  );
}

export default ConfiguracoesPage;
