import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientFormModal } from './ClientFormModal';
import { useCoreData } from '../../context/DataContext';
import { useClientFormHandlers } from '../../hooks/useClientFormHandlers';
import { calculateProjectFinancialSummary } from '../../services/clientFinancialSummaryService';

// Mock dependencies
vi.mock('../../context/DataContext', () => ({
  useCoreData: vi.fn(),
}));

vi.mock('../../hooks/useClientFormHandlers', () => ({
  useClientFormHandlers: vi.fn(),
}));

vi.mock('../../services/clientFinancialSummaryService', () => ({
  calculateProjectFinancialSummary: vi.fn(),
}));

// Mock inner components to simplify DOM and isolate testing of the modal
vi.mock('./client-form', () => ({
  ClientFormAuditTab: () => <div data-testid="mock-audit-tab" />,
  ClientFormFinanceTab: ({ financialSummaries }: { financialSummaries: unknown }) => (
    <div data-testid="mock-finance-tab" data-summaries={JSON.stringify(financialSummaries)} />
  ),
  ClientFormInfoTab: () => <div data-testid="mock-info-tab" />,
  ClientFormMeetingsTab: () => <div data-testid="mock-meetings-tab" />,
  ClientFormNotesTab: () => <div data-testid="mock-notes-tab" />,
  ClientFormFooter: ({
    onSave,
    onSwitchToEdit,
    onClose,
    isReadOnly,
  }: {
    onSave: () => void;
    onSwitchToEdit: () => void;
    onClose: () => void;
    isReadOnly: boolean;
  }) => (
    <div data-testid="mock-footer">
      <button onClick={onSave} data-testid="save-btn">
        Save
      </button>
      <button onClick={onSwitchToEdit} data-testid="edit-btn">
        Edit
      </button>
      <button onClick={onClose} data-testid="close-btn">
        Close
      </button>
      <span data-readonly={isReadOnly}>ReadOnly:{String(isReadOnly)}</span>
    </div>
  ),
}));

// Mock the UI Modal since we want to focus on ClientFormModal behavior
vi.mock('../ui/Modal', () => ({
  default: ({
    isOpen,
    title,
    children,
  }: {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="mock-modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

describe('ClientFormModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnSwitchToEdit = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    onSwitchToEdit: mockOnSwitchToEdit,
    initialClient: null,
    isReadOnly: false,
  };

  const defaultClient = {
    id: '1',
    name: 'Test Client',
    clientType: 'PF',
    meetings: [],
    auditLog: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCoreData).mockReturnValue({
      projects: [],
    } as never);

    // Default mock implementation for handlers
    vi.mocked(useClientFormHandlers).mockReturnValue({
      client: defaultClient,
      clientProjects: [],
      isInterestsDropdownOpen: false,
      setInterestsDropdownOpen: vi.fn(),
      newMeeting: {},
      setNewMeeting: vi.fn(),
      handleChange: vi.fn(),
      handleAddressChange: vi.fn(),
      handleRepChange: vi.fn(),
      handleContactChange: vi.fn(),
      handleAddContact: vi.fn(),
      handleRemoveContact: vi.fn(),
      handleServiceInterestChange: vi.fn(),
      handleAddMeeting: vi.fn(),
      handleDeleteMeeting: vi.fn(),
      getModifiedClass: vi.fn(),
    } as never);

    vi.mocked(calculateProjectFinancialSummary).mockReturnValue({
      totalValue: 1000,
    } as never);
  });

  describe('Rendering configuration', () => {
    it('should show "Novo Cliente" title when there is no initial client', () => {
      render(<ClientFormModal {...defaultProps} />);
      expect(screen.getByText('Novo Cliente')).toBeInTheDocument();
      // Only info tab should be rendered by default, and no navigation should be present for new client
      expect(screen.getByTestId('mock-info-tab')).toBeInTheDocument();
      expect(screen.queryByText('Informações Gerais')).not.toBeInTheDocument(); // nav is hidden for new
    });

    it('should show "Editar Cliente" title when there is an initial client', () => {
      render(<ClientFormModal {...defaultProps} initialClient={defaultClient as never} />);
      expect(screen.getByText('Editar Cliente')).toBeInTheDocument();
      // Navigation should be present
      expect(screen.getByText('Informações Gerais')).toBeInTheDocument();
      expect(screen.getByText('Financeiro')).toBeInTheDocument();
      expect(screen.getByText('Reuniões')).toBeInTheDocument();
      expect(screen.getByText('Observações')).toBeInTheDocument();
      // By default audit log is empty so "Histórico" shouldn't show
      expect(screen.queryByText('Histórico')).not.toBeInTheDocument();
    });

    it('should show "Detalhes do Cliente" title when read-only', () => {
      render(
        <ClientFormModal
          {...defaultProps}
          initialClient={defaultClient as never}
          isReadOnly={true}
        />,
      );
      expect(screen.getByText('Detalhes do Cliente')).toBeInTheDocument();
    });

    it('should show "Histórico" tab button if auditLog has items', () => {
      render(
        <ClientFormModal
          {...defaultProps}
          initialClient={
            { ...defaultClient, auditLog: [{ date: '2026-01-01', action: 'Created' }] } as never
          }
        />,
      );
      expect(screen.getByText('Histórico')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    const renderWithTabs = () => {
      render(
        <ClientFormModal
          {...defaultProps}
          initialClient={{ ...defaultClient, auditLog: [{ date: '2026-01-01' }] } as never}
        />,
      );
    };

    it('should render correct tab contents on navigation click', () => {
      renderWithTabs();

      // Info is default
      expect(screen.getByTestId('mock-info-tab')).toBeInTheDocument();

      // Click Financeiro
      fireEvent.click(screen.getByText('Financeiro'));
      expect(screen.queryByTestId('mock-info-tab')).not.toBeInTheDocument();
      expect(screen.getByTestId('mock-finance-tab')).toBeInTheDocument();

      // Click Reuniões
      fireEvent.click(screen.getByText('Reuniões'));
      expect(screen.getByTestId('mock-meetings-tab')).toBeInTheDocument();

      // Click Observações
      fireEvent.click(screen.getByText('Observações'));
      expect(screen.getByTestId('mock-notes-tab')).toBeInTheDocument();

      // Click Histórico
      fireEvent.click(screen.getByText('Histórico'));
      expect(screen.getByTestId('mock-audit-tab')).toBeInTheDocument();
    });
  });

  describe('Finance calculations', () => {
    it('should map clientProjects to financial summaries', () => {
      const mockProject = { id: 'p1', name: 'Proj 1' };
      vi.mocked(useClientFormHandlers).mockReturnValue({
        client: defaultClient,
        clientProjects: [mockProject],
      } as never);
      vi.mocked(calculateProjectFinancialSummary).mockReturnValue({ totalValue: 5000 } as never);

      render(<ClientFormModal {...defaultProps} initialClient={defaultClient as never} />);

      fireEvent.click(screen.getByText('Financeiro'));

      const financeTab = screen.getByTestId('mock-finance-tab');
      const summaries = JSON.parse(financeTab.getAttribute('data-summaries') || '[]');
      expect(summaries[0]).toEqual({
        totalValue: 5000,
        projectId: 'p1',
        projectName: 'Proj 1',
      });
    });
  });

  describe('Footer actions', () => {
    it('should pass handlers to footer and trigger them', () => {
      render(<ClientFormModal {...defaultProps} isReadOnly={true} />);

      const footer = screen.getByTestId('mock-footer');
      expect(footer).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('save-btn'));
      expect(mockOnSave).toHaveBeenCalledWith(defaultClient, null); // called with parsed client state

      fireEvent.click(screen.getByTestId('edit-btn'));
      expect(mockOnSwitchToEdit).toHaveBeenCalled();

      fireEvent.click(screen.getByTestId('close-btn'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
