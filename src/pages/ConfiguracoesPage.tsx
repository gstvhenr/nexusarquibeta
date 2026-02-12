import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/infrastructure/api';
import { useData } from '../context/DataContext';

const Section: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-border-color">
    <div className="md:col-span-1">
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary mt-1">{description}</p>
    </div>
    <div className="md:col-span-2 bg-surface rounded-xl shadow-soft p-6">{children}</div>
  </div>
);

const Toggle: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}> = ({ enabled, onChange, label }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`${enabled ? 'bg-primary' : 'bg-border-color'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface`}
    role="switch"
    aria-checked={enabled ? 'true' : 'false'}
    aria-label={label || 'Alternar'}
  >
    <span
      className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);

const ConfiguracoesPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { contractDeadlines, setContractDeadlines } = useData();

  // State for modals
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isClearModalOpen, setClearModalOpen] = useState(false);
  const [clearConfirmationText, setClearConfirmationText] = useState('');

  const handleExportData = () => {
    try {
      const jsonString = api.exportData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexusarqui_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
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
    setContractDeadlines((prev) => ({ ...prev, [field]: value }));
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
          title="Prazos Padrão de Contrato"
          description="Defina os prazos automáticos aplicados ao converter propostas em projetos."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Prazo Projeto Preliminar (dias)
              </label>
              <input
                type="number"
                min="1"
                value={contractDeadlines.defaultPreliminarDeadlineDays}
                onChange={(e) =>
                  handleDeadlineChange(
                    'defaultPreliminarDeadlineDays',
                    parseInt(e.target.value) || 7,
                  )
                }
                className="w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary"
                aria-label="Prazo Projeto Preliminar em dias"
              />
              <p className="text-xs text-text-secondary mt-1">Geralmente 7 dias úteis.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Prazo Projeto Executivo (dias)
              </label>
              <input
                type="number"
                min="1"
                value={contractDeadlines.defaultExecutiveDeadlineDays}
                onChange={(e) =>
                  handleDeadlineChange(
                    'defaultExecutiveDeadlineDays',
                    parseInt(e.target.value) || 30,
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

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Importar Dados"
      >
        <div className="text-center">
          <p className="text-text-primary mb-4">
            Selecione um arquivo de backup (.json) para importar.{' '}
            <strong className="text-error">
              Atenção: Isso substituirá todos os dados existentes.
            </strong>
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="mx-auto text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            aria-label="Selecionar arquivo de backup para importação"
          />
        </div>
      </Modal>

      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Confirmar Exclusão de Dados"
      >
        <div className="space-y-4">
          <p className="text-text-primary">
            Esta é uma ação irreversível. Todos os seus projetos, clientes, propostas e
            configurações (exceto o tema) serão{' '}
            <strong className="text-error">permanentemente excluídos</strong>.
          </p>
          <p className="text-text-primary">
            Para confirmar, digite <strong className="text-error font-mono">EXCLUIR</strong> no
            campo abaixo.
          </p>
          <div>
            <input
              type="text"
              value={clearConfirmationText}
              onChange={(e) => setClearConfirmationText(e.target.value)}
              className="w-full bg-background p-2 rounded-md border border-border-color text-center font-mono"
              aria-label="Digite EXCLUIR para confirmar"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleClearData}
              disabled={clearConfirmationText !== 'EXCLUIR'}
              className="w-full px-6 py-2 rounded-lg font-semibold text-white bg-error hover:opacity-90 disabled:bg-text-secondary/50 disabled:cursor-not-allowed"
            >
              Eu entendo as consequências, excluir tudo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConfiguracoesPage;
