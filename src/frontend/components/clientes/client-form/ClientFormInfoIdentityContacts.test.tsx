import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientFormInfoIdentityContacts } from './ClientFormInfoIdentityContacts';
import type { Client } from '@/types';

// Mocks
vi.mock('@/utils/formatters', () => ({
  formatCpfCnpj: vi.fn((val) => `FORMATTED-${val}`),
  formatPhone: vi.fn((val) => `PHONE-${val}`),
}));

vi.mock('../../ui/icons', () => ({
  PlusIcon: () => <svg data-testid="plus-icon" />,
  TrashIcon: () => <svg data-testid="trash-icon" />,
}));

vi.mock('../../ui', () => ({
  IconButton: ({ children, onClick, 'aria-label': ariaLabel }: { children: React.ReactNode; onClick: () => void; 'aria-label'?: string }) => (
    <button onClick={onClick} aria-label={ariaLabel} data-testid="icon-button">
      {children}
    </button>
  ),
}));

vi.mock('../AvatarPicker', () => ({
  AvatarPicker: ({ name, onChangeBase64 }: { name: string; onChangeBase64: (base64: string) => void }) => (
    <button type="button" data-testid="avatar-picker" onClick={() => onChangeBase64('base64-data')}>
      Avatar for {name}
    </button>
  ),
}));

describe('ClientFormInfoIdentityContacts', () => {
  const mockClient = {
    name: 'John Doe',
    clientType: 'PF',
    birthDate: '1990-01-01',
    cpfCnpj: '12345678900',
    email: 'john@example.com',
    contacts: [
      { id: 'c1', phone: '11999999999', hasWhatsApp: true, isPrimary: true },
    ],
    representative: {
      name: 'Jane Doe',
      role: 'Manager',
    },
  } as unknown as Client;

  const mockProps = {
    client: mockClient,
    initialClient: mockClient,
    isReadOnly: false,
    isPJ: false,
    fieldId: (id: string) => `test-${id}`,
    commonInputClass: 'test-class',
    onChange: vi.fn(),
    onRepChange: vi.fn(),
    onContactChange: vi.fn(),
    onAddContact: vi.fn(),
    onRemoveContact: vi.fn(),
    getModifiedClass: vi.fn(() => 'mod-class'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Identity fields', () => {
    it('should render PF fields correctly', () => {
      render(<ClientFormInfoIdentityContacts {...mockProps} />);

      expect(screen.getByLabelText('Nome Completo')).toHaveValue('John Doe');
      expect(screen.getByLabelText('Data de Nascimento')).toHaveValue('1990-01-01');
      expect(screen.getByLabelText('CPF')).toHaveValue('12345678900');

      // Should not show PJ fields
      expect(screen.queryByLabelText('Nome do Representante')).not.toBeInTheDocument();
    });

    it('should render PJ fields correctly', () => {
      render(<ClientFormInfoIdentityContacts {...mockProps} isPJ={true} />);

      expect(screen.getByLabelText('Razão Social')).toHaveValue('John Doe');
      expect(screen.getByLabelText('Data de Abertura')).toHaveValue('1990-01-01');
      expect(screen.getByLabelText('CNPJ')).toHaveValue('12345678900');
      expect(screen.getByLabelText('Nome do Representante')).toHaveValue('Jane Doe');
      expect(screen.getByLabelText('Cargo')).toHaveValue('Manager');
    });

    it('should call onChange for main fields', () => {
      render(<ClientFormInfoIdentityContacts {...mockProps} />);

      fireEvent.change(screen.getByLabelText('Nome Completo'), { target: { value: 'New Name' } });
      expect(mockProps.onChange).toHaveBeenCalledWith('name', 'New Name');

      fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '111' } });
      expect(mockProps.onChange).toHaveBeenCalledWith('cpfCnpj', 'FORMATTED-111');
    });

    it('should call onRepChange for representative fields (PJ)', () => {
      render(<ClientFormInfoIdentityContacts {...mockProps} isPJ={true} />);

      fireEvent.change(screen.getByLabelText('Nome do Representante'), { target: { value: 'New Rep' } });
      expect(mockProps.onRepChange).toHaveBeenCalledWith('name', 'New Rep');
    });

    it('should toggle clientType', () => {
      render(<ClientFormInfoIdentityContacts {...mockProps} />);

      fireEvent.click(screen.getByLabelText('Pessoa Jurídica'));
      expect(mockProps.onChange).toHaveBeenCalledWith('clientType', 'PJ');
    });

    it('should interact with AvatarPicker', () => {
      render(<ClientFormInfoIdentityContacts {...mockProps} />);

      fireEvent.click(screen.getByTestId('avatar-picker'));
      expect(mockProps.onChange).toHaveBeenCalledWith('avatarUrl', 'base64-data');
    });
  });

  describe('Contacts fields', () => {
    it('should render existing contacts', () => {
      render(<ClientFormInfoIdentityContacts {...mockProps} />);

      expect(screen.getByPlaceholderText('Telefone 1')).toHaveValue('11999999999');
      expect(screen.getByRole('checkbox', { name: /WhatsApp/i })).toBeChecked();
      expect(screen.getByRole('radio', { name: /Principal/i })).toBeChecked();
    });

    it('should call onContactChange for phone edit and blur', () => {
      render(<ClientFormInfoIdentityContacts {...mockProps} />);

      const phoneInput = screen.getByPlaceholderText('Telefone 1');
      fireEvent.change(phoneInput, { target: { value: '123' } });
      expect(mockProps.onContactChange).toHaveBeenCalledWith('c1', 'phone', '123');

      fireEvent.blur(phoneInput, { target: { value: '123' } });
      expect(mockProps.onContactChange).toHaveBeenCalledWith('c1', 'phone', 'PHONE-123');
    });

    it('should call onRemoveContact when trash icon is clicked', () => {
      render(<ClientFormInfoIdentityContacts {...mockProps} />);

      const removeBtn = screen.getByLabelText('Remover telefone 1');
      fireEvent.click(removeBtn);
      expect(mockProps.onRemoveContact).toHaveBeenCalledWith('c1');
    });

    it('should call onAddContact when adcionar button is clicked', () => {
      render(<ClientFormInfoIdentityContacts {...mockProps} />);

      const addBtn = screen.getByRole('button', { name: /Adicionar Telefone/i });
      fireEvent.click(addBtn);
      expect(mockProps.onAddContact).toHaveBeenCalled();
    });

    it('should hide add contact button if contacts >= 3', () => {
      const clientWithMocks = {
        ...mockClient,
        contacts: [
          { id: '1', phone: '1' },
          { id: '2', phone: '2' },
          { id: '3', phone: '3' },
        ],
      };
      render(<ClientFormInfoIdentityContacts {...mockProps} client={clientWithMocks as unknown as Client} />);

      expect(screen.queryByRole('button', { name: /Adicionar Telefone/i })).not.toBeInTheDocument();
    });
  });

  describe('Read-only mode', () => {
    it('should disable fields and hide actions when isReadOnly is true', () => {
      render(<ClientFormInfoIdentityContacts {...mockProps} isReadOnly={true} />);

      expect(screen.getByLabelText('Nome Completo')).toBeDisabled();
      expect(screen.getByLabelText('Pessoa Física')).toBeDisabled();
      expect(screen.getByPlaceholderText('Telefone 1')).toBeDisabled();

      expect(screen.queryByLabelText('Remover telefone 1')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Adicionar Telefone/i })).not.toBeInTheDocument();
    });
  });
});
