import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataProvider } from '@/context/DataContext';
import { FinancialSecurityProvider } from '@/context/FinancialSecurityContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { api } from '@/services/infrastructure/api';
import ConfiguracoesPage from './ConfiguracoesPage';

function renderPage() {
  return render(
    <ThemeProvider>
      <FinancialSecurityProvider>
        <DataProvider>
          <ConfiguracoesPage />
        </DataProvider>
      </FinancialSecurityProvider>
    </ThemeProvider>,
  );
}

describe('ConfiguracoesPage', () => {
  beforeEach(() => {
    localStorage.clear();

    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    const reloadMock = vi.fn();
    if (!Reflect.set(window.location, 'reload', reloadMock)) {
      vi.stubGlobal('location', { ...window.location, reload: reloadMock });
    }

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:nexusarqui'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.getElementById('modal-root')?.remove();
  });

  it('renders sections, profile info and default contract deadlines', () => {
    renderPage();

    expect(screen.getByText('Configurações')).toBeInTheDocument();
    expect(screen.getByText('Aparência')).toBeInTheDocument();
    expect(screen.getByText('Segurança Financeira')).toBeInTheDocument();
    expect(screen.getByText('Prazos Padrão de Contrato')).toBeInTheDocument();
    expect(screen.getByText('Dados do Aplicativo')).toBeInTheDocument();
    expect(screen.getByText('Rafael Soares Munaro')).toBeInTheDocument();
    expect(screen.getByDisplayValue('7')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
  });

  it('toggles appearance/lock switches and applies deadline fallback defaults', () => {
    renderPage();

    const darkModeToggle = screen.getByRole('switch', { name: 'Alternar modo escuro' });
    const lockToggle = screen.getByRole('switch', {
      name: 'Exigir senha para visualizar valores',
    });

    expect(darkModeToggle).toHaveAttribute('aria-checked', 'true');
    expect(lockToggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(darkModeToggle);
    fireEvent.click(lockToggle);

    expect(darkModeToggle).toHaveAttribute('aria-checked', 'false');
    expect(lockToggle).toHaveAttribute('aria-checked', 'true');

    const [preliminarInput, executivoInput] = screen.getAllByRole('spinbutton');

    fireEvent.change(preliminarInput, { target: { value: '' } });
    fireEvent.change(executivoInput, { target: { value: '' } });

    expect(preliminarInput).toHaveValue(7);
    expect(executivoInput).toHaveValue(30);
  });

  it('exports data with generated backup file URL', () => {
    const exportDataSpy = vi.spyOn(api, 'exportData').mockReturnValue('{"projects":[]}');
    const createObjectURLMock = vi.mocked(URL.createObjectURL);
    const revokeObjectURLMock = vi.mocked(URL.revokeObjectURL);

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));

    expect(exportDataSpy).toHaveBeenCalledTimes(1);
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledTimes(1);
  });

  it('shows export error alert when export throws', () => {
    const exportError = new Error('Falha de exportação');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(api, 'exportData').mockImplementation(() => {
      throw exportError;
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));

    expect(window.alert).toHaveBeenCalledWith(
      'Erro ao exportar dados. Verifique o console para mais detalhes.',
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith('Export error:', exportError);
  });

  it('imports backup successfully and closes import modal', async () => {
    class SuccessfulFileReader {
      public onload: ((event: ProgressEvent<FileReader>) => void) | null = null;

      public readAsText(): void {
        this.onload?.({
          target: { result: '{"clients":[]}' },
        } as unknown as ProgressEvent<FileReader>);
      }
    }

    vi.stubGlobal('FileReader', SuccessfulFileReader as unknown as typeof FileReader);

    const importDataSpy = vi.spyOn(api, 'importData').mockImplementation(() => undefined);

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Importar' }));

    const input = screen.getByLabelText('Selecionar arquivo de backup para importação');
    const file = new File(['{"clients":[]}'], 'backup.json', { type: 'application/json' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(importDataSpy).toHaveBeenCalledWith('{"clients":[]}');
      expect(window.alert).toHaveBeenCalledWith(
        'Dados importados com sucesso! A página será recarregada.',
      );
      expect(
        screen.queryByLabelText('Selecionar arquivo de backup para importação'),
      ).not.toBeInTheDocument();
    });
  });

  it('does not import when file is missing', () => {
    const importDataSpy = vi.spyOn(api, 'importData').mockImplementation(() => undefined);
    const fileReaderCtor = vi.fn();

    vi.stubGlobal('FileReader', fileReaderCtor as unknown as typeof FileReader);

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Importar' }));

    fireEvent.change(screen.getByLabelText('Selecionar arquivo de backup para importação'), {
      target: { files: [] },
    });

    expect(fileReaderCtor).not.toHaveBeenCalled();
    expect(importDataSpy).not.toHaveBeenCalled();
  });

  it('shows import error alert and closes modal when imported data is invalid', async () => {
    class FailedImportFileReader {
      public onload: ((event: ProgressEvent<FileReader>) => void) | null = null;

      public readAsText(): void {
        this.onload?.({
          target: { result: '{"invalid":true}' },
        } as unknown as ProgressEvent<FileReader>);
      }
    }

    vi.stubGlobal('FileReader', FailedImportFileReader as unknown as typeof FileReader);

    const importError = new Error('Arquivo inválido');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(api, 'importData').mockImplementation(() => {
      throw importError;
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Importar' }));

    const input = screen.getByLabelText('Selecionar arquivo de backup para importação');
    const file = new File(['{"invalid":true}'], 'invalid.json', { type: 'application/json' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Erro ao importar dados: Arquivo inválido');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Import error:', importError);
      expect(
        screen.queryByLabelText('Selecionar arquivo de backup para importação'),
      ).not.toBeInTheDocument();
    });
  });

  it('shows import error alert when file content is unreadable', async () => {
    class UnreadableFileReader {
      public onload: ((event: ProgressEvent<FileReader>) => void) | null = null;

      public readAsText(): void {
        this.onload?.({
          target: { result: new ArrayBuffer(8) },
        } as unknown as ProgressEvent<FileReader>);
      }
    }

    vi.stubGlobal('FileReader', UnreadableFileReader as unknown as typeof FileReader);

    const importDataSpy = vi.spyOn(api, 'importData').mockImplementation(() => undefined);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Importar' }));

    const input = screen.getByLabelText('Selecionar arquivo de backup para importação');
    const file = new File(['binary-content'], 'corrupted.json', { type: 'application/json' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(importDataSpy).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Erro ao importar dados: File could not be read');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('clears all data after valid confirmation text', async () => {
    const clearAllDataSpy = vi.spyOn(api, 'clearAllData').mockImplementation(() => undefined);

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Limpar Dados' }));

    const confirmationInput = screen.getByLabelText('Digite EXCLUIR para confirmar');
    const confirmButton = screen.getByRole('button', {
      name: 'Eu entendo as consequências, excluir tudo',
    });

    expect(confirmButton).toBeDisabled();

    fireEvent.change(confirmationInput, { target: { value: 'EXCLUIR' } });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(clearAllDataSpy).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenCalledWith(
        'Todos os dados foram removidos com sucesso! A página será recarregada.',
      );
    });
  });

  it('shows clear-data error alert when clear operation fails', async () => {
    const clearError = new Error('Falha ao limpar');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(api, 'clearAllData').mockImplementation(() => {
      throw clearError;
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Limpar Dados' }));

    fireEvent.change(screen.getByLabelText('Digite EXCLUIR para confirmar'), {
      target: { value: 'EXCLUIR' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Eu entendo as consequências, excluir tudo' }),
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Erro ao limpar os dados.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Clear data error:', clearError);
    });
  });

  it('returns to current-password step when user clicks back during reset', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Redefinir' }));

    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: '#Umbrella911' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: '12345' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByLabelText('Senha atual')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nova senha')).not.toBeInTheDocument();
  });

  it('runs full password-reset flow with validations and success state', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Redefinir' }));

    const continueButton = screen.getByRole('button', { name: 'Continuar' });
    expect(continueButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: 'errada' } });
    fireEvent.click(continueButton);

    expect(screen.getByText('Senha atual incorreta.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: '#Umbrella911' } });
    fireEvent.click(continueButton);

    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));

    expect(screen.getByText('A nova senha deve ter pelo menos 4 caracteres.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: '54321' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));

    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: '12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));

    await waitFor(() => {
      expect(screen.getByText('Senha alterada com sucesso!')).toBeInTheDocument();
    });
  });

  it('resets password modal state after closing and reopening', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Redefinir' }));

    fireEvent.change(screen.getByLabelText('Senha atual'), {
      target: { value: 'senha-temporaria' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    fireEvent.click(screen.getByRole('button', { name: 'Redefinir' }));

    const currentPwdInput = screen.getByLabelText('Senha atual');
    expect(currentPwdInput).toHaveValue('');
    expect(screen.queryByText('Senha atual incorreta.')).not.toBeInTheDocument();
  });
});
