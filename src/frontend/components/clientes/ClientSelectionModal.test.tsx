import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientSelectionModal } from './ClientSelectionModal';
import type { Client } from '../../types';

// Mock UI components
vi.mock('../ui', () => ({
  Modal: ({
    isOpen,
    title,
    children,
  }: {
    isOpen: boolean;
    title?: string;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="mock-modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

vi.mock('../ui/icons', () => ({
  SearchIcon: () => <svg data-testid="search-icon" />,
  TrashIcon: () => <svg data-testid="trash-icon" />,
}));

describe('ClientSelectionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    manualSearch: '',
    onManualSearchChange: vi.fn(),
    clients: [] as Client[],
    selectedIds: new Set<string>(),
    onToggleSelectAll: vi.fn(),
    onToggleClient: vi.fn(),
    onClearSelection: vi.fn(),
  };

  const mockClients: Client[] = [
    {
      id: '1',
      name: 'Client A',
      cpfCnpj: '111.111.111-11',
      archived: false,
    } as Client,
    {
      id: '2',
      name: 'Client B',
      cpfCnpj: '',
      archived: true,
    } as Client,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render if isOpen is false', () => {
      render(<ClientSelectionModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    it('should render empty state if no clients provided', () => {
      render(<ClientSelectionModal {...defaultProps} />);
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
      expect(screen.getByText('Nenhum cliente encontrado.')).toBeInTheDocument();
      expect(screen.getByText('0 selecionado(s)')).toBeInTheDocument();
      // Clear selection button should not be present
      expect(screen.queryByRole('button', { name: /Limpar/ })).not.toBeInTheDocument();
    });

    it('should render clients list and display default texts', () => {
      render(<ClientSelectionModal {...defaultProps} clients={mockClients} />);

      expect(screen.getByText('Client A')).toBeInTheDocument();
      expect(screen.getByText('111.111.111-11')).toBeInTheDocument();
      expect(screen.getByText('Ativo')).toBeInTheDocument();

      expect(screen.getByText('Client B')).toBeInTheDocument();
      expect(screen.getByText('Sem documento')).toBeInTheDocument();
      expect(screen.getByText('Arquivado')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onManualSearchChange when typing in search input', () => {
      render(<ClientSelectionModal {...defaultProps} clients={mockClients} />);

      const searchInput = screen.getByPlaceholderText('Buscar por nome ou CPF...');
      fireEvent.change(searchInput, { target: { value: 'Client' } });

      expect(defaultProps.onManualSearchChange).toHaveBeenCalledWith('Client');
    });

    it('should call onToggleClient when clicking a client checkbox', () => {
      render(<ClientSelectionModal {...defaultProps} clients={mockClients} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(2);

      fireEvent.click(checkboxes[0]);
      expect(defaultProps.onToggleClient).toHaveBeenCalledWith('1');
    });

    it('should show "Desmarcar Todos" if all clients are selected', () => {
      const selectedIds = new Set(['1', '2']);
      render(
        <ClientSelectionModal {...defaultProps} clients={mockClients} selectedIds={selectedIds} />,
      );

      const toggleAllBtn = screen.getByRole('button', { name: 'Desmarcar Todos' });
      expect(toggleAllBtn).toBeInTheDocument();

      fireEvent.click(toggleAllBtn);
      expect(defaultProps.onToggleSelectAll).toHaveBeenCalled();
    });

    it('should show "Marcar Todos" if not all clients are selected', () => {
      const selectedIds = new Set(['1']);
      render(
        <ClientSelectionModal {...defaultProps} clients={mockClients} selectedIds={selectedIds} />,
      );

      const toggleAllBtn = screen.getByRole('button', { name: 'Marcar Todos' });
      expect(toggleAllBtn).toBeInTheDocument();
      expect(screen.getByText('1 selecionado(s)')).toBeInTheDocument();
    });

    it('should call onClearSelection when clear selection button is clicked', () => {
      const selectedIds = new Set(['1']);
      render(
        <ClientSelectionModal {...defaultProps} clients={mockClients} selectedIds={selectedIds} />,
      );

      const clearBtn = screen.getByRole('button', { name: /Limpar Seleção/ });
      expect(clearBtn).toBeInTheDocument();

      fireEvent.click(clearBtn);
      expect(defaultProps.onClearSelection).toHaveBeenCalled();
    });

    it('should call onClose when Confirmar is clicked', () => {
      render(<ClientSelectionModal {...defaultProps} clients={mockClients} />);

      const confirmBtn = screen.getByRole('button', { name: 'Confirmar' });
      fireEvent.click(confirmBtn);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});
