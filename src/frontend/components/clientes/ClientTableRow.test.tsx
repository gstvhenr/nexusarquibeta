import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientTableRow } from './ClientTableRow';
import type { Client } from '../../types';

// Mock dependencies
vi.mock('../../utils/formatters', () => ({
  formatDateDayMonth: vi.fn((date) => `Date: ${date}`),
}));

vi.mock('../../utils/supplierHelpers', () => ({
  getInitials: vi.fn((name) => name?.substring(0, 2).toUpperCase() || '?'),
}));

vi.mock('../ui', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

vi.mock('../ui/icons', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../ui/icons');
  return {
    ...actual,
    SirenIcon: ({ className }: { className?: string }) => <svg data-testid="siren-icon" className={className} />,
    ClockIcon: () => <svg data-testid="clock-icon" />,
    AlertIcon: () => <svg data-testid="alert-icon" />,
  };
});

describe('ClientTableRow', () => {
  const mockOnSelect = vi.fn();
  const mockOnToggleUrgent = vi.fn();
  const mockOnView = vi.fn();

  const defaultProps: React.ComponentProps<typeof ClientTableRow> = {
    client: {
      id: '1',
      name: 'John Doe',
      cpfCnpj: '123.456.789-00',
      status: 'Cliente Ativo',
      archived: false,
      isUrgent: false,
      email: 'john@example.com',
      contacts: [{ name: 'John', phone: '(11) 99999-9999', isPrimary: true }],
      address: { city: 'São Paulo', state: 'SP' },
    } as unknown as Client,
    paymentStatus: 'Em dia',
    isSelected: false,
    onSelect: mockOnSelect,
    onToggleUrgent: mockOnToggleUrgent,
    onView: mockOnView,
  };

  const renderRow = (props: React.ComponentProps<typeof ClientTableRow> = defaultProps) => {
    return render(
      <table>
        <tbody>
          <ClientTableRow {...props} />
        </tbody>
      </table>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render client information correctly', () => {
      renderRow();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('123.456.789-00')).toBeInTheDocument();
      expect(screen.getByText('Cliente Ativo')).toBeInTheDocument();
      expect(screen.getByText('Em dia')).toBeInTheDocument();
      expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('São Paulo')).toBeInTheDocument();
      expect(screen.getByText('SP')).toBeInTheDocument();
      expect(screen.getByText('JO')).toBeInTheDocument(); // Initials
    });

    it('should render avatar image if available', () => {
      const clientWithAvatar = { ...defaultProps.client, avatarUrl: 'http://example.com/pic.jpg' };
      renderRow({ ...defaultProps, client: clientWithAvatar });
      const img = screen.getByRole('img', { name: 'Avatar de John Doe' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'http://example.com/pic.jpg');
      expect(screen.queryByText('JO')).not.toBeInTheDocument();
    });

    it('should show fallback text for missing contact and address info', () => {
      const clientWithoutDetails = {
        ...defaultProps.client,
        contacts: [],
        address: null,
      };
      renderRow({ ...defaultProps, client: clientWithoutDetails as unknown as Client });

      const naElements = screen.getAllByText('N/A');
      expect(naElements.length).toBe(2); // Phone and City
    });

    it('should display formatting for missing deadline', () => {
      renderRow();
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('Urgency and Deadlines', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-04T10:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should show urgent styling and badge when client is manually marked as urgent', () => {
      const urgentClient = { ...defaultProps.client, isUrgent: true };
      renderRow({ ...defaultProps, client: urgentClient });

      expect(screen.getByText('PRIORIDADE')).toBeInTheDocument();
      const tr = screen.getByRole('row');
      expect(tr).toHaveClass('bg-error/5');
      const siren = screen.getByTestId('siren-icon');
      expect(siren).toHaveClass('text-error');
    });

    it('should show urgent styling and alert icon when deadline is today or past', () => {
      const pastDeadline = new Date('2026-03-03T12:00:00Z');
      renderRow({ ...defaultProps, nextDeadline: pastDeadline });

      expect(screen.getByText('PRAZO VENCIDO/HOJE')).toBeInTheDocument();
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
      const tr = screen.getByRole('row');
      expect(tr).toHaveClass('bg-error/5');
    });

    it('should not show urgent styling for future deadlines', () => {
      const futureDeadline = new Date('2026-03-05T12:00:00Z');
      renderRow({ ...defaultProps, nextDeadline: futureDeadline });

      expect(screen.queryByText('PRAZO VENCIDO/HOJE')).not.toBeInTheDocument();
      expect(screen.queryByText('PRIORIDADE')).not.toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onSelect when checkbox is toggled', () => {
      renderRow();
      const checkbox = screen.getByRole('checkbox', { name: /Selecionar cliente/i });
      fireEvent.click(checkbox);
      expect(mockOnSelect).toHaveBeenCalledWith('1');
    });

    it('should reflect isSelected prop on checkbox', () => {
      renderRow({ ...defaultProps, isSelected: true });
      const checkbox = screen.getByRole('checkbox', { name: /Selecionar cliente/i });
      expect(checkbox).toBeChecked();
    });

    it('should call onToggleUrgent when siren is clicked', () => {
      renderRow();
      const urgentButton = screen.getByRole('button', { name: 'Marcar Urgência' });
      fireEvent.click(urgentButton);
      expect(mockOnToggleUrgent).toHaveBeenCalledWith('1');
    });

    it('should call onView when client name is clicked', () => {
      renderRow();
      const nameButton = screen.getByRole('button', { name: 'John Doe' });
      fireEvent.click(nameButton);
      expect(mockOnView).toHaveBeenCalledWith(defaultProps.client);
    });
  });
});
