import { useCallback, useState } from 'react';
import { PageHeader } from '../../components/layout';
import { useSystemData } from '../../context/DataContext';
import { useFinancialSecurity } from '../../context/FinancialSecurityContext';
import { useTheme } from '../../context/ThemeContext';
import { useAutoReset } from '../../hooks/useAutoReset';
import { api } from '../../services/infrastructure/api';
import { ClearDataModal } from './ClearDataModal';
import { ImportDataModal } from './ImportDataModal';
import { PasswordResetModal } from './PasswordResetModal';
import { Section } from './Section';
import { Toggle } from './Toggle';

function ConfiguracoesPage(): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const { contractDeadlines, setContractDeadlines } = useSystemData();
  const { isLockEnabled, toggleLock, changePassword } = useFinancialSecurity();

  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isClearModalOpen, setClearModalOpen] = useState(false);
  const [clearConfirmationText, setClearConfirmationText] = useState('');

  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [pwdStep, setPwdStep] = useState<'current' | 'new'>('current');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useAutoReset(false, 1500);

  const resetPasswordModal = useCallback(() => {
    setPwdStep('current');
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setPwdError('');
  }, []);

  const openPasswordModal = useCallback(() => {
    resetPasswordModal();
    setPasswordModalOpen(true);
  }, [resetPasswordModal]);

  const closePasswordModal = useCallback(() => {
    setPasswordModalOpen(false);
    resetPasswordModal();
  }, [resetPasswordModal]);

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

    const result = changePassword(currentPwd, newPwd);
    if (result.success) {
      setPwdSuccess(true);
      setPwdError('');
    } else {
      setPwdError(result.error || 'Erro ao alterar a senha.');
    }
  }, [newPwd, confirmPwd, currentPwd, changePassword, setPwdSuccess]);

  const handleExportData = () => {
    try {
      const jsonString = api.exportData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `nexusarqui_backup_${new Date().toISOString().split('T')[0]}.json`;
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
        setImportModalOpen(false);
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

  const handleDeadlineChange = (field: keyof typeof contractDeadlines, value: number) => {
    setContractDeadlines((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Configurações" />

      <div className="divide-y divide-border-color">
        <Section title="Aparência" description="Customize a aparência da interface.">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-text-primary">Modo Escuro</h4>
              <p className="text-sm text-text-secondary">
                Reduza o cansaço visual em ambientes com pouca luz.
              </p>
            </div>
            <Toggle
              enabled={theme === 'dark'}
              onChange={() => toggleTheme()}
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
                <p className="text-sm text-text-secondary">
                  Quando habilitado, valores financeiros ficam ocultos com *** até que a senha seja
                  inserida.
                </p>
              </div>
              <Toggle
                enabled={isLockEnabled}
                onChange={toggleLock}
                label="Exigir senha para visualizar valores"
              />
            </div>

            <div className="flex items-center justify-between border-t border-border-color/50 pt-5">
              <div>
                <h4 className="font-semibold text-text-primary">Redefinir Senha</h4>
                <p className="text-sm text-text-secondary">
                  Altere a senha utilizada para desbloquear os valores financeiros.
                </p>
              </div>
              <button
                type="button"
                onClick={openPasswordModal}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Redefinir
              </button>
            </div>
          </div>
        </Section>

        <Section
          title="Prazos Padrão de Contrato"
          description="Defina os prazos automáticos aplicados ao converter propostas em projetos."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="field-prazo-projeto-preliminar-dias"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Prazo Projeto Preliminar (dias)
              </label>
              <input
                id="field-prazo-projeto-preliminar-dias"
                type="number"
                min="1"
                value={contractDeadlines.defaultPreliminarDeadlineDays}
                onChange={(event) =>
                  handleDeadlineChange(
                    'defaultPreliminarDeadlineDays',
                    parseInt(event.target.value, 10) || 7,
                  )
                }
                className="w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary"
                aria-label="Prazo Projeto Preliminar em dias"
              />
              <p className="text-xs text-text-secondary mt-1">Geralmente 7 dias úteis.</p>
            </div>
            <div>
              <label
                htmlFor="field-prazo-projeto-executivo-dias"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Prazo Projeto Executivo (dias)
              </label>
              <input
                id="field-prazo-projeto-executivo-dias"
                type="number"
                min="1"
                value={contractDeadlines.defaultExecutiveDeadlineDays}
                onChange={(event) =>
                  handleDeadlineChange(
                    'defaultExecutiveDeadlineDays',
                    parseInt(event.target.value, 10) || 30,
                  )
                }
                className="w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary"
                aria-label="Prazo Projeto Executivo em dias"
              />
              <p className="text-xs text-text-secondary mt-1">
                Geralmente 30 dias úteis após aprovação do preliminar.
              </p>
            </div>
          </div>
        </Section>

        <Section
          title="Informações do Usuário"
          description="Estes dados podem ser usados em propostas e relatórios."
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <span className="w-24 font-semibold text-text-secondary">Nome:</span>
              <span className="text-text-primary">Rafael Soares Munaro</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 font-semibold text-text-secondary">CAU:</span>
              <span className="text-text-primary">A231798-2</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 font-semibold text-text-secondary">Telefone:</span>
              <span className="text-text-primary">(19) 99690-8104</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 font-semibold text-text-secondary">Endereço:</span>
              <span className="text-text-primary">
                Rua Padre Fabiano, 1072 - Centro, Capivari-SP
              </span>
            </div>
          </div>
        </Section>

        <Section
          title="Dados do Aplicativo"
          description="Gerencie os dados salvos no seu navegador."
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-text-primary">Exportar Dados</h4>
                <p className="text-sm text-text-secondary">
                  Salva todos os seus dados em um arquivo de backup.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Exportar
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-text-primary">Importar Dados</h4>
                <p className="text-sm text-text-secondary">
                  Carrega dados de um arquivo de backup. Substitui os dados atuais.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Importar
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-border-color pt-4 mt-4">
              <div>
                <h4 className="font-semibold text-error">Limpar Todos os Dados</h4>
                <p className="text-sm text-text-secondary">
                  Remove permanentemente todos os dados do aplicativo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setClearModalOpen(true)}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-error bg-error/10 hover:bg-error/20 transition-colors"
              >
                Limpar Dados
              </button>
            </div>
          </div>
        </Section>
      </div>

      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportData={handleImportData}
      />

      <ClearDataModal
        isOpen={isClearModalOpen}
        onClose={() => setClearModalOpen(false)}
        clearConfirmationText={clearConfirmationText}
        onChangeConfirmationText={setClearConfirmationText}
        onConfirmClear={handleClearData}
      />

      <PasswordResetModal
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
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
