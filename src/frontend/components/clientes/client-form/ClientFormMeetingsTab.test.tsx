import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientFormMeetingsTab } from './ClientFormMeetingsTab';

vi.mock('@/utils/formatters', () => ({
  formatDateWithTime: vi.fn((date) => `Formatted: ${date}`),
}));

vi.mock('../../ui/icons', () => ({
  TrashIcon: () => <svg data-testid="trash-icon" />,
}));

vi.mock('../../ui', () => ({
  IconButton: ({ children, onClick, 'aria-label': ariaLabel }: { children: React.ReactNode; onClick: () => void; 'aria-label'?: string }) => (
    <button onClick={onClick} aria-label={ariaLabel} data-testid="icon-button">
      {children}
    </button>
  ),
}));

describe('ClientFormMeetingsTab', () => {
  const mockMeetings = [
    {
      id: 'm1',
      date: '2026-03-04T10:00:00Z',
      reason: 'Initial Sync',
      notes: 'Discussed project scope.',
      projectId: 'p1',
      projectName: 'Project Alpha',
    },
    {
      id: 'm2',
      date: '2026-03-05T14:00:00Z',
      reason: 'Follow up',
      notes: 'Reviewed designs.',
    },
  ];

  const mockProjects = [
    { id: 'p1', name: 'Project Alpha' },
    { id: 'p2', name: 'Project Beta' },
  ];

  const mockNewMeeting = {
    date: '2026-03-06',
    reason: '',
    notes: '',
    projectId: '',
  };

  const mockProps = {
    meetings: mockMeetings,
    isReadOnly: false,
    commonInputClass: 'test-class',
    clientProjects: mockProjects as never[],
    newMeeting: mockNewMeeting,
    onNewMeetingChange: vi.fn(),
    onAddMeeting: vi.fn(),
    onDeleteMeeting: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('New Meeting Form', () => {
    it('should render new meeting form when not read-only', () => {
      render(<ClientFormMeetingsTab {...mockProps} />);

      expect(screen.getByText('Registrar Nova Reunião')).toBeInTheDocument();
      expect(screen.getByLabelText('Projeto da reunião')).toBeInTheDocument();
      expect(screen.getByLabelText('Data da reunião')).toBeInTheDocument();
      expect(screen.getByLabelText('Motivo da reunião')).toBeInTheDocument();
      expect(screen.getByLabelText('Anotações da reunião')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument();
    });

    it('should NOT render new meeting form when read-only', () => {
      render(<ClientFormMeetingsTab {...mockProps} isReadOnly={true} />);

      expect(screen.queryByText('Registrar Nova Reunião')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Adicionar' })).not.toBeInTheDocument();
    });

    it('should call onNewMeetingChange when fields are updated', () => {
      render(<ClientFormMeetingsTab {...mockProps} />);
      vi.clearAllMocks();

      const input = screen.getByLabelText('Motivo da reunião');
      fireEvent.change(input, { target: { value: 'New Sync' } });

      expect(mockProps.onNewMeetingChange).toHaveBeenCalledTimes(1);

      const updaterFn = mockProps.onNewMeetingChange.mock.calls[0][0];
      const callbackObj = updaterFn({ reason: 'old', notes: 'old' } as never);
      expect(callbackObj.reason).toBe('New Sync');
    });

    it('should call onAddMeeting when Adicionar is clicked', () => {
      render(<ClientFormMeetingsTab {...mockProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
      expect(mockProps.onAddMeeting).toHaveBeenCalled();
    });
  });

  describe('Meeting History', () => {
    it('should render existing meetings sorted by date descending', () => {
      render(<ClientFormMeetingsTab {...mockProps} />);

      const reasons = screen.getAllByText(/Initial Sync|Follow up/);
      expect(reasons.length).toBe(2);

      // m2 is later (March 5) than m1 (March 4)
      expect(reasons[0]).toHaveTextContent('Follow up');
      expect(reasons[1]).toHaveTextContent('Initial Sync');

      const projectAlphas = screen.getAllByText('Project Alpha');
      expect(projectAlphas.length).toBeGreaterThan(0);
      expect(screen.getByText('Discussed project scope.')).toBeInTheDocument();
    });

    it('should format dates properly', () => {
      render(<ClientFormMeetingsTab {...mockProps} />);

      expect(screen.getByText('Formatted: 2026-03-04T10:00:00Z')).toBeInTheDocument();
      expect(screen.getByText('Formatted: 2026-03-05T14:00:00Z')).toBeInTheDocument();
    });

    it('should call onDeleteMeeting when trash icon is clicked', () => {
      render(<ClientFormMeetingsTab {...mockProps} />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Remover reunião' });
      fireEvent.click(deleteButtons[0]); // m2

      expect(mockProps.onDeleteMeeting).toHaveBeenCalledWith('m2');
    });

    it('should hide delete buttons in read-only mode', () => {
      render(<ClientFormMeetingsTab {...mockProps} isReadOnly={true} />);

      expect(screen.queryByRole('button', { name: 'Remover reunião' })).not.toBeInTheDocument();
    });
  });
});
