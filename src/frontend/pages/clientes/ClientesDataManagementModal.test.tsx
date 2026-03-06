import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClientesDataManagementModal } from './ClientesDataManagementModal';

describe('ClientesDataManagementModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    vi.clearAllMocks();
  });

  const getBaseProps = (): React.ComponentProps<typeof ClientesDataManagementModal> => ({
    isOpen: true,
    onClose: vi.fn(),
    activeModalTab: 'export',
    onActiveModalTabChange: vi.fn(),
    exportMode: 'selected',
    onExportModeChange: vi.fn(),
    exportStatusFilter: 'active',
    onExportStatusFilterChange: vi.fn(),
    manualSelectionIds: new Set<string>(),
    onOpenSelectionModal: vi.fn(),
    isSelectionModalOpen: false,
    onCloseSelectionModal: vi.fn(),
    manualSearch: '',
    onManualSearchChange: vi.fn(),
    clientsForExportList: [],
    onToggleSelectAllManual: vi.fn(),
    onToggleManualSelection: vi.fn(),
    onClearManualSelection: vi.fn(),
    onExport: vi.fn(),
    fileInputRef: React.createRef<HTMLInputElement>(),
    importFile: null,
    onFileSelect: vi.fn(),
    onImportConfirm: vi.fn(),
  });

  describe('Renderização e Visibilidade', () => {
    it('deve renderizar o modal quando isOpen for true', () => {
      // Arrange
      const props = getBaseProps();

      // Act
      render(<ClientesDataManagementModal {...props} />);

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Gerenciamento de Dados')).toBeInTheDocument();
    });

    it('não deve renderizar o modal quando isOpen for false', () => {
      // Arrange
      const props = { ...getBaseProps(), isOpen: false };

      // Act
      render(<ClientesDataManagementModal {...props} />);

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('deve renderizar o ClientSelectionModal quando isSelectionModalOpen for true', () => {
      // Arrange
      const props = { ...getBaseProps(), isSelectionModalOpen: true };

      // Act
      render(<ClientesDataManagementModal {...props} />);

      // Assert
      expect(screen.getByRole('heading', { name: 'Seleção de Clientes' })).toBeInTheDocument();
    });

    it('deve chamar onClose ao clicar no botão Fechar', () => {
      // Arrange
      const props = getBaseProps();
      render(<ClientesDataManagementModal {...props} />);

      // Act
      fireEvent.click(screen.getByRole('button', { name: /^Fechar$/i }));

      // Assert
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Aba de Exportação', () => {
    it('deve permitir a troca de modo de exportação e chamadas onExportModeChange', () => {
      // Arrange
      const props = getBaseProps();
      render(<ClientesDataManagementModal {...props} />);

      // Act
      fireEvent.click(screen.getByRole('button', { name: /Lista Completa/i }));

      // Assert
      expect(props.onExportModeChange).toHaveBeenCalledWith('all');
    });

    it('deve permitir a troca de filtro de status e chamar onExportStatusFilterChange', () => {
      // Arrange
      const props = getBaseProps();
      render(<ClientesDataManagementModal {...props} />);

      // Act
      fireEvent.click(screen.getByRole('button', { name: /Ambos/i }));
      fireEvent.click(screen.getByRole('button', { name: /Apenas Arquivados/i }));
      fireEvent.click(screen.getByRole('button', { name: /Apenas Ativos/i }));

      // Assert
      expect(props.onExportStatusFilterChange).toHaveBeenCalledWith('both');
      expect(props.onExportStatusFilterChange).toHaveBeenCalledWith('archived');
      expect(props.onExportStatusFilterChange).toHaveBeenCalledWith('active');
    });

    it('deve mostrar botão de escolha de clientes quando modo é selected', () => {
      // Arrange
      const props = getBaseProps();
      props.exportMode = 'selected';
      props.manualSelectionIds = new Set(['1', '2']);
      render(<ClientesDataManagementModal {...props} />);

      // Act & Assert
      const selectionButton = screen.getByRole('button', { name: /2 Clientes Selecionados/i });
      expect(selectionButton).toBeInTheDocument();

      fireEvent.click(selectionButton);
      expect(props.onOpenSelectionModal).toHaveBeenCalledTimes(1);
    });

    it('não deve mostrar botão de escolha de clientes quando modo é all', () => {
      // Arrange
      const props = getBaseProps();
      props.exportMode = 'all';
      render(<ClientesDataManagementModal {...props} />);

      // Act & Assert
      expect(
        screen.queryByRole('button', { name: /Escolher Clientes da Lista/i }),
      ).not.toBeInTheDocument();
    });

    it('deve disparar exportação com o formato correto', () => {
      // Arrange
      const props = getBaseProps();
      render(<ClientesDataManagementModal {...props} />);

      // Act & Assert
      fireEvent.click(screen.getByRole('button', { name: /Ficha PDF/i }));
      expect(props.onExport).toHaveBeenCalledWith('PDF');

      fireEvent.click(screen.getByRole('button', { name: /DOCX/i }));
      expect(props.onExport).toHaveBeenCalledWith('DOCX');

      fireEvent.click(screen.getByRole('button', { name: /JSON/i }));
      expect(props.onExport).toHaveBeenCalledWith('JSON');
    });
  });

  describe('Aba de Importação', () => {
    it('deve mudar para a aba de importação e mostrar alerta de atenção se não houver arquivo', () => {
      // Arrange
      const props = getBaseProps();
      props.activeModalTab = 'import';
      render(<ClientesDataManagementModal {...props} />);

      // Act & Assert
      expect(screen.getByText('Atenção ao importar')).toBeInTheDocument();
      expect(screen.getByText('Clique para selecionar o arquivo')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Confirmar Importação/i }),
      ).not.toBeInTheDocument();
    });

    it('deve disparar onFileSelect quando arquivo é alterado', () => {
      // Arrange
      const props = getBaseProps();
      props.activeModalTab = 'import';
      render(<ClientesDataManagementModal {...props} />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Act
      fireEvent.change(fileInput, {
        target: { files: [new File(['{}'], 'test.json', { type: 'application/json' })] },
      });

      // Assert
      expect(props.onFileSelect).toHaveBeenCalledTimes(1);
    });

    it('deve disparar click do input de file ao clicar na área demarcada ou via teclado', () => {
      // Arrange
      const props = getBaseProps();
      props.activeModalTab = 'import';
      render(<ClientesDataManagementModal {...props} />);

      const clickableArea = screen.getByRole('button', {
        name: /Clique para selecionar o arquivo/i,
      });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      // Act - Mouse Click
      fireEvent.click(clickableArea);

      // Act - Enter and Space keydown
      fireEvent.keyDown(clickableArea, { key: 'Enter' });
      fireEvent.keyDown(clickableArea, { key: ' ' });

      // Assert
      expect(clickSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('deve mostrar o nome do arquivo e botão de confirmação quando há importFile, executando onImportConfirm', () => {
      // Arrange
      const props = getBaseProps();
      props.activeModalTab = 'import';
      props.importFile = new File([''], 'meu_backup.json');
      render(<ClientesDataManagementModal {...props} />);

      // Act & Assert
      expect(screen.getByText('meu_backup.json')).toBeInTheDocument();
      expect(screen.getByText('Arquivo pronto para importação')).toBeInTheDocument();

      const confirmButton = screen.getByRole('button', { name: /Confirmar Importação/i });
      fireEvent.click(confirmButton);
      expect(props.onImportConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
