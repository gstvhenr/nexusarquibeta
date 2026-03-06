import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClientFormInfoTab } from './ClientFormInfoTab';
import type { Client } from '@/types';

// Mock child components
vi.mock('./ClientFormInfoAddressStatus', () => ({
  ClientFormInfoAddressStatus: () => <div data-testid="address-status">Address Status</div>,
}));

vi.mock('./ClientFormInfoIdentityContacts', () => ({
  ClientFormInfoIdentityContacts: () => (
    <div data-testid="identity-contacts">Identity Contacts</div>
  ),
}));

describe('ClientFormInfoTab', () => {
  it('should render both child components', () => {
    const mockProps = {
      client: {} as unknown as Client,
      initialClient: null,
      isReadOnly: false,
      isPJ: false,
      fieldId: (id: string) => `test-${id}`,
      commonInputClass: '',
      dropdownRef: { current: null },
      isInterestsDropdownOpen: false,
      onToggleInterestsDropdown: vi.fn(),
      onChange: vi.fn(),
      onAddressChange: vi.fn(),
      onRepChange: vi.fn(),
      onContactChange: vi.fn(),
      onAddContact: vi.fn(),
      onRemoveContact: vi.fn(),
      onServiceInterestChange: vi.fn(),
      getModifiedClass: vi.fn(),
    };

    render(<ClientFormInfoTab {...mockProps} />);

    expect(screen.getByTestId('identity-contacts')).toBeInTheDocument();
    expect(screen.getByTestId('address-status')).toBeInTheDocument();
  });
});
