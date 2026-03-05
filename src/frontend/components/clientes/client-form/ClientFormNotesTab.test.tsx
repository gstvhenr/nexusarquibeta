import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClientFormNotesTab } from './ClientFormNotesTab';
import type { Client } from '@/types';

describe('ClientFormNotesTab', () => {
  const mockClient = {
    generalNotes: 'Some initial notes',
  } as Client;

  const mockProps = {
    fieldId: (id: string) => `test-${id}`,
    client: mockClient,
    initialClient: mockClient,
    isReadOnly: false,
    commonInputClass: 'test-class',
    onChange: vi.fn(),
    getModifiedClass: vi.fn(() => 'mod-class'),
  };

  it('should render the notes textarea correctly', () => {
    render(<ClientFormNotesTab {...mockProps} />);

    expect(screen.getByLabelText('Observações Gerais')).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText(/Adicione anotações gerais/);
    expect(textarea).toHaveValue('Some initial notes');
    expect(textarea).toHaveClass('test-class mod-class');
  });

  it('should call onChange when notes are updated', () => {
    render(<ClientFormNotesTab {...mockProps} />);

    const textarea = screen.getByPlaceholderText(/Adicione anotações gerais/);
    fireEvent.change(textarea, { target: { value: 'New notes' } });

    expect(mockProps.onChange).toHaveBeenCalledWith('generalNotes', 'New notes');
  });

  it('should be disabled when isReadOnly is true', () => {
    render(<ClientFormNotesTab {...mockProps} isReadOnly={true} />);

    const textarea = screen.getByPlaceholderText(/Adicione anotações gerais/);
    expect(textarea).toBeDisabled();
  });

  it('should gracefully handle undefined initial notes', () => {
    const props = { ...mockProps, client: {} as Client };
    render(<ClientFormNotesTab {...props} />);

    const textarea = screen.getByPlaceholderText(/Adicione anotações gerais/);
    expect(textarea).toHaveValue('');
  });
});
