import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientFormInfoAddressStatus } from './ClientFormInfoAddressStatus';
import { type Client } from '@/types';

// Mock formatters and constants to isolate component
vi.mock('@/utils/formatters', () => ({
  formatCEP: vi.fn((val) => `CEP-${val}`),
  formatDate: vi.fn((date) => `Date: ${date}`),
}));

vi.mock('@/constants', () => ({
  LEAD_SOURCE_OPTIONS: ['Indicação', 'Site'],
  PIPELINE_STATUS_OPTIONS: ['Lead', 'Proposta'],
  SERVICE_INTEREST_OPTIONS: ['Serviço A', 'Serviço B'],
}));

vi.mock('../../ui/icons', () => ({
  ChevronDownIcon: () => <svg data-testid="chevron-down-icon" />,
}));

describe('ClientFormInfoAddressStatus', () => {
  const mockClient = {
    address: {
      street: 'Rua Principal',
      number: '123',
      complement: 'Apt 4',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zip: '01000-000',
    },
    status: 'Cliente Ativo',
    pipelineStatus: 'Lead',
    leadSource: 'Site',
    serviceInterests: ['Serviço A'],
    registrationDate: '2026-03-04',
  } as unknown as Client;

  const mockProps = {
    client: mockClient,
    initialClient: mockClient,
    isReadOnly: false,
    fieldId: (id: string) => `test-${id}`,
    commonInputClass: 'test-input',
    dropdownRef: { current: null },
    isInterestsDropdownOpen: false,
    onToggleInterestsDropdown: vi.fn(),
    onChange: vi.fn(),
    onAddressChange: vi.fn(),
    onServiceInterestChange: vi.fn(),
    getModifiedClass: vi.fn(() => 'mod-class'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Address Information', () => {
    it('should render address fields correctly', () => {
      render(<ClientFormInfoAddressStatus {...mockProps} />);

      expect(screen.getByLabelText('Logradouro')).toHaveValue('Rua Principal');
      expect(screen.getByLabelText('Número')).toHaveValue('123');
      expect(screen.getByLabelText('Complemento')).toHaveValue('Apt 4');
      expect(screen.getByLabelText('Bairro')).toHaveValue('Centro');
      expect(screen.getByLabelText('Cidade')).toHaveValue('São Paulo');
      expect(screen.getByLabelText('Estado')).toHaveValue('SP');
      expect(screen.getByLabelText('CEP')).toHaveValue('01000-000');
    });

    it('should call onAddressChange when fields are changed', () => {
      render(<ClientFormInfoAddressStatus {...mockProps} />);

      fireEvent.change(screen.getByLabelText('Logradouro'), { target: { value: 'Nova Rua' } });
      expect(mockProps.onAddressChange).toHaveBeenCalledWith('street', 'Nova Rua');

      fireEvent.change(screen.getByLabelText('CEP'), { target: { value: '11111' } });
      // formatCEP is mocked to prefix 'CEP-'
      expect(mockProps.onAddressChange).toHaveBeenCalledWith('zip', 'CEP-11111');
    });

    it('should be disabled when isReadOnly is true', () => {
      render(<ClientFormInfoAddressStatus {...mockProps} isReadOnly={true} />);

      expect(screen.getByLabelText('Logradouro')).toBeDisabled();
      expect(screen.getByLabelText('Cidade')).toBeDisabled();
      expect(screen.getByLabelText('Estado')).toBeDisabled(); // State is always disabled
    });
  });

  describe('Status and Interests', () => {
    it('should render status and pipeline fields', () => {
      render(<ClientFormInfoAddressStatus {...mockProps} />);

      expect(screen.getByLabelText('Status do Cliente')).toHaveValue('Cliente Ativo');
      expect(screen.getByLabelText('Status no Pipeline')).toHaveValue('Lead');
      expect(screen.getByLabelText('Fonte do Lead')).toHaveValue('Site');
    });

    it('should call onChange for status fields', () => {
      render(<ClientFormInfoAddressStatus {...mockProps} />);

      fireEvent.change(screen.getByLabelText('Status do Cliente'), { target: { value: 'Cliente Desabilitado' } });
      expect(mockProps.onChange).toHaveBeenCalledWith('status', 'Cliente Desabilitado');

      fireEvent.change(screen.getByLabelText('Fonte do Lead'), { target: { value: 'Indicação' } });
      expect(mockProps.onChange).toHaveBeenCalledWith('leadSource', 'Indicação');
    });

    it('should handle service interests dropdown', () => {
      // First render closed
      const { rerender } = render(<ClientFormInfoAddressStatus {...mockProps} isInterestsDropdownOpen={false} />);
      expect(screen.queryByText('Serviço B')).not.toBeInTheDocument();

      const toggleButton = screen.getByRole('button', { name: /Serviços de Interesse/i });
      fireEvent.click(toggleButton);
      expect(mockProps.onToggleInterestsDropdown).toHaveBeenCalled();

      // Re-render as open
      rerender(<ClientFormInfoAddressStatus {...mockProps} isInterestsDropdownOpen={true} />);

      // Checkbox for service should appear
      const checkboxA = screen.getByRole('checkbox', { name: 'Serviço A' });
      expect(checkboxA).toBeChecked();

      const checkboxB = screen.getByRole('checkbox', { name: 'Serviço B' });
      expect(checkboxB).not.toBeChecked();

      // Trigger change
      fireEvent.click(checkboxB);
      expect(mockProps.onServiceInterestChange).toHaveBeenCalledWith('Serviço B', true);
    });

    it('should render selected service tags', () => {
      render(<ClientFormInfoAddressStatus {...mockProps} />);
      // Should show the selected one as a badge
      expect(screen.getByText('Serviço A')).toHaveClass('bg-primary/10');
    });
  });
});
